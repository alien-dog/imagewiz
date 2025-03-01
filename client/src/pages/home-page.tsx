import { Link } from "wouter";
import { Button } from "@/components/ui/button";
import { Header } from "@/components/layout/header";
import { useAuth } from "@/hooks/use-auth";
import { 
  Wand2,
  Zap,
  Shield,
  Clock,
  ArrowRight
} from "lucide-react";

export default function HomePage() {
  const { user } = useAuth();

  return (
    <div className="min-h-screen bg-background">
      <Header />
      
      {/* Hero Section */}
      <section className="py-20 px-4 max-w-6xl mx-auto">
        <div className="text-center">
          <h1 className="text-5xl font-bold tracking-tight">
            Effortless AI-Powered Image Background Removal
          </h1>
          <p className="mt-6 text-xl text-muted-foreground max-w-2xl mx-auto">
            Transform your images instantly with our advanced AI technology. Perfect for designers, marketers, and creators.
          </p>
          <div className="mt-10 flex justify-center gap-4">
            <Link href={user ? "/dashboard" : "/auth"}>
              <Button size="lg" className="gap-2">
                Try Now <ArrowRight className="w-4 h-4" />
              </Button>
            </Link>
            <Link href="/pricing">
              <Button variant="outline" size="lg">
                View Pricing
              </Button>
            </Link>
          </div>
        </div>
      </section>

      {/* Features */}
      <section className="py-20 bg-muted">
        <div className="max-w-6xl mx-auto px-4">
          <h2 className="text-3xl font-bold text-center mb-12">
            Why Choose iMageWiz?
          </h2>
          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-8">
            {[
              {
                icon: <Wand2 className="w-6 h-6" />,
                title: "AI-Powered",
                description: "Advanced machine learning for precise results"
              },
              {
                icon: <Zap className="w-6 h-6" />,
                title: "Instant Processing",
                description: "Get your images processed in seconds"
              },
              {
                icon: <Shield className="w-6 h-6" />,
                title: "Secure",
                description: "Your images are safe with enterprise-grade security"
              },
              {
                icon: <Clock className="w-6 h-6" />,
                title: "24/7 Availability",
                description: "Process images anytime, anywhere"
              }
            ].map((feature, i) => (
              <div key={i} className="bg-card p-6 rounded-lg">
                <div className="w-12 h-12 bg-primary/10 rounded-full flex items-center justify-center text-primary mb-4">
                  {feature.icon}
                </div>
                <h3 className="font-semibold text-lg mb-2">{feature.title}</h3>
                <p className="text-muted-foreground">{feature.description}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t py-12">
        <div className="max-w-6xl mx-auto px-4 text-center text-muted-foreground">
          <p>© 2024 iMageWiz. All rights reserved.</p>
        </div>
      </footer>
    </div>
  );
}
