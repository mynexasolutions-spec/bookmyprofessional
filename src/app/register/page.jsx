/**
 * Register — server wrapper.
 * Generates unique title / description / canonical per ?role= variant so
 * Google does not flag duplicate titles across /register and /register?role=professional.
 */

import RegisterClient from "./RegisterClient";

const SITE_URL = process.env.NEXT_PUBLIC_SITE_URL || "https://bookmyprofessional.com";
const OG_IMG   = `${SITE_URL}/og-image.png`;
const SITE_NAME = "Book My Professional";

export async function generateMetadata({ searchParams }) {
  const role = searchParams?.role;

  if (role === "professional") {
    return {
      title: "Join as a Professional | Book My Professional",
      description:
        "Register as a verified professional on BookMyProfessional to connect with customers, manage your appointments, and grow your service business across India.",
      alternates: { canonical: `${SITE_URL}/register?role=professional` },
      openGraph: {
        type: "website", locale: "en_IN",
        url: `${SITE_URL}/register?role=professional`,
        siteName: SITE_NAME,
        title: "Join as a Professional | Book My Professional",
        description:
          "Create your professional account to offer services, manage bookings, and grow your business with BookMyProfessional.",
        images: [{ url: OG_IMG, width: 1200, height: 630, alt: "Join as a Professional — Book My Professional" }],
      },
      twitter: {
        card: "summary_large_image",
        title: "Join as a Professional | Book My Professional",
        description:
          "Offer your services, manage appointments, and grow your client base with BookMyProfessional.",
        images: [OG_IMG],
      },
    };
  }

  // Default — /register (customer sign-up or role chooser)
  return {
    title: "Create a Free Account | Book My Professional",
    description:
      "Sign up on BookMyProfessional to hire verified experts near you or list your professional services and connect with customers across India.",
    alternates: { canonical: `${SITE_URL}/register` },
    openGraph: {
      type: "website", locale: "en_IN",
      url: `${SITE_URL}/register`,
      siteName: SITE_NAME,
      title: "Create a Free Account | Book My Professional",
      description:
        "Join BookMyProfessional as a customer to hire verified experts or as a professional to grow your services across India.",
      images: [{ url: OG_IMG, width: 1200, height: 630, alt: "Create a Free Account — Book My Professional" }],
    },
    twitter: {
      card: "summary_large_image",
      title: "Create a Free Account | Book My Professional",
      description:
        "Join BookMyProfessional as a customer or professional to access verified services across India.",
      images: [OG_IMG],
    },
  };
}

export default function RegisterPage() {
  return <RegisterClient />;
}
