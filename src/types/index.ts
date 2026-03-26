export interface SpreadsheetData {
  headers: string[];
  rows: Record<string, string>[];
  fileName: string;
}

export type ColumnRole = "nome" | "telefone" | "variavel" | "ignorar";

export interface ColumnMapping {
  header: string;
  role: ColumnRole;
  variableName?: string;
}

export interface Attachment {
  file: File;
  type: "image" | "document";
  base64: string;
  preview?: string;
}

export type SendMode = "contacts" | "groups";

export interface WhatsAppGroup {
  id: string;
  name: string;
  participants: number;
  selected: boolean;
}

export interface Contact {
  index: number;
  name: string;
  phone: string;
  chatId?: string;
  variables: Record<string, string>;
  status: "pending" | "sending" | "sent" | "failed";
  errorMessage?: string;
}

export interface SendResult {
  total: number;
  sent: number;
  failed: number;
  startTime: number;
  endTime?: number;
  contacts: Contact[];
}

export type WizardStep = 1 | 2 | 3 | 4 | 5 | 6;

export interface WizardState {
  currentStep: WizardStep;
  sendMode: SendMode;
  spreadsheet: SpreadsheetData | null;
  columnMappings: ColumnMapping[];
  message: string;
  attachment: Attachment | null;
  sessionName: string | null;
  isAuthenticated: boolean;
  sendInterval: number;
  groups: WhatsAppGroup[];
  selectedGroups: WhatsAppGroup[];
  sendResult: SendResult | null;
  isSending: boolean;
  isCancelled: boolean;
}

export type WizardAction =
  | { type: "SET_STEP"; step: WizardStep }
  | { type: "SET_SEND_MODE"; mode: SendMode }
  | { type: "SET_SPREADSHEET"; data: SpreadsheetData }
  | { type: "SET_COLUMN_MAPPINGS"; mappings: ColumnMapping[] }
  | { type: "SET_MESSAGE"; message: string }
  | { type: "SET_ATTACHMENT"; attachment: Attachment | null }
  | { type: "SET_SESSION"; name: string }
  | { type: "SET_AUTHENTICATED"; value: boolean }
  | { type: "SET_SEND_INTERVAL"; seconds: number }
  | { type: "SET_GROUPS"; groups: WhatsAppGroup[] }
  | { type: "SET_SELECTED_GROUPS"; groups: WhatsAppGroup[] }
  | { type: "SET_SEND_RESULT"; result: SendResult }
  | { type: "UPDATE_CONTACT_STATUS"; index: number; status: Contact["status"]; errorMessage?: string }
  | { type: "SET_SENDING"; value: boolean }
  | { type: "SET_CANCELLED"; value: boolean }
  | { type: "RESET" };
