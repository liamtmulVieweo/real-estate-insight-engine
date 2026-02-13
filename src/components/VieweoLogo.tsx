import vieweoLogo from "@/assets/vieweo-logo.png";

export function VieweoLogo({ className = "" }: { className?: string }) {
  return (
    <img
      src={vieweoLogo}
      alt="Vieweo"
      className={className}
    />
  );
}
