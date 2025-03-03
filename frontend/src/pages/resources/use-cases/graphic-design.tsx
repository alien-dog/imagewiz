import { Header } from "@/components/layout/header";
import { Footer } from "@/components/layout/footer";
import { Helmet } from "react-helmet";
import { Card, CardContent } from "@/components/ui/card";
import { PenTool } from "lucide-react";

export default function GraphicDesignUseCase() {
  return (
    <div className="min-h-screen bg-background flex flex-col">
      <Helmet>
        <title>Graphic Design Background Removal Tools | iMageWiz</title>
        <meta 
          name="description" 
          content="Streamline your graphic design workflow with powerful AI background removal. Create stunning compositions and designs faster than ever." 
        />
        <meta 
          name="keywords" 
          content="graphic design tools, design workflow, image composition, creative design, background removal for designers" 
        />
      </Helmet>

      <Header />

      <main className="flex-grow pt-20 pb-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="max-w-3xl mx-auto">
            <div className="flex items-center gap-4 mb-8">
              <div className="p-3 bg-primary/10 rounded-lg text-primary">
                <PenTool className="h-6 w-6" />
              </div>
              <h1 className="text-4xl font-bold">Graphic Design</h1>
            </div>

            <div className="prose prose-lg max-w-none">
              <p className="lead text-xl text-gray-700 mb-8 border-l-4 border-primary-500 pl-4 py-2 bg-gradient-to-r from-primary-50 to-transparent">
                Enhance your graphic design workflow with powerful AI-driven background removal. Create stunning compositions and designs faster than ever before.
              </p>

              <h2 className="text-2xl font-semibold text-primary-700 mt-10 mb-6 flex items-center">
                <span className="bg-primary-100 text-primary-700 p-2 rounded-lg mr-3">
                  <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                    <path d="M2 9.5L12 3L22 9.5M4 10V20H20V10M12 14V17M8 14V17M16 14V17" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                  </svg>
                </span>
                Design Workflow Integration
              </h2>
              <p className="text-gray-700 mb-4">
                Perfect for various design projects:
              </p>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-8">
                <div className="flex items-center bg-white p-4 rounded-lg shadow-soft hover:shadow-feature transition-shadow duration-300">
                  <span className="text-primary-500 mr-3">●</span>
                  <span>Brand identity design</span>
                </div>
                <div className="flex items-center bg-white p-4 rounded-lg shadow-soft hover:shadow-feature transition-shadow duration-300">
                  <span className="text-primary-500 mr-3">●</span>
                  <span>Marketing collateral</span>
                </div>
                <div className="flex items-center bg-white p-4 rounded-lg shadow-soft hover:shadow-feature transition-shadow duration-300">
                  <span className="text-primary-500 mr-3">●</span>
                  <span>Digital and print advertisements</span>
                </div>
                <div className="flex items-center bg-white p-4 rounded-lg shadow-soft hover:shadow-feature transition-shadow duration-300">
                  <span className="text-primary-500 mr-3">●</span>
                  <span>Social media graphics</span>
                </div>
                <div className="flex items-center bg-white p-4 rounded-lg shadow-soft hover:shadow-feature transition-shadow duration-300">
                  <span className="text-primary-500 mr-3">●</span>
                  <span>Package design</span>
                </div>
              </div>

              <h2>Professional Design Features</h2>
              <h3>Advanced Capabilities</h3>
              <ul>
                <li>High-precision edge detection</li>
                <li>Support for complex textures</li>
                <li>Multiple file format exports</li>
                <li>Batch processing for design sets</li>
              </ul>

              <h2>Design Workflow Benefits</h2>
              <ul>
                <li>Seamless integration with design software</li>
                <li>Faster iteration and prototyping</li>
                <li>Consistent design elements across projects</li>
                <li>Time savings on complex compositions</li>
              </ul>

              <h2>Designer Success Story</h2>
              <blockquote>
                "iMageWiz has become an essential part of my design toolkit. The precision and speed of the background removal allow me to focus on the creative aspects of my work."
                <footer>- Alex Chen, Senior Graphic Designer</footer>
              </blockquote>

              <h2>Design Best Practices</h2>
              <ul>
                <li>Create reusable design elements</li>
                <li>Maintain consistent style guides</li>
                <li>Organize assets efficiently</li>
                <li>Test designs across different mediums</li>
              </ul>

              <h2>Start Designing</h2>
              <p>
                Ready to transform your design workflow? Sign up for iMageWiz today and experience the power of AI-driven design tools. Get your first 10 images processed free.
              </p>
            </div>
          </div>
        </div>
      </main>

      <Footer />
    </div>
  );
}
