import { BrandLogo } from "./BrandLogo";
import { HeaderControls } from "./HeaderControls";

export function SiteHeader() {
  return (
    <header className="sticky top-0 z-40 border-b border-border/60 bg-background/80 backdrop-blur-xl">
      <div className="mx-auto flex h-16 max-w-7xl items-center justify-between gap-3 px-4 sm:px-6 lg:px-8">
        <BrandLogo />
        <HeaderControls />
      </div>
    </header>
  );
}

