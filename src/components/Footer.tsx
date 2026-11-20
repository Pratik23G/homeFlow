import { Logo } from "./Logo";
import { Year } from "./Year";
import { BUSINESS_EMAIL, BUSINESS_PHONE, INSTAGRAM_URL } from "@/lib/content";

const link = "transition-colors duration-150 hover:text-gold-dark";

export function Footer() {
  return (
    <footer className="border-t border-line bg-cream px-5 py-12">
      <div className="mx-auto grid max-w-6xl gap-8 sm:grid-cols-2">
        <div>
          <Logo />
          <p className="mt-4 font-serif text-xl text-charcoal">Your home. In rhythm. By design.</p>
        </div>
        <div className="space-y-1 text-sm text-muted sm:justify-self-end sm:text-right">
          <p>Serving San Francisco and the Peninsula</p>
          {BUSINESS_PHONE && <p><a className={link} href={`tel:${BUSINESS_PHONE}`}>{BUSINESS_PHONE}</a></p>}
          {BUSINESS_EMAIL && <p><a className={link} href={`mailto:${BUSINESS_EMAIL}`}>{BUSINESS_EMAIL}</a></p>}
          <p>
            <a href={INSTAGRAM_URL} target="_blank" rel="noopener noreferrer" className={link}>Instagram</a>
          </p>
        </div>
      </div>
      <p className="mx-auto mt-10 max-w-6xl border-t border-line pt-6 text-sm text-muted">© <Year /> HomeFlow</p>
    </footer>
  );
}
