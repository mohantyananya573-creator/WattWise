import React from 'react';
import { Link } from 'react-router-dom';
import {
  Zap,
  ArrowRight,
  Calculator,
  PieChart,
  Leaf,
  History,
  Lightbulb,
  Wallet,
  CheckCircle2,
  ShieldCheck,
  BarChart3,
  Sparkles,
} from 'lucide-react';
import { Navbar } from '../components/layout/Navbar';
import { Footer } from '../components/layout/Footer';
import { Button } from '../components/ui/Button';
import { Card } from '../components/ui/Card';

export const LandingPage: React.FC = () => {
  const scrollToFeatures = () => {
    document.getElementById('features')?.scrollIntoView({ behavior: 'smooth' });
  };

  const featureCards = [
    {
      icon: Calculator,
      title: 'Electricity Bill Prediction',
      description:
        'Model your household power draw with progressive slab tariffs and fixed charges to predict end-of-month electricity bills with high mathematical accuracy.',
    },
    {
      icon: PieChart,
      title: 'Appliance-wise Consumption',
      description:
        'Pinpoint which appliances drive your energy usage. Visual donut and bar charts uncover energy hogs like air conditioners and water heaters.',
    },
    {
      icon: Leaf,
      title: 'Carbon Footprint Tracking',
      description:
        'Quantify your electricity-associated greenhouse gas emissions (kg CO₂e) utilizing verified national grid emissions factors (such as CEA India and US EPA).',
    },
    {
      icon: History,
      title: 'Monthly Consumption History',
      description:
        'Save snapshots of your monthly usage, cost, and appliance states. Compare multi-month trends and evaluate seasonal consumption swings.',
    },
    {
      icon: Lightbulb,
      title: 'Smart Energy Recommendations',
      description:
        'Receive actionable, rule-based tips tailored to your specific appliances, complete with an interactive savings simulator to model usage cuts.',
    },
    {
      icon: Wallet,
      title: 'Electricity Budget Tracking',
      description:
        'Set monthly financial caps for power expenses. Real-time warning thresholds flag when projected consumption approaches or exceeds your target.',
    },
  ];

  const steps = [
    {
      number: '01',
      title: 'Add your household appliances',
      description:
        'Enter appliances, wattage, quantity, and daily operating hours, or pick from our library of calibrated presets.',
    },
    {
      number: '02',
      title: 'Calculate electricity consumption',
      description:
        'WattWise runs deterministic physics calculations across individual loads and applies progressive slab tariffs.',
    },
    {
      number: '03',
      title: 'Understand costs & environmental impact',
      description:
        'Review comprehensive analytics, emissions metrics, budget alerts, and verified rule-based reduction recommendations.',
    },
  ];

  return (
    <div className="min-h-screen flex flex-col bg-brand-bg text-brand-text">
      <Navbar />

      {/* Hero Section */}
      <section className="relative overflow-hidden pt-12 pb-20 lg:pt-20 lg:pb-28 border-b border-brand-border">
        {/* Subtle decorative background gradient */}
        <div className="absolute top-0 left-1/2 -translate-x-1/2 w-full max-w-7xl h-96 bg-radial from-brand-light/60 to-transparent pointer-events-none -z-10" />

        <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 text-center space-y-6">
          <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-brand-light text-brand-primary text-xs font-bold uppercase tracking-wider shadow-2xs">
            <Sparkles className="w-3.5 h-3.5" />
            <span>Smart Household Energy Management</span>
          </div>

          <h1 className="text-4xl sm:text-5xl lg:text-6xl font-extrabold text-brand-dark tracking-tight leading-[1.15]">
            Understand Your Energy.{' '}
            <span className="text-brand-primary block sm:inline">
              Control Your Consumption.
            </span>
          </h1>

          <p className="text-lg sm:text-xl text-brand-muted max-w-3xl mx-auto leading-relaxed">
            Track electricity usage, predict your bills, understand your carbon footprint and make smarter energy decisions with WattWise.
          </p>

          <div className="flex flex-col sm:flex-row items-center justify-center gap-4 pt-4">
            <Link to="/register">
              <Button size="lg" rightIcon={<ArrowRight className="w-5 h-5" />}>
                Get Started
              </Button>
            </Link>
            <Button
              variant="outline"
              size="lg"
              onClick={scrollToFeatures}
            >
              Explore Features
            </Button>
          </div>

          {/* Highlights checklist */}
          <div className="pt-8 flex flex-wrap items-center justify-center gap-6 text-xs font-semibold text-brand-muted">
            <div className="flex items-center gap-1.5">
              <CheckCircle2 className="w-4 h-4 text-brand-primary" />
              <span>Zero Hardware or Smart Meter Required</span>
            </div>
            <div className="flex items-center gap-1.5">
              <CheckCircle2 className="w-4 h-4 text-brand-primary" />
              <span>Progressive Slab Tariff Support</span>
            </div>
            <div className="flex items-center gap-1.5">
              <CheckCircle2 className="w-4 h-4 text-brand-primary" />
              <span>Verified Grid Emissions Factors</span>
            </div>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section id="features" className="py-20 bg-white border-b border-brand-border">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center max-w-3xl mx-auto mb-16 space-y-3">
            <h2 className="text-xs font-bold uppercase tracking-wider text-brand-primary">
              Comprehensive Capabilities
            </h2>
            <h3 className="text-3xl font-extrabold text-brand-dark tracking-tight">
              Everything You Need to Manage Household Power
            </h3>
            <p className="text-base text-brand-muted">
              Built for ordinary homes wanting transparent power bills, as well as energy enthusiasts tracking detailed environmental footprints.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {featureCards.map((feat, idx) => {
              const Icon = feat.icon;
              return (
                <Card key={idx} hoverEffect className="space-y-4">
                  <div className="w-12 h-12 rounded-2xl bg-brand-light text-brand-primary flex items-center justify-center shadow-2xs">
                    <Icon className="w-6 h-6" />
                  </div>
                  <h4 className="text-lg font-bold text-brand-dark">{feat.title}</h4>
                  <p className="text-sm text-brand-muted leading-relaxed">
                    {feat.description}
                  </p>
                </Card>
              );
            })}
          </div>
        </div>
      </section>

      {/* How It Works Section */}
      <section id="how-it-works" className="py-20 bg-brand-bg border-b border-brand-border">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center max-w-3xl mx-auto mb-16 space-y-3">
            <h2 className="text-xs font-bold uppercase tracking-wider text-brand-primary">
              Simple 3-Step Process
            </h2>
            <h3 className="text-3xl font-extrabold text-brand-dark tracking-tight">
              How WattWise Works
            </h3>
            <p className="text-base text-brand-muted">
              No proprietary sensors, no electrician visits. All analytics run directly on user-entered appliance configurations.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {steps.map((step, idx) => (
              <div
                key={idx}
                className="bg-white rounded-2xl border border-brand-border p-8 shadow-subtle relative overflow-hidden group hover:border-brand-primary/40 transition-colors"
              >
                <div className="text-5xl font-black text-brand-pale group-hover:text-brand-light transition-colors absolute top-4 right-4">
                  {step.number}
                </div>
                <div className="relative space-y-3">
                  <div className="w-10 h-10 rounded-xl bg-brand-primary text-white flex items-center justify-center font-bold text-sm shadow-sm">
                    {step.number}
                  </div>
                  <h4 className="text-lg font-bold text-brand-dark">{step.title}</h4>
                  <p className="text-sm text-brand-muted leading-relaxed">
                    {step.description}
                  </p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Why WattWise Section */}
      <section id="why-wattwise" className="py-20 bg-white border-b border-brand-border">
        <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="bg-brand-pale rounded-3xl border border-brand-border p-8 sm:p-12 space-y-6">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-white text-brand-primary text-xs font-bold border border-brand-border">
              <BarChart3 className="w-3.5 h-3.5" />
              <span>Actionable Energy Transparency</span>
            </div>

            <h3 className="text-2xl sm:text-3xl font-extrabold text-brand-dark tracking-tight">
              Why WattWise?
            </h3>

            <p className="text-base text-brand-text leading-relaxed">
              Most households only discover their electricity consumption when the paper or digital bill arrives at the end of the month. By then, it is too late to make adjustments.
            </p>
            <p className="text-base text-brand-muted leading-relaxed">
              Without appliance-level visibility, people often guess incorrectly about where power is being consumed — worrying about low-wattage items like phone chargers while leaving 1500W air conditioners or storage water heaters running unchecked.
            </p>
            <p className="text-base text-brand-muted leading-relaxed">
              WattWise demystifies household energy by providing deterministic usage math, progressive slab breakdowns, budget warnings, and verified grid emissions data. By understanding precisely when and where energy is consumed, households can prevent bill shock and reduce unnecessary environmental emissions.
            </p>

            <div className="pt-4">
              <Link to="/register">
                <Button rightIcon={<ArrowRight className="w-4 h-4" />}>
                  Start Managing Your Consumption
                </Button>
              </Link>
            </div>
          </div>
        </div>
      </section>

      <Footer />
    </div>
  );
};
