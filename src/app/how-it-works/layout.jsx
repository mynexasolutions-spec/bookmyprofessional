const SITE_URL = process.env.NEXT_PUBLIC_SITE_URL || "https://bookmyprofessional.com";

export const metadata = {
  title: "How It Works | Book My Professional",
  description: "Learn how BookMyProfessional connects you with verified experts in 4 simple steps. Discover our escrow payment protection, multi-tier background verification, and satisfaction guarantee.",
  alternates: {
    canonical: `${SITE_URL}/how-it-works`,
  },
  openGraph: {
    type: "website",
    locale: "en_IN",
    url: `${SITE_URL}/how-it-works`,
    siteName: "Book My Professional",
    title: "How It Works | Book My Professional",
    description: "Learn how BookMyProfessional connects you with verified experts in 4 simple steps with escrow payment security.",
    images: [
      {
        url: `${SITE_URL}/og-image.png`,
        width: 1200,
        height: 630,
        alt: "How BookMyProfessional Works",
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title: "How It Works | Book My Professional",
    description: "Learn how BookMyProfessional connects you with verified experts in 4 simple steps with escrow payment security.",
    images: [`${SITE_URL}/og-image.png`],
  },
};

export default function HowItWorksLayout({ children }) {
  return children;
}
