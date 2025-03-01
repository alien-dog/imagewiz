import { Header } from "@/components/layout/header";
import { Footer } from "@/components/layout/footer";
import { Helmet } from "react-helmet";

export default function PrivacyPolicy() {
  return (
    <div className="min-h-screen bg-background flex flex-col">
      <Helmet>
        <title>Privacy Policy | iMagenWiz</title>
        <meta 
          name="description" 
          content="Privacy Policy for iMagenWiz - Learn how we protect and handle your data." 
        />
      </Helmet>

      <Header />

      <main className="flex-grow pt-20 pb-16">
        <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8">
          <h1 className="text-4xl font-bold mb-8">Privacy Policy</h1>
          
          <div className="prose prose-lg">
            <p className="lead">
              At iMagenWiz, we take your privacy seriously. This Privacy Policy explains how we collect, 
              use, and protect your personal information.
            </p>

            <h2>Information We Collect</h2>
            <p>
              We collect information that you provide directly to us, including:
            </p>
            <ul>
              <li>Account information (name, email, password)</li>
              <li>Payment information</li>
              <li>Images you upload for processing</li>
              <li>Usage data and preferences</li>
            </ul>

            <h2>How We Use Your Information</h2>
            <p>
              We use the collected information to:
            </p>
            <ul>
              <li>Provide and improve our services</li>
              <li>Process your payments</li>
              <li>Send you important updates</li>
              <li>Customize your experience</li>
              <li>Analyze and improve our service</li>
            </ul>

            <h2>Data Security</h2>
            <p>
              We implement appropriate security measures to protect your personal information 
              against unauthorized access, alteration, or destruction.
            </p>

            <h2>Your Rights</h2>
            <p>
              You have the right to:
            </p>
            <ul>
              <li>Access your personal data</li>
              <li>Correct inaccurate data</li>
              <li>Request deletion of your data</li>
              <li>Object to data processing</li>
              <li>Data portability</li>
            </ul>

            <h2>Contact Us</h2>
            <p>
              If you have any questions about this Privacy Policy, please contact us at{' '}
              <a href="mailto:privacy@imagenwiz.com">privacy@imagenwiz.com</a>
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
