interface AppHeaderProps {
  title: string;
}

export function AppHeader({ title }: AppHeaderProps) {
  return (
    <header>
      <h1>{title}</h1>
    </header>
  );
}
