import Link from "next/link";

import { signInWithGoogleAction, signUpAction } from "@/actions/auth";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

interface SignupPageProps {
  searchParams?: Promise<{
    message?: string;
  }>;
}

export default async function SignupPage({ searchParams }: SignupPageProps) {
  const resolvedSearchParams = await searchParams;

  return (
    <Card className="w-full max-w-md border-white/60 bg-white/90 shadow-sm">
      <CardHeader className="space-y-3">
        <CardTitle className="font-serif text-4xl">Create your vault</CardTitle>
        <CardDescription>
          Start saving screenshots, links, and notes with clear intent attached.
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-6">
        <form action={signUpAction} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="email">Email</Label>
            <Input id="email" name="email" type="email" placeholder="founder@company.com" required />
          </div>
          <div className="space-y-2">
            <Label htmlFor="password">Password</Label>
            <Input
              id="password"
              name="password"
              type="password"
              minLength={8}
              placeholder="Use at least 8 characters"
              required
            />
          </div>
          {resolvedSearchParams?.message ? (
            <p className="rounded-2xl bg-secondary px-4 py-3 text-sm text-secondary-foreground">
              {resolvedSearchParams.message}
            </p>
          ) : null}
          <Button type="submit" className="w-full">
            Create account
          </Button>
        </form>

        <form action={signInWithGoogleAction}>
          <Button type="submit" variant="outline" className="w-full">
            Continue with Google
          </Button>
        </form>

        <p className="text-sm text-muted-foreground">
          Already have an account?{" "}
          <Link href="/login" className="font-medium text-foreground underline underline-offset-4">
            Log in
          </Link>
        </p>
      </CardContent>
    </Card>
  );
}
