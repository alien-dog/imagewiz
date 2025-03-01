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
  ChevronDown,
  CircleUserRound
} from "lucide-react";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";

export function Header() {
  const { user, logoutMutation } = useAuth();
  const [location] = useLocation();

  const scrollToSection = (sectionId: string) => {
    if (location === '/') {
      const element = document.getElementById(sectionId);
      if (element) {
        element.scrollIntoView({ 
          behavior: 'smooth',
          block: 'start'
        });
      }
    } else {
      window.location.href = `/#${sectionId}`;
    }
  };

  return (
    <header className="fixed w-full bg-white shadow-sm z-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          <div className="flex items-center gap-8">
            <Link href="/">
              <a className="flex items-center gap-2">
                <ImageIcon className="h-6 w-6 text-primary" />
                <span className="logo-text">iMagenWiz</span>
              </a>
            </Link>

            <nav className="hidden md:flex items-center space-x-8">
              <TooltipProvider>
                <Tooltip>
                  <TooltipTrigger asChild>
                    <button
                      onClick={() => scrollToSection('features')}
                      className="text-gray-800 hover:text-primary transition-colors px-3 py-2 rounded-md hover:bg-gray-50"
                    >
                      Features
                    </button>
                  </TooltipTrigger>
                  <TooltipContent>
                    <p>Explore our powerful features</p>
                  </TooltipContent>
                </Tooltip>
              </TooltipProvider>

              <TooltipProvider>
                <Tooltip>
                  <TooltipTrigger asChild>
                    <button
                      onClick={() => scrollToSection('pricing')}
                      className="text-gray-800 hover:text-primary transition-colors px-3 py-2 rounded-md hover:bg-gray-50"
                    >
                      Pricing
                    </button>
                  </TooltipTrigger>
                  <TooltipContent>
                    <p>View our pricing plans</p>
                  </TooltipContent>
                </Tooltip>
              </TooltipProvider>

              <DropdownMenu>
                <TooltipProvider>
                  <Tooltip>
                    <TooltipTrigger asChild>
                      <DropdownMenuTrigger className="text-gray-800 hover:text-primary transition-colors px-3 py-2 rounded-md hover:bg-gray-50 flex items-center gap-1">
                        Resources
                        <ChevronDown className="h-4 w-4" />
                      </DropdownMenuTrigger>
                    </TooltipTrigger>
                    <TooltipContent>
                      <p>Helpful resources and guides</p>
                    </TooltipContent>
                  </Tooltip>
                </TooltipProvider>
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
                <TooltipProvider>
                  <Tooltip>
                    <TooltipTrigger asChild>
                      <DropdownMenuTrigger asChild>
                        <Button variant="ghost" className="relative h-10 pl-3 pr-8 rounded-full">
                          <div className="flex items-center gap-2">
                            <CircleUserRound className="h-5 w-5 text-primary" />
                            <span className="text-sm font-medium text-gray-800">{user.username}</span>
                            <span className="text-xs text-primary font-medium">
                              {user.credits} credits
                            </span>
                            <Avatar className="h-8 w-8 bg-primary/10 absolute right-0">
                              <AvatarFallback className="text-primary">
                                {user.username[0].toUpperCase()}
                              </AvatarFallback>
                            </Avatar>
                          </div>
                        </Button>
                      </DropdownMenuTrigger>
                    </TooltipTrigger>
                    <TooltipContent>
                      <p>Access your account</p>
                    </TooltipContent>
                  </Tooltip>
                </TooltipProvider>
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