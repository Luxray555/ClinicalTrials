import { useTranslations } from "next-intl";
import { Database, Globe, ClipboardList } from "lucide-react";
import StatsCard from "../_components/stats-card";
import DataSourceTrialsChart from "../_components/data-sources-distibution";

export default function DataSourcesSection({ dataSourceStats }) {
  const t = useTranslations("DataSourcesSection");

  // Destructure the data source statistics from props
  const {
    api = 0,
    webScraper = 0,
    investigators = 0,
    apiTrials = 0,
    webScraperTrials = 0,
    investigatorsTrials = 0,
  } = dataSourceStats || {};

  return (
    <div className="">
      <p className="mb-4 text-2xl font-semibold">{t("title")}</p>

      {/* Top Section: Cards and Bar Chart */}
      <div className="mb-6 grid grid-cols-1 gap-6 lg:grid-cols-2">
        {/* Data Source Cards */}
        <div className="grid grid-cols-1 gap-4 md:grid-cols-3 lg:grid-cols-2">
          <StatsCard
            icon={Database}
            title={t("api.title")}
            value={api.toLocaleString()}
            footerDescription={t("api.footerDesc")}
          />
          <StatsCard
            icon={Globe}
            title={t("webScraper.title")}
            value={webScraper.toLocaleString()}
            footerDescription={t("webScraper.footerDesc")}
          />
          <StatsCard
            icon={ClipboardList}
            title={t("investigators.title")}
            value={investigators.toLocaleString()}
            footerDescription={t("investigators.footerDesc")}
          />
        </div>

        {/* Data Source Trials Bar Chart */}
        <DataSourceTrialsChart dataSourceStats={dataSourceStats} />
      </div>
    </div>
  );
}
