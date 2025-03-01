import { useState } from "react";
import { Link } from "wouter";
import { Button } from "@/components/ui/button";
import { useAuth } from "@/hooks/use-auth";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { toast } from "@/hooks/use-toast";
import { useMutation } from "@tanstack/react-query";
import { apiRequest } from "@/lib/queryClient";
import { 
  User,
  History,
  CreditCard,
  Settings,
  LogOut,
  LayoutDashboard
} from "lucide-react";

export function Header() {
  const { user, logoutMutation } = useAuth();
  const [logo, setLogo] = useState<string | null>(null);

  const uploadLogoMutation = useMutation({
    mutationFn: async (file: File) => {
      const formData = new FormData();
      formData.append("logo", file);
      const res = await apiRequest("POST", "/api/upload-logo", formData);
      return res.json();
    },
    onSuccess: (data) => {
      setLogo(data.url);
      toast({
        title: "Logo updated",
        description: "Your logo has been successfully updated"
      });
    },
    onError: (error) => {
      toast({
        title: "Error",
        description: error.message,
        variant: "destructive"
      });
    }
  });

  const handleLogoChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (!file.type.startsWith("image/")) {
      toast({
        title: "Invalid file",
        description: "Please upload an image file",
        variant: "destructive"
      });
      return;
    }

    uploadLogoMutation.mutate(file);
  };

  return (
    <header className="fixed w-full bg-white shadow-sm z-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-16">
          <div className="flex items-center">
            <Link href="/">
              <a className="flex items-center gap-2">
                {logo ? (
                  <img src={logo} alt="Logo" className="h-8 w-8" />
                ) : (
                  <span className="logo-text text-2xl text-primary">iMageWiz</span>
                )}
              </a>
            </Link>
            {user?.username === 'admin' && (
              <Dialog>
                <DialogTrigger asChild>
                  <Button variant="outline" size="sm" className="ml-4">
                    Change Logo
                  </Button>
                </DialogTrigger>
                <DialogContent>
                  <DialogHeader>
                    <DialogTitle>Upload Logo</DialogTitle>
                  </DialogHeader>
                  <div className="space-y-4">
                    <div className="grid w-full max-w-sm items-center gap-1.5">
                      <Label htmlFor="logo">Logo Image</Label>
                      <Input 
                        id="logo" 
                        type="file" 
                        accept="image/*"
                        onChange={handleLogoChange}
                      />
                    </div>
                  </div>
                </DialogContent>
              </Dialog>
            )}
          </div>

          <nav className="hidden md:flex items-center space-x-8">
            <Link href="/">
              <a className="text-secondary hover:text-primary">Home</a>
            </Link>
            {user && (
              <Link href="/dashboard">
                <a className="flex items-center gap-2 text-secondary hover:text-primary">
                  <LayoutDashboard className="h-4 w-4" />
                  Dashboard
                </a>
              </Link>
            )}
            <Link href="/pricing">
              <a className="text-secondary hover:text-primary">Pricing</a>
            </Link>
          </nav>

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
                  <DropdownMenuLabel>My Account</DropdownMenuLabel>
                  <DropdownMenuSeparator />
                  <Link href="/dashboard">
                    <DropdownMenuItem className="cursor-pointer">
                      <LayoutDashboard className="mr-2 h-4 w-4" />
                      <span>Dashboard</span>
                    </DropdownMenuItem>
                  </Link>
                  <Link href="/dashboard/profile">
                    <DropdownMenuItem className="cursor-pointer">
                      <User className="mr-2 h-4 w-4" />
                      <span>Profile</span>
                    </DropdownMenuItem>
                  </Link>
                  <Link href="/dashboard/history">
                    <DropdownMenuItem className="cursor-pointer">
                      <History className="mr-2 h-4 w-4" />
                      <span>Image History</span>
                    </DropdownMenuItem>
                  </Link>
                  <Link href="/dashboard/credits">
                    <DropdownMenuItem className="cursor-pointer">
                      <CreditCard className="mr-2 h-4 w-4" />
                      <span>Credits & Billing</span>
                    </DropdownMenuItem>
                  </Link>
                  <Link href="/dashboard/settings">
                    <DropdownMenuItem className="cursor-pointer">
                      <Settings className="mr-2 h-4 w-4" />
                      <span>Settings</span>
                    </DropdownMenuItem>
                  </Link>
                  <DropdownMenuSeparator />
                  <DropdownMenuItem 
                    className="cursor-pointer text-red-600 focus:text-red-600"
                    onClick={() => logoutMutation.mutate()}
                    disabled={logoutMutation.isPending}
                  >
                    <LogOut className="mr-2 h-4 w-4" />
                    <span>Log out</span>
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            ) : (
              <Link href="/auth">
                <Button className="button-primary shadow-lg">
                  Get Started
                </Button>
              </Link>
            )}
          </div>
        </div>
      </div>
    </header>
  );
}