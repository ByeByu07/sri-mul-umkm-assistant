"use client";

import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuGroup,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger
} from '@/components/ui/dropdown-menu';
import { IconLogout } from '@tabler/icons-react';
import { authClient } from '@/lib/auth-client';

interface UserSession {
  user: {
    id: string;
    name?: string;
    email?: string;
    image?: string;
  };
}

interface UserProfileDropdownProps {
  session: UserSession | null;
  variant?: 'desktop' | 'mobile';
  className?: string;
  children?: React.ReactNode;
}

export function UserProfileDropdown({
  session,
  variant = 'desktop',
  className = '',
  children
}: UserProfileDropdownProps) {
  const handleSignOut = async () => {
    await authClient.signOut();
  };

  const avatarSize = variant === 'mobile' ? 'w-10 h-10' : 'w-8 h-8';
  const avatarClasses = variant === 'mobile'
    ? `${avatarSize} border-2 border-white shadow-lg`
    : `${avatarSize} flex-shrink-0`;

  const triggerContent = children || (
    <Avatar className={avatarClasses}>
      <AvatarImage
        src={session?.user?.image || 'https://github.com/shadcn.png'}
        alt={session?.user?.name || 'User'}
      />
      <AvatarFallback className={variant === 'mobile' ? '' : 'rounded-lg'}>
        {session?.user?.name?.substring(0, 2).toUpperCase() || 'CN'}
      </AvatarFallback>
    </Avatar>
  );

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild className={className}>
        {variant === 'desktop' ? (
          <div className="flex items-center gap-2 p-2 overflow-hidden cursor-pointer">
            {triggerContent}
            <div className="flex-1 text-sm min-w-0">
              <p className="font-medium truncate">{session?.user?.name}</p>
              <p className="text-xs text-muted-foreground truncate">{session?.user?.email}</p>
            </div>
          </div>
        ) : (
          <div>
            {triggerContent}
          </div>
        )}
      </DropdownMenuTrigger>

      <DropdownMenuContent
        className="w-56 rounded-lg"
        side={variant === 'mobile' ? 'bottom' : 'right'}
        align="end"
        sideOffset={4}
      >
        <DropdownMenuLabel className="p-0 font-normal">
          <div className="flex items-center gap-2 px-1 py-1.5 text-left text-sm">
            <Avatar className="h-8 w-8 rounded-lg">
              <AvatarImage
                src={session?.user?.image || 'https://github.com/shadcn.png'}
                alt={session?.user?.name || 'User'}
              />
              <AvatarFallback className="rounded-lg">
                {session?.user?.name?.substring(0, 2).toUpperCase() || 'CN'}
              </AvatarFallback>
            </Avatar>
            <div className="grid flex-1 text-left text-sm leading-tight min-w-0">
              <span className="truncate font-medium">{session?.user?.name || 'User'}</span>
              <span className="text-muted-foreground truncate text-xs">
                {session?.user?.email || 'user@example.com'}
              </span>
            </div>
          </div>
        </DropdownMenuLabel>
        <DropdownMenuSeparator />
        <DropdownMenuGroup>
          {/* Future menu items can be added here */}
        </DropdownMenuGroup>
        <DropdownMenuItem onClick={handleSignOut}>
          <IconLogout />
          Keluar
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}