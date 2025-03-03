import { Header } from "@/components/layout/header";
import { Footer } from "@/components/layout/footer";
import { Helmet } from "react-helmet";
import { Card, CardContent } from "@/components/ui/card";
import { Camera } from "lucide-react";

export default function PhotographyUseCase() {
  return (
    <div className="min-h-screen bg-background flex flex-col">
      <Helmet>
        <title>Professional Photography Background Removal | iMageWiz</title>
        <meta 
          name="description" 
          content="Transform your photography workflow with AI-powered background removal. Perfect for portraits, product shots, and creative composites." 
        />
        <meta 
          name="keywords" 
          content="photography background removal, portrait editing, photo manipulation, professional photography tools" 
        />
      </Helmet>

      <Header />

      <main className="flex-grow pt-20 pb-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="max-w-3xl mx-auto">
            <div className="flex items-center gap-4 mb-8">
              <div className="p-3 bg-primary/10 rounded-lg text-primary">
                <Camera className="h-6 w-6" />
              </div>
              <h1 className="text-4xl font-bold">Professional Photography</h1>
            </div>

            <div className="prose prose-lg max-w-none">
              <p className="lead">
                Elevate your photography with professional-grade background removal. Perfect for portrait photographers, commercial shoots, and creative artists.
              </p>

              <h2>Transform Your Photography Workflow</h2>
              <p>
                As a professional photographer, your time is valuable. Our AI-powered background removal tool helps you:
              </p>
              <ul>
                <li>Process high-volume portrait sessions quickly</li>
                <li>Create stunning composite images</li>
                <li>Maintain consistent backgrounds across photo series</li>
                <li>Save hours of manual editing time</li>
              </ul>

              <h2>Perfect for Various Photography Styles</h2>
              <h3>Portrait Photography</h3>
              <ul>
                <li>Clean, professional headshots</li>
                <li>Family portraits with custom backgrounds</li>
                <li>Fashion and model photography</li>
                <li>School and event photography</li>
              </ul>

              <h3>Commercial Photography</h3>
              <ul>
                <li>Product photography</li>
                <li>Corporate headshots</li>
                <li>Real estate photography</li>
                <li>Food photography</li>
              </ul>

              <h2>Advanced Features for Photographers</h2>
              <ul>
                <li>High-resolution output support</li>
                <li>Batch processing capabilities</li>
                <li>Fine-tuning tools for perfect edges</li>
                <li>Multiple export formats (PNG, PSD, JPEG)</li>
              </ul>

              <h2>Success Story</h2>
              <blockquote>
                "iMageWiz has revolutionized our studio workflow. We can now offer same-day delivery for corporate headshots and process entire wedding albums in a fraction of the time."
                <footer>- Mark Johnson, Professional Photographer</footer>
              </blockquote>

              <h2>Getting Started</h2>
              <p>
                Ready to transform your photography workflow? Sign up for iMageWiz today and get your first 10 images processed for free. Our AI technology ensures professional results in seconds.
              </p>
            </div>
          </div>
        </div>
      </main>

      <Footer />
    </div>
  );
}
