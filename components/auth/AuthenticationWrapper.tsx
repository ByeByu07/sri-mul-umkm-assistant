"use client";

import { AuthModal } from "@/components/auth-modal";

interface UserSession {
  user: {
    id: string;
    name?: string;
    email?: string;
    image?: string;
  };
}

interface AuthenticationWrapperProps {
  session: UserSession | null;
  showAuthModal: boolean;
  onAuthModalChange: (open: boolean) => void;
  children: React.ReactNode;
}

export function AuthenticationWrapper({
  session,
  showAuthModal,
  onAuthModalChange,
  children
}: AuthenticationWrapperProps) {
  return (
    <>
      {/* Auth Modal - shows when user is not authenticated */}
      <AuthModal
        open={showAuthModal}
        onOpenChange={(open) => {
          // Prevent closing modal when user is not authenticated
          if (!session) {
            return;
          }
          onAuthModalChange(open);
        }}
      />

      {/* Overlay to disable interaction when not authenticated */}
      {!session && (
        <div className="absolute inset-0 bg-black/20 backdrop-blur-sm z-40 pointer-events-all" />
      )}

      {children}
    </>
  );
}