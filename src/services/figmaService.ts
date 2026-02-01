import { Api } from 'figma-api';

export interface FigmaNode {
  id: string;
  name: string;
  type: string;
  children?: FigmaNode[];
  fills?: any[];
  strokes?: any[];
  effects?: any[];
  style?: {
    fontSize?: number;
    fontFamily?: string;
    fontWeight?: number;
    lineHeightPx?: number;
  };
  absoluteBoundingBox?: {
    x: number;
    y: number;
    width: number;
    height: number;
  };
  cornerRadius?: number;
  paddingLeft?: number;
  paddingRight?: number;
  paddingTop?: number;
  paddingBottom?: number;
  itemSpacing?: number;
}

export interface FigmaFile {
  document: FigmaNode;
  components: Record<string, any>;
  styles: Record<string, any>;
  name: string;
  lastModified: string;
  thumbnailUrl?: string;
}

class FigmaService {
  private client: Api | null = null;
  private accessToken: string | null = null;

  constructor() {
    // Initialize with environment variable or null
    this.accessToken = import.meta.env.VITE_FIGMA_ACCESS_TOKEN || null;
    if (this.accessToken) {
      this.client = new Api({
        personalAccessToken: this.accessToken
      });
    }
  }

  setAccessToken(token: string) {
    this.accessToken = token;
    this.client = new Api({
      personalAccessToken: token
    });
  }

  isAuthenticated(): boolean {
    return this.client !== null;
  }

  async getFile(fileKey: string): Promise<FigmaFile> {
    if (!this.client) {
      throw new Error('Figma client not initialized. Please set an access token.');
    }

    try {
      const file = await this.client.getFile({ file_key: fileKey });
      return file as FigmaFile;
    } catch (error) {
      console.error('Error fetching Figma file:', error);
      throw error;
    }
  }

  /**
   * Fetch specific nodes from a file (e.g. login frame).
   * Node IDs from URL (112521-5040) must use colon for API: 112521:5040
   */
  async getFileNodes(fileKey: string, nodeIds: string[]): Promise<Record<string, { document: FigmaNode }>> {
    if (!this.client) {
      throw new Error('Figma client not initialized. Please set an access token.');
    }
    const ids = nodeIds.map((id) => id.replace(/-/g, ':'));
    try {
      const res = await this.client.getFileNodes(
        { file_key: fileKey },
        { ids: ids.join(',') }
      ) as { nodes?: Record<string, { document: FigmaNode }> };
      return res?.nodes ?? {};
    } catch (error) {
      console.error('Error fetching Figma file nodes:', error);
      throw error;
    }
  }

  /**
   * Extract login dialog requirements from Figma login frame node.
   * Returns dimensions, corner radius, padding, and logo size from the design.
   */
  async getLoginDialogRequirements(
    fileKey: string,
    loginNodeId: string
  ): Promise<{
    width: number;
    height: number;
    cornerRadius?: number;
    padding?: number;
    itemSpacing?: number;
    logoWidth?: number;
    logoHeight?: number;
  }> {
    const nodes = await this.getFileNodes(fileKey, [loginNodeId]);
    const id = loginNodeId.replace(/-/g, ':');
    const doc = nodes[id]?.document;
    if (!doc) {
      throw new Error(`Login node ${loginNodeId} not found in Figma file`);
    }

    const box = doc.absoluteBoundingBox;
    const width = box?.width ?? 400;
    const height = box?.height ?? 520;
    const cornerRadius = doc.cornerRadius ?? 8;
    const padding = doc.paddingLeft ?? doc.paddingTop ?? 24;
    const itemSpacing = doc.itemSpacing ?? 16;

    let logoWidth = 206;
    let logoHeight = 120;
    if (doc.children) {
      const logoLike = doc.children.find(
        (c: FigmaNode) =>
          c.name?.toLowerCase().includes('logo') ||
          (c.absoluteBoundingBox &&
            Math.round(c.absoluteBoundingBox.width) === 206 &&
            Math.round(c.absoluteBoundingBox.height) === 120)
      );
      if (logoLike?.absoluteBoundingBox) {
        logoWidth = Math.round(logoLike.absoluteBoundingBox.width);
        logoHeight = Math.round(logoLike.absoluteBoundingBox.height);
      }
    }

    return {
      width: Math.round(width),
      height: Math.round(height),
      cornerRadius,
      padding: Math.round(padding),
      itemSpacing: Math.round(itemSpacing),
      logoWidth: Math.round(logoWidth),
      logoHeight: Math.round(logoHeight),
    };
  }

  // MCP-specific methods for design tokens
  async extractDesignTokens(fileKey: string): Promise<any> {
    const file = await this.getFile(fileKey);
    const tokens = {
      colors: this.extractColors(file.document),
      typography: this.extractTypography(file.document),
      spacing: this.extractSpacing(file.document),
      components: this.extractComponents(file.document)
    };
    return tokens;
  }

  private extractColors(node: FigmaNode): any[] {
    const colors: any[] = [];
    
    if (node.fills && node.fills.length > 0) {
      node.fills.forEach(fill => {
        if (fill.type === 'SOLID' && fill.color) {
          colors.push({
            name: node.name,
            value: this.rgbToHex(fill.color.r, fill.color.g, fill.color.b),
            opacity: fill.opacity || 1
          });
        }
      });
    }

    if (node.children) {
      node.children.forEach(child => {
        colors.push(...this.extractColors(child));
      });
    }

    return colors;
  }

  private extractTypography(node: FigmaNode): any[] {
    const typography: any[] = [];
    
    if (node.type === 'TEXT' && node.style) {
      typography.push({
        name: node.name,
        fontSize: node.style.fontSize,
        fontFamily: node.style.fontFamily,
        fontWeight: node.style.fontWeight,
        lineHeight: node.style.lineHeightPx
      });
    }

    if (node.children) {
      node.children.forEach(child => {
        typography.push(...this.extractTypography(child));
      });
    }

    return typography;
  }

  private extractSpacing(node: FigmaNode): any[] {
    const spacing: any[] = [];
    
    if (node.absoluteBoundingBox) {
      spacing.push({
        name: node.name,
        width: node.absoluteBoundingBox.width,
        height: node.absoluteBoundingBox.height,
        x: node.absoluteBoundingBox.x,
        y: node.absoluteBoundingBox.y
      });
    }

    if (node.children) {
      node.children.forEach(child => {
        spacing.push(...this.extractSpacing(child));
      });
    }

    return spacing;
  }

  private extractComponents(node: FigmaNode): any[] {
    const components: any[] = [];
    
    if (node.type === 'COMPONENT' || node.type === 'COMPONENT_SET') {
      components.push({
        id: node.id,
        name: node.name,
        type: node.type,
        boundingBox: node.absoluteBoundingBox
      });
    }

    if (node.children) {
      node.children.forEach(child => {
        components.push(...this.extractComponents(child));
      });
    }

    return components;
  }

  private rgbToHex(r: number, g: number, b: number): string {
    const toHex = (n: number) => {
      const hex = Math.round(n * 255).toString(16);
      return hex.length === 1 ? '0' + hex : hex;
    };
    return `#${toHex(r)}${toHex(g)}${toHex(b)}`;
  }
}

export const figmaService = new FigmaService();
export default figmaService;
