export const Title = ({ title, subtitle }: { title: string; subtitle?: string }) => (
  <>
    <h2 className="text-2xl font-bold tracking-tight">{title}</h2>
    {subtitle ? <p className="text-muted-foreground">{subtitle}</p> : null}
  </>
);
