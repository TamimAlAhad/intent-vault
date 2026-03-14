import Link from "next/link";

import { signInAction, signInWithGoogleAction } from "@/actions/auth";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

interface LoginPageProps {
  searchParams?: Promise<{
    message?: string;
  }>;
}

export default async function LoginPage({ searchParams }: LoginPageProps) {
  const resolvedSearchParams = await searchParams;

  return (
    <Card className="w-full max-w-md border-white/60 bg-white/90 shadow-sm">
      <CardHeader className="space-y-3">
        <CardTitle className="font-serif text-4xl">Welcome back</CardTitle>
        <CardDescription>
          Log in to review your saved items, reminders, and AI summaries.
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-6">
        <form action={signInAction} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="email">Email</Label>
            <Input id="email" name="email" type="email" placeholder="founder@company.com" required />
          </div>
          <div className="space-y-2">
            <Label htmlFor="password">Password</Label>
            <Input id="password" name="password" type="password" placeholder="••••••••" required />
          </div>
          {resolvedSearchParams?.message ? (
            <p className="rounded-2xl bg-secondary px-4 py-3 text-sm text-secondary-foreground">
              {resolvedSearchParams.message}
            </p>
          ) : null}
          <Button type="submit" className="w-full">
            Log in
          </Button>
        </form>

        <form action={signInWithGoogleAction}>
          <Button type="submit" variant="outline" className="w-full">
            Continue with Google
          </Button>
        </form>

        <p className="text-sm text-muted-foreground">
          New here?{" "}
          <Link href="/signup" className="font-medium text-foreground underline underline-offset-4">
            Create an account
          </Link>
        </p>
      </CardContent>
    </Card>
  );
}
