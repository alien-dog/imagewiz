import { useState } from "react";
import { Link } from "wouter";
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
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { 
  User,
  History,
  CreditCard,
  Settings,
  LogOut,
  LayoutDashboard,
  Image as ImageIcon
} from "lucide-react";

export function Header() {
  const { user, logoutMutation } = useAuth();

  return (
    <header className="header">
      <div className="header-inner">
        <div className="flex items-center gap-8">
          <Link href="/">
            <a className="flex items-center gap-2">
              <ImageIcon className="h-6 w-6 text-primary" />
              <span className="logo-text">iMageWiz</span>
            </a>
          </Link>

          <nav className="hidden md:flex items-center space-x-6">
            <Link href="/">
              <a className="nav-link">Home</a>
            </Link>
            {user && (
              <Link href="/dashboard">
                <a className="nav-link flex items-center gap-1.5">
                  <LayoutDashboard className="h-4 w-4" />
                  Dashboard
                </a>
              </Link>
            )}
            <Link href="/pricing">
              <a className="nav-link">Pricing</a>
            </Link>
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
                  <DropdownMenuItem className="dropdown-nav">
                    <LayoutDashboard className="h-4 w-4" />
                    <span>Dashboard</span>
                  </DropdownMenuItem>
                </Link>
                <Link href="/dashboard/history">
                  <DropdownMenuItem className="dropdown-nav">
                    <History className="h-4 w-4" />
                    <span>Image History</span>
                  </DropdownMenuItem>
                </Link>
                <Link href="/dashboard/profile">
                  <DropdownMenuItem className="dropdown-nav">
                    <User className="h-4 w-4" />
                    <span>Profile</span>
                  </DropdownMenuItem>
                </Link>
                <Link href="/dashboard/credits">
                  <DropdownMenuItem className="dropdown-nav">
                    <CreditCard className="h-4 w-4" />
                    <span>Credits & Billing</span>
                  </DropdownMenuItem>
                </Link>
                <Link href="/dashboard/settings">
                  <DropdownMenuItem className="dropdown-nav">
                    <Settings className="h-4 w-4" />
                    <span>Settings</span>
                  </DropdownMenuItem>
                </Link>
                <DropdownMenuSeparator />
                <DropdownMenuItem 
                  className="dropdown-nav text-red-600 hover:text-red-700 hover:bg-red-50"
                  onClick={() => logoutMutation.mutate()}
                  disabled={logoutMutation.isPending}
                >
                  <LogOut className="h-4 w-4" />
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
    </header>
  );
}