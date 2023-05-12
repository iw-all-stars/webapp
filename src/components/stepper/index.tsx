import React from "react";
import { Steps, Step } from "chakra-ui-steps";

interface stepsProps {
  steps: {
    title: string;
  }[];
  activeStep: number;
  setActiveStep: (index: number) => void;
}

export const Stepper = ({ steps, activeStep, setActiveStep }: stepsProps) => {
  return (
    <Steps
      orientation="horizontal"
      activeStep={activeStep}
      onClickStep={setActiveStep}
    >
      {steps.map((step, index) => (
        <Step
          key={index}
          onClick={() => setActiveStep(index)}
          label={step.title}
        />
      ))}
    </Steps>
  );
};

export default Stepper;
