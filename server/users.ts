"use server";

import { auth } from "@/lib/auth";
import { redirect } from "next/navigation";

// Use types from your schema for better safety
export const signInAction = async (data: { email: string; password: string }) => {
  try {
    await auth.api.signInEmail({
      body: {
        email: data.email,
        password: data.password,
      },
    });
  } catch (error) {
    throw new Error("Invalid credentials or server error");
  }
  
  // Redirecting after successful login
  redirect("/dashboard");
};

export const signUpAction = async (data: { email: string; password: string; name: string }) => {
  try {
    await auth.api.signUpEmail({
      body: {
        email: data.email,
        password: data.password,
        name: data.name,
      },
    });
  } catch (error) {
    throw new Error("Could not create account");
  }
  
  redirect("/dashboard");
};