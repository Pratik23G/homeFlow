"use client";

import Link from "next/link";
import { useState } from "react";
import { Logo } from "./Logo";
import { Button } from "./Button";

const links = [
  { href: "/#services", label: "Services" },
  { href: "/#how", label: "How it works" },
  { href: "/#pricing", label: "Pricing" },
  { href: "/#area", label: "Service area" },
  { href: "/#about", label: "About" },
  { href: "/#faq", label: "FAQ" },
];

export function Nav() {
  const [open, setOpen] = useState(false);
  return (
    <header className="sticky top-0 z-50 border-b border-line bg-black/95 backdrop-blur">
      <div className="mx-auto flex max-w-6xl items-center justify-between px-5 py-3">
        <Link href="/" aria-label="HomeFlow home">
          <Logo />
        </Link>
        <nav className="hidden items-center gap-7 text-sm lg:flex">
          {links.map((l) => (
            <Link key={l.href} href={l.href} className="text-white/80 hover:text-gold">
              {l.label}
            </Link>
          ))}
          <Button href="/book">Book a free consult</Button>
        </nav>
        <button
          className="rounded border border-line px-3 py-2 text-sm lg:hidden"
          aria-expanded={open}
          aria-label="Toggle menu"
          onClick={() => setOpen(!open)}
        >
          {open ? "Close" : "Menu"}
        </button>
      </div>
      {open && (
        <nav className="flex flex-col gap-4 border-t border-line px-5 py-5 lg:hidden">
          {links.map((l) => (
            <Link key={l.href} href={l.href} onClick={() => setOpen(false)} className="text-white/90">
              {l.label}
            </Link>
          ))}
          <Button href="/book">Book a free consult</Button>
        </nav>
      )}
    </header>
  );
}
