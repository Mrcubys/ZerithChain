import { Card, CardContent } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";

interface StatCardProps {
  label: string;
  value: string | number | undefined;
  sub?: string;
  icon: React.ReactNode;
  accent?: string;
  loading?: boolean;
  testId?: string;
}

export function StatCard({ label, value, sub, icon, accent = "text-primary", loading, testId }: StatCardProps) {
  return (
    <Card className="relative overflow-hidden">
      <div className="absolute inset-0 bg-gradient-to-br from-primary/5 to-transparent pointer-events-none" />
      <CardContent className="p-4">
        <div className="flex items-start justify-between gap-2">
          <div className="flex-1 min-w-0">
            <p className="text-xs text-muted-foreground font-medium uppercase tracking-wider truncate">{label}</p>
            {loading ? (
              <Skeleton className="h-7 w-24 mt-1" />
            ) : (
              <p className={`text-2xl font-display font-bold mt-0.5 truncate ${accent}`} data-testid={testId}>
                {value ?? "—"}
              </p>
            )}
            {sub && (
              <p className="text-xs text-muted-foreground mt-0.5 truncate">{sub}</p>
            )}
          </div>
          <div className={`p-2 rounded-md bg-current/10 flex-shrink-0 ${accent}`}>
            {icon}
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
