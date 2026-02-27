import { EmployeeResponseDto } from "@/application/dtos/employee.dto";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogContent,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Edit } from "lucide-react";
import { useUpdateEmployee } from "../hooks/useUpdateEmployee";
import { useRoutes } from "@/components/route-manager/hooks/useRoutes";
import { Controller } from "react-hook-form";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { useGroup } from "@/components/group-manager";
import { MultiSelect } from "@/components/ui/multi-select";

interface Props {
  employee?: EmployeeResponseDto;
}

export const EditEmployeeAlertDialog: React.FC<Props> = ({ employee }) => {
  const { register, handleSubmit, control } = useUpdateEmployee(employee);
  const { routeOptions } = useRoutes();
  const { groupOptions } = useGroup();

  if (!employee) return null;

  return (
    <AlertDialog>
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
        <AlertDialogHeader>
          <AlertDialogTitle>Editar empleado</AlertDialogTitle>

          <form onSubmit={handleSubmit} id="edit-employee">
            <div className="space-y-1">
              <Label
                htmlFor="name"
                className="text-xs text-foreground"
                title="Nombre completo del empleado ejem. Carlos Martinez"
              >
                Nombre completo
              </Label>
              <Input
                className="text-sm text-muted-foreground"
                {...register("name")}
              />
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
                  <Select
                    onValueChange={field.onChange}
                    defaultValue={field.value}
                  >
                    <SelectTrigger className="w-full">
                      <SelectValue placeholder="Selecciona un grupo..." />
                    </SelectTrigger>
                    <SelectContent>
                      {groupOptions.map((group) => (
                        <SelectItem key={group.value} value={group.value}>
                          {group.label} ({group.value} h/dia)
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
                className="text-sm text-muted-foreground"
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
                className="text-sm text-muted-foreground"
                placeholder="ejemplo@ejemplo.com"
                {...register("email")}
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
          <AlertDialogAction className="bg-transparent hover:bg-destructive">
            Cancelar
          </AlertDialogAction>
          <AlertDialogAction asChild>
            <Button form="edit-employee" type="submit" variant="destructive">
              Guardar
            </Button>
          </AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
};
