import FooterBrand from "./components/FooterBrand";
import FooterLinks from "./components/FooterLinks";
import FooterBottom from "./components/FooterBottom";

function Footer() {
  return (
    <footer className="bg-[#050816] border-t border-slate-900">
      <div className="mx-auto max-w-7xl px-6 py-20">
        <div className="flex flex-col justify-between gap-16 lg:flex-row">
          <FooterBrand />
          <FooterLinks />
        </div>

        <FooterBottom />
      </div>
    </footer>
  );
}

export default Footer;
