import { ThemeToggle } from "./ThemeToggle";

interface HeaderProps {
  title: string;
}

export function Header({ title }: HeaderProps) {
  return (
    <header className="relative border-b border-white/40 bg-white/70 px-8 py-6 backdrop-blur-xl dark:border-white/10 dark:bg-white/5">
      <div className="absolute inset-0 -z-10 bg-gradient-to-r from-transparent via-white/40 to-transparent opacity-50 dark:via-white/10" />
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-semibold tracking-wide text-gray-900 transition-all duration-500 dark:text-gray-100">
          {title}
        </h1>
        <ThemeToggle />
      </div>
    </header>
  );
}
