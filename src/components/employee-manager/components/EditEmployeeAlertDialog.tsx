"use client";

import { EmployeeResponseDto } from "@/application/dtos/employee.dto";
import { useGroups } from "@/components/group-manager";
import { useRoutes } from "@/components/route-manager/hooks/useRoutes";
import {
  AlertDialog,
  AlertDialogContent,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { MultiSelect } from "@/components/ui/multi-select";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Edit } from "lucide-react";
import { Controller } from "react-hook-form";
import { useUpdateEmployee } from "../hooks/useUpdateEmployee";

import { useState } from "react";

interface Props {
  employee?: EmployeeResponseDto;
}

const EditEmployeeForm = ({
  employee,
  onSuccess,
}: {
  employee: EmployeeResponseDto;
  onSuccess: () => void;
}) => {
  const {
    register,
    handleSubmit,
    onSubmit: baseOnSubmit,
    control,
    formState: { isSubmitting },
    reset,
  } = useUpdateEmployee(employee);

  const { routeOptions } = useRoutes();
  const { groupOptions } = useGroups();

  const onSubmit = async (data: any) => {
    await baseOnSubmit(data);
    onSuccess();
  };

  return (
    <>
      <AlertDialogHeader>
        <AlertDialogTitle>Editar empleado</AlertDialogTitle>

        <form
          onSubmit={handleSubmit(onSubmit)}
          id="edit-employee"
          className="flex flex-col gap-2"
        >
          <div className="space-y-1">
            <Label
              htmlFor="name"
              className="text-xs text-foreground"
              title="Nombre completo del empleado ejem. Carlos Martinez"
            >
              Nombre completo
            </Label>
            <Input className="text-sm text-foreground" {...register("name")} />
          </div>

          <div className="space-y-1">
            <Label
              htmlFor="group"
              className="text-xs text-foreground"
              title="Grupo al que pertece el empleado ejem(A,B o C)"
            >
              Grupo
            </Label>
            <Controller
              name="groupId"
              control={control}
              rules={{ required: "El grupo es obligatorio" }}
              render={({ field }) => (
                <Select onValueChange={field.onChange} value={field.value}>
                  <SelectTrigger className="w-full">
                    <SelectValue placeholder="Selecciona un grupo..." />
                  </SelectTrigger>
                  <SelectContent>
                    {groupOptions.map((group) => (
                      <SelectItem key={group.value} value={group.value}>
                        {group.label} ({group.hours} h/dia)
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              )}
            />
          </div>

          <div className="space-y-1">
            <Label
              htmlFor="phone"
              className="text-xs text-foreground"
              title="Numero de telefono del empleado ejem. 123456789"
            >
              Numero de telefono
            </Label>
            <Input
              className="text-sm text-foreground"
              placeholder="123456789"
              {...register("phone")}
            />
          </div>
          <div className="space-y-1">
            <Label
              htmlFor="email"
              className="text-xs text-foreground"
              title="Correo electronico del empleado ejem. ejemplo@ejemplo.com"
            >
              Correo Electronico
            </Label>
            <Input
              className="text-sm text-foreground"
              placeholder="ejemplo@ejemplo.com"
              {...register("email")}
            />
          </div>
          <div className="space-y-1">
            <Label
              htmlFor="routes"
              className="text-xs text-foreground"
              title="Rutas asignadas al empleado"
            >
              Rutas
            </Label>
            <Controller
              name="routeIds"
              control={control}
              render={({ field }) => (
                <MultiSelect
                  options={routeOptions}
                  selected={field.value}
                  onChange={field.onChange}
                  placeholder="Selecciona una ruta..."
                />
              )}
            />
          </div>
        </form>
      </AlertDialogHeader>
      <AlertDialogFooter>
        <Button
          onClick={() => {
            reset();
            onSuccess();
          }}
          variant="outline"
          className="bg-muted text-foreground hover:bg-muted/80"
        >
          Cancelar
        </Button>
        <Button
          type="submit"
          form="edit-employee"
          variant="destructive"
          disabled={isSubmitting}
        >
          {isSubmitting ? "Guardando..." : "Guardar"}
        </Button>
      </AlertDialogFooter>
    </>
  );
};

export const EditEmployeeAlertDialog: React.FC<Props> = ({ employee }) => {
  const [open, setOpen] = useState(false);
  if (!employee) return null;

  return (
    <AlertDialog open={open} onOpenChange={setOpen}>
      <AlertDialogTrigger asChild>
        <Button
          variant="ghost"
          size="icon"
          className="h-7 w-7 opacity-0 group-hover:opacity-100 transition-opacity text-muted-foreground hover:text-foreground"
        >
          <Edit className="h-3.5 w-3.5" />
        </Button>
      </AlertDialogTrigger>
      <AlertDialogContent>
        <EditEmployeeForm
          employee={employee}
          onSuccess={() => setOpen(false)}
        />
      </AlertDialogContent>
    </AlertDialog>
  );
};
