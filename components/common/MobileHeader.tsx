"use client";

import { SidebarTrigger } from "@/components/ui/sidebar";
import { UserProfileDropdown } from "./UserProfileDropdown";

interface UserSession {
  user: {
    id: string;
    name?: string;
    email?: string;
    image?: string;
  };
}

interface MobileHeaderProps {
  session: UserSession | null;
  className?: string;
}

export function MobileHeader({ session, className }: MobileHeaderProps) {
  return (
    <header className={`flex h-16 md:h-0 items-center gap-4 px-4 flex-shrink-0 ${className}`}>
      <SidebarTrigger className="md:hidden" />
      <p className="text-xl font-semibold md:hidden truncate font-[Lilita_One] text-shadow-sm tracking-widest text-[#fb8500]">
        Sri Mul
      </p>
      <div className="flex-1" />

      {/* Mobile avatar in top right */}
      <div className="md:hidden fixed top-4 right-4 z-50">
        <UserProfileDropdown
          session={session}
          variant="mobile"
        />
      </div>
    </header>
  );
}