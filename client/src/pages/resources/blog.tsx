import { Header } from "@/components/layout/header";
import { Footer } from "@/components/layout/footer";
import { Helmet } from "react-helmet";
import { Card, CardContent } from "@/components/ui/card";
import { Link } from "wouter";
import { format } from "date-fns";

const blogPosts = [
  {
    title: "The Future of AI in Image Processing",
    excerpt: "Explore how artificial intelligence is revolutionizing image processing and what it means for designers and businesses.",
    date: new Date(2024, 2, 1),
    author: "Sarah Chen",
    category: "Technology",
    link: "/resources/blog/ai-future-image-processing"
  },
  {
    title: "5 Ways to Optimize Your E-commerce Product Images",
    excerpt: "Learn how proper image optimization can boost your online store's conversion rates and user experience.",
    date: new Date(2024, 1, 28),
    author: "Michael Roberts",
    category: "E-commerce",
    link: "#"
  },
  {
    title: "Sustainability in Digital Design",
    excerpt: "Discover how efficient image processing can contribute to environmental sustainability in digital design.",
    date: new Date(2024, 1, 25),
    author: "Emma Green",
    category: "Design",
    link: "#"
  },
  {
    title: "Image Processing Trends in 2024",
    excerpt: "Stay ahead of the curve with the latest trends and innovations in image processing and manipulation.",
    date: new Date(2024, 1, 20),
    author: "David Kim",
    category: "Industry Trends",
    link: "#"
  }
];

export default function Blog() {
  return (
    <div className="min-h-screen bg-background flex flex-col">
      <Helmet>
        <title>AI Image Processing Blog & Industry Insights | iMageWiz</title>
        <meta name="description" content="Stay updated with the latest trends in AI image processing, background removal techniques, and digital design. Expert insights and industry news from iMageWiz." />
        <meta name="keywords" content="AI image processing blog, background removal news, digital design trends, image editing insights, tech industry updates" />
      </Helmet>

      <Header />

      <main className="flex-grow pt-20 pb-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <h1 className="text-4xl font-bold mb-4">
              Blog & Industry Insights
            </h1>
            <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
              Stay updated with the latest trends, tips, and insights in AI-powered image processing.
            </p>
          </div>

          <div className="grid md:grid-cols-2 gap-8">
            {blogPosts.map((post, index) => (
              <Link key={index} href={post.link}>
                <a className="block">
                  <Card className="hover:shadow-lg transition-shadow">
                    <CardContent className="p-6">
                      <div className="flex items-center gap-2 text-sm text-muted-foreground mb-3">
                        <span>{format(post.date, 'MMM d, yyyy')}</span>
                        <span>•</span>
                        <span>{post.category}</span>
                      </div>
                      <h2 className="text-2xl font-semibold mb-3">{post.title}</h2>
                      <p className="text-muted-foreground mb-4">
                        {post.excerpt}
                      </p>
                      <div className="flex items-center gap-2 text-sm">
                        <span className="font-medium">By {post.author}</span>
                      </div>
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