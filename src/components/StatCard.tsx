import { Card, CardContent } from "@/components/ui/card";
import { LucideIcon } from "lucide-react";

interface StatCardProps {
  title: string;
  value: string | number;
  Icon: any;
  color?: string;
}

export const StatCard = ({ title, value, Icon, color = "text-muted-foreground" }: StatCardProps) => {
  return (
    <Card className="group hover:shadow-lg transition-all duration-300 hover:scale-105 border-border/50">
      <CardContent>
        <div className="flex items-center gap-4">
          <div className={`flex items-center justify-center h-12 w-12 rounded-lg bg-muted/10`}>
            <Icon className={`h-6 w-6 ${color}`} aria-hidden />
          </div>

          <div className="flex-1">
            <div className="text-sm font-medium text-muted-foreground">{title}</div>
            <div className="text-2xl sm:text-3xl font-bold">{value}</div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};

export default StatCard;
