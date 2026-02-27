"use client";

import { DeleteEmployeeAlertDialog } from "./components/DeleteEmployeeAlertDialog";
import { Button } from "@/components/ui/button";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  // Upload,
  UserPlus,
} from "lucide-react";
import { useState } from "react";
// import { mutate } from "swr";
import { Badge } from "../ui/badge";
import { AddEmployeeCard } from "./components/AddEmployeeCard";
import { useEmployees } from "./hooks/useEmployees";
import { EmployeeResponseDto } from "@/application/dtos/employee.dto";
import { useDeleteEmployee } from "./hooks/useDeleteEmployee";
import { EditEmployeeAlertDialog } from "./components/EditEmployeeAlertDialog";
// import { useToast } from "@/hooks/use-toast";
// import { AddEmployeeAlertDialog } from "./components/AddEmployeeAlertDialog";

export function EmployeeManager() {
  const { data: employees, error } = useEmployees();
  const { handleDelete } = useDeleteEmployee();
  // const { toast } = useToast();

  const [showAddForm, setShowAddForm] = useState(false);
  // const [loading, setLoading] = useState(false);
  // const [pendingFileContent, setPendingFileContent] = useState<string | null>(
  //   null,
  // );
  // const [showConfirmUpload, setShowConfirmUpload] = useState<boolean>(false);

  // const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
  //   const file = e.target.files?.[0];
  //   if (!file) return;
  //
  //   if (file.name.endsWith(".csv") || file.name.endsWith(".txt")) {
  //     const text = await file.text();
  //     setPendingFileContent(text); // Guardamos el contenido
  //     setShowConfirmUpload(true); // Abrimos el diálogo de confirmación
  //   } else {
  //     toast({
  //       title: "Formato no válido",
  //       description: "Por favor sube solo archivos .csv o .txt",
  //       variant: "destructive",
  //     });
  //   }
  //   e.target.value = ""; // Reset del input
  // };

  // const confirmUpload = async () => {
  //   if (!pendingFileContent) return;
  //   setLoading(true);
  //   try {
  //     const response = await fetch("/api/employees", {
  //       method: "POST",
  //       headers: { "Content-Type": "application/json" },
  //       body: JSON.stringify({ type: "text", data: pendingFileContent }),
  //     });
  //
  //     if (!response.ok) throw new Error("Error en el servidor");
  //
  //     toast({
  //       title: "Importación exitosa",
  //       variant: "success",
  //     });
  //     mutate("/api/employees");
  //   } catch (error: any) {
  //     toast({
  //       title: "Error",
  //       description: error.message,
  //       variant: "destructive",
  //     });
  //   } finally {
  //     setLoading(false);
  //     setShowConfirmUpload(false);
  //     setPendingFileContent(null);
  //   }
  // };

  if (error) {
    return (
      <div className="py-20 text-center text-muted-foreground">
        Error al cargar empleados
      </div>
    );
  }

  if (!employees) {
    return (
      <div className="flex items-center justify-center py-20">
        <div className="flex items-center gap-2 text-muted-foreground">
          <div className="h-4 w-4 animate-spin rounded-full border-2 border-primary border-t-transparent" />
          Cargando empleados...
        </div>
      </div>
    );
  }

  return (
    <div className="flex h-full flex-col gap-3">
      {/* Toolbar */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <h2 className="text-sm font-semibold text-foreground 2xl:text-base">
            Empleados
          </h2>
          <span className="text-xs text-muted-foreground 2xl:text-sm">
            {employees.length} registrados
          </span>
        </div>
        <div className="flex gap-2">
          <Button
            variant="outline"
            size="sm"
            onClick={() => setShowAddForm(true)}
            className="gap-1.5 text-xs h-8 cursor-pointer"
          >
            <UserPlus className="h-3.5 w-3.5" />
            Agregar
          </Button>
          {/* <label> */}
          {/*   <Button */}
          {/*     variant="outline" */}
          {/*     size="sm" */}
          {/*     className="gap-1.5 text-xs h-8 cursor-pointer" */}
          {/*     onClick={() => setShowConfirmUpload(true)} */}
          {/*     asChild */}
          {/*   > */}
          {/*     <span> */}
          {/*       <Upload className="h-3.5 w-3.5" /> */}
          {/*       Archivo */}
          {/*     </span> */}
          {/*   </Button> */}
          {/* </label> */}
        </div>
      </div>

      {/* Add Employee Form */}
      {showAddForm && (
        <AddEmployeeCard onCloseForm={() => setShowAddForm(false)} />
      )}

      {/* Employees Table */}
      <div className="flex-1 overflow-auto rounded-lg border border-border bg-card">
        <Table>
          <TableHeader className="sticky top-0 z-10 bg-card">
            <TableRow className="border-border hover:bg-transparent">
              <TableHead className="text-[11px] font-semibold text-muted-foreground 2xl:text-xs">
                Nombre
              </TableHead>
              <TableHead className="text-[11px] font-semibold text-muted-foreground 2xl:text-xs">
                Grupo
              </TableHead>
              <TableHead className="text-[11px] font-semibold text-muted-foreground 2xl:text-xs">
                Max h/dia
              </TableHead>
              <TableHead className="text-[11px] font-semibold text-muted-foreground 2xl:text-xs">
                Rutas
              </TableHead>
              <TableHead className="text-[11px] font-semibold text-muted-foreground 2xl:text-xs w-10">
                <span className="sr-only">Acciones</span>
              </TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {employees.map((emp: EmployeeResponseDto) => (
              <TableRow key={emp.id} className="border-border/50 group">
                <TableCell className="py-2">
                  <span className="text-xs font-medium text-foreground 2xl:text-sm">
                    {emp.name}
                  </span>
                </TableCell>
                <TableCell className="py-2">
                  <span className="text-xs text-foreground 2xl:text-sm">
                    {emp.group.name}
                  </span>
                </TableCell>

                <TableCell className="py-2">
                  <span className="font-mono text-xs text-muted-foreground 2xl:text-sm">
                    {emp.group.hours} h/dia
                  </span>
                </TableCell>
                <TableCell className="py-2">
                  <div className="flex flex-wrap gap-1">
                    {emp.routes.map((route) => (
                      <Badge variant="outline" key={route.id}>
                        {route.name}
                      </Badge>
                    ))}
                  </div>
                </TableCell>

                <TableCell className="flex flex-row py-2 gap-2">
                  <EditEmployeeAlertDialog employee={emp} />
                  <DeleteEmployeeAlertDialog
                    handleDelete={() => handleDelete(emp.id)}
                    name={emp.name}
                  />
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>

      {/* <AddEmployeeAlertDialog */}
      {/*   setPendingFileContent={setPendingFileContent} */}
      {/*   setShowConfirmUpload={setShowConfirmUpload} */}
      {/*   pendingFileContent={pendingFileContent} */}
      {/*   showConfirmUpload={showConfirmUpload} */}
      {/*   confirmUpload={confirmUpload} */}
      {/* /> */}
    </div>
  );
}
