export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[];

export type UserRole = "participant" | "moderator" | "admin";

export interface Database {
  public: {
    Tables: {
      profiles: {
        Row: {
          id: string;
          email: string;
          full_name: string | null;
          avatar_url: string | null;
          role: UserRole;
          bio: string | null;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id: string;
          email: string;
          full_name?: string | null;
          avatar_url?: string | null;
          role?: UserRole;
          bio?: string | null;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          email?: string;
          full_name?: string | null;
          avatar_url?: string | null;
          role?: UserRole;
          bio?: string | null;
          created_at?: string;
          updated_at?: string;
        };
      };
      cohorts: {
        Row: {
          id: string;
          name: string;
          description: string | null;
          start_date: string | null;
          end_date: string | null;
          is_active: boolean;
          created_by: string;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          name: string;
          description?: string | null;
          start_date?: string | null;
          end_date?: string | null;
          is_active?: boolean;
          created_by: string;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          name?: string;
          description?: string | null;
          start_date?: string | null;
          end_date?: string | null;
          is_active?: boolean;
          created_by?: string;
          created_at?: string;
          updated_at?: string;
        };
      };
      cohort_members: {
        Row: {
          id: string;
          cohort_id: string;
          user_id: string;
          role: "participant" | "moderator";
          joined_at: string;
        };
        Insert: {
          id?: string;
          cohort_id: string;
          user_id: string;
          role?: "participant" | "moderator";
          joined_at?: string;
        };
        Update: {
          id?: string;
          cohort_id?: string;
          user_id?: string;
          role?: "participant" | "moderator";
          joined_at?: string;
        };
      };
      messages: {
        Row: {
          id: string;
          cohort_id: string;
          sender_id: string;
          recipient_id: string | null; // null = sent to whole cohort
          content: string;
          message_type: "announcement" | "prompt" | "general" | "private";
          is_pinned: boolean;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          cohort_id: string;
          sender_id: string;
          recipient_id?: string | null;
          content: string;
          message_type?: "announcement" | "prompt" | "general" | "private";
          is_pinned?: boolean;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          cohort_id?: string;
          sender_id?: string;
          recipient_id?: string | null;
          content?: string;
          message_type?: "announcement" | "prompt" | "general" | "private";
          is_pinned?: boolean;
          created_at?: string;
          updated_at?: string;
        };
      };
      encouragements: {
        Row: {
          id: string;
          cohort_id: string;
          author_id: string;
          content: string;
          type: "encouragement" | "prayer";
          created_at: string;
        };
        Insert: {
          id?: string;
          cohort_id: string;
          author_id: string;
          content: string;
          type?: "encouragement" | "prayer";
          created_at?: string;
        };
        Update: {
          id?: string;
          cohort_id?: string;
          author_id?: string;
          content?: string;
          type?: "encouragement" | "prayer";
          created_at?: string;
        };
      };
      journal_entries: {
        Row: {
          id: string;
          user_id: string;
          cohort_id: string | null;
          title: string | null;
          content: string;
          prompt_id: string | null;
          is_private: boolean;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          user_id: string;
          cohort_id?: string | null;
          title?: string | null;
          content: string;
          prompt_id?: string | null;
          is_private?: boolean;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          user_id?: string;
          cohort_id?: string | null;
          title?: string | null;
          content?: string;
          prompt_id?: string | null;
          is_private?: boolean;
          created_at?: string;
          updated_at?: string;
        };
      };
      documents: {
        Row: {
          id: string;
          cohort_id: string;
          uploaded_by: string;
          title: string;
          description: string | null;
          file_path: string;
          file_type: string;
          file_size: number;
          created_at: string;
        };
        Insert: {
          id?: string;
          cohort_id: string;
          uploaded_by: string;
          title: string;
          description?: string | null;
          file_path: string;
          file_type: string;
          file_size: number;
          created_at?: string;
        };
        Update: {
          id?: string;
          cohort_id?: string;
          uploaded_by?: string;
          title?: string;
          description?: string | null;
          file_path?: string;
          file_type?: string;
          file_size?: number;
          created_at?: string;
        };
      };
      notifications: {
        Row: {
          id: string;
          user_id: string;
          title: string;
          body: string;
          type: "message" | "announcement" | "prompt" | "document";
          reference_id: string | null;
          is_read: boolean;
          created_at: string;
        };
        Insert: {
          id?: string;
          user_id: string;
          title: string;
          body: string;
          type: "message" | "announcement" | "prompt" | "document";
          reference_id?: string | null;
          is_read?: boolean;
          created_at?: string;
        };
        Update: {
          id?: string;
          user_id?: string;
          title?: string;
          body?: string;
          type?: "message" | "announcement" | "prompt" | "document";
          reference_id?: string | null;
          is_read?: boolean;
          created_at?: string;
        };
      };
    };
    Views: {
      [_ in never]: never;
    };
    Functions: {
      [_ in never]: never;
    };
    Enums: {
      user_role: UserRole;
      message_type: "announcement" | "prompt" | "general" | "private";
      encouragement_type: "encouragement" | "prayer";
      notification_type: "message" | "announcement" | "prompt" | "document";
    };
  };
}

// Helper types for easier usage
export type Profile = Database["public"]["Tables"]["profiles"]["Row"];
export type Cohort = Database["public"]["Tables"]["cohorts"]["Row"];
export type CohortMember = Database["public"]["Tables"]["cohort_members"]["Row"];
export type Message = Database["public"]["Tables"]["messages"]["Row"];
export type Encouragement = Database["public"]["Tables"]["encouragements"]["Row"];
export type JournalEntry = Database["public"]["Tables"]["journal_entries"]["Row"];
export type Document = Database["public"]["Tables"]["documents"]["Row"];
export type Notification = Database["public"]["Tables"]["notifications"]["Row"];
