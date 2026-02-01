import React, { useState, useEffect } from 'react';
import { Button } from './ui/button';
import { Input } from './ui/input';
import { Label } from './ui/label';
import figmaService, { FigmaFile } from '../services/figmaService';

interface DesignTokens {
  colors: any[];
  typography: any[];
  spacing: any[];
  components: any[];
}

const FigmaMCP: React.FC = () => {
  const [accessToken, setAccessToken] = useState('');
  const [fileKey, setFileKey] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [fileData, setFileData] = useState<FigmaFile | null>(null);
  const [designTokens, setDesignTokens] = useState<DesignTokens | null>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    // Check if access token is already set
    const savedToken = import.meta.env.VITE_FIGMA_ACCESS_TOKEN;
    if (savedToken) {
      setAccessToken(savedToken);
      figmaService.setAccessToken(savedToken);
    }
    // Pre-fill default Figma file (e.g. vSNET Design System)
    const defaultFileKey = import.meta.env.VITE_FIGMA_FILE_KEY;
    if (defaultFileKey) {
      setFileKey(defaultFileKey);
    }
  }, []);

  const handleSetToken = () => {
    if (accessToken.trim()) {
      figmaService.setAccessToken(accessToken);
      setError(null);
    } else {
      setError('Please enter a valid access token');
    }
  };

  const handleFetchFile = async () => {
    if (!fileKey.trim()) {
      setError('Please enter a file key');
      return;
    }

    if (!figmaService.isAuthenticated()) {
      setError('Please set an access token first');
      return;
    }

    setIsLoading(true);
    setError(null);

    try {
      const file = await figmaService.getFile(fileKey);
      setFileData(file);
      setError(null);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to fetch file');
      setFileData(null);
    } finally {
      setIsLoading(false);
    }
  };

  const handleExtractTokens = async () => {
    if (!fileKey.trim()) {
      setError('Please enter a file key');
      return;
    }

    if (!figmaService.isAuthenticated()) {
      setError('Please set an access token first');
      return;
    }

    setIsLoading(true);
    setError(null);

    try {
      const tokens = await figmaService.extractDesignTokens(fileKey);
      setDesignTokens(tokens);
      setError(null);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to extract design tokens');
      setDesignTokens(null);
    } finally {
      setIsLoading(false);
    }
  };

  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text);
  };

  const generateTailwindConfig = () => {
    if (!designTokens) return '';

    const colors = designTokens.colors.reduce((acc, color) => {
      acc[color.name] = color.value;
      return acc;
    }, {} as Record<string, string>);

    const spacing = designTokens.spacing.reduce((acc, space) => {
      acc[space.name] = `${space.width}px`;
      return acc;
    }, {} as Record<string, string>);

    return JSON.stringify({
      theme: {
        extend: {
          colors,
          spacing
        }
      }
    }, null, 2);
  };

  return (
    <div className="space-y-6">
      <div className="bg-card rounded-lg p-6 shadow-sm border">
        <h2 className="text-2xl font-semibold text-card-foreground mb-4">
          Figma MCP Integration
        </h2>
        
        {/* Authentication */}
        <div className="space-y-4">
          <div>
            <Label htmlFor="accessToken">Figma Access Token</Label>
            <div className="flex space-x-2 mt-1">
              <Input
                id="accessToken"
                type="password"
                placeholder="Enter your Figma access token"
                value={accessToken}
                onChange={(e) => setAccessToken(e.target.value)}
              />
              <Button onClick={handleSetToken}>Set Token</Button>
            </div>
            <p className="text-sm text-muted-foreground mt-1">
              Get your access token from Figma Settings → Account → Personal access tokens
            </p>
          </div>

          <div>
            <Label htmlFor="fileKey">Figma File Key</Label>
            <div className="flex space-x-2 mt-1">
              <Input
                id="fileKey"
                placeholder="Enter Figma file key (from URL)"
                value={fileKey}
                onChange={(e) => setFileKey(e.target.value)}
              />
              <Button onClick={handleFetchFile} disabled={isLoading}>
                {isLoading ? 'Loading...' : 'Fetch File'}
              </Button>
            </div>
            <p className="text-sm text-muted-foreground mt-1">
              File key is the part after "figma.com/file/" in the URL
            </p>
          </div>

          <Button 
            onClick={handleExtractTokens} 
            disabled={isLoading || !figmaService.isAuthenticated()}
            variant="outline"
          >
            {isLoading ? 'Extracting...' : 'Extract Design Tokens'}
          </Button>
        </div>

        {error && (
          <div className="bg-red-50 border border-red-200 rounded-lg p-4 mt-4">
            <p className="text-red-700">{error}</p>
          </div>
        )}
      </div>

      {/* File Information */}
      {fileData && (
        <div className="bg-card rounded-lg p-6 shadow-sm border">
          <h3 className="text-xl font-semibold text-card-foreground mb-4">File Information</h3>
          <div className="space-y-2">
            <p><strong>Name:</strong> {fileData.name}</p>
            <p><strong>Last Modified:</strong> {new Date(fileData.lastModified).toLocaleDateString()}</p>
            <p><strong>Components:</strong> {Object.keys(fileData.components).length}</p>
            <p><strong>Styles:</strong> {Object.keys(fileData.styles).length}</p>
          </div>
        </div>
      )}

      {/* Design Tokens */}
      {designTokens && (
        <div className="space-y-6">
          {/* Colors */}
          {designTokens.colors.length > 0 && (
            <div className="bg-card rounded-lg p-6 shadow-sm border">
              <h3 className="text-xl font-semibold text-card-foreground mb-4">Colors</h3>
              <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
                {designTokens.colors.map((color, index) => (
                  <div key={index} className="flex items-center space-x-2">
                    <div 
                      className="w-6 h-6 rounded border"
                      style={{ backgroundColor: color.value }}
                    />
                    <div>
                      <p className="text-sm font-medium">{color.name}</p>
                      <p className="text-xs text-muted-foreground">{color.value}</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Typography */}
          {designTokens.typography.length > 0 && (
            <div className="bg-card rounded-lg p-6 shadow-sm border">
              <h3 className="text-xl font-semibold text-card-foreground mb-4">Typography</h3>
              <div className="space-y-2">
                {designTokens.typography.map((type, index) => (
                  <div key={index} className="p-3 bg-muted rounded">
                    <p className="font-medium">{type.name}</p>
                    <p className="text-sm text-muted-foreground">
                      {type.fontFamily} • {type.fontSize}px • {type.fontWeight}
                    </p>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Components */}
          {designTokens.components.length > 0 && (
            <div className="bg-card rounded-lg p-6 shadow-sm border">
              <h3 className="text-xl font-semibold text-card-foreground mb-4">Components</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {designTokens.components.map((component, index) => (
                  <div key={index} className="p-3 bg-muted rounded">
                    <p className="font-medium">{component.name}</p>
                    <p className="text-sm text-muted-foreground">ID: {component.id}</p>
                    <p className="text-sm text-muted-foreground">Type: {component.type}</p>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Tailwind Config */}
          <div className="bg-card rounded-lg p-6 shadow-sm border">
            <div className="flex justify-between items-center mb-4">
              <h3 className="text-xl font-semibold text-card-foreground">Tailwind Config</h3>
              <Button 
                onClick={() => copyToClipboard(generateTailwindConfig())}
                variant="outline"
                size="sm"
              >
                Copy Config
              </Button>
            </div>
            <pre className="bg-muted p-4 rounded text-sm overflow-x-auto">
              <code>{generateTailwindConfig()}</code>
            </pre>
          </div>
        </div>
      )}
    </div>
  );
};

export default FigmaMCP;
