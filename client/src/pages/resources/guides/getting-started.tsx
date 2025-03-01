import { Header } from "@/components/layout/header";
import { Footer } from "@/components/layout/footer";
import { Helmet } from "react-helmet";
import { Card, CardContent } from "@/components/ui/card";
import { VideoIcon } from "lucide-react";

export default function GettingStartedGuide() {
  return (
    <div className="min-h-screen bg-background flex flex-col">
      <Helmet>
        <title>Getting Started with AI Background Removal | iMageWiz</title>
        <meta 
          name="description" 
          content="Learn how to use iMageWiz's AI-powered background removal tool. Step-by-step guide for beginners to create professional-looking images in minutes." 
        />
        <meta 
          name="keywords" 
          content="background removal tutorial, image editing guide, AI image processing, beginner's guide, photo editing tutorial" 
        />
      </Helmet>

      <Header />

      <main className="flex-grow pt-20 pb-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="max-w-3xl mx-auto">
            <div className="flex items-center gap-4 mb-8">
              <div className="p-3 bg-primary/10 rounded-lg text-primary">
                <VideoIcon className="h-6 w-6" />
              </div>
              <h1 className="text-4xl font-bold">Getting Started with iMageWiz</h1>
            </div>

            <div className="prose prose-lg max-w-none">
              <p className="lead">
                Welcome to iMageWiz! This comprehensive guide will walk you through everything you need to know to start removing backgrounds from your images like a pro.
              </p>

              <h2>What You'll Learn</h2>
              <ul>
                <li>How to upload and process images</li>
                <li>Understanding the AI processing options</li>
                <li>Fine-tuning your results</li>
                <li>Saving and exporting your work</li>
                <li>Tips for achieving the best results</li>
              </ul>

              <h2>Basic Concepts</h2>
              <p>
                Before we dive in, let's understand some key terms:
              </p>
              <ul>
                <li><strong>AI Processing</strong>: Our advanced algorithm that automatically detects and removes backgrounds</li>
                <li><strong>Fine-tuning</strong>: Tools to adjust the results manually if needed</li>
                <li><strong>Credits</strong>: The currency used to process images</li>
                <li><strong>Batch Processing</strong>: Processing multiple images at once</li>
              </ul>

              <h2>Step 1: Uploading Your Image</h2>
              <p>
                To get started:
              </p>
              <ol>
                <li>Click the "Upload Image" button on the dashboard</li>
                <li>Select an image from your computer or drag and drop it</li>
                <li>Supported formats: JPG, PNG (max size: 20MB)</li>
                <li>Wait for the upload to complete</li>
              </ol>

              <h2>Step 2: Processing Your Image</h2>
              <p>
                Once your image is uploaded:
              </p>
              <ol>
                <li>The AI will automatically begin processing</li>
                <li>Processing typically takes 5-10 seconds</li>
                <li>You'll see a preview of the result</li>
                <li>One credit will be deducted from your account</li>
              </ol>

              <h2>Step 3: Fine-tuning (If Needed)</h2>
              <p>
                To perfect your results:
              </p>
              <ol>
                <li>Use the brush tool to mark areas to keep or remove</li>
                <li>Adjust edge smoothness with the slider</li>
                <li>Toggle between original and processed view</li>
                <li>Zoom in for detailed work</li>
              </ol>

              <h2>Step 4: Downloading Your Image</h2>
              <p>
                Choose your preferred format:
              </p>
              <ul>
                <li>PNG with transparency</li>
                <li>JPG with white background</li>
                <li>High-resolution options</li>
                <li>Custom background colors</li>
              </ul>

              <h2>Pro Tips</h2>
              <div className="bg-primary/5 p-6 rounded-lg my-8">
                <h3>For Best Results:</h3>
                <ul>
                  <li>Use high-quality original images</li>
                  <li>Ensure good lighting and contrast</li>
                  <li>Keep the subject in focus</li>
                  <li>Avoid very busy backgrounds</li>
                </ul>
              </div>

              <h2>Troubleshooting Common Issues</h2>
              <dl>
                <dt>Hair and Fine Details</dt>
                <dd>Use the fine-tuning brush at higher zoom levels</dd>
                
                <dt>Complex Backgrounds</dt>
                <dd>Try adjusting the sensitivity slider</dd>
                
                <dt>Poor Edge Quality</dt>
                <dd>Use the smoothing tool to refine edges</dd>
              </dl>

              <h2>Next Steps</h2>
              <p>
                Now that you've mastered the basics, explore our advanced guides:
              </p>
              <ul>
                <li>Batch Processing Multiple Images</li>
                <li>Working with Transparent Backgrounds</li>
                <li>Creating Custom Backgrounds</li>
                <li>API Integration for Automation</li>
              </ul>
            </div>
          </div>
        </div>
      </main>

      <Footer />
    </div>
  );
}
