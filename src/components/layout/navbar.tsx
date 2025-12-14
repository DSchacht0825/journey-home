"use client";

import Link from "next/link";
import Image from "next/image";
import { usePathname } from "next/navigation";
import {
  Home,
  Users,
  BookOpen,
  MessageCircle,
  FileText,
  Settings,
  Bell,
  Menu,
  X,
} from "lucide-react";
import { useState } from "react";
import { Avatar } from "@/components/ui";

interface NavbarProps {
  user?: {
    name: string;
    email: string;
    avatar?: string | null;
    role: "participant" | "moderator" | "admin";
  } | null;
}

const navItems = [
  { href: "/dashboard", label: "Home", icon: Home },
  { href: "/cohort", label: "My Cohort", icon: Users },
  { href: "/journal", label: "Journal", icon: BookOpen },
  { href: "/messages", label: "Messages", icon: MessageCircle },
  { href: "/documents", label: "Documents", icon: FileText },
];

const adminItems = [
  { href: "/admin", label: "Admin", icon: Settings },
];

export function Navbar({ user }: NavbarProps) {
  const pathname = usePathname();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  const allNavItems = user?.role === "admin" || user?.role === "moderator"
    ? [...navItems, ...adminItems]
    : navItems;

  return (
    <nav className="sticky top-0 z-50 bg-card border-b border-border">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between h-16">
          {/* Logo */}
          <div className="flex items-center">
            <Link href={user ? "/dashboard" : "/"} className="flex items-center gap-3">
              <Image
                src="/Journey-Home_White_Simple.png"
                alt="Journey Home"
                width={40}
                height={40}
                className="rounded-lg"
              />
              <span className="text-xl font-semibold text-foreground hidden sm:block">
                Journey Home
              </span>
            </Link>
          </div>

          {/* Desktop Navigation */}
          {user && (
            <div className="hidden md:flex items-center gap-1">
              {allNavItems.map((item) => {
                const Icon = item.icon;
                const isActive = pathname.startsWith(item.href);
                return (
                  <Link
                    key={item.href}
                    href={item.href}
                    className={`
                      flex items-center gap-2 px-3 py-2 rounded-lg
                      text-sm font-medium transition-colors
                      ${
                        isActive
                          ? "bg-primary text-primary-foreground"
                          : "text-muted-foreground hover:text-foreground hover:bg-muted"
                      }
                    `}
                  >
                    <Icon className="w-4 h-4" />
                    {item.label}
                  </Link>
                );
              })}
            </div>
          )}

          {/* Right side */}
          <div className="flex items-center gap-3">
            {user ? (
              <>
                <button className="relative p-2 text-muted-foreground hover:text-foreground transition-colors">
                  <Bell className="w-5 h-5" />
                  <span className="absolute top-1 right-1 w-2 h-2 bg-accent rounded-full" />
                </button>
                <Link href="/profile" className="flex items-center gap-2">
                  <Avatar
                    src={user.avatar}
                    alt={user.name}
                    size="sm"
                  />
                </Link>
                {/* Mobile menu button */}
                <button
                  className="md:hidden p-2 text-muted-foreground hover:text-foreground"
                  onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
                >
                  {mobileMenuOpen ? (
                    <X className="w-6 h-6" />
                  ) : (
                    <Menu className="w-6 h-6" />
                  )}
                </button>
              </>
            ) : (
              <div className="flex items-center gap-2">
                <Link
                  href="/login"
                  className="px-4 py-2 text-sm font-medium text-foreground hover:text-primary transition-colors"
                >
                  Sign In
                </Link>
                <Link
                  href="/signup"
                  className="px-4 py-2 text-sm font-medium bg-primary text-primary-foreground rounded-lg hover:bg-primary/90 transition-colors"
                >
                  Get Started
                </Link>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Mobile Navigation */}
      {user && mobileMenuOpen && (
        <div className="md:hidden border-t border-border bg-card">
          <div className="px-4 py-3 space-y-1">
            {allNavItems.map((item) => {
              const Icon = item.icon;
              const isActive = pathname.startsWith(item.href);
              return (
                <Link
                  key={item.href}
                  href={item.href}
                  onClick={() => setMobileMenuOpen(false)}
                  className={`
                    flex items-center gap-3 px-3 py-3 rounded-lg
                    text-base font-medium transition-colors
                    ${
                      isActive
                        ? "bg-primary text-primary-foreground"
                        : "text-muted-foreground hover:text-foreground hover:bg-muted"
                    }
                  `}
                >
                  <Icon className="w-5 h-5" />
                  {item.label}
                </Link>
              );
            })}
          </div>
        </div>
      )}
    </nav>
  );
}
