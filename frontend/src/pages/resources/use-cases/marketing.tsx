import { Header } from "@/components/layout/header";
import { Footer } from "@/components/layout/footer";
import { Helmet } from "react-helmet";
import { Card, CardContent } from "@/components/ui/card";
import { Briefcase } from "lucide-react";

export default function MarketingUseCase() {
  return (
    <div className="min-h-screen bg-background flex flex-col">
      <Helmet>
        <title>Marketing & Social Media Image Enhancement | iMageWiz</title>
        <meta 
          name="description" 
          content="Create engaging marketing visuals and social media content with AI-powered background removal. Perfect for digital marketers and content creators." 
        />
        <meta 
          name="keywords" 
          content="marketing images, social media content, digital marketing, content creation, image editing for marketing" 
        />
      </Helmet>

      <Header />

      <main className="flex-grow pt-20 pb-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="max-w-3xl mx-auto">
            <div className="flex items-center gap-4 mb-8">
              <div className="p-3 bg-primary/10 rounded-lg text-primary">
                <Briefcase className="h-6 w-6" />
              </div>
              <h1 className="text-4xl font-bold">Marketing & Social Media</h1>
            </div>

            <div className="prose prose-lg max-w-none">
              <p className="lead">
                Create eye-catching marketing materials and social media content that stands out. Our AI-powered background removal tool helps marketers and content creators work faster and more efficiently.
              </p>

              <h2>Marketing Solutions</h2>
              <p>
                Perfect for various marketing materials:
              </p>
              <ul>
                <li>Social media posts and stories</li>
                <li>Digital advertisements</li>
                <li>Email marketing campaigns</li>
                <li>Website banners and hero images</li>
                <li>Print marketing materials</li>
              </ul>

              <h2>Social Media Content Creation</h2>
              <h3>Platform-Specific Solutions</h3>
              <ul>
                <li>Instagram - Create cohesive feeds and story templates</li>
                <li>Facebook - Design engaging ad creative and cover photos</li>
                <li>LinkedIn - Professional branded content</li>
                <li>TikTok - Eye-catching video thumbnails</li>
              </ul>

              <h2>Key Benefits for Marketers</h2>
              <ul>
                <li>Quick turnaround for time-sensitive campaigns</li>
                <li>Consistent brand imagery across platforms</li>
                <li>Easy template creation for ongoing campaigns</li>
                <li>Cost-effective solution for high-volume content</li>
              </ul>

              <h2>Marketing Campaign Success</h2>
              <blockquote>
                "Using iMageWiz, we increased our social media engagement by 45% through more professional and consistent visual content. The time saved on editing allows us to focus on strategy."
                <footer>- Rachel Martinez, Digital Marketing Manager</footer>
              </blockquote>

              <h2>Content Creation Tips</h2>
              <ul>
                <li>Create content batches for consistent posting</li>
                <li>Design templates for recurring content types</li>
                <li>Maintain brand consistency across platforms</li>
                <li>Test different background styles for engagement</li>
              </ul>

              <h2>Start Creating</h2>
              <p>
                Ready to elevate your marketing visuals? Sign up for iMageWiz today and transform your content creation process. Get your first 10 images processed free.
              </p>
            </div>
          </div>
        </div>
      </main>

      <Footer />
    </div>
  );
}
