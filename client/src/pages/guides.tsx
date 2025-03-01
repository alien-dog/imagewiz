import { Header } from "@/components/layout/header";
import { Footer } from "@/components/layout/footer";
import { Helmet } from "react-helmet";
import { Card, CardContent } from "@/components/ui/card";
import { Book, Image, Layout, Users } from "lucide-react";

export default function Guides() {
  return (
    <div className="min-h-screen bg-background flex flex-col">
      <Helmet>
        <title>Guides & Tutorials | iMagenWiz</title>
        <meta 
          name="description" 
          content="Step-by-step guides and tutorials for using iMagenWiz's AI-powered image processing tools effectively." 
        />
      </Helmet>

      <Header />

      <main className="flex-grow pt-20 pb-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="max-w-3xl mx-auto">
            <h1 className="text-4xl font-bold mb-8">Guides & Tutorials</h1>
            
            <div className="prose prose-lg max-w-none">
              <p className="lead">
                Learn how to make the most of iMagenWiz with our comprehensive guides and tutorials. Whether you're a beginner or an experienced user, we have resources to help you achieve professional results.
              </p>

              <div className="grid gap-6 mt-8">
                <Card>
                  <CardContent className="p-6">
                    <div className="flex items-center gap-4 mb-4">
                      <div className="p-2 bg-primary/10 rounded-lg">
                        <Book className="h-6 w-6 text-primary" />
                      </div>
                      <h2 className="text-xl font-semibold">Beginner's Guide</h2>
                    </div>
                    <p className="mb-4">Essential tutorials for new users:</p>
                    <ul className="space-y-2">
                      <li>• Quick start guide</li>
                      <li>• Understanding the interface</li>
                      <li>• Basic image processing</li>
                      <li>• Managing your account</li>
                    </ul>
                  </CardContent>
                </Card>

                <Card>
                  <CardContent className="p-6">
                    <div className="flex items-center gap-4 mb-4">
                      <div className="p-2 bg-primary/10 rounded-lg">
                        <Image className="h-6 w-6 text-primary" />
                      </div>
                      <h2 className="text-xl font-semibold">Image Processing Techniques</h2>
                    </div>
                    <p className="mb-4">Advanced tutorials for better results:</p>
                    <ul className="space-y-2">
                      <li>• Perfect background removal</li>
                      <li>• Handling complex images</li>
                      <li>• Working with transparency</li>
                      <li>• Image quality optimization</li>
                    </ul>
                  </CardContent>
                </Card>

                <Card>
                  <CardContent className="p-6">
                    <div className="flex items-center gap-4 mb-4">
                      <div className="p-2 bg-primary/10 rounded-lg">
                        <Layout className="h-6 w-6 text-primary" />
                      </div>
                      <h2 className="text-xl font-semibold">Workflow Optimization</h2>
                    </div>
                    <p className="mb-4">Improve your productivity:</p>
                    <ul className="space-y-2">
                      <li>• Batch processing workflows</li>
                      <li>• Integration with other tools</li>
                      <li>• Time-saving techniques</li>
                      <li>• Automation possibilities</li>
                    </ul>
                  </CardContent>
                </Card>

                <Card>
                  <CardContent className="p-6">
                    <div className="flex items-center gap-4 mb-4">
                      <div className="p-2 bg-primary/10 rounded-lg">
                        <Users className="h-6 w-6 text-primary" />
                      </div>
                      <h2 className="text-xl font-semibold">Use Case Tutorials</h2>
                    </div>
                    <p className="mb-4">Industry-specific guides:</p>
                    <ul className="space-y-2">
                      <li>• E-commerce product photography</li>
                      <li>• Social media content creation</li>
                      <li>• Professional headshots</li>
                      <li>• Marketing materials</li>
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
