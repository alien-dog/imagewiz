import { Header } from "@/components/layout/header";
import { Footer } from "@/components/layout/footer";
import { Helmet } from "react-helmet";
import { Card, CardContent } from "@/components/ui/card";
import { Lightbulb } from "lucide-react";

export default function AdvancedTechniquesGuide() {
  return (
    <div className="min-h-screen bg-background flex flex-col">
      <Helmet>
        <title>Advanced Background Removal Techniques | iMageWiz Guides</title>
        <meta 
          name="description" 
          content="Master advanced background removal techniques with iMageWiz. Learn expert tips for handling complex edges, hair, transparency, and more." 
        />
        <meta 
          name="keywords" 
          content="advanced image editing, background removal techniques, professional photo editing, complex image masking" 
        />
      </Helmet>

      <Header />

      <main className="flex-grow pt-20 pb-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="max-w-3xl mx-auto">
            <div className="flex items-center gap-4 mb-8">
              <div className="p-3 bg-primary/10 rounded-lg text-primary">
                <Lightbulb className="h-6 w-6" />
              </div>
              <h1 className="text-4xl font-bold">Advanced Background Removal Techniques</h1>
            </div>

            <div className="prose prose-lg max-w-none">
              <p className="lead">
                Take your image editing skills to the next level with these advanced techniques for handling complex background removal scenarios.
              </p>

              <h2>Handling Complex Hair and Fur</h2>
              <p>
                One of the most challenging aspects of background removal is dealing with fine details like hair and fur:
              </p>
              <ul>
                <li>Use the Detail Brush tool at high zoom levels</li>
                <li>Adjust edge refinement settings for natural transitions</li>
                <li>Utilize color sampling for better detection</li>
                <li>Apply selective masking for troublesome areas</li>
              </ul>

              <h2>Transparent and Semi-Transparent Objects</h2>
              <p>
                Working with glass, shadows, and transparency requires special attention:
              </p>
              <ul>
                <li>Preserve natural shadows and reflections</li>
                <li>Handle glass and transparent materials</li>
                <li>Maintain partial transparency</li>
                <li>Create realistic edge blending</li>
              </ul>

              <h2>Complex Lighting Scenarios</h2>
              <h3>Backlit Subjects</h3>
              <ul>
                <li>Adjust contrast and exposure selectively</li>
                <li>Use luminance masking techniques</li>
                <li>Preserve rim lighting effects</li>
                <li>Balance highlight and shadow detail</li>
              </ul>

              <h2>Professional Tips and Tricks</h2>
              <div className="bg-primary/5 p-6 rounded-lg my-8">
                <h3>Expert Workflow Tips:</h3>
                <ul>
                  <li>Create action sequences for repetitive tasks</li>
                  <li>Use keyboard shortcuts for efficiency</li>
                  <li>Implement quality control checkpoints</li>
                  <li>Develop systematic approach for consistency</li>
                </ul>
              </div>

              <h2>Color Management</h2>
              <ul>
                <li>Maintain color accuracy across different backgrounds</li>
                <li>Handle color spill from original backgrounds</li>
                <li>Adjust edge colors for natural transitions</li>
                <li>Preserve original color values</li>
              </ul>

              <h2>Batch Processing Optimization</h2>
              <ul>
                <li>Set up efficient batch processing workflows</li>
                <li>Create custom presets for different scenarios</li>
                <li>Implement quality control checks</li>
                <li>Manage large-scale projects effectively</li>
              </ul>

              <h2>Advanced Editing Features</h2>
              <p>
                Master these advanced tools and features for professional results:
              </p>
              <ul>
                <li>Smart object isolation</li>
                <li>Multi-layer masking</li>
                <li>Advanced color correction</li>
                <li>Complex selection refinement</li>
              </ul>
            </div>
          </div>
        </div>
      </main>

      <Footer />
    </div>
  );
}
