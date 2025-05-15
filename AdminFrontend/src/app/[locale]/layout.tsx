import { Geist, Geist_Mono } from "next/font/google";
import "../globals.css";
import { cn } from "@/lib/utils";
import { routing } from "@/i18n/routing";
import { notFound } from "next/navigation";
import {
  getMessages,
  getTranslations,
  setRequestLocale,
} from "next-intl/server";
import { NextIntlClientProvider } from "next-intl";
import Header from "@/components/shared/header";
import QueryProvider from "@@/providers/tansktack-provider";
import { GlobalAppProvider } from "@@/providers/app-global-context-provider";
import { ConfirmationDialog } from "@/components/modals/confirmation-dialog";
import { Toaster } from "@/components/ui/sonner";
import { SocketProvider } from "@@/providers/websocket-provider";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export function generateStaticParams() {
  return routing.locales.map((locale) => ({ locale }));
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;
  const t = await getTranslations({ locale, namespace: "LocaleLayout" });

  return {
    title: t("title"),
    description: t("description"),
  };
}

export default async function LocaleLayout({
  children,
  params,
}: Readonly<{
  children: React.ReactNode;
  params: Promise<{ locale: string }>;
}>) {
  // Extract the locale from the incoming `params`
  const { locale } = await params;

  // Ensure that the incoming `locale` is valid
  if (!routing.locales.includes(locale as any)) {
    notFound();
  }

  // Enable static rendering
  setRequestLocale(locale);

  // Providing all messages to the client
  // side is the easiest way to get started
  const messages = await getMessages();

  return (
    <html className="min-h-screen min-w-full !scroll-smooth" lang={locale}>
      <body
        className={cn(
          "h-full w-full font-sans antialiased",
          geistSans.variable,
          geistMono.variable,
        )}
      >
        <SocketProvider>
          <GlobalAppProvider>
            <ConfirmationDialog />
            <Toaster position="top-right" />
            <QueryProvider>
              <NextIntlClientProvider messages={messages}>
                <div className="flex h-full w-full flex-col items-center bg-white">
                  <Header />
                  {children}
                </div>
              </NextIntlClientProvider>
            </QueryProvider>
          </GlobalAppProvider>
        </SocketProvider>
      </body>
    </html>
  );
}
