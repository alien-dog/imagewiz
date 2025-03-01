import { Header } from "@/components/layout/header";
import { ImageHistory as ImageHistoryComponent } from "@/components/dashboard/image-history";

export default function ImageHistory() {
  return (
    <div className="min-h-screen bg-background">
      <Header />
      <main className="pt-20 pb-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <h1 className="text-3xl font-bold mb-8">Image History</h1>
          <ImageHistoryComponent />
        </div>
      </main>
    </div>
  );
}
