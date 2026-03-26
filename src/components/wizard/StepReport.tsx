"use client";

import { useEffect, useRef } from "react";
import { useWizard } from "@/context/WizardContext";
import { deleteSession } from "@/lib/waha-client";
import Button from "@/components/ui/Button";

export default function StepReport() {
  const { state, dispatch } = useWizard();
  const deletedRef = useRef(false);

  useEffect(() => {
    if (state.sessionName && !deletedRef.current) {
      deletedRef.current = true;
      deleteSession(state.sessionName).catch(() => {});
    }
  }, [state.sessionName]);

  const result = state.sendResult;
  if (!result) return null;

  const endTime = result.endTime || Date.now();
  const durationMs = endTime - result.startTime;
  const durationMin = Math.floor(durationMs / 60000);
  const durationSec = Math.floor((durationMs % 60000) / 1000);

  const exportCSV = () => {
    const headers = ["Nome", "Telefone", "Status", "Motivo"];
    const rows = result.contacts.map((c) => [
      c.name,
      c.phone,
      c.status === "sent" ? "Enviado" : c.status === "failed" ? "Falhou" : "Pendente",
      c.errorMessage || "",
    ]);

    const csv = [headers, ...rows]
      .map((row) => row.map((cell) => `"${cell.replace(/"/g, '""')}"`).join(","))
      .join("\n");

    const blob = new Blob(["\uFEFF" + csv], { type: "text/csv;charset=utf-8;" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `relatorio-wahasend-${new Date().toISOString().slice(0, 10)}.csv`;
    a.click();
    URL.revokeObjectURL(url);
  };

  const handleNewCampaign = () => {
    dispatch({ type: "RESET" });
  };

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-xl font-semibold text-text-primary">Relatório de Envio</h2>
        <p className="text-sm text-text-muted mt-1">
          {state.isCancelled ? "Envio cancelado. " : ""}
          Confira o resultado do envio das mensagens
        </p>
      </div>

      {/* Summary cards */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
        <div className="bg-surface-hover rounded-xl p-4 text-center border border-border-subtle">
          <p className="text-3xl font-bold text-text-primary">{result.total}</p>
          <p className="text-xs text-text-muted mt-1">Total</p>
        </div>
        <div className="bg-success/10 rounded-xl p-4 text-center border border-success/20">
          <p className="text-3xl font-bold text-success">{result.sent}</p>
          <p className="text-xs text-success/80 mt-1">Enviados</p>
        </div>
        <div className="bg-error/10 rounded-xl p-4 text-center border border-error/20">
          <p className="text-3xl font-bold text-error">{result.failed}</p>
          <p className="text-xs text-error/80 mt-1">Falhas</p>
        </div>
        <div className="bg-accent/10 rounded-xl p-4 text-center border border-accent/20">
          <p className="text-3xl font-bold text-accent">
            {durationMin > 0 ? `${durationMin}m ` : ""}{durationSec}s
          </p>
          <p className="text-xs text-accent/80 mt-1">Tempo total</p>
        </div>
      </div>

      {/* Details table */}
      <div className="overflow-x-auto rounded-lg border border-border-subtle">
        <table className="w-full text-sm">
          <thead>
            <tr className="bg-surface">
              <th className="px-4 py-2.5 text-left font-medium text-text-muted border-b border-border-subtle">Nome</th>
              <th className="px-4 py-2.5 text-left font-medium text-text-muted border-b border-border-subtle">Telefone</th>
              <th className="px-4 py-2.5 text-left font-medium text-text-muted border-b border-border-subtle">Status</th>
              <th className="px-4 py-2.5 text-left font-medium text-text-muted border-b border-border-subtle">Motivo</th>
            </tr>
          </thead>
          <tbody>
            {result.contacts.map((contact) => (
              <tr
                key={contact.index}
                className="border-b border-border-subtle last:border-b-0 hover:bg-surface/50"
              >
                <td className="px-4 py-2 text-text-primary">{contact.name}</td>
                <td className="px-4 py-2 text-text-primary">{contact.phone}</td>
                <td className="px-4 py-2">
                  {contact.status === "sent" ? (
                    <span className="inline-flex items-center gap-1 text-success">
                      <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                      </svg>
                      Enviado
                    </span>
                  ) : contact.status === "failed" ? (
                    <span className="inline-flex items-center gap-1 text-error">
                      <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                      </svg>
                      Falhou
                    </span>
                  ) : (
                    <span className="text-text-muted">Pendente</span>
                  )}
                </td>
                <td className="px-4 py-2 text-text-muted text-xs">{contact.errorMessage || "—"}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Actions */}
      <div className="flex flex-col sm:flex-row gap-3 justify-center">
        <Button variant="secondary" onClick={exportCSV}>
          <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 10v6m0 0l-3-3m3 3l3-3m2 8H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
          </svg>
          Exportar CSV
        </Button>
        <Button onClick={handleNewCampaign}>
          Nova Campanha
        </Button>
      </div>
    </div>
  );
}
