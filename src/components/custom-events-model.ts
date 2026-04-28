export interface CustomFaultEventRow {
  id: string;
  name: string;
  description: string;
  pattern: string;
  regex: boolean;
  matchCase: boolean;
}

const CUSTOM_ADD_SHEET_DRAFT_ID = '__custom_event_add_draft__';

export function newCustomEventId(): string {
  if (typeof crypto !== 'undefined' && typeof crypto.randomUUID === 'function') {
    return `custevt-${crypto.randomUUID()}`;
  }
  return `custevt-${Date.now().toString(36)}-${Math.random().toString(36).slice(2, 11)}`;
}

/** Draft row used while the Add sheet is open */
export function createDraftCustomEventRow(): CustomFaultEventRow {
  return {
    id: CUSTOM_ADD_SHEET_DRAFT_ID,
    name: '',
    description: '',
    pattern: '',
    regex: false,
    matchCase: false,
  };
}
