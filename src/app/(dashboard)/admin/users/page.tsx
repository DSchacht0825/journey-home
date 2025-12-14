"use client";

import { useEffect, useState } from "react";
import { createClient } from "@/lib/supabase/client";
import { Card, CardHeader, CardTitle, CardContent, Button, Input, Avatar } from "@/components/ui";
import { UserPlus, Search, MoreVertical, Mail, Shield, User, Trash2 } from "lucide-react";
import type { Profile } from "@/types/database";

export default function UsersManagementPage() {
  const [users, setUsers] = useState<Profile[]>([]);
  const [searchQuery, setSearchQuery] = useState("");
  const [isLoading, setIsLoading] = useState(true);
  const [showInviteModal, setShowInviteModal] = useState(false);
  const [selectedUser, setSelectedUser] = useState<Profile | null>(null);
  const [showUserMenu, setShowUserMenu] = useState<string | null>(null);

  useEffect(() => {
    fetchUsers();
  }, []);

  const fetchUsers = async () => {
    const supabase = createClient();
    const { data, error } = await supabase
      .from("profiles")
      .select("*")
      .order("created_at", { ascending: false });

    if (!error && data) {
      setUsers(data);
    }
    setIsLoading(false);
  };

  const updateUserRole = async (userId: string, newRole: "participant" | "moderator" | "admin") => {
    const supabase = createClient();
    const { error } = await supabase
      .from("profiles")
      .update({ role: newRole } as never)
      .eq("id", userId);

    if (!error) {
      setUsers(users.map(u => u.id === userId ? { ...u, role: newRole } : u));
    }
    setShowUserMenu(null);
  };

  const deleteUser = async (userId: string) => {
    if (!confirm("Are you sure you want to remove this user? This cannot be undone.")) {
      return;
    }

    const response = await fetch(`/api/users/${userId}`, {
      method: "DELETE",
    });

    if (response.ok) {
      setUsers(users.filter(u => u.id !== userId));
    } else {
      const data = await response.json();
      alert(data.error || "Failed to delete user");
    }
    setShowUserMenu(null);
  };

  const filteredUsers = users.filter(user =>
    user.full_name?.toLowerCase().includes(searchQuery.toLowerCase()) ||
    user.email.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const roleColors = {
    admin: "bg-primary text-primary-foreground",
    moderator: "bg-secondary text-secondary-foreground",
    participant: "bg-muted text-muted-foreground",
  };

  const roleIcons = {
    admin: <Shield className="w-3 h-3" />,
    moderator: <Shield className="w-3 h-3" />,
    participant: <User className="w-3 h-3" />,
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold text-foreground">Manage Participants</h1>
          <p className="text-muted-foreground mt-1">
            Add, edit, and manage user accounts
          </p>
        </div>
        <Button onClick={() => setShowInviteModal(true)}>
          <UserPlus className="w-4 h-4 mr-2" />
          Invite Participant
        </Button>
      </div>

      {/* Search */}
      <div className="relative">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground" />
        <Input
          placeholder="Search by name or email..."
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          className="pl-10"
        />
      </div>

      {/* Users List */}
      <Card>
        <CardHeader>
          <CardTitle>All Participants ({filteredUsers.length})</CardTitle>
        </CardHeader>
        <CardContent>
          {isLoading ? (
            <div className="text-center py-8 text-muted-foreground">
              Loading participants...
            </div>
          ) : filteredUsers.length === 0 ? (
            <div className="text-center py-8 text-muted-foreground">
              No participants found
            </div>
          ) : (
            <div className="divide-y divide-border">
              {filteredUsers.map((user) => (
                <div
                  key={user.id}
                  className="flex items-center justify-between py-4 first:pt-0 last:pb-0"
                >
                  <div className="flex items-center gap-4">
                    <Avatar
                      src={user.avatar_url}
                      alt={user.full_name || user.email}
                      size="lg"
                    />
                    <div>
                      <p className="font-medium text-foreground">
                        {user.full_name || "No name set"}
                      </p>
                      <p className="text-sm text-muted-foreground">{user.email}</p>
                    </div>
                  </div>

                  <div className="flex items-center gap-3">
                    <span
                      className={`inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-medium ${roleColors[user.role]}`}
                    >
                      {roleIcons[user.role]}
                      {user.role.charAt(0).toUpperCase() + user.role.slice(1)}
                    </span>

                    <div className="relative">
                      <button
                        onClick={() => setShowUserMenu(showUserMenu === user.id ? null : user.id)}
                        className="p-2 hover:bg-muted rounded-lg transition-colors"
                      >
                        <MoreVertical className="w-5 h-5 text-muted-foreground" />
                      </button>

                      {showUserMenu === user.id && (
                        <div className="absolute right-0 top-full mt-1 w-48 bg-card border border-border rounded-lg shadow-lg py-1 z-10">
                          <button
                            onClick={() => updateUserRole(user.id, "participant")}
                            className="w-full px-4 py-2 text-left text-sm hover:bg-muted flex items-center gap-2"
                          >
                            <User className="w-4 h-4" />
                            Set as Participant
                          </button>
                          <button
                            onClick={() => updateUserRole(user.id, "moderator")}
                            className="w-full px-4 py-2 text-left text-sm hover:bg-muted flex items-center gap-2"
                          >
                            <Shield className="w-4 h-4" />
                            Set as Moderator
                          </button>
                          <button
                            onClick={() => updateUserRole(user.id, "admin")}
                            className="w-full px-4 py-2 text-left text-sm hover:bg-muted flex items-center gap-2"
                          >
                            <Shield className="w-4 h-4 text-primary" />
                            Set as Admin
                          </button>
                          <hr className="my-1 border-border" />
                          <button
                            onClick={() => {
                              setSelectedUser(user);
                              setShowUserMenu(null);
                            }}
                            className="w-full px-4 py-2 text-left text-sm hover:bg-muted flex items-center gap-2"
                          >
                            <Mail className="w-4 h-4" />
                            Send Message
                          </button>
                          <button
                            onClick={() => deleteUser(user.id)}
                            className="w-full px-4 py-2 text-left text-sm hover:bg-muted flex items-center gap-2 text-destructive"
                          >
                            <Trash2 className="w-4 h-4" />
                            Remove User
                          </button>
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>

      {/* Invite Modal */}
      {showInviteModal && (
        <InviteModal onClose={() => setShowInviteModal(false)} onSuccess={fetchUsers} />
      )}
    </div>
  );
}

function InviteModal({ onClose, onSuccess }: { onClose: () => void; onSuccess: () => void }) {
  const [email, setEmail] = useState("");
  const [fullName, setFullName] = useState("");
  const [role, setRole] = useState<"participant" | "moderator">("participant");
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState("");

  const handleInvite = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setError("");

    try {
      const response = await fetch("/api/invite", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, fullName, role }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || "Failed to send invitation");
      }

      onSuccess();
      onClose();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to send invitation");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
      <Card className="w-full max-w-md">
        <CardHeader>
          <CardTitle>Invite Participant</CardTitle>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleInvite} className="space-y-4">
            {error && (
              <div className="p-3 bg-destructive/10 border border-destructive/20 rounded-lg text-destructive text-sm">
                {error}
              </div>
            )}

            <Input
              label="Full Name"
              value={fullName}
              onChange={(e) => setFullName(e.target.value)}
              placeholder="John Doe"
              required
            />

            <Input
              label="Email Address"
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="john@example.com"
              required
            />

            <div>
              <label className="block text-sm font-medium text-foreground mb-1.5">
                Role
              </label>
              <select
                value={role}
                onChange={(e) => setRole(e.target.value as "participant" | "moderator")}
                className="w-full px-4 py-2.5 bg-background border-2 border-border rounded-lg text-foreground focus:outline-none focus:ring-2 focus:ring-primary"
              >
                <option value="participant">Participant</option>
                <option value="moderator">Moderator</option>
              </select>
            </div>

            <div className="flex gap-3 pt-4">
              <Button type="button" variant="outline" onClick={onClose} className="flex-1">
                Cancel
              </Button>
              <Button type="submit" isLoading={isLoading} className="flex-1">
                Send Invitation
              </Button>
            </div>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}
