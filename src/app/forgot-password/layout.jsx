const SITE_URL = process.env.NEXT_PUBLIC_SITE_URL || "https://bookmyprofessional.com";

export const metadata = {
  title: "Reset Your Password",
  description: "Forgot your BookMyProfessional password? Enter your registered email to receive a secure reset link. Quick, safe, and simple account recovery.",
  alternates: {
    canonical: `${SITE_URL}/forgot-password`,
  },
  openGraph: {
    type: "website",
    locale: "en_IN",
    url: `${SITE_URL}/forgot-password`,
    siteName: "Book My Professional",
    title: "Forgot Password | Book My Professional",
    description: "Reset your BookMyProfessional account password securely via email.",
    images: [
      {
        url: `${SITE_URL}/og-image.png`,
        width: 1200,
        height: 630,
        alt: "Reset Password — Book My Professional",
      },
    ],
  },
};

export default function ForgotPasswordLayout({ children }) {
  return children;
}
