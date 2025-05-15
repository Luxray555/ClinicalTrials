import {
  Card,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";

export default function StatsCard({
  title,
  value,
  footerDescription,
  icon: Icon,
  className = "",
}) {
  return (
    <Card className={`@container/card ${className}`}>
      <CardHeader className="relative">
        <div className="mb-1 flex items-center gap-2">
          {Icon && <Icon className="size-5 text-muted-foreground" />}
          <CardDescription>{title}</CardDescription>
        </div>
        <CardTitle className="@[250px]/card:text-3xl text-2xl font-semibold tabular-nums">
          {value}
        </CardTitle>
        <div className="absolute right-4 top-4"></div>
      </CardHeader>
      <CardFooter className="flex-col items-start gap-1 text-sm">
        <div className="line-clamp-1 flex gap-2 font-medium">
          {footerDescription}
        </div>
      </CardFooter>
    </Card>
  );
}
