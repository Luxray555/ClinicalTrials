import { useTranslations } from "next-intl";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "../ui/accordion";

export default function FrequentlyAskedQuestionsSection() {
  const t = useTranslations("HomePage.FaqSection");

  const faqs = [
    {
      question: t("questions.first.question"),
      answer: t("questions.first.answer"),
    },
    {
      question: t("questions.second.question"),
      answer: t("questions.second.answer"),
    },
    {
      question: t("questions.third.question"),
      answer: t("questions.third.answer"),
    },
    {
      question: t("questions.fourth.question"),
      answer: t("questions.fourth.answer"),
    },
  ] as const;

  return (
    <section className="flex w-full flex-col items-center justify-center px-24 py-20 max-md:px-8">
      <p className="pb-10 text-4xl font-semibold text-primary max-md:text-center">
        {t("title")}
      </p>
      <Accordion
        type="single"
        collapsible
        className="flex w-full flex-col gap-4"
      >
        {faqs.map((faq, index) => (
          <AccordionItem
            className="rounded-lg border-2 bg-background px-4 drop-shadow-lg"
            value={`item-${index + 1}`}
            key={index}
          >
            <AccordionTrigger className="text-lg font-semibold text-primary hover:no-underline">
              {faq.question}
            </AccordionTrigger>
            <AccordionContent className="text-lg text-foreground/70">
              {faq.answer.split(".").map((line, index) => (
                <p key={index} className="pb-2">
                  {line}.
                </p>
              ))}
            </AccordionContent>
          </AccordionItem>
        ))}
      </Accordion>
    </section>
  );
}
