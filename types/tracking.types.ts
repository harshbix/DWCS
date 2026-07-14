export interface VehicleUpdate {
  id: string;
  vehicle_number: string;
  driver_id?: string;
  latitude: number;
  longitude: number;
  speed: number;
  status: 'Collecting Waste' | 'In Transit' | 'Off Duty' | 'Maintenance';
  location_label: string;
  last_updated: string; // ISO Timestamp string
}
