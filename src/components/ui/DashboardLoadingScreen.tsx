import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Check } from "lucide-react";
import { Progress } from "@/components/ui/progress";

interface DashboardLoadingScreenProps {
  title: string;
  steps: string[];
}

export function DashboardLoadingScreen({ title, steps }: DashboardLoadingScreenProps) {
  const [currentStep, setCurrentStep] = useState(0);
  const [displayedPercent, setDisplayedPercent] = useState(0);

  const targetPercent = Math.min(Math.round(((currentStep + 1) / steps.length) * 95), 95);

  // Advance steps every ~800ms
  useEffect(() => {
    if (currentStep >= steps.length - 1) return;
    const timer = setTimeout(() => setCurrentStep((s) => s + 1), 800);
    return () => clearTimeout(timer);
  }, [currentStep, steps.length]);

  // Smooth percentage counter
  useEffect(() => {
    if (displayedPercent >= targetPercent) return;
    const timer = setTimeout(
      () => setDisplayedPercent((p) => Math.min(p + 1, targetPercent)),
      20
    );
    return () => clearTimeout(timer);
  }, [displayedPercent, targetPercent]);

  return (
    <div className="min-h-screen bg-background flex items-center justify-center p-4">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4 }}
        className="w-full max-w-md"
      >
        <div className="bg-card border border-border rounded-xl shadow-lg p-8 space-y-6">
          {/* Title */}
          <div className="text-center space-y-1">
            <h2 className="text-lg font-semibold text-foreground">{title}</h2>
            <p className="text-xs text-muted-foreground">Preparing your data</p>
          </div>

          {/* Progress bar + percentage */}
          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <span className="text-xs text-muted-foreground">Loading</span>
              <motion.span
                key={displayedPercent}
                className="text-sm font-mono font-semibold text-primary"
              >
                {displayedPercent}%
              </motion.span>
            </div>
            <Progress value={displayedPercent} className="h-2" />
          </div>

          {/* Steps */}
          <div className="space-y-1.5 max-h-48 overflow-y-auto pr-1">
            <AnimatePresence mode="popLayout">
              {steps.map((step, i) => {
                if (i > currentStep) return null;
                const isActive = i === currentStep;
                const isDone = i < currentStep;

                return (
                  <motion.div
                    key={step}
                    initial={{ opacity: 0, x: -8 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ duration: 0.25 }}
                    className="flex items-center gap-2.5 py-1"
                  >
                    {/* Icon */}
                    {isDone ? (
                      <div className="h-4 w-4 rounded-full bg-status-success/20 flex items-center justify-center flex-shrink-0">
                        <Check className="h-2.5 w-2.5 text-status-success" />
                      </div>
                    ) : (
                      <div className="h-4 w-4 flex items-center justify-center flex-shrink-0">
                        <span className="h-2 w-2 rounded-full bg-primary animate-pulse" />
                      </div>
                    )}

                    {/* Label */}
                    <span
                      className={`text-sm ${
                        isDone
                          ? "text-muted-foreground"
                          : isActive
                          ? "text-foreground font-medium"
                          : "text-muted-foreground"
                      }`}
                    >
                      {step}
                    </span>
                  </motion.div>
                );
              })}
            </AnimatePresence>
          </div>
        </div>
      </motion.div>
    </div>
  );
}
