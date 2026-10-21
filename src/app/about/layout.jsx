const SITE_URL = process.env.NEXT_PUBLIC_SITE_URL || "https://bookmyprofessional.com";

export const metadata = {
  title: "About Us — Our Story, Mission & Team",
  description: "Learn about BookMyProfessional — India's trusted platform for verified professionals. Discover our founding story, values, multi-tier verification process, and our vision to eliminate friction in hiring experts.",
  alternates: {
    canonical: `${SITE_URL}/about`,
  },
  openGraph: {
    type: "website",
    locale: "en_IN",
    url: `${SITE_URL}/about`,
    siteName: "Book My Professional",
    title: "About Us | Book My Professional",
    description: "India's trusted platform for verified professionals. Discover our mission to connect people with the best doctors, tutors, electricians, and more.",
    images: [
      {
        url: `${SITE_URL}/og-image.png`,
        width: 1200,
        height: 630,
        alt: "About Book My Professional",
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title: "About Us | Book My Professional",
    description: "India's trusted platform for verified professionals. Discover our story and mission.",
    images: [`${SITE_URL}/og-image.png`],
  },
};

export default function AboutLayout({ children }) {
  return children;
}
