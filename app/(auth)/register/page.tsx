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
const registerSchema = zod
  .object({
    fullName: zod.string().min(3, 'Full name must be at least 3 characters'),
    email: zod.string().email('Please enter a valid email address'),
    phone: zod.string().min(10, 'Please enter a valid phone number (at least 10 digits)'),
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
    message: 'Driver license is required for waste collectors',
    path: ['licenseNumber'],
  });

type RegisterFormValues = zod.infer<typeof registerSchema>;

export default function RegisterPage() {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [activeRole, setActiveRole] = useState<'citizen' | 'driver'>('citizen');
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
        toast.success('Registration Successful', 'Welcome to EcoCollect Tanzania.');
        // Sign in immediately or redirect to login
        router.push('/login');
      }
    } catch (err: any) {
      toast.error('Connection Error', err.message || 'An unexpected error occurred.');
      setLoading(false);
    }
  };

  return (
    <PageContainer className="flex min-h-[90vh] flex-col items-center justify-center p-4">
      <div className="w-full max-w-lg rounded-xl border border-outline/10 bg-surface-container-lowest p-8 shadow-lg">
        <h2 className="text-2xl font-bold text-center text-text-primary">Create an Account</h2>
        <p className="text-xs text-text-secondary text-center mt-2">
          EcoCollect Waste Collection Registration Portal
        </p>

        {/* Role Selector Toggle */}
        <div className="mt-6 flex border border-outline/10 rounded-lg p-1 bg-surface-container-low">
          <button
            type="button"
            onClick={() => handleRoleToggle('citizen')}
            className={`flex-1 py-2 text-xs font-bold rounded-md transition-all ${
              activeRole === 'citizen'
                ? 'bg-primary text-white shadow-sm'
                : 'text-text-secondary hover:text-text-primary'
            }`}
          >
            Citizen Resident
          </button>
          <button
            type="button"
            onClick={() => handleRoleToggle('driver')}
            className={`flex-1 py-2 text-xs font-bold rounded-md transition-all ${
              activeRole === 'driver'
                ? 'bg-primary text-white shadow-sm'
                : 'text-text-secondary hover:text-text-primary'
            }`}
          >
            Collector Driver
          </button>
        </div>

        <form onSubmit={handleSubmit(onSubmit)} className="mt-6 flex flex-col gap-4">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="flex flex-col gap-1.5">
              <label className="text-xs font-semibold text-text-secondary" htmlFor="fullName">
                Full Name
              </label>
              <input
                id="fullName"
                type="text"
                className="w-full rounded-lg border border-outline/20 bg-surface px-4 py-2.5 text-sm text-text-primary outline-none focus:border-primary"
                placeholder="e.g. Elias Mwakalebela"
                {...register('fullName')}
              />
              {errors.fullName && (
                <span className="text-[10px] text-red-500 font-medium mt-0.5">{errors.fullName.message}</span>
              )}
            </div>

            <div className="flex flex-col gap-1.5">
              <label className="text-xs font-semibold text-text-secondary" htmlFor="phone">
                Phone Number
              </label>
              <input
                id="phone"
                type="tel"
                className="w-full rounded-lg border border-outline/20 bg-surface px-4 py-2.5 text-sm text-text-primary outline-none focus:border-primary"
                placeholder="e.g. +255 783 222 111"
                {...register('phone')}
              />
              {errors.phone && (
                <span className="text-[10px] text-red-500 font-medium mt-0.5">{errors.phone.message}</span>
              )}
            </div>
          </div>

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

          {activeRole === 'citizen' && (
            <div className="flex flex-col gap-1.5">
              <label className="text-xs font-semibold text-text-secondary" htmlFor="address">
                Physical Address
              </label>
              <input
                id="address"
                type="text"
                className="w-full rounded-lg border border-outline/20 bg-surface px-4 py-2.5 text-sm text-text-primary outline-none focus:border-primary"
                placeholder="e.g. Plot 42, Congo Street, Kariakoo"
                {...register('address')}
              />
              {errors.address && (
                <span className="text-[10px] text-red-500 font-medium mt-0.5">{errors.address.message}</span>
              )}
            </div>
          )}

          {activeRole === 'driver' && (
            <div className="flex flex-col gap-1.5">
              <label className="text-xs font-semibold text-text-secondary" htmlFor="licenseNumber">
                Driver License Number
              </label>
              <input
                id="licenseNumber"
                type="text"
                className="w-full rounded-lg border border-outline/20 bg-surface px-4 py-2.5 text-sm text-text-primary outline-none focus:border-primary"
                placeholder="e.g. DL-99882741"
                {...register('licenseNumber')}
              />
              {errors.licenseNumber && (
                <span className="text-[10px] text-red-500 font-medium mt-0.5">{errors.licenseNumber.message}</span>
              )}
            </div>
          )}

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
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

            <div className="flex flex-col gap-1.5">
              <label className="text-xs font-semibold text-text-secondary" htmlFor="confirmPassword">
                Confirm Password
              </label>
              <input
                id="confirmPassword"
                type="password"
                className="w-full rounded-lg border border-outline/20 bg-surface px-4 py-2.5 text-sm text-text-primary outline-none focus:border-primary"
                placeholder="••••••••"
                {...register('confirmPassword')}
              />
              {errors.confirmPassword && (
                <span className="text-[10px] text-red-500 font-medium mt-0.5">{errors.confirmPassword.message}</span>
              )}
            </div>
          </div>

          <Button type="submit" isLoading={loading} className="w-full mt-4">
            Register Account
          </Button>
        </form>

        <div className="mt-6 text-center text-xs text-text-secondary">
          Already have an account?{' '}
          <button
            onClick={() => router.push('/login')}
            className="font-semibold text-primary hover:underline"
          >
            Sign in here
          </button>
        </div>
      </div>
    </PageContainer>
  );
}
