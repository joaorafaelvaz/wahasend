"use client";

import { useWizard } from "@/context/WizardContext";
import Stepper from "./Stepper";
import StepUpload from "./StepUpload";
import StepMapping from "./StepMapping";
import StepMessage from "./StepMessage";
import StepAuth from "./StepAuth";
import StepSending from "./StepSending";
import StepReport from "./StepReport";

export default function Wizard() {
  const { state } = useWizard();

  const renderStep = () => {
    switch (state.currentStep) {
      case 1:
        return <StepUpload />;
      case 2:
        return <StepMapping />;
      case 3:
        return <StepMessage />;
      case 4:
        return <StepAuth />;
      case 5:
        return <StepSending />;
      case 6:
        return <StepReport />;
    }
  };

  return (
    <div className="w-full max-w-4xl mx-auto">
      <Stepper currentStep={state.currentStep} />
      <div className="bg-surface border border-border-subtle rounded-2xl p-6 sm:p-8">
        {renderStep()}
      </div>
    </div>
  );
}
