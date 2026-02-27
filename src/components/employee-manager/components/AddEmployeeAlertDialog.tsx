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
} from "@/components/ui/alert-dialog";
import { Upload, CheckCircle2 } from "lucide-react";
import { useState, useRef } from "react";
import { cn } from "@/lib/utils";
import { useCreateEmployeeByTextPlain } from "../hooks/useCreateEmployeeByTextPlain";

interface Props {
  setPendingFileContent: (content: string | null) => void;
  setShowConfirmUpload: (show: boolean) => void;
  pendingFileContent: string | null;
  showConfirmUpload: boolean;
  confirmUpload: () => Promise<void>;
}

export const AddEmployeeAlertDialog: React.FC<Props> = ({
  setPendingFileContent,
  setShowConfirmUpload,
  pendingFileContent,
  showConfirmUpload,
  confirmUpload,
}) => {
  const [loading, setLoading] = useState(false);
  const [isDragging, setIsDragging] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const { register, handleSubmit } = useCreateEmployeeByTextPlain();

  const handleFile = async (file: File) => {
    if (file.name.endsWith(".csv") || file.name.endsWith(".txt")) {
      const text = await file.text();
      setPendingFileContent(text);
    } else {
      alert("Por favor, sube solo archivos .csv o .txt");
    }
  };

  const onDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(true);
  };

  const onDragLeave = () => setIsDragging(false);

  const onDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
    const file = e.dataTransfer.files[0];
    if (file) handleFile(file);
  };

  return (
    <form onSubmit={handleSubmit}>
      <AlertDialog open={showConfirmUpload} onOpenChange={setShowConfirmUpload}>
        <AlertDialogContent className="sm:max-w-125">
          <AlertDialogHeader>
            <AlertDialogTitle>Importar Empleados</AlertDialogTitle>
            <AlertDialogDescription>
              Sigue el formato:{" "}
              <code className="text-orange-500 font-bold italic">
                Nombre | Grupo | Ruta1, Ruta2
              </code>
            </AlertDialogDescription>
          </AlertDialogHeader>

          {/* Zona de Drop / Click */}
          <div
            onDragOver={onDragOver}
            onDragLeave={onDragLeave}
            onDrop={onDrop}
            onClick={() => fileInputRef.current?.click()}
            className={cn(
              "group relative flex cursor-pointer flex-col items-center justify-center gap-4 rounded-lg border-2 border-dashed p-8 transition-colors",
              isDragging
                ? "border-primary bg-primary/5"
                : "border-muted-foreground/25 hover:border-primary/50 hover:bg-muted/50",
              pendingFileContent && "border-green-500/50 bg-green-500/5",
            )}
          >
            <input
              type="file"
              ref={fileInputRef}
              onChange={(e) =>
                e.target.files?.[0] && handleFile(e.target.files[0])
              }
              accept=".csv,.txt"
              className="hidden"
            />

            {pendingFileContent ? (
              <div className="flex flex-col items-center text-center">
                <CheckCircle2 className="size-10 text-green-500 mb-2" />
                <p className="text-sm font-medium text-foreground">
                  ¡Archivo cargado!
                </p>
                <p className="text-xs text-muted-foreground">
                  Listo para procesar
                </p>
              </div>
            ) : (
              <div className="flex flex-col items-center text-center">
                <Upload
                  className={cn(
                    "size-10 mb-2 transition-transform",
                    isDragging
                      ? "scale-110 text-primary"
                      : "text-muted-foreground group-hover:text-primary",
                  )}
                />
                <p className="text-sm font-medium">Arrastra tu archivo aquí</p>
                <p className="text-xs text-muted-foreground">
                  o haz clic para buscar en tus carpetas (.csv, .txt)
                </p>
              </div>
            )}
          </div>

          <AlertDialogFooter>
            <AlertDialogCancel
              onClick={() => {
                setPendingFileContent(null);
                setIsDragging(false);
              }}
            >
              Cancelar
            </AlertDialogCancel>
            <AlertDialogAction
              onClick={confirmUpload}
              disabled={!pendingFileContent || loading}
              className="bg-primary text-primary-foreground"
            >
              {loading ? "Procesando..." : "Confirmar e Importar"}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </form>
  );
};
