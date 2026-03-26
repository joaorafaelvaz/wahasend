"use client";

import { useRef, useState, useCallback } from "react";
import { useWizard } from "@/context/WizardContext";
import { renderMessage } from "@/lib/waha-client";
import Button from "@/components/ui/Button";
import FileDropzone from "@/components/ui/FileDropzone";
import type { Attachment } from "@/types";

export default function StepMessage() {
  const { state, dispatch } = useWizard();
  const textareaRef = useRef<HTMLTextAreaElement>(null);
  const [message, setMessage] = useState(state.message || "");

  const variables = state.columnMappings
    .filter((m) => m.role === "nome" || m.role === "variavel")
    .map((m) => ({
      key: m.role === "nome" ? "Nome" : (m.variableName || m.header),
      header: m.header,
    }));

  const phoneMapping = state.columnMappings.find((m) => m.role === "telefone");
  if (phoneMapping) {
    variables.push({ key: "Telefone", header: phoneMapping.header });
  }

  const insertVariable = (varName: string) => {
    const textarea = textareaRef.current;
    if (!textarea) return;

    const start = textarea.selectionStart;
    const end = textarea.selectionEnd;
    const tag = `{{${varName}}}`;
    const newMessage = message.slice(0, start) + tag + message.slice(end);
    setMessage(newMessage);

    setTimeout(() => {
      textarea.focus();
      textarea.selectionStart = textarea.selectionEnd = start + tag.length;
    }, 0);
  };

  const getPreview = (): string => {
    if (!state.spreadsheet || state.spreadsheet.rows.length === 0) return message;
    const firstRow = state.spreadsheet.rows[0];
    const vars: Record<string, string> = {};

    for (const v of variables) {
      vars[v.key] = firstRow[v.header] || v.key;
    }

    return renderMessage(message, vars);
  };

  const handleAttachment = useCallback(async (file: File) => {
    const isImage = file.type.startsWith("image/");
    const reader = new FileReader();
    reader.onload = () => {
      const base64 = (reader.result as string).split(",")[1];
      const attachment: Attachment = {
        file,
        type: isImage ? "image" : "document",
        base64,
        preview: isImage ? URL.createObjectURL(file) : undefined,
      };
      dispatch({ type: "SET_ATTACHMENT", attachment });
    };
    reader.readAsDataURL(file);
  }, [dispatch]);

  const removeAttachment = () => {
    dispatch({ type: "SET_ATTACHMENT", attachment: null });
  };

  const handleNext = () => {
    dispatch({ type: "SET_MESSAGE", message });
    dispatch({ type: "SET_STEP", step: 4 });
  };

  const handleBack = () => {
    dispatch({ type: "SET_MESSAGE", message });
    dispatch({ type: "SET_STEP", step: 2 });
  };

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-xl font-semibold text-text-primary">Compor Mensagem</h2>
        <p className="text-sm text-text-muted mt-1">
          Escreva sua mensagem. Use variáveis para personalizar.
        </p>
      </div>

      {/* Variable chips */}
      <div>
        <p className="text-xs text-text-muted mb-2">Inserir variável:</p>
        <div className="flex flex-wrap gap-2">
          {variables.map((v) => (
            <button
              key={v.key}
              onClick={() => insertVariable(v.key)}
              className="px-3 py-1 text-xs font-medium bg-accent/10 text-accent border border-accent/20 rounded-full hover:bg-accent/20 transition-colors cursor-pointer"
            >
              {`{{${v.key}}}`}
            </button>
          ))}
        </div>
      </div>

      {/* Message & Preview side by side */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div>
          <label className="text-sm font-medium text-text-muted mb-1.5 block">Mensagem</label>
          <textarea
            ref={textareaRef}
            value={message}
            onChange={(e) => setMessage(e.target.value)}
            placeholder="Olá {{Nome}}, tudo bem? ..."
            rows={8}
            className="w-full bg-surface-hover border border-border-subtle rounded-lg px-4 py-3 text-sm text-text-primary placeholder:text-text-muted/50 focus:outline-none focus:border-accent focus:ring-1 focus:ring-accent/30 transition-colors resize-none"
          />
          <p className="text-xs text-text-muted mt-1">{message.length} caracteres</p>
        </div>
        <div>
          <label className="text-sm font-medium text-text-muted mb-1.5 block">Preview (1o contato)</label>
          <div className="bg-surface-hover border border-border-subtle rounded-lg px-4 py-3 text-sm text-text-primary min-h-[200px] whitespace-pre-wrap">
            {getPreview() || <span className="text-text-muted italic">Sua mensagem aparecerá aqui...</span>}
          </div>
        </div>
      </div>

      {/* Attachment */}
      <div>
        <label className="text-sm font-medium text-text-muted mb-1.5 block">Anexo (opcional)</label>
        {!state.attachment ? (
          <FileDropzone
            accept=".jpg,.jpeg,.png,.pdf,.doc,.docx"
            onFile={handleAttachment}
            label="Adicionar imagem ou documento"
            description="JPG, PNG, PDF, DOC"
          />
        ) : (
          <div className="flex items-center gap-3 bg-surface-hover rounded-lg px-4 py-3 border border-border-subtle">
            {state.attachment.type === "image" && state.attachment.preview ? (
              <img
                src={state.attachment.preview}
                alt="Preview"
                className="w-12 h-12 rounded-lg object-cover"
              />
            ) : (
              <svg className="w-10 h-10 text-text-muted" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M7 21h10a2 2 0 002-2V9.414a1 1 0 00-.293-.707l-5.414-5.414A1 1 0 0012.586 3H7a2 2 0 00-2 2v14a2 2 0 002 2z" />
              </svg>
            )}
            <div className="flex-1 min-w-0">
              <p className="text-sm font-medium text-text-primary truncate">{state.attachment.file.name}</p>
              <p className="text-xs text-text-muted">
                {state.attachment.type === "image" ? "Imagem" : "Documento"} &middot;{" "}
                {(state.attachment.file.size / 1024).toFixed(0)} KB
              </p>
            </div>
            <button onClick={removeAttachment} className="text-text-muted hover:text-error transition-colors cursor-pointer">
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </div>
        )}
      </div>

      <div className="flex justify-between">
        <Button variant="secondary" onClick={handleBack}>
          Voltar
        </Button>
        <Button onClick={handleNext} disabled={!message.trim()}>
          Próximo
        </Button>
      </div>
    </div>
  );
}
