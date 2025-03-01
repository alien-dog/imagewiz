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
              <p className="lead text-lg text-gray-700 mb-8">
                Follow these industry-proven best practices to achieve professional results consistently and efficiently with iMageWiz.
              </p>

              <h2 className="text-2xl font-semibold text-primary-700 mt-8 mb-4">Image Preparation</h2>
              <h3 className="text-xl font-medium text-gray-800 mb-3">Before You Start</h3>
              <ul className="space-y-2 mb-6">
                <li className="flex items-start">
                  <span className="text-primary-500 mr-2">✓</span>
                  <span>Use high-resolution images (minimum 1500px on longest side)</span>
                </li>
                <li className="flex items-start">
                  <span className="text-primary-500 mr-2">✓</span>
                  <span>Ensure proper lighting and contrast</span>
                </li>
                <li className="flex items-start">
                  <span className="text-primary-500 mr-2">✓</span>
                  <span>Clean your camera lens or scanner</span>
                </li>
                <li className="flex items-start">
                  <span className="text-primary-500 mr-2">✓</span>
                  <span>Shoot against a contrasting background when possible</span>
                </li>
              </ul>

              <h2>Workflow Organization</h2>
              <ul>
                <li>Create a structured folder system</li>
                <li>Use consistent naming conventions</li>
                <li>Back up your original files</li>
                <li>Maintain version control</li>
              </ul>

              <h2 className="text-2xl font-semibold text-primary-700 mt-8 mb-4">Quality Control Standards</h2>
              <div className="bg-primary-50 border border-primary-100 p-6 rounded-lg my-8 shadow-soft">
                <h3 className="text-xl font-medium text-primary-700 mb-3">Essential Quality Checks:</h3>
                <ul className="space-y-3">
                  <li className="flex items-center">
                    <div className="h-8 w-8 rounded-full bg-primary-100 flex items-center justify-center text-primary-700 mr-3">1</div>
                    <span>Zoom to 200% to check edge quality</span>
                  </li>
                  <li className="flex items-center">
                    <div className="h-8 w-8 rounded-full bg-primary-100 flex items-center justify-center text-primary-700 mr-3">2</div>
                    <span>View against different backgrounds</span>
                  </li>
                  <li className="flex items-center">
                    <div className="h-8 w-8 rounded-full bg-primary-100 flex items-center justify-center text-primary-700 mr-3">3</div>
                    <span>Check for color contamination</span>
                  </li>
                  <li className="flex items-center">
                    <div className="h-8 w-8 rounded-full bg-primary-100 flex items-center justify-center text-primary-700 mr-3">4</div>
                    <span>Verify natural-looking edges</span>
                  </li>
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
              <blockquote className="border-l-4 border-primary-400 pl-6 py-2 my-8 bg-gradient-to-r from-primary-50 to-transparent rounded-r-lg">
                <p className="text-lg italic text-gray-700">"Consistency and attention to detail are what separate good results from great ones. Take the time to establish and follow proper workflows."</p>
                <footer className="mt-2 font-medium text-primary-600">- Professional Retouching Guidelines</footer>
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
