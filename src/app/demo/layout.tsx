import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Cognireal Demo — Document Analyzer",
  description:
    "Try Cognireal's AI document analyzer. Upload a PDF or spreadsheet and ask questions grounded in your file.",
  robots: {
    index: false,
    follow: false,
  },
  alternates: {
    canonical: "https://cognireal.com/demo",
  },
  openGraph: {
    title: "Cognireal Demo — Document Analyzer",
    description:
      "Upload a document and chat with an AI assistant that answers only from your file.",
    url: "https://cognireal.com/demo",
    siteName: "Cognireal",
    type: "website",
  },
};

export default function DemoLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return children;
}
