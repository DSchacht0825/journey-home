import { createClient } from "@/lib/supabase/server";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui";
import { Users, BookOpen, MessageCircle, FileText, Heart } from "lucide-react";
import Link from "next/link";

export default async function DashboardPage() {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();

  // Fetch user's cohort membership
  const { data: membership } = await supabase
    .from("cohort_members")
    .select(`
      *,
      cohort:cohorts(*)
    `)
    .eq("user_id", user?.id || "")
    .single() as { data: { cohort: { id: string; name: string; description: string | null } } | null };

  const cohort = membership?.cohort;

  return (
    <div className="space-y-8">
      {/* Welcome Section */}
      <div>
        <h1 className="text-3xl font-bold text-foreground">Welcome Home</h1>
        <p className="text-muted-foreground mt-2">
          Your space for spiritual growth and community connection
        </p>
      </div>

      {/* Cohort Status */}
      {cohort ? (
        <Card variant="elevated" className="bg-primary/5 border-primary/20">
          <CardContent className="pt-6">
            <div className="flex items-center gap-4">
              <div className="w-12 h-12 bg-primary/20 rounded-xl flex items-center justify-center">
                <Users className="w-6 h-6 text-primary" />
              </div>
              <div>
                <h2 className="text-lg font-semibold text-foreground">
                  {cohort.name}
                </h2>
                <p className="text-sm text-muted-foreground">
                  {cohort.description || "Your current cohort"}
                </p>
              </div>
              <Link
                href="/cohort"
                className="ml-auto px-4 py-2 bg-primary text-primary-foreground rounded-lg text-sm font-medium hover:bg-primary/90 transition-colors"
              >
                View Cohort
              </Link>
            </div>
          </CardContent>
        </Card>
      ) : (
        <Card variant="outlined">
          <CardContent className="pt-6 text-center">
            <Users className="w-12 h-12 text-muted-foreground mx-auto mb-4" />
            <h2 className="text-lg font-semibold text-foreground">
              No Active Cohort
            </h2>
            <p className="text-muted-foreground mt-2">
              You&apos;ll be added to a cohort by your administrator
            </p>
          </CardContent>
        </Card>
      )}

      {/* Quick Actions Grid */}
      <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <QuickActionCard
          href="/journal"
          icon={<BookOpen className="w-6 h-6" />}
          title="My Journal"
          description="Reflect on your journey"
          color="accent"
        />
        <QuickActionCard
          href="/cohort"
          icon={<Heart className="w-6 h-6" />}
          title="Encouragements"
          description="Share & receive prayers"
          color="secondary"
        />
        <QuickActionCard
          href="/messages"
          icon={<MessageCircle className="w-6 h-6" />}
          title="Messages"
          description="Stay connected"
          color="primary"
        />
        <QuickActionCard
          href="/documents"
          icon={<FileText className="w-6 h-6" />}
          title="Resources"
          description="Learning materials"
          color="muted"
        />
      </div>

      {/* Recent Activity Placeholder */}
      <Card>
        <CardHeader>
          <CardTitle>Recent Activity</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="text-center py-8 text-muted-foreground">
            <p>Your journey begins here.</p>
            <p className="text-sm mt-2">
              Once you&apos;re part of a cohort, you&apos;ll see recent messages and prompts.
            </p>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}

function QuickActionCard({
  href,
  icon,
  title,
  description,
  color,
}: {
  href: string;
  icon: React.ReactNode;
  title: string;
  description: string;
  color: "primary" | "secondary" | "accent" | "muted";
}) {
  const colorClasses = {
    primary: "bg-primary/10 text-primary",
    secondary: "bg-secondary/10 text-secondary",
    accent: "bg-accent/10 text-accent",
    muted: "bg-muted text-muted-foreground",
  };

  return (
    <Link href={href}>
      <Card className="h-full hover:shadow-md transition-shadow cursor-pointer">
        <CardContent className="pt-6">
          <div
            className={`w-12 h-12 rounded-xl flex items-center justify-center mb-4 ${colorClasses[color]}`}
          >
            {icon}
          </div>
          <h3 className="font-semibold text-foreground">{title}</h3>
          <p className="text-sm text-muted-foreground mt-1">{description}</p>
        </CardContent>
      </Card>
    </Link>
  );
}
