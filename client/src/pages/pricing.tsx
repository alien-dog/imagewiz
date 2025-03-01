import { Header } from "@/components/layout/header";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Check, ChevronDown } from "lucide-react";
import { useAuth } from "@/hooks/use-auth";
import { Link } from "wouter";
import { useToast } from "@/hooks/use-toast";
import { useState } from "react";

export default function Pricing() {
  const { user } = useAuth();
  const { toast } = useToast();
  const [showMorePayGo, setShowMorePayGo] = useState(false);
  const [showMoreSubscription, setShowMoreSubscription] = useState(false);
  const [selectedPayGoCredits, setSelectedPayGoCredits] = useState(10);

  const payGoOptions = [
    { credits: 10, price: 8.9, pricePerImage: 0.89 },
    { credits: 200, price: 19.9, pricePerImage: 0.1 },
    { credits: 1200, price: 149.9, pricePerImage: 0.075 },
    { credits: 5000, price: 459.9, pricePerImage: 0.05 }
  ];

  const handleSubscribe = async (priceId: string) => {
    try {
      const response = await fetch('/api/create-checkout-session', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ priceId }),
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.error || 'Failed to create checkout session');
      }

      const { url } = await response.json();
      if (url) {
        window.location.href = url;
      } else {
        throw new Error('Invalid response from server');
      }
    } catch (error: any) {
      console.error('Error creating checkout session:', error);
      toast({
        title: "Error",
        description: error.message || "Failed to process payment request",
        variant: "destructive",
      });
    }
  };

  return (
    <div className="min-h-screen bg-background">
      <Header />

      <main className="max-w-7xl mx-auto px-4 py-20">
        <div className="grid md:grid-cols-3 gap-8">
          {/* Pay as you go */}
          <Card className="relative">
            <CardHeader>
              <CardTitle>
                <h3 className="text-2xl font-bold">Pay as you go</h3>
                <div className="mt-4">
                  <span className="text-4xl font-bold">${payGoOptions[0].pricePerImage.toFixed(2)}</span>
                  <span className="text-muted-foreground"> /image</span>
                </div>
              </CardTitle>
            </CardHeader>
            <CardContent>
              <ul className="space-y-4">
                {payGoOptions.map((option) => (
                  <li key={option.credits} className="flex items-center gap-2">
                    <input 
                      type="radio" 
                      checked={selectedPayGoCredits === option.credits}
                      onChange={() => setSelectedPayGoCredits(option.credits)}
                      className="cursor-pointer"
                    />
                    <span>{option.credits} credits</span>
                    <span className="ml-auto">USD {option.price}</span>
                  </li>
                ))}
              </ul>
              <Button className="w-full mt-6">Buy now</Button>
              <p className="text-sm text-muted-foreground mt-4 text-center">
                Credits available for use anytime within two years of purchase
              </p>
            </CardContent>
          </Card>

          {/* Pro Plan */}
          <Card className="relative">
            <CardHeader>
              <CardTitle>
                <h3 className="text-2xl font-bold">Pro Plan</h3>
                <div className="mt-4">
                  <span className="text-4xl font-bold">$0.18</span>
                  <span className="text-muted-foreground"> /image</span>
                </div>
              </CardTitle>
            </CardHeader>
            <CardContent>
              <ul className="space-y-4">
                <li className="flex items-center gap-2">
                  <input type="radio" checked={false} readOnly /> 40 credits
                  <span className="text-muted-foreground">/month</span>
                  <span className="ml-auto">$8.10</span>
                </li>
                <li className="flex items-center gap-2">
                  <input type="radio" checked={true} readOnly /> 200 credits
                  <span className="text-muted-foreground">/month</span>
                  <span className="ml-auto">$35.10</span>
                </li>
                {showMoreSubscription && (
                  <>
                    <li className="flex items-center gap-2">
                      <input type="radio" checked={false} readOnly /> 500 credits
                      <span className="text-muted-foreground">/month</span>
                      <span className="ml-auto">$80.10</span>
                    </li>
                    <li className="flex items-center gap-2">
                      <input type="radio" checked={false} readOnly /> 1,200 credits
                      <span className="text-muted-foreground">/month</span>
                      <span className="ml-auto">$170.10</span>
                    </li>
                    <li className="flex items-center gap-2">
                      <input type="radio" checked={false} readOnly /> 2,800 credits
                      <span className="text-muted-foreground">/month</span>
                      <span className="ml-auto">$350.10</span>
                    </li>
                  </>
                )}
              </ul>
              <Button
                variant="ghost"
                className="w-full mt-4"
                onClick={() => setShowMoreSubscription(!showMoreSubscription)}
              >
                Show {showMoreSubscription ? 'less' : 'more'} <ChevronDown className={`ml-2 h-4 w-4 ${showMoreSubscription ? 'rotate-180' : ''} transition-transform`} />
              </Button>
              <div className="flex items-center justify-between mt-4 mb-4">
                <span>Pay Monthly</span>
                <div className="w-12 h-6 bg-primary/20 rounded-full relative cursor-pointer">
                  <div className="absolute left-1 top-1 w-4 h-4 bg-primary rounded-full"></div>
                </div>
                <span>Pay Yearly <span className="text-primary">Save 10%</span></span>
              </div>
              <Button className="w-full">Subscribe now</Button>
              <div className="mt-4 space-y-2 text-sm text-muted-foreground">
                <p className="flex items-center gap-2">
                  <Check className="h-4 w-4" /> Risk free: 14 Days Money Back Guarantee
                </p>
                <p className="flex items-center gap-2">
                  <Check className="h-4 w-4" /> Flexible: Downgrade, upgrade or cancel any time
                </p>
                <p className="flex items-center gap-2">
                  <Check className="h-4 w-4" /> Fair: Unused credits roll over as long as you're subscribed
                </p>
              </div>
            </CardContent>
          </Card>

          {/* Business Plan */}
          <Card className="relative">
            <div className="absolute -top-2 right-4 bg-primary text-primary-foreground px-3 py-1 rounded-full text-sm">
              Most Popular
            </div>
            <CardHeader>
              <CardTitle>
                <h3 className="text-2xl font-bold">Business Plan</h3>
                <div className="mt-4">
                  <span className="text-4xl font-bold">100,000+</span>
                  <span className="text-muted-foreground"> Images</span>
                  <span className="text-muted-foreground block">/year</span>
                </div>
              </CardTitle>
            </CardHeader>
            <CardContent>
              <ul className="space-y-4 mb-8">
                <li className="flex items-center gap-2">
                  <Check className="h-5 w-5 text-primary" />
                  <span>Guaranteed best price on remove.bg</span>
                </li>
                <li className="flex items-center gap-2">
                  <Check className="h-5 w-5 text-primary" />
                  <span>Flexible API, credit, and rate limits</span>
                </li>
                <li className="flex items-center gap-2">
                  <Check className="h-5 w-5 text-primary" />
                  <span>Dedicated customer success manager</span>
                </li>
              </ul>
              <Button className="w-full">Contact Sales</Button>
            </CardContent>
          </Card>

        </div>

        <div className="mt-16 text-center">
          <h2 className="text-2xl font-bold mb-8">All plans include:</h2>
          <div className="grid grid-cols-4 gap-8 text-center">
            <div>
              <div className="mb-4">∞</div>
              <p>Unlimited free previews on remove.bg</p>
            </div>
            <div>
              <div className="mb-4">{`</>`}</div>
              <p>50 free previews via API and apps per month</p>
            </div>
            <div>
              <div className="mb-4">✨</div>
              <p>remove.bg for Adobe Photoshop</p>
            </div>
            <div>
              <div className="mb-4">💻</div>
              <p>remove.bg for Windows / Mac / Linux</p>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}