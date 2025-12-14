import Image from "next/image";
import Link from "next/link";
import { Navbar } from "@/components/layout/navbar";
import { Heart, Users, BookOpen, Shield } from "lucide-react";

export default function HomePage() {
  return (
    <div className="min-h-screen bg-background">
      <Navbar user={null} />

      {/* Hero Section */}
      <section className="relative py-20 px-4 sm:px-6 lg:px-8">
        <div className="max-w-4xl mx-auto text-center">
          <div className="mb-8 flex justify-center">
            <Image
              src="/Journey-Home_White_Simple.png"
              alt="Journey Home"
              width={120}
              height={120}
              className="rounded-2xl shadow-lg"
            />
          </div>
          <h1 className="text-4xl sm:text-5xl lg:text-6xl font-bold text-foreground mb-6">
            Journey Home
          </h1>
          <p className="text-xl sm:text-2xl text-muted-foreground mb-4">
            Creating healing spaces that form us into a community on the Way.
          </p>
          <p className="text-lg text-muted-foreground mb-10 max-w-2xl mx-auto">
            Ultimately, the journey is back to our hearts. And it is then that we can
            live lives that create a society where everyone has a home.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link
              href="/login"
              className="px-8 py-4 bg-primary text-primary-foreground rounded-lg font-semibold text-lg hover:bg-primary/90 transition-colors shadow-md"
            >
              Sign In
            </Link>
          </div>
          <p className="mt-6 text-sm text-muted-foreground">
            Journey Home is an invite-only community. Contact an administrator for access.
          </p>
        </div>
      </section>

      {/* Features Section */}
      <section className="py-20 px-4 sm:px-6 lg:px-8 bg-muted/30">
        <div className="max-w-6xl mx-auto">
          <h2 className="text-3xl font-bold text-center text-foreground mb-4">
            A Space for Transformation
          </h2>
          <p className="text-center text-muted-foreground mb-16 max-w-2xl mx-auto">
            Guiding pilgrims to journey home since 2011
          </p>

          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-8">
            <FeatureCard
              icon={<Users className="w-8 h-8" />}
              title="Cohort Community"
              description="Connect with fellow pilgrims in your cohort. Share your journey together."
            />
            <FeatureCard
              icon={<Heart className="w-8 h-8" />}
              title="Prayer & Encouragement"
              description="Share prayers and words of encouragement within your community."
            />
            <FeatureCard
              icon={<BookOpen className="w-8 h-8" />}
              title="Personal Journal"
              description="Reflect on your journey with guided prompts and personal journaling."
            />
            <FeatureCard
              icon={<Shield className="w-8 h-8" />}
              title="Guided Learning"
              description="Receive resources, prompts, and guidance from your moderators."
            />
          </div>
        </div>
      </section>

      {/* Quote Section */}
      <section className="py-20 px-4 sm:px-6 lg:px-8">
        <div className="max-w-3xl mx-auto text-center">
          <blockquote className="text-2xl sm:text-3xl font-light text-foreground italic mb-6">
            &ldquo;The healing of society comes through our individual and collective
            healing as we confront the conflict and wounds within ourselves.&rdquo;
          </blockquote>
          <p className="text-muted-foreground">— Journey Home</p>
        </div>
      </section>

      {/* Footer */}
      <footer className="py-12 px-4 sm:px-6 lg:px-8 border-t border-border">
        <div className="max-w-6xl mx-auto flex flex-col sm:flex-row justify-between items-center gap-4">
          <div className="flex items-center gap-3">
            <Image
              src="/Journey-Home_White_Simple.png"
              alt="Journey Home"
              width={32}
              height={32}
              className="rounded-lg"
            />
            <span className="font-semibold text-foreground">Journey Home</span>
          </div>
          <p className="text-sm text-muted-foreground">
            Guiding pilgrims since 2011
          </p>
        </div>
      </footer>
    </div>
  );
}

function FeatureCard({
  icon,
  title,
  description,
}: {
  icon: React.ReactNode;
  title: string;
  description: string;
}) {
  return (
    <div className="bg-card rounded-xl p-6 shadow-sm hover:shadow-md transition-shadow">
      <div className="w-14 h-14 bg-primary/10 rounded-xl flex items-center justify-center text-primary mb-4">
        {icon}
      </div>
      <h3 className="text-lg font-semibold text-foreground mb-2">{title}</h3>
      <p className="text-muted-foreground">{description}</p>
    </div>
  );
}
