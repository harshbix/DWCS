'use client';

import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as zod from 'zod';
import { createBrowserSupabaseClient } from '@/lib/supabase/browser';
import { toast } from '@/utils/toast';
import { Leaf, User, Truck, Eye, EyeOff, ArrowRight, Chrome } from 'lucide-react';

const registerSchema = zod
  .object({
    fullName: zod.string().min(3, 'Full name must be at least 3 characters'),
    email: zod.string().email('Please enter a valid email address'),
    phone: zod.string().min(10, 'Please enter a valid phone number'),
    role: zod.enum(['citizen', 'driver']),
    address: zod.string().optional(),
    licenseNumber: zod.string().optional(),
    password: zod.string().min(6, 'Password must be at least 6 characters'),
    confirmPassword: zod.string().min(6, 'Please confirm your password'),
  })
  .refine((data) => data.password === data.confirmPassword, {
    message: 'Passwords do not match',
    path: ['confirmPassword'],
  })
  .refine((data) => (data.role === 'citizen' ? !!data.address : true), {
    message: 'Address is required for citizens',
    path: ['address'],
  })
  .refine((data) => (data.role === 'driver' ? !!data.licenseNumber : true), {
    message: 'Driver license number is required',
    path: ['licenseNumber'],
  });

type RegisterFormValues = zod.infer<typeof registerSchema>;

export default function RegisterPage() {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [activeRole, setActiveRole] = useState<'citizen' | 'driver'>('citizen');
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const supabase = createBrowserSupabaseClient();

  const {
    register,
    handleSubmit,
    setValue,
    formState: { errors },
  } = useForm<RegisterFormValues>({
    resolver: zodResolver(registerSchema),
    defaultValues: {
      fullName: '',
      email: '',
      phone: '',
      role: 'citizen',
      address: '',
      licenseNumber: '',
      password: '',
      confirmPassword: '',
    },
  });

  const handleRoleToggle = (role: 'citizen' | 'driver') => {
    setActiveRole(role);
    setValue('role', role);
  };

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

  const onSubmit = async (values: RegisterFormValues) => {
    setLoading(true);
    try {
      const { data, error } = await supabase.auth.signUp({
        email: values.email,
        password: values.password,
        options: {
          data: {
            full_name: values.fullName,
            phone: values.phone,
            role: values.role,
            address: values.role === 'citizen' ? values.address : null,
            license_number: values.role === 'driver' ? values.licenseNumber : null,
          },
        },
      });

      if (error) {
        toast.error('Registration Failed', error.message);
        setLoading(false);
        return;
      }

      if (data.user) {
        toast.success('Welcome to EcoCollect!', 'Your account has been created.');
        // Auto sign in and navigate to citizen home
        router.push('/citizen');
      }
    } catch (err: any) {
      toast.error('Connection Error', err.message || 'An unexpected error occurred.');
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-primary/5 via-background to-secondary/5 flex items-center justify-center p-4">
      {/* Background decoration */}
      <div className="pointer-events-none fixed inset-0 overflow-hidden">
        <div className="absolute -top-40 -right-40 h-96 w-96 rounded-full bg-primary/8 blur-3xl" />
        <div className="absolute -bottom-40 -left-40 h-96 w-96 rounded-full bg-secondary/8 blur-3xl" />
      </div>

      <div className="relative w-full max-w-lg">
        {/* Logo */}
        <div className="flex items-center justify-center gap-3 mb-8">
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

        {/* Card */}
        <div className="rounded-2xl border border-outline/10 bg-surface-container-lowest/90 backdrop-blur-sm shadow-xl p-8">
          <h1 className="text-2xl font-bold text-on-surface text-center">Create Account</h1>
          <p className="mt-1 text-sm text-on-surface/50 text-center">
            Join EcoCollect as a citizen or collector
          </p>

          {/* Role Toggle */}
          <div className="mt-6 flex gap-2 rounded-xl bg-surface-container p-1">
            <button
              type="button"
              onClick={() => handleRoleToggle('citizen')}
              className={`flex-1 flex items-center justify-center gap-2 py-2.5 rounded-lg text-sm font-semibold transition-all duration-200 ${
                activeRole === 'citizen'
                  ? 'bg-primary text-white shadow-sm'
                  : 'text-on-surface/50 hover:text-on-surface'
              }`}
            >
              <User className="h-4 w-4" />
              Citizen
            </button>
            <button
              type="button"
              onClick={() => handleRoleToggle('driver')}
              className={`flex-1 flex items-center justify-center gap-2 py-2.5 rounded-lg text-sm font-semibold transition-all duration-200 ${
                activeRole === 'driver'
                  ? 'bg-primary text-white shadow-sm'
                  : 'text-on-surface/50 hover:text-on-surface'
              }`}
            >
              <Truck className="h-4 w-4" />
              Collector
            </button>
          </div>

          <form onSubmit={handleSubmit(onSubmit)} className="mt-6 flex flex-col gap-4">
            {/* Full Name + Phone */}
            <div className="grid grid-cols-2 gap-3">
              <div className="flex flex-col gap-1.5">
                <label className="text-xs font-semibold text-on-surface/60" htmlFor="reg-fullName">
                  Full Name
                </label>
                <input
                  id="reg-fullName"
                  type="text"
                  className="w-full rounded-xl border border-outline/20 bg-surface px-3.5 py-2.5 text-sm text-on-surface placeholder:text-on-surface/30 outline-none focus:border-primary focus:ring-2 focus:ring-primary/10 transition-all"
                  placeholder="Elias Mwakalebela"
                  {...register('fullName')}
                />
                {errors.fullName && (
                  <span className="text-[10px] text-error font-medium">{errors.fullName.message}</span>
                )}
              </div>

              <div className="flex flex-col gap-1.5">
                <label className="text-xs font-semibold text-on-surface/60" htmlFor="reg-phone">
                  Phone
                </label>
                <input
                  id="reg-phone"
                  type="tel"
                  className="w-full rounded-xl border border-outline/20 bg-surface px-3.5 py-2.5 text-sm text-on-surface placeholder:text-on-surface/30 outline-none focus:border-primary focus:ring-2 focus:ring-primary/10 transition-all"
                  placeholder="+255 783 222 111"
                  {...register('phone')}
                />
                {errors.phone && (
                  <span className="text-[10px] text-error font-medium">{errors.phone.message}</span>
                )}
              </div>
            </div>

            {/* Email */}
            <div className="flex flex-col gap-1.5">
              <label className="text-xs font-semibold text-on-surface/60" htmlFor="reg-email">
                Email Address
              </label>
              <input
                id="reg-email"
                type="email"
                className="w-full rounded-xl border border-outline/20 bg-surface px-3.5 py-2.5 text-sm text-on-surface placeholder:text-on-surface/30 outline-none focus:border-primary focus:ring-2 focus:ring-primary/10 transition-all"
                placeholder="resident@domain.tz"
                {...register('email')}
              />
              {errors.email && (
                <span className="text-[10px] text-error font-medium">{errors.email.message}</span>
              )}
            </div>

            {/* Role-specific field */}
            {activeRole === 'citizen' && (
              <div className="flex flex-col gap-1.5">
                <label className="text-xs font-semibold text-on-surface/60" htmlFor="reg-address">
                  Physical Address
                </label>
                <input
                  id="reg-address"
                  type="text"
                  className="w-full rounded-xl border border-outline/20 bg-surface px-3.5 py-2.5 text-sm text-on-surface placeholder:text-on-surface/30 outline-none focus:border-primary focus:ring-2 focus:ring-primary/10 transition-all"
                  placeholder="Plot 42, Mbeya Urban Ward"
                  {...register('address')}
                />
                {errors.address && (
                  <span className="text-[10px] text-error font-medium">{errors.address.message}</span>
                )}
              </div>
            )}

            {activeRole === 'driver' && (
              <div className="flex flex-col gap-1.5">
                <label className="text-xs font-semibold text-on-surface/60" htmlFor="reg-license">
                  Driver License No.
                </label>
                <input
                  id="reg-license"
                  type="text"
                  className="w-full rounded-xl border border-outline/20 bg-surface px-3.5 py-2.5 text-sm text-on-surface placeholder:text-on-surface/30 outline-none focus:border-primary focus:ring-2 focus:ring-primary/10 transition-all"
                  placeholder="DL-99882741"
                  {...register('licenseNumber')}
                />
                {errors.licenseNumber && (
                  <span className="text-[10px] text-error font-medium">
                    {errors.licenseNumber.message}
                  </span>
                )}
              </div>
            )}

            {/* Password fields */}
            <div className="grid grid-cols-2 gap-3">
              <div className="flex flex-col gap-1.5">
                <label className="text-xs font-semibold text-on-surface/60" htmlFor="reg-password">
                  Password
                </label>
                <div className="relative">
                  <input
                    id="reg-password"
                    type={showPassword ? 'text' : 'password'}
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
                  <span className="text-[10px] text-error font-medium">{errors.password.message}</span>
                )}
              </div>

              <div className="flex flex-col gap-1.5">
                <label
                  className="text-xs font-semibold text-on-surface/60"
                  htmlFor="reg-confirmPassword"
                >
                  Confirm
                </label>
                <div className="relative">
                  <input
                    id="reg-confirmPassword"
                    type={showConfirmPassword ? 'text' : 'password'}
                    className="w-full rounded-xl border border-outline/20 bg-surface px-3.5 py-2.5 pr-10 text-sm text-on-surface placeholder:text-on-surface/30 outline-none focus:border-primary focus:ring-2 focus:ring-primary/10 transition-all"
                    placeholder="••••••••"
                    {...register('confirmPassword')}
                  />
                  <button
                    type="button"
                    onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-on-surface/40 hover:text-on-surface/70 transition-colors"
                    aria-label="Toggle confirm password visibility"
                  >
                    {showConfirmPassword ? (
                      <EyeOff className="h-4 w-4" />
                    ) : (
                      <Eye className="h-4 w-4" />
                    )}
                  </button>
                </div>
                {errors.confirmPassword && (
                  <span className="text-[10px] text-error font-medium">
                    {errors.confirmPassword.message}
                  </span>
                )}
              </div>
            </div>

            {/* Submit Button */}
            <button
              type="submit"
              disabled={loading}
              className="mt-2 w-full flex items-center justify-center gap-2 h-11 rounded-xl bg-primary text-white font-semibold text-sm hover:bg-primary/90 active:scale-[0.98] transition-all duration-150 disabled:opacity-60 disabled:cursor-not-allowed shadow-sm"
            >
              {loading ? (
                <span className="h-4 w-4 animate-spin rounded-full border-2 border-white border-t-transparent" />
              ) : (
                <>
                  Create Account
                  <ArrowRight className="h-4 w-4" />
                </>
              )}
            </button>

            {/* Divider */}
            <div className="relative flex items-center">
              <div className="flex-grow border-t border-outline/10" />
              <span className="mx-4 text-[10px] text-on-surface/40 font-bold uppercase tracking-wider">
                or
              </span>
              <div className="flex-grow border-t border-outline/10" />
            </div>

            {/* Google Sign In */}
            <button
              type="button"
              onClick={handleGoogleSignIn}
              className="w-full flex items-center justify-center gap-2.5 h-11 rounded-xl border border-outline/20 bg-surface hover:bg-surface-container-low active:scale-[0.98] transition-all duration-150 text-sm font-semibold text-on-surface cursor-pointer"
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
          </form>

          <p className="mt-6 text-center text-xs text-on-surface/40">
            Already have an account?{' '}
            <button
              onClick={() => router.push('/login')}
              className="font-semibold text-primary hover:underline underline-offset-2"
            >
              Sign in
            </button>
          </p>
        </div>

        <p className="mt-6 text-center text-[10px] text-on-surface/30">
          © {new Date().getFullYear()} EcoCollect Tanzania · MWMA. All rights reserved.
        </p>
      </div>
    </div>
  );
}
