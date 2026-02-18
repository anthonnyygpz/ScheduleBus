"use client";

import { useState } from "react";
import useSWR, { mutate } from "swr";
import { Plus, Upload, Trash2, X, FileText, UserPlus } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { SHIFT_CONFIG } from "@/lib/types";
import type { Employee, ShiftType } from "@/lib/types";

const fetcher = (url: string) => fetch(url).then((r) => r.json());

export function EmployeeManager() {
  const { data: employees, error } = useSWR<Employee[]>(
    "/api/employees",
    fetcher,
  );
  const [showAddForm, setShowAddForm] = useState(false);
  const [showTextImport, setShowTextImport] = useState(false);
  const [textInput, setTextInput] = useState("");
  const [loading, setLoading] = useState(false);

  const [newName, setNewName] = useState("");
  const [newRole, setNewRole] = useState("");
  const [newSkills, setNewSkills] = useState("");
  const [newAvailability, setNewAvailability] = useState<ShiftType[]>([]);

  const handleAddEmployee = async () => {
    if (!newName.trim()) return;
    setLoading(true);
    try {
      await fetch("/api/employees", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          type: "single",
          data: {
            name: newName,
            role: newRole || "General",
            email: `${newName.toLowerCase().replace(/\s+/g, ".")}@empresa.com`,
            phone: `+52 ${Math.floor(1000000000 + Math.random() * 9000000000)}`,
            skills: newSkills
              ? newSkills.split(",").map((s) => s.trim())
              : ["General"],
            maxHoursPerWeek: 48,
            availability:
              newAvailability.length > 0
                ? newAvailability
                : ["morning", "afternoon"],
          },
        }),
      });
      mutate("/api/employees");
      setNewName("");
      setNewRole("");
      setNewSkills("");
      setNewAvailability([]);
      setShowAddForm(false);
    } finally {
      setLoading(false);
    }
  };

  const handleTextImport = async () => {
    if (!textInput.trim()) return;
    setLoading(true);
    try {
      await fetch("/api/employees", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ type: "text", data: textInput }),
      });
      mutate("/api/employees");
      setTextInput("");
      setShowTextImport(false);
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (id: string) => {
    await fetch(`/api/employees?id=${id}`, { method: "DELETE" });
    mutate("/api/employees");
  };

  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const text = await file.text();
    if (file.name.endsWith(".csv") || file.name.endsWith(".txt")) {
      setLoading(true);
      try {
        await fetch("/api/employees", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ type: "text", data: text }),
        });
        mutate("/api/employees");
      } finally {
        setLoading(false);
      }
    }
    e.target.value = "";
  };

  const toggleAvailability = (shift: ShiftType) => {
    setNewAvailability((prev) =>
      prev.includes(shift) ? prev.filter((s) => s !== shift) : [...prev, shift],
    );
  };

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
            className="gap-1.5 text-xs h-8"
          >
            <UserPlus className="h-3.5 w-3.5" />
            Agregar
          </Button>
          <Dialog open={showTextImport} onOpenChange={setShowTextImport}>
            <DialogTrigger asChild>
              <Button
                variant="outline"
                size="sm"
                className="gap-1.5 text-xs h-8"
              >
                <FileText className="h-3.5 w-3.5" />
                Importar Texto
              </Button>
            </DialogTrigger>
            <DialogContent className="bg-card border-border text-foreground">
              <DialogHeader>
                <DialogTitle className="text-foreground">
                  Importar Empleados desde Texto
                </DialogTitle>
              </DialogHeader>
              <div className="space-y-4">
                <p className="text-sm text-muted-foreground">
                  Un empleado por linea. Formato:{" "}
                  <code className="rounded bg-secondary px-1 py-0.5 font-mono text-xs text-foreground">
                    Nombre | Grupo | Ruta1, Ruta2
                  </code>
                </p>
                <Textarea
                  value={textInput}
                  onChange={(e) => setTextInput(e.target.value)}
                  placeholder={`Carlos Martinez | 'A' | Ruta Norte A, Ruta Sur A `}
                  className="min-h-40 font-mono text-sm bg-secondary border-border text-foreground placeholder:text-muted-foreground"
                />
                <Button
                  onClick={handleTextImport}
                  disabled={loading || !textInput.trim()}
                  className="w-full"
                >
                  {loading ? "Importando..." : "Importar Empleados"}
                </Button>
              </div>
            </DialogContent>
          </Dialog>
          <label>
            <input
              type="file"
              accept=".csv,.txt"
              onChange={handleFileUpload}
              className="hidden"
            />
            <Button
              variant="outline"
              size="sm"
              className="gap-1.5 text-xs h-8 cursor-pointer"
              asChild
            >
              <span>
                <Upload className="h-3.5 w-3.5" />
                Archivo
              </span>
            </Button>
          </label>
        </div>
      </div>

      {/* Add Employee Form */}
      {showAddForm && (
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
                onClick={() => setShowAddForm(false)}
                className="h-7 w-7"
              >
                <X className="h-4 w-4" />
              </Button>
            </div>
          </CardHeader>
          <CardContent className="space-y-3 pb-4">
            <div className="grid gap-3 sm:grid-cols-2">
              <div className="space-y-1">
                <Label className="text-xs text-foreground">
                  Nombre completo
                </Label>
                <Input
                  value={newName}
                  onChange={(e) => setNewName(e.target.value)}
                  placeholder="Nombre del empleado"
                  className="h-8 text-sm bg-secondary border-border text-foreground placeholder:text-muted-foreground"
                />
              </div>
              <div className="space-y-1">
                <Label className="text-xs text-foreground">Rol / Puesto</Label>
                <Input
                  value={newRole}
                  onChange={(e) => setNewRole(e.target.value)}
                  placeholder="Conductor, Supervisor..."
                  className="h-8 text-sm bg-secondary border-border text-foreground placeholder:text-muted-foreground"
                />
              </div>
            </div>
            <div className="space-y-1">
              <Label className="text-xs text-foreground">
                Rutas (separadas por coma)
              </Label>
              <Input
                value={newSkills}
                onChange={(e) => setNewSkills(e.target.value)}
                placeholder="Conduccion, Mantenimiento, Logistica"
                className="h-8 text-sm bg-secondary border-border text-foreground placeholder:text-muted-foreground"
              />
            </div>
            <div className="space-y-1">
              <Label className="text-xs text-foreground">
                Disponibilidad de turnos
              </Label>
              <div className="flex flex-wrap gap-2">
                {(
                  Object.entries(SHIFT_CONFIG) as [
                    ShiftType,
                    typeof SHIFT_CONFIG.morning,
                  ][]
                ).map(([key, config]) => (
                  <button
                    key={key}
                    onClick={() => toggleAvailability(key)}
                    className={`rounded-md border px-3 py-1 text-xs font-medium transition-colors ${
                      newAvailability.includes(key)
                        ? "border-primary bg-primary text-primary-foreground"
                        : "border-border bg-secondary text-muted-foreground hover:border-primary/50"
                    }`}
                  >
                    {config.label}
                  </button>
                ))}
              </div>
            </div>
            <Button
              onClick={handleAddEmployee}
              disabled={loading || !newName.trim()}
              size="sm"
              className="w-full"
            >
              {loading ? "Guardando..." : "Agregar Empleado"}
            </Button>
          </CardContent>
        </Card>
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
                Rutas
              </TableHead>
              <TableHead className="text-[11px] font-semibold text-muted-foreground 2xl:text-xs">
                Turnos Disponibles
              </TableHead>
              <TableHead className="text-[11px] font-semibold text-muted-foreground 2xl:text-xs">
                Max h/dia
              </TableHead>
              <TableHead className="text-[11px] font-semibold text-muted-foreground 2xl:text-xs w-10">
                <span className="sr-only">Acciones</span>
              </TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {employees.map((emp: Employee) => (
              <TableRow key={emp.id} className="border-border/50 group">
                <TableCell className="py-2">
                  <span className="text-xs font-medium text-foreground 2xl:text-sm">
                    {emp.name}
                  </span>
                </TableCell>
                <TableCell className="py-2">
                  <span className="text-xs text-muted-foreground 2xl:text-sm">
                    {emp.group}
                  </span>
                </TableCell>
                <TableCell className="py-2">
                  <div className="flex flex-wrap gap-1">
                    {emp.skills.map((skill) => (
                      <span
                        key={skill}
                        className="rounded bg-secondary px-1.5 py-0.5 text-[10px] text-muted-foreground 2xl:text-xs"
                      >
                        {skill}
                      </span>
                    ))}
                  </div>
                </TableCell>
                <TableCell className="py-2">
                  <div className="flex flex-wrap gap-1">
                    {emp.availability.map((shift) => (
                      <Badge
                        key={shift}
                        variant="outline"
                        className="text-[10px] py-0 px-1.5 2xl:text-xs"
                      >
                        {SHIFT_CONFIG[shift].label}
                      </Badge>
                    ))}
                  </div>
                </TableCell>
                <TableCell className="py-2">
                  <span className="font-mono text-xs text-muted-foreground 2xl:text-sm">
                    {emp.maxHoursPerDay}
                  </span>
                </TableCell>
                <TableCell className="py-2">
                  <Button
                    variant="ghost"
                    size="icon"
                    onClick={() => handleDelete(emp.id)}
                    className="h-7 w-7 opacity-0 group-hover:opacity-100 transition-opacity text-muted-foreground hover:text-destructive"
                  >
                    <Trash2 className="h-3.5 w-3.5" />
                  </Button>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>
    </div>
  );
}
