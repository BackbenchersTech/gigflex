import { useAuth } from '@/hooks/useAuth';
import { signOutUser } from '@/lib/firebase';
import { User } from 'lucide-react';
import { Button } from '../ui/button';
import { Popover, PopoverContent, PopoverTrigger } from '../ui/popover';
import Login from './Login';

export const ProfileIconPopover = () => {
  const { user, isAdmin } = useAuth();

  const handleSignOut = async () => {
    try {
      await signOutUser();
    } catch (error) {
      console.error('Error signing out:', error);
    }
  };

  return (
    <Popover>
      <PopoverTrigger>
        <Button variant='outline' size='icon' className='hidden md:flex'>
          <User className='h-4 w-4' />
          <span className='sr-only'>User</span>
        </Button>
      </PopoverTrigger>

      <PopoverContent>
        {isAdmin ? (
          <>
            <p className='mb-2'>Welcome, {user?.displayName || user?.email}</p>
            <Button className='w-full' onClick={handleSignOut}>
              Logout
            </Button>
          </>
        ) : (
          <Login />
        )}
      </PopoverContent>
    </Popover>
  );
};
