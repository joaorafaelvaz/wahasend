"use client";

import { useState } from "react";
import { useWizard } from "@/context/WizardContext";
import { parseSpreadsheet } from "@/lib/spreadsheet";
import FileDropzone from "@/components/ui/FileDropzone";
import DataTable from "@/components/ui/DataTable";
import Button from "@/components/ui/Button";

export default function StepUpload() {
  const { state, dispatch } = useWizard();
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

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
    dispatch({ type: "SET_STEP", step: 2 });
  };

  const handleRemove = () => {
    dispatch({ type: "SET_SPREADSHEET", data: { headers: [], rows: [], fileName: "" } });
    dispatch({
      type: "SET_SPREADSHEET",
      data: null as unknown as import("@/types").SpreadsheetData,
    });
  };

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-xl font-semibold text-text-primary">Upload da Planilha</h2>
        <p className="text-sm text-text-muted mt-1">
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

      {error && (
        <p className="text-sm text-error">{error}</p>
      )}

      <div className="flex justify-end">
        <Button onClick={handleNext} disabled={!state.spreadsheet}>
          Próximo
        </Button>
      </div>
    </div>
  );
}
