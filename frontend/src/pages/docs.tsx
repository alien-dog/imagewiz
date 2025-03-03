import { Header } from "@/components/layout/header";
import { Footer } from "@/components/layout/footer";
import { Helmet } from "react-helmet";
import { Card, CardContent } from "@/components/ui/card";
import { FileText, Code, Terminal, Workflow } from "lucide-react";

export default function Documentation() {
  return (
    <div className="min-h-screen bg-background flex flex-col">
      <Helmet>
        <title>Documentation | iMagenWiz</title>
        <meta 
          name="description" 
          content="Comprehensive documentation for iMagenWiz - Learn how to use our AI-powered image processing tools." 
        />
      </Helmet>

      <Header />

      <main className="flex-grow pt-20 pb-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="max-w-3xl mx-auto">
            <h1 className="text-4xl font-bold mb-8">Documentation</h1>
            
            <div className="prose prose-lg max-w-none">
              <p className="lead">
                Welcome to iMagenWiz documentation. Here you'll find comprehensive guides and documentation to help you start working with our AI-powered image processing tools as quickly as possible.
              </p>

              <div className="grid gap-6 mt-8">
                <Card>
                  <CardContent className="p-6">
                    <div className="flex items-center gap-4 mb-4">
                      <div className="p-2 bg-primary/10 rounded-lg">
                        <FileText className="h-6 w-6 text-primary" />
                      </div>
                      <h2 className="text-xl font-semibold">Getting Started</h2>
                    </div>
                    <ul className="space-y-2">
                      <li>• Creating an account</li>
                      <li>• Understanding credits system</li>
                      <li>• Your first image processing</li>
                      <li>• Best practices for optimal results</li>
                    </ul>
                  </CardContent>
                </Card>

                <Card>
                  <CardContent className="p-6">
                    <div className="flex items-center gap-4 mb-4">
                      <div className="p-2 bg-primary/10 rounded-lg">
                        <Code className="h-6 w-6 text-primary" />
                      </div>
                      <h2 className="text-xl font-semibold">Features & Tools</h2>
                    </div>
                    <ul className="space-y-2">
                      <li>• Background removal</li>
                      <li>• Image enhancement options</li>
                      <li>• Batch processing</li>
                      <li>• Supported file formats</li>
                    </ul>
                  </CardContent>
                </Card>

                <Card>
                  <CardContent className="p-6">
                    <div className="flex items-center gap-4 mb-4">
                      <div className="p-2 bg-primary/10 rounded-lg">
                        <Terminal className="h-6 w-6 text-primary" />
                      </div>
                      <h2 className="text-xl font-semibold">Technical Guidelines</h2>
                    </div>
                    <ul className="space-y-2">
                      <li>• Image size requirements</li>
                      <li>• Processing limitations</li>
                      <li>• Performance optimization</li>
                      <li>• Troubleshooting common issues</li>
                    </ul>
                  </CardContent>
                </Card>

                <Card>
                  <CardContent className="p-6">
                    <div className="flex items-center gap-4 mb-4">
                      <div className="p-2 bg-primary/10 rounded-lg">
                        <Workflow className="h-6 w-6 text-primary" />
                      </div>
                      <h2 className="text-xl font-semibold">Workflow Integration</h2>
                    </div>
                    <ul className="space-y-2">
                      <li>• Adobe Photoshop plugin</li>
                      <li>• Desktop applications</li>
                      <li>• Mobile compatibility</li>
                      <li>• Bulk processing tips</li>
                    </ul>
                  </CardContent>
                </Card>
              </div>
            </div>
          </div>
        </div>
      </main>

      <Footer />
    </div>
  );
}
