import getNumberOfTrialsForEachSource from "@/actions/clinical-trials/get-number-of-trials-for-each-source";
import NumberOfTrialsEachSourcePieChart from "@/components/statistics/number-of-trials-each-source-pie-chart";
import TopActiveClinicalTrialsByEnrollmentBarChart from "@/components/statistics/top-active-clinical-trials-by-enrollment-bar-chart";
import TrialStatusDistributionPieChart from "@/components/statistics/trial-status-distribution-pie-chart";

export default async function StatisticsPage() {
  return (
    <div className="flex gap-10 p-10">
      <NumberOfTrialsEachSourcePieChart
        numberOfTrialsForEachSource={await getNumberOfTrialsForEachSource()}
      />
      <TrialStatusDistributionPieChart />
      <TopActiveClinicalTrialsByEnrollmentBarChart />
    </div>
  );
}
