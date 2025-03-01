import { Link } from "wouter";
import { Button } from "@/components/ui/button";
import { Header } from "@/components/layout/header";
import { Footer } from "@/components/layout/footer";
import { useAuth } from "@/hooks/use-auth";
import { useState, useEffect } from "react";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import {
  Wand2,
  Zap,
  Shield,
  Clock,
  Check,
  ArrowRight
} from "lucide-react";

export default function HomePage() {
  const { user } = useAuth();
  const [isDragging, setIsDragging] = useState(false);
  const [sliderPosition, setSliderPosition] = useState(50);
  const [activeTestimonial, setActiveTestimonial] = useState(0);
  const [selectedPayGoCredits, setSelectedPayGoCredits] = useState(10);
  const [isYearlyBilling, setIsYearlyBilling] = useState(false);
  const [selectedProCredits, setSelectedProCredits] = useState(250);

  const payGoOptions = [
    { credits: 10, price: 8.9, pricePerImage: 0.89 },
    { credits: 200, price: 19.9, pricePerImage: 0.1 },
    { credits: 600, price: 59.9, pricePerImage: 0.099 },
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

  const testimonials = [
    {
      name: "Sarah Mitchell",
      role: "Marketing Director at TechCorp",
      image: "https://public.readdy.ai/ai/img_res/f834c10cf5d8a9ec1e07d810c27efbd6.jpg",
      text: "iMagenWiz has revolutionized our product photography workflow. The AI is incredibly accurate and saves us hours of manual editing time."
    },
    {
      name: "David Chen",
      role: "Lead Designer at CreativeHub",
      image: "https://public.readdy.ai/ai/img_res/5214d576ed2262d0a6ad564696c167f8.jpg",
      text: "The quality and speed of background removal are unmatched. It's become an essential tool in our design workflow."
    },
    {
      name: "Michael Thompson",
      role: "E-commerce Manager at ShopStyle",
      image: "https://public.readdy.ai/ai/img_res/b902cdded3f32ba86b44c082d561ac72.jpg",
      text: "We process thousands of product images daily, and iMagenWiz handles them all perfectly. The API integration was seamless."
    }
  ];

  const features = [
    {
      icon: <Wand2 className="h-6 w-6" />,
      title: "AI-Powered",
      description: "Advanced machine learning algorithms for precise edge detection"
    },
    {
      icon: <Zap className="h-6 w-6" />,
      title: "Lightning Fast",
      description: "Process images in seconds with our optimized cloud infrastructure"
    },
    {
      icon: <Shield className="h-6 w-6" />,
      title: "High Quality",
      description: "Maintain original image quality with precise edge detection"
    },
    {
      icon: <Clock className="h-6 w-6" />,
      title: "Secure",
      description: "Enterprise-grade security for your images and data"
    }
  ];

  const handleSliderMouseDown = () => {
    setIsDragging(true);
  };

  const handleSliderMouseMove = (e: React.MouseEvent) => {
    if (!isDragging) return;
    const rect = e.currentTarget.getBoundingClientRect();
    const x = Math.max(0, Math.min(e.clientX - rect.left, rect.width));
    setSliderPosition((x / rect.width) * 100);
  };

  const handleSliderMouseUp = () => {
    setIsDragging(false);
  };

  useEffect(() => {
    document.addEventListener('mouseup', handleSliderMouseUp);
    return () => {
      document.removeEventListener('mouseup', handleSliderMouseUp);
    };
  }, []);

  return (
    <div className="min-h-screen bg-background flex flex-col">
      <Header />

      <main className="flex-grow">
        {/* Hero Section */}
        <section className="relative bg-gradient-to-r from-gray-50 to-white overflow-hidden pt-16">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-24">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-12 items-center">
              <div>
                <h1 className="text-5xl font-bold leading-tight mb-6">
                  Effortless AI-Powered Image Background Removal
                </h1>
                <p className="text-lg text-gray-600 mb-8">
                  Transform your images instantly with our advanced AI technology. Perfect for designers, marketers, and creators who need professional results in seconds.
                </p>
                <div className="flex gap-4">
                  <Link href={user ? "/dashboard" : "/auth"}>
                    <Button size="lg" className="button-primary">
                      Get Started Free
                    </Button>
                  </Link>
                  <Button variant="outline" size="lg" className="button-outline">
                    See How It Works
                  </Button>
                </div>
              </div>
              <div
                className="relative rounded-lg shadow-xl overflow-hidden"
                onMouseMove={handleSliderMouseMove}
                onMouseDown={handleSliderMouseDown}
              >
                <img
                  src="https://public.readdy.ai/ai/img_res/9eabac3684a72e87dea67683d0b25398.jpg"
                  alt="Before-After Demo"
                  className="w-full"
                />
                <div
                  className="absolute top-0 bottom-0 w-1 bg-white cursor-col-resize"
                  style={{ left: `${sliderPosition}%` }}
                />
              </div>
            </div>
          </div>
        </section>

        {/* Features Section */}
        <section id="features" className="py-24 bg-white">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="text-center mb-16">
              <h2 className="text-4xl font-bold mb-4">Why Choose iMagenWiz?</h2>
              <p className="text-lg text-gray-600">Powerful features that make background removal effortless</p>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
              {features.map((feature, index) => (
                <div key={index} className="p-6 rounded-lg bg-gray-50 hover:shadow-lg transition-shadow">
                  <div className="w-12 h-12 flex items-center justify-center bg-primary/10 rounded-full mb-4 text-primary">
                    {feature.icon}
                  </div>
                  <h3 className="text-xl font-semibold mb-2">{feature.title}</h3>
                  <p className="text-gray-600">{feature.description}</p>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* Testimonials Section */}
        <section className="py-24 bg-gray-50">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="text-center mb-16">
              <h2 className="text-4xl font-bold mb-4">Trusted by Industry Leaders</h2>
              <p className="text-lg text-gray-600">See what our customers have to say about iMagenWiz</p>
            </div>
            <div className="relative">
              <div className="flex overflow-x-auto gap-6 pb-8 hide-scrollbar">
                {testimonials.map((testimonial, index) => (
                  <div key={index} className="flex-none w-96 bg-white p-6 rounded-lg shadow-sm">
                    <div className="flex items-center mb-4">
                      <img src={testimonial.image} alt={testimonial.name} className="w-12 h-12 rounded-full object-cover" />
                      <div className="ml-4">
                        <h4 className="font-semibold">{testimonial.name}</h4>
                        <p className="text-sm text-gray-600">{testimonial.role}</p>
                      </div>
                    </div>
                    <p className="text-gray-600">{testimonial.text}</p>
                  </div>
                ))}
              </div>
              <div className="flex justify-center mt-6 gap-2">
                {testimonials.map((_, index) => (
                  <button
                    key={index}
                    className={`w-2 h-2 rounded-full transition-colors ${
                      index === activeTestimonial ? 'bg-primary' : 'bg-gray-300'
                    }`}
                    onClick={() => setActiveTestimonial(index)}
                  />
                ))}
              </div>
            </div>
          </div>
        </section>

        {/* Pricing Section */}
        <section id="pricing" className="py-24 bg-white">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="text-center mb-16">
              <h2 className="text-4xl font-bold mb-4">Simple, Transparent Pricing</h2>
              <p className="text-lg text-gray-600">Choose the credit package that works best for you</p>
            </div>

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
          </div>
        </section>

        {/* CTA Section */}
        <section className="py-24 bg-gray-50">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="text-center">
              <h2 className="text-4xl font-bold mb-4">Transform Your Images Today</h2>
              <p className="text-lg text-gray-600 mb-8">Join thousands of satisfied customers using iMagenWiz</p>
              <Link href={user ? "/dashboard" : "/auth"}>
                <Button className="button-primary px-12 py-4 text-xl font-semibold shadow-lg hover:shadow-xl transition-all transform hover:-translate-y-1">
                  Get Started Free
                  <span className="block text-sm font-normal mt-1">No Credit Card Required</span>
                </Button>
              </Link>
            </div>
          </div>
        </section>
      </main>

      <Footer />
    </div>
  );
}