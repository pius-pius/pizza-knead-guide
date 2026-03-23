import { useState, useEffect, useRef } from "react";
import { Play, Pause, RotateCcw } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useI18n } from "@/lib/i18n";

const RisingTimer = () => {
  const { t } = useI18n();

  const PRESETS = [
    { label: t("timer.rapida"), hours: 2, description: t("timer.temp_ambiente") },
    { label: t("timer.classica"), hours: 8, description: t("timer.temp_ambiente") },
    { label: t("timer.frigo_24"), hours: 24, description: t("timer.in_frigo") },
    { label: t("timer.frigo_48"), hours: 48, description: t("timer.in_frigo") },
  ];

  const [selectedPreset, setSelectedPreset] = useState(1);
  const [timeLeft, setTimeLeft] = useState(PRESETS[1].hours * 3600);
  const [isRunning, setIsRunning] = useState(false);
  const intervalRef = useRef<ReturnType<typeof setInterval> | null>(null);

  useEffect(() => {
    if (isRunning && timeLeft > 0) {
      intervalRef.current = setInterval(() => {
        setTimeLeft((t) => Math.max(0, t - 1));
      }, 1000);
    }
    return () => {
      if (intervalRef.current) clearInterval(intervalRef.current);
    };
  }, [isRunning, timeLeft]);

  useEffect(() => {
    if (timeLeft === 0 && isRunning) {
      setIsRunning(false);
    }
  }, [timeLeft, isRunning]);

  const selectPreset = (index: number) => {
    setSelectedPreset(index);
    setTimeLeft(PRESETS[index].hours * 3600);
    setIsRunning(false);
  };

  const reset = () => {
    setTimeLeft(PRESETS[selectedPreset].hours * 3600);
    setIsRunning(false);
  };

  const hours = Math.floor(timeLeft / 3600);
  const minutes = Math.floor((timeLeft % 3600) / 60);
  const seconds = timeLeft % 60;

  const totalSeconds = PRESETS[selectedPreset].hours * 3600;
  const progress = ((totalSeconds - timeLeft) / totalSeconds) * 100;

  return (
    <section className="px-4 py-8">
      <h2 className="text-2xl font-bold text-center mb-6">
        {t("timer.title")}
      </h2>

      {/* Presets */}
      <div className="grid grid-cols-2 gap-2 mb-8">
        {PRESETS.map((preset, i) => (
          <button
            key={i}
            onClick={() => selectPreset(i)}
            className={`rounded-xl p-3 text-left transition-all ${
              selectedPreset === i
                ? "bg-primary text-primary-foreground shadow-md"
                : "bg-card text-card-foreground shadow-sm"
            }`}
          >
            <p className="font-semibold text-sm">{preset.label}</p>
            <p className={`text-xs mt-0.5 ${selectedPreset === i ? "text-primary-foreground/70" : "text-muted-foreground"}`}>
              {preset.description}
            </p>
          </button>
        ))}
      </div>

      {/* Timer display */}
      <div className="relative flex justify-center mb-8">
        <div className="relative w-56 h-56">
          <svg className="w-full h-full -rotate-90" viewBox="0 0 100 100">
            <circle cx="50" cy="50" r="44" fill="none" stroke="hsl(var(--secondary))" strokeWidth="6" />
            <circle cx="50" cy="50" r="44" fill="none" stroke="hsl(var(--primary))" strokeWidth="6"
              strokeLinecap="round"
              strokeDasharray={`${2 * Math.PI * 44}`}
              strokeDashoffset={`${2 * Math.PI * 44 * (1 - progress / 100)}`}
              className="transition-all duration-1000" />
          </svg>
          <div className="absolute inset-0 flex flex-col items-center justify-center">
            <span className="text-4xl font-display font-bold tracking-tight">
              {String(hours).padStart(2, "0")}:{String(minutes).padStart(2, "0")}
            </span>
            <span className="text-lg text-muted-foreground font-mono">
              :{String(seconds).padStart(2, "0")}
            </span>
          </div>
        </div>
      </div>

      {/* Controls */}
      <div className="flex justify-center gap-4">
        <Button variant="outline" size="icon" className="h-14 w-14 rounded-full" onClick={reset}>
          <RotateCcw className="h-5 w-5" />
        </Button>
        <Button size="icon" className="h-14 w-14 rounded-full" onClick={() => setIsRunning(!isRunning)}>
          {isRunning ? <Pause className="h-6 w-6" /> : <Play className="h-6 w-6 ml-0.5" />}
        </Button>
      </div>
    </section>
  );
};

export default RisingTimer;
