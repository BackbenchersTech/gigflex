import { Navbar } from '@/components/layout/Navbar';
import { Toaster } from '@/components/ui/toaster';
import { TooltipProvider } from '@/components/ui/tooltip';
import { AuthProvider } from '@/hooks/useAuth';
import AdminPage from '@/pages/admin';
import HomePage from '@/pages/home';
import NotFound from '@/pages/not-found';
import { QueryClientProvider } from '@tanstack/react-query';
import { Route, Switch } from 'wouter';
import { queryClient } from './lib/queryClient';

function Router() {
  return (
    <Switch>
      <Route path='/' component={HomePage} />
      <Route path='/admin' component={AdminPage} />
      <Route component={NotFound} />
    </Switch>
  );
}

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <AuthProvider>
        <TooltipProvider>
          <div className='min-h-screen flex flex-col bg-gray-50 dark:bg-gray-900'>
            <Navbar />
            <main className='flex-grow mx-auto px-4 sm:px-6 md:px-8 w-full max-w-[1400px]'>
              <Router />
            </main>
            <Toaster />
          </div>
        </TooltipProvider>
      </AuthProvider>
    </QueryClientProvider>
  );
}

export default App;
