import { Link } from "wouter";
import { Button } from "@/components/ui/button";
import { useAuth } from "@/hooks/use-auth";

export function Header() {
  const { user, logoutMutation } = useAuth();

  return (
    <header className="border-b">
      <div className="max-w-6xl mx-auto px-4 h-16 flex items-center justify-between">
        <Link href="/">
          <a className="font-bold text-xl">iMageWiz</a>
        </Link>

        <nav className="flex items-center gap-6">
          <Link href="/">
            <a className="text-muted-foreground hover:text-foreground transition-colors">
              Home
            </a>
          </Link>
          <Link href="/pricing">
            <a className="text-muted-foreground hover:text-foreground transition-colors">
              Pricing
            </a>
          </Link>
          
          {user ? (
            <>
              <Link href="/dashboard">
                <a className="text-muted-foreground hover:text-foreground transition-colors">
                  Dashboard
                </a>
              </Link>
              <Button 
                variant="outline" 
                onClick={() => logoutMutation.mutate()}
                disabled={logoutMutation.isPending}
              >
                Logout
              </Button>
            </>
          ) : (
            <Link href="/auth">
              <Button>Get Started</Button>
            </Link>
          )}
        </nav>
      </div>
    </header>
  );
}
