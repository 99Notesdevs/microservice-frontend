import React from 'react';
import { Link } from 'react-router-dom';
import { 
  BookOpen, 
  Trophy, 
  Users, 
  Clock, 
  Star, 
  ArrowRight 
} from 'lucide-react';
import { Button } from '../components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '../components/ui/card';

interface Feature {
  icon: React.ElementType;
  title: string;
  description: string;
}

interface PricingBundle {
  title: string;
  price: string;
  features: string[];
  cta: string;
}

const features: Feature[] = [
  {
    icon: BookOpen,
    title: 'Comprehensive Study Materials',
    description: 'Access our curated collection of study materials covering all major topics and subjects.',
  },
  {
    icon: Trophy,
    title: 'Practice Tests',
    description: 'Take unlimited practice tests to track your progress and identify areas for improvement.',
  },
  {
    icon: Users,
    title: 'Community Support',
    description: 'Join our active community of learners and get support from experienced educators.',
  },
  {
    icon: Clock,
    title: '24/7 Access',
    description: 'Study anytime, anywhere with our mobile-responsive platform.',
  },
];

const pricingBundles: PricingBundle[] = [
  {
    title: "Basic Plan",
    price: "$29/month",
    features: [
      "Access to core study materials",
      "Limited practice tests",
      "Basic analytics",
      "Email support",
    ],
    cta: "/signup",
  },
  {
    title: "Premium Plan",
    price: "$49/month",
    features: [
      "Full access to all materials",
      "Unlimited practice tests",
      "Advanced analytics",
      "Priority support",
      "Custom test creation",
    ],
    cta: "/premium",
  },
];

const About: React.FC = () => {
  return (
    <main className="min-h-screen bg-background">
      {/* Hero Section */}
      <section className="relative py-20">
        <div className="absolute inset-0 bg-gradient-to-r from-primary/10 to-secondary/10" />
        <div className="relative container mx-auto px-4">
          <div className="max-w-4xl mx-auto text-center">
            <h1 className="text-4xl md:text-6xl font-bold mb-6 text-foreground">
              Your Path to Success Starts Here
            </h1>
            <p className="text-lg md:text-xl text-muted-foreground mb-8">
              Join thousands of students who have achieved their academic goals with our comprehensive study platform.
            </p>
            <Button size="lg" className="bg-primary hover:bg-primary/90 text-white px-8">
              Get Started
            </Button>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="py-20">
        <div className="container mx-auto px-4">
          <h2 className="text-3xl font-bold text-center mb-12">Why Choose Us</h2>
          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-8">
            {features.map((feature, index) => (
              <div key={index} className="text-center p-6">
                <div className="w-16 h-16 mx-auto rounded-full bg-primary/10 flex items-center justify-center mb-4">
                  <feature.icon className="w-8 h-8 text-primary" />
                </div>
                <h3 className="text-xl font-semibold mb-2">{feature.title}</h3>
                <p className="text-muted-foreground">{feature.description}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Pricing Section */}
      <section className="py-20 bg-muted/50">
        <div className="container mx-auto px-4">
          <h2 className="text-3xl font-bold text-center mb-12">Our Plans</h2>
          <div className="grid md:grid-cols-2 gap-8">
            {pricingBundles.map((bundle, index) => (
              <Card key={index} className="p-6">
                <CardHeader className="text-center">
                  <CardTitle>{bundle.title}</CardTitle>
                  <div className="text-4xl font-bold text-primary mb-2">{bundle.price}</div>
                </CardHeader>
                <CardContent>
                  <ul className="space-y-3">
                    {bundle.features.map((feature, i) => (
                      <li key={i} className="flex items-center">
                        <Star className="w-4 h-4 text-yellow-500 mr-2" />
                        {feature}
                      </li>
                    ))}
                  </ul>
                  <Button className="w-full mt-6">
                    <Link to={bundle.cta}>
                      Get Started
                      <ArrowRight className="ml-2 w-4 h-4" />
                    </Link>
                  </Button>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* Call to Action */}
      <section className="py-20">
        <div className="container mx-auto px-4">
          <div className="bg-primary/10 rounded-lg p-8 text-center">
            <h3 className="text-2xl font-bold mb-4">Ready to Start Your Journey?</h3>
            <p className="text-muted-foreground mb-6">
              Join our community of successful students today!
            </p>
            <Button size="lg" className="bg-primary hover:bg-primary/90 text-white">
              Start Learning Now
            </Button>
          </div>
        </div>
      </section>
    </main>
  );
};

export default About;