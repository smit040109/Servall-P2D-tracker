import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle, CardFooter } from "@/components/ui/card";
import { Check, Star, Gem, Leaf, Building } from "lucide-react";
import Link from "next/link";
import Logo from "@/components/logo";

const plans = [
  {
    name: "Starter",
    price: "₹0",
    period: "Free",
    description: "For new businesses dipping their toes into the digital world.",
    features: [
      "QR Tracking",
      "Basic Leads",
      "Single Branch",
    ],
    icon: Leaf,
    buttonVariant: "secondary" as const,
  },
  {
    name: "Growth",
    price: "₹2,999",
    period: "/ month",
    description: "For growing businesses ready to optimize their marketing spend.",
    features: [
      "ROI Tracking",
      "Customer Timeline",
      "Lead Scoring",
      "Up to 5 Branches",
    ],
    icon: Star,
    buttonVariant: "default" as const,
    popular: true,
  },
  {
    name: "Pro",
    price: "₹6,999",
    period: "/ month",
    description: "For established businesses aiming for automation and scale.",
    features: [
      "Multi-branch Support",
      "Staff Performance Tracking",
      "WhatsApp Automation",
      "Advanced Analytics",
    ],
    icon: Gem,
    buttonVariant: "secondary" as const,
  },
];

export default function PricingPage() {
  return (
    <div className="flex min-h-screen w-full flex-col items-center bg-gray-50 dark:bg-gray-900">
        <header className="flex items-center justify-between p-8 w-full max-w-7xl">
            <Logo />
            <Button asChild variant="ghost">
                <Link href="/login">Login</Link>
            </Button>
        </header>
      <main className="flex-1 flex flex-col items-center justify-center p-4 sm:p-8">
        <div className="w-full max-w-5xl text-center">
          <h1 className="text-4xl sm:text-5xl font-bold font-headline">Find the perfect plan</h1>
          <p className="mt-4 text-lg text-muted-foreground">
            Start for free, then upgrade as you grow. All plans are flexible to meet your needs.
          </p>
        </div>

        <div className="mt-12 grid grid-cols-1 gap-8 md:grid-cols-3 w-full max-w-5xl">
          {plans.map((plan) => (
            <Card key={plan.name} className={`flex flex-col ${plan.popular ? 'border-primary shadow-2xl' : ''}`}>
              <CardHeader className="items-center text-center">
                <div className={`p-3 rounded-full bg-primary/10 mb-4 text-primary`}>
                    <plan.icon className="h-8 w-8" />
                </div>
                <CardTitle className="text-3xl">{plan.name}</CardTitle>
                <CardDescription>
                    <span className="text-4xl font-bold">{plan.price}</span>
                    <span className="text-muted-foreground">{plan.period}</span>
                </CardDescription>
                <p className="text-sm pt-2 text-muted-foreground">{plan.description}</p>
              </CardHeader>
              <CardContent className="flex-1">
                <ul className="space-y-4">
                  {plan.features.map((feature) => (
                    <li key={feature} className="flex items-center gap-3">
                      <Check className="h-5 w-5 text-green-500" />
                      <span>{feature}</span>
                    </li>
                  ))}
                </ul>
              </CardContent>
              <CardFooter>
                <Button className="w-full" variant={plan.buttonVariant}>
                  Get Started with {plan.name}
                </Button>
              </CardFooter>
            </Card>
          ))}
        </div>
      </main>
      <footer className="p-8 text-center text-sm text-muted-foreground">
        © {new Date().getFullYear()} Servall P2D. All rights reserved.
      </footer>
    </div>
  );
}
