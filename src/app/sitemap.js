const SITE_URL = process.env.NEXT_PUBLIC_SITE_URL || "https://bookmyprofessional.com";

const PUBLIC_ROUTES = ["", "/professionals", "/about", "/contact", "/login", "/register"];

export default function sitemap() {
  const lastModified = new Date();
  return PUBLIC_ROUTES.map((route) => ({
    url: `${SITE_URL}${route}`,
    lastModified,
  }));
}
