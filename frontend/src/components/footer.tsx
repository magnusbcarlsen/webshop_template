import React from "react";
import {
  Mail,
  Phone,
  MapPin,
  Instagram,
  Facebook,
  Twitter,
  Linkedin,
} from "lucide-react";

export default function ModernFooter() {
  return (
    <footer className=" bg-white border-t border-gray-100">
      <div className="max-w-7xl mx-auto px-6 py-16">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-12 lg:gap-16">
          {/* Brand Section */}
          <div className="space-y-6">
            <div>
              <h3 className="text-2xl font-bold text-gray-900 mb-2">
                Dina Bergstrøm
              </h3>
              <p className="text-lg text-gray-600">Bergstrøm Art</p>
            </div>
            <p className="text-gray-600 leading-relaxed max-w-sm">
              Creating unique art pieces that inspire and transform spaces.
              Discover the beauty of contemporary artistic expression.
            </p>
          </div>

          {/* Contact Information */}
          <div className="space-y-6">
            <h4 className="text-lg font-semibold text-gray-900 mb-4">
              Contact
            </h4>
            <div className="space-y-4">
              <div className="flex items-center space-x-3 text-gray-600">
                <Mail className="w-5 h-5 text-gray-400" />
                <a
                  href="mailto:db@styleunlimited.dk"
                  className="hover:text-gray-900 transition-colors"
                >
                  db@styleunlimited.dk
                </a>
              </div>
              <div className="flex items-center space-x-3 text-gray-600">
                <Phone className="w-5 h-5 text-gray-400" />
                <a
                  href="tel:12345678"
                  className="hover:text-gray-900 transition-colors"
                >
                  12 34 56 78
                </a>
              </div>
              <div className="flex items-start space-x-3 text-gray-600">
                <MapPin className="w-5 h-5 text-gray-400 mt-0.5" />
                <span>Colbjørnsensgade 3</span>
              </div>
            </div>
          </div>

          {/* Social Media & Links */}
          <div className="space-y-6">
            <h4 className="text-lg font-semibold text-gray-900 mb-4">
              Connect
            </h4>

            {/* Social Media Icons */}
            <div className="flex space-x-4">
              <a
                href="#"
                className="w-10 h-10 bg-gray-100 rounded-full flex items-center justify-center hover:bg-gray-200 transition-colors group"
                aria-label="Instagram"
              >
                <Instagram className="w-5 h-5 text-gray-600 group-hover:text-gray-900" />
              </a>
              <a
                href="#"
                className="w-10 h-10 bg-gray-100 rounded-full flex items-center justify-center hover:bg-gray-200 transition-colors group"
                aria-label="Facebook"
              >
                <Facebook className="w-5 h-5 text-gray-600 group-hover:text-gray-900" />
              </a>
              <a
                href="#"
                className="w-10 h-10 bg-gray-100 rounded-full flex items-center justify-center hover:bg-gray-200 transition-colors group"
                aria-label="Twitter"
              >
                <Twitter className="w-5 h-5 text-gray-600 group-hover:text-gray-900" />
              </a>
              <a
                href="#"
                className="w-10 h-10 bg-gray-100 rounded-full flex items-center justify-center hover:bg-gray-200 transition-colors group"
                aria-label="LinkedIn"
              >
                <Linkedin className="w-5 h-5 text-gray-600 group-hover:text-gray-900" />
              </a>
            </div>

            {/* Quick Links */}
            <div className="space-y-3">
              <a
                href="/about"
                className="block text-gray-600 hover:text-gray-900 transition-colors"
              >
                About
              </a>
              <a
                href="/gallery"
                className="block text-gray-600 hover:text-gray-900 transition-colors"
              >
                Gallery
              </a>
              <a
                href="/contact"
                className="block text-gray-600 hover:text-gray-900 transition-colors"
              >
                Contact
              </a>
              <a
                href="/privacy"
                className="block text-gray-600 hover:text-gray-900 transition-colors"
              >
                Privacy Policy
              </a>
            </div>
          </div>
        </div>

        {/* Bottom Section */}
        <div className="border-t border-gray-100 mt-12 pt-8">
          <div className="flex flex-col md:flex-row justify-between items-center space-y-4 md:space-y-0">
            <p className="text-gray-500 text-sm">
              © 2024 Bergstrøm Art. All rights reserved.
            </p>
            <div className="flex space-x-6 text-sm">
              <a
                href="/terms"
                className="text-gray-500 hover:text-gray-700 transition-colors"
              >
                Terms of Service
              </a>
              <a
                href="/privacy"
                className="text-gray-500 hover:text-gray-700 transition-colors"
              >
                Privacy Policy
              </a>
            </div>
          </div>
        </div>
      </div>
    </footer>
  );
}
