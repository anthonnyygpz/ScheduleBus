import { useToast } from "@/hooks/use-toast";
import { mutate } from "swr";
import {
  EmployeeRequestDto,
  EmployeeResponseDto,
} from "@/application/dtos/employee.dto";
import { useForm } from "react-hook-form";
import { useEffect } from "react";

export const useUpdateEmployee = (employee?: EmployeeResponseDto) => {
  const { toast } = useToast();

  const form = useForm<EmployeeRequestDto>({
    defaultValues: {
      name: "",
      email: "",
      phone: "",
      groupId: "",
      routeIds: [],
    },
  });

  useEffect(() => {
    if (employee) {
      form.reset({
        name: employee.name,
        email: employee.email,
        phone: employee.phone,
        groupId: employee.group.id.toString(),
        routeIds: employee.routes.map((r) => r.id.toString()),
      });
    }
  }, [employee, form]);

  const onSubmit = async (data: EmployeeRequestDto) => {
    if (!employee?.id) {
      toast({
        variant: "destructive",
        title: "Error",
        description: "ID de empleado no encontrado",
      });
      return;
    }
    try {
      const response = await fetch(`/api/employees?id=${employee.id}`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          data: {
            name: data.name,
            email: data.email,
            phone: data.phone,
            groupId: data.groupId,
            routeIds: data.routeIds,
          },
        }),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || "Error al crear el empleado");
      }
      await mutate("/api/employees");
      form.reset();

      toast({
        title: "Empleado actualizado exitosamente",
        description: `${data.name} ha sido actualizado exitosamente`,
        variant: "success",
        duration: 3000,
      });
    } catch (error: any) {
      toast({
        variant: "destructive",
        title: "Error al guardar",
        description: error.message || "No se pudo procesar la solicitud.",
      });
      console.error("Create Employee Error:", error);
    }
  };

  return {
    ...form,
    onSubmit,
  };
};
