"use client";

import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import toast from "react-hot-toast"; 
import { useState } from "react";
import Image from "next/image";

// Corrected Hugeicons Imports
import { HugeiconsIcon } from "@hugeicons/react";
import { 
  Tick02Icon, 
  Cancel01Icon, 
  ArrowDown01Icon,
  Loading03Icon // Added for loading state
} from "@hugeicons/core-free-icons";

import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Field,
  FieldGroup,
  FieldLabel,
  FieldSeparator,
  FieldDescription
} from "@/components/ui/field";

import Logo from "../app/media/logo.webp";
import { signInAction } from "@/server/users";

const formSchema = z.object({
  email: z.string().email("Please enter a valid email"),
  password: z.string().min(5, "Password must be at least 5 characters"),
});

type FormData = z.infer<typeof formSchema>;

export function LoginForm({ className, ...props }: React.ComponentProps<"div">) {
  const [isLoading, setIsLoading] = useState(false);

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<FormData>({
    resolver: zodResolver(formSchema),
    defaultValues: { email: "", password: "" },
  });

  const onSubmit = async (data: FormData) => {
    setIsLoading(true);
    // Create a toast ID so we can update it based on the result
    const toastId = toast.loading("Verifying credentials...");
    
    try {
      await signInAction(data);
      // Success case
      toast.success("Login successfully!", { id: toastId });
    } catch (error: any) {
      // Error case (e.g., wrong password)
      toast.error(error.message || "Incorrect email or password", { id: toastId });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className={cn("flex flex-col gap-6", className)} {...props}>
      <form onSubmit={handleSubmit(onSubmit)}>
        <FieldGroup>
          <div className="flex flex-col items-center gap-2 text-center">
            <div className="flex size-16 items-center justify-center rounded-md">
              <Image src={Logo} alt="Logo" className="h-14 w-auto" priority />
            </div>
            <h1 className="text-xl font-bold flex items-center justify-center gap-2">
              Login to Topper View 
              
            </h1>
          </div>

          <Field>
            <FieldLabel htmlFor="email">Email</FieldLabel>
            <Input
              {...register("email")}
              id="email"
              placeholder="name@example.com"
              disabled={isLoading}
              className={errors.email ? "border-red-500" : ""}
            />
            {errors.email && (
              <p className="text-xs text-red-500 mt-1 flex items-center gap-1">
                <HugeiconsIcon icon={Cancel01Icon} size={12} /> 
                {errors.email.message}
              </p>
            )}
          </Field>

          <Field>
            <FieldLabel htmlFor="password">Password</FieldLabel>
            <Input
              {...register("password")}
              id="password"
              placeholder="password"
              type="password"
              disabled={isLoading}
              className={errors.password ? "border-red-500" : ""}
            />
            {errors.password && (
              <p className="text-xs text-red-500 mt-1 flex items-center gap-1">
                <HugeiconsIcon icon={Cancel01Icon} size={12} /> 
                {errors.password.message}
              </p>
            )}
          </Field>

          <Button type="submit" className="w-full" disabled={isLoading}>
            {isLoading ? (
              <span className="flex items-center gap-2">
                <HugeiconsIcon icon={Loading03Icon} className="animate-spin" size={18} />
                Signing in...
              </span>
            ) : (
              "Login"
            )}
          </Button>

          <FieldSeparator>Or</FieldSeparator>

          <Button variant="outline" type="button" className="w-full" disabled={isLoading}>
             Continue with Google
          </Button>
        </FieldGroup>
      </form>

      <FieldDescription className="px-6 text-center">
        By clicking continue, you agree to our <a href="#" className="underline">Terms of Service</a>{" "}
        and <a href="#" className="underline">Privacy Policy</a>.
      </FieldDescription>
    </div>
  );
}