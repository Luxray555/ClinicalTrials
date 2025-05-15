import {
  BriefcaseConveyorBelt,
  BriefcaseMedical,
  Clock12,
  Database,
  DatabaseBackup,
  LayoutDashboard,
  Settings,
  User,
} from "lucide-react";

import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarGroup,
  SidebarGroupContent,
  SidebarGroupLabel,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
} from "@/components/ui/sidebar";
import { useTranslations } from "next-intl";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
} from "../ui/dropdown-menu";
import Logout from "./logout";

// Menu items.
const items = [
  {
    title: "Dashboard",
    url: "dashboard",
    icon: LayoutDashboard,
  },
  {
    title: "Users",
    url: "users",
    icon: User,
  },
  {
    title: "DataSources",
    url: "data-sources",
    icon: Database,
  },
  {
    title: "ClinicalTrials",
    url: "clinical-trials",
    icon: BriefcaseMedical,
  },
  {
    title: "PendingClinicalTrials",
    url: "pending-clinical-trials",
    icon: Clock12,
  },
  {
    title: "dataCollection",
    url: "data-collection",
    icon: DatabaseBackup,
  },
];

export function AppSidebar({ pathname }: { pathname: string }) {
  const t = useTranslations("SideBar");

  return (
    <Sidebar>
      <SidebarContent>
        <SidebarGroup>
          <SidebarGroupLabel>{t("AdminPanel")}</SidebarGroupLabel>
          <SidebarGroupContent>
            <SidebarMenu>
              {items.map((item) => (
                <SidebarMenuItem key={t(item.title)}>
                  <SidebarMenuButton
                    asChild
                    isActive={pathname === `/${item.url}`}
                  >
                    <a href={"/" + item.url}>
                      <item.icon />
                      <span
                      // className={
                      //   pathname === `/${item.url}` ? "font-bold" : ""
                      // }
                      >
                        {t(item.title)}
                      </span>
                    </a>
                  </SidebarMenuButton>
                </SidebarMenuItem>
              ))}
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>
      </SidebarContent>

      <SidebarFooter>
        <Logout showText={true} />
      </SidebarFooter>
    </Sidebar>
  );
}
