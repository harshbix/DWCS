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
