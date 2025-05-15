import SearchSection from "@/components/home/search-section";
import KeyFeaturesSection from "@/components/home/key-features-section";
import HowItWorksSection from "@/components/home/how-it-works-section";
import FrequentlyAskedQuestionsSection from "@/components/home/faq-section";
import Footer from "@/components/home/footer";

export default function HomePage() {
  return (
    <div className="flex min-h-full w-full flex-col items-center justify-center">
      <SearchSection />
      <KeyFeaturesSection />
      <HowItWorksSection />
      <FrequentlyAskedQuestionsSection />
      <Footer />
    </div>
  );
}
