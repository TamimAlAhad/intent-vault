"use server";

import { headers } from "next/headers";
import { redirect } from "next/navigation";

import { createSupabaseServerClient } from "@/lib/supabase/server";

function withMessage(path: string, message: string) {
  return `${path}?message=${encodeURIComponent(message)}`;
}

export async function signInAction(formData: FormData) {
  const email = String(formData.get("email") ?? "").trim();
  const password = String(formData.get("password") ?? "").trim();

  if (!email || !password) {
    redirect(withMessage("/login", "Email and password are required."));
  }

  const supabase = await createSupabaseServerClient();
  const { error } = await supabase.auth.signInWithPassword({
    email,
    password
  });

  if (error) {
    redirect(withMessage("/login", error.message));
  }

  redirect("/dashboard");
}

export async function signUpAction(formData: FormData) {
  const email = String(formData.get("email") ?? "").trim();
  const password = String(formData.get("password") ?? "").trim();
  const headerStore = await headers();
  const origin = headerStore.get("origin") ?? "";

  if (!email || !password) {
    redirect(withMessage("/signup", "Email and password are required."));
  }

  if (password.length < 8) {
    redirect(withMessage("/signup", "Use at least 8 characters for your password."));
  }

  const supabase = await createSupabaseServerClient();
  const { data, error } = await supabase.auth.signUp({
    email,
    password,
    options: {
      emailRedirectTo: `${origin}/auth/callback`
    }
  });

  if (error) {
    redirect(withMessage("/signup", error.message));
  }

  if (data.session) {
    redirect("/dashboard");
  }

  redirect(
    withMessage(
      "/signup",
      "Check your email to confirm your account, then come back and log in."
    )
  );
}

export async function signInWithGoogleAction() {
  const headerStore = await headers();
  const origin = headerStore.get("origin") ?? "";
  const supabase = await createSupabaseServerClient();

  const { data, error } = await supabase.auth.signInWithOAuth({
    provider: "google",
    options: {
      redirectTo: `${origin}/auth/callback`
    }
  });

  if (error || !data.url) {
    redirect(withMessage("/login", error?.message ?? "Google sign-in could not start."));
  }

  redirect(data.url);
}

export async function signOutAction() {
  const supabase = await createSupabaseServerClient();
  await supabase.auth.signOut();
  redirect("/");
}
