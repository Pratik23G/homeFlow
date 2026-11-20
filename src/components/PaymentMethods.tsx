import { PAY_APPLE_PAY, PAY_VENMO, PAY_ZELLE } from "@/lib/content";

const methods = [
  { name: "Zelle", value: PAY_ZELLE, hint: "Send to this email or phone" },
  { name: "Venmo", value: PAY_VENMO, hint: "Send to this handle" },
  { name: "Apple Pay", value: PAY_APPLE_PAY, hint: "Apple Cash via Messages" },
];

export function PaymentMethods() {
  return (
    <div className="grid gap-4 sm:grid-cols-3">
      {methods.map((m) => (
        <div key={m.name} className="rounded-xl border border-line bg-paper p-5 text-center">
          <p className="font-serif text-2xl font-medium">{m.name}</p>
          <p className="mt-1 break-all text-sm font-medium text-gold-dark">{m.value || "Shared with your estimate"}</p>
          <p className="mt-1 text-sm text-muted">{m.hint}</p>
        </div>
      ))}
    </div>
  );
}
