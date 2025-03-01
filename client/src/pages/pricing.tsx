import { Header } from "@/components/layout/header";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Check } from "lucide-react";
import { useAuth } from "@/hooks/use-auth";
import { Link } from "wouter";
import { useToast } from "@/hooks/use-toast";
import { useState } from "react";

export default function Pricing() {
  const { user } = useAuth();
  const { toast } = useToast();
  const [selectedPayGoCredits, setSelectedPayGoCredits] = useState(10);
  const [isYearlyBilling, setIsYearlyBilling] = useState(false);
  const [selectedProCredits, setSelectedProCredits] = useState(250);

  const payGoOptions = [
    { credits: 10, price: 8.9, pricePerImage: 0.89 },
    { credits: 200, price: 19.9, pricePerImage: 0.1 },
    { credits: 1200, price: 149.9, pricePerImage: 0.075 },
    { credits: 5000, price: 459.9, pricePerImage: 0.05 }
  ];

  const proMonthlyOptions = [
    { credits: 50, price: 9.9, pricePerImage: 0.2 },
    { credits: 250, price: 24.9, pricePerImage: 0.1 },
    { credits: 1250, price: 85.9, pricePerImage: 0.07 },
    { credits: 5050, price: 239.9, pricePerImage: 0.047 }
  ];

  const proYearlyOptions = [
    { credits: 50, price: 8.9, pricePerImage: 0.178 },
    { credits: 250, price: 21.9, pricePerImage: 0.087 },
    { credits: 1250, price: 76.9, pricePerImage: 0.061 },
    { credits: 5050, price: 215.9, pricePerImage: 0.042 }
  ];

  const getCurrentProOptions = () => {
    return isYearlyBilling ? proYearlyOptions : proMonthlyOptions;
  };

  return (
    <div className="min-h-screen bg-background">
      <Header />

      <main className="max-w-7xl mx-auto px-4 py-20">
        <div className="grid md:grid-cols-2 gap-8">
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
            <div className="absolute -top-2 right-4 bg-primary text-primary-foreground px-3 py-1 rounded-full text-sm">
              Most Popular
            </div>
            <CardHeader>
              <CardTitle>
                <h3 className="text-2xl font-bold">Pro Plan</h3>
                <div className="mt-4">
                  <span className="text-4xl font-bold">
                    ${(isYearlyBilling ? proYearlyOptions[1].pricePerImage : proMonthlyOptions[1].pricePerImage).toFixed(3)}
                  </span>
                  <span className="text-muted-foreground"> /image</span>
                </div>
              </CardTitle>
            </CardHeader>
            <CardContent>
              {/* Billing Toggle */}
              <div className="mb-8">
                <div className="grid grid-cols-2 gap-2">
                  <div 
                    onClick={() => setIsYearlyBilling(false)}
                    className={`cursor-pointer rounded-lg p-4 text-center transition-all ${!isYearlyBilling 
                      ? 'bg-primary text-primary-foreground shadow-lg' 
                      : 'bg-muted/50 hover:bg-muted/70'}`}
                  >
                    <div className="font-medium text-lg">Pay Monthly</div>
                    <div className="text-sm opacity-90">Regular price</div>
                  </div>
                  <div 
                    onClick={() => setIsYearlyBilling(true)}
                    className={`cursor-pointer rounded-lg p-4 text-center transition-all relative ${isYearlyBilling 
                      ? 'bg-primary text-primary-foreground shadow-lg' 
                      : 'bg-muted/50 hover:bg-muted/70'}`}
                  >
                    <div className="absolute -top-2 left-1/2 -translate-x-1/2 bg-destructive text-destructive-foreground px-2 py-0.5 rounded-full text-xs">
                      Most Popular
                    </div>
                    <div className="font-medium text-lg">Pay Yearly</div>
                    <div className="text-sm">
                      <span className="text-destructive font-bold">Save 10%</span>
                    </div>
                  </div>
                </div>
              </div>

              <ul className="space-y-4">
                {getCurrentProOptions().map((option) => (
                  <li key={option.credits} className="flex items-center gap-2">
                    <input 
                      type="radio" 
                      checked={selectedProCredits === option.credits}
                      onChange={() => setSelectedProCredits(option.credits)}
                      className="cursor-pointer"
                    />
                    <span>{option.credits} credits</span>
                    <span className="text-muted-foreground">/month</span>
                    <span className="ml-auto">USD {option.price.toFixed(1)}</span>
                  </li>
                ))}
              </ul>

              <Button className="w-full mt-6">Subscribe now</Button>
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