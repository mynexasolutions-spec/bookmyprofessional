const SITE_URL = process.env.NEXT_PUBLIC_SITE_URL || "https://bookmyprofessional.com";

export const metadata = {
  title: "Create a Free Account — Join as Customer or Professional",
  description: "Sign up to BookMyProfessional as a customer to book verified experts, or register as a professional to offer your services and grow your business across India.",
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
