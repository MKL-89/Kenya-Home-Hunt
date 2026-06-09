import { Navbar } from "./Navbar";

export function MainLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="min-h-screen flex flex-col bg-background">
      <Navbar />
      <main className="flex-1 w-full">{children}</main>
    </div>
  );
}
