import { Link } from "react-router-dom";
import { Heart, Mail, Phone, MapPin } from "lucide-react";
import logo from "@/assets/logo.png";

const Footer = () => {
  return (
    <footer className="bg-slate-900 dark:bg-slate-950 text-white">
      <div className="container mx-auto px-4 py-16">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-12">
          {/* Brand */}
          <div className="space-y-4">
            <div className="flex items-center gap-3">
              <img src={logo} alt="TABEEBAK" className="h-10 w-10 object-contain rounded-full" />
              <span className="text-2xl font-bold">TABEEBAK</span>
            </div>
            <p className="text-white/70 text-sm leading-relaxed">
              Your trusted healthcare partner. Connect with top doctors and laboratories for quality medical care.
            </p>
            <div className="flex items-center gap-2 text-primary">
              <Heart className="h-4 w-4 animate-heartbeat" />
              <span className="text-sm font-medium">Caring for your health</span>
            </div>
          </div>

          {/* Quick Links */}
          <div>
            <h4 className="font-semibold mb-4 text-lg">Quick Links</h4>
            <ul className="space-y-3">
              {[
                { name: "Find Doctors", href: "/doctors" },
                { name: "Lab Services", href: "/lab-services" },
                { name: "Book Appointment", href: "/doctors" },
                { name: "About Us", href: "/about" },
              ].map((link) => (
                <li key={link.name}>
                  <Link
                    to={link.href}
                    className="text-white/70 hover:text-white transition-colors text-sm"
                  >
                    {link.name}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Services */}
          <div>
            <h4 className="font-semibold mb-4 text-lg">Services</h4>
            <ul className="space-y-3">
              {[
                "Online Consultation",
                "Lab Tests",
                "Health Checkups",
                "Medical Records",
              ].map((service) => (
                <li key={service}>
                  <span className="text-white/70 text-sm">{service}</span>
                </li>
              ))}
            </ul>
          </div>

          {/* Contact */}
          <div>
            <h4 className="font-semibold mb-4 text-lg">Contact Us</h4>
            <ul className="space-y-4">
              <li className="flex items-center gap-3 text-white/70 text-sm">
                <Phone className="h-4 w-4 text-primary" />
                +1 234 567 890
              </li>
              <li className="flex items-center gap-3 text-white/70 text-sm">
                <Mail className="h-4 w-4 text-primary" />
                support@tabeebak.com
              </li>
              <li className="flex items-start gap-3 text-white/70 text-sm">
                <MapPin className="h-4 w-4 text-primary mt-0.5" />
                123 Healthcare Street, Medical City
              </li>
            </ul>
          </div>
        </div>

        <div className="border-t border-white/10 mt-12 pt-8 text-center text-white/50 text-sm">
          <p>&copy; {new Date().getFullYear()} TABEEBAK. All rights reserved.</p>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
