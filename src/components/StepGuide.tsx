import { useState } from "react";
import { Check, ChevronRight } from "lucide-react";

const STEPS = [
  {
    title: "Sciogliere il lievito",
    description: "Sciogliere il lievito fresco nell'acqua tiepida (25°C). Mescolare delicatamente e lasciar riposare 5 minuti.",
    icon: "🫧",
    tip: "L'acqua non deve superare i 30°C o ucciderai il lievito!",
  },
  {
    title: "Unire farina e sale",
    description: "In una ciotola capiente, mettere la farina e il sale. Creare una fontana al centro.",
    icon: "🌾",
    tip: "Usa farina 00 con W 260-300 per un risultato professionale.",
  },
  {
    title: "Impastare",
    description: "Versare l'acqua con il lievito nella fontana. Impastare energicamente per 15-20 minuti fino ad ottenere un impasto liscio e elastico.",
    icon: "🤲",
    tip: "L'impasto è pronto quando non si attacca più alle mani.",
  },
  {
    title: "Aggiungere l'olio",
    description: "A metà impasto, aggiungere l'olio extravergine d'oliva e continuare a lavorare fino ad assorbimento completo.",
    icon: "🫒",
    tip: "L'olio rende l'impasto più morbido e profumato.",
  },
  {
    title: "Prima lievitazione",
    description: "Coprire la ciotola con pellicola e lasciar lievitare. L'impasto deve raddoppiare di volume.",
    icon: "⏳",
    tip: "Usa il Timer Lievitazione per non dimenticarti!",
  },
  {
    title: "Formare i panetti",
    description: "Dividere l'impasto in panetti del peso desiderato. Formare delle sfere lisce piegando l'impasto verso il basso.",
    icon: "🍕",
    tip: "Pesali con una bilancia per panetti uniformi.",
  },
  {
    title: "Seconda lievitazione",
    description: "Disporre i panetti in un contenitore oleato, coprire e lasciar lievitare ancora 2-4 ore a temperatura ambiente.",
    icon: "✨",
    tip: "I panetti devono essere ben distanziati tra loro.",
  },
];

const StepGuide = () => {
  const [completedSteps, setCompletedSteps] = useState<number[]>([]);
  const [expandedStep, setExpandedStep] = useState(0);

  const toggleComplete = (index: number) => {
    setCompletedSteps((prev) =>
      prev.includes(index) ? prev.filter((s) => s !== index) : [...prev, index]
    );
  };

  return (
    <section className="px-4 py-8">
      <h2 className="text-2xl font-bold text-center mb-2">
        Guida Passo Passo
      </h2>
      <p className="text-center text-muted-foreground text-sm mb-6">
        {completedSteps.length}/{STEPS.length} completati
      </p>

      {/* Progress bar */}
      <div className="h-1.5 bg-secondary rounded-full mb-8 overflow-hidden">
        <div
          className="h-full bg-primary rounded-full transition-all duration-500"
          style={{ width: `${(completedSteps.length / STEPS.length) * 100}%` }}
        />
      </div>

      <div className="space-y-3">
        {STEPS.map((step, i) => {
          const isCompleted = completedSteps.includes(i);
          const isExpanded = expandedStep === i;

          return (
            <div
              key={i}
              className={`bg-card rounded-xl shadow-sm overflow-hidden transition-all ${
                isCompleted ? "opacity-60" : ""
              }`}
            >
              <button
                onClick={() => setExpandedStep(isExpanded ? -1 : i)}
                className="w-full flex items-center gap-3 p-4"
              >
                <span className="text-2xl">{step.icon}</span>
                <div className="flex-1 text-left">
                  <p className={`font-semibold text-sm ${isCompleted ? "line-through" : ""}`}>
                    {step.title}
                  </p>
                </div>
                <ChevronRight
                  className={`h-4 w-4 text-muted-foreground transition-transform ${
                    isExpanded ? "rotate-90" : ""
                  }`}
                />
              </button>

              {isExpanded && (
                <div className="px-4 pb-4">
                  <p className="text-sm text-muted-foreground mb-3 ml-9">
                    {step.description}
                  </p>
                  <div className="bg-secondary/50 rounded-lg p-3 ml-9 mb-3">
                    <p className="text-xs font-medium text-accent">
                      💡 {step.tip}
                    </p>
                  </div>
                  <button
                    onClick={() => toggleComplete(i)}
                    className={`ml-9 flex items-center gap-2 text-sm font-medium px-4 py-2 rounded-lg transition-all ${
                      isCompleted
                        ? "bg-primary/10 text-primary"
                        : "bg-secondary text-secondary-foreground"
                    }`}
                  >
                    <Check className="h-4 w-4" />
                    {isCompleted ? "Completato!" : "Segna come fatto"}
                  </button>
                </div>
              )}
            </div>
          );
        })}
      </div>
    </section>
  );
};

export default StepGuide;
