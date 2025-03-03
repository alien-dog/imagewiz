import { Header } from "@/components/layout/header";
import { Footer } from "@/components/layout/footer";
import { Helmet } from "react-helmet";
import { Card, CardContent } from "@/components/ui/card";
import { Leaf } from "lucide-react";
import { format } from "date-fns";

export default function SustainabilityDesign() {
  const publishDate = new Date(2024, 1, 25);

  return (
    <div className="min-h-screen bg-background flex flex-col">
      <Helmet>
        <title>Sustainability in Digital Design | iMageWiz Blog</title>
        <meta 
          name="description" 
          content="Discover how efficient image processing contributes to environmental sustainability in digital design and web development." 
        />
        <meta 
          name="keywords" 
          content="sustainable design, eco-friendly web design, green web development, sustainable digital practices" 
        />
      </Helmet>

      <Header />

      <main className="flex-grow pt-20 pb-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="max-w-3xl mx-auto">
            <div className="flex items-center gap-4 mb-4">
              <div className="p-3 bg-primary/10 rounded-lg text-primary">
                <Leaf className="h-6 w-6" />
              </div>
              <h1 className="text-4xl font-bold">Sustainability in Digital Design</h1>
            </div>

            <div className="flex items-center gap-4 text-muted-foreground mb-8">
              <span>{format(publishDate, 'MMMM d, yyyy')}</span>
              <span>•</span>
              <span>By Emma Green</span>
              <span>•</span>
              <span>7 min read</span>
            </div>

            <div className="prose prose-lg max-w-none">
              <p className="lead">
                As the digital world grows, so does its environmental impact. Learn how efficient image processing and sustainable design practices can reduce your digital carbon footprint.
              </p>

              <h2>The Environmental Impact of Digital Design</h2>
              <p>
                Digital sustainability involves:
              </p>
              <ul>
                <li>Reducing server energy consumption</li>
                <li>Optimizing data transfer</li>
                <li>Minimizing storage requirements</li>
                <li>Improving processing efficiency</li>
              </ul>

              <h2>Image Optimization for Sustainability</h2>
              <h3>File Size Reduction</h3>
              <ul>
                <li>Compress images without quality loss</li>
                <li>Choose appropriate file formats</li>
                <li>Implement responsive images</li>
                <li>Use modern image formats</li>
              </ul>

              <h3>Processing Efficiency</h3>
              <ul>
                <li>Utilize AI for faster processing</li>
                <li>Implement batch processing</li>
                <li>Optimize workflow automation</li>
                <li>Reduce redundant operations</li>
              </ul>

              <h2>Green Web Design Practices</h2>
              <p>
                Sustainable web design principles include:
              </p>
              <ul>
                <li>Minimizing unnecessary animations</li>
                <li>Using system fonts when possible</li>
                <li>Implementing efficient caching</li>
                <li>Optimizing code efficiency</li>
              </ul>

              <h2>Measuring Digital Carbon Footprint</h2>
              <p>
                Track your impact through:
              </p>
              <ul>
                <li>Page weight analysis</li>
                <li>Server energy monitoring</li>
                <li>Data transfer metrics</li>
                <li>Carbon calculation tools</li>
              </ul>

              <h2>Case Study: Green Design in Action</h2>
              <blockquote>
                "By implementing sustainable design practices and efficient image processing, we reduced our website's carbon footprint by 62% while improving load times by 45%."
                <footer>- Green Web Foundation</footer>
              </blockquote>

              <h2>Future of Sustainable Design</h2>
              <p>
                Emerging trends in sustainable digital design:
              </p>
              <ul>
                <li>Green hosting solutions</li>
                <li>AI-powered optimization</li>
                <li>Carbon-aware development</li>
                <li>Sustainable UX practices</li>
              </ul>

              <div className="bg-primary/5 p-6 rounded-lg my-8">
                <h3>Key Takeaways:</h3>
                <ul>
                  <li>Digital design has environmental impact</li>
                  <li>Efficient processing reduces carbon footprint</li>
                  <li>Sustainable practices improve performance</li>
                  <li>Measure and monitor impact</li>
                  <li>Future trends in green design</li>
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
