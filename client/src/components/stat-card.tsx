import { Card, CardContent } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";

interface StatCardProps {
  label: string;
  value: string | number | undefined;
  sub?: string;
  icon: React.ReactNode;
  valueColor?: string;
  loading?: boolean;
  testId?: string;
}

export function StatCard({ label, value, sub, icon, valueColor = "text-foreground", loading, testId }: StatCardProps) {
  return (
    <Card>
      <CardContent className="p-4">
        <div className="flex items-start justify-between gap-2">
          <div className="flex-1 min-w-0">
            <p className="text-xs text-muted-foreground uppercase tracking-wider truncate">{label}</p>
            {loading ? (
              <Skeleton className="h-7 w-28 mt-1.5" />
            ) : (
              <p className={`text-xl font-semibold font-mono mt-1 truncate ${valueColor}`} data-testid={testId}>
                {value ?? "—"}
              </p>
            )}
            {sub && (
              <p className="text-xs text-muted-foreground mt-0.5 truncate">{sub}</p>
            )}
          </div>
          <div className="p-2 rounded-sm bg-secondary flex-shrink-0 text-muted-foreground">
            {icon}
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
