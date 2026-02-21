// frontend/src/features/auth/ui/RegisterForm.tsx
"use client";

import { useRouter } from "next/navigation";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { toast } from "sonner";
import { Mail, Lock, User, Loader2 } from "lucide-react";
import {
  Button,
  Input,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
  Form,
  Alert,
} from "@/shared/ui";
import { useAuthStore } from "../model";
import { ROUTES } from "@/shared/config";

const registerSchema = z.object({
  email: z.string().email("Invalid email address"),
  name: z.string().min(2, "Name must be at least 2 characters"),
  password: z.string().min(6, "Password must be at least 6 characters"),
});

type RegisterFormData = z.infer<typeof registerSchema>;

export function RegisterForm() {
  const router = useRouter();
  const { register: registerUser, isLoading, error, setError } = useAuthStore();

  const form = useForm<RegisterFormData>({
    resolver: zodResolver(registerSchema),
    defaultValues: {
      email: "",
      name: "",
      password: "",
    },
  });

  const onSubmit = async (data: RegisterFormData) => {
    try {
      await registerUser(data.email, data.name, data.password);
      toast.success("Account created!", {
        description: "Welcome to GigTix. You can now sign in.",
      });
      router.push(ROUTES.LOGIN);
    } catch (err) {
      const message =
        err instanceof Error ? err.message : "Registration failed";
      setError(message);
      toast.error("Registration failed", {
        description: message,
      });
    }
  };

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
        <FormField
          control={form.control}
          name="name"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Full Name</FormLabel>
              <FormControl>
                <div className="relative">
                  <User className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                  <Input
                    placeholder="John Doe"
                    className="pl-10"
                    type="text"
                    {...field}
                  />
                </div>
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name="email"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Email</FormLabel>
              <FormControl>
                <div className="relative">
                  <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                  <Input
                    placeholder="you@example.com"
                    className="pl-10"
                    type="email"
                    {...field}
                  />
                </div>
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name="password"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Password</FormLabel>
              <FormControl>
                <div className="relative">
                  <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                  <Input
                    placeholder="••••••••"
                    className="pl-10"
                    type="password"
                    {...field}
                  />
                </div>
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        {error && (
          <Alert variant="destructive" className="text-sm">
            {error}
          </Alert>
        )}

        <Button
          type="submit"
          className="w-full bg-cta hover:bg-cta-hover text-white"
          disabled={isLoading}
        >
          {isLoading && <Loader2 className="w-4 h-4 mr-2 animate-spin" />}
          {isLoading ? "Creating account..." : "Create Account"}
        </Button>
      </form>
    </Form>
  );
}
