const SITE_URL = process.env.NEXT_PUBLIC_SITE_URL || "https://bookmyprofessional.com";

export const metadata = {
  title: "Browse Verified Professionals | Hire Doctors, Tutors, Electricians & More",
  description: "Search and hire verified, background-checked doctors, tutors, electricians, plumbers, IT experts, beauticians, cleaners and consultants across India. Compare profiles, ratings, and availability.",
  alternates: {
    canonical: `${SITE_URL}/professionals`,
  },
  openGraph: {
    type: "website",
    locale: "en_IN",
    url: `${SITE_URL}/professionals`,
    siteName: "Book My Professional",
    title: "Browse Verified Professionals | Book My Professional",
    description: "Search and hire verified doctors, tutors, electricians, plumbers, IT experts and more across India. Compare profiles, ratings, and book instantly.",
    images: [
      {
        url: `${SITE_URL}/og-image.png`,
        width: 1200,
        height: 630,
        alt: "Browse Verified Professionals — Book My Professional",
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title: "Browse Verified Professionals | Book My Professional",
    description: "Search and hire verified doctors, tutors, electricians, plumbers, IT experts and more across India.",
    images: [`${SITE_URL}/og-image.png`],
  },
};

export default function ProfessionalsLayout({ children }) {
  return children;
}
