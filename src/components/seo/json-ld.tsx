import { SITE_CONFIG } from "@/lib/constants";

export function WebSiteSchema() {
  const schema = {
    "@context": "https://schema.org",
    "@type": "WebSite",
    name: SITE_CONFIG.name,
    alternateName: SITE_CONFIG.shortName,
    url: SITE_CONFIG.url,
    potentialAction: {
      "@type": "SearchAction",
      target: {
        "@type": "EntryPoint",
        urlTemplate: `${SITE_CONFIG.url}/programs?search={search_term_string}`,
      },
      "query-input": "required name=search_term_string",
    },
  };

  return (
    <script
      type="application/ld+json"
      dangerouslySetInnerHTML={{ __html: JSON.stringify(schema) }}
    />
  );
}

export function OrganizationSchema() {
  const schema = {
    "@context": "https://schema.org",
    "@type": ["Organization", "EducationalOrganization"],
    "@id": `${SITE_CONFIG.url}/#organization`,
    name: SITE_CONFIG.name,
    alternateName: [SITE_CONFIG.shortName, "Emerging Edge School"],
    url: SITE_CONFIG.url,
    logo: {
      "@type": "ImageObject",
      url: `${SITE_CONFIG.url}${SITE_CONFIG.logo}`,
      width: 512,
      height: 512,
    },
    image: `${SITE_CONFIG.url}${SITE_CONFIG.logo}`,
    description: SITE_CONFIG.description,
    slogan: SITE_CONFIG.tagline,
    email: SITE_CONFIG.email,
    telephone: SITE_CONFIG.phone,
    sameAs: Object.values(SITE_CONFIG.social),
    address: {
      "@type": "PostalAddress",
      addressCountry: "PK",
      addressRegion: "Sindh",
      addressLocality: "Karachi",
      streetAddress: SITE_CONFIG.address,
    },
    contactPoint: [
      {
        "@type": "ContactPoint",
        telephone: SITE_CONFIG.phone,
        contactType: "Customer Support & Admissions",
        email: SITE_CONFIG.email,
        areaServed: ["PK", "US", "AE", "GB", "CA", "SA"],
        availableLanguage: ["English", "Urdu"],
      },
    ],
  };

  return (
    <script
      type="application/ld+json"
      dangerouslySetInnerHTML={{ __html: JSON.stringify(schema) }}
    />
  );
}

interface CourseSchemaProps {
  name: string;
  description: string;
  slug: string;
  price?: number | string;
  currency?: string;
  courseCode?: string;
}

export function CourseSchema({
  name,
  description,
  slug,
  price = 5000,
  currency = "PKR",
  courseCode,
}: CourseSchemaProps) {
  const schema = {
    "@context": "https://schema.org",
    "@type": "Course",
    name,
    description,
    courseCode: courseCode || `EEST-${slug.toUpperCase()}`,
    url: `${SITE_CONFIG.url}/programs/${slug}`,
    educationalLevel: "Professional Certification",
    inLanguage: "en",
    provider: {
      "@type": "EducationalOrganization",
      name: SITE_CONFIG.name,
      sameAs: SITE_CONFIG.url,
    },
    offers: {
      "@type": "Offer",
      category: "Paid",
      price: String(price),
      priceCurrency: currency,
      availability: "https://schema.org/InStock",
      validFrom: "2026-01-01",
      url: `${SITE_CONFIG.url}/register?program=${slug}`,
    },
    hasCourseInstance: {
      "@type": "CourseInstance",
      courseMode: ["online", "blended"],
      courseWorkload: "PT8W",
      instructor: {
        "@type": "Person",
        name: "Industry Expert Trainer",
      },
    },
  };

  return (
    <script
      type="application/ld+json"
      dangerouslySetInnerHTML={{ __html: JSON.stringify(schema) }}
    />
  );
}

interface FAQSchemaProps {
  faqs: { question: string; answer: string }[];
}

export function FAQSchema({ faqs }: FAQSchemaProps) {
  const schema = {
    "@context": "https://schema.org",
    "@type": "FAQPage",
    mainEntity: faqs.map((faq) => ({
      "@type": "Question",
      name: faq.question,
      acceptedAnswer: {
        "@type": "Answer",
        text: faq.answer,
      },
    })),
  };

  return (
    <script
      type="application/ld+json"
      dangerouslySetInnerHTML={{ __html: JSON.stringify(schema) }}
    />
  );
}

interface BreadcrumbSchemaProps {
  items: { name: string; url: string }[];
}

export function BreadcrumbSchema({ items }: BreadcrumbSchemaProps) {
  const schema = {
    "@context": "https://schema.org",
    "@type": "BreadcrumbList",
    itemListElement: items.map((item, index) => ({
      "@type": "ListItem",
      position: index + 1,
      name: item.name,
      item: item.url.startsWith("http") ? item.url : `${SITE_CONFIG.url}${item.url.startsWith("/") ? "" : "/"}${item.url}`,
    })),
  };

  return (
    <script
      type="application/ld+json"
      dangerouslySetInnerHTML={{ __html: JSON.stringify(schema) }}
    />
  );
}

export function SupportServiceSchema() {
  const schema = {
    "@context": "https://schema.org",
    "@type": "ContactPage",
    name: "EEST Helpdesk & Student Support",
    url: `${SITE_CONFIG.url}/support`,
    description: "Submit support tickets, track issues, and get assistance with courses, verification, and portal access within 48 hours.",
    mainEntity: {
      "@type": "EducationalOrganization",
      name: SITE_CONFIG.name,
      contactPoint: {
        "@type": "ContactPoint",
        telephone: SITE_CONFIG.phone,
        contactType: "Student Support",
        email: SITE_CONFIG.email,
      },
    },
  };

  return (
    <script
      type="application/ld+json"
      dangerouslySetInnerHTML={{ __html: JSON.stringify(schema) }}
    />
  );
}
