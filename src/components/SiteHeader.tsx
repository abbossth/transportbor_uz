import Link from "next/link";
import { NavLinks } from "./NavLinks";
import { ThemeToggle } from "./ThemeToggle";
import { HeaderMicButton } from "./HeaderMicButton";

export function SiteHeader() {
  return (
    <header className="sticky top-0 z-40 border-b border-line bg-bg/85 backdrop-blur-md">
      <div className="mx-auto flex h-16 max-w-[1200px] items-center justify-between gap-2 px-4 sm:px-6">
        <Link href="/" aria-label="TransportBor — bosh sahifa" className="flex shrink-0 items-center">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img src="/brand/transportbor-icon.svg" alt="" width={36} height={36} className="size-9 sm:hidden" />
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img src="/brand/transportbor-logo-horizontal.svg" alt="TransportBor" width={168} height={34} className="hidden h-[34px] w-auto sm:block dark:sm:hidden" />
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img src="/brand/transportbor-logo-horizontal-dark.svg" alt="TransportBor" width={168} height={34} className="hidden h-[34px] w-auto dark:sm:block" />
        </Link>
        <div className="flex min-w-0 items-center gap-1 sm:gap-2">
          <NavLinks />
          <HeaderMicButton />
          <ThemeToggle />
        </div>
      </div>
    </header>
  );
}
