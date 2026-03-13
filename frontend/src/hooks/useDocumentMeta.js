import { useEffect } from "react";

const useDocumentMeta = ({ title, description, robots = "index, follow" }) => {
  useEffect(() => {
    const siteName = "Bazarmart";
    const currentUrl = window.location.href;
    const defaultImage = `${window.location.origin}/vite.svg`;

    const setMeta = (selector, attr, value, content) => {
      let tag = document.querySelector(selector);
      if (!tag) {
        tag = document.createElement("meta");
        tag.setAttribute(attr, value);
        document.head.appendChild(tag);
      }
      tag.setAttribute("content", content);
    };

    const setLink = (selector, rel, href) => {
      let tag = document.querySelector(selector);
      if (!tag) {
        tag = document.createElement("link");
        tag.setAttribute("rel", rel);
        document.head.appendChild(tag);
      }
      tag.setAttribute("href", href);
    };

    if (title) document.title = title;

    if (description) {
      setMeta('meta[name="description"]', "name", "description", description);
    }

    const effectiveTitle = title || `${siteName} - Premium Online Store`;
    const effectiveDescription =
      description ||
      "Shop electronics, clothing, shoes, books, and more with secure checkout at Bazarmart.";

    setMeta('meta[property="og:title"]', "property", "og:title", effectiveTitle);
    setMeta('meta[property="og:description"]', "property", "og:description", effectiveDescription);
    setMeta('meta[property="og:type"]', "property", "og:type", "website");
    setMeta('meta[property="og:url"]', "property", "og:url", currentUrl);
    setMeta('meta[property="og:site_name"]', "property", "og:site_name", siteName);
    setMeta('meta[property="og:image"]', "property", "og:image", defaultImage);

    setMeta('meta[name="twitter:card"]', "name", "twitter:card", "summary_large_image");
    setMeta('meta[name="twitter:title"]', "name", "twitter:title", effectiveTitle);
    setMeta('meta[name="twitter:description"]', "name", "twitter:description", effectiveDescription);
    setMeta('meta[name="twitter:image"]', "name", "twitter:image", defaultImage);
    setMeta('meta[name="robots"]', "name", "robots", robots);

    setLink('link[rel="canonical"]', "canonical", currentUrl);
  }, [title, description, robots]);
};

export default useDocumentMeta;
