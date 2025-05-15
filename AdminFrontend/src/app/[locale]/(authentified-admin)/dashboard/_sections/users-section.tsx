import { useTranslations } from "next-intl";
import { Users, FlaskConical, Shield, Stethoscope } from "lucide-react";
import StatsCard from "../_components/stats-card";
import UserDistributionChart from "../_components/users-distribution";

export default function UsersSection({ userStats }) {
  const t = useTranslations("UsersSection");

  // Destructure the user statistics from props
  const {
    doctors = 0,
    patients = 0,
    investigators = 0,
    admins = 0,
  } = userStats || {};

  return (
    <div className="">
      <p className="mb-4 text-2xl font-semibold">{t("title")}</p>

      {/* Top Section: Total Users Card and Pie Chart */}
      <div className="mb-6 grid grid-cols-1 gap-6 lg:grid-cols-2">
        {/* Total Users Card */}

        <div className="grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-2">
          <StatsCard
            icon={Stethoscope}
            title={t("doctors.title")}
            value={doctors.toLocaleString()}
            footerDescription={t("doctors.footerDesc")}
          />
          <StatsCard
            icon={Users}
            title={t("patients.title")}
            value={patients.toLocaleString()}
            footerDescription={t("patients.footerDesc")}
          />
          <StatsCard
            icon={FlaskConical}
            title={t("investigators.title")}
            value={investigators.toLocaleString()}
            footerDescription={t("investigators.footerDesc")}
          />
          <StatsCard
            icon={Shield}
            title={t("admins.title")}
            value={admins.toLocaleString()}
            footerDescription={t("admins.footerDesc")}
          />
        </div>

        {/* User Distribution Pie Chart */}
        <UserDistributionChart userStats={userStats} />
      </div>

      {/* <div className="rounded-lg bg-gradient-to-r from-blue-50 to-indigo-50 p-1 dark:from-blue-950/40 dark:to-indigo-950/40">
        <StatsCard
          icon={UserPlus}
          title={t("total.title")}
          value={totalUsers.toLocaleString()}
          trend={overallTrend}
          trendValue={formattedTotalTrendValue}
          footerTitle={t("total.footerTitle")}
          footerDescription={t("total.footerDesc")}
          className="h-full border-0 bg-card/50 backdrop-blur-sm"
        />
      </div> */}
      {/* Individual User Type Cards */}
    </div>
  );
}
