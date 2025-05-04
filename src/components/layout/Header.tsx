
import React from 'react';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { 
  DropdownMenu, 
  DropdownMenuContent, 
  DropdownMenuItem, 
  DropdownMenuLabel, 
  DropdownMenuSeparator, 
  DropdownMenuTrigger 
} from '@/components/ui/dropdown-menu';
import { useAuth } from '@/context/AuthContext';

const Header = () => {
  const { user, signOut } = useAuth();
  
  const initials = user?.email ? user.email.substring(0, 2).toUpperCase() : 'JD';

  return (
    <header className="h-16 border-b flex items-center justify-end px-4 lg:px-6">
      <div>
        <DropdownMenu>
          <DropdownMenuTrigger className="focus:outline-none">
            <Avatar className="cursor-pointer">
              <AvatarImage src={user?.user_metadata?.avatar_url} alt="User avatar" />
              <AvatarFallback>{initials}</AvatarFallback>
            </Avatar>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end" className="w-56">
            <DropdownMenuLabel>
              {user?.email}
            </DropdownMenuLabel>
            <DropdownMenuSeparator />
            <DropdownMenuItem>Profile</DropdownMenuItem>
            <DropdownMenuItem>Settings</DropdownMenuItem>
            <DropdownMenuSeparator />
            <DropdownMenuItem onClick={() => signOut()}>Log out</DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>
    </header>
  );
};

export default Header;
