import { Logo } from "./Logo";
import { Year } from "./Year";

export function Footer() {
  return (
    <footer className="border-t border-line bg-black px-5 py-10">
      <div className="mx-auto flex max-w-6xl flex-col items-start justify-between gap-6 sm:flex-row sm:items-center">
        <Logo />
        <p className="text-sm text-muted">
          Kitchen organization &amp; setup · SF Peninsula
        </p>
        <p className="text-sm text-muted">
          © <Year /> HomeFlow. All rights reserved.
        </p>
      </div>
    </footer>
  );
}
