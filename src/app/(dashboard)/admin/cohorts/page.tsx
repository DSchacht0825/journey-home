"use client";

import { useEffect, useState } from "react";
import { createClient } from "@/lib/supabase/client";
import { Card, CardHeader, CardTitle, CardContent, Button, Input, Textarea, Avatar } from "@/components/ui";
import { Plus, Users, Calendar, MoreVertical, UserPlus, X } from "lucide-react";
import { format } from "date-fns";
import type { Cohort, Profile } from "@/types/database";

interface CohortWithMembers extends Cohort {
  members: { user_id: string; role: string; profile: Profile }[];
}

export default function CohortsManagementPage() {
  const [cohorts, setCohorts] = useState<CohortWithMembers[]>([]);
  const [allUsers, setAllUsers] = useState<Profile[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [showAddMemberModal, setShowAddMemberModal] = useState<string | null>(null);
  const [selectedCohort, setSelectedCohort] = useState<CohortWithMembers | null>(null);

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    const supabase = createClient();

    // Get all cohorts with members
    const { data: cohortsData } = await supabase
      .from("cohorts")
      .select(`
        *,
        members:cohort_members(
          user_id,
          role,
          profile:profiles(*)
        )
      `)
      .order("created_at", { ascending: false });

    if (cohortsData) {
      setCohorts(cohortsData as unknown as CohortWithMembers[]);
    }

    // Get all users for adding to cohorts
    const { data: usersData } = await supabase
      .from("profiles")
      .select("*")
      .order("full_name");

    if (usersData) {
      setAllUsers(usersData);
    }

    setIsLoading(false);
  };

  const removeMember = async (cohortId: string, userId: string) => {
    const supabase = createClient();
    await supabase
      .from("cohort_members")
      .delete()
      .eq("cohort_id", cohortId)
      .eq("user_id", userId);

    fetchData();
  };

  if (isLoading) {
    return (
      <div className="text-center py-12 text-muted-foreground">
        Loading cohorts...
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold text-foreground">Manage Cohorts</h1>
          <p className="text-muted-foreground mt-1">
            Create and manage cohort groups
          </p>
        </div>
        <Button onClick={() => setShowCreateModal(true)}>
          <Plus className="w-4 h-4 mr-2" />
          Create Cohort
        </Button>
      </div>

      {/* Cohorts Grid */}
      {cohorts.length === 0 ? (
        <Card className="text-center py-16">
          <CardContent>
            <Users className="w-16 h-16 text-muted-foreground mx-auto mb-4" />
            <h2 className="text-xl font-semibold text-foreground mb-2">
              No Cohorts Yet
            </h2>
            <p className="text-muted-foreground mb-6">
              Create your first cohort to start grouping participants.
            </p>
            <Button onClick={() => setShowCreateModal(true)}>
              <Plus className="w-4 h-4 mr-2" />
              Create Cohort
            </Button>
          </CardContent>
        </Card>
      ) : (
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
          {cohorts.map((cohort) => (
            <Card key={cohort.id} className="relative">
              <CardHeader>
                <div className="flex items-start justify-between">
                  <div>
                    <CardTitle>{cohort.name}</CardTitle>
                    {cohort.description && (
                      <p className="text-sm text-muted-foreground mt-1">
                        {cohort.description}
                      </p>
                    )}
                  </div>
                  <span
                    className={`px-2 py-1 text-xs rounded-full ${
                      cohort.is_active
                        ? "bg-accent/20 text-accent"
                        : "bg-muted text-muted-foreground"
                    }`}
                  >
                    {cohort.is_active ? "Active" : "Inactive"}
                  </span>
                </div>
              </CardHeader>
              <CardContent>
                {cohort.start_date && (
                  <div className="flex items-center gap-2 text-sm text-muted-foreground mb-4">
                    <Calendar className="w-4 h-4" />
                    {format(new Date(cohort.start_date), "MMM d, yyyy")}
                    {cohort.end_date && ` - ${format(new Date(cohort.end_date), "MMM d, yyyy")}`}
                  </div>
                )}

                <div className="mb-4">
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-sm font-medium text-foreground">
                      Members ({cohort.members?.length || 0})
                    </span>
                    <button
                      onClick={() => setShowAddMemberModal(cohort.id)}
                      className="text-primary text-sm hover:underline flex items-center gap-1"
                    >
                      <UserPlus className="w-3 h-3" />
                      Add
                    </button>
                  </div>
                  <div className="flex flex-wrap gap-2">
                    {cohort.members?.slice(0, 5).map((member) => (
                      <div
                        key={member.user_id}
                        className="group relative"
                        title={member.profile?.full_name || "Member"}
                      >
                        <Avatar
                          src={member.profile?.avatar_url}
                          alt={member.profile?.full_name || "Member"}
                          size="sm"
                        />
                        <button
                          onClick={() => removeMember(cohort.id, member.user_id)}
                          className="absolute -top-1 -right-1 w-4 h-4 bg-destructive text-destructive-foreground rounded-full hidden group-hover:flex items-center justify-center text-xs"
                        >
                          ×
                        </button>
                      </div>
                    ))}
                    {(cohort.members?.length || 0) > 5 && (
                      <div className="w-8 h-8 bg-muted rounded-full flex items-center justify-center text-xs text-muted-foreground">
                        +{(cohort.members?.length || 0) - 5}
                      </div>
                    )}
                  </div>
                </div>

                <Button
                  variant="outline"
                  className="w-full"
                  onClick={() => setSelectedCohort(cohort)}
                >
                  Manage Cohort
                </Button>
              </CardContent>
            </Card>
          ))}
        </div>
      )}

      {/* Create Cohort Modal */}
      {showCreateModal && (
        <CreateCohortModal
          onClose={() => setShowCreateModal(false)}
          onSuccess={fetchData}
        />
      )}

      {/* Add Member Modal */}
      {showAddMemberModal && (
        <AddMemberModal
          cohortId={showAddMemberModal}
          users={allUsers}
          existingMembers={
            cohorts.find((c) => c.id === showAddMemberModal)?.members?.map((m) => m.user_id) || []
          }
          onClose={() => setShowAddMemberModal(null)}
          onSuccess={fetchData}
        />
      )}
    </div>
  );
}

function CreateCohortModal({
  onClose,
  onSuccess,
}: {
  onClose: () => void;
  onSuccess: () => void;
}) {
  const [name, setName] = useState("");
  const [description, setDescription] = useState("");
  const [startDate, setStartDate] = useState("");
  const [endDate, setEndDate] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState("");

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setError("");

    const supabase = createClient();
    const { data: { user } } = await supabase.auth.getUser();

    if (!user) {
      setError("Not authenticated");
      setIsLoading(false);
      return;
    }

    const { data: newCohort, error } = await supabase.from("cohorts").insert({
      name,
      description: description || null,
      start_date: startDate || null,
      end_date: endDate || null,
      created_by: user.id,
    } as never).select().single();

    if (error) {
      setError(error.message);
      setIsLoading(false);
      return;
    }

    // Auto-add creator as moderator
    if (newCohort) {
      await supabase.from("cohort_members").insert({
        cohort_id: (newCohort as { id: string }).id,
        user_id: user.id,
        role: "moderator",
      } as never);
    }

    onSuccess();
    onClose();
  };

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
      <Card className="w-full max-w-md">
        <CardHeader className="flex flex-row items-center justify-between">
          <CardTitle>Create Cohort</CardTitle>
          <button onClick={onClose} className="p-2 hover:bg-muted rounded-lg">
            <X className="w-5 h-5" />
          </button>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-4">
            {error && (
              <div className="p-3 bg-destructive/10 border border-destructive/20 rounded-lg text-destructive text-sm">
                {error}
              </div>
            )}

            <Input
              label="Cohort Name"
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="e.g., Spring 2025 Cohort"
              required
            />

            <Textarea
              label="Description"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="Describe this cohort..."
            />

            <div className="grid grid-cols-2 gap-4">
              <Input
                label="Start Date"
                type="date"
                value={startDate}
                onChange={(e) => setStartDate(e.target.value)}
              />
              <Input
                label="End Date"
                type="date"
                value={endDate}
                onChange={(e) => setEndDate(e.target.value)}
              />
            </div>

            <div className="flex gap-3 pt-4">
              <Button type="button" variant="outline" onClick={onClose} className="flex-1">
                Cancel
              </Button>
              <Button type="submit" isLoading={isLoading} className="flex-1">
                Create Cohort
              </Button>
            </div>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}

function AddMemberModal({
  cohortId,
  users,
  existingMembers,
  onClose,
  onSuccess,
}: {
  cohortId: string;
  users: Profile[];
  existingMembers: string[];
  onClose: () => void;
  onSuccess: () => void;
}) {
  const [selectedUsers, setSelectedUsers] = useState<string[]>([]);
  const [role, setRole] = useState<"participant" | "moderator">("participant");
  const [isLoading, setIsLoading] = useState(false);

  const availableUsers = users.filter((u) => !existingMembers.includes(u.id));

  const handleSubmit = async () => {
    if (selectedUsers.length === 0) return;

    setIsLoading(true);
    const supabase = createClient();

    const membersToAdd = selectedUsers.map((userId) => ({
      cohort_id: cohortId,
      user_id: userId,
      role,
    }));

    await supabase.from("cohort_members").insert(membersToAdd as never);

    onSuccess();
    onClose();
  };

  const toggleUser = (userId: string) => {
    setSelectedUsers((prev) =>
      prev.includes(userId)
        ? prev.filter((id) => id !== userId)
        : [...prev, userId]
    );
  };

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
      <Card className="w-full max-w-md max-h-[80vh] overflow-hidden flex flex-col">
        <CardHeader className="flex flex-row items-center justify-between flex-shrink-0">
          <CardTitle>Add Members</CardTitle>
          <button onClick={onClose} className="p-2 hover:bg-muted rounded-lg">
            <X className="w-5 h-5" />
          </button>
        </CardHeader>
        <CardContent className="flex-1 overflow-auto">
          <div className="mb-4">
            <label className="block text-sm font-medium text-foreground mb-1.5">
              Role
            </label>
            <select
              value={role}
              onChange={(e) => setRole(e.target.value as "participant" | "moderator")}
              className="w-full px-4 py-2.5 bg-background border-2 border-border rounded-lg text-foreground"
            >
              <option value="participant">Participant</option>
              <option value="moderator">Moderator</option>
            </select>
          </div>

          <div className="space-y-2">
            <label className="block text-sm font-medium text-foreground">
              Select Members ({selectedUsers.length} selected)
            </label>
            {availableUsers.length === 0 ? (
              <p className="text-sm text-muted-foreground py-4 text-center">
                All users are already members of this cohort.
              </p>
            ) : (
              <div className="space-y-2 max-h-60 overflow-y-auto">
                {availableUsers.map((user) => (
                  <label
                    key={user.id}
                    className={`flex items-center gap-3 p-3 rounded-lg cursor-pointer border-2 transition-colors ${
                      selectedUsers.includes(user.id)
                        ? "border-primary bg-primary/5"
                        : "border-border hover:border-primary/50"
                    }`}
                  >
                    <input
                      type="checkbox"
                      checked={selectedUsers.includes(user.id)}
                      onChange={() => toggleUser(user.id)}
                      className="sr-only"
                    />
                    <Avatar
                      src={user.avatar_url}
                      alt={user.full_name || user.email}
                      size="sm"
                    />
                    <div>
                      <p className="font-medium text-foreground">
                        {user.full_name || "No name"}
                      </p>
                      <p className="text-xs text-muted-foreground">{user.email}</p>
                    </div>
                  </label>
                ))}
              </div>
            )}
          </div>

          <div className="flex gap-3 pt-6">
            <Button type="button" variant="outline" onClick={onClose} className="flex-1">
              Cancel
            </Button>
            <Button
              onClick={handleSubmit}
              isLoading={isLoading}
              disabled={selectedUsers.length === 0}
              className="flex-1"
            >
              Add {selectedUsers.length} Member{selectedUsers.length !== 1 ? "s" : ""}
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
