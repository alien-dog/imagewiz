import { Header } from "@/components/layout/header";
import { Footer } from "@/components/layout/footer";
import { Helmet } from "react-helmet";

export default function TermsOfService() {
  return (
    <div className="min-h-screen bg-background flex flex-col">
      <Helmet>
        <title>Terms of Service | iMagenWiz</title>
        <meta 
          name="description" 
          content="Terms of Service for iMagenWiz - Understanding our service agreement." 
        />
      </Helmet>

      <Header />

      <main className="flex-grow pt-20 pb-16">
        <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8">
          <h1 className="text-4xl font-bold mb-8">Terms of Service</h1>
          
          <div className="prose prose-lg">
            <p className="lead">
              Welcome to iMagenWiz. By using our service, you agree to these terms.
            </p>

            <h2>1. Acceptance of Terms</h2>
            <p>
              By accessing or using iMagenWiz, you agree to be bound by these Terms of Service 
              and all applicable laws and regulations.
            </p>

            <h2>2. Service Description</h2>
            <p>
              iMagenWiz provides AI-powered image background removal and editing services. 
              We reserve the right to modify or discontinue the service at any time.
            </p>

            <h2>3. User Accounts</h2>
            <p>
              You are responsible for:
            </p>
            <ul>
              <li>Maintaining account security</li>
              <li>All activities under your account</li>
              <li>Providing accurate information</li>
            </ul>

            <h2>4. Intellectual Property</h2>
            <p>
              You retain rights to your uploaded content. You grant us license to process 
              and store your images to provide our service.
            </p>

            <h2>5. Usage Guidelines</h2>
            <p>
              You agree not to:
            </p>
            <ul>
              <li>Violate any laws or regulations</li>
              <li>Infringe on others' intellectual property</li>
              <li>Upload harmful content or malware</li>
              <li>Attempt to breach our security</li>
            </ul>

            <h2>6. Payments and Refunds</h2>
            <p>
              All payments are processed securely. Refunds are handled according to our 
              refund policy, available upon request.
            </p>

            <h2>Contact</h2>
            <p>
              For questions about these terms, please contact{' '}
              <a href="mailto:legal@imagenwiz.com">legal@imagenwiz.com</a>
            </p>

            <p className="text-sm text-gray-500 mt-8">
              Last updated: March 1, 2025
            </p>
          </div>
        </div>
      </main>

      <Footer />
    </div>
  );
}
