import { Header } from "@/components/layout/header";
import { Footer } from "@/components/layout/footer";
import { Helmet } from "react-helmet";

export default function GDPRPolicy() {
  return (
    <div className="min-h-screen bg-background flex flex-col">
      <Helmet>
        <title>GDPR Compliance | iMagenWiz</title>
        <meta 
          name="description" 
          content="GDPR Compliance information for iMagenWiz - Learn about your data protection rights." 
        />
      </Helmet>

      <Header />

      <main className="flex-grow pt-20 pb-16">
        <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8">
          <h1 className="text-4xl font-bold mb-8">GDPR Compliance</h1>
          
          <div className="prose prose-lg">
            <p className="lead">
              iMagenWiz is committed to protecting your personal data in accordance with the 
              General Data Protection Regulation (GDPR).
            </p>

            <h2>Your GDPR Rights</h2>
            <p>
              Under GDPR, you have the following rights:
            </p>
            <ul>
              <li>Right to access your personal data</li>
              <li>Right to rectification of inaccurate data</li>
              <li>Right to erasure ("right to be forgotten")</li>
              <li>Right to restrict processing</li>
              <li>Right to data portability</li>
              <li>Right to object to processing</li>
              <li>Rights related to automated decision making</li>
            </ul>

            <h2>Data Processing Basis</h2>
            <p>
              We process your data based on:
            </p>
            <ul>
              <li>Your consent</li>
              <li>Contract fulfillment</li>
              <li>Legal obligations</li>
              <li>Legitimate interests</li>
            </ul>

            <h2>Data Protection Measures</h2>
            <p>
              We implement appropriate technical and organizational measures to ensure 
              data security, including:
            </p>
            <ul>
              <li>Encryption of personal data</li>
              <li>Regular security assessments</li>
              <li>Staff training on data protection</li>
              <li>Access controls and authentication</li>
            </ul>

            <h2>International Data Transfers</h2>
            <p>
              When we transfer data outside the EEA, we ensure appropriate safeguards 
              are in place through:
            </p>
            <ul>
              <li>Standard contractual clauses</li>
              <li>Adequacy decisions</li>
              <li>Binding corporate rules</li>
            </ul>

            <h2>Data Protection Officer</h2>
            <p>
              For GDPR-related inquiries, contact our Data Protection Officer at{' '}
              <a href="mailto:dpo@imagenwiz.com">dpo@imagenwiz.com</a>
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
