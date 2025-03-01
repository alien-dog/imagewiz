import { Header } from "@/components/layout/header";
import { Footer } from "@/components/layout/footer";
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

  const payGoOptions = [
    { credits: 10, price: 8.9, pricePerImage: 0.89 },
    { credits: 200, price: 19.9, pricePerImage: 0.1 },
    { credits: 1200, price: 149.9, pricePerImage: 0.075 },
    { credits: 5000, price: 459.9, pricePerImage: 0.05 }
  ];

  return (
    <div className="min-h-screen bg-background flex flex-col">
      <Header />

      <main className="flex-grow max-w-7xl mx-auto px-4 py-20">
        <div className="max-w-3xl mx-auto">
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

          <div className="mt-16 text-center">
            <h2 className="text-2xl font-bold mb-8">All plans include:</h2>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-8 text-center">
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
        </div>
      </main>

      <Footer />
    </div>
  );
}