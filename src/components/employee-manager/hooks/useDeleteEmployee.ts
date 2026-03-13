import { useToast } from "@/hooks/use-toast";
import { mutate } from "swr";

export const useDeleteEmployee = () => {
  const { toast } = useToast();

  const handleDelete = async (id: number, name?: string) => {
    try {
      const response = await fetch(`/api/employees?id=${id}`, {
        method: "DELETE",
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || "Error al eliminar empleado");
      }

      await mutate(
        (key) => typeof key === "string" && key.startsWith("/api/employees"),
        undefined,
        { revalidate: true },
      );

      toast({
        title: "Empleado dado de baja exitosamente",
        description: `${name || "El empleado"} ha sido dato de baja exitosamente`,
        variant: "success",
        duration: 3000,
      });
    } catch (error: any) {
      toast({
        variant: "destructive",
        title: "Error al eliminar",
        description: error.message || "No se pudo procesar la solicitud.",
      });
      console.error("Delete Employee Error:", error);
    }
  };

  return { handleDelete };
};
