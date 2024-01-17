export const Title = ({
  title,
  subtitle,
  className,
}: {
  title: string;
  subtitle?: string;
  className?: string;
}) => (
  <div className={className}>
    <h2 className="text-xl font-bold tracking-tight">{title}</h2>
    {subtitle ? <p className="text-muted-foreground">{subtitle}</p> : null}
  </div>
);
