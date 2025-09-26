import type { Metadata } from "next";
import "./globals.css";
import { Toaster } from "@/components/ui/sonner";
import { NextIntlClientProvider } from "next-intl";
import { getLocale } from "next-intl/server";
import { QueryProvider } from "@/components/providers/query-provider";

export const metadata: Metadata = {
  title: "Sri Mul - UMKM Chatbot",
  description: "UMKM chatbot assistant, mudah dan tepat",
};

export default async function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  const locale = await getLocale();

  return (
    <html lang={locale}>
      <body
        className={`antialiased`}
      >
        <QueryProvider>
          <NextIntlClientProvider>
            {children}
            <Toaster position="top-center"/>
          </NextIntlClientProvider>
        </QueryProvider>
      </body>
    </html>
  );
}
