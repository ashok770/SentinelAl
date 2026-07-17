const navLinks = [
  { name: "Features",      href: "#features"     },
  { name: "How It Works",  href: "#how-it-works"  },
  { name: "Why SentinelAI", href: "#why-sentinel" },
  { name: "Integrations",  href: "#integrations"  },
  { name: "Enterprise",    href: "#enterprise"    },
  { name: "FAQ",           href: "#faq"           },
  { name: "Contact",       href: "#contact"       },
];

function Navbar() {
  return (
    <header className="fixed top-0 left-0 w-full z-50">
      <nav className="mx-auto flex max-w-7xl items-center justify-between px-8 py-5">
        {/* Logo */}
        <a href="#hero" className="text-3xl font-bold tracking-tight text-white">
          Sentinel<span className="text-blue-400">AI</span>
        </a>

        {/* Navigation */}
        <ul className="hidden lg:flex items-center gap-10">
          {navLinks.map((link) => (
            <li key={link.name}>
              <a
                href={link.href}
                className="text-sm font-medium text-slate-300 transition hover:text-white"
              >
                {link.name}
              </a>
            </li>
          ))}
        </ul>

        {/* Actions */}
        <div className="flex items-center gap-4">
          <button className="rounded-xl border border-slate-600 px-5 py-2 text-sm text-white transition hover:border-slate-500">
            Login
          </button>

          <a
            href="#contact"
            className="rounded-xl bg-blue-500 px-5 py-2 text-sm font-medium text-white shadow-lg shadow-blue-500/20 transition hover:bg-blue-400"
          >
            Get Started
          </a>
        </div>
      </nav>
    </header>
  );
}

export default Navbar;
