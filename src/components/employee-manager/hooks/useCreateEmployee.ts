import { useForm } from "react-hook-form";
import { mutate } from "swr";
import { EmployeeRequestDto } from "@/application/dtos/employee.dto";
import { useToast } from "@/hooks/use-toast";

export const useCreateEmployee = () => {
  const { toast } = useToast();

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
    control,
    reset,
  } = useForm<EmployeeRequestDto>();

  const onSubmit = async (data: EmployeeRequestDto) => {
    try {
      const response = await fetch("/api/employees", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          data: {
            name: data.name,
            email: data.email,
            phone: `+52 ${data.phone}`,
            groupId: data.groupId,
            routeIds: data.routeIds,
          },
        }),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || "Error al crear el empleado");
      }
      await mutate(
        (key) => typeof key === "string" && key.startsWith("/api/employees"),
        undefined,
        { revalidate: true },
      );
      reset();

      toast({
        title: "Empleado creado exitosamente",
        description: `${data.name} ha sido registrado exitosamente`,
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
    register,
    handleSubmit: handleSubmit(onSubmit),
    isSubmitting,
    errors,
    control,
  };
};
