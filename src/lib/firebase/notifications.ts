"use client";

import { getToken, onMessage } from "firebase/messaging";
import { getMessagingInstance } from "./config";
import { createClient } from "@/lib/supabase/client";

const VAPID_KEY = process.env.NEXT_PUBLIC_FIREBASE_VAPID_KEY;

// Request notification permission and get FCM token
export async function requestNotificationPermission(): Promise<string | null> {
  try {
    // Check if notifications are supported
    if (!("Notification" in window)) {
      console.log("This browser does not support notifications");
      return null;
    }

    // Request permission
    const permission = await Notification.requestPermission();
    if (permission !== "granted") {
      console.log("Notification permission denied");
      return null;
    }

    // Get messaging instance
    const messaging = await getMessagingInstance();
    if (!messaging) {
      console.log("Firebase messaging not supported");
      return null;
    }

    // Get FCM token
    const token = await getToken(messaging, { vapidKey: VAPID_KEY });

    if (token) {
      // Save token to database
      await saveTokenToDatabase(token);
      return token;
    }

    return null;
  } catch (error) {
    console.error("Error getting notification permission:", error);
    return null;
  }
}

// Save FCM token to Supabase
async function saveTokenToDatabase(token: string) {
  const supabase = createClient();
  const { data: { user } } = await supabase.auth.getUser();

  if (!user) return;

  // Upsert token (insert or update if exists)
  await supabase.from("fcm_tokens").upsert(
    {
      user_id: user.id,
      token,
      device_info: navigator.userAgent,
      updated_at: new Date().toISOString(),
    } as never,
    { onConflict: "user_id,token" }
  );
}

// Listen for foreground messages
export function onForegroundMessage(callback: (payload: unknown) => void) {
  getMessagingInstance().then((messaging) => {
    if (!messaging) return;

    onMessage(messaging, (payload) => {
      console.log("Foreground message received:", payload);
      callback(payload);
    });
  });
}

// Show a notification manually (for foreground messages)
export function showNotification(title: string, options?: NotificationOptions) {
  if (Notification.permission === "granted") {
    new Notification(title, {
      icon: "/Journey-Home_White_Simple.png",
      badge: "/Journey-Home_White_Simple.png",
      ...options,
    });
  }
}
