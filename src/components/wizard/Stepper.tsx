"use client";

import type { WizardStep, SendMode } from "@/types";

const contactSteps: { number: WizardStep; label: string }[] = [
  { number: 1, label: "Upload" },
  { number: 2, label: "Mapear" },
  { number: 3, label: "Mensagem" },
  { number: 4, label: "Autenticar" },
  { number: 5, label: "Enviar" },
  { number: 6, label: "Relatório" },
];

const groupSteps: { number: WizardStep; label: string }[] = [
  { number: 1, label: "Modo" },
  { number: 3, label: "Mensagem" },
  { number: 4, label: "Autenticar" },
  { number: 5, label: "Enviar" },
  { number: 6, label: "Relatório" },
];

interface StepperProps {
  currentStep: WizardStep;
  sendMode: SendMode;
}

export default function Stepper({ currentStep, sendMode }: StepperProps) {
  const steps = sendMode === "groups" ? groupSteps : contactSteps;

  return (
    <div className="flex items-center justify-center gap-0 w-full max-w-2xl mx-auto mb-8">
      {steps.map((step, i) => {
        const isActive = step.number === currentStep;
        const isCompleted = step.number < currentStep;

        return (
          <div key={step.number} className="flex items-center">
            <div className="flex flex-col items-center">
              <div
                className={`w-9 h-9 rounded-full flex items-center justify-center text-sm font-semibold transition-all duration-300 ${
                  isActive
                    ? "bg-accent text-dark scale-110"
                    : isCompleted
                    ? "bg-accent/20 text-accent"
                    : "bg-surface border border-border-subtle text-text-muted"
                }`}
              >
                {isCompleted ? (
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M5 13l4 4L19 7" />
                  </svg>
                ) : (
                  i + 1
                )}
              </div>
              <span
                className={`text-xs mt-1.5 transition-colors ${
                  isActive ? "text-accent font-medium" : isCompleted ? "text-accent/60" : "text-text-muted"
                }`}
              >
                {step.label}
              </span>
            </div>
            {i < steps.length - 1 && (
              <div
                className={`w-8 sm:w-12 h-px mx-1 mt-[-16px] transition-colors ${
                  step.number < currentStep ? "bg-accent/40" : "bg-border-subtle"
                }`}
              />
            )}
          </div>
        );
      })}
    </div>
  );
}
