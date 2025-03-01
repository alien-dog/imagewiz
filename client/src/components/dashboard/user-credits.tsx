import { useQuery } from "@tanstack/react-query";
import { useAuth } from "@/hooks/use-auth";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Loader2, CreditCard, Package } from "lucide-react";

const creditPackages = [
  {
    name: "Basic",
    credits: 100,
    price: "$9.99",
    description: "Perfect for small projects"
  },
  {
    name: "Pro",
    credits: 300,
    price: "$24.99",
    description: "Most popular choice"
  },
  {
    name: "Business",
    credits: 1000,
    price: "$49.99",
    description: "Best value for high volume"
  }
];

export function UserCredits() {
  const { user } = useAuth();

  return (
    <div className="space-y-8">
      <Card>
        <CardHeader>
          <CardTitle>Available Credits</CardTitle>
          <CardDescription>
            Your current balance and credit usage
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex items-center gap-4">
            <CreditCard className="h-8 w-8 text-primary" />
            <div>
              <p className="text-2xl font-bold">{user?.credits || 0}</p>
              <p className="text-sm text-muted-foreground">Credits remaining</p>
            </div>
          </div>
        </CardContent>
      </Card>

      <div>
        <h2 className="text-lg font-semibold mb-4">Purchase Credits</h2>
        <div className="grid md:grid-cols-3 gap-4">
          {creditPackages.map((pkg) => (
            <Card key={pkg.name}>
              <CardHeader>
                <CardTitle>{pkg.name}</CardTitle>
                <CardDescription>{pkg.description}</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="mb-4">
                  <div className="flex items-center gap-2 mb-2">
                    <Package className="h-4 w-4 text-primary" />
                    <span>{pkg.credits} credits</span>
                  </div>
                  <p className="text-2xl font-bold">{pkg.price}</p>
                </div>
                <Button className="w-full">Purchase</Button>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    </div>
  );
}
