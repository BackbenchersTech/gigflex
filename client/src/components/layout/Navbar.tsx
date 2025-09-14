import { Button } from '@/components/ui/button';
import { Sheet, SheetContent, SheetTrigger } from '@/components/ui/sheet';
import { useTheme } from '@/components/ui/theme-provider';
import { useAuth } from '@/hooks/useAuth';
import { Menu, Moon, Sun } from 'lucide-react';
import { Link, useLocation } from 'wouter';
import { ProfileIconPopover } from './ProfileIconPopover';

export const Navbar = () => {
  const [location] = useLocation();
  const { theme, setTheme } = useTheme();
  const { isAdmin } = useAuth();

  return (
    <header className='sticky top-0 z-30 w-full border-b border-border bg-background shadow-sm'>
      <div className='mx-auto px-4 sm:px-6 md:px-8 w-full max-w-[1400px] flex h-16 items-center justify-between'>
        <div className='flex items-center gap-4'>
          <Link href='/' className='flex items-center space-x-2'>
            <img
              src='/backbenchers-logo.png'
              alt='Backbenchers'
              className='h-12'
            />
          </Link>

          <nav className='hidden md:flex items-center space-x-6'>
            <Link
              href='/'
              className={`text-sm font-medium transition-colors ${
                location === '/'
                  ? 'text-primary'
                  : 'text-muted-foreground hover:text-foreground'
              }`}
            >
              Candidates
            </Link>

            {isAdmin && (
              <Link
                href='/admin'
                className={`text-sm font-medium transition-colors ${
                  location === '/admin'
                    ? 'text-primary'
                    : 'text-muted-foreground hover:text-foreground'
                }`}
              >
                Admin
              </Link>
            )}
          </nav>
        </div>

        <div className='flex items-center gap-2'>
          <Button
            variant='outline'
            size='icon'
            className='hidden md:flex'
            onClick={() => setTheme(theme === 'light' ? 'dark' : 'light')}
          >
            {theme === 'light' ? (
              <Moon className='h-4 w-4' />
            ) : (
              <Sun className='h-4 w-4' />
            )}
            <span className='sr-only'>Toggle theme</span>
          </Button>

          <ProfileIconPopover />

          <Sheet>
            <SheetTrigger asChild>
              <Button variant='outline' size='icon' className='md:hidden'>
                <Menu className='h-5 w-5' />
                <span className='sr-only'>Toggle menu</span>
              </Button>
            </SheetTrigger>
            <SheetContent side='right' className='pr-0'>
              <nav className='grid gap-6 text-lg font-medium'>
                <Link
                  href='/'
                  className='flex items-center gap-2 py-2 text-foreground hover:text-primary'
                >
                  Candidates
                </Link>
                <Link
                  href='/admin'
                  className='flex items-center gap-2 py-2 text-foreground hover:text-primary'
                >
                  Admin
                </Link>
                <Button
                  variant='outline'
                  className='justify-start'
                  onClick={() => setTheme(theme === 'light' ? 'dark' : 'light')}
                >
                  {theme === 'light' ? (
                    <>
                      <Moon className='mr-2 h-4 w-4' />
                      Dark Mode
                    </>
                  ) : (
                    <>
                      <Sun className='mr-2 h-4 w-4' />
                      Light Mode
                    </>
                  )}
                </Button>
              </nav>
            </SheetContent>
          </Sheet>
        </div>
      </div>
    </header>
  );
};
