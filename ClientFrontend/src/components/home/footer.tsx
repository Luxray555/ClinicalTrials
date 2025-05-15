import { Mail, MapPin, Phone } from "lucide-react";
import Image from "next/image";
import logoText from "@@/public/images/logo_text.png";
import { Link } from "@/i18n/routing";
import { useTranslations } from "next-intl";

export default function Footer() {
  const t = useTranslations("HomePage.Footer");

  return (
    <footer className="grid w-full grid-cols-5 items-center justify-center bg-primary/10 px-24 py-20 max-md:grid-cols-1 max-md:gap-4 max-md:px-8 max-md:py-14">
      <Image
        src={logoText}
        alt="Clinical trials text logo"
        className="h-8 w-fit self-start object-contain"
      />
      <div className="flex flex-col gap-4 self-start">
        <strong>{t("about.title")}</strong>
        <Link className="hover:underline" href="">
          {t("about.links.aboutUs")}
        </Link>
        <Link className="hover:underline" href="">
          {t("about.links.howItWorks")}
        </Link>
        <Link className="hover:underline" href="">
          {t("about.links.faq")}
        </Link>
      </div>
      <div className="flex flex-col gap-4 self-start">
        <strong>{t("support.title")}</strong>
        <Link className="hover:underline" href="">
          {t("support.links.contactUs")}
        </Link>
        <Link className="hover:underline" href="">
          {t("support.links.trackComplaint")}
        </Link>
        <Link className="hover:underline" href="">
          {t("support.links.helpCenter")}
        </Link>
      </div>
      <div className="flex flex-col gap-4 self-start">
        <strong>{t("legal.title")}</strong>
        <Link className="hover:underline" href="">
          {t("legal.links.legalNotice")}
        </Link>
        <Link className="hover:underline" href="">
          {t("legal.links.privacyPolicy")}
        </Link>
        <Link className="hover:underline" href="">
          {t("legal.links.termsOfUse")}
        </Link>
      </div>
      <div className="flex flex-col gap-4 self-start">
        <strong>{t("contact.title")}</strong>
        <div className="flex items-center gap-4">
          <Phone className="text-primary" />
          <p>{t("contact.phone")}</p>
        </div>
        <div className="flex items-center gap-4">
          <Mail className="text-primary" />
          <a className="hover:underline" href={`mailto:${t("contact.email")}`}>
            {t("contact.email")}
          </a>
        </div>
        <div className="flex items-center gap-4">
          <MapPin className="text-primary" />
          <p dangerouslySetInnerHTML={{ __html: t("contact.address") }} />
        </div>
      </div>
    </footer>
  );
}
