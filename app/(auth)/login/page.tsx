'use client';

import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as zod from 'zod';
import { PageContainer } from '@/components/layout/page-container';
import { createBrowserSupabaseClient } from '@/lib/supabase/browser';
import { toast } from '@/utils/toast';
import { Button } from '@/components/ui/button';

// Form validation schema
const loginSchema = zod.object({
  email: zod.string().email('Please enter a valid email address'),
  password: zod.string().min(6, 'Password must be at least 6 characters'),
});

type LoginFormValues = zod.infer<typeof loginSchema>;

export default function LoginPage() {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const supabase = createBrowserSupabaseClient();

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<LoginFormValues>({
    resolver: zodResolver(loginSchema),
    defaultValues: {
      email: '',
      password: '',
    },
  });

  const handleGoogleLogin = async () => {
    try {
      const { error } = await supabase.auth.signInWithOAuth({
        provider: 'google',
        options: {
          redirectTo: `${window.location.origin}/auth/callback`,
        },
      });
      if (error) {
        toast.error('Google Sign In Failed', error.message);
      }
    } catch (err: any) {
      toast.error('Connection Error', err.message || 'An unexpected error occurred.');
    }
  };

  const onSubmit = async (values: LoginFormValues) => {
    setLoading(true);
    try {
      const { data, error } = await supabase.auth.signInWithPassword({
        email: values.email,
        password: values.password,
      });

      if (error) {
        toast.error('Sign In Failed', error.message);
        setLoading(false);
        return;
      }

      if (data.user) {
        // Fetch user roles
        const { data: rolesData, error: rolesError } = await supabase
          .from('user_roles')
          .select('roles(name)')
          .eq('profile_id', data.user.id)
          .is('deleted_at', null);

        if (rolesError) {
          toast.error('Role Load Failed', 'Could not resolve user access level.');
          setLoading(false);
          return;
        }

        const roles: string[] = rolesData?.map((r: any) => r.roles?.name) || [];

        toast.success('Welcome Back', 'Logged in successfully.');

        if (roles.includes('admin') || roles.includes('supervisor')) {
          router.push('/admin');
        } else if (roles.includes('driver')) {
          router.push('/driver');
        } else {
          router.push('/citizen');
        }
      }
    } catch (err: any) {
      toast.error('Connection Error', err.message || 'An unexpected error occurred.');
      setLoading(false);
    }
  };

  return (
    <PageContainer className="flex min-h-[85vh] flex-col items-center justify-center p-4">
      <div className="w-full max-w-md rounded-xl border border-outline/10 bg-surface-container-lowest p-8 shadow-lg">
        <h2 className="text-2xl font-bold text-center text-text-primary">Sign in to EcoCollect</h2>
        <p className="text-xs text-text-secondary text-center mt-2">
          Tanzania Waste Management Authority Authentication Portal
        </p>

        <form onSubmit={handleSubmit(onSubmit)} className="mt-8 flex flex-col gap-4">
          <div className="flex flex-col gap-1.5">
            <label className="text-xs font-semibold text-text-secondary" htmlFor="email">
              Email Address
            </label>
            <input
              id="email"
              type="email"
              className="w-full rounded-lg border border-outline/20 bg-surface px-4 py-2.5 text-sm text-text-primary outline-none focus:border-primary"
              placeholder="e.g. resident@domain.tz"
              {...register('email')}
            />
            {errors.email && (
              <span className="text-[10px] text-red-500 font-medium mt-0.5">{errors.email.message}</span>
            )}
          </div>

          <div className="flex flex-col gap-1.5">
            <label className="text-xs font-semibold text-text-secondary" htmlFor="password">
              Password
            </label>
            <input
              id="password"
              type="password"
              className="w-full rounded-lg border border-outline/20 bg-surface px-4 py-2.5 text-sm text-text-primary outline-none focus:border-primary"
              placeholder="••••••••"
              {...register('password')}
            />
            {errors.password && (
              <span className="text-[10px] text-red-500 font-medium mt-0.5">{errors.password.message}</span>
            )}
          </div>

          <Button type="submit" isLoading={loading} className="w-full mt-2">
            Sign In
          </Button>

          <div className="relative flex py-2 items-center">
            <div className="flex-grow border-t border-outline/10"></div>
            <span className="flex-shrink mx-4 text-[10px] text-text-secondary font-bold uppercase tracking-wider">or</span>
            <div className="flex-grow border-t border-outline/10"></div>
          </div>

          <button
            type="button"
            onClick={handleGoogleLogin}
            className="w-full flex items-center justify-center gap-2 h-10 rounded-lg border border-outline/20 bg-surface hover:bg-surface-container-low transition-colors text-sm font-semibold text-text-primary cursor-pointer"
          >
            <svg className="h-4 w-4 shrink-0" viewBox="0 0 24 24" aria-hidden="true">
              <path
                fill="#EA4335"
                d="M5.26620003,9.76453671 C6.19941199,6.9387413 8.85458379,4.90909091 12,4.90909091 C13.6909091,4.90909091 15.2181818,5.52272727 16.4181818,6.54545455 L19.9090909,3.05454545 C17.8090909,1.16136364 15.0409091,0 12,0 C7.29545455,0 3.25227273,2.69545455 1.25454545,6.63409091 L5.26620003,9.76453671 Z"
              />
              <path
                fill="#4285F4"
                d="M23.6818182,12.2727273 C23.6818182,11.3909091 23.6,10.5909091 23.4545455,9.81818182 L12,9.81818182 L12,14.4545455 L18.5590909,14.4545455 C18.2772727,15.9681818 17.4227273,17.25 16.1409091,18.1090909 L20.1090909,21.1863636 C22.4272727,19.05 23.6818182,15.9545455 23.6818182,12.2727273 Z"
              />
              <path
                fill="#FBBC05"
                d="M5.26620003,14.2354633 L1.25454545,17.3659091 C3.25227273,21.3045455 7.29545455,24 12,24 C15.0409091,24 17.8090909,22.8386364 19.9090909,20.9454545 L15.9409091,17.8681818 C14.85,18.6 13.5136364,19.0909091 12,19.0909091 C8.85458379,19.0909091 6.19941199,17.0612587 5.26620003,14.2354633 Z"
              />
              <path
                fill="#34A853"
                d="M12,19.0909091 C13.5136364,19.0909091 14.85,18.6 15.9409091,17.8681818 L19.9090909,20.9454545 C17.8090909,22.8386364 15.0409091,24 12,24 C7.29545455,24 3.25227273,21.3045455 1.25454545,17.3659091 L5.26620003,14.2354633 C6.19941199,17.0612587 8.85458379,19.0909091 12,19.0909091 Z"
              />
            </svg>
            Continue with Google
          </button>
        </form>

        <div className="mt-6 text-center text-xs text-text-secondary">
          Don't have an account?{' '}
          <button
            onClick={() => router.push('/register')}
            className="font-semibold text-primary hover:underline"
          >
            Register here
          </button>
        </div>
      </div>
    </PageContainer>
  );
}
