"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase/client";

export default function AuthCallbackPage() {
  const router = useRouter();
  const [status, setStatus] = useState("Processing...");

  useEffect(() => {
    const handleCallback = async () => {
      const supabase = createClient();

      // Sign out any existing session first
      await supabase.auth.signOut();

      // Get the hash fragment (contains access_token, refresh_token, etc.)
      const hashParams = new URLSearchParams(window.location.hash.substring(1));
      const accessToken = hashParams.get("access_token");
      const refreshToken = hashParams.get("refresh_token");
      const type = hashParams.get("type");

      // Also check query params for PKCE flow
      const queryParams = new URLSearchParams(window.location.search);
      const code = queryParams.get("code");
      const queryType = queryParams.get("type");

      if (accessToken && refreshToken) {
        // Token-based flow (invites, magic links)
        const { error } = await supabase.auth.setSession({
          access_token: accessToken,
          refresh_token: refreshToken,
        });

        if (error) {
          setStatus("Authentication failed");
          setTimeout(() => router.push("/login?error=Authentication failed"), 2000);
          return;
        }

        // Check if new user (invite flow)
        const { data: { user } } = await supabase.auth.getUser();
        if (user) {
          const createdAt = new Date(user.created_at).getTime();
          const now = Date.now();
          const isNewUser = (now - createdAt) < 10 * 60 * 1000; // 10 minutes

          if (type === "invite" || type === "signup" || type === "recovery" || isNewUser) {
            router.push("/auth/set-password");
            return;
          }
        }

        router.push("/dashboard");
      } else if (code) {
        // PKCE flow
        const { error } = await supabase.auth.exchangeCodeForSession(code);

        if (error) {
          setStatus("Authentication failed");
          setTimeout(() => router.push("/login?error=Authentication failed"), 2000);
          return;
        }

        const { data: { user } } = await supabase.auth.getUser();
        if (user) {
          const createdAt = new Date(user.created_at).getTime();
          const now = Date.now();
          const isNewUser = (now - createdAt) < 10 * 60 * 1000;

          if (queryType === "invite" || queryType === "recovery" || isNewUser) {
            router.push("/auth/set-password");
            return;
          }
        }

        router.push("/dashboard");
      } else {
        setStatus("No authentication data found");
        setTimeout(() => router.push("/login"), 2000);
      }
    };

    handleCallback();
  }, [router]);

  return (
    <div className="min-h-screen bg-background flex items-center justify-center">
      <div className="text-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto mb-4"></div>
        <p className="text-muted-foreground">{status}</p>
      </div>
    </div>
  );
}
