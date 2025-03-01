import { Header } from "@/components/layout/header";
import { ImageProcessor } from "@/components/image-processor";
import { useAuth } from "@/hooks/use-auth";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { UserProfile } from "@/components/dashboard/user-profile";
import { UserCredits } from "@/components/dashboard/user-credits";
import { TransactionHistory } from "@/components/dashboard/transaction-history";
import { AccountSettings } from "@/components/dashboard/account-settings";
import { ImageHistory } from "@/components/dashboard/image-history";

export default function Dashboard() {
  const { user } = useAuth();

  return (
    <div className="min-h-screen bg-background">
      <Header />

      <main className="pt-20 pb-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center mb-8">
            <h1 className="text-3xl font-bold">Dashboard</h1>
            <div className="bg-primary/10 px-4 py-2 rounded-full text-primary font-medium">
              {user?.credits || 0} Credits Available
            </div>
          </div>

          <Tabs defaultValue="processor" className="space-y-8">
            <TabsList className="w-full flex justify-start space-x-8 border-b">
              <TabsTrigger value="processor" className="tab-button">
                Image Processor
              </TabsTrigger>
              <TabsTrigger value="history" className="tab-button">
                Image History
              </TabsTrigger>
              <TabsTrigger value="profile" className="tab-button">
                Profile
              </TabsTrigger>
              <TabsTrigger value="credits" className="tab-button">
                Credits & Billing
              </TabsTrigger>
              <TabsTrigger value="transactions" className="tab-button">
                Transaction History
              </TabsTrigger>
              <TabsTrigger value="settings" className="tab-button">
                Account Settings
              </TabsTrigger>
            </TabsList>

            <TabsContent value="processor" className="space-y-6 focus:outline-none">
              <ImageProcessor />
            </TabsContent>

            <TabsContent value="history" className="space-y-6 focus:outline-none">
              <ImageHistory />
            </TabsContent>

            <TabsContent value="profile" className="space-y-6 focus:outline-none">
              <UserProfile />
            </TabsContent>

            <TabsContent value="credits" className="space-y-6 focus:outline-none">
              <UserCredits />
            </TabsContent>

            <TabsContent value="transactions" className="space-y-6 focus:outline-none">
              <TransactionHistory />
            </TabsContent>

            <TabsContent value="settings" className="space-y-6 focus:outline-none">
              <AccountSettings />
            </TabsContent>
          </Tabs>
        </div>
      </main>
    </div>
  );
}