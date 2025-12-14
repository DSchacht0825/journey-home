"use client";

import { useEffect, useState } from "react";
import { createClient } from "@/lib/supabase/client";
import { Card, CardHeader, CardTitle, CardContent, Button, Textarea, Avatar } from "@/components/ui";
import { Users, Heart, MessageCircle, Send } from "lucide-react";
import { format } from "date-fns";
import type { Cohort, Profile, Encouragement } from "@/types/database";

interface CohortMemberWithProfile {
  user_id: string;
  role: string;
  profile: Profile;
}

export default function CohortPage() {
  const [cohort, setCohort] = useState<Cohort | null>(null);
  const [members, setMembers] = useState<CohortMemberWithProfile[]>([]);
  const [encouragements, setEncouragements] = useState<(Encouragement & { author: Profile })[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [newEncouragement, setNewEncouragement] = useState("");
  const [encouragementType, setEncouragementType] = useState<"encouragement" | "prayer">("encouragement");
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    fetchCohortData();
  }, []);

  const fetchCohortData = async () => {
    const supabase = createClient();
    const { data: { user } } = await supabase.auth.getUser();

    if (!user) return;

    // Get user's cohort membership
    const { data: membership } = await supabase
      .from("cohort_members")
      .select(`
        cohort_id,
        cohort:cohorts(*)
      `)
      .eq("user_id", user.id)
      .single() as { data: { cohort_id: string; cohort: Cohort } | null };

    if (!membership?.cohort) {
      setIsLoading(false);
      return;
    }

    const cohortData = membership.cohort as unknown as Cohort;
    setCohort(cohortData);

    // Get cohort members with profiles
    const { data: membersData } = await supabase
      .from("cohort_members")
      .select(`
        user_id,
        role,
        profile:profiles(*)
      `)
      .eq("cohort_id", cohortData.id);

    if (membersData) {
      setMembers(membersData as unknown as CohortMemberWithProfile[]);
    }

    // Get encouragements
    const { data: encouragementsData } = await supabase
      .from("encouragements")
      .select(`
        *,
        author:profiles(*)
      `)
      .eq("cohort_id", cohortData.id)
      .order("created_at", { ascending: false })
      .limit(20);

    if (encouragementsData) {
      setEncouragements(encouragementsData as unknown as (Encouragement & { author: Profile })[]);
    }

    setIsLoading(false);
  };

  const handleSubmitEncouragement = async () => {
    if (!newEncouragement.trim() || !cohort) return;

    setIsSubmitting(true);
    const supabase = createClient();
    const { data: { user } } = await supabase.auth.getUser();

    if (!user) {
      setIsSubmitting(false);
      return;
    }

    const { data, error } = await supabase
      .from("encouragements")
      .insert({
        cohort_id: cohort.id,
        author_id: user.id,
        content: newEncouragement,
        type: encouragementType,
      } as never)
      .select(`
        *,
        author:profiles(*)
      `)
      .single();

    if (!error && data) {
      setEncouragements([data as unknown as (Encouragement & { author: Profile }), ...encouragements]);
      setNewEncouragement("");
    }

    setIsSubmitting(false);
  };

  if (isLoading) {
    return (
      <div className="text-center py-12 text-muted-foreground">
        Loading cohort...
      </div>
    );
  }

  if (!cohort) {
    return (
      <div className="space-y-6">
        <div>
          <h1 className="text-3xl font-bold text-foreground">My Cohort</h1>
          <p className="text-muted-foreground mt-1">
            Connect with your fellow pilgrims
          </p>
        </div>
        <Card className="text-center py-16">
          <CardContent>
            <Users className="w-16 h-16 text-muted-foreground mx-auto mb-4" />
            <h2 className="text-xl font-semibold text-foreground mb-2">
              No Active Cohort
            </h2>
            <p className="text-muted-foreground max-w-md mx-auto">
              You haven&apos;t been assigned to a cohort yet. Your administrator will
              add you to a cohort soon.
            </p>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold text-foreground">{cohort.name}</h1>
        <p className="text-muted-foreground mt-1">
          {cohort.description || "Your spiritual journey community"}
        </p>
      </div>

      <div className="grid lg:grid-cols-3 gap-6">
        {/* Main Content - Encouragements */}
        <div className="lg:col-span-2 space-y-6">
          {/* New Encouragement Form */}
          <Card>
            <CardContent className="pt-6">
              <div className="flex gap-2 mb-4">
                <button
                  onClick={() => setEncouragementType("encouragement")}
                  className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
                    encouragementType === "encouragement"
                      ? "bg-secondary text-secondary-foreground"
                      : "bg-muted text-muted-foreground hover:bg-muted/80"
                  }`}
                >
                  <Heart className="w-4 h-4 inline mr-2" />
                  Encouragement
                </button>
                <button
                  onClick={() => setEncouragementType("prayer")}
                  className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
                    encouragementType === "prayer"
                      ? "bg-accent text-accent-foreground"
                      : "bg-muted text-muted-foreground hover:bg-muted/80"
                  }`}
                >
                  <MessageCircle className="w-4 h-4 inline mr-2" />
                  Prayer
                </button>
              </div>
              <Textarea
                placeholder={
                  encouragementType === "encouragement"
                    ? "Share an encouragement with your cohort..."
                    : "Share a prayer request or pray for your cohort..."
                }
                value={newEncouragement}
                onChange={(e) => setNewEncouragement(e.target.value)}
                className="min-h-[100px]"
              />
              <div className="flex justify-end mt-4">
                <Button
                  onClick={handleSubmitEncouragement}
                  isLoading={isSubmitting}
                  disabled={!newEncouragement.trim()}
                >
                  <Send className="w-4 h-4 mr-2" />
                  Share
                </Button>
              </div>
            </CardContent>
          </Card>

          {/* Encouragements Feed */}
          <Card>
            <CardHeader>
              <CardTitle>Community Feed</CardTitle>
            </CardHeader>
            <CardContent>
              {encouragements.length === 0 ? (
                <div className="text-center py-8 text-muted-foreground">
                  <Heart className="w-12 h-12 mx-auto mb-4 opacity-50" />
                  <p>No encouragements yet. Be the first to share!</p>
                </div>
              ) : (
                <div className="space-y-6">
                  {encouragements.map((item) => (
                    <div key={item.id} className="flex gap-4">
                      <Avatar
                        src={item.author?.avatar_url}
                        alt={item.author?.full_name || "Anonymous"}
                        size="md"
                      />
                      <div className="flex-1">
                        <div className="flex items-center gap-2 mb-1">
                          <span className="font-medium text-foreground">
                            {item.author?.full_name || "Anonymous"}
                          </span>
                          <span
                            className={`text-xs px-2 py-0.5 rounded-full ${
                              item.type === "prayer"
                                ? "bg-accent/20 text-accent"
                                : "bg-secondary/20 text-secondary"
                            }`}
                          >
                            {item.type}
                          </span>
                          <span className="text-xs text-muted-foreground">
                            {format(new Date(item.created_at), "MMM d, h:mm a")}
                          </span>
                        </div>
                        <p className="text-foreground whitespace-pre-wrap">
                          {item.content}
                        </p>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        </div>

        {/* Sidebar - Members */}
        <div>
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Users className="w-5 h-5" />
                Cohort Members ({members.length})
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {members.map((member) => (
                  <div key={member.user_id} className="flex items-center gap-3">
                    <Avatar
                      src={member.profile?.avatar_url}
                      alt={member.profile?.full_name || "Member"}
                      size="md"
                    />
                    <div>
                      <p className="font-medium text-foreground">
                        {member.profile?.full_name || "Anonymous"}
                      </p>
                      <p className="text-xs text-muted-foreground capitalize">
                        {member.role}
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
