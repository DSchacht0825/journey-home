import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { Navbar } from "@/components/layout/navbar";

export default async function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();

  if (!user) {
    redirect("/login");
  }

  // Fetch user profile
  const { data: profile } = await supabase
    .from("profiles")
    .select("*")
    .eq("id", user.id)
    .single() as { data: { full_name: string | null; avatar_url: string | null; role: string } | null };

  const userData = profile ? {
    name: profile.full_name || user.email || "Pilgrim",
    email: user.email || "",
    avatar: profile.avatar_url,
    role: profile.role as "participant" | "moderator" | "admin",
  } : {
    name: user.email || "Pilgrim",
    email: user.email || "",
    avatar: null,
    role: "participant" as const,
  };

  return (
    <div className="min-h-screen bg-background">
      <Navbar user={userData} />
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {children}
      </main>
    </div>
  );
}
