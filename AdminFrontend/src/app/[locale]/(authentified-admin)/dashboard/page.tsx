import ServerErrorMessage from "@/components/shared/server-error";
import ClinicalTrialsSection from "./_sections/clinical-trials-section";
import DataSourcesSection from "./_sections/data-sources-section";
import UsersSection from "./_sections/users-section";
import { getSystemStats } from "@/api-access/server-side-data-access/fetchers/dashboard";
import { withServerError } from "@/lib/errors/errors";

export default async function DashboardPage() {
  const response = await withServerError(getSystemStats());

  if (response.error) {
    return (
      <ServerErrorMessage
        error={response.error}
        status={response.status}
        message={response.message}
      ></ServerErrorMessage>
    );
  }

  const data = response.data;
  // User stats can be passed directly
  const userStats = data.users;

  // Clinical trials data can be passed directly
  const trialsData = data.clinicalTrials;

  // Data sources need to be transformed from array to object format
  const dataSourceDistribution = data.dataSources.typeDistribution;

  // Transform the data source distribution array to the format expected by the component
  const dataSourceStats = {
    total: data.dataSources.total,
    api: dataSourceDistribution.find((item) => item.type === "API")?.count || 0,
    webScraper:
      dataSourceDistribution.find((item) => item.type === "Website Scraper")
        ?.count || 0,
    investigators:
      dataSourceDistribution.find((item) => item.type === "INVESTIGATOR")
        ?.count || 0,
    apiTrials:
      dataSourceDistribution.find((item) => item.type === "API")?.trialsCount ||
      0,
    webScraperTrials:
      dataSourceDistribution.find((item) => item.type === "Website Scraper")
        ?.trialsCount || 0,
    investigatorsTrials:
      dataSourceDistribution.find((item) => item.type === "INVESTIGATOR")
        ?.trialsCount || 0,
  };

  return (
    <div className="container mx-auto p-5">
      <UsersSection userStats={userStats} />
      <DataSourcesSection dataSourceStats={dataSourceStats} />
      <ClinicalTrialsSection trialsData={trialsData} />
    </div>
  );
}
