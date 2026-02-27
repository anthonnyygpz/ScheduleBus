"use client";

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
import { Trash2 } from "lucide-react";

interface Props {
  name: string;
  handleDelete: () => void;
}

export const DeleteEmployeeAlertDialog: React.FC<Props> = ({
  name,
  handleDelete,
}) => {
  return (
    <AlertDialog>
      {/* El Trigger es el botón que abre el modal */}
      <AlertDialogTrigger asChild>
        <Button
          variant="ghost"
          size="icon"
          className="h-7 w-7 opacity-0 group-hover:opacity-100 transition-opacity text-muted-foreground hover:text-destructive"
        >
          <Trash2 className="h-3.5 w-3.5" />
        </Button>
      </AlertDialogTrigger>
      <AlertDialogContent>
        <AlertDialogHeader>
          <AlertDialogTitle>¿Desactivar empleado?</AlertDialogTitle>

          <AlertDialogDescription>
            El registro de{" "}
            <span className="font-semibold text-foreground">{name}</span> se
            moverá al historial de bajas. Podrás consultarlo o reactivarlo
            después si es necesario.
          </AlertDialogDescription>
        </AlertDialogHeader>

        <AlertDialogFooter>
          <AlertDialogCancel>Cancelar</AlertDialogCancel>

          <AlertDialogAction
            onClick={handleDelete}
            className="bg-orange-600 hover:bg-orange-700 text-white"
          >
            Confirmar Baja
          </AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
};
