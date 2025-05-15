import Header from "@/components/shared/header";
import HeaderMobile from "@/components/shared/header-mobile";

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <div className="flex min-h-full flex-col">
      <Header />
      <HeaderMobile />
      {children}
    </div>
  );
}
