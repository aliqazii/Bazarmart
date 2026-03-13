import { useEffect } from "react";
import { useLocation } from "react-router-dom";
import useDocumentMeta from "../hooks/useDocumentMeta";

const PAGE_META = [
  {
    match: /^\/$/,
    title: "Bazarmart - Premium Online Store",
    description:
      "Discover electronics, clothing, shoes, books, and more at Bazarmart with secure checkout and fast delivery.",
  },
  {
    match: /^\/products/,
    title: "Products | Bazarmart",
    description:
      "Browse our curated product catalog with filters by category, price, and popularity on Bazarmart.",
  },
  {
    match: /^\/product\//,
    title: "Product Details | Bazarmart",
    description: "View product details, reviews, and variant options before checkout at Bazarmart.",
  },
  {
    match: /^\/contact/,
    title: "Contact Us | Bazarmart",
    description:
      "Get in touch with Bazarmart support for order help, product inquiries, and customer service assistance.",
  },
  {
    match: /^\/cart/,
    title: "Your Cart | Bazarmart",
    description: "Review cart items, adjust quantities, and continue to secure checkout at Bazarmart.",
  },
  {
    match: /^\/login/,
    title: "Login | Bazarmart",
    description: "Login to your Bazarmart account to track orders, manage wishlist, and checkout faster.",
    robots: "noindex, nofollow",
  },
  {
    match: /^\/register/,
    title: "Create Account | Bazarmart",
    description: "Create your Bazarmart account to save favorites, manage orders, and enjoy seamless shopping.",
    robots: "noindex, nofollow",
  },
  {
    match: /^\/(profile|shipping|order\/confirm|payment|orders|order\/|tracking\/|wishlist|returns|rewards)/,
    title: "Account | Bazarmart",
    description: "Manage your account, orders, wishlist, and secure checkout steps on Bazarmart.",
    robots: "noindex, nofollow",
  },
  {
    match: /^\/admin/,
    title: "Admin Dashboard | Bazarmart",
    description: "Bazarmart admin dashboard and management tools.",
    robots: "noindex, nofollow",
  },
];

const defaultMeta = {
  title: "Bazarmart - Premium Online Store",
  description:
    "Shop electronics, clothing, shoes, books, and more with secure checkout and fast delivery at Bazarmart.",
};

const SeoManager = () => {
  const { pathname } = useLocation();

  const current = PAGE_META.find((page) => page.match.test(pathname)) || defaultMeta;

  useDocumentMeta({
    title: current.title,
    description: current.description,
    robots: current.robots || "index, follow",
  });

  useEffect(() => {
    const scriptId = "bazarmart-ld-json";
    const existing = document.getElementById(scriptId);
    if (existing) existing.remove();

    const base = window.location.origin;
    const schema = {
      "@context": "https://schema.org",
      "@graph": [
        {
          "@type": "Organization",
          name: "Bazarmart",
          url: base,
          logo: `${base}/vite.svg`,
        },
        {
          "@type": "WebSite",
          name: "Bazarmart",
          url: base,
          potentialAction: {
            "@type": "SearchAction",
            target: `${base}/products?keyword={search_term_string}`,
            "query-input": "required name=search_term_string",
          },
        },
      ],
    };

    const script = document.createElement("script");
    script.id = scriptId;
    script.type = "application/ld+json";
    script.text = JSON.stringify(schema);
    document.head.appendChild(script);
  }, [pathname]);

  return null;
};

export default SeoManager;