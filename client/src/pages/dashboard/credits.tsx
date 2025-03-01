import { Header } from "@/components/layout/header";
import { UserCredits } from "@/components/dashboard/user-credits";
import { TransactionHistory } from "@/components/dashboard/transaction-history";

export default function Credits() {
  return (
    <div className="min-h-screen bg-background">
      <Header />
      <main className="pt-20 pb-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <h1 className="text-3xl font-bold mb-8">Credits & Billing</h1>
          <div className="space-y-8">
            <UserCredits />
            <TransactionHistory />
          </div>
        </div>
      </main>
    </div>
  );
}