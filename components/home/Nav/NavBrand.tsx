import Link from "next/link";

interface NavBrandProps {
  isScrolled: boolean;
  isDarkTheme: boolean;
}

export function NavBrand({ isScrolled, isDarkTheme }: NavBrandProps) {
  return (
    <div className="flex items-center gap-3">
      <Link href="/" className="flex items-center gap-3">
        <span className="font-display text-[1.1rem]">Devs Arena</span>
      </Link>
      <span className={`font-mono text-[0.6rem] opacity-35 border-l pl-3 hidden sm:block transition-colors duration-300 ${
        isDarkTheme ? "border-[#F1EFE9]/20" : "border-[#0E0E0D]/20"
      }`}>
        Egypt tech · salary transparency
      </span>
    </div>
  );
}
