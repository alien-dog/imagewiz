import { Header } from "@/components/layout/header";
import { ImageProcessor } from "@/components/image-processor";
import { useAuth } from "@/hooks/use-auth";

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

        <ImageProcessor />
      </main>
    </div>
  );
}
