/**
 * EcoCollect Tanzania — Database & Domain Type Definitions
 * Single source of truth for all Supabase entity shapes and RPC payloads.
 */

// ──────────────────────────────────────────────
// Enums (mirror database ENUMs)
// ──────────────────────────────────────────────

export type UserRoleName = 'citizen' | 'driver' | 'supervisor' | 'admin';
export type ProfileStatus = 'active' | 'suspended' | 'pending';
export type EmploymentStatus = 'active' | 'suspended' | 'off-duty';
export type VehicleStatus = 'active' | 'maintenance' | 'inactive';
export type ComplaintType =
  | 'missed_collection'
  | 'illegal_dumping'
  | 'overflowing_bin'
  | 'damaged_container'
  | 'missed_payment'
  | 'broken_truck'
  | 'hazardous_waste'
  | 'dead_animal'
  | 'blocked_access'
  | 'other';
export type ComplaintStatus = 'pending' | 'investigating' | 'resolved' | 'rejected';
export type PriorityLevel = 'low' | 'medium' | 'high' | 'critical';
export type PaymentStatus = 'pending' | 'paid' | 'failed' | 'refunded';
export type ScheduleStatus = 'scheduled' | 'in_progress' | 'completed' | 'missed' | 'cancelled';
export type NotificationType = 'payment_reminder' | 'announcement' | 'complaint_update';

// ──────────────────────────────────────────────
// Core Entities
// ──────────────────────────────────────────────

export interface Organization {
  id: string;
  name: string;
  region: string | null;
  logo_url: string | null;
  active: boolean;
  created_at: string;
  updated_at: string;
}

export interface UserProfile {
  id: string;
  organization_id: string | null;
  full_name: string;
  phone: string;
  email: string;
  avatar_url: string | null;
  status: ProfileStatus;
  roles: UserRoleName[];
  primaryRole: UserRoleName;
}

export interface Citizen {
  id: string;
  organization_id: string | null;
  address: string;
  profiles?: Pick<UserProfile, 'full_name' | 'phone' | 'email' | 'status'>;
}

export interface Driver {
  id: string;
  organization_id: string | null;
  license_number: string;
  employment_status: EmploymentStatus;
  profiles?: Pick<UserProfile, 'full_name' | 'phone' | 'email'>;
}

export interface Vehicle {
  id: string;
  organization_id: string | null;
  plate_number: string;
  model: string;
  capacity_kg: number | null;
  status: VehicleStatus;
  assigned_driver_id: string | null;
  vehicle_current_location?: VehicleLocation[];
  drivers?: { profiles?: Pick<UserProfile, 'full_name'> } | null;
}

export interface VehicleLocation {
  vehicle_id: string;
  latitude: number;
  longitude: number;
  speed_kmh: number | null;
  heading_deg: number | null;
  recorded_at: string;
}

export interface Complaint {
  id: string;
  organization_id: string | null;
  citizen_id: string;
  complaint_type: ComplaintType;
  description: string;
  status: ComplaintStatus;
  priority: PriorityLevel;
  latitude: number | null;
  longitude: number | null;
  created_at: string;
  citizens?: {
    profiles?: Pick<UserProfile, 'full_name' | 'phone'>;
  } | null;
}

export interface Bill {
  id: string;
  citizen_id: string;
  organization_id: string | null;
  amount: number;
  billing_period: string;
  due_date: string;
  status: PaymentStatus;
  control_number: string | null;
  payment_transactions?: PaymentTransaction[];
}

export interface PaymentTransaction {
  id: string;
  billing_id: string;
  amount: number;
  provider: string;
  payment_method: string;
  transaction_reference: string;
  status: PaymentStatus;
  paid_at: string | null;
  created_at: string;
}

export interface NotificationItem {
  id: string;
  title: string;
  message: string;
  type: NotificationType;
  isRead: boolean;
  createdAt: string;
}

// ──────────────────────────────────────────────
// RPC Response Shapes
// ──────────────────────────────────────────────

export interface NextScheduleInfo {
  schedule_id: string;
  route_name: string;
  collection_date: string;
  estimated_arrival: string;
  vehicle_plate: string;
  driver_name: string;
}

export interface CitizenDashboardData {
  profile: {
    id: string;
    full_name: string;
    address: string;
    phone: string;
    email: string;
    status: ProfileStatus;
  } | null;
  recent_bills: Bill[];
  next_schedule: NextScheduleInfo | null;
  complaint_summary: {
    total: number;
    pending: number;
    resolved: number;
  };
}

export interface ScheduleStop {
  schedule_id: string;
  route_name: string;
  stop_name: string;
  expected_arrival: string;
  actual_arrival: string | null;
  status: ScheduleStatus;
}

export interface DriverDashboardData {
  driver_profile: {
    id: string;
    license_number: string;
    employment_status: EmploymentStatus;
  } | null;
  assigned_vehicle: Pick<Vehicle, 'id' | 'plate_number' | 'model' | 'status'> | null;
  active_schedules: ScheduleStop[];
  completed_today: number;
  total_today: number;
}

export interface AdminStatistics {
  total_citizens: number;
  active_drivers: number;
  active_vehicles: number;
  revenue_today: number;
  revenue_this_month: number;
  pending_complaints: number;
}

export interface AdminDashboardData {
  statistics: AdminStatistics;
  citizens: Citizen[];
  fleet: Vehicle[];
  recent_complaints: Complaint[];
}

// ──────────────────────────────────────────────
// Form / Mutation Payloads
// ──────────────────────────────────────────────

export interface ComplaintPayload {
  citizenId: string;
  complaintType: ComplaintType | string;
  description: string;
  latitude?: number;
  longitude?: number;
  priority?: PriorityLevel;
  imageFile?: File | null;
}

export interface PaymentPayload {
  billingId: string;
  amount: number;
  provider: string;
  paymentMethod: string;
  transactionReference: string;
}
