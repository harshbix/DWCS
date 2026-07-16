'use client';

import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as zod from 'zod';
import { createBrowserSupabaseClient } from '@/lib/supabase/browser';
import { toast } from '@/utils/toast';
import { Leaf, Eye, EyeOff, ArrowRight } from 'lucide-react';

const loginSchema = zod.object({
  email: zod.string().email('Please enter a valid email address'),
  password: zod.string().min(6, 'Password must be at least 6 characters'),
});

type LoginFormValues = zod.infer<typeof loginSchema>;

export default function LoginPage() {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const supabase = createBrowserSupabaseClient();

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<LoginFormValues>({
    resolver: zodResolver(loginSchema),
    defaultValues: { email: '', password: '' },
  });

  const handleGoogleSignIn = async () => {
    try {
      const { error } = await supabase.auth.signInWithOAuth({
        provider: 'google',
        options: {
          redirectTo: `${window.location.origin}/auth/callback`,
        },
      });
      if (error) toast.error('Google Sign In Failed', error.message);
    } catch (err: any) {
      toast.error('Connection Error', err.message || 'An unexpected error occurred.');
    }
  };

  const onSubmit = async (values: LoginFormValues) => {
    setLoading(true);

    // Dummy Auth Bypass
    if (values.password === 'password123') {
      let role = 'citizen';
      if (values.email.includes('admin')) role = 'admin';
      else if (values.email.includes('driver')) role = 'driver';
      else if (values.email.includes('supervisor')) role = 'supervisor';

      document.cookie = `user-role=${role}; path=/; max-age=3600`;
      document.cookie = `dummy-auth=true; path=/; max-age=3600`;
      document.cookie = `dummy-email=${values.email}; path=/; max-age=3600`;

      toast.success('Welcome back!', `Signed in successfully as ${role}.`);
      router.push(`/${role}`);
      return;
    }

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
        const { data: rolesData } = await supabase
          .from('user_roles')
          .select('roles(name)')
          .eq('profile_id', data.user.id)
          .is('deleted_at', null);

        const roles: string[] = (rolesData ?? [])
          .map((r: any) => r.roles?.name as string)
          .filter(Boolean);

        toast.success('Welcome back!', 'Signed in successfully.');

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
    <div className="min-h-screen bg-gradient-to-br from-primary/5 via-background to-secondary/5 flex">
      {/* Left branding panel — desktop only */}
      <div className="hidden lg:flex flex-col justify-between w-[420px] shrink-0 bg-primary p-10">
        <div className="flex items-center gap-3">
          <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-white/20">
            <Leaf className="h-5 w-5 text-white" />
          </div>
          <div>
            <p className="font-bold text-base text-white leading-tight">EcoCollect</p>
            <p className="text-[10px] text-white/60 font-medium tracking-widest uppercase">
              Mbeya · MWMA
            </p>
          </div>
        </div>

        <div>
          <blockquote className="text-2xl font-bold text-white leading-snug">
            "A cleaner Mbeya starts with every collection."
          </blockquote>
          <p className="mt-4 text-sm text-white/60 leading-relaxed">
            The Mbeya Municipal Waste Management Authority's digital platform for citizens, collectors, and administrators.
          </p>
        </div>

        <div className="flex flex-col gap-3">
          {[
            { label: 'Registered Citizens', value: '24,000+' },
            { label: 'Daily Collections', value: '1,200+' },
            { label: 'Zones Covered', value: '18' },
          ].map((stat) => (
            <div key={stat.label} className="flex items-center justify-between border-t border-white/10 pt-3">
              <span className="text-xs text-white/60">{stat.label}</span>
              <span className="text-sm font-bold text-white">{stat.value}</span>
            </div>
          ))}
        </div>
      </div>

      {/* Right form panel */}
      <div className="flex-1 flex flex-col items-center justify-center p-6 relative">
        {/* Background decoration */}
        <div className="pointer-events-none absolute inset-0 overflow-hidden">
          <div className="absolute -top-40 -right-40 h-96 w-96 rounded-full bg-primary/6 blur-3xl" />
          <div className="absolute -bottom-40 -left-40 h-96 w-96 rounded-full bg-secondary/6 blur-3xl" />
        </div>

        <div className="relative w-full max-w-md">
          {/* Mobile logo */}
          <div className="flex lg:hidden items-center justify-center gap-3 mb-8">
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-primary shadow-lg">
              <Leaf className="h-5 w-5 text-white" />
            </div>
            <div>
              <p className="font-bold text-base text-on-surface leading-tight">EcoCollect</p>
              <p className="text-[10px] text-on-surface/50 font-medium tracking-widest uppercase">
                Mbeya · MWMA
              </p>
            </div>
          </div>

          <div className="rounded-2xl border border-outline/10 bg-surface-container-lowest/90 backdrop-blur-sm shadow-xl p-8">
            <h1 className="text-2xl font-bold text-on-surface">Welcome back</h1>
            <p className="mt-1 text-sm text-on-surface/50">
              Sign in to your EcoCollect account
            </p>

            {/* Google Sign In — prominent placement */}
            <button
              type="button"
              onClick={handleGoogleSignIn}
              className="mt-6 w-full flex items-center justify-center gap-2.5 h-11 rounded-xl border border-outline/20 bg-surface hover:bg-surface-container-low active:scale-[0.98] transition-all duration-150 text-sm font-semibold text-on-surface cursor-pointer"
            >
              <svg className="h-4 w-4 shrink-0" viewBox="0 0 24 24" aria-hidden="true">
                <path
                  fill="#EA4335"
                  d="M5.266 9.765C6.2 6.939 8.854 4.91 12 4.91c1.69 0 3.218.614 4.418 1.636l3.491-3.49C17.81 1.161 15.041 0 12 0 7.296 0 3.252 2.695 1.255 6.634L5.266 9.765Z"
                />
                <path
                  fill="#4285F4"
                  d="M23.682 12.273c0-.882-.082-1.682-.228-2.455H12v4.636h6.559c-.278 1.514-1.132 2.796-2.414 3.655l3.968 3.077C22.427 19.05 23.682 15.955 23.682 12.273Z"
                />
                <path
                  fill="#FBBC05"
                  d="M5.266 14.235 1.255 17.366C3.252 21.305 7.296 24 12 24c3.041 0 5.81-1.16 7.91-3.055l-3.941-3.077c-1.09.733-2.427 1.222-3.969 1.222-3.145 0-5.8-2.03-6.734-4.855Z"
                />
                <path
                  fill="#34A853"
                  d="M12 19.09c1.514 0 2.85-.49 3.941-1.222L19.91 20.945C17.81 22.838 15.041 24 12 24c-4.704 0-8.748-2.695-10.745-6.634l4.011-3.131C6.2 17.061 8.854 19.09 12 19.09Z"
                />
              </svg>
              Continue with Google
            </button>

            {/* Divider */}
            <div className="relative flex items-center my-5">
              <div className="flex-grow border-t border-outline/10" />
              <span className="mx-4 text-[10px] text-on-surface/40 font-bold uppercase tracking-wider">
                or sign in with email
              </span>
              <div className="flex-grow border-t border-outline/10" />
            </div>

            <form onSubmit={handleSubmit(onSubmit)} className="flex flex-col gap-4">
              {/* Email */}
              <div className="flex flex-col gap-1.5">
                <label className="text-xs font-semibold text-on-surface/60" htmlFor="login-email">
                  Email Address
                </label>
                <input
                  id="login-email"
                  type="email"
                  autoComplete="email"
                  className="w-full rounded-xl border border-outline/20 bg-surface px-3.5 py-2.5 text-sm text-on-surface placeholder:text-on-surface/30 outline-none focus:border-primary focus:ring-2 focus:ring-primary/10 transition-all"
                  placeholder="resident@domain.tz"
                  {...register('email')}
                />
                {errors.email && (
                  <span className="text-[10px] text-error font-medium">{errors.email.message}</span>
                )}
              </div>

              {/* Password */}
              <div className="flex flex-col gap-1.5">
                <label
                  className="text-xs font-semibold text-on-surface/60"
                  htmlFor="login-password"
                >
                  Password
                </label>
                <div className="relative">
                  <input
                    id="login-password"
                    type={showPassword ? 'text' : 'password'}
                    autoComplete="current-password"
                    className="w-full rounded-xl border border-outline/20 bg-surface px-3.5 py-2.5 pr-10 text-sm text-on-surface placeholder:text-on-surface/30 outline-none focus:border-primary focus:ring-2 focus:ring-primary/10 transition-all"
                    placeholder="••••••••"
                    {...register('password')}
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-on-surface/40 hover:text-on-surface/70 transition-colors"
                    aria-label="Toggle password visibility"
                  >
                    {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                  </button>
                </div>
                {errors.password && (
                  <span className="text-[10px] text-error font-medium">
                    {errors.password.message}
                  </span>
                )}
              </div>

              {/* Submit */}
              <button
                type="submit"
                disabled={loading}
                className="mt-1 w-full flex items-center justify-center gap-2 h-11 rounded-xl bg-primary text-white font-semibold text-sm hover:bg-primary/90 active:scale-[0.98] transition-all duration-150 disabled:opacity-60 disabled:cursor-not-allowed shadow-sm"
              >
                {loading ? (
                  <span className="h-4 w-4 animate-spin rounded-full border-2 border-white border-t-transparent" />
                ) : (
                  <>
                    Sign In
                    <ArrowRight className="h-4 w-4" />
                  </>
                )}
              </button>
            </form>

            <p className="mt-6 text-center text-xs text-on-surface/40">
              Don't have an account?{' '}
              <button
                onClick={() => router.push('/register')}
                className="font-semibold text-primary hover:underline underline-offset-2"
              >
                Create one
              </button>
            </p>
          </div>

          <p className="mt-6 text-center text-[10px] text-on-surface/30">
            © {new Date().getFullYear()} EcoCollect Tanzania · MWMA. All rights reserved.
          </p>
        </div>
      </div>
    </div>
  );
}
