import { Button } from '@/components/ui/button';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { useToast } from '@/hooks/use-toast';
import { useAuth, User } from '@/hooks/useAuth';
import { signInWithGoogle } from '@/lib/firebase';
import { useMutation } from '@tanstack/react-query';
import { Shield } from 'lucide-react';
import { useState } from 'react';

export default function Login() {
  const [loading, setLoading] = useState(false);
  const { toast } = useToast();
  const { setUser, isAdmin } = useAuth();
  const { mutate: syncUser } = useMutation({
    mutationFn: async (firebaseIdToken: string) => {
      const response = await fetch('/api/auth/sync', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ firebaseIdToken }),
      });

      if (!response.ok) {
        throw new Error('Error logging in');
      }

      return response.json();
    },
    onError: (error) => {
      console.error('Error logging in', error.message);
    },
    onSuccess: (data: User) => {
      setUser(data);
      setLoading(false);
      toast({
        title: 'Welcome!',
        description:
          data.role.toLowerCase() === 'admin'
            ? 'Successfully signed in to admin panel.'
            : 'Successfully signed in.',
      });
    },
  });

  const handleGoogleSignIn = async () => {
    setLoading(true);
    try {
      const firebaseUser = await signInWithGoogle();

      syncUser(await firebaseUser.getIdToken());
    } catch (error) {
      toast({
        title: 'Authentication Failed',
        description: 'Unable to sign in. Please try again.',
        variant: 'destructive',
      });
    }
  };

  return (
    <Card className='w-full max-w-md border-none shadow-none'>
      <CardHeader className='text-center'>
        <div className='mx-auto w-12 h-12 bg-primary rounded-full flex items-center justify-center mb-4'>
          <Shield className='h-6 w-6 text-primary-foreground' />
        </div>

        <CardTitle className='text-2xl'>Admin Access</CardTitle>

        <CardDescription>
          Sign in with your Google account to access the admin panel
        </CardDescription>
      </CardHeader>

      <CardContent>
        <Button
          onClick={handleGoogleSignIn}
          disabled={loading}
          className='w-full'
          size='lg'
        >
          {loading ? (
            <div className='flex items-center'>
              <div className='animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2'></div>
              Signing in...
            </div>
          ) : (
            <div className='flex items-center'>
              <svg className='w-5 h-5 mr-2' viewBox='0 0 24 24'>
                <path
                  fill='currentColor'
                  d='M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z'
                />
                <path
                  fill='currentColor'
                  d='M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z'
                />
                <path
                  fill='currentColor'
                  d='M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z'
                />
                <path
                  fill='currentColor'
                  d='M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z'
                />
              </svg>
              Continue with Google
            </div>
          )}
        </Button>
      </CardContent>
    </Card>
  );
}
