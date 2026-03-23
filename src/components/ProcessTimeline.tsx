import { useState, useMemo, useCallback } from "react";
import { format, addHours, addMinutes } from "date-fns";
import { it } from "date-fns/locale";
import { Undo2 } from "lucide-react";
import { useI18n } from "@/lib/i18n";
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
  index: number;
  clickedAt: Date;
  originalTimes: Date[];
}

const ProcessTimeline = ({
  input,
  maturationMode,
  scheduleDate,
  scheduleHour,
  scheduleMinute,
}: ProcessTimelineProps) => {
  const { t, lang } = useI18n();
  const dateLocale = lang === "it" ? it : undefined;

  const result = useMemo(() => calculateDough(input), [input]);
  const steps = useMemo(() => generateProcess(input, result), [input, result]);

  // Translate step names and descriptions
  const translatedSteps = useMemo(() => {
    const stepNameMap: Record<string, { nameKey: string; descKey: string }> = {
      start: { nameKey: "step.start", descKey: "step.start_desc" },
      impasto: { nameKey: "step.impasto", descKey: "step.impasto_desc" },
      impasto2: { nameKey: "step.impasto2", descKey: "step.impasto2_desc" },
      pieghe1: { nameKey: "step.pieghe1", descKey: "step.pieghe1_desc" },
      pieghe2: { nameKey: "step.pieghe2", descKey: "step.pieghe2_desc" },
      pieghe3: { nameKey: "step.pieghe3", descKey: "step.pieghe3_desc" },
      frigo: { nameKey: "step.frigo", descKey: "step.frigo_desc" },
      staglio: { nameKey: "step.staglio", descKey: "step.staglio_desc_nap" },
      appretto: { nameKey: "step.appretto", descKey: "step.appretto_desc_nap" },
      puntata: { nameKey: "step.puntata", descKey: "step.puntata_desc" },
      cottura: { nameKey: "step.cottura", descKey: "step.cottura_desc" },
      stesura_teglia: { nameKey: "step.stesura_teglia", descKey: "step.stesura_teglia_desc" },
      lievitazione_teglia: { nameKey: "step.lievitazione_teglia", descKey: "step.lievitazione_teglia_desc" },
      cottura_teglia: { nameKey: "step.cottura_teglia", descKey: "step.cottura_teglia_desc" },
      fine: { nameKey: "step.fine", descKey: "step.fine_desc" },
    };

    return steps.map(step => {
      const mapping = stepNameMap[step.id];
      if (mapping) {
        return {
          ...step,
          name: t(mapping.nameKey as any),
          description: t(mapping.descKey as any),
        };
      }
      return step;
    });
  }, [steps, t]);

  const totalHours = useMemo(() => {
    if (steps.length === 0) return 0;
    const last = steps[steps.length - 1];
    return last.startOffset + last.durationHours;
  }, [steps]);

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

  const [clickedStep, setClickedStep] = useState<ClickedStep | null>(null);

  const stepTimes = useMemo((): Date[] => {
    const times: Date[] = steps.map(s => addHours(baseStartTime, s.startOffset));
    if (clickedStep) {
      const now = clickedStep.clickedAt;
      let currentTime = now;
      for (let j = clickedStep.index + 1; j < steps.length; j++) {
        times[j] = currentTime;
        currentTime = addMinutes(currentTime, steps[j].durationHours * 60);
      }
    }
    return times;
  }, [steps, baseStartTime, clickedStep]);

  const handleStepClick = useCallback((index: number) => {
    if (clickedStep?.index === index) return;
    const originalTimes = steps.map(s => addHours(baseStartTime, s.startOffset));
    if (clickedStep) {
      const now = clickedStep.clickedAt;
      let currentTime = now;
      for (let j = clickedStep.index + 1; j < steps.length; j++) {
        originalTimes[j] = currentTime;
        currentTime = addMinutes(currentTime, steps[j].durationHours * 60);
      }
    }
    setClickedStep({ index, clickedAt: new Date(), originalTimes });
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
    format(date, "HH:mm", { locale: dateLocale });

  const formatDateTime = (date: Date): string =>
    format(date, "EEE dd/MM HH:mm", { locale: dateLocale });

  const isMultiDay = totalHours > 24;
  const fmt = isMultiDay ? formatDateTime : formatTime;

  const endTime = stepTimes.length > 0
    ? addMinutes(stepTimes[stepTimes.length - 1], steps[steps.length - 1].durationHours * 60)
    : addHours(baseStartTime, totalHours);

  return (
    <section className="px-4 py-6">
      <h2 className="text-2xl font-bold text-center mb-2">{t("proc.title")}</h2>
      <p className="text-center text-muted-foreground text-sm mb-1">
        {t("proc.tempo_totale")}: ~{formatDuration(totalHours)}
      </p>
      <p className="text-center text-xs text-primary font-medium mb-6">
        {t("proc.inizio")}: {formatDateTime(stepTimes[0] || baseStartTime)} → {t("proc.fine")}: {formatDateTime(endTime)}
      </p>

      <div className="relative">
        <div className="absolute left-5 top-0 bottom-0 w-0.5 bg-border" />

        <div className="space-y-0">
          {translatedSteps.map((step, i) => {
            const completed = isCompleted(i);
            const stepStart = stepTimes[i];
            const stepEnd = addMinutes(stepStart, steps[i].durationHours * 60);
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
                              {t("proc.annulla")}
                            </button>
                          )}
                          <span className="text-[10px] text-muted-foreground font-mono whitespace-nowrap">
                            {startStr}
                          </span>
                        </div>
                      </div>
                      {steps[i].durationHours > 0 && (
                        <p className="text-[10px] text-primary font-medium mt-0.5">
                          ⏱ {formatDuration(steps[i].durationHours)}
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
