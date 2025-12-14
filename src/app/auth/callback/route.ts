import { createClient } from "@/lib/supabase/server";
import { NextResponse } from "next/server";

export async function GET(request: Request) {
  const { searchParams, origin } = new URL(request.url);
  const code = searchParams.get("code");
  const next = searchParams.get("next") ?? "/dashboard";
  const type = searchParams.get("type");

  if (code) {
    const supabase = await createClient();
    const { error } = await supabase.auth.exchangeCodeForSession(code);

    if (!error) {
      // Check if user needs to set password (new invite)
      const { data: { user } } = await supabase.auth.getUser();

      if (user) {
        // If this is an invite or recovery, or if user was just created (within last 5 min)
        const createdAt = new Date(user.created_at).getTime();
        const now = Date.now();
        const isNewUser = (now - createdAt) < 5 * 60 * 1000; // 5 minutes

        if (type === "invite" || type === "recovery" || type === "signup" || isNewUser) {
          return NextResponse.redirect(`${origin}/auth/set-password`);
        }
      }

      return NextResponse.redirect(`${origin}${next}`);
    }
  }

  // Return to login with error
  return NextResponse.redirect(`${origin}/login?error=Could not authenticate`);
}
