"use client";

import { useEffect, useState } from "react";
import { createClient } from "@/lib/supabase/client";
import { Card, CardHeader, CardTitle, CardContent, Avatar } from "@/components/ui";
import { MessageCircle, Bell, Pin, ChevronRight } from "lucide-react";
import { format } from "date-fns";
import type { Message, Profile } from "@/types/database";

interface MessageWithSender extends Message {
  sender: Profile;
}

export default function MessagesPage() {
  const [messages, setMessages] = useState<MessageWithSender[]>([]);
  const [privateMessages, setPrivateMessages] = useState<MessageWithSender[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [selectedMessage, setSelectedMessage] = useState<MessageWithSender | null>(null);

  useEffect(() => {
    fetchMessages();
  }, []);

  const fetchMessages = async () => {
    const supabase = createClient();
    const { data: { user } } = await supabase.auth.getUser();

    if (!user) return;

    // Get user's cohort
    const { data: membership } = await supabase
      .from("cohort_members")
      .select("cohort_id")
      .eq("user_id", user.id)
      .single() as { data: { cohort_id: string } | null };

    if (!membership) {
      setIsLoading(false);
      return;
    }

    // Get cohort messages (announcements and prompts)
    const { data: cohortMessages } = await supabase
      .from("messages")
      .select(`
        *,
        sender:profiles(*)
      `)
      .eq("cohort_id", membership.cohort_id)
      .is("recipient_id", null)
      .in("message_type", ["announcement", "prompt"])
      .order("is_pinned", { ascending: false })
      .order("created_at", { ascending: false });

    if (cohortMessages) {
      setMessages(cohortMessages as unknown as MessageWithSender[]);
    }

    // Get private messages
    const { data: privateMessagesData } = await supabase
      .from("messages")
      .select(`
        *,
        sender:profiles(*)
      `)
      .or(`recipient_id.eq.${user.id},sender_id.eq.${user.id}`)
      .eq("message_type", "private")
      .order("created_at", { ascending: false });

    if (privateMessagesData) {
      setPrivateMessages(privateMessagesData as unknown as MessageWithSender[]);
    }

    setIsLoading(false);
  };

  const getMessageTypeStyles = (type: string) => {
    switch (type) {
      case "announcement":
        return "bg-primary/10 text-primary border-primary/20";
      case "prompt":
        return "bg-accent/10 text-accent border-accent/20";
      default:
        return "bg-muted text-muted-foreground";
    }
  };

  const getMessageTypeIcon = (type: string) => {
    switch (type) {
      case "announcement":
        return <Bell className="w-4 h-4" />;
      case "prompt":
        return <MessageCircle className="w-4 h-4" />;
      default:
        return <MessageCircle className="w-4 h-4" />;
    }
  };

  if (isLoading) {
    return (
      <div className="text-center py-12 text-muted-foreground">
        Loading messages...
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold text-foreground">Messages</h1>
        <p className="text-muted-foreground mt-1">
          Announcements, prompts, and personal messages
        </p>
      </div>

      {selectedMessage ? (
        // Message Detail View
        <Card>
          <CardHeader className="border-b border-border">
            <button
              onClick={() => setSelectedMessage(null)}
              className="text-sm text-primary hover:underline mb-2"
            >
              ← Back to messages
            </button>
            <div className="flex items-start gap-4">
              <Avatar
                src={selectedMessage.sender?.avatar_url}
                alt={selectedMessage.sender?.full_name || "Sender"}
                size="lg"
              />
              <div>
                <CardTitle>{selectedMessage.sender?.full_name || "Unknown"}</CardTitle>
                <div className="flex items-center gap-2 mt-1">
                  <span
                    className={`text-xs px-2 py-0.5 rounded-full border ${getMessageTypeStyles(
                      selectedMessage.message_type
                    )}`}
                  >
                    {selectedMessage.message_type}
                  </span>
                  <span className="text-sm text-muted-foreground">
                    {format(new Date(selectedMessage.created_at), "MMMM d, yyyy 'at' h:mm a")}
                  </span>
                </div>
              </div>
            </div>
          </CardHeader>
          <CardContent className="pt-6">
            <div className="prose prose-sm max-w-none text-foreground whitespace-pre-wrap">
              {selectedMessage.content}
            </div>
          </CardContent>
        </Card>
      ) : (
        <>
          {/* Cohort Messages */}
          <Card>
            <CardHeader>
              <CardTitle>Cohort Messages</CardTitle>
            </CardHeader>
            <CardContent>
              {messages.length === 0 ? (
                <div className="text-center py-8 text-muted-foreground">
                  <MessageCircle className="w-12 h-12 mx-auto mb-4 opacity-50" />
                  <p>No messages yet from your moderators.</p>
                </div>
              ) : (
                <div className="divide-y divide-border">
                  {messages.map((message) => (
                    <div
                      key={message.id}
                      onClick={() => setSelectedMessage(message)}
                      className="py-4 first:pt-0 last:pb-0 cursor-pointer hover:bg-muted/50 -mx-6 px-6 transition-colors"
                    >
                      <div className="flex items-start gap-4">
                        <Avatar
                          src={message.sender?.avatar_url}
                          alt={message.sender?.full_name || "Sender"}
                          size="md"
                        />
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center gap-2 mb-1">
                            {message.is_pinned && (
                              <Pin className="w-3 h-3 text-primary" />
                            )}
                            <span className="font-medium text-foreground">
                              {message.sender?.full_name || "Unknown"}
                            </span>
                            <span
                              className={`text-xs px-2 py-0.5 rounded-full border ${getMessageTypeStyles(
                                message.message_type
                              )}`}
                            >
                              {getMessageTypeIcon(message.message_type)}
                              <span className="ml-1 capitalize">{message.message_type}</span>
                            </span>
                            <span className="text-xs text-muted-foreground">
                              {format(new Date(message.created_at), "MMM d")}
                            </span>
                          </div>
                          <p className="text-muted-foreground line-clamp-2">
                            {message.content}
                          </p>
                        </div>
                        <ChevronRight className="w-5 h-5 text-muted-foreground flex-shrink-0" />
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>

          {/* Private Messages */}
          {privateMessages.length > 0 && (
            <Card>
              <CardHeader>
                <CardTitle>Private Messages</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="divide-y divide-border">
                  {privateMessages.map((message) => (
                    <div
                      key={message.id}
                      onClick={() => setSelectedMessage(message)}
                      className="py-4 first:pt-0 last:pb-0 cursor-pointer hover:bg-muted/50 -mx-6 px-6 transition-colors"
                    >
                      <div className="flex items-start gap-4">
                        <Avatar
                          src={message.sender?.avatar_url}
                          alt={message.sender?.full_name || "Sender"}
                          size="md"
                        />
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center gap-2 mb-1">
                            <span className="font-medium text-foreground">
                              {message.sender?.full_name || "Unknown"}
                            </span>
                            <span className="text-xs text-muted-foreground">
                              {format(new Date(message.created_at), "MMM d")}
                            </span>
                          </div>
                          <p className="text-muted-foreground line-clamp-2">
                            {message.content}
                          </p>
                        </div>
                        <ChevronRight className="w-5 h-5 text-muted-foreground flex-shrink-0" />
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          )}
        </>
      )}
    </div>
  );
}
