const footerSections = [
  {
    title: "Product",
    links: ["Features", "How It Works", "Integrations", "Enterprise"],
  },
  {
    title: "Resources",
    links: ["FAQ", "Privacy Policy", "Terms of Service"],
  },
  {
    title: "Company",
    links: ["About", "Contact"],
  },
];

function FooterLinks() {
  return (
    <div className="grid grid-cols-3 gap-12">
      {footerSections.map((section) => (
        <div key={section.title}>
          <h3 className="mb-5 text-sm font-semibold uppercase tracking-wider text-white">
            {section.title}
          </h3>

          <ul className="space-y-3">
            {section.links.map((link) => (
              <li
                key={link}
                className="cursor-pointer text-slate-400 transition hover:text-cyan-300"
              >
                {link}
              </li>
            ))}
          </ul>
        </div>
      ))}
    </div>
  );
}

export default FooterLinks;
