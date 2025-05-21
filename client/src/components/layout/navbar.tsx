import { Link, useLocation } from "wouter";
import { 
  Sheet, 
  SheetContent, 
  SheetTrigger 
} from "@/components/ui/sheet";
import { Button } from "@/components/ui/button";
import { useTheme } from "@/components/ui/theme-provider";
import { 
  Menu, 
  Search, 
  Moon, 
  Sun, 
  User 
} from "lucide-react";

const Navbar = () => {
  const [location] = useLocation();
  const { theme, setTheme } = useTheme();

  return (
    <header className="sticky top-0 z-30 w-full border-b border-border bg-background shadow-sm">
      <div className="container flex h-16 items-center justify-between">
        <div className="flex items-center gap-4">
          <Link href="/" className="flex items-center space-x-2">
            <img 
              src="/gigflex-logo.png" 
              alt="GigFlex" 
              className="h-8" 
            />
          </Link>
          
          <nav className="hidden md:flex items-center space-x-6">
            <Link href="/" className={`text-sm font-medium transition-colors ${location === '/' ? 'text-primary' : 'text-muted-foreground hover:text-foreground'}`}>
              Candidates
            </Link>
            <Link href="/admin" className={`text-sm font-medium transition-colors ${location === '/admin' ? 'text-primary' : 'text-muted-foreground hover:text-foreground'}`}>
              Admin
            </Link>
          </nav>
        </div>
        
        <div className="flex items-center gap-2">
          <Button 
            variant="outline" 
            size="icon" 
            className="hidden md:flex" 
            onClick={() => setTheme(theme === "light" ? "dark" : "light")}
          >
            {theme === 'light' ? (
              <Moon className="h-4 w-4" />
            ) : (
              <Sun className="h-4 w-4" />
            )}
            <span className="sr-only">Toggle theme</span>
          </Button>

          <Button variant="outline" size="icon" className="hidden md:flex">
            <Search className="h-4 w-4" />
            <span className="sr-only">Search</span>
          </Button>

          <Button variant="outline" size="icon" className="hidden md:flex">
            <User className="h-4 w-4" />
            <span className="sr-only">User</span>
          </Button>

          <Sheet>
            <SheetTrigger asChild>
              <Button variant="outline" size="icon" className="md:hidden">
                <Menu className="h-5 w-5" />
                <span className="sr-only">Toggle menu</span>
              </Button>
            </SheetTrigger>
            <SheetContent side="right" className="pr-0">
              <nav className="grid gap-6 text-lg font-medium">
                <Link href="/" className="flex items-center gap-2 py-2 text-foreground hover:text-primary">
                  Candidates
                </Link>
                <Link href="/admin" className="flex items-center gap-2 py-2 text-foreground hover:text-primary">
                  Admin
                </Link>
                <Button 
                  variant="outline" 
                  className="justify-start" 
                  onClick={() => setTheme(theme === "light" ? "dark" : "light")}
                >
                  {theme === 'light' ? (
                    <>
                      <Moon className="mr-2 h-4 w-4" />
                      Dark Mode
                    </>
                  ) : (
                    <>
                      <Sun className="mr-2 h-4 w-4" />
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

export default Navbar;
