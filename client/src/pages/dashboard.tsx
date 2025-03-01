import { Header } from "@/components/layout/header";
import { ImageProcessor } from "@/components/image-processor";
import { useAuth } from "@/hooks/use-auth";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { UserProfile } from "@/components/dashboard/user-profile";
import { UserCredits } from "@/components/dashboard/user-credits";
import { TransactionHistory } from "@/components/dashboard/transaction-history";
import { AccountSettings } from "@/components/dashboard/account-settings";

export default function Dashboard() {
  const { user } = useAuth();

  return (
    <div className="min-h-screen bg-background">
      <Header />

      <main className="max-w-6xl mx-auto px-4 py-8">
        <div className="flex justify-between items-center mb-8">
          <h1 className="text-3xl font-bold">Dashboard</h1>
          <div className="text-muted-foreground">
            Credits remaining: {user?.credits || 0}
          </div>
        </div>

        <Tabs defaultValue="processor" className="space-y-4">
          <TabsList>
            <TabsTrigger value="processor">Image Processor</TabsTrigger>
            <TabsTrigger value="profile">Profile</TabsTrigger>
            <TabsTrigger value="credits">Credits & Billing</TabsTrigger>
            <TabsTrigger value="history">History</TabsTrigger>
            <TabsTrigger value="settings">Account Settings</TabsTrigger>
          </TabsList>

          <TabsContent value="processor" className="space-y-4">
            <ImageProcessor />
          </TabsContent>

          <TabsContent value="profile" className="space-y-4">
            <UserProfile />
          </TabsContent>

          <TabsContent value="credits" className="space-y-4">
            <UserCredits />
          </TabsContent>

          <TabsContent value="history" className="space-y-4">
            <TransactionHistory />
          </TabsContent>

          <TabsContent value="settings" className="space-y-4">
            <AccountSettings />
          </TabsContent>
        </Tabs>
      </main>
    </div>
  );
}