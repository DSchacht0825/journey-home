"use client";

import { useEffect, useState } from "react";
import { Bell, BellOff, X } from "lucide-react";
import { requestNotificationPermission, onForegroundMessage, showNotification } from "@/lib/firebase/notifications";
import { Button } from "@/components/ui";

interface NotificationPayload {
  notification?: {
    title?: string;
    body?: string;
  };
  data?: Record<string, string>;
}

export function NotificationProvider({ children }: { children: React.ReactNode }) {
  const [permission, setPermission] = useState<NotificationPermission | "default">("default");
  const [showBanner, setShowBanner] = useState(false);

  useEffect(() => {
    // Check current permission status
    if ("Notification" in window) {
      setPermission(Notification.permission);

      // Show banner if permission hasn't been decided
      if (Notification.permission === "default") {
        // Delay showing the banner
        const timer = setTimeout(() => setShowBanner(true), 3000);
        return () => clearTimeout(timer);
      }
    }
  }, []);

  useEffect(() => {
    // Set up foreground message listener
    if (permission === "granted") {
      onForegroundMessage((payload) => {
        const p = payload as NotificationPayload;
        if (p.notification) {
          showNotification(p.notification.title || "Journey Home", {
            body: p.notification.body,
          });
        }
      });
    }
  }, [permission]);

  const handleEnableNotifications = async () => {
    const token = await requestNotificationPermission();
    if (token) {
      setPermission("granted");
      setShowBanner(false);
    } else {
      setPermission(Notification.permission);
    }
  };

  const handleDismiss = () => {
    setShowBanner(false);
  };

  return (
    <>
      {children}

      {/* Notification Permission Banner */}
      {showBanner && permission === "default" && (
        <div className="fixed bottom-4 left-4 right-4 md:left-auto md:right-4 md:w-96 bg-card border border-border rounded-xl shadow-lg p-4 z-50">
          <div className="flex items-start gap-3">
            <div className="w-10 h-10 bg-primary/10 rounded-full flex items-center justify-center flex-shrink-0">
              <Bell className="w-5 h-5 text-primary" />
            </div>
            <div className="flex-1">
              <h3 className="font-semibold text-foreground">Stay Connected</h3>
              <p className="text-sm text-muted-foreground mt-1">
                Enable notifications to receive updates from your cohort and moderators.
              </p>
              <div className="flex gap-2 mt-3">
                <Button size="sm" onClick={handleEnableNotifications}>
                  Enable
                </Button>
                <Button size="sm" variant="ghost" onClick={handleDismiss}>
                  Not now
                </Button>
              </div>
            </div>
            <button
              onClick={handleDismiss}
              className="text-muted-foreground hover:text-foreground"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>
      )}
    </>
  );
}

// Hook to use notification status
export function useNotifications() {
  const [permission, setPermission] = useState<NotificationPermission | "default">("default");
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    if ("Notification" in window) {
      setPermission(Notification.permission);
    }
  }, []);

  const requestPermission = async () => {
    setIsLoading(true);
    const token = await requestNotificationPermission();
    setPermission(Notification.permission);
    setIsLoading(false);
    return token;
  };

  return {
    permission,
    isEnabled: permission === "granted",
    isDenied: permission === "denied",
    isLoading,
    requestPermission,
  };
}

// Small component to show notification status/toggle in settings
export function NotificationToggle() {
  const { permission, isEnabled, isDenied, isLoading, requestPermission } = useNotifications();

  if (isDenied) {
    return (
      <div className="flex items-center gap-3 p-4 bg-muted rounded-lg">
        <BellOff className="w-5 h-5 text-muted-foreground" />
        <div>
          <p className="font-medium text-foreground">Notifications Blocked</p>
          <p className="text-sm text-muted-foreground">
            Enable notifications in your browser settings
          </p>
        </div>
      </div>
    );
  }

  if (isEnabled) {
    return (
      <div className="flex items-center gap-3 p-4 bg-accent/10 rounded-lg">
        <Bell className="w-5 h-5 text-accent" />
        <div>
          <p className="font-medium text-foreground">Notifications Enabled</p>
          <p className="text-sm text-muted-foreground">
            You&apos;ll receive updates from your cohort
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="flex items-center justify-between p-4 bg-muted rounded-lg">
      <div className="flex items-center gap-3">
        <Bell className="w-5 h-5 text-muted-foreground" />
        <div>
          <p className="font-medium text-foreground">Enable Notifications</p>
          <p className="text-sm text-muted-foreground">
            Stay updated with your cohort
          </p>
        </div>
      </div>
      <Button size="sm" onClick={requestPermission} isLoading={isLoading}>
        Enable
      </Button>
    </div>
  );
}
