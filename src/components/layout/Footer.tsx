import React from 'react';
import { Zap, Heart, Shield, Mail, FileText } from 'lucide-react';
import { Link } from 'react-router-dom';

export const Footer: React.FC = () => {
  return (
    <footer className="bg-white border-t border-brand-border text-sm text-brand-muted">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12 lg:py-16">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8 mb-12">
          {/* Brand Info */}
          <div className="md:col-span-1 space-y-3">
            <div className="flex items-center gap-2">
              <div className="w-8 h-8 rounded-lg bg-brand-primary flex items-center justify-center text-white">
                <Zap className="w-4 h-4 fill-white" />
              </div>
              <span className="text-lg font-bold text-brand-dark">Watt<span className="text-brand-primary">Wise</span></span>
            </div>
            <p className="text-xs leading-relaxed text-brand-muted">
              Smart Electricity Consumption & Carbon Footprint Management System. Empowering households to measure, predict, and reduce energy consumption.
            </p>
          </div>

          {/* Quick Links */}
          <div>
            <h4 className="text-xs font-bold uppercase tracking-wider text-brand-dark mb-3">Navigation</h4>
            <ul className="space-y-2 text-xs">
              <li><Link to="/" className="hover:text-brand-primary transition-colors">Home</Link></li>
              <li><a href="#features" className="hover:text-brand-primary transition-colors">Features</a></li>
              <li><a href="#how-it-works" className="hover:text-brand-primary transition-colors">How It Works</a></li>
              <li><Link to="/login" className="hover:text-brand-primary transition-colors">Sign In</Link></li>
              <li><Link to="/register" className="hover:text-brand-primary transition-colors">Create Account</Link></li>
            </ul>
          </div>

          {/* Features */}
          <div>
            <h4 className="text-xs font-bold uppercase tracking-wider text-brand-dark mb-3">Core Modules</h4>
            <ul className="space-y-2 text-xs">
              <li><span className="hover:text-brand-primary transition-colors">Appliance Management</span></li>
              <li><span className="hover:text-brand-primary transition-colors">Progressive Slab Bill Predictor</span></li>
              <li><span className="hover:text-brand-primary transition-colors">Grid Carbon Footprint</span></li>
              <li><span className="hover:text-brand-primary transition-colors">Monthly History & Comparisons</span></li>
              <li><span className="hover:text-brand-primary transition-colors">Energy Saving Recommendations</span></li>
            </ul>
          </div>

          {/* Legal & Standards */}
          <div>
            <h4 className="text-xs font-bold uppercase tracking-wider text-brand-dark mb-3">Information & Legal</h4>
            <ul className="space-y-2 text-xs">
              <li className="flex items-center gap-1.5">
                <Shield className="w-3.5 h-3.5 text-brand-primary" />
                <span>Cloud Firestore Protected</span>
              </li>
              <li className="flex items-center gap-1.5">
                <FileText className="w-3.5 h-3.5 text-brand-primary" />
                <span>Privacy Policy & Terms</span>
              </li>
              <li className="flex items-center gap-1.5">
                <Mail className="w-3.5 h-3.5 text-brand-primary" />
                <span>support@wattwise.org</span>
              </li>
            </ul>
            <div className="mt-4 p-2.5 bg-brand-pale rounded-xl border border-brand-border text-[11px] text-brand-muted">
              Built with React, Vite, TypeScript & Google Firebase.
            </div>
          </div>
        </div>

        {/* Disclaimer */}
        <div className="pt-8 border-t border-brand-border text-xs text-brand-muted/80 text-center space-y-2">
          <p>
            Disclaimer: WattWise provides estimates based on user-entered appliance specifications and configured tariffs. It is an educational and analytical tool, not an official utility bill.
          </p>
          <p className="flex items-center justify-center gap-1 text-[11px]">
            © {new Date().getFullYear()} WattWise System. Dedicated to household energy conservation.
          </p>
        </div>
      </div>
    </footer>
  );
};
