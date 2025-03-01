import { useState } from "react";
import { Link, useLocation } from "wouter";
import { Button } from "@/components/ui/button";
import { useAuth } from "@/hooks/use-auth";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  User,
  History,
  CreditCard,
  Settings,
  LogOut,
  LayoutDashboard,
  Image as ImageIcon,
  ChevronDown
} from "lucide-react";

export function Header() {
  const { user, logoutMutation } = useAuth();
  const [location] = useLocation();

  const scrollToSection = (sectionId: string) => {
    // Only scroll if we're on the home page
    if (location === '/') {
      const element = document.getElementById(sectionId);
      if (element) {
        element.scrollIntoView({ 
          behavior: 'smooth',
          block: 'start'
        });
      }
    } else {
      // If not on home page, navigate to home page with hash
      window.location.href = `/#${sectionId}`;
    }
  };

  return (
    <header className="fixed w-full bg-white/80 backdrop-blur-lg shadow-sm z-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          <div className="flex items-center gap-8">
            <Link href="/">
              <a className="flex items-center gap-2">
                <ImageIcon className="h-6 w-6 text-primary" />
                <span className="font-bold text-xl">iMageWiz</span>
              </a>
            </Link>

            <nav className="hidden md:flex items-center space-x-6">
              <button
                onClick={() => scrollToSection('features')}
                className="text-gray-600 hover:text-primary transition-colors"
              >
                Features
              </button>
              <button
                onClick={() => scrollToSection('pricing')}
                className="text-gray-600 hover:text-primary transition-colors"
              >
                Pricing
              </button>

              <DropdownMenu>
                <DropdownMenuTrigger className="text-gray-600 hover:text-primary transition-colors flex items-center gap-1">
                  Resources
                  <ChevronDown className="h-4 w-4" />
                </DropdownMenuTrigger>
                <DropdownMenuContent>
                  <Link href="/resources/use-cases">
                    <DropdownMenuItem className="cursor-pointer">
                      Use Cases
                    </DropdownMenuItem>
                  </Link>
                  <Link href="/resources/guides">
                    <DropdownMenuItem className="cursor-pointer">
                      Guides
                    </DropdownMenuItem>
                  </Link>
                  <Link href="/resources/blog">
                    <DropdownMenuItem className="cursor-pointer">
                      Blog
                    </DropdownMenuItem>
                  </Link>
                </DropdownMenuContent>
              </DropdownMenu>
            </nav>
          </div>

          <div className="flex items-center gap-4">
            {user ? (
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button variant="ghost" className="relative h-8 w-8 rounded-full">
                    <Avatar className="h-8 w-8 bg-primary/10">
                      <AvatarFallback className="text-primary">
                        {user.username[0].toUpperCase()}
                      </AvatarFallback>
                    </Avatar>
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end" className="w-56">
                  <DropdownMenuLabel className="font-normal">
                    <div className="flex flex-col space-y-1">
                      <p className="text-sm font-medium leading-none">{user.username}</p>
                      <p className="text-xs leading-none text-muted-foreground">
                        {user.credits} credits available
                      </p>
                    </div>
                  </DropdownMenuLabel>
                  <DropdownMenuSeparator />
                  <Link href="/dashboard">
                    <DropdownMenuItem className="cursor-pointer">
                      <LayoutDashboard className="h-4 w-4 mr-2" />
                      <span>Dashboard</span>
                    </DropdownMenuItem>
                  </Link>
                  <Link href="/dashboard/history">
                    <DropdownMenuItem className="cursor-pointer">
                      <History className="h-4 w-4 mr-2" />
                      <span>Image History</span>
                    </DropdownMenuItem>
                  </Link>
                  <Link href="/dashboard/profile">
                    <DropdownMenuItem className="cursor-pointer">
                      <User className="h-4 w-4 mr-2" />
                      <span>Profile</span>
                    </DropdownMenuItem>
                  </Link>
                  <Link href="/dashboard/credits">
                    <DropdownMenuItem className="cursor-pointer">
                      <CreditCard className="h-4 w-4 mr-2" />
                      <span>Credits & Billing</span>
                    </DropdownMenuItem>
                  </Link>
                  <Link href="/dashboard/settings">
                    <DropdownMenuItem className="cursor-pointer">
                      <Settings className="h-4 w-4 mr-2" />
                      <span>Settings</span>
                    </DropdownMenuItem>
                  </Link>
                  <DropdownMenuSeparator />
                  <DropdownMenuItem
                    className="text-red-600 hover:text-red-700 hover:bg-red-50 cursor-pointer"
                    onClick={() => logoutMutation.mutate()}
                    disabled={logoutMutation.isPending}
                  >
                    <LogOut className="h-4 w-4 mr-2" />
                    <span>Log out</span>
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            ) : (
              <Link href="/auth">
                <Button className="button-primary">
                  Get Started Free
                </Button>
              </Link>
            )}
          </div>
        </div>
      </div>
    </header>
  );
}