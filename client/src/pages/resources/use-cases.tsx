import { Header } from "@/components/layout/header";
import { Footer } from "@/components/layout/footer";
import { Helmet } from "react-helmet";
import { Card, CardContent } from "@/components/ui/card";
import { 
  ShoppingBag, 
  Camera, 
  Briefcase, 
  PenTool 
} from "lucide-react";

const useCases = [
  {
    icon: <ShoppingBag className="h-6 w-6" />,
    title: "E-commerce",
    description: "Perfect for online stores needing clean product photos. Remove backgrounds from product images to create consistent, professional listings.",
    example: "https://example.com/ecommerce-demo.jpg"
  },
  {
    icon: <Camera className="h-6 w-6" />,
    title: "Photography",
    description: "Professional photographers can quickly process portraits and create stunning composite images with clean background removal.",
    example: "https://example.com/photography-demo.jpg"
  },
  {
    icon: <Briefcase className="h-6 w-6" />,
    title: "Marketing",
    description: "Create eye-catching marketing materials and social media content with clean, professional image editing.",
    example: "https://example.com/marketing-demo.jpg"
  },
  {
    icon: <PenTool className="h-6 w-6" />,
    title: "Graphic Design",
    description: "Streamline your design workflow by quickly removing backgrounds from images for layouts and compositions.",
    example: "https://example.com/design-demo.jpg"
  }
];

export default function UseCases() {
  return (
    <div className="min-h-screen bg-background flex flex-col">
      <Helmet>
        <title>AI Image Background Removal Use Cases | iMageWiz</title>
        <meta name="description" content="Discover how iMageWiz's AI-powered background removal can transform your e-commerce, photography, marketing, and design projects. See real-world examples and applications." />
        <meta name="keywords" content="background removal, AI image editing, e-commerce photography, product photos, marketing images, graphic design, image processing" />
      </Helmet>

      <Header />

      <main className="flex-grow pt-20 pb-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <h1 className="text-4xl font-bold mb-4">
              Background Removal Use Cases
            </h1>
            <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
              Explore how businesses and professionals use iMageWiz to streamline their workflow and create stunning visuals.
            </p>
          </div>

          <div className="grid md:grid-cols-2 gap-8 mb-16">
            {useCases.map((useCase, index) => (
              <Card key={index} className="overflow-hidden hover:shadow-lg transition-shadow">
                <CardContent className="p-6">
                  <div className="flex items-center gap-4 mb-4">
                    <div className="p-3 bg-primary/10 rounded-lg text-primary">
                      {useCase.icon}
                    </div>
                    <h2 className="text-2xl font-semibold">{useCase.title}</h2>
                  </div>
                  <p className="text-muted-foreground mb-6">
                    {useCase.description}
                  </p>
                  <div className="aspect-video rounded-lg overflow-hidden bg-muted">
                    <img 
                      src={useCase.example} 
                      alt={`${useCase.title} example`}
                      className="w-full h-full object-cover"
                    />
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </main>

      <Footer />
    </div>
  );
}
