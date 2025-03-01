import { Header } from "@/components/layout/header";
import { Footer } from "@/components/layout/footer";
import { Helmet } from "react-helmet";
import { Card, CardContent } from "@/components/ui/card";
import { FileText } from "lucide-react";

export default function ApiIntegrationGuide() {
  return (
    <div className="min-h-screen bg-background flex flex-col">
      <Helmet>
        <title>API Integration Guide | iMageWiz Developer Documentation</title>
        <meta 
          name="description" 
          content="Complete guide for integrating iMageWiz's background removal API into your applications. Learn about authentication, endpoints, and best practices." 
        />
        <meta 
          name="keywords" 
          content="API integration, background removal API, image processing API, developer documentation, REST API" 
        />
      </Helmet>

      <Header />

      <main className="flex-grow pt-20 pb-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="max-w-3xl mx-auto">
            <div className="flex items-center gap-4 mb-8">
              <div className="p-3 bg-primary/10 rounded-lg text-primary">
                <FileText className="h-6 w-6" />
              </div>
              <h1 className="text-4xl font-bold">API Integration Guide</h1>
            </div>

            <div className="prose prose-lg max-w-none">
              <p className="lead">
                Integrate iMageWiz's powerful background removal capabilities into your applications with our REST API. This guide covers everything you need to get started.
              </p>

              <h2>Getting Started</h2>
              <h3>Authentication</h3>
              <p>
                To use the API, you'll need:
              </p>
              <ul>
                <li>An API key from your dashboard</li>
                <li>Basic understanding of REST APIs</li>
                <li>Ability to make HTTP requests</li>
                <li>Knowledge of handling image data</li>
              </ul>

              <h2>API Endpoints</h2>
              <div className="bg-primary/5 p-6 rounded-lg my-8">
                <h3>Core Endpoints:</h3>
                <ul>
                  <li><code>POST /api/v1/remove-background</code> - Remove background from image</li>
                  <li><code>GET /api/v1/status/{'{job_id}'}</code> - Check processing status</li>
                  <li><code>GET /api/v1/credits</code> - Check remaining credits</li>
                  <li><code>GET /api/v1/history</code> - Get processing history</li>
                </ul>
              </div>

              <h2>Request Format</h2>
              <h3>Image Upload</h3>
              <ul>
                <li>Supported formats: JPG, PNG</li>
                <li>Maximum file size: 20MB</li>
                <li>Minimum dimensions: 100x100px</li>
                <li>Maximum dimensions: 5000x5000px</li>
              </ul>

              <h2>Response Handling</h2>
              <p>
                Our API returns:
              </p>
              <ul>
                <li>PNG with transparency</li>
                <li>Processing metadata</li>
                <li>Error information if applicable</li>
                <li>Credit usage details</li>
              </ul>

              <h2>Code Examples</h2>
              <h3>cURL</h3>
              <pre><code>{`curl -X POST \\
  https://api.imagewiz.com/v1/remove-background \\
  -H "Authorization: Bearer YOUR_API_KEY" \\
  -F "image=@image.jpg"`}</code></pre>

              <h3>Python</h3>
              <pre><code>{`import requests

response = requests.post(
    'https://api.imagewiz.com/v1/remove-background',
    headers={'Authorization': 'Bearer YOUR_API_KEY'},
    files={'image': open('image.jpg', 'rb')}
)

if response.status_code == 200:
    with open('result.png', 'wb') as f:
        f.write(response.content)`}</code></pre>

              <h2>Error Handling</h2>
              <ul>
                <li>Rate limiting considerations</li>
                <li>Common error codes and meanings</li>
                <li>Retry strategies</li>
                <li>Timeout handling</li>
              </ul>

              <h2>Best Practices</h2>
              <ul>
                <li>Implement proper error handling</li>
                <li>Cache results when possible</li>
                <li>Monitor credit usage</li>
                <li>Use webhook notifications for large jobs</li>
              </ul>

              <h2>Rate Limits</h2>
              <ul>
                <li>100 requests per minute on standard plan</li>
                <li>Batch processing available for enterprise</li>
                <li>Concurrent request limits</li>
                <li>Fair usage policies</li>
              </ul>

              <h2>Support</h2>
              <p>
                Need help with integration? Contact our developer support:
              </p>
              <ul>
                <li>Developer Discord community</li>
                <li>API status dashboard</li>
                <li>Technical documentation</li>
                <li>Email support</li>
              </ul>
            </div>
          </div>
        </div>
      </main>

      <Footer />
    </div>
  );
}
