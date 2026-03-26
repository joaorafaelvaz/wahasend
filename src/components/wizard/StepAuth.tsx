"use client";

import { useState, useEffect, useRef, useCallback } from "react";
import { useWizard } from "@/context/WizardContext";
import { createSession, getQrCode, getSessionStatus, getGroups } from "@/lib/waha-client";
import { v4 as uuidv4 } from "uuid";
import Button from "@/components/ui/Button";
import Input from "@/components/ui/Input";
import type { WhatsAppGroup } from "@/types";

export default function StepAuth() {
  const { state, dispatch } = useWizard();
  const [interval, setInterval_] = useState(state.sendInterval);
  const [qrCode, setQrCode] = useState<string | null>(null);
  const [status, setStatus] = useState<string>("idle");
  const [error, setError] = useState<string | null>(null);
  const [loadingGroups, setLoadingGroups] = useState(false);
  const [groupSearch, setGroupSearch] = useState("");
  const pollingRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const sessionRef = useRef<string | null>(state.sessionName);

  const isGroupMode = state.sendMode === "groups";

  const stopPolling = useCallback(() => {
    if (pollingRef.current) {
      clearInterval(pollingRef.current);
      pollingRef.current = null;
    }
  }, []);

  useEffect(() => {
    return () => stopPolling();
  }, [stopPolling]);

  const fetchGroups = useCallback(async (sessionName: string) => {
    setLoadingGroups(true);
    try {
      const rawGroups = await getGroups(sessionName);
      const groups: WhatsAppGroup[] = rawGroups.map((g) => ({
        id: g.id,
        name: g.name || g.id,
        participants: g.participants?.length || 0,
        selected: false,
      }));
      dispatch({ type: "SET_GROUPS", groups });
    } catch {
      setError("Falha ao carregar grupos. Verifique sua conexão.");
    } finally {
      setLoadingGroups(false);
    }
  }, [dispatch]);

  const startPolling = useCallback((sessionName: string) => {
    stopPolling();
    pollingRef.current = setInterval(async () => {
      try {
        const s = await getSessionStatus(sessionName);
        if (s === "WORKING") {
          stopPolling();
          setStatus("connected");
          dispatch({ type: "SET_AUTHENTICATED", value: true });
          if (isGroupMode) {
            fetchGroups(sessionName);
          }
        } else if (s === "SCAN_QR_CODE") {
          try {
            const qr = await getQrCode(sessionName);
            setQrCode(typeof qr === "string" && qr.startsWith("data:") ? qr : `data:image/png;base64,${qr}`);
          } catch {
            // QR might not be ready yet
          }
        } else if (s === "FAILED") {
          stopPolling();
          setError("Sessão falhou. Tente novamente.");
          setStatus("error");
        }
      } catch {
        // Network error, keep polling
      }
    }, 3000);
  }, [stopPolling, dispatch, isGroupMode, fetchGroups]);

  const handleConnect = async () => {
    setError(null);
    setStatus("creating");

    try {
      const sessionName = `wahasend-${uuidv4().slice(0, 8)}`;
      sessionRef.current = sessionName;
      dispatch({ type: "SET_SESSION", name: sessionName });

      await createSession(sessionName);
      setStatus("waiting_qr");

      await new Promise((r) => setTimeout(r, 2000));

      try {
        const qr = await getQrCode(sessionName);
        setQrCode(typeof qr === "string" && qr.startsWith("data:") ? qr : `data:image/png;base64,${qr}`);
      } catch {
        // QR might take longer, polling will fetch it
      }

      startPolling(sessionName);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Erro ao criar sessão");
      setStatus("error");
    }
  };

  const toggleGroup = (groupId: string) => {
    const updated = state.groups.map((g) =>
      g.id === groupId ? { ...g, selected: !g.selected } : g
    );
    dispatch({ type: "SET_GROUPS", groups: updated });
  };

  const selectedCount = state.groups.filter((g) => g.selected).length;

  const filteredGroups = state.groups.filter((g) =>
    g.name.toLowerCase().includes(groupSearch.toLowerCase())
  );

  const handleNext = () => {
    dispatch({ type: "SET_SEND_INTERVAL", seconds: interval });
    if (isGroupMode) {
      const selected = state.groups.filter((g) => g.selected);
      dispatch({ type: "SET_SELECTED_GROUPS", groups: selected });
    }
    dispatch({ type: "SET_STEP", step: 5 });
  };

  const handleBack = () => {
    dispatch({ type: "SET_STEP", step: 3 });
  };

  const canProceed = isGroupMode
    ? state.isAuthenticated && selectedCount > 0
    : state.isAuthenticated;

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-xl font-semibold text-text-primary">Autenticação WhatsApp</h2>
        <p className="text-sm text-text-muted mt-1">
          {isGroupMode
            ? "Conecte seu WhatsApp e selecione os grupos para envio"
            : "Configure o intervalo de envio e conecte seu WhatsApp"}
        </p>
      </div>

      {/* Send interval */}
      <div className="max-w-xs">
        <Input
          label={isGroupMode ? "Intervalo entre grupos (segundos)" : "Intervalo entre mensagens (segundos)"}
          type="number"
          min={1}
          max={60}
          value={interval}
          onChange={(e) => setInterval_(Math.max(1, parseInt(e.target.value) || 5))}
        />
        <p className="text-xs text-text-muted mt-1">
          Recomendado: 5-10 segundos para evitar bloqueios
        </p>
      </div>

      {/* Connection area */}
      <div className="flex flex-col items-center gap-4 py-4">
        {status === "idle" || status === "error" ? (
          <>
            <Button size="lg" onClick={handleConnect}>
              <svg className="w-5 h-5 mr-2" fill="currentColor" viewBox="0 0 24 24">
                <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z"/>
              </svg>
              Conectar WhatsApp
            </Button>
            {error && <p className="text-sm text-error">{error}</p>}
          </>
        ) : status === "creating" ? (
          <div className="flex flex-col items-center gap-3">
            <div className="w-8 h-8 border-2 border-accent border-t-transparent rounded-full animate-spin" />
            <p className="text-sm text-text-muted">Criando sessão...</p>
          </div>
        ) : status === "waiting_qr" ? (
          <div className="flex flex-col items-center gap-4">
            <p className="text-sm text-text-muted">Escaneie o QR Code com seu WhatsApp</p>
            {qrCode ? (
              <div className="p-4 bg-white rounded-2xl qr-scanning border-2 border-accent">
                <img src={qrCode} alt="QR Code" className="w-64 h-64" />
              </div>
            ) : (
              <div className="w-72 h-72 bg-surface-hover rounded-2xl flex items-center justify-center border border-border-subtle">
                <div className="w-8 h-8 border-2 border-accent border-t-transparent rounded-full animate-spin" />
              </div>
            )}
            <p className="text-xs text-text-muted">
              Abra o WhatsApp &gt; Dispositivos conectados &gt; Conectar dispositivo
            </p>
          </div>
        ) : status === "connected" ? (
          <div className="flex flex-col items-center gap-3 py-4">
            <div className="w-16 h-16 rounded-full bg-success/10 flex items-center justify-center">
              <svg className="w-8 h-8 text-success" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M5 13l4 4L19 7" />
              </svg>
            </div>
            <p className="text-lg font-semibold text-success">Conectado!</p>
            <p className="text-sm text-text-muted">WhatsApp autenticado com sucesso</p>
          </div>
        ) : null}
      </div>

      {/* Group selection (only for groups mode, after authentication) */}
      {isGroupMode && state.isAuthenticated && (
        <div className="space-y-3">
          <div className="flex items-center justify-between">
            <h3 className="text-base font-medium text-text-primary">Selecionar Grupos</h3>
            <span className="text-xs text-accent font-medium">
              {selectedCount} grupo{selectedCount !== 1 ? "s" : ""} selecionado{selectedCount !== 1 ? "s" : ""}
            </span>
          </div>

          {loadingGroups ? (
            <div className="flex flex-col items-center gap-3 py-8">
              <div className="w-8 h-8 border-2 border-accent border-t-transparent rounded-full animate-spin" />
              <p className="text-sm text-text-muted">Carregando grupos... A sincronização pode levar alguns minutos.</p>
            </div>
          ) : state.groups.length === 0 ? (
            <div className="flex flex-col items-center gap-3 py-8">
              <p className="text-sm text-text-muted">Nenhum grupo encontrado</p>
              <p className="text-xs text-text-muted">A sincronização pode demorar. Aguarde e tente novamente.</p>
              <Button
                variant="secondary"
                size="sm"
                onClick={() => state.sessionName && fetchGroups(state.sessionName)}
              >
                <svg className="w-4 h-4 mr-1.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
                </svg>
                Buscar novamente
              </Button>
            </div>
          ) : (
            <>
              {/* Search */}
              <input
                type="text"
                placeholder="Buscar grupo..."
                value={groupSearch}
                onChange={(e) => setGroupSearch(e.target.value)}
                className="w-full bg-surface-hover border border-border-subtle rounded-lg px-4 py-2.5 text-sm text-text-primary placeholder:text-text-muted/50 focus:outline-none focus:border-accent transition-colors"
              />

              {/* Group list */}
              <div className="max-h-64 overflow-y-auto rounded-lg border border-border-subtle">
                {filteredGroups.map((group) => (
                  <button
                    key={group.id}
                    onClick={() => toggleGroup(group.id)}
                    className={`w-full flex items-center gap-3 px-4 py-3 border-b border-border-subtle last:border-b-0 transition-colors cursor-pointer text-left ${
                      group.selected ? "bg-accent/5" : "hover:bg-surface-hover"
                    }`}
                  >
                    <div
                      className={`w-5 h-5 rounded flex-shrink-0 border-2 flex items-center justify-center transition-colors ${
                        group.selected
                          ? "bg-accent border-accent"
                          : "border-border-subtle"
                      }`}
                    >
                      {group.selected && (
                        <svg className="w-3 h-3 text-dark" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" />
                        </svg>
                      )}
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-medium text-text-primary truncate">{group.name}</p>
                      <p className="text-xs text-text-muted">
                        {group.participants} participante{group.participants !== 1 ? "s" : ""}
                      </p>
                    </div>
                  </button>
                ))}
              </div>
            </>
          )}
        </div>
      )}

      <div className="flex justify-between">
        <Button variant="secondary" onClick={handleBack}>
          Voltar
        </Button>
        <Button onClick={handleNext} disabled={!canProceed}>
          {isGroupMode ? `Enviar para ${selectedCount} grupo${selectedCount !== 1 ? "s" : ""}` : "Iniciar Envio"}
        </Button>
      </div>
    </div>
  );
}
