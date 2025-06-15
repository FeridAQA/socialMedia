// config/site.ts
export type SiteConfig = typeof siteConfig;

export const siteConfig = {
  name: "ACME", // Şirkətinizin adı
  description: "Made with Next.js and HeroUI", // Saytın təsviri
  navItems: [
    {
      label: "Ana Səhifə",
      href: "/",
    },
  ],
  navMenuItems: [ // Mobil menyu üçün itemlər
    {
      label: "Ana Səhifə",
      href: "/",
    },
  ],
  links: {
    linkedin: "https://www.linkedin.com/in/feridaqa/",
    github: "https://github.com/FeridAQA",
    // Partner linki silindi
    // Sponsor linki silindi
  },
};