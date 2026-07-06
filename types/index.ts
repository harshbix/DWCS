/**
 * EcoCollect Tanzania Shared Type Definitions.
 */

export interface PaymentRecord {
  id: string;
  amount: string;
  date: string;
  type: string;
  method: string;
}

export type UrgencyLevel = 'CRITICAL' | 'MEDIUM' | 'LOW';
export type ComplaintStatus = 'Pending' | 'Processing' | 'Resolved';

export interface Complaint {
  id: string;
  reporter: string;
  phone: string;
  type: string;
  urgency: UrgencyLevel;
  status: ComplaintStatus;
  assignedOfficer: string;
  location: string;
  description: string;
  timestamp: string;
  imageUrl?: string;
  coords?: string;
}

export interface Citizen {
  id: string;
  name: string;
  phone: string;
  zone: string;
  paymentStatus: 'Paid' | 'Overdue';
  qrActive: boolean;
}

export type FleetStatus = 'En Route' | 'At Stop' | 'Breakdown';

export interface FleetVehicle {
  plate: string;
  status: FleetStatus;
  speed: string;
  fuel: string;
  route: string;
  progress: number;
  driverName: string;
  x: number;
  y: number;
}

export type StopStatus = 'Completed' | 'Pending' | 'Failed';

export interface Stop {
  id: number;
  address: string;
  area: string;
  bins: number;
  type: string;
  estTime: string;
  status: StopStatus;
}
