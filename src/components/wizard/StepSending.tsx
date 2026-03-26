"use client";

import { useEffect, useRef, useCallback } from "react";
import { useWizard } from "@/context/WizardContext";
import {
  checkNumber,
  sendTextMessage,
  sendImageMessage,
  sendFileMessage,
  formatPhoneForChat,
  renderMessage,
} from "@/lib/waha-client";
import Button from "@/components/ui/Button";
import ProgressBar from "@/components/ui/ProgressBar";
import type { Contact, SendResult } from "@/types";

export default function StepSending() {
  const { state, dispatch } = useWizard();
  const cancelledRef = useRef(false);
  const startedRef = useRef(false);

  const buildContacts = useCallback((): Contact[] => {
    if (!state.spreadsheet) return [];

    const nameMapping = state.columnMappings.find((m) => m.role === "nome");
    const phoneMapping = state.columnMappings.find((m) => m.role === "telefone");
    const variableMappings = state.columnMappings.filter(
      (m) => m.role === "variavel"
    );

    if (!nameMapping || !phoneMapping) return [];

    return state.spreadsheet.rows.map((row, i) => {
      const variables: Record<string, string> = {
        Nome: row[nameMapping.header] || "",
        Telefone: row[phoneMapping.header] || "",
      };
      for (const vm of variableMappings) {
        variables[vm.variableName || vm.header] = row[vm.header] || "";
      }

      return {
        index: i,
        name: row[nameMapping.header] || `Contato ${i + 1}`,
        phone: row[phoneMapping.header] || "",
        variables,
        status: "pending" as const,
      };
    });
  }, [state.spreadsheet, state.columnMappings]);

  const sendMessages = useCallback(async () => {
    if (!state.sessionName) return;

    const contacts = buildContacts();
    const result: SendResult = {
      total: contacts.length,
      sent: 0,
      failed: 0,
      startTime: Date.now(),
      contacts,
    };

    dispatch({ type: "SET_SEND_RESULT", result });
    dispatch({ type: "SET_SENDING", value: true });

    for (let i = 0; i < contacts.length; i++) {
      if (cancelledRef.current) break;

      const contact = contacts[i];
      dispatch({ type: "UPDATE_CONTACT_STATUS", index: i, status: "sending" });

      try {
        // Check number
        const chatId = formatPhoneForChat(contact.phone);
        const exists = await checkNumber(state.sessionName, contact.phone);

        if (!exists) {
          dispatch({
            type: "UPDATE_CONTACT_STATUS",
            index: i,
            status: "failed",
            errorMessage: "Número não encontrado no WhatsApp",
          });
          continue;
        }

        // Render message
        const text = renderMessage(state.message, contact.variables);

        // Send
        if (state.attachment) {
          if (state.attachment.type === "image") {
            await sendImageMessage(
              state.sessionName,
              chatId,
              state.attachment.base64,
              text,
              state.attachment.file.type
            );
          } else {
            await sendFileMessage(
              state.sessionName,
              chatId,
              state.attachment.base64,
              state.attachment.file.name,
              text,
              state.attachment.file.type
            );
          }
        } else {
          await sendTextMessage(state.sessionName, chatId, text);
        }

        dispatch({ type: "UPDATE_CONTACT_STATUS", index: i, status: "sent" });
      } catch (err) {
        dispatch({
          type: "UPDATE_CONTACT_STATUS",
          index: i,
          status: "failed",
          errorMessage: err instanceof Error ? err.message : "Erro desconhecido",
        });
      }

      // Wait interval before next message
      if (i < contacts.length - 1 && !cancelledRef.current) {
        await new Promise((r) => setTimeout(r, state.sendInterval * 1000));
      }
    }

    dispatch({ type: "SET_SENDING", value: false });
    dispatch({ type: "SET_STEP", step: 6 });
  }, [state.sessionName, state.message, state.attachment, state.sendInterval, state.columnMappings, buildContacts, dispatch]);

  useEffect(() => {
    if (!startedRef.current) {
      startedRef.current = true;
      cancelledRef.current = false;
      sendMessages();
    }
  }, [sendMessages]);

  const handleCancel = () => {
    cancelledRef.current = true;
    dispatch({ type: "SET_CANCELLED", value: true });
  };

  const total = state.sendResult?.total || 0;
  const sent = state.sendResult?.sent || 0;
  const failed = state.sendResult?.failed || 0;
  const processed = sent + failed;

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-xl font-semibold text-text-primary">Enviando Mensagens</h2>
        <p className="text-sm text-text-muted mt-1">
          Enviando para {total} contatos com intervalo de {state.sendInterval}s
        </p>
      </div>

      <ProgressBar value={processed} max={total} />

      {/* Counters */}
      <div className="grid grid-cols-3 gap-3">
        <div className="bg-success/10 rounded-xl p-3 text-center border border-success/20">
          <p className="text-2xl font-bold text-success">{sent}</p>
          <p className="text-xs text-success/80">Enviados</p>
        </div>
        <div className="bg-error/10 rounded-xl p-3 text-center border border-error/20">
          <p className="text-2xl font-bold text-error">{failed}</p>
          <p className="text-xs text-error/80">Falhas</p>
        </div>
        <div className="bg-surface rounded-xl p-3 text-center border border-border-subtle">
          <p className="text-2xl font-bold text-text-muted">{total - processed}</p>
          <p className="text-xs text-text-muted">Restantes</p>
        </div>
      </div>

      {/* Contact list */}
      <div className="max-h-64 overflow-y-auto rounded-lg border border-border-subtle">
        {state.sendResult?.contacts.map((contact) => (
          <div
            key={contact.index}
            className="flex items-center gap-3 px-4 py-2.5 border-b border-border-subtle last:border-b-0"
          >
            {/* Status icon */}
            <div className="w-5 h-5 flex-shrink-0">
              {contact.status === "pending" && (
                <div className="w-3 h-3 mt-1 ml-1 rounded-full bg-border-subtle" />
              )}
              {contact.status === "sending" && (
                <div className="w-5 h-5 border-2 border-accent border-t-transparent rounded-full animate-spin" />
              )}
              {contact.status === "sent" && (
                <svg className="w-5 h-5 text-success" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                </svg>
              )}
              {contact.status === "failed" && (
                <svg className="w-5 h-5 text-error" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              )}
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-sm text-text-primary truncate">{contact.name}</p>
              <p className="text-xs text-text-muted">{contact.phone}</p>
            </div>
            {contact.errorMessage && (
              <p className="text-xs text-error truncate max-w-[200px]">{contact.errorMessage}</p>
            )}
          </div>
        ))}
      </div>

      {state.isSending && (
        <div className="flex justify-center">
          <Button variant="danger" onClick={handleCancel}>
            Cancelar Envio
          </Button>
        </div>
      )}
    </div>
  );
}
