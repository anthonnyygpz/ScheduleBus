import { useEmployees } from "@/components/employee-manager/hooks/useEmployees";
import { Badge } from "../../ui/badge";
import { Card, CardContent } from "../../ui/card";
import { useGroups } from "@/components/group-manager";

const GroupCards = () => {
  const { data: employees } = useEmployees();
  const { data: groups } = useGroups();

  return (
    <div className="grid grid-cols-3 gap-3">
      {groups.map((group) => (
        <Card
          key={group.id}
          style={{ borderLeftColor: group.color }}
          className="border-l-4"
        >
          <CardContent className="p-3 flex items-center justify-between">
            <div>
              <p className="text-[10px] uppercase font-bold text-muted-foreground">
                Grupo {group.name}
              </p>
              <p className="text-sm font-bold">{group.hours} Horas</p>
            </div>
            <Badge variant="outline" className="text-[10px]">
              {employees.filter((e) => e.group.id === group.id).length} Emp.
            </Badge>
          </CardContent>
        </Card>
      ))}
    </div>
  );
};

export default GroupCards;
