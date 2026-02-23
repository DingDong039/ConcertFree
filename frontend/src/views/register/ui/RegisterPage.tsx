// frontend/src/views/register/ui/RegisterPage.tsx
'use client';

import Link from 'next/link';
import { Music, CheckCircle } from 'lucide-react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/shared/ui';
import { RegisterForm } from '@/features/auth';
import { ROUTES, APP_NAME } from '@/shared/config';

export function RegisterPage() {
  return (
    <div className="min-h-screen flex">
      {/* Left Side - Decorative */}
      <div className="hidden lg:flex lg:w-1/2 hero-gradient relative overflow-hidden">
        {/* Background decoration */}
        <div className="absolute inset-0 overflow-hidden pointer-events-none">
          <div className="absolute -top-1/2 -right-1/4 w-96 h-96 bg-white/10 rounded-full blur-3xl" />
          <div className="absolute -bottom-1/4 -left-1/4 w-72 h-72 bg-orange-400/20 rounded-full blur-3xl" />
        </div>

        <div className="flex flex-col justify-center items-center w-full p-12 relative z-10 text-white">
          <div className="w-20 h-20 bg-white/20 backdrop-blur-sm rounded-2xl flex items-center justify-center mb-8">
            <Music className="w-10 h-10" />
          </div>
          <h1 className="text-4xl font-heading font-bold mb-4 text-center">
            Join {APP_NAME}
          </h1>
          <p className="text-xl opacity-90 text-center max-w-md">
            Create your account and start booking tickets today
          </p>

          {/* Benefits */}
          <div className="mt-12 space-y-4">
            {[
              'Instant access to all concerts',
              'Secure and easy booking',
              'Exclusive member discounts',
              'Early access to new events',
            ].map((benefit, index) => (
              <div key={index} className="flex items-center gap-3">
                <CheckCircle className="w-5 h-5 text-emerald-300" />
                <span className="text-sm opacity-90">{benefit}</span>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Right Side - Register Form */}
      <div className="flex-1 flex items-center justify-center px-4 py-12 bg-background">
        <div className="w-full max-w-md">
          {/* Mobile Logo */}
          <div className="lg:hidden text-center mb-8">
            <div className="w-16 h-16 bg-primary/10 rounded-2xl flex items-center justify-center mx-auto mb-4">
              <Music className="w-8 h-8 text-primary" />
            </div>
            <h1 className="text-2xl font-heading font-bold text-primary">
              {APP_NAME}
            </h1>
          </div>

          <Card className="border-slate-200 dark:border-slate-700">
            <CardHeader className="text-center pb-2">
              <CardTitle className="text-2xl font-heading">Create Account</CardTitle>
              <CardDescription>
                Fill in your details to get started
              </CardDescription>
            </CardHeader>
            <CardContent>
              <RegisterForm />

              <div className="mt-6 text-center text-sm text-muted-foreground">
                Already have an account?{' '}
                <Link
                  href={ROUTES.LOGIN}
                  className="text-primary hover:text-primary/80 font-medium transition-colors"
                >
                  Sign in
                </Link>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
