import LocaleSwitcher from "@/components/shared/locale-switcher";

export default function AuthLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <div className="relative flex h-screen items-center justify-center">
      <div className="absolute right-4 top-4">
        <LocaleSwitcher />
      </div>
      {children}
    </div>
  );
}
