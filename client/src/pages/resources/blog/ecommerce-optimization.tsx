import { Header } from "@/components/layout/header";
import { Footer } from "@/components/layout/footer";
import { Helmet } from "react-helmet";
import { Card, CardContent } from "@/components/ui/card";
import { ShoppingCart } from "lucide-react";
import { format } from "date-fns";

export default function EcommerceOptimization() {
  const publishDate = new Date(2024, 1, 28);

  return (
    <div className="min-h-screen bg-background flex flex-col">
      <Helmet>
        <title>5 Ways to Optimize Your E-commerce Product Images | iMageWiz Blog</title>
        <meta 
          name="description" 
          content="Learn effective strategies for optimizing your e-commerce product images to boost conversion rates and enhance user experience." 
        />
        <meta 
          name="keywords" 
          content="e-commerce optimization, product photography, conversion rate optimization, image optimization, online store images" 
        />
      </Helmet>

      <Header />

      <main className="flex-grow pt-20 pb-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="max-w-3xl mx-auto">
            <div className="flex items-center gap-4 mb-4">
              <div className="p-3 bg-primary/10 rounded-lg text-primary">
                <ShoppingCart className="h-6 w-6" />
              </div>
              <h1 className="text-4xl font-bold">5 Ways to Optimize Your E-commerce Product Images</h1>
            </div>

            <div className="flex items-center gap-4 text-muted-foreground mb-8">
              <span>{format(publishDate, 'MMMM d, yyyy')}</span>
              <span>•</span>
              <span>By Michael Roberts</span>
              <span>•</span>
              <span>6 min read</span>
            </div>

            <div className="prose prose-lg max-w-none">
              <p className="lead">
                In the competitive world of e-commerce, high-quality product images can make the difference between a sale and an abandoned cart. Learn how to optimize your product images for maximum impact.
              </p>

              <h2>1. Maintain Consistent Image Styles</h2>
              <p>
                Consistency in your product images helps build trust and professionalism:
              </p>
              <ul>
                <li>Use consistent lighting and angles</li>
                <li>Standardize background colors</li>
                <li>Keep aspect ratios uniform</li>
                <li>Apply consistent styling across product categories</li>
              </ul>

              <h2>2. Optimize Image Quality and Size</h2>
              <p>
                Balance quality and loading speed for optimal user experience:
              </p>
              <ul>
                <li>Compress images without losing quality</li>
                <li>Use appropriate file formats (PNG for transparency, JPEG for photos)</li>
                <li>Implement lazy loading for faster page loads</li>
                <li>Consider mobile device limitations</li>
              </ul>

              <h2>3. Showcase Multiple Angles</h2>
              <p>
                Help customers make informed decisions with comprehensive views:
              </p>
              <ul>
                <li>Include front, back, and side views</li>
                <li>Show products in use or worn</li>
                <li>Highlight important details with close-ups</li>
                <li>Use 360-degree views when possible</li>
              </ul>

              <h2>4. Professional Background Removal</h2>
              <p>
                Clean, professional product images start with proper background removal:
              </p>
              <ul>
                <li>Use AI-powered tools for consistent results</li>
                <li>Ensure clean edges around products</li>
                <li>Maintain natural shadows where appropriate</li>
                <li>Create lifestyle composite images</li>
              </ul>

              <h2>5. Implement Proper Meta Data</h2>
              <p>
                Optimize your images for search engines and accessibility:
              </p>
              <ul>
                <li>Use descriptive file names</li>
                <li>Add relevant alt text</li>
                <li>Include structured data markup</li>
                <li>Optimize image titles and captions</li>
              </ul>

              <h2>Real-World Impact</h2>
              <blockquote>
                "After implementing these optimization techniques, our conversion rate increased by 28% and our page load times decreased by 40%."
                <footer>- Sarah Chen, E-commerce Manager</footer>
              </blockquote>

              <h2>Getting Started</h2>
              <p>
                Begin optimizing your e-commerce images today with iMageWiz's AI-powered tools. Our platform helps you implement these best practices efficiently and consistently, saving time while improving results.
              </p>

              <div className="bg-primary/5 p-6 rounded-lg my-8">
                <h3>Key Takeaways:</h3>
                <ul>
                  <li>Consistency builds trust and professionalism</li>
                  <li>Balance quality with performance</li>
                  <li>Show products from multiple angles</li>
                  <li>Remove backgrounds professionally</li>
                  <li>Optimize for search and accessibility</li>
                </ul>
              </div>
            </div>
          </div>
        </div>
      </main>

      <Footer />
    </div>
  );
}
