import { AppSidebar } from "@/components/shared/app-sidebar";
import LocaleSwitcher from "@/components/shared/locale-switcher";
import Logout from "@/components/shared/logout";
import { SidebarProvider, SidebarTrigger } from "@/components/ui/sidebar";
import { headers } from "next/headers";

export default async function Layout({
  children,
}: {
  children: React.ReactNode;
}) {
  const header = await headers();
  return (
    <SidebarProvider>
      <AppSidebar pathname={header.get("x-current-path")} />

      <main className="h-full w-full">
        <div className="flex w-full items-center justify-between px-6 py-2">
          <SidebarTrigger />
          <div className="flex items-center justify-center gap-5">
            {/* logout icon */}
            <Logout />
            <LocaleSwitcher />
          </div>
        </div>
        <div className="h-fi">{children}</div>
      </main>
    </SidebarProvider>
  );
}
