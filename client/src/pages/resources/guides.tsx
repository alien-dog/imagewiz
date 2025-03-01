import { Header } from "@/components/layout/header";
import { Footer } from "@/components/layout/footer";
import { Helmet } from "react-helmet";
import { Card, CardContent } from "@/components/ui/card";
import { Link } from "wouter";
import { 
  VideoIcon,
  Lightbulb,
  GraduationCap,
  FileText
} from "lucide-react";

const guides = [
  {
    icon: <VideoIcon className="h-6 w-6" />,
    title: "Getting Started",
    description: "Learn the basics of using iMageWiz for background removal. Perfect for beginners looking to enhance their images.",
    readTime: "5 min read",
    link: "/resources/guides/getting-started"
  },
  {
    icon: <Lightbulb className="h-6 w-6" />,
    title: "Advanced Techniques",
    description: "Master advanced features and get professional-quality results with our expert tips and tricks.",
    readTime: "10 min read",
    link: "#"
  },
  {
    icon: <GraduationCap className="h-6 w-6" />,
    title: "Best Practices",
    description: "Learn industry best practices for image processing and optimization to achieve the best results.",
    readTime: "8 min read",
    link: "#"
  },
  {
    icon: <FileText className="h-6 w-6" />,
    title: "API Integration",
    description: "Technical guide for developers on integrating iMageWiz's powerful API into their applications.",
    readTime: "15 min read",
    link: "#"
  }
];

export default function Guides() {
  return (
    <div className="min-h-screen bg-background flex flex-col">
      <Helmet>
        <title>AI Background Removal Guides & Tutorials | iMageWiz</title>
        <meta name="description" content="Learn how to remove image backgrounds like a pro with our comprehensive guides and tutorials. From basic techniques to advanced tips, master image editing with iMageWiz." />
        <meta name="keywords" content="background removal tutorial, image editing guide, AI image processing, professional photo editing, image manipulation guides" />
      </Helmet>

      <Header />

      <main className="flex-grow pt-20 pb-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <h1 className="text-4xl font-bold mb-4">
              Guides & Tutorials
            </h1>
            <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
              Master the art of background removal with our comprehensive guides and step-by-step tutorials.
            </p>
          </div>

          <div className="grid md:grid-cols-2 gap-8">
            {guides.map((guide, index) => (
              <Link key={index} href={guide.link}>
                <a className="block">
                  <Card className="hover:shadow-lg transition-shadow">
                    <CardContent className="p-6">
                      <div className="flex items-center gap-4 mb-4">
                        <div className="p-3 bg-primary/10 rounded-lg text-primary">
                          {guide.icon}
                        </div>
                        <div>
                          <h2 className="text-2xl font-semibold">{guide.title}</h2>
                          <p className="text-sm text-muted-foreground">{guide.readTime}</p>
                        </div>
                      </div>
                      <p className="text-muted-foreground">
                        {guide.description}
                      </p>
                    </CardContent>
                  </Card>
                </a>
              </Link>
            ))}
          </div>
        </div>
      </main>

      <Footer />
    </div>
  );
}