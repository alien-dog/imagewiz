import { Header } from "@/components/layout/header";
import { Footer } from "@/components/layout/footer";
import { ImageProcessor } from "@/components/image-processor";
import { useAuth } from "@/hooks/use-auth";
import { Card } from "@/components/ui/card";

export default function Dashboard() {
  const { user } = useAuth();

  return (
    <div className="min-h-screen bg-background flex flex-col">
      <Header />

      <main className="flex-grow pt-20 pb-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center mb-8">
            <h1 className="text-3xl font-bold">Dashboard</h1>
            <div className="bg-primary/10 px-4 py-2 rounded-full text-primary font-medium">
              {user?.credits || 0} Credits Available
            </div>
          </div>

          <Card className="p-6">
            <ImageProcessor />
          </Card>
        </div>
      </main>

      <Footer />
    </div>
  );
}