"use client";

import { useEffect, useState } from "react";
import { useWizard } from "@/context/WizardContext";
import { detectColumnRole } from "@/lib/spreadsheet";
import Button from "@/components/ui/Button";
import type { ColumnMapping, ColumnRole } from "@/types";

const roleLabels: Record<ColumnRole, string> = {
  nome: "Nome",
  telefone: "Telefone",
  variavel: "Variável",
  ignorar: "Ignorar",
};

export default function StepMapping() {
  const { state, dispatch } = useWizard();
  const [mappings, setMappings] = useState<ColumnMapping[]>([]);

  useEffect(() => {
    if (!state.spreadsheet) return;

    if (state.columnMappings.length > 0) {
      setMappings(state.columnMappings);
      return;
    }

    const autoMappings: ColumnMapping[] = state.spreadsheet.headers.map((header) => {
      const detected = detectColumnRole(header);
      return {
        header,
        role: detected || "variavel",
        variableName: detected ? undefined : header,
      };
    });
    setMappings(autoMappings);
  }, [state.spreadsheet, state.columnMappings]);

  const handleRoleChange = (index: number, role: ColumnRole) => {
    setMappings((prev) =>
      prev.map((m, i) =>
        i === index
          ? { ...m, role, variableName: role === "variavel" ? m.header : undefined }
          : m
      )
    );
  };

  const hasNome = mappings.some((m) => m.role === "nome");
  const hasTelefone = mappings.some((m) => m.role === "telefone");
  const isValid = hasNome && hasTelefone;

  const handleNext = () => {
    dispatch({ type: "SET_COLUMN_MAPPINGS", mappings });
    dispatch({ type: "SET_STEP", step: 3 });
  };

  const handleBack = () => {
    dispatch({ type: "SET_STEP", step: 1 });
  };

  const getSample = (header: string): string[] => {
    if (!state.spreadsheet) return [];
    return state.spreadsheet.rows
      .slice(0, 3)
      .map((row) => row[header] || "—");
  };

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-xl font-semibold text-text-primary">Mapeamento de Colunas</h2>
        <p className="text-sm text-text-muted mt-1">
          Defina o papel de cada coluna da sua planilha. Nome e Telefone são obrigatórios.
        </p>
      </div>

      <div className="grid gap-3">
        {mappings.map((mapping, i) => (
          <div
            key={mapping.header}
            className={`flex items-center gap-4 p-4 rounded-xl border transition-colors ${
              mapping.role === "nome" || mapping.role === "telefone"
                ? "border-accent/30 bg-accent/5"
                : mapping.role === "ignorar"
                ? "border-border-subtle bg-dark opacity-50"
                : "border-border-subtle bg-surface-hover"
            }`}
          >
            <div className="flex-1 min-w-0">
              <p className="text-sm font-medium text-text-primary truncate">{mapping.header}</p>
              <p className="text-xs text-text-muted mt-0.5 truncate">
                {getSample(mapping.header).join(" · ")}
              </p>
            </div>
            <select
              value={mapping.role}
              onChange={(e) => handleRoleChange(i, e.target.value as ColumnRole)}
              className="bg-surface border border-border-subtle rounded-lg px-3 py-2 text-sm text-text-primary focus:outline-none focus:border-accent cursor-pointer"
            >
              {Object.entries(roleLabels).map(([value, label]) => (
                <option key={value} value={value}>
                  {label}
                </option>
              ))}
            </select>
          </div>
        ))}
      </div>

      {!isValid && (
        <div className="flex items-center gap-2 text-sm text-accent">
          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L4.082 16.5c-.77.833.192 2.5 1.732 2.5z" />
          </svg>
          <span>
            {!hasNome && "Selecione uma coluna como Nome. "}
            {!hasTelefone && "Selecione uma coluna como Telefone."}
          </span>
        </div>
      )}

      <div className="flex justify-between">
        <Button variant="secondary" onClick={handleBack}>
          Voltar
        </Button>
        <Button onClick={handleNext} disabled={!isValid}>
          Próximo
        </Button>
      </div>
    </div>
  );
}
