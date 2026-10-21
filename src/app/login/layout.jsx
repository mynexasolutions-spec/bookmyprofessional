const SITE_URL = process.env.NEXT_PUBLIC_SITE_URL || "https://bookmyprofessional.com";

export const metadata = {
  title: "Sign In | Book My Professional",
  description: "Sign in to your BookMyProfessional account to manage appointments, bookings, and direct messages with verified professionals.",
  robots: {
    index: false,
    follow: true,
  },
  alternates: {
    canonical: `${SITE_URL}/login`,
  },
  openGraph: {
    type: "website",
    locale: "en_IN",
    url: `${SITE_URL}/login`,
    siteName: "Book My Professional",
    title: "Sign In | Book My Professional",
    description: "Access your account to manage bookings, appointments, and professional services on BookMyProfessional.",
    images: [
      {
        url: `${SITE_URL}/og-image.png`,
        width: 1200,
        height: 630,
        alt: "Sign In — Book My Professional",
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title: "Sign In | Book My Professional",
    description: "Access your account to manage bookings and appointments on BookMyProfessional.",
    images: [`${SITE_URL}/og-image.png`],
  },
};

export default function LoginLayout({ children }) {
  return children;
}
