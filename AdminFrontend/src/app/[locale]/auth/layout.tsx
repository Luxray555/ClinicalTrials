export default function AuthLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <div className="relative flex h-full w-full flex-1 items-center justify-center bg-white">
      <div className="absolute right-4 top-4"></div>
      {children}
    </div>
  );
}
