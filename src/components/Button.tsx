import Link from "next/link";

type Props = {
  href: string;
  children: React.ReactNode;
  variant?: "solid" | "outline";
  size?: "md" | "sm";
  className?: string;
};

export function Button({ href, children, variant = "solid", size = "md", className = "" }: Props) {
  const base =
    "inline-flex items-center justify-center gap-2 rounded-full font-medium transition-[color,background-color,border-color,transform] duration-150 ease-out active:scale-[0.98] ";
  const sizes = size === "sm" ? "h-10 px-5 text-sm" : "h-12 px-6 text-[15px]";
  const styles =
    variant === "solid"
      ? "bg-gold text-charcoal hover:bg-gold-dark hover:text-white"
      : "border border-gold text-gold-dark hover:bg-gold hover:text-charcoal";
  return (
    <Link href={href} className={`${base} ${sizes} ${styles} ${className}`}>
      {children}
    </Link>
  );
}
