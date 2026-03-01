import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";
import { Button } from "@/components/ui/button";
import {
  AlertCircle,
  ChevronLeft,
  ChevronRight,
  Download,
  RefreshCw,
} from "lucide-react";
import { useTableSchedule } from "../hooks/useTableSchedule";
import { useGenerateSchedule } from "../hooks/useGenerateSchedule";
import { useState } from "react";
import { ScheduleResponseDto } from "@/application/dtos/schedule.dto";
import { cn } from "@/lib/utils";
import { useScheduleDerivedData } from "../hooks/useScheduleDerivedData";
import { GroupResponseDto } from "@/application/dtos/group.dto";

interface Props {
  schedule?: ScheduleResponseDto;
  groups: GroupResponseDto[];
}

const ToolbarSchedule: React.FC<Props> = ({ schedule, groups }) => {
  const [weekOffset, setWeekOffset] = useState<number>(0);

  const { handleDownloadPDF, exporting } = useTableSchedule(schedule);
  const { handleGenerate, isGenerating } = useGenerateSchedule(weekOffset);
  const { startDate } = useScheduleDerivedData(schedule, groups);

  return (
    <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
      <div className="flex items-center gap-2">
        <Button
          variant="ghost"
          size="icon"
          onClick={() => setWeekOffset((p) => p - 1)}
        >
          <ChevronLeft className="h-4 w-4" />
        </Button>
        <span className="text-xs font-medium w-28 text-center">
          {weekOffset === 0
            ? "Semana Actual"
            : `Semana ${weekOffset > 0 ? "+" : ""}${weekOffset}`}
        </span>
        <Button
          variant="ghost"
          size="icon"
          onClick={() => setWeekOffset((p) => p + 1)}
        >
          <ChevronRight className="h-4 w-4" />
        </Button>

        {/* Botón de Exportar PDF */}
        <Button
          variant="outline"
          size="sm"
          onClick={handleDownloadPDF}
          disabled={exporting || !schedule}
          className="ml-2"
        >
          <Download
            className={cn("mr-2 h-4 w-4", exporting && "animate-pulse")}
          />
          {exporting ? "Procesando..." : "Exportar PDF"}
        </Button>

        <AlertDialog>
          <AlertDialogTrigger asChild>
            <Button
              disabled={isGenerating}
              size="sm"
              className="shadow-lg border-primary/50 hover:bg-primary/5"
            >
              <RefreshCw
                className={cn("mr-2 h-4 w-4", isGenerating && "animate-spin")}
              />
              Re-optimizar Rutas
            </Button>
          </AlertDialogTrigger>

          <AlertDialogContent>
            <AlertDialogHeader>
              <AlertDialogTitle className="flex items-center gap-2">
                <AlertCircle className="h-5 w-5 text-destructive" />
                ¿Confirmar Re-optimización?
              </AlertDialogTitle>
              <AlertDialogDescription>
                Esta acción **borrará el horario actual** de la semana del{" "}
                {startDate.toLocaleDateString()} y generará uno nuevo desde
                cero. Esta operación no se puede deshacer.
              </AlertDialogDescription>
            </AlertDialogHeader>
            <AlertDialogFooter>
              <AlertDialogCancel>Cancelar</AlertDialogCancel>
              <AlertDialogAction
                onClick={handleGenerate}
                className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
              >
                Sí, re-optimizar todo
              </AlertDialogAction>
            </AlertDialogFooter>
          </AlertDialogContent>
        </AlertDialog>
      </div>
    </div>
  );
};

export default ToolbarSchedule;
