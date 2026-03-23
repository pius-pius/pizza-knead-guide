import { useState, useMemo, useCallback } from "react";
import { format, addHours, addMinutes } from "date-fns";
import { it } from "date-fns/locale";
import { Undo2 } from "lucide-react";
import {
  calculateDough,
  generateProcess,
  type DoughInput,
  type ProcessStep,
} from "@/lib/dough-calculator";
import type { MaturationMode } from "@/pages/Index";

interface ProcessTimelineProps {
  input: DoughInput;
  maturationMode: MaturationMode;
  scheduleDate?: Date;
  scheduleHour: number;
  scheduleMinute: number;
}

interface ClickedStep {
  /** Index of the step that was clicked */
  index: number;
  /** Timestamp when the user clicked (= "step just completed") */
  clickedAt: Date;
  /** Original scheduled times for all steps from this index onward, for undo */
  originalTimes: Date[];
}

const ProcessTimeline = ({
  input,
  maturationMode,
  scheduleDate,
  scheduleHour,
  scheduleMinute,
}: ProcessTimelineProps) => {
  const result = useMemo(() => calculateDough(input), [input]);
  const steps = useMemo(() => generateProcess(input, result), [input, result]);

  const totalHours = useMemo(() => {
    if (steps.length === 0) return 0;
    const last = steps[steps.length - 1];
    return last.startOffset + last.durationHours;
  }, [steps]);

  // Calculate the base start time (before any clicks)
  const baseStartTime = useMemo((): Date => {
    if (scheduleDate) {
      const scheduled = new Date(scheduleDate);
      scheduled.setHours(scheduleHour, scheduleMinute, 0, 0);
      if (maturationMode === "quando_mangio") {
        return addHours(scheduled, -totalHours);
      } else {
        return scheduled;
      }
    }
    return new Date();
  }, [maturationMode, scheduleDate, scheduleHour, scheduleMinute, totalHours]);

  // Track clicked steps for progress & time recalc
  const [clickedStep, setClickedStep] = useState<ClickedStep | null>(null);

  // Calculate actual times for each step, considering clicks
  const stepTimes = useMemo((): Date[] => {
    const times: Date[] = steps.map(s => addHours(baseStartTime, s.startOffset));

    if (clickedStep) {
      // From clickedStep.index + 1 onward, recalculate based on now
      const now = clickedStep.clickedAt;
      // The next step starts at now (the clicked step was just completed)
      let currentTime = now;
      for (let j = clickedStep.index + 1; j < steps.length; j++) {
        times[j] = currentTime;
        currentTime = addMinutes(currentTime, steps[j].durationHours * 60);
      }
    }

    return times;
  }, [steps, baseStartTime, clickedStep]);

  const handleStepClick = useCallback((index: number) => {
    if (clickedStep?.index === index) return; // already clicked, use undo button

    // Save original times for undo
    const originalTimes = steps.map(s => addHours(baseStartTime, s.startOffset));
    if (clickedStep) {
      // Recalc with current click state for proper undo
      const now = clickedStep.clickedAt;
      let currentTime = now;
      for (let j = clickedStep.index + 1; j < steps.length; j++) {
        originalTimes[j] = currentTime;
        currentTime = addMinutes(currentTime, steps[j].durationHours * 60);
      }
    }

    setClickedStep({
      index,
      clickedAt: new Date(),
      originalTimes,
    });
  }, [clickedStep, steps, baseStartTime]);

  const handleUndo = useCallback((e: React.MouseEvent) => {
    e.stopPropagation();
    setClickedStep(null);
  }, []);

  const isCompleted = (index: number): boolean => {
    if (!clickedStep) return false;
    return index <= clickedStep.index;
  };

  const formatDuration = (hours: number): string => {
    if (hours === 0) return "";
    if (hours < 1) return `${Math.round(hours * 60)} min`;
    const h = Math.floor(hours);
    const m = Math.round((hours - h) * 60);
    return m > 0 ? `${h}h ${m}min` : `${h}h`;
  };

  const formatTime = (date: Date): string =>
    format(date, "HH:mm", { locale: it });

  const formatDateTime = (date: Date): string =>
    format(date, "EEE dd/MM HH:mm", { locale: it });

  const isMultiDay = totalHours > 24;
  const fmt = isMultiDay ? formatDateTime : formatTime;

  const endTime = stepTimes.length > 0
    ? addMinutes(stepTimes[stepTimes.length - 1], steps[steps.length - 1].durationHours * 60)
    : addHours(baseStartTime, totalHours);

  return (
    <section className="px-4 py-6">
      <h2 className="text-2xl font-bold text-center mb-2">Processo</h2>
      <p className="text-center text-muted-foreground text-sm mb-1">
        Tempo totale: ~{formatDuration(totalHours)}
      </p>
      <p className="text-center text-xs text-primary font-medium mb-6">
        Inizio: {formatDateTime(stepTimes[0] || baseStartTime)} → Fine: {formatDateTime(endTime)}
      </p>

      <div className="relative">
        <div className="absolute left-5 top-0 bottom-0 w-0.5 bg-border" />

        <div className="space-y-0">
          {steps.map((step, i) => {
            const completed = isCompleted(i);
            const stepStart = stepTimes[i];
            const stepEnd = addMinutes(stepStart, step.durationHours * 60);
            const startStr = fmt(stepStart);
            const endStr = fmt(stepEnd);
            const isClickedStep = clickedStep?.index === i;

            return (
              <div
                key={`${step.id}-${i}`}
                className={`relative pl-12 pb-6 cursor-pointer transition-opacity ${
                  completed ? "opacity-40" : "opacity-100"
                }`}
                onClick={() => handleStepClick(i)}
              >
                <div
                  className={`absolute left-3.5 top-1 w-3.5 h-3.5 rounded-full border-2 border-background shadow-sm ${
                    completed ? "bg-muted-foreground" : "bg-primary"
                  }`}
                />

                <div className={`bg-card rounded-xl p-4 shadow-sm ${
                  completed ? "border border-muted" : ""
                }`}>
                  <div className="flex items-start gap-2">
                    <span className="text-xl">{step.icon}</span>
                    <div className="flex-1">
                      <div className="flex items-center justify-between">
                        <p className="font-semibold text-sm">{step.name}</p>
                        <div className="flex items-center gap-1.5">
                          {isClickedStep && (
                            <button
                              onClick={handleUndo}
                              className="flex items-center gap-0.5 text-[10px] text-destructive font-medium hover:underline"
                            >
                              <Undo2 className="h-3 w-3" />
                              Annulla
                            </button>
                          )}
                          <span className="text-[10px] text-muted-foreground font-mono whitespace-nowrap">
                            {startStr}
                          </span>
                        </div>
                      </div>
                      {step.durationHours > 0 && (
                        <p className="text-[10px] text-primary font-medium mt-0.5">
                          ⏱ {formatDuration(step.durationHours)}
                          {startStr !== endStr && (
                            <span className="text-muted-foreground ml-1">
                              ({startStr} → {endStr})
                            </span>
                          )}
                        </p>
                      )}
                      <p className="text-xs text-muted-foreground mt-1.5 leading-relaxed">
                        {step.description}
                      </p>
                    </div>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
};

export default ProcessTimeline;
