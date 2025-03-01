import { useState } from "react";
import { Link } from "wouter";
import { Button } from "@/components/ui/button";
import { useAuth } from "@/hooks/use-auth";
import { Avatar, AvatarImage, AvatarFallback } from "@/components/ui/avatar";
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
    <header className="border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
      <div className="max-w-6xl mx-auto px-4 h-16 flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Link href="/">
            <a className="flex items-center gap-2">
              {logo ? (
                <img src={logo} alt="Logo" className="h-8 w-8" />
              ) : (
                <div className="font-bold text-xl">iMageWiz</div>
              )}
            </a>
          </Link>
          {user?.username === 'admin' && (
            <Dialog>
              <DialogTrigger asChild>
                <Button variant="outline" size="sm">Change Logo</Button>
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
              <div className="flex items-center gap-4">
                <Avatar className="h-8 w-8">
                  <AvatarFallback>{user.username[0].toUpperCase()}</AvatarFallback>
                </Avatar>
                <Button 
                  variant="outline" 
                  onClick={() => logoutMutation.mutate()}
                  disabled={logoutMutation.isPending}
                >
                  Logout
                </Button>
              </div>
            </>
          ) : (
            <Link href="/auth">
              <Button className="shadow-lg">Get Started</Button>
            </Link>
          )}
        </nav>
      </div>
    </header>
  );
}