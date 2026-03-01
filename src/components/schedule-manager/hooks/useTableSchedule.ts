import { useState } from "react";
import jsPDF from "jspdf";
import autoTable from "jspdf-autotable";
import { useGroups } from "@/components/group-manager";
import { useRoutes } from "@/components/route-manager";
import { useScheduleDerivedData } from "./useScheduleDerivedData";
import { ScheduleResponseDto } from "@/application/dtos/schedule.dto";

export const useTableSchedule = (schedule: ScheduleResponseDto | undefined) => {
  const { data: groups = [] } = useGroups();
  const { routeOptions: routes } = useRoutes();

  const { startDate, days, entriesByRoute, groupsMap } = useScheduleDerivedData(
    schedule,
    groups,
  );

  const [exporting, setExporting] = useState(false);

  const handleDownloadPDF = () => {
    setExporting(true);
    try {
      const doc = new jsPDF("landscape");

      // --- 1. CABECERA Y LEYENDA ---
      doc.setFontSize(16);
      doc.text("Horario de Rutas - ShiftFlow", 14, 15);
      doc.setFontSize(10);
      doc.setTextColor(100);
      doc.text(
        `Semana del ${startDate.toLocaleDateString()} al ${days[6].label}`,
        14,
        22,
      );

      let currentX = 14;
      const legendY = 30;
      doc.setFontSize(8);

      groups.forEach((group) => {
        const hexColor = getPdfHexColor(group.color);
        doc.setFillColor(hexColor);
        doc.rect(currentX, legendY - 3, 3, 3, "F");
        doc.setTextColor(60);
        doc.text(
          `Grupo ${group.name} (${group.hours}h)`,
          currentX + 5,
          legendY,
        );
        currentX += 35;
      });

      // --- 2. PREPARACIÓN DE DATOS (Inyectando colores) ---
      const head = [["Ruta", ...days.map((d) => d.label)]];

      const body = routes.map((route) => {
        const routeData = entriesByRoute.get(route.label);
        const rowData: any[] = [route.label]; // La primera celda es un string normal

        days.forEach((day) => {
          const dayEntries = routeData?.get(day.iso) || [];
          if (dayEntries.length === 0) {
            rowData.push(""); // Celda vacía
            return;
          }

          const cellText = dayEntries
            .map((e) => `G.${e.group} - ${e.startTime}\n${e.employeeName}`)
            .join("\n\n---\n\n");

          // TRUCO ARQUITECTÓNICO: Pasamos un objeto en lugar de un string
          // para guardar la data de los colores y leerla luego en el motor de renderizado
          rowData.push({
            content: cellText,
            customColors: dayEntries.map((e) =>
              getPdfHexColor(groupsMap[e.group]?.color),
            ),
          });
        });

        return rowData;
      });

      // --- 3. RENDERIZADO DE LA TABLA CON HOOKS ---
      autoTable(doc, {
        head: head,
        body: body,
        startY: 36,
        // Damos un padding izquierdo más grande (6) para que el texto no pise la barra de color
        styles: {
          fontSize: 8,
          cellPadding: { top: 3, right: 3, bottom: 3, left: 6 },
        },
        headStyles: { fillColor: [41, 128, 185], textColor: 255 },
        columnStyles: { 0: { fontStyle: "bold", cellWidth: 25 } },

        // HOOK MÁGICO: Se ejecuta después de dibujar cada celda
        didDrawCell: (data) => {
          // Solo intervenimos en el cuerpo de la tabla (no cabeceras)
          if (
            data.section === "body" &&
            data.column.index > 0 &&
            data.cell.raw
          ) {
            // Leemos los colores que inyectamos en la preparación de datos
            const raw = data.cell.raw as any;
            if (raw.customColors && raw.customColors.length > 0) {
              const colors = raw.customColors;
              const cellX = data.cell.x;
              const cellY = data.cell.y;
              const cellHeight = data.cell.height;
              const borderWidth = 3; // Grosor de nuestra barra de color

              // Si hay varios grupos en un día, dividimos la altura de la celda
              const segmentHeight = cellHeight / colors.length;

              // Dibujamos un rectángulo de color por cada turno/empleado en el borde izquierdo
              colors.forEach((color: string, index: number) => {
                doc.setFillColor(color);
                doc.rect(
                  cellX,
                  cellY + index * segmentHeight,
                  borderWidth,
                  segmentHeight,
                  "F",
                );
              });
            }
          }
        },
      });

      // --- 4. EXPORTACIÓN ---
      doc.save(`horario-rutas-${startDate.toISOString().split("T")[0]}.pdf`);
    } catch (err) {
      console.error("Error al generar el PDF nativo:", err);
    } finally {
      setExporting(false);
    }
  };

  const getPdfHexColor = (colorString?: string): string => {
    if (!colorString) return "#64748b"; // Slate 500
    if (colorString.startsWith("#")) return colorString;

    if (colorString.includes("red") || colorString.includes("destructive"))
      return "#ef4444";
    if (colorString.includes("blue") || colorString.includes("primary"))
      return "#3b82f6";
    if (colorString.includes("green")) return "#22c55e";
    if (colorString.includes("yellow") || colorString.includes("orange"))
      return "#f59e0b";
    if (colorString.includes("purple")) return "#a855f7";

    return "#64748b";
  };

  return { handleDownloadPDF, exporting };
};
