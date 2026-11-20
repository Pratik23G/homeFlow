"use client";

import Link from "next/link";
import { useState } from "react";
import { Logo } from "./Logo";
import { Button } from "./Button";

const links = [
  { href: "/#home", label: "Home" },
  { href: "/#services", label: "Services" },
  { href: "/#approach", label: "Our approach" },
  { href: "/#about", label: "About" },
  { href: "/#area", label: "Service area" },
];

export function Nav() {
  const [open, setOpen] = useState(false);
  return (
    <header className="sticky top-0 z-50 border-b border-line bg-paper/95 backdrop-blur">
      <div className="mx-auto flex max-w-6xl items-center justify-between px-5 py-3">
        <Link href="/" aria-label="HomeFlow home">
          <Logo />
        </Link>
        <nav aria-label="Main" className="hidden items-center gap-7 text-sm lg:flex">
          {links.map((l) => (
            <Link key={l.href} href={l.href} className="text-charcoal/80 transition-colors duration-150 hover:text-gold-dark">
              {l.label}
            </Link>
          ))}
          <Button href="/book" size="sm">Book an assessment</Button>
        </nav>
        <button
          className="h-10 rounded-lg border border-line px-4 text-sm lg:hidden"
          aria-expanded={open}
          aria-label="Toggle menu"
          onClick={() => setOpen(!open)}
        >
          {open ? "Close" : "Menu"}
        </button>
      </div>
      {open && (
        <nav aria-label="Mobile" className="flex flex-col gap-4 border-t border-line px-5 py-5 lg:hidden">
          {links.map((l) => (
            <Link key={l.href} href={l.href} onClick={() => setOpen(false)} className="text-charcoal">
              {l.label}
            </Link>
          ))}
          <Button href="/book">Book an assessment</Button>
        </nav>
      )}
    </header>
  );
}
