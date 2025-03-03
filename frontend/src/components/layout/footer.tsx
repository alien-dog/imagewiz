import { Link } from "wouter";
import { Github, Twitter, Linkedin, Mail } from "lucide-react";

export function Footer() {
  return (
    <footer className="border-t bg-gray-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
          <div className="space-y-4">
            <h3 className="text-xl font-bold text-gray-900">iMagenWiz</h3>
            <p className="text-sm text-gray-600">
              Advanced AI-powered image processing for professionals and creators.
            </p>
            <div className="flex space-x-4">
              <a href="https://github.com" className="text-gray-600 hover:text-primary">
                <Github className="h-5 w-5" />
              </a>
              <a href="https://twitter.com" className="text-gray-600 hover:text-primary">
                <Twitter className="h-5 w-5" />
              </a>
              <a href="https://linkedin.com" className="text-gray-600 hover:text-primary">
                <Linkedin className="h-5 w-5" />
              </a>
              <a href="mailto:contact@imagenwiz.com" className="text-gray-600 hover:text-primary">
                <Mail className="h-5 w-5" />
              </a>
            </div>
          </div>

          <div>
            <h3 className="font-semibold mb-4">Product</h3>
            <ul className="space-y-2">
              <li>
                <button onClick={() => document.getElementById('features')?.scrollIntoView({ behavior: 'smooth' })} className="text-gray-600 hover:text-primary">
                  Features
                </button>
              </li>
              <li>
                <button onClick={() => document.getElementById('pricing')?.scrollIntoView({ behavior: 'smooth' })} className="text-gray-600 hover:text-primary">
                  Pricing
                </button>
              </li>
              <li>
                <Link href="/dashboard">
                  <a className="text-gray-600 hover:text-primary">Dashboard</a>
                </Link>
              </li>
            </ul>
          </div>

          <div>
            <h3 className="font-semibold mb-4">Resources</h3>
            <ul className="space-y-2">
              <li>
                <Link href="/resources/use-cases">
                  <a className="text-gray-600 hover:text-primary">Use Cases</a>
                </Link>
              </li>
              <li>
                <Link href="/resources/guides">
                  <a className="text-gray-600 hover:text-primary">Guides</a>
                </Link>
              </li>
              <li>
                <Link href="/resources/blog">
                  <a className="text-gray-600 hover:text-primary">Blog</a>
                </Link>
              </li>
            </ul>
          </div>

          <div>
            <h3 className="font-semibold mb-4">Legal</h3>
            <ul className="space-y-2">
              <li>
                <Link href="/privacy">
                  <a className="text-gray-600 hover:text-primary">Privacy Policy</a>
                </Link>
              </li>
              <li>
                <Link href="/terms">
                  <a className="text-gray-600 hover:text-primary">Terms of Service</a>
                </Link>
              </li>
              <li>
                <Link href="/gdpr">
                  <a className="text-gray-600 hover:text-primary">GDPR</a>
                </Link>
              </li>
            </ul>
          </div>
        </div>

        <div className="mt-12 pt-8 border-t border-gray-200">
          <p className="text-center text-gray-600 text-sm">
            © {new Date().getFullYear()} iMagenWiz. All rights reserved.
          </p>
        </div>
      </div>
    </footer>
  );
}