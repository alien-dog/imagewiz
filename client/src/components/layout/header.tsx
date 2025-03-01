import { useState } from "react";
import { Link } from "wouter";
import { Button } from "@/components/ui/button";
import { useAuth } from "@/hooks/use-auth";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { toast } from "@/hooks/use-toast";
import { useMutation } from "@tanstack/react-query";
import { apiRequest } from "@/lib/queryClient";

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

          <nav className="hidden md:flex space-x-8">
            <Link href="/">
              <a className="text-secondary hover:text-primary">Home</a>
            </Link>
            <Link href="/pricing">
              <a className="text-secondary hover:text-primary">Pricing</a>
            </Link>
            {user && (
              <Link href="/dashboard">
                <a className="text-secondary hover:text-primary">Dashboard</a>
              </Link>
            )}
          </nav>

          <div className="flex items-center gap-4">
            {user ? (
              <>
                <Avatar className="h-8 w-8 bg-primary/10">
                  <AvatarFallback className="text-primary">
                    {user.username[0].toUpperCase()}
                  </AvatarFallback>
                </Avatar>
                <Button 
                  variant="outline"
                  onClick={() => logoutMutation.mutate()}
                  disabled={logoutMutation.isPending}
                  className="button-outline"
                >
                  Logout
                </Button>
              </>
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