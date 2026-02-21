// frontend/src/features/auth/ui/LoginForm.tsx
'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { toast } from 'sonner';
import { Mail, Lock, Loader2 } from 'lucide-react';
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
} from '@/shared/ui';
import { useAuthStore } from '../model';
import { ROUTES } from '@/shared/config';

const loginSchema = z.object({
  email: z.string().email('Invalid email address'),
  password: z.string().min(6, 'Password must be at least 6 characters'),
});

type LoginFormData = z.infer<typeof loginSchema>;

export function LoginForm() {
  const router = useRouter();
  const { login, isLoading, error, setError } = useAuthStore();

  const form = useForm<LoginFormData>({
    resolver: zodResolver(loginSchema),
    defaultValues: {
      email: '',
      password: '',
    },
  });

  const onSubmit = async (data: LoginFormData) => {
    try {
      await login(data.email, data.password);
      toast.success('Welcome back!', {
        description: 'You have been signed in successfully.',
      });
      router.push(ROUTES.CONCERTS);
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Login failed';
      setError(message);
      toast.error('Login failed', {
        description: message,
      });
    }
  };

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
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
          {isLoading ? 'Signing in...' : 'Sign In'}
        </Button>
      </form>
    </Form>
  );
}
