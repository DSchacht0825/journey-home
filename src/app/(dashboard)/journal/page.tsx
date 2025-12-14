"use client";

import { useEffect, useState } from "react";
import { createClient } from "@/lib/supabase/client";
import { Card, CardHeader, CardTitle, CardContent, Button, Textarea } from "@/components/ui";
import { Plus, BookOpen, Calendar, ChevronRight, Save, X } from "lucide-react";
import { format } from "date-fns";
import type { JournalEntry } from "@/types/database";

export default function JournalPage() {
  const [entries, setEntries] = useState<JournalEntry[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [showEditor, setShowEditor] = useState(false);
  const [selectedEntry, setSelectedEntry] = useState<JournalEntry | null>(null);
  const [title, setTitle] = useState("");
  const [content, setContent] = useState("");
  const [isSaving, setIsSaving] = useState(false);

  useEffect(() => {
    fetchEntries();
  }, []);

  const fetchEntries = async () => {
    const supabase = createClient();
    const { data: { user } } = await supabase.auth.getUser();

    if (!user) return;

    const { data, error } = await supabase
      .from("journal_entries")
      .select("*")
      .eq("user_id", user.id)
      .order("created_at", { ascending: false });

    if (!error && data) {
      setEntries(data);
    }
    setIsLoading(false);
  };

  const handleNewEntry = () => {
    setSelectedEntry(null);
    setTitle("");
    setContent("");
    setShowEditor(true);
  };

  const handleEditEntry = (entry: JournalEntry) => {
    setSelectedEntry(entry);
    setTitle(entry.title || "");
    setContent(entry.content);
    setShowEditor(true);
  };

  const handleSave = async () => {
    if (!content.trim()) return;

    setIsSaving(true);
    const supabase = createClient();
    const { data: { user } } = await supabase.auth.getUser();

    if (!user) {
      setIsSaving(false);
      return;
    }

    if (selectedEntry) {
      // Update existing entry
      const { error } = await supabase
        .from("journal_entries")
        .update({ title: title || null, content } as never)
        .eq("id", selectedEntry.id);

      if (!error) {
        setEntries(entries.map(e =>
          e.id === selectedEntry.id ? { ...e, title: title || null, content } : e
        ));
      }
    } else {
      // Create new entry
      const { data, error } = await supabase
        .from("journal_entries")
        .insert({ user_id: user.id, title: title || null, content } as never)
        .select()
        .single();

      if (!error && data) {
        setEntries([data as JournalEntry, ...entries]);
      }
    }

    setIsSaving(false);
    setShowEditor(false);
  };

  const handleDelete = async (entryId: string) => {
    const supabase = createClient();
    const { error } = await supabase
      .from("journal_entries")
      .delete()
      .eq("id", entryId);

    if (!error) {
      setEntries(entries.filter(e => e.id !== entryId));
      setShowEditor(false);
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold text-foreground">My Journal</h1>
          <p className="text-muted-foreground mt-1">
            A private space for reflection and growth
          </p>
        </div>
        <Button onClick={handleNewEntry}>
          <Plus className="w-4 h-4 mr-2" />
          New Entry
        </Button>
      </div>

      {/* Journal Editor */}
      {showEditor && (
        <Card variant="elevated" className="border-2 border-primary/20">
          <CardHeader className="flex flex-row items-center justify-between">
            <CardTitle>
              {selectedEntry ? "Edit Entry" : "New Journal Entry"}
            </CardTitle>
            <button
              onClick={() => setShowEditor(false)}
              className="p-2 hover:bg-muted rounded-lg transition-colors"
            >
              <X className="w-5 h-5 text-muted-foreground" />
            </button>
          </CardHeader>
          <CardContent className="space-y-4">
            <input
              type="text"
              placeholder="Title (optional)"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              className="w-full px-4 py-2 bg-background border-2 border-border rounded-lg text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary text-lg font-medium"
            />
            <Textarea
              placeholder="What's on your heart today?"
              value={content}
              onChange={(e) => setContent(e.target.value)}
              className="min-h-[200px]"
            />
            <div className="flex justify-between items-center pt-4">
              {selectedEntry && (
                <Button
                  variant="destructive"
                  onClick={() => handleDelete(selectedEntry.id)}
                >
                  Delete Entry
                </Button>
              )}
              <div className="flex gap-3 ml-auto">
                <Button variant="outline" onClick={() => setShowEditor(false)}>
                  Cancel
                </Button>
                <Button onClick={handleSave} isLoading={isSaving}>
                  <Save className="w-4 h-4 mr-2" />
                  Save Entry
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Journal Entries List */}
      {isLoading ? (
        <div className="text-center py-12 text-muted-foreground">
          Loading your journal...
        </div>
      ) : entries.length === 0 ? (
        <Card className="text-center py-16">
          <CardContent>
            <BookOpen className="w-16 h-16 text-muted-foreground mx-auto mb-4" />
            <h2 className="text-xl font-semibold text-foreground mb-2">
              Your journal awaits
            </h2>
            <p className="text-muted-foreground mb-6 max-w-md mx-auto">
              Begin documenting your journey. Your entries are completely private
              and only visible to you.
            </p>
            <Button onClick={handleNewEntry}>
              <Plus className="w-4 h-4 mr-2" />
              Write Your First Entry
            </Button>
          </CardContent>
        </Card>
      ) : (
        <div className="grid gap-4">
          {entries.map((entry) => (
            <Card
              key={entry.id}
              className="cursor-pointer hover:shadow-md transition-shadow"
              onClick={() => handleEditEntry(entry)}
            >
              <CardContent className="py-4">
                <div className="flex items-start justify-between">
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 text-sm text-muted-foreground mb-2">
                      <Calendar className="w-4 h-4" />
                      {format(new Date(entry.created_at), "MMMM d, yyyy")}
                    </div>
                    {entry.title && (
                      <h3 className="font-semibold text-foreground mb-1">
                        {entry.title}
                      </h3>
                    )}
                    <p className="text-muted-foreground line-clamp-2">
                      {entry.content}
                    </p>
                  </div>
                  <ChevronRight className="w-5 h-5 text-muted-foreground flex-shrink-0 ml-4" />
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}
