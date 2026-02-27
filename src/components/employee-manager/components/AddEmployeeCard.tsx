"use client";

import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { BadgeQuestionMark, Plus, X } from "lucide-react";
import { useCreateEmployee } from "../hooks/useCreateEmployee";
import { MultiSelect } from "@/components/ui/multi-select";
import { Controller } from "react-hook-form";
import { useRoutes } from "@/components/route-manager";
import { useGroup } from "@/components/group-manager/hooks/useGroup";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

interface Props {
  onCloseForm: () => void;
}

export const AddEmployeeCard: React.FC<Props> = ({ onCloseForm }) => {
  const { register, control, handleSubmit, isSubmitting, errors } =
    useCreateEmployee();

  const { routeOptions } = useRoutes();
  const { groupOptions } = useGroup();

  return (
    <Card className="bg-card border border-primary/30">
      <CardHeader className="pb-3 pt-3">
        <div className="flex items-center justify-between">
          <CardTitle className="flex items-center gap-2 text-sm text-foreground">
            <Plus className="h-4 w-4 text-primary" />
            Nuevo Empleado
          </CardTitle>
          <Button
            variant="ghost"
            size="icon"
            onClick={onCloseForm}
            className="h-7 w-7"
          >
            <X className="h-4 w-4" />
          </Button>
        </div>
      </CardHeader>
      <CardContent className="space-y-3 pb-4">
        <form onSubmit={handleSubmit}>
          <div className="grid gap-3 sm:grid-cols-2">
            <div className="space-y-1">
              <Label
                required
                htmlFor="name"
                className="text-xs text-foreground"
                title="Nombre completo del empleado ejem. Carlos Martinez"
              >
                Nombre completo
                <BadgeQuestionMark className="ml-1 h-4 w-4" />
              </Label>
              <Input
                autoFocus
                placeholder="Nombre del empleado"
                className="h-8 text-sm bg-secondary border-border text-foreground placeholder:text-muted-foreground"
                error={!!errors.name}
                helperText={errors.name?.message}
                {...register("name", { required: "El nombre es obligatorio" })}
              />
            </div>
            <div className="space-y-1">
              <Label
                required
                htmlFor="group"
                className="text-xs text-foreground"
                title="Grupo al que pertecene el empleado ejem(A,B o C)"
              >
                Grupo
                <BadgeQuestionMark className="ml-1 h-4 w-4" />
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
                required
                htmlFor="phone"
                className="text-xs text-foreground"
                title="Numero de telefono del empleado ejem. 123456789"
              >
                Numero de telefono
                <BadgeQuestionMark className="ml-1 h-4 w-4" />
              </Label>
              <Input
                placeholder="123456789"
                className="h-8 text-sm bg-secondary border-border text-foreground placeholder:text-muted-foreground"
                error={!!errors.phone}
                helperText={errors.phone?.message}
                {...register("phone", {
                  required: "El telefono es obligatorio",
                  pattern: {
                    value: /^\d{10}$/,
                    message: "Solo se permiten números",
                  },
                  maxLength: {
                    value: 10,
                    message: "El telefono debe tener 10 digitos",
                  },
                  minLength: {
                    value: 10,
                    message: "El telefono debe tener 10 digitos",
                  },
                })}
              />
            </div>

            <div className="space-y-1">
              <Label
                htmlFor="email"
                title="Correo electronico del empleado ejem. ejemplo@ejemplo.com"
                className="text-xs text-foreground"
              >
                Correo Electronico
                <BadgeQuestionMark className="ml-1 h-4 w-4" />
              </Label>
              <Input
                placeholder="ejemplo@ejemplo.com"
                className="h-8 text-sm bg-secondary border-border text-foreground placeholder:text-muted-foreground"
                error={!!errors.email}
                helperText={errors.email?.message}
                {...register("email", {
                  pattern: {
                    value: /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/,
                    message: "Solo se permiten correos electronicos",
                  },
                })}
              />
            </div>
          </div>
          <div className="my-3">
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

          <Button
            type="submit"
            disabled={isSubmitting}
            size="sm"
            className="w-full"
          >
            {isSubmitting ? "Guardando..." : "Agregar Empleado"}
          </Button>
        </form>
      </CardContent>
    </Card>
  );
};
