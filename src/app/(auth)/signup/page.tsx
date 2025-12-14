"use client";

import Link from "next/link";
import Image from "next/image";
import { Card, CardHeader, CardTitle, CardDescription, CardContent, Button } from "@/components/ui";
import { Mail } from "lucide-react";

export default function SignupPage() {
  return (
    <div className="min-h-screen bg-background flex items-center justify-center px-4 py-12">
      <div className="w-full max-w-md">
        <div className="text-center mb-8">
          <Link href="/" className="inline-block">
            <Image
              src="/Journey-Home_White_Simple.png"
              alt="Journey Home"
              width={80}
              height={80}
              className="mx-auto rounded-xl shadow-md"
            />
          </Link>
          <h1 className="mt-4 text-2xl font-bold text-foreground">Journey Home</h1>
        </div>

        <Card variant="elevated">
          <CardHeader className="text-center">
            <div className="mx-auto w-16 h-16 bg-primary/10 rounded-full flex items-center justify-center mb-4">
              <Mail className="w-8 h-8 text-primary" />
            </div>
            <CardTitle>Invite Only</CardTitle>
            <CardDescription>
              Journey Home is a sacred, invite-only community
            </CardDescription>
          </CardHeader>
          <CardContent className="text-center">
            <p className="text-muted-foreground mb-6">
              To join a cohort, you&apos;ll need an invitation from an administrator.
              If you&apos;ve received an invitation email, click the link in that email
              to set up your account.
            </p>

            <p className="text-sm text-muted-foreground mb-6">
              If you believe you should have received an invitation, please contact
              your cohort leader or administrator.
            </p>

            <Link href="/login">
              <Button variant="outline" className="w-full">
                Already have an account? Sign in
              </Button>
            </Link>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
