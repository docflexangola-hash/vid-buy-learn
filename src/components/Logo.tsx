import logoSrc from "@/assets/ondjango-logo.png";

export function Logo({ className = "h-10" }: { className?: string }) {
  return <img src={logoSrc} alt="Ondjango Capital" className={className} />;
}
