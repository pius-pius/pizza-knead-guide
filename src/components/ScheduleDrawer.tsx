import { useState } from "react";
import { CalendarIcon, Check } from "lucide-react";
import { format } from "date-fns";
import { it } from "date-fns/locale";
import { Button } from "@/components/ui/button";
import { Calendar } from "@/components/ui/calendar";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Drawer, DrawerContent, DrawerHeader, DrawerTitle, DrawerFooter } from "@/components/ui/drawer";
import { cn } from "@/lib/utils";
import type { MaturationMode } from "@/pages/Index";

interface ScheduleDrawerProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  maturationMode: MaturationMode;
  setMaturationMode: (m: MaturationMode) => void;
  scheduleDate?: Date;
  setScheduleDate: (d: Date | undefined) => void;
  scheduleHour: number;
  setScheduleHour: (n: number) => void;
  scheduleMinute: number;
  setScheduleMinute: (n: number) => void;
  processDuration: number;
}

const ScheduleDrawer = ({
  open, onOpenChange,
  maturationMode, setMaturationMode,
  scheduleDate, setScheduleDate,
  scheduleHour, setScheduleHour,
  scheduleMinute, setScheduleMinute,
  processDuration,
}: ScheduleDrawerProps) => {
  return (
    <Drawer open={open} onOpenChange={onOpenChange}>
      <DrawerContent className="max-h-[85vh]">
        <DrawerHeader className="pb-2">
          <DrawerTitle className="text-center text-base">
            {maturationMode === "quando_inizio" ? "Quando vuoi iniziare?" : "Quando vuoi mangiare?"}
          </DrawerTitle>
        </DrawerHeader>
        <div className="px-4 space-y-4 pb-2">
          <div>
            <p className="text-xs text-muted-foreground mb-1.5">
              {maturationMode === "quando_inizio" ? "Giorno di inizio" : "Giorno in cui mangio"}
            </p>
            <Popover>
              <PopoverTrigger asChild>
                <Button
                  variant="outline"
                  className={cn(
                    "w-full justify-start text-left font-medium text-sm rounded-xl",
                    !scheduleDate && "text-muted-foreground"
                  )}
                >
                  <CalendarIcon className="h-4 w-4 mr-2" />
                  {scheduleDate
                    ? format(scheduleDate, "EEEE d MMMM yyyy", { locale: it })
                    : "Scegli il giorno"}
                </Button>
              </PopoverTrigger>
              <PopoverContent className="w-auto p-0" align="start">
                <Calendar
                  mode="single"
                  selected={scheduleDate}
                  onSelect={setScheduleDate}
                  initialFocus
                  className="p-3 pointer-events-auto"
                />
              </PopoverContent>
            </Popover>
          </div>
          <div>
            <p className="text-xs text-muted-foreground mb-1.5">
              {maturationMode === "quando_inizio" ? "Ora di inizio" : "Ora di cottura"}
            </p>
            <div className="flex gap-2 items-center">
              <select
                value={scheduleHour}
                onChange={(e) => setScheduleHour(Number(e.target.value))}
                className="flex-1 bg-secondary rounded-xl px-3 py-2.5 text-sm font-semibold text-foreground outline-none appearance-none text-center"
              >
                {Array.from({ length: 24 }, (_, i) => (
                  <option key={i} value={i}>{String(i).padStart(2, "0")}</option>
                ))}
              </select>
              <span className="text-lg font-bold text-muted-foreground">:</span>
              <select
                value={scheduleMinute}
                onChange={(e) => setScheduleMinute(Number(e.target.value))}
                className="flex-1 bg-secondary rounded-xl px-3 py-2.5 text-sm font-semibold text-foreground outline-none appearance-none text-center"
              >
                {[0, 15, 30, 45].map((m) => (
                  <option key={m} value={m}>{String(m).padStart(2, "0")}</option>
                ))}
              </select>
            </div>
          </div>

          {scheduleDate && (() => {
            const scheduled = new Date(scheduleDate);
            scheduled.setHours(scheduleHour, scheduleMinute, 0, 0);
            const isInizio = maturationMode === "quando_inizio";
            const targetTime = isInizio
              ? new Date(scheduled.getTime() + processDuration * 3600 * 1000)
              : new Date(scheduled.getTime() - processDuration * 3600 * 1000);
            return (
              <div className="bg-primary/5 rounded-xl p-3 border border-primary/10">
                <div className="flex items-center justify-between">
                  <p className="text-xs text-muted-foreground">Durata processo</p>
                  <span className="text-sm font-bold text-primary">{Math.round(processDuration)}h</span>
                </div>
                <p className="text-[10px] text-muted-foreground mt-1">
                  {isInizio
                    ? `Pronto ${format(targetTime, "EEEE d/MM 'alle' HH:mm", { locale: it })}`
                    : `Inizia preparazione ${format(targetTime, "EEEE d/MM 'alle' HH:mm", { locale: it })}`}
                </p>
              </div>
            );
          })()}
        </div>
        <DrawerFooter className="pt-2">
          <Button className="w-full rounded-xl h-11 font-bold" onClick={() => onOpenChange(false)}>
            <Check className="h-4 w-4 mr-2" /> Conferma
          </Button>
        </DrawerFooter>
      </DrawerContent>
    </Drawer>
  );
};

export default ScheduleDrawer;
