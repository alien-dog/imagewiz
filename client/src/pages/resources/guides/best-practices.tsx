import { Header } from "@/components/layout/header";
import { Footer } from "@/components/layout/footer";
import { Helmet } from "react-helmet";
import { Card, CardContent } from "@/components/ui/card";
import { GraduationCap } from "lucide-react";

export default function BestPracticesGuide() {
  return (
    <div className="min-h-screen bg-background flex flex-col">
      <Helmet>
        <title>Best Practices for Image Background Removal | iMageWiz</title>
        <meta 
          name="description" 
          content="Learn industry best practices for professional image background removal. Optimize your workflow and achieve consistent, high-quality results." 
        />
        <meta 
          name="keywords" 
          content="image editing best practices, background removal tips, professional photo editing, workflow optimization" 
        />
      </Helmet>

      <Header />

      <main className="flex-grow pt-20 pb-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="max-w-3xl mx-auto">
            <div className="flex items-center gap-4 mb-8">
              <div className="p-3 bg-primary/10 rounded-lg text-primary">
                <GraduationCap className="h-6 w-6" />
              </div>
              <h1 className="text-4xl font-bold">Background Removal Best Practices</h1>
            </div>

            <div className="prose prose-lg max-w-none">
              <p className="lead">
                Follow these industry-proven best practices to achieve professional results consistently and efficiently with iMageWiz.
              </p>

              <h2>Image Preparation</h2>
              <h3>Before You Start</h3>
              <ul>
                <li>Use high-resolution images (minimum 1500px on longest side)</li>
                <li>Ensure proper lighting and contrast</li>
                <li>Clean your camera lens or scanner</li>
                <li>Shoot against a contrasting background when possible</li>
              </ul>

              <h2>Workflow Organization</h2>
              <ul>
                <li>Create a structured folder system</li>
                <li>Use consistent naming conventions</li>
                <li>Back up your original files</li>
                <li>Maintain version control</li>
              </ul>

              <h2>Quality Control Standards</h2>
              <div className="bg-primary/5 p-6 rounded-lg my-8">
                <h3>Essential Quality Checks:</h3>
                <ul>
                  <li>Zoom to 200% to check edge quality</li>
                  <li>View against different backgrounds</li>
                  <li>Check for color contamination</li>
                  <li>Verify natural-looking edges</li>
                </ul>
              </div>

              <h2>Optimization Tips</h2>
              <h3>For Best Results:</h3>
              <ul>
                <li>Process similar images in batches</li>
                <li>Create templates for recurring tasks</li>
                <li>Use keyboard shortcuts</li>
                <li>Regular breaks to maintain attention to detail</li>
              </ul>

              <h2>Common Pitfalls to Avoid</h2>
              <ul>
                <li>Over-processing edges</li>
                <li>Ignoring color accuracy</li>
                <li>Rushing through complex areas</li>
                <li>Skipping quality checks</li>
              </ul>

              <h2>File Management</h2>
              <h3>Saving and Exporting</h3>
              <ul>
                <li>Use appropriate file formats for different purposes</li>
                <li>Maintain proper color profiles</li>
                <li>Consider file size optimization</li>
                <li>Archive projects systematically</li>
              </ul>

              <h2>Professional Standards</h2>
              <blockquote>
                "Consistency and attention to detail are what separate good results from great ones. Take the time to establish and follow proper workflows."
                <footer>- Professional Retouching Guidelines</footer>
              </blockquote>

              <h2>Continuous Improvement</h2>
              <p>
                Stay updated with the latest techniques and tools:
              </p>
              <ul>
                <li>Follow our blog for updates</li>
                <li>Participate in community discussions</li>
                <li>Practice with different image types</li>
                <li>Document your learnings</li>
              </ul>
            </div>
          </div>
        </div>
      </main>

      <Footer />
    </div>
  );
}
