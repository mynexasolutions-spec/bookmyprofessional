const SITE_URL = process.env.NEXT_PUBLIC_SITE_URL || "https://bookmyprofessional.com";

export const metadata = {
  title: "Create an Account | Book My Professional",
  description: "Register for BookMyProfessional to hire verified experts across India or list your services to connect with local clients.",
  robots: {
    index: false,
    follow: true,
  },
  alternates: {
    canonical: `${SITE_URL}/register`,
  },
  openGraph: {
    type: "website",
    locale: "en_IN",
    url: `${SITE_URL}/register`,
    siteName: "Book My Professional",
    title: "Create a Free Account | Book My Professional",
    description: "Join BookMyProfessional as a customer to hire verified experts, or as a professional to grow your services across India.",
    images: [
      {
        url: `${SITE_URL}/og-image.png`,
        width: 1200,
        height: 630,
        alt: "Create an Account — Book My Professional",
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title: "Create a Free Account | Book My Professional",
    description: "Join BookMyProfessional as a customer or professional to access verified services across India.",
    images: [`${SITE_URL}/og-image.png`],
  },
};

export default function RegisterLayout({ children }) {
  return children;
}
