import { Header } from "@/components/layout/header";
import { Footer } from "@/components/layout/footer";
import { Helmet } from "react-helmet";
import { Card, CardContent } from "@/components/ui/card";
import { ShoppingBag } from "lucide-react";

export default function EcommerceUseCase() {
  return (
    <div className="min-h-screen bg-background flex flex-col">
      <Helmet>
        <title>E-commerce Background Removal Guide | iMageWiz</title>
        <meta 
          name="description" 
          content="Learn how to optimize your e-commerce product photos with AI-powered background removal. Boost conversion rates with professional, consistent product images." 
        />
        <meta 
          name="keywords" 
          content="e-commerce photography, product photo editing, background removal for e-commerce, product image optimization" 
        />
      </Helmet>

      <Header />

      <main className="flex-grow pt-20 pb-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="max-w-3xl mx-auto">
            <div className="flex items-center gap-4 mb-8">
              <div className="p-3 bg-primary/10 rounded-lg text-primary">
                <ShoppingBag className="h-6 w-6" />
              </div>
              <h1 className="text-4xl font-bold">E-commerce Image Enhancement</h1>
            </div>

            <div className="prose prose-lg max-w-none">
              <p className="lead">
                Perfect product photography is essential for e-commerce success. Learn how to use iMageWiz to create professional, consistent product images that drive sales.
              </p>

              <h2>Why Background Removal Matters in E-commerce</h2>
              <p>
                In the competitive world of online retail, product presentation can make or break a sale. Clean, professional product images with consistent backgrounds:
              </p>
              <ul>
                <li>Increase conversion rates by up to 40%</li>
                <li>Improve brand consistency across your store</li>
                <li>Enable easy creation of lifestyle composites</li>
                <li>Save time and money on professional photo editing</li>
              </ul>

              <h2>Step-by-Step Guide</h2>
              <h3>1. Preparing Your Product Photos</h3>
              <p>
                Before uploading your images to iMageWiz, ensure:
              </p>
              <ul>
                <li>Good lighting with minimal shadows</li>
                <li>Sharp focus on the product</li>
                <li>High resolution (at least 1500px on the longest side)</li>
                <li>Product fills at least 60% of the frame</li>
              </ul>

              <h3>2. Processing with iMageWiz</h3>
              <p>
                Our AI-powered technology makes background removal simple:
              </p>
              <ul>
                <li>Upload multiple images at once</li>
                <li>Automatic background detection</li>
                <li>Fine-tune results with our editor</li>
                <li>Download in various formats (PNG, JPEG, PSD)</li>
              </ul>

              <h3>3. Optimizing for Your Platform</h3>
              <p>
                Different marketplaces have different requirements:
              </p>
              <ul>
                <li>Amazon: Pure white background (RGB: 255,255,255)</li>
                <li>Etsy: Allows transparent backgrounds</li>
                <li>Your own store: Consistent custom backgrounds</li>
              </ul>

              <h2>Best Practices</h2>
              <ul>
                <li>Maintain consistent image dimensions across your catalog</li>
                <li>Use high-quality original photos</li>
                <li>Consider adding subtle shadows for depth</li>
                <li>Save templates for consistent processing</li>
              </ul>

              <h2>Success Stories</h2>
              <blockquote>
                "Using iMageWiz, we processed over 1,000 product images in just one day. Our conversion rate improved by 35% after implementing consistent, professional product photos."
                <footer>- Sarah Chen, Fashion Retailer</footer>
              </blockquote>

              <h2>Getting Started</h2>
              <p>
                Ready to transform your e-commerce photography? Sign up for iMageWiz today and get your first 10 images processed for free. Our AI technology ensures professional results in seconds.
              </p>
            </div>
          </div>
        </div>
      </main>

      <Footer />
    </div>
  );
}
