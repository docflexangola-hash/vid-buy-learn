import logo from "@/assets/ondjango-logo.png.asset.json";

export function Logo({ className = "h-10" }: { className?: string }) {
  return <img src={logo.url} alt="Ondjango Capital" className={className} />;
}
