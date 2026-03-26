"use client";

import React, { createContext, useContext, useReducer } from "react";
import type { WizardState, WizardAction } from "@/types";

const initialState: WizardState = {
  currentStep: 1,
  spreadsheet: null,
  columnMappings: [],
  message: "",
  attachment: null,
  sessionName: null,
  isAuthenticated: false,
  sendInterval: 5,
  sendResult: null,
  isSending: false,
  isCancelled: false,
};

function wizardReducer(state: WizardState, action: WizardAction): WizardState {
  switch (action.type) {
    case "SET_STEP":
      return { ...state, currentStep: action.step };
    case "SET_SPREADSHEET":
      return { ...state, spreadsheet: action.data };
    case "SET_COLUMN_MAPPINGS":
      return { ...state, columnMappings: action.mappings };
    case "SET_MESSAGE":
      return { ...state, message: action.message };
    case "SET_ATTACHMENT":
      return { ...state, attachment: action.attachment };
    case "SET_SESSION":
      return { ...state, sessionName: action.name };
    case "SET_AUTHENTICATED":
      return { ...state, isAuthenticated: action.value };
    case "SET_SEND_INTERVAL":
      return { ...state, sendInterval: action.seconds };
    case "SET_SEND_RESULT":
      return { ...state, sendResult: action.result };
    case "UPDATE_CONTACT_STATUS": {
      if (!state.sendResult) return state;
      const contacts = state.sendResult.contacts.map((c) =>
        c.index === action.index
          ? { ...c, status: action.status, errorMessage: action.errorMessage }
          : c
      );
      const sent = contacts.filter((c) => c.status === "sent").length;
      const failed = contacts.filter((c) => c.status === "failed").length;
      return {
        ...state,
        sendResult: { ...state.sendResult, contacts, sent, failed },
      };
    }
    case "SET_SENDING":
      return { ...state, isSending: action.value };
    case "SET_CANCELLED":
      return { ...state, isCancelled: action.value };
    case "RESET":
      return initialState;
    default:
      return state;
  }
}

const WizardContext = createContext<{
  state: WizardState;
  dispatch: React.Dispatch<WizardAction>;
} | null>(null);

export function WizardProvider({ children }: { children: React.ReactNode }) {
  const [state, dispatch] = useReducer(wizardReducer, initialState);
  return (
    <WizardContext.Provider value={{ state, dispatch }}>
      {children}
    </WizardContext.Provider>
  );
}

export function useWizard() {
  const context = useContext(WizardContext);
  if (!context) {
    throw new Error("useWizard must be used within a WizardProvider");
  }
  return context;
}
