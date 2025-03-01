import { Header } from "@/components/layout/header";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Check } from "lucide-react";
import { useAuth } from "@/hooks/use-auth";
import { Link } from "wouter";

const plans = [
  {
    name: "Basic",
    price: "$9.99",
    priceId: "price_basic", // Replace with your actual Stripe price ID
    credits: 100,
    features: [
      "100 image credits",
      "Standard processing",
      "Email support",
      "Valid for 30 days"
    ]
  },
  {
    name: "Pro",
    price: "$24.99",
    priceId: "price_pro", // Replace with your actual Stripe price ID
    credits: 300,
    features: [
      "300 image credits",
      "Priority processing",
      "24/7 support",
      "Valid for 30 days"
    ]
  },
  {
    name: "Business",
    price: "$49.99",
    priceId: "price_business", // Replace with your actual Stripe price ID
    credits: 1000,
    features: [
      "1000 image credits",
      "Ultra-fast processing",
      "Dedicated support",
      "API access"
    ]
  }
];

export default function Pricing() {
  const { user } = useAuth();

  const handleSubscribe = async (priceId: string) => {
    try {
      const response = await fetch('/api/create-checkout-session', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ priceId }),
      });

      const { url } = await response.json();
      window.location.href = url;
    } catch (error) {
      console.error('Error creating checkout session:', error);
    }
  };

  return (
    <div className="min-h-screen bg-background">
      <Header />

      <main className="max-w-6xl mx-auto px-4 py-20">
        <div className="text-center mb-12">
          <h1 className="text-4xl font-bold mb-4">Simple, Transparent Pricing</h1>
          <p className="text-muted-foreground text-lg max-w-2xl mx-auto">
            Choose the plan that best fits your needs. All plans come with our AI-powered background removal technology.
          </p>
        </div>

        <div className="grid md:grid-cols-3 gap-8">
          {plans.map((plan) => (
            <Card key={plan.name} className="relative">
              <CardHeader>
                <CardTitle>
                  <h3 className="text-2xl font-bold">{plan.name}</h3>
                  <div className="mt-4">
                    <span className="text-4xl font-bold">{plan.price}</span>
                    <span className="text-muted-foreground">/month</span>
                  </div>
                </CardTitle>
              </CardHeader>
              <CardContent>
                <ul className="space-y-4 mb-8">
                  {plan.features.map((feature) => (
                    <li key={feature} className="flex items-center gap-2">
                      <Check className="w-5 h-5 text-primary" />
                      <span>{feature}</span>
                    </li>
                  ))}
                </ul>
                {user ? (
                  <Button 
                    className="w-full"
                    onClick={() => handleSubscribe(plan.priceId)}
                  >
                    Subscribe Now
                  </Button>
                ) : (
                  <Link href="/auth">
                    <Button className="w-full">
                      Sign Up to Subscribe
                    </Button>
                  </Link>
                )}
              </CardContent>
            </Card>
          ))}
        </div>
      </main>
    </div>
  );
}