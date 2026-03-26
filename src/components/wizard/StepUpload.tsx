"use client";

import { useState } from "react";
import { useWizard } from "@/context/WizardContext";
import { parseSpreadsheet } from "@/lib/spreadsheet";
import FileDropzone from "@/components/ui/FileDropzone";
import DataTable from "@/components/ui/DataTable";
import Button from "@/components/ui/Button";
import type { SendMode } from "@/types";

export default function StepUpload() {
  const { state, dispatch } = useWizard();
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  const handleModeChange = (mode: SendMode) => {
    dispatch({ type: "SET_SEND_MODE", mode });
  };

  const handleFile = async (file: File) => {
    const validTypes = [
      "text/csv",
      "application/vnd.ms-excel",
      "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
    ];
    const ext = file.name.split(".").pop()?.toLowerCase();
    if (!validTypes.includes(file.type) && !["csv", "xls", "xlsx"].includes(ext || "")) {
      setError("Formato inválido. Use CSV, XLS ou XLSX.");
      return;
    }

    setError(null);
    setLoading(true);
    try {
      const data = await parseSpreadsheet(file);
      dispatch({ type: "SET_SPREADSHEET", data });
    } catch (err) {
      setError(err instanceof Error ? err.message : "Erro ao processar arquivo");
    } finally {
      setLoading(false);
    }
  };

  const handleNext = () => {
    if (state.sendMode === "groups") {
      // Groups mode: skip upload/mapping, go to message
      dispatch({ type: "SET_STEP", step: 3 });
    } else {
      dispatch({ type: "SET_STEP", step: 2 });
    }
  };

  const handleRemove = () => {
    dispatch({
      type: "SET_SPREADSHEET",
      data: null as unknown as import("@/types").SpreadsheetData,
    });
  };

  const canProceed = state.sendMode === "groups" || !!state.spreadsheet;

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-xl font-semibold text-text-primary">Modo de Envio</h2>
        <p className="text-sm text-text-muted mt-1">
          Escolha como deseja enviar suas mensagens
        </p>
      </div>

      {/* Mode selector */}
      <div className="grid grid-cols-2 gap-3">
        <button
          onClick={() => handleModeChange("contacts")}
          className={`flex flex-col items-center gap-3 p-5 rounded-xl border-2 transition-all cursor-pointer ${
            state.sendMode === "contacts"
              ? "border-accent bg-accent/5"
              : "border-border-subtle hover:border-accent/30 bg-surface-hover"
          }`}
        >
          <svg className={`w-8 h-8 ${state.sendMode === "contacts" ? "text-accent" : "text-text-muted"}`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
          </svg>
          <div className="text-center">
            <p className={`text-sm font-semibold ${state.sendMode === "contacts" ? "text-accent" : "text-text-primary"}`}>
              Contatos
            </p>
            <p className="text-xs text-text-muted mt-0.5">
              Enviar para números individuais via planilha
            </p>
          </div>
        </button>

        <button
          onClick={() => handleModeChange("groups")}
          className={`flex flex-col items-center gap-3 p-5 rounded-xl border-2 transition-all cursor-pointer ${
            state.sendMode === "groups"
              ? "border-accent bg-accent/5"
              : "border-border-subtle hover:border-accent/30 bg-surface-hover"
          }`}
        >
          <svg className={`w-8 h-8 ${state.sendMode === "groups" ? "text-accent" : "text-text-muted"}`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
          </svg>
          <div className="text-center">
            <p className={`text-sm font-semibold ${state.sendMode === "groups" ? "text-accent" : "text-text-primary"}`}>
              Grupos
            </p>
            <p className="text-xs text-text-muted mt-0.5">
              Enviar para grupos do WhatsApp
            </p>
          </div>
        </button>
      </div>

      {/* Spreadsheet upload (only for contacts mode) */}
      {state.sendMode === "contacts" && (
        <>
          <div>
            <h3 className="text-base font-medium text-text-primary mb-1">Upload da Planilha</h3>
            <p className="text-sm text-text-muted">
              Importe sua lista de contatos em formato CSV, XLS ou XLSX
            </p>
          </div>

          {!state.spreadsheet ? (
            <FileDropzone
              accept=".csv,.xls,.xlsx"
              onFile={handleFile}
              label={loading ? "Processando..." : "Arraste sua planilha aqui"}
              description="Formatos aceitos: CSV, XLS, XLSX"
            />
          ) : (
            <div className="space-y-4">
              <div className="flex items-center justify-between bg-surface-hover rounded-lg px-4 py-3 border border-border-subtle">
                <div className="flex items-center gap-3">
                  <svg className="w-5 h-5 text-accent" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                  </svg>
                  <div>
                    <p className="text-sm font-medium text-text-primary">{state.spreadsheet.fileName}</p>
                    <p className="text-xs text-text-muted">
                      {state.spreadsheet.rows.length} contatos &middot; {state.spreadsheet.headers.length} colunas
                    </p>
                  </div>
                </div>
                <button onClick={handleRemove} className="text-text-muted hover:text-error transition-colors cursor-pointer">
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                  </svg>
                </button>
              </div>

              <DataTable
                headers={state.spreadsheet.headers}
                rows={state.spreadsheet.rows}
                maxRows={5}
              />
            </div>
          )}
        </>
      )}

      {/* Groups mode info */}
      {state.sendMode === "groups" && (
        <div className="bg-accent/5 border border-accent/20 rounded-xl p-4 flex items-start gap-3">
          <svg className="w-5 h-5 text-accent mt-0.5 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
          </svg>
          <div>
            <p className="text-sm text-text-primary font-medium">Modo Grupos</p>
            <p className="text-xs text-text-muted mt-1">
              Você irá compor a mensagem, autenticar no WhatsApp e então selecionar os grupos para envio. Variáveis de planilha não estão disponíveis neste modo.
            </p>
          </div>
        </div>
      )}

      {error && (
        <p className="text-sm text-error">{error}</p>
      )}

      <div className="flex justify-end">
        <Button onClick={handleNext} disabled={!canProceed}>
          Próximo
        </Button>
      </div>
    </div>
  );
}
