/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect } from 'react';
import { 
  Trash2, Plus, Search, Bell, User, CreditCard, History, MapPin, 
  AlertTriangle, CheckCircle2, X, Truck, Copy, Check, ExternalLink, 
  Shield, ArrowLeft, Camera, Compass, FileText, Activity, LogOut, 
  Filter, Sparkles, Smartphone, Landmark, Check as CheckIcon, AlertCircle,
  HelpCircle, ChevronRight, Download, BarChart2, Eye, Map, Send, Settings, Radar, Info
} from 'lucide-react';

// Hotlinked avatar and site photos from official templates
const IMAGES = {
  elias: "https://lh3.googleusercontent.com/aida-public/AB6AXuC3AfZxWCYVOk5K-lnXngQE55oILv_THr68jLP8icBSl1umQ85_mih968c868E6xmR3aJWs8k3F7nGACMMly1TY0dyNQ4tJ5TP1iQ-kV7sQazx52IuJxbs1NHHE9oVDwl-7LjInec-1CWhCuh1VshCRV3TZ1-OWEXaJ3sJbZ06RI_Yuc8grtrfbM_uare-EvcVE93JIiDYWh9MPe3kGpNLCQ_9i2_A-jz4qkhDApCSjZTj3xahvsiNqPFm652Y0TITRhcUX-_LlWafm",
  woman: "https://lh3.googleusercontent.com/aida-public/AB6AXuDu-KmOBQ3zy5PT_5coWrXuYa-rw6HzUN-rUF7gY28jS8vaoOyBz2j9Mv_45WiFzaQhTsBWz7R3Iz4MRCzUFTk_3gepQepc22QHkWGcRhkzmwBE-vk-MDhtBWPxgIBZe24TVn9AuuwOnx29gFvMjhODMSBR17fAnkeEZYnnsihF7-RspugB8OLuUi-GtNCTlqZnjljwsC7Nzb-xCG1-__l9PslzGtZDq3nRZPAMjLCpTx6jO4oozSDI00FYKQ_rP6TODssyTsoL8IwD",
  alex: "https://lh3.googleusercontent.com/aida-public/AB6AXuA8a4_I83ZwHNdkUq0f3mFhqtnYL1Eh-lde2FSj_n4VhPPkgKt9P7JUTaazPDM9o1p2STV2OX_UU8NsiuZj0QcEuJP6jhcEsuSDKliiczwjQLaLMiSgvVcXN0bjjcAnv9pTk-lq9SIVNKbk3KWsrxaTFRUNtecKE1lsRMdNd2tkcrP4fKKW__WKUnzHABhB_ENeHu_pPhLSbpLTwg7_etZl2ZrFQMSW14F0575leyDBZ8o_52K_3MHdBTYg1BO46ju_uraAsDInVI5o",
  marcus: "https://lh3.googleusercontent.com/aida-public/AB6AXuBQBho6DavOrq8EeQLi1_mOfJrmxRCEiwVoRqJH_wAfP_HJOH-ojLCBPW72rjs7licg3Uu3hl5omXkLy8CwngbVDg7uBYxxCoK4xYUWjOHOt-1gVGhiTJgGdZefP7eOJBXMdTsgCKjw0mUISvz-gEck0Ia9KIrSL_eqXw7Kco2N1xCSMe-dKvVI-ySMRODtek3qiiHcd2kvXMX0Thhejd_Z8jC8mXtX46ixPQxntQUm0mBUbIlxhbbSStdeba_d9DIkg8a-640Dop-",
  admin: "https://lh3.googleusercontent.com/aida-public/AB6AXuCbzvsv1CmfRE-UAfmSElPd1Y0WPc-56auZu9Vd6of8SFAvPwNwmY_eM-7dLXGfOEOxx4XD9wmq11MUJFYVnLqwJpE81D0uOkRIOwzip6DsKHwaz7wK4-V2GTvwYCTcR9rMD7BUDO6FUZ4w6-yQvl5Mp4Na2tXrXIqU3B_AJSGFxSomTFXkW9JwPn7-7sFPk0liaQk00T2vjTVdNkWs8KfzhcoP4gLlNZC17LSFrMLLhwWV0mrvVfEG6hAXzS1SHpmGZGR0ZkxrCmbE",
  executive: "https://lh3.googleusercontent.com/aida-public/AB6AXuB5FsYw5lvGQMBy8_-PO3_8lZXelcC4pT2oD7gx8qMHiHh4G3W7mxa0Nk6dYFqdAJJKU3SWsxVSxTrrdRHGpXphYEo6CH-j-CHG0VoZB6OS-ifMbBOPDVmL7juaL-Fg2bknZn9N9PDcRamYOlLdPP5C9moRcp668mE6FUAx7qHBtVdlfY14VgezdPPCZ9zPmUQX97oBoq6sERgucFQmxJ87d9e_nyCDgbYc7nff7XcxE4JRBZlM53Eqe7g4LgzYWna2xXKu__pkaVhy",
  dumpingSite: "https://lh3.googleusercontent.com/aida-public/AB6AXuCK_2sB3NjsSu12cHPfmGhJReIXxpPQ557_azg9wh9vWWVFAGsChfzmNYTra_g2ewFjEF7TBqCkrk32rHZFDrXqCdbe7It3_svaO2dtQREhyrSRWIa2n0NG5XTFhiYwNsCVScUNS_fRodMvr-_nZFXBlk_nVp2JtebGA6HP9CMEQfybgxPMerm8yamSIJKbRwvzxM7cCKWnwXRCTW5-B_9ADMTsbaD9ehH8mZ8EQUhyhTTN8AxUDhWkx0t6j34XEwwZcP9YonWwUoCZ",
  qr: "https://lh3.googleusercontent.com/aida-public/AB6AXuAgbtoG1eB3YkfIACJgHt5S4hgAr_S1pRCiQI9e4ymksPxy6AS5BV-Nca80Z9E59uDVvbnj90g4bnECIzyRgf8FaIwNU8pIAo8gEW21F2x1jkYY5Soxj0cpD_hK80zPRiaquDqz-XDLyXCuNK56Ae27qRf2Dw8Gjl5eUGnqnlSfPjO4tRO71n8qR8bAGzSjQD05flmPaVmhtAkmlY77cvQI_0vYnGSuCooNRo18_IVxCQFcpvksAGXDQaL1G8bLyDtN3QEaWy7yQicf"
};

// Types & Contracts
interface PaymentRecord {
  id: string;
  amount: string;
  date: string;
  type: string;
  method: string;
}

interface Complaint {
  id: string;
  reporter: string;
  phone: string;
  type: string;
  urgency: 'CRITICAL' | 'MEDIUM' | 'LOW';
  status: 'Pending' | 'Processing' | 'Resolved';
  assignedOfficer: string;
  location: string;
  description: string;
  timestamp: string;
  imageUrl?: string;
  coords?: string;
}

interface Citizen {
  id: string;
  name: string;
  phone: string;
  zone: string;
  paymentStatus: 'Paid' | 'Overdue';
  qrActive: boolean;
}

interface FleetVehicle {
  plate: string;
  status: 'En Route' | 'At Stop' | 'Breakdown';
  speed: string;
  fuel: string;
  route: string;
  progress: number;
  driverName: string;
  x: number;
  y: number;
}

interface Stop {
  id: number;
  address: string;
  area: string;
  bins: number;
  type: string;
  estTime: string;
  status: 'Completed' | 'Pending' | 'Failed';
}

export default function App() {
  // Global Role state
  const [role, setRole] = useState<'citizen' | 'driver' | 'admin'>('citizen');

  // Shared React States
  const [paymentStatus, setPaymentStatus] = useState<'Paid' | 'Overdue'>('Overdue');
  const [revenueToday, setRevenueToday] = useState<number>(12500000);
  const [paymentHistory, setPaymentHistory] = useState<PaymentRecord[]>([
    { id: '#8394', amount: '12,500 TZS', date: 'Oct 20, 2023', type: 'Monthly Fee', method: 'M-Pesa' },
    { id: '#7421', amount: '12,500 TZS', date: 'Sep 21, 2023', type: 'Monthly Fee', method: 'Tigo Pesa' }
  ]);

  const [complaints, setComplaints] = useState<Complaint[]>([
    { id: '#TMWA-9821', reporter: 'Abeid Mwakalebela', phone: '+255 712 345 678', type: 'Illegal Dumping', urgency: 'CRITICAL', status: 'Pending', assignedOfficer: 'Insp. Hassan K.', location: 'Mlimani City West Entrance', description: 'Massive pile of commercial waste and plastics dumped overnight.', timestamp: '10 mins ago', imageUrl: IMAGES.dumpingSite, coords: '-6.7725, 39.2205' },
    { id: '#TMWA-9755', reporter: 'Sarah Lyimo', phone: '+255 654 987 123', type: 'Noise Pollution', urgency: 'LOW', status: 'Resolved', assignedOfficer: 'Officer Mariam', location: 'Oysterbay, Toure Dr.', description: 'Loud collection trucks operating at 3 AM.', timestamp: '2 hours ago' },
    { id: '#TMWA-9810', reporter: 'Bakari Juma', phone: '+255 783 222 111', type: 'Overflowing Bin', urgency: 'MEDIUM', status: 'Processing', assignedOfficer: 'Unit 4 (Mbezi)', location: 'Kariakoo Market, Block B', description: 'Bin has not been collected in 5 days, odor is unbearable.', timestamp: '5 hours ago' },
    { id: '#TMWA-9844', reporter: 'Daudi K.', phone: '+255 621 555 444', type: 'Missed Collection', urgency: 'MEDIUM', status: 'Pending', assignedOfficer: 'Unassigned', location: 'Upanga South, Plot 42', description: 'Collection skipped on regular scheduled Friday.', timestamp: 'Yesterday' }
  ]);

  const [citizens, setCitizens] = useState<Citizen[]>([
    { id: 'TZ-KND-00124', name: 'Juma Hamisi', phone: '+255 712 345 678', zone: 'Kinondoni, District A', paymentStatus: 'Paid', qrActive: true },
    { id: 'TZ-KND-00156', name: 'Asha Mwinyi', phone: '+255 654 987 123', zone: 'Kinondoni, District B', paymentStatus: 'Overdue', qrActive: true },
    { id: 'TZ-TEM-00892', name: 'Elias Mwakalebela', phone: '+255 783 222 111', zone: 'Temeke, Zone 4', paymentStatus: 'Overdue', qrActive: true },
    { id: 'TZ-ILK-00455', name: 'Emmanuel Masawe', phone: '+255 621 555 444', zone: 'Ilala, City Center', paymentStatus: 'Paid', qrActive: true },
    { id: 'TZ-KND-00212', name: 'Lulu Makoye', phone: '+255 744 333 999', zone: 'Kinondoni, Kawe', paymentStatus: 'Overdue', qrActive: true }
  ]);

  const [fleet, setFleet] = useState<FleetVehicle[]>([
    { plate: 'T 123 ABC', status: 'En Route', speed: '42 km/h', fuel: '68%', route: 'Route 14 - Kinondoni', progress: 75, driverName: 'Alex', x: 42, y: 35 },
    { plate: 'T 456 DEF', status: 'At Stop', speed: '0 km/h', fuel: '45%', route: 'Route 04 - Kariakoo', progress: 50, driverName: 'Marcus Thorne', x: 68, y: 22 },
    { plate: 'T 889 GHI', status: 'Breakdown', speed: '0 km/h', fuel: '12%', route: 'Route 09 - Ilala', progress: 10, driverName: 'Juma S.', x: 55, y: 62 },
    { plate: 'T 221 XYZ', status: 'En Route', speed: '35 km/h', fuel: '82%', route: 'Route 02 - Masaki', progress: 25, driverName: 'Emmanuel P.', x: 35, y: 15 }
  ]);

  const [notifications, setNotifications] = useState([
    { id: 1, title: 'Truck Approaching', message: 'The waste truck is 500m from your house. Please ensure your bins are accessible.', time: 'Just now', unread: true, category: 'tracking', icon: 'local_shipping' },
    { id: 2, title: 'Payment Successful', message: 'Receipt #8394 has been generated for your recent collection service.', time: '2h ago', unread: false, category: 'payment', icon: 'payments' },
    { id: 3, title: 'Service Update', message: 'Collection for Zone 4 shifted to Saturday due to scheduled maintenance.', time: 'Yesterday', unread: false, category: 'alert', icon: 'warning' }
  ]);

  // Citizen Tab state
  const [citizenTab, setCitizenTab] = useState<'home' | 'tracking' | 'payments' | 'reports' | 'profile' | 'card' | 'notifications'>('home');
  const [paymentMethod, setPaymentMethod] = useState<'mpesa' | 'tigo' | 'airtel' | 'gepg'>('mpesa');
  const [copySuccess, setCopySuccess] = useState(false);
  const [payingState, setPaymentPaying] = useState(false);
  const [alertNotify, setAlertNotify] = useState(false);
  const [showReceiptModal, setShowReceiptModal] = useState<PaymentRecord | null>(null);

  // New Citizen Report states
  const [newReportType, setNewReportType] = useState('Dumping');
  const [newReportDesc, setNewReportDesc] = useState('');
  const [newReportLoc, setNewReportLoc] = useState('Plot 42, Block G, Upanga South');
  const [locationAcquired, setLocationAcquired] = useState(false);
  const [successToast, setSuccessToast] = useState('');

  // Driver states
  const [driverTab, setDriverTab] = useState<'home' | 'route' | 'scan' | 'reports' | 'profile'>('home');
  const [completedStops, setCompletedStops] = useState(12);
  const [stops, setStops] = useState<Stop[]>([
    { id: 1, address: 'Plot 42, Upanga South', area: 'Upanga', bins: 2, type: 'Household', estTime: '08:15 AM', status: 'Completed' },
    { id: 2, address: 'Muhimbili Hospital Gate C', area: 'Upanga', bins: 8, type: 'Medical Waste', estTime: '09:00 AM', status: 'Completed' },
    { id: 3, address: 'Coco Beach Public Restrooms', area: 'Oysterbay', bins: 4, type: 'Recycling', estTime: '09:45 AM', status: 'Completed' },
    { id: 4, address: 'Kariakoo Market, Block B', area: 'Kariakoo', bins: 15, type: 'Commercial Waste', estTime: '10:15 AM', status: 'Pending' },
    { id: 5, address: 'Kinondoni Block 12 Main St', area: 'Kinondoni', bins: 14, type: 'Household', estTime: '11:00 AM', status: 'Pending' },
    { id: 6, address: 'Ali Hassan Mwinyi Rd, Plot 9', area: 'Kinondoni', bins: 6, type: 'Commercial Waste', estTime: '11:30 AM', status: 'Failed' }
  ]);
  const [activeStopId, setActiveStopId] = useState<number>(4);
  const [navulating, setNavulating] = useState(false);
  const [collectingState, setCollectingState] = useState(false);
  const [driverSelectedIssueType, setDriverSelectedIssueType] = useState('Breakdown');
  const [driverIssueDesc, setDriverIssueDesc] = useState('');
  const [driverPhoto, setDriverPhoto] = useState<boolean>(false);
  const [driverLocationAcquired, setDriverLocationAcquired] = useState(true);

  // Admin states
  const [adminTab, setAdminTab] = useState<'dashboard' | 'citizens' | 'tracking' | 'reports'>('dashboard');
  const [searchCitizen, setSearchCitizen] = useState('');
  const [adminSelectedComplaint, setAdminSelectedComplaint] = useState<Complaint | null>(complaints[0]);
  const [showAssignModal, setShowAssignModal] = useState(false);
  const [showNewCitizenModal, setShowNewCitizenModal] = useState(false);

  // Form states for Admin "Add Citizen"
  const [addCitName, setAddCitName] = useState('');
  const [addCitPhone, setAddCitPhone] = useState('');
  const [addCitZone, setAddCitZone] = useState('Kinondoni, District A');

  // Form states for Admin "Assign Route"
  const [assignPlate, setAssignPlate] = useState('T 123 ABC');
  const [assignZone, setAssignZone] = useState('Kinondoni Zone 4');

  // Live simulation coordinates interval
  useEffect(() => {
    const timer = setInterval(() => {
      // Simulate active fleet movements slightly
      setFleet(prev => prev.map(v => {
        if (v.status === 'En Route') {
          const deltaX = (Math.random() - 0.5) * 1.5;
          const deltaY = (Math.random() - 0.5) * 1.5;
          return {
            ...v,
            x: Math.min(Math.max(v.x + deltaX, 10), 90),
            y: Math.min(Math.max(v.y + deltaY, 10), 90),
            speed: `${Math.round(30 + Math.random() * 15)} km/h`
          };
        }
        return v;
      }));
    }, 4000);
    return () => clearInterval(timer);
  }, []);

  // Sync state between Citizen Payment and Admin Dashboard KPI
  const executePayment = () => {
    setPaymentPaying(true);
    setTimeout(() => {
      setPaymentPaying(false);
      setPaymentStatus('Paid');
      
      // Update Admin metrics live
      setRevenueToday(prev => prev + 12500);
      
      // Add record to history
      const newPay: PaymentRecord = {
        id: `#${Math.floor(8000 + Math.random() * 1999)}`,
        amount: '12,500 TZS',
        date: new Date().toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' }),
        type: 'Monthly Fee (October 2023)',
        method: paymentMethod === 'mpesa' ? 'M-Pesa' : paymentMethod === 'tigo' ? 'Tigo Pesa' : paymentMethod === 'airtel' ? 'Airtel Money' : 'GePG'
      };
      setPaymentHistory(prev => [newPay, ...prev]);

      // Add payment notification
      setNotifications(prev => [
        {
          id: Date.now(),
          title: 'Payment Successful',
          message: `Your payment of 12,500 TZS via ${newPay.method} has been received. Receipt ${newPay.id} generated.`,
          time: 'Just now',
          unread: true,
          category: 'payment',
          icon: 'check_circle'
        },
        ...prev
      ]);

      // Update in citizen accounts
      setCitizens(prev => prev.map(c => c.name === 'Elias Mwakalebela' ? { ...c, paymentStatus: 'Paid' } : c));
      
      triggerToast('Invoice Paid Successfully! Dashboard Updated.');
      setCitizenTab('home');
    }, 1200);
  };

  const copyToClipboard = () => {
    setCopySuccess(true);
    navigator.clipboard?.writeText('994028374122');
    setTimeout(() => setCopySuccess(false), 2000);
  };

  const triggerToast = (msg: string) => {
    setSuccessToast(msg);
    setTimeout(() => setSuccessToast(''), 4000);
  };

  const submitCitizenReport = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newReportDesc.trim()) {
      alert('Please provide a short description first.');
      return;
    }

    const newTicketId = `#TMWA-${Math.floor(9000 + Math.random() * 999)}`;
    const newGrievance: Complaint = {
      id: newTicketId,
      reporter: 'Elias Mwakalebela',
      phone: '+255 783 222 111',
      type: newReportType,
      urgency: newReportType === 'Dumping' ? 'CRITICAL' : 'MEDIUM',
      status: 'Pending',
      assignedOfficer: 'Unassigned',
      location: newReportLoc,
      description: newReportDesc,
      timestamp: 'Just now',
      imageUrl: newReportType === 'Dumping' ? IMAGES.dumpingSite : undefined,
      coords: '-6.7915, 39.2312'
    };

    setComplaints(prev => [newGrievance, ...prev]);
    setNewReportDesc('');
    triggerToast(`Grievance ${newTicketId} Filed! TMWA Team Alerted.`);
    setCitizenTab('home');
  };

  const submitDriverReport = () => {
    const newTicketId = `#TMWA-${Math.floor(9000 + Math.random() * 999)}`;
    const newGrievance: Complaint = {
      id: newTicketId,
      reporter: 'Marcus Thorne (Driver)',
      phone: '+255 744 333 999',
      type: driverSelectedIssueType,
      urgency: 'CRITICAL',
      status: 'Pending',
      assignedOfficer: 'Municipal Dispatch',
      location: 'Ali Hassan Mwinyi Rd, Kinondoni',
      description: driverIssueDesc || `${driverSelectedIssueType} reported during scheduled route. Route blocked.`,
      timestamp: 'Just now',
      coords: '-6.7821, 39.2443'
    };

    setComplaints(prev => [newGrievance, ...prev]);
    setDriverIssueDesc('');
    setDriverPhoto(false);
    triggerToast(`Incident reported! Dispatch Center updated.`);
    setDriverTab('home');

    // Automatically trigger notification for Citizen
    setNotifications(prev => [
      {
        id: Date.now(),
        title: 'Service Interruption Alert',
        message: `Kinondoni route update: ${driverSelectedIssueType} reported on Ali Hassan Mwinyi Rd. Bins collection delayed.`,
        time: 'Just now',
        unread: true,
        category: 'alert',
        icon: 'warning'
      },
      ...prev
    ]);
  };

  const completeCollection = () => {
    setCollectingState(true);
    setTimeout(() => {
      setCollectingState(false);
      setCompletedStops(prev => prev + 1);
      setStops(prev => prev.map(s => s.id === activeStopId ? { ...s, status: 'Completed' } : s));
      triggerToast('Garbage Collected Successfully! Stop Marked Done.');
      // select next stop if available
      const nextPending = stops.find(s => s.id > activeStopId && s.status === 'Pending');
      if (nextPending) {
        setActiveStopId(nextPending.id);
      }
    }, 1500);
  };

  const addNewCitizenAdmin = (e: React.FormEvent) => {
    e.preventDefault();
    if (!addCitName || !addCitPhone) {
      alert('Please fill out all fields.');
      return;
    }

    const newCit: Citizen = {
      id: `TZ-KND-00${Math.floor(100 + Math.random() * 899)}`,
      name: addCitName,
      phone: addCitPhone,
      zone: addCitZone,
      paymentStatus: 'Paid',
      qrActive: true
    };

    setCitizens(prev => [newCit, ...prev]);
    setAddCitName('');
    setAddCitPhone('');
    setShowNewCitizenModal(false);
    triggerToast(`Citizen Account Created: ${newCit.name}`);
  };

  const executeRouteAssignment = () => {
    triggerToast(`Route Assigned: Vehicle ${assignPlate} directed to ${assignZone}`);
    setShowAssignModal(false);

    // Update vehicle status
    setFleet(prev => prev.map(v => v.plate === assignPlate ? { ...v, status: 'En Route', route: assignZone, progress: 0 } : v));
  };

  return (
    <div className="min-h-screen flex flex-col font-plus-jakarta bg-[#fcf8fb] text-[#1b1b1d] select-none">
      
      {/* Global Interactive Role Switcher Header */}
      <div className="bg-primary text-white text-xs py-2 px-4 flex flex-col sm:flex-row justify-between items-center shadow-md sticky top-0 z-[100] border-b border-primary-container gap-2">
        <div className="flex items-center gap-2">
          <span className="material-symbols-outlined text-base font-bold animate-pulse text-[#a8e7c5]">eco</span>
          <span className="font-semibold uppercase tracking-wider font-mono">Tanzania Waste Management Authority (TMWA)</span>
        </div>
        <div className="flex items-center gap-1.5 bg-[#0e5138] rounded-full p-0.5 border border-primary-container">
          <button 
            onClick={() => setRole('citizen')} 
            className={`px-3 py-1 rounded-full font-bold transition-all text-xs flex items-center gap-1 ${role === 'citizen' ? 'bg-[#a8e7c5] text-primary shadow-sm' : 'text-[#cee9d3] hover:opacity-90'}`}
          >
            <span className="material-symbols-outlined text-[14px]">person</span>
            Citizen Portal
          </button>
          <button 
            onClick={() => setRole('driver')} 
            className={`px-3 py-1 rounded-full font-bold transition-all text-xs flex items-center gap-1 ${role === 'driver' ? 'bg-[#a8e7c5] text-primary shadow-sm' : 'text-[#cee9d3] hover:opacity-90'}`}
          >
            <span className="material-symbols-outlined text-[14px]">local_shipping</span>
            Driver Portal
          </button>
          <button 
            onClick={() => setRole('admin')} 
            className={`px-3 py-1 rounded-full font-bold transition-all text-xs flex items-center gap-1 ${role === 'admin' ? 'bg-[#a8e7c5] text-primary shadow-sm' : 'text-[#cee9d3] hover:opacity-90'}`}
          >
            <span className="material-symbols-outlined text-[14px]">shield</span>
            Admin Console
          </button>
        </div>
      </div>

      {/* Success Toast Banner */}
      {successToast && (
        <div className="fixed top-12 left-1/2 -translate-x-1/2 z-[101] bg-[#beead1] border-2 border-primary text-[#0f5238] font-bold text-xs py-2 px-5 rounded-full shadow-lg flex items-center gap-2 animate-[fadeIn_0.3s_ease-out]">
          <span className="material-symbols-outlined text-sm font-bold">verified</span>
          {successToast}
        </div>
      )}

      {/* App Shell Container */}
      <div className="flex-1 flex flex-col relative">

        {/* 1. CITIZEN PORTAL */}
        {role === 'citizen' && (
          <div className="flex-1 flex flex-col pb-[80px]">
            {/* Citizen Top App Bar */}
            <header className="sticky top-0 w-full z-40 backdrop-blur-xl bg-[#fcf8fb]/80 border-b border-outline-variant/30 flex justify-between items-center px-5 py-3 shadow-sm">
              <div className="flex items-center gap-3">
                <img 
                  className="w-10 h-10 rounded-full object-cover border-2 border-primary shadow-sm cursor-pointer" 
                  src={IMAGES.elias} 
                  alt="Elias" 
                  onClick={() => setCitizenTab('profile')}
                />
                <div>
                  <h1 className="text-xs text-on-surface-variant font-medium uppercase tracking-wider">Mwananchi Account</h1>
                  <p className="text-sm font-bold text-primary flex items-center gap-1">
                    <span className="material-symbols-outlined text-xs text-primary">location_on</span>
                    Dar es Salaam, TZ
                  </p>
                </div>
              </div>
              <div className="flex items-center gap-2">
                <button 
                  onClick={() => setCitizenTab('card')}
                  className="w-9 h-9 rounded-full bg-surface-container flex items-center justify-center text-on-surface-variant hover:bg-outline-variant/20 relative"
                  title="My Service Card"
                >
                  <span className="material-symbols-outlined text-base">qr_code_2</span>
                </button>
                <button 
                  onClick={() => setCitizenTab('notifications')}
                  className="w-9 h-9 rounded-full bg-surface-container flex items-center justify-center text-on-surface-variant hover:bg-outline-variant/20 relative"
                  title="Notifications"
                >
                  <span className="material-symbols-outlined text-base">notifications</span>
                  {notifications.some(n => n.unread) && (
                    <span className="absolute top-1 right-1 w-2.5 h-2.5 bg-primary border-2 border-[#fcf8fb] rounded-full animate-ping"></span>
                  )}
                </button>
              </div>
            </header>

            {/* Citizen Tab Switcher Panel */}
            <main className="flex-1 px-4 py-5 max-w-lg mx-auto w-full flex flex-col gap-5">
              
              {citizenTab === 'home' && (
                <div className="flex flex-col gap-5 animate-[fadeIn_0.4s_ease-out]">
                  {/* Greetings */}
                  <section className="flex flex-col gap-1">
                    <h2 className="text-2xl font-extrabold tracking-tight">Habari, Elias</h2>
                    <div className="flex items-center gap-1 text-sm text-on-surface-variant">
                      <span className="material-symbols-outlined text-xs">location_on</span>
                      <span>Zone 4 - Upanga South</span>
                    </div>
                  </section>

                  {/* Hero Card: Next Collection */}
                  <div className="bg-gradient-to-br from-primary-container to-primary p-5 rounded-2xl shadow-[0_4px_20px_rgba(0,0,0,0.08)] relative overflow-hidden text-on-primary-container">
                    <div className="absolute -right-8 -top-8 w-44 h-44 bg-on-primary-container/10 rounded-full blur-2xl"></div>
                    <div className="relative z-10 flex flex-col gap-2">
                      <div className="flex justify-between items-center">
                        <span className="text-xs uppercase font-bold tracking-widest opacity-90">Next Collection</span>
                        <div className="w-8 h-8 rounded-full bg-on-primary-container/20 flex items-center justify-center backdrop-blur-sm">
                          <span className="material-symbols-outlined text-on-primary-container text-sm">recycling</span>
                        </div>
                      </div>
                      <div className="text-4xl font-extrabold tracking-tight mt-1">2 Days</div>
                      <div className="text-xs font-semibold opacity-90 flex items-center gap-1.5 mt-1">
                        <span className="material-symbols-outlined text-xs">calendar_today</span>
                        Friday, Oct 20
                      </div>
                    </div>
                  </div>

                  {/* Live Status Card: On Route */}
                  <div className="bg-surface-container-lowest p-5 rounded-2xl shadow-sm border border-outline-variant/30 flex flex-col gap-4">
                    <div className="flex justify-between items-center">
                      <h3 className="text-sm font-bold text-on-surface flex items-center gap-1.5">
                        <span className="w-2.5 h-2.5 rounded-full bg-primary animate-pulse"></span>
                        Active Route
                      </h3>
                      <div className="bg-[#cee9d3] text-primary font-bold text-[10px] uppercase tracking-wider px-2.5 py-1 rounded-full flex items-center gap-1 shadow-sm">
                        <span className="material-symbols-outlined text-[12px] animate-pulse">radar</span> Active
                      </div>
                    </div>
                    <div className="flex items-center gap-3 bg-[#eef4fd] p-3 rounded-xl border border-[#abc7ff]/20">
                      <div className="w-11 h-11 rounded-full bg-primary flex items-center justify-center text-white shadow-sm shrink-0">
                        <span className="material-symbols-outlined text-base">local_shipping</span>
                      </div>
                      <div>
                        <div className="text-xs text-on-surface-variant font-medium">Waste Truck is</div>
                        <div className="text-sm font-bold text-primary">1.2km away from your zone</div>
                      </div>
                    </div>
                    {/* Progress Bar */}
                    <div className="w-full bg-surface-container h-2 rounded-full overflow-hidden relative">
                      <div className="bg-primary h-full rounded-full animate-shimmer" style={{ width: '75%' }}></div>
                    </div>
                  </div>

                  {/* Quick Action Grid */}
                  <section className="grid grid-cols-2 gap-3">
                    <button 
                      onClick={() => setCitizenTab('payments')}
                      className="bg-surface-container-lowest p-4 rounded-xl shadow-xs border border-outline-variant/10 flex flex-col items-center justify-center gap-2 hover:bg-surface-container-low transition-colors duration-200"
                    >
                      <div className="w-12 h-12 rounded-full bg-secondary-container text-primary flex items-center justify-center">
                        <span className="material-symbols-outlined text-base font-bold">payments</span>
                      </div>
                      <span className="text-xs font-bold text-on-surface">Pay Fee</span>
                    </button>
                    <button 
                      onClick={() => setCitizenTab('tracking')}
                      className="bg-surface-container-lowest p-4 rounded-xl shadow-xs border border-outline-variant/10 flex flex-col items-center justify-center gap-2 hover:bg-surface-container-low transition-colors duration-200"
                    >
                      <div className="w-12 h-12 rounded-full bg-secondary-container text-primary flex items-center justify-center">
                        <span className="material-symbols-outlined text-base font-bold">my_location</span>
                      </div>
                      <span className="text-xs font-bold text-on-surface">Track Truck</span>
                    </button>
                    <button 
                      onClick={() => setCitizenTab('reports')}
                      className="bg-surface-container-lowest p-4 rounded-xl shadow-xs border border-outline-variant/10 flex flex-col items-center justify-center gap-2 hover:bg-surface-container-low transition-colors duration-200"
                    >
                      <div className="w-12 h-12 rounded-full bg-error-container text-error flex items-center justify-center">
                        <span className="material-symbols-outlined text-base font-bold">report_problem</span>
                      </div>
                      <span className="text-xs font-bold text-on-surface">Report Issue</span>
                    </button>
                    <button 
                      onClick={() => setCitizenTab('payments')}
                      className="bg-surface-container-lowest p-4 rounded-xl shadow-xs border border-outline-variant/10 flex flex-col items-center justify-center gap-2 hover:bg-surface-container-low transition-colors duration-200"
                    >
                      <div className="w-12 h-12 rounded-full bg-surface-container text-on-surface-variant flex items-center justify-center">
                        <span className="material-symbols-outlined text-base font-bold">history</span>
                      </div>
                      <span className="text-xs font-bold text-on-surface">View History</span>
                    </button>
                  </section>

                  {/* Payment Status Card */}
                  <div className="bg-surface-container-lowest p-4 rounded-xl shadow-xs border border-outline-variant/30 flex justify-between items-center">
                    <div className="flex items-center gap-3">
                      <div className="w-9 h-9 rounded-full bg-surface-container flex items-center justify-center text-on-surface-variant">
                        <span className="material-symbols-outlined text-sm font-bold">receipt_long</span>
                      </div>
                      <span className="text-xs font-bold text-on-surface">Monthly Payment Status</span>
                    </div>
                    <div className={`px-3 py-1 rounded-full text-[10px] font-bold uppercase tracking-wider flex items-center gap-1 ${paymentStatus === 'Paid' ? 'bg-[#beead1] text-primary' : 'bg-error-container text-error animate-pulse'}`}>
                      <span className="material-symbols-outlined text-[12px]">{paymentStatus === 'Paid' ? 'check_circle' : 'pending'}</span>
                      {paymentStatus}
                    </div>
                  </div>
                </div>
              )}

              {/* Citizen Payments Screen */}
              {citizenTab === 'payments' && (
                <div className="flex flex-col gap-4 animate-[fadeIn_0.4s_ease-out]">
                  <div>
                    <h2 className="text-xl font-extrabold tracking-tight text-on-surface">Service Payment</h2>
                    <p className="text-xs text-on-surface-variant mt-1">October 2023 Municipal Fee • Zone 4 Upanga</p>
                  </div>

                  {/* Current Status Box */}
                  <div className="bg-surface-container-lowest rounded-2xl p-4 border border-outline-variant/20 shadow-sm flex justify-between items-center">
                    <div>
                      <p className="text-[10px] font-bold text-on-surface-variant uppercase tracking-wider">Outstanding Amount</p>
                      <p className="text-2xl font-black text-primary mt-0.5">12,500 TZS</p>
                    </div>
                    <div className={`px-3 py-1 rounded-full text-[10px] font-bold uppercase tracking-widest ${paymentStatus === 'Paid' ? 'bg-[#beead1] text-primary' : 'bg-error-container text-error'}`}>
                      {paymentStatus === 'Paid' ? 'PAID' : 'UNPAID'}
                    </div>
                  </div>

                  {/* Control Number Card */}
                  <div className="bg-surface-container-lowest rounded-2xl p-4 shadow-sm border border-outline-variant/20">
                    <p className="text-xs font-bold text-on-surface-variant mb-2">Government Control Number (GePG)</p>
                    <div className="flex items-center justify-between bg-surface-container-low p-3.5 rounded-xl border border-outline-variant/20">
                      <code className="font-mono text-lg font-bold tracking-widest text-on-surface">994028374122</code>
                      <button 
                        onClick={copyToClipboard}
                        className="w-9 h-9 flex items-center justify-center rounded-full bg-white hover:bg-surface-container-high text-primary transition-all shadow-xs shrink-0"
                        title="Copy Control Number"
                      >
                        <span className="material-symbols-outlined text-base">{copySuccess ? 'check' : 'content_copy'}</span>
                      </button>
                    </div>
                    {copySuccess && (
                      <p className="text-[10px] text-primary font-bold text-center mt-2 animate-bounce">Control number copied to clipboard!</p>
                    )}
                    <p className="text-[10px] text-on-surface-variant mt-2.5 text-center">Use this control number to pay via mobile money or bank</p>
                  </div>

                  {/* Payment Methods Selection */}
                  <div>
                    <h4 className="text-xs font-bold text-on-surface uppercase tracking-wider mb-2.5">Select Mobile Money Provider</h4>
                    <div className="grid grid-cols-2 gap-2.5">
                      {[
                        { id: 'mpesa', name: 'Vodacom M-Pesa', color: '#E50000', icon: 'phone_iphone' },
                        { id: 'tigo', name: 'Tigo Pesa', color: '#004A99', icon: 'smartphone' },
                        { id: 'airtel', name: 'Airtel Money', color: '#FF0000', icon: 'aod' },
                        { id: 'gepg', name: 'GePG Direct Bank', color: '#707973', icon: 'account_balance' }
                      ].map(method => (
                        <label key={method.id} className="cursor-pointer relative block">
                          <input 
                            type="radio" 
                            name="pay_method" 
                            checked={paymentMethod === method.id}
                            onChange={() => setPaymentMethod(method.id as any)}
                            className="sr-only peer"
                          />
                          <div className="bg-surface-container-lowest rounded-xl p-3 border-2 border-transparent peer-checked:border-primary peer-checked:bg-primary/5 transition-all shadow-xs flex flex-col items-center justify-center gap-1 h-full min-h-[90px]">
                            <div className="w-9 h-9 rounded-full flex items-center justify-center" style={{ backgroundColor: `${method.color}15`, color: method.color }}>
                              <span className="material-symbols-outlined text-sm">{method.icon}</span>
                            </div>
                            <span className="text-xs font-bold text-on-surface text-center">{method.name}</span>
                          </div>
                        </label>
                      ))}
                    </div>
                  </div>

                  {/* Actions Buttons */}
                  <div className="flex flex-col gap-2 mt-2">
                    {paymentStatus === 'Overdue' ? (
                      <button 
                        onClick={executePayment}
                        disabled={payingState}
                        className="w-full bg-primary text-white h-12 rounded-xl font-bold hover:opacity-90 active:scale-98 transition-all flex items-center justify-center gap-2 shadow-xs disabled:opacity-50"
                      >
                        {payingState ? (
                          <>
                            <span className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></span>
                            Processing GePG Payment...
                          </>
                        ) : (
                          <>
                            <span className="material-symbols-outlined text-sm font-bold">lock</span>
                            Pay 12,500 TZS Now
                          </>
                        )}
                      </button>
                    ) : (
                      <div className="bg-[#beead1] border border-primary text-[#0f5238] p-3 rounded-xl text-center font-bold text-xs flex items-center justify-center gap-2 shadow-xs">
                        <span className="material-symbols-outlined text-sm font-bold">check_circle</span>
                        Municipal Fee paid for October 2023. Thank you!
                      </div>
                    )}

                    <div className="grid grid-cols-2 gap-2 mt-1">
                      <button 
                        onClick={() => setShowReceiptModal(paymentHistory[0])}
                        className="bg-surface-container-highest text-primary h-11 rounded-lg font-bold text-xs hover:bg-[#cee9d3]/20 transition-all flex items-center justify-center gap-1.5 border border-outline-variant/30"
                      >
                        <span className="material-symbols-outlined text-sm">receipt_long</span>
                        Show Receipt
                      </button>
                      <button 
                        onClick={() => {
                          alert(`Payment History Logs:\n${paymentHistory.map(p => `${p.date}: ${p.amount} via ${p.method} (${p.id})`).join('\n')}`);
                        }}
                        className="bg-surface-container-highest text-primary h-11 rounded-lg font-bold text-xs hover:bg-[#cee9d3]/20 transition-all flex items-center justify-center gap-1.5 border border-outline-variant/30"
                      >
                        <span className="material-symbols-outlined text-sm">history</span>
                        History Log
                      </button>
                    </div>
                  </div>
                </div>
              )}

              {/* Citizen Tracking Screen */}
              {citizenTab === 'tracking' && (
                <div className="flex-1 flex flex-col gap-4 animate-[fadeIn_0.4s_ease-out] relative">
                  <div>
                    <h2 className="text-xl font-extrabold tracking-tight">Real-Time Vehicle GPS</h2>
                    <p className="text-xs text-on-surface-variant">Live tracking of assigned TMWA vehicle #TZ-402</p>
                  </div>

                  {/* SVG Vector Map */}
                  <div className="w-full h-[280px] bg-[#eef4fd] rounded-2xl border border-outline-variant/40 shadow-inner overflow-hidden relative">
                    <svg className="absolute inset-0 w-full h-full" viewBox="0 0 100 100" preserveAspectRatio="none">
                      {/* Coastline */}
                      <path d="M 0,40 Q 30,55 55,45 T 100,50 L 100,100 L 0,100 Z" fill="#b1f0ce" opacity="0.3" />
                      {/* Streets grid */}
                      <line x1="10" y1="0" x2="10" y2="100" stroke="#eae7ea" strokeWidth="0.8" />
                      <line x1="30" y1="0" x2="30" y2="100" stroke="#eae7ea" strokeWidth="0.8" />
                      <line x1="50" y1="0" x2="50" y2="100" stroke="#eae7ea" strokeWidth="0.8" />
                      <line x1="70" y1="0" x2="70" y2="100" stroke="#eae7ea" strokeWidth="0.8" />
                      <line x1="90" y1="0" x2="90" y2="100" stroke="#eae7ea" strokeWidth="0.8" />

                      <line x1="0" y1="20" x2="100" y2="20" stroke="#eae7ea" strokeWidth="0.8" />
                      <line x1="0" y1="40" x2="100" y2="40" stroke="#eae7ea" strokeWidth="0.8" />
                      <line x1="0" y1="60" x2="100" y2="60" stroke="#eae7ea" strokeWidth="0.8" />
                      <line x1="0" y1="80" x2="100" y2="80" stroke="#eae7ea" strokeWidth="0.8" />

                      {/* Main roads */}
                      <path d="M 10,20 L 50,40 L 70,80" fill="none" stroke="#2c694e" strokeWidth="2.5" strokeLinecap="round" />
                      <path d="M 30,10 L 30,90" fill="none" stroke="#2c694e" strokeWidth="2" strokeDasharray="2,2" />

                      {/* Landmarks */}
                      <text x="15" y="15" fill="#404943" fontSize="3" className="font-bold">Msasani Bay</text>
                      <text x="75" y="15" fill="#404943" fontSize="3" className="font-bold">Coco Beach</text>
                      <text x="45" y="55" fill="#404943" fontSize="3" className="font-bold">Oyster Bay</text>
                    </svg>

                    {/* Landmarks Markers */}
                    <div className="absolute top-[18%] left-[78%] bg-white px-1.5 py-0.5 rounded shadow-[0_1px_5px_rgba(0,0,0,0.1)] text-[8px] font-bold text-on-surface flex items-center gap-0.5">
                      <span className="w-1.5 h-1.5 rounded-full bg-primary"></span> Coco Beach
                    </div>
                    <div className="absolute top-[48%] left-[38%] bg-white px-1.5 py-0.5 rounded shadow-[0_1px_5px_rgba(0,0,0,0.1)] text-[8px] font-bold text-on-surface flex items-center gap-0.5">
                      <span className="w-1.5 h-1.5 rounded-full bg-primary"></span> Muhimbili Hospital
                    </div>

                    {/* Current Home location Pin */}
                    <div className="absolute top-[68%] left-[55%] flex flex-col items-center -translate-x-1/2 -translate-y-1/2">
                      <div className="w-10 h-10 bg-white rounded-full shadow-md flex items-center justify-center border-2 border-primary">
                        <div className="w-7 h-7 bg-tertiary text-white rounded-full flex items-center justify-center shrink-0">
                          <span className="material-symbols-outlined text-xs">home</span>
                        </div>
                      </div>
                      <span className="bg-white text-on-surface font-bold text-[8px] px-1.5 py-0.5 rounded shadow-sm mt-1 border border-outline-variant/30">My House</span>
                    </div>

                    {/* Moving Truck Marker */}
                    <div className="absolute top-[32%] left-[45%] flex flex-col items-center -translate-x-1/2 -translate-y-1/2 pulse-marker">
                      <div className="w-12 h-12 bg-primary rounded-full shadow-lg flex items-center justify-center relative border-2 border-white text-white">
                        <span className="material-symbols-outlined text-base">local_shipping</span>
                      </div>
                      <span className="bg-primary text-white font-mono font-bold text-[8px] px-1.5 py-0.5 rounded shadow-sm mt-1">Truck WM-402</span>
                    </div>
                  </div>

                  {/* Tracking Metrics Card */}
                  <div className="bg-white rounded-2xl p-4 border border-outline-variant/20 shadow-sm flex flex-col gap-3">
                    <div className="flex justify-between items-start">
                      <div>
                        <div className="flex items-center gap-1.5 text-xs text-on-surface-variant font-medium mb-1">
                          <span className="w-2 h-2 rounded-full bg-primary animate-pulse"></span>
                          <span>Active Route Section</span>
                        </div>
                        <h3 className="text-base font-bold text-on-surface">Waste Truck #TZ-402</h3>
                      </div>
                      <div className="bg-[#cee9d3] text-primary px-2.5 py-1 rounded-full text-[10px] font-bold flex items-center gap-1 shadow-sm">
                        <span className="material-symbols-outlined text-[12px]">schedule</span>
                        Arriving Soon
                      </div>
                    </div>

                    {/* Metrics Grid */}
                    <div className="grid grid-cols-2 gap-3 bg-surface-container-low p-3.5 rounded-xl border border-outline-variant/10">
                      <div>
                        <span className="text-[10px] font-bold text-on-surface-variant uppercase tracking-wider block">Estimated ETA</span>
                        <div className="flex items-baseline gap-1 mt-0.5">
                          <span className="text-3xl font-black text-primary">12</span>
                          <span className="text-xs font-bold text-[#2d6a4f]">mins</span>
                        </div>
                      </div>
                      <div className="border-l border-outline-variant/30 pl-3">
                        <span className="text-[10px] font-bold text-on-surface-variant uppercase tracking-wider block">Remaining Distance</span>
                        <div className="flex items-baseline gap-1 mt-0.5">
                          <span className="text-2xl font-black text-on-surface">2.4</span>
                          <span className="text-xs font-bold text-on-surface-variant">km away</span>
                        </div>
                      </div>
                    </div>

                    {/* Actions */}
                    <div className="grid grid-cols-2 gap-2 mt-1">
                      <button 
                        onClick={() => alert('Simulating call to driver Alex:\n\nPhone number: +255 744 333 999\nOperator Status: Active & En Route.')}
                        className="bg-primary text-white font-bold text-xs py-3 rounded-xl shadow-xs hover:opacity-95 active:scale-98 transition-all flex items-center justify-center gap-1"
                      >
                        <span className="material-symbols-outlined text-sm font-bold">call</span>
                        Call Driver Alex
                      </button>
                      <button 
                        onClick={() => {
                          setAlertNotify(true);
                          triggerToast('Alert Active! You will receive notification when truck is 200m away.');
                        }}
                        className={`font-bold text-xs py-3 rounded-xl transition-all flex items-center justify-center gap-1 ${alertNotify ? 'bg-[#cee9d3] text-primary border border-primary/20' : 'bg-secondary-container text-on-secondary-container hover:bg-secondary-fixed'}`}
                      >
                        <span className="material-symbols-outlined text-sm">{alertNotify ? 'notifications_active' : 'notifications_active'}</span>
                        {alertNotify ? 'Alert Enabled' : 'Alert Me'}
                      </button>
                    </div>
                  </div>
                </div>
              )}

              {/* Citizen Reports Screen */}
              {citizenTab === 'reports' && (
                <form onSubmit={submitCitizenReport} className="flex flex-col gap-4 animate-[fadeIn_0.3s_ease-out]">
                  <div>
                    <h2 className="text-xl font-extrabold text-on-surface">Report Issue</h2>
                    <p className="text-xs text-on-surface-variant">File municipal waste complaints to TMWA dispatchers</p>
                  </div>
                  <div className="bg-surface-container-lowest p-4 rounded-xl border border-outline-variant/30 flex flex-col gap-3 shadow-xs">
                    <div>
                      <label className="text-xs font-bold text-on-surface block mb-1">Issue Category</label>
                      <select 
                        value={newReportType} 
                        onChange={(e) => setNewReportType(e.target.value)}
                        className="w-full bg-surface-container-low border border-outline-variant/30 h-11 px-3 rounded-lg text-sm font-semibold"
                      >
                        <option value="Dumping">Illegal Dumping / Trash Pile</option>
                        <option value="Overflowing Bin">Overflowing Public Bin</option>
                        <option value="Missed Collection">Missed Collection Stop</option>
                        <option value="Other">Other / Hazard Complaint</option>
                      </select>
                    </div>

                    <div>
                      <label className="text-xs font-bold text-on-surface block mb-1">Grievance Description</label>
                      <textarea 
                        rows={3}
                        value={newReportDesc}
                        onChange={(e) => setNewReportDesc(e.target.value)}
                        placeholder="Please specify address details, odor level, or duration of the issue..."
                        className="w-full bg-surface-container-low border border-outline-variant/30 p-3 rounded-lg text-sm font-medium focus:outline-primary"
                      />
                    </div>

                    <div className="flex gap-2">
                      <button 
                        type="button" 
                        onClick={() => { setLocationAcquired(true); setNewReportLoc('-6.7915, 39.2312 (Kariakoo North)'); }}
                        className="flex-1 bg-surface-container-high h-11 rounded-lg text-xs font-bold text-primary flex items-center justify-center gap-1.5 border border-outline-variant/30 hover:bg-[#cee9d3]/10"
                      >
                        <span className="material-symbols-outlined text-sm">{locationAcquired ? 'gps_fixed' : 'my_location'}</span>
                        {locationAcquired ? 'GPS Fixed' : 'Get Location'}
                      </button>
                      <button 
                        type="button"
                        onClick={() => triggerToast('Mock photo captured! Attachment added.')}
                        className="flex-1 bg-surface-container-high h-11 rounded-lg text-xs font-bold text-primary flex items-center justify-center gap-1.5 border border-outline-variant/30 hover:bg-[#cee9d3]/10"
                      >
                        <span className="material-symbols-outlined text-sm">photo_camera</span>
                        Add Photo
                      </button>
                    </div>
                    
                    <div className="text-[10px] text-on-surface-variant flex items-center gap-1 bg-surface-container-low p-2 rounded-lg">
                      <span className="material-symbols-outlined text-xs">location_on</span>
                      <span>Location: {newReportLoc}</span>
                    </div>
                  </div>

                  <button 
                    type="submit" 
                    className="w-full bg-primary text-white h-12 rounded-xl font-bold flex items-center justify-center gap-1 shadow-sm hover:opacity-95"
                  >
                    <span className="material-symbols-outlined text-sm font-bold">send</span>
                    Submit Grievance Report
                  </button>
                </form>
              )}

              {/* Citizen Card Screen */}
              {citizenTab === 'card' && (
                <div className="flex flex-col items-center gap-5 py-3 text-center animate-[fadeIn_0.3s_ease-out]">
                  <div>
                    <h2 className="text-xl font-extrabold">My Service Card</h2>
                    <p className="text-xs text-on-surface-variant">Present this QR identifier to your collector</p>
                  </div>

                  <div className="bg-gradient-to-br from-primary to-[#2d6a4f] text-white w-full max-w-sm p-6 rounded-2xl shadow-xl border border-primary-container relative overflow-hidden flex flex-col gap-6">
                    <div className="absolute top-0 right-0 w-32 h-32 bg-white/5 rounded-full blur-xl"></div>
                    <div className="flex justify-between items-start">
                      <div className="text-left">
                        <p className="text-[10px] font-bold tracking-widest text-[#a8e7c5] uppercase font-mono">Tanzania Waste Authority</p>
                        <h4 className="text-lg font-black tracking-tight mt-0.5">Elias Mwakalebela</h4>
                      </div>
                      <span className="bg-[#a8e7c5] text-primary px-2.5 py-0.5 rounded-full text-[9px] font-bold font-mono">ACTIVE</span>
                    </div>

                    {/* QR with Laser line animation */}
                    <div className="bg-white p-4 rounded-xl shadow-inner w-44 h-44 mx-auto relative overflow-hidden flex items-center justify-center">
                      <img src={IMAGES.qr} alt="QR Code" className="w-full h-full object-contain" />
                      <div className="absolute left-0 right-0 h-1.5 bg-[#4cdd88] opacity-70 scan-line rounded-full shadow-[0_0_10px_#4cdd88]"></div>
                    </div>

                    <div className="flex justify-between items-center text-left font-mono">
                      <div>
                        <p className="text-[9px] text-[#a8e7c5] uppercase">MEMBER NO.</p>
                        <p className="text-xs font-bold">WST-29402</p>
                      </div>
                      <div className="text-right">
                        <p className="text-[9px] text-[#a8e7c5] uppercase">ZONE</p>
                        <p className="text-xs font-bold">ZONE-4 UPANGA</p>
                      </div>
                    </div>
                  </div>
                </div>
              )}

              {/* Citizen Notifications Screen */}
              {citizenTab === 'notifications' && (
                <div className="flex flex-col gap-3 animate-[fadeIn_0.3s_ease-out]">
                  <div className="flex justify-between items-center">
                    <div>
                      <h2 className="text-xl font-extrabold text-on-surface">Notifications</h2>
                      <p className="text-xs text-on-surface-variant">Service updates & collection status alerts</p>
                    </div>
                    <button 
                      onClick={() => {
                        setNotifications(prev => prev.map(n => ({ ...n, unread: false })));
                        triggerToast('Marked all as read.');
                      }}
                      className="text-xs font-bold text-primary hover:underline cursor-pointer"
                    >
                      Mark all as read
                    </button>
                  </div>

                  <div className="flex flex-col gap-2">
                    {notifications.map(n => (
                      <div key={n.id} className={`p-4 rounded-xl shadow-xs border transition-all flex gap-3 ${n.unread ? 'bg-[#cee9d3]/10 border-primary/20' : 'bg-white border-outline-variant/10'}`}>
                        <div className={`w-9 h-9 rounded-full flex items-center justify-center shrink-0`}>
                          <span className="material-symbols-outlined text-sm font-bold text-primary">{n.icon}</span>
                        </div>
                        <div className="flex-1 flex flex-col gap-0.5">
                          <div className="flex justify-between items-baseline">
                            <h4 className="text-xs font-bold text-on-surface">{n.title}</h4>
                            <span className="text-[9px] text-on-surface-variant font-medium">{n.time}</span>
                          </div>
                          <p className="text-xs text-on-surface-variant font-medium leading-relaxed">{n.message}</p>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Citizen Profile Screen */}
              {citizenTab === 'profile' && (
                <div className="flex flex-col gap-5 animate-[fadeIn_0.3s_ease-out]">
                  <div className="bg-white p-5 rounded-2xl border border-outline-variant/20 shadow-sm flex flex-col items-center gap-3 text-center">
                    <img className="w-20 h-20 rounded-full object-cover border-4 border-primary shadow-md" src={IMAGES.elias} alt="Elias" />
                    <div>
                      <h3 className="text-lg font-extrabold text-on-surface">Elias Mwakalebela</h3>
                      <p className="text-xs text-on-surface-variant mt-0.5">+255 783 222 111 • Citizen Member</p>
                    </div>
                    <button 
                      onClick={() => triggerToast('Profile details updated')}
                      className="bg-surface-container-high px-4 py-1.5 rounded-full text-xs font-bold text-primary hover:bg-[#cee9d3]/15 transition-all cursor-pointer"
                    >
                      Edit Profile Details
                    </button>
                  </div>

                  <div className="bg-white rounded-xl border border-outline-variant/20 overflow-hidden shadow-xs">
                    {[
                      { title: 'Account Settings', desc: 'Manage password, alerts, and preferences', icon: 'settings' },
                      { title: 'Address Information', desc: 'Plot 42, Block G, Upanga South', icon: 'location_on' },
                      { title: 'Linked Payment Methods', desc: 'M-Pesa registered account', icon: 'credit_card' },
                      { title: 'Help & Municipal Support', desc: 'Call TMWA helpline', icon: 'help' }
                    ].map((item, idx) => (
                      <div key={idx} className="p-4 border-b border-outline-variant/10 hover:bg-surface-container-low cursor-pointer flex justify-between items-center transition-colors">
                        <div className="flex items-center gap-3">
                          <span className="material-symbols-outlined text-on-surface-variant text-base">{item.icon}</span>
                          <div className="text-left">
                            <h4 className="text-xs font-bold text-on-surface">{item.title}</h4>
                            <p className="text-[10px] text-on-surface-variant">{item.desc}</p>
                          </div>
                        </div>
                        <span className="material-symbols-outlined text-on-surface-variant text-xs">chevron_right</span>
                      </div>
                    ))}
                  </div>

                  <button 
                    onClick={() => { setRole('citizen'); triggerToast('Logged out.'); }}
                    className="w-full bg-error-container text-error h-11 rounded-xl font-bold text-xs flex items-center justify-center gap-1 border border-error/10 hover:bg-error-container/80 transition-all cursor-pointer"
                  >
                    <span className="material-symbols-outlined text-sm font-bold">logout</span>
                    Logout Citizen Account
                  </button>
                </div>
              )}
            </main>

            {/* Citizen Bottom Navigation Bar */}
            <nav className="fixed bottom-0 left-0 right-0 h-[68px] bg-white border-t border-outline-variant/30 flex items-center justify-around px-2 shadow-lg z-50">
              {[
                { id: 'home', label: 'Home', icon: 'home' },
                { id: 'tracking', label: 'Tracking', icon: 'my_location' },
                { id: 'payments', label: 'Payments', icon: 'payments' },
                { id: 'reports', label: 'Reports', icon: 'report_problem' },
                { id: 'profile', label: 'Profile', icon: 'person' }
              ].map(tab => (
                <button
                  key={tab.id}
                  onClick={() => setCitizenTab(tab.id as any)}
                  className={`flex flex-col items-center justify-center gap-1 w-14 h-14 rounded-xl transition-all cursor-pointer ${citizenTab === tab.id ? 'text-primary' : 'text-on-surface-variant'}`}
                >
                  <span className={`material-symbols-outlined text-lg ${citizenTab === tab.id ? 'font-bold text-primary' : 'text-on-surface-variant'}`}>{tab.icon}</span>
                  <span className="text-[10px] font-bold tracking-tight">{tab.label}</span>
                </button>
              ))}
            </nav>
          </div>
        )}

{/* 2. DRIVER PORTAL */}
{role === 'driver' && (
  <div className="flex-1 flex flex-col pb-[80px]">
    {/* Driver Header */}
    <header className="sticky top-0 w-full z-40 backdrop-blur-xl bg-[#fcf8fb]/80 border-b border-outline-variant/30 flex justify-between items-center px-5 py-3 shadow-sm">
      <div className="flex items-center gap-3">
        <img className="w-10 h-10 rounded-full object-cover border-2 border-primary shadow-sm" src={IMAGES.marcus} alt="Marcus" />
        <div>
          <h1 className="text-xs text-on-surface-variant font-medium uppercase tracking-wider">Field Operator Portal</h1>
          <p className="text-sm font-extrabold text-primary flex items-center gap-1">
            <span className="material-symbols-outlined text-xs">badge</span>
            Marcus Thorne (V-WM402)
          </p>
        </div>
      </div>
      <div className="bg-[#eef4fd] text-primary px-3 py-1 rounded-full text-xs font-bold flex items-center gap-1.5 shadow-xs border border-[#abc7ff]/20 font-mono">
        <span className="w-2 h-2 rounded-full bg-primary animate-pulse"></span>
        SH-06:45m
      </div>
    </header>

    <main className="flex-1 px-4 py-5 max-w-lg mx-auto w-full flex flex-col gap-5">
      {(() => {
        switch (driverTab) {
          case 'home':
            return (
              <div className="flex flex-col gap-4 animate-[fadeIn_0.3s_ease-out]">
                <div>
                  <h2 className="text-xl font-extrabold text-on-surface">Habari, Alex (Operator)</h2>
                  <p className="text-xs text-on-surface-variant">Ready for today's assignment? Check active routes below.</p>
                </div>

                {/* Route Progress Widget */}
                <div className="bg-gradient-to-br from-[#2d6a4f] to-primary text-white p-5 rounded-2xl shadow-md relative overflow-hidden flex justify-between items-center">
                  <div className="flex flex-col gap-1.5">
                    <span className="text-[10px] font-bold uppercase tracking-widest text-[#a8e7c5]">Route Progress</span>
                    <p className="text-lg font-black">Route 04 - Upanga South</p>
                    <p className="text-xs text-[#cee9d3]">Est. completion • 14:30 PM</p>
                  </div>
                  {/* SVG circular progress */}
                  <div className="relative w-16 h-16 flex items-center justify-center shrink-0 bg-white/10 rounded-full">
                    <svg className="w-14 h-14" viewBox="0 0 36 36">
                      <path className="text-white/20" stroke="currentColor" strokeWidth="3" fill="none" d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831" />
                      <path className="text-[#a8e7c5]" strokeDasharray={`${Math.round((completedStops / 48) * 100)}, 100`} stroke="currentColor" strokeWidth="3" strokeLinecap="round" fill="none" d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831" />
                    </svg>
                    <div className="absolute flex flex-col items-center">
                      <span className="text-xs font-black">{completedStops}</span>
                      <span className="text-[7px] text-white/80 font-bold">/48</span>
                    </div>
                  </div>
                </div>

                {/* Quick Actions for Driver */}
                <div className="grid grid-cols-3 gap-2.5">
                  {[
                    { tab: 'route', title: 'Start Route', icon: 'navigation', bg: 'bg-[#cee9d3]' },
                    { tab: 'scan', title: 'Scan QR', icon: 'qr_code_scanner', bg: 'bg-[#cee9d3]' },
                    { tab: 'reports', title: 'Report Issue', icon: 'report_problem', bg: 'bg-error-container text-error' }
                  ].map((item, idx) => (
                    <button 
                      key={idx} 
                      onClick={() => setDriverTab(item.tab as any)}
                      className="bg-white p-4 rounded-xl shadow-xs border border-outline-variant/10 flex flex-col items-center justify-center gap-2 hover:bg-surface-container-low transition-colors"
                    >
                      <div className={`w-10 h-10 rounded-full flex items-center justify-center text-primary ${item.bg}`}>
                        <span className="material-symbols-outlined text-base font-bold">{item.icon}</span>
                      </div>
                      <span className="text-[10px] font-bold text-on-surface text-center leading-tight">{item.title}</span>
                    </button>
                  ))}
                </div>

                {/* Stop info list summary */}
                <div className="bg-white p-4 rounded-2xl border border-outline-variant/20 shadow-xs flex flex-col gap-3">
                  <div className="flex justify-between items-center border-b border-outline-variant/10 pb-2">
                    <h4 className="text-xs font-bold text-on-surface uppercase tracking-wider">Immediate Stop Details</h4>
                    <span className="bg-[#eef4fd] text-[#005dbd] px-2 py-0.5 rounded text-[8px] font-mono font-bold font-mono">Stop 4 of 12</span>
                  </div>
                  <div className="flex items-start gap-3">
                    <div className="w-8 h-8 rounded-full bg-secondary-container text-primary flex items-center justify-center shrink-0">
                      <span className="material-symbols-outlined text-sm">location_on</span>
                    </div>
                    <div>
                      <h5 className="text-xs font-bold text-on-surface">Kariakoo Market, Block B</h5>
                      <p className="text-[10px] text-on-surface-variant mt-0.5">Commercial bins collection • 15 Units</p>
                    </div>
                  </div>
                  <button 
                    onClick={() => setDriverTab('route')}
                    className="w-full bg-[#cee9d3] text-primary hover:bg-[#cee9d3]/80 font-bold text-xs py-2.5 rounded-lg transition-colors flex items-center justify-center gap-1"
                  >
                    <span className="material-symbols-outlined text-sm">play_arrow</span> Open Active Stop controls
                  </button>
                </div>
              </div>
            );

          case 'route':
            return (
              <div className="flex flex-col gap-4 animate-[fadeIn_0.3s_ease-out]">
                <div>
                  <h2 className="text-xl font-extrabold text-on-surface">Route Stops Manager</h2>
                  <p className="text-xs text-on-surface-variant">Manage scheduled collection stops for Vehicle WM-402</p>
                </div>

                {/* Stops list accordions */}
                <div className="flex flex-col gap-2">
                  {stops.map(stop => (
                    <div 
                      key={stop.id} 
                      onClick={() => stop.status === 'Pending' && setActiveStopId(stop.id)}
                      className={`p-4 rounded-xl border cursor-pointer transition-all ${stop.id === activeStopId ? 'bg-[#cee9d3]/15 border-primary shadow-sm' : 'bg-white border-outline-variant/10 hover:bg-surface-container-low'}`}
                    >
                      <div className="flex justify-between items-start gap-2">
                        <div className="flex items-start gap-2.5">
                          <span className={`material-symbols-outlined text-sm font-bold mt-0.5 ${stop.status === 'Completed' ? 'text-primary' : stop.status === 'Failed' ? 'text-error animate-pulse' : 'text-on-surface-variant'}`}>
                            {stop.status === 'Completed' ? 'check_circle' : stop.status === 'Failed' ? 'error' : 'circle_notifications'}
                          </span>
                          <div>
                            <h4 className="text-xs font-bold text-on-surface">{stop.address}</h4>
                            <p className="text-[10px] text-on-surface-variant mt-0.5">{stop.type} • {stop.bins} Bins • {stop.estTime}</p>
                          </div>
                        </div>
                        <span className={`px-2 py-0.5 rounded text-[8px] font-bold ${stop.status === 'Completed' ? 'bg-[#beead1] text-primary' : stop.status === 'Failed' ? 'bg-error-container text-error' : 'bg-surface-container text-on-surface-variant'}`}>
                          {stop.status}
                        </span>
                      </div>

                      {/* Expand details for active stop */}
                      {stop.id === activeStopId && stop.status === 'Pending' && (
                        <div className="mt-4 pt-3 border-t border-outline-variant/20 flex flex-col gap-3 animate-[fadeIn_0.2s_ease-out]">
                          <div className="flex items-center gap-1.5 bg-[#eef4fd] text-primary p-2 rounded-lg text-[10px] font-bold">
                            <span className="material-symbols-outlined text-xs">info</span>
                            <span>Start collection now. Ensure proper scan logs or QR check!</span>
                          </div>
                          <div className="grid grid-cols-2 gap-2">
                            <button 
                              onClick={(e) => { e.stopPropagation(); setNavulating(!navulating); }}
                              className={`h-10 rounded-lg text-xs font-bold flex items-center justify-center gap-1 transition-all ${navulating ? 'bg-primary text-white' : 'bg-surface-container-high text-primary border border-outline-variant/20'}`}
                            >
                              <span className="material-symbols-outlined text-sm">explore</span>
                              {navulating ? 'Navigation Active' : 'Start Navigation'}
                            </button>
                            <button 
                              onClick={(e) => { e.stopPropagation(); completeCollection(); }}
                              disabled={collectingState}
                              className="bg-primary text-white h-10 rounded-lg text-xs font-bold flex items-center justify-center gap-1 hover:opacity-90 active:scale-98"
                            >
                              {collectingState ? (
                                <span className="w-3.5 h-3.5 border-2 border-white border-t-transparent rounded-full animate-spin"></span>
                              ) : (
                                <>
                                  <span className="material-symbols-outlined text-sm font-bold">delete_sweep</span>
                                  Start Collection
                                </>
                              )}
                            </button>
                          </div>
                          {navulating && (
                            <div className="bg-surface-container-low p-2 rounded-lg border border-outline-variant/10 text-left">
                              <p className="text-[10px] font-black text-primary">GPS Navigation instructions:</p>
                              <p className="text-[10px] text-on-surface-variant font-medium mt-0.5">Turn right in 200m on Kariakoo Market St, then head to loading bay.</p>
                            </div>
                          )}
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              </div>
            );

          case 'scan':
            return (
              <div className="flex flex-col gap-4 items-center text-center animate-[fadeIn_0.3s_ease-out]">
                <div>
                  <h2 className="text-xl font-extrabold text-on-surface">Mwananchi QR Scanner</h2>
                  <p className="text-xs text-on-surface-variant">Scan QR card to verify payment & activate loading clearance</p>
                </div>

                {/* Scanner Frame */}
                <div className="bg-[#1b1b1d] w-full max-w-sm aspect-square rounded-2xl relative border-4 border-outline overflow-hidden shadow-xl flex items-center justify-center text-white p-6">
                  {/* Scanner corners */}
                  <div className="absolute top-4 left-4 w-6 h-6 border-t-4 border-l-4 border-[#4cdd88]"></div>
                  <div className="absolute top-4 right-4 w-6 h-6 border-t-4 border-r-4 border-[#4cdd88]"></div>
                  <div className="absolute bottom-4 left-4 w-6 h-6 border-b-4 border-l-4 border-[#4cdd88]"></div>
                  <div className="absolute bottom-4 right-4 w-6 h-6 border-b-4 border-r-4 border-[#4cdd88]"></div>

                  {/* Laser scan line */}
                  <div className="absolute left-0 right-0 h-1 bg-[#4cdd88] scan-line shadow-[0_0_8px_#4cdd88]"></div>

                  <div className="text-center z-10 flex flex-col gap-2">
                    <span className="material-symbols-outlined text-4xl text-[#4cdd88] animate-pulse">qr_code_scanner</span>
                    <p className="text-xs font-bold text-white/90">Position citizen card QR code inside frame</p>
                  </div>
                </div>

                <button 
                  onClick={() => {
                    alert('SIMULATED SCAN SUCCESSFUL:\n\nName: Elias Mwakalebela\nMember ID: WST-29402\nZone: Zone 4 Upanga\nPayment Status: ACTIVE (Paid)\n\nCollection clearance authorized.');
                    triggerToast('QR Scan Verified: Authorized collector');
                  }}
                  className="w-full bg-primary text-white h-11 rounded-xl font-bold text-xs flex items-center justify-center gap-1 hover:opacity-95 shadow-sm"
                >
                  <span className="material-symbols-outlined text-sm">camera</span>
                  Simulate Successful Scan
                </button>
              </div>
            );

          case 'reports':
            return (
              <div className="flex flex-col gap-4 animate-[fadeIn_0.3s_ease-out]">
                <div>
                  <h2 className="text-xl font-extrabold text-on-surface">Report Field Incident</h2>
                  <p className="text-xs text-on-surface-variant">Report service delays, road obstacles, or truck breakdowns</p>
                </div>

                <div className="bg-white p-4 rounded-xl border border-outline-variant/30 flex flex-col gap-3 shadow-xs">
                  <div>
                    <label className="text-xs font-bold text-on-surface block mb-1">Incident Type</label>
                    <div className="grid grid-cols-2 gap-2">
                      {['Breakdown', 'Blocked Road', 'Hazard', 'Other'].map(type => (
                        <button 
                          key={type} 
                          type="button"
                          onClick={() => setDriverSelectedIssueType(type)}
                          className={`py-2 px-3 rounded-lg text-xs font-bold border transition-all ${driverSelectedIssueType === type ? 'bg-primary/5 border-primary text-primary' : 'bg-surface-container-low border-outline-variant/20 text-on-surface-variant'}`}
                        >
                          {type}
                        </button>
                      ))}
                    </div>
                  </div>

                  <div>
                    <label className="text-xs font-bold text-on-surface block mb-1">Details & Location Description</label>
                    <textarea 
                      rows={3}
                      value={driverIssueDesc}
                      onChange={(e) => setDriverIssueDesc(e.target.value)}
                      placeholder="Provide specific details about blockage, breakdown nature, or street location..."
                      className="w-full bg-surface-container-low border border-outline-variant/30 p-3 rounded-lg text-sm font-medium focus:outline-primary"
                    />
                  </div>

                  <div className="flex gap-2">
                    <button 
                      type="button" 
                      onClick={() => { setDriverLocationAcquired(true); }}
                      className="flex-1 bg-surface-container-high h-11 rounded-lg text-xs font-bold text-primary flex items-center justify-center gap-1.5 border border-outline-variant/30"
                    >
                      <span className="material-symbols-outlined text-sm">{driverLocationAcquired ? 'gps_fixed' : 'my_location'}</span>
                      {driverLocationAcquired ? 'Location Fixed' : 'Get GPS'}
                    </button>
                    <button 
                      type="button"
                      onClick={() => { setDriverPhoto(true); triggerToast('Camera simulation: Photo attached'); }}
                      className="flex-1 bg-surface-container-high h-11 rounded-lg text-xs font-bold text-primary flex items-center justify-center gap-1.5 border border-outline-variant/30"
                    >
                      <span className="material-symbols-outlined text-sm">photo_camera</span>
                      {driverPhoto ? 'Photo Attached' : 'Add Photo'}
                    </button>
                  </div>

                  <div className="text-[10px] text-on-surface-variant flex items-center gap-1 bg-surface-container-low p-2 rounded-lg font-mono">
                    <span className="material-symbols-outlined text-xs">location_on</span>
                    <span>Coordinates: -6.7821° S, 39.2443° E (Ah. Mwinyi Rd)</span>
                  </div>
                </div>

                <button 
                  onClick={submitDriverReport}
                  className="w-full bg-primary text-white h-12 rounded-xl font-bold flex items-center justify-center gap-1 hover:opacity-95"
                >
                  <span className="material-symbols-outlined text-sm font-bold">report</span>
                  Submit Incident Report
                </button>
              </div>
            );

          case 'profile':
            return (
              <div className="flex flex-col gap-4 animate-[fadeIn_0.3s_ease-out]">
                <div className="bg-white p-5 rounded-2xl border border-outline-variant/20 shadow-sm flex flex-col items-center gap-3 text-center">
                  <img className="w-20 h-20 rounded-full object-cover border-4 border-primary shadow-md" src={IMAGES.marcus} alt="Marcus" />
                  <div>
                    <h3 className="text-lg font-extrabold text-on-surface">Marcus Thorne</h3>
                    <p className="text-xs text-on-surface-variant mt-0.5 font-mono">Senior Field Operator • Employee #TMWA-920</p>
                  </div>
                </div>

                {/* Bento Stats Grid */}
                <div className="grid grid-cols-3 gap-2">
                  <div className="bg-white p-3 rounded-xl border border-outline-variant/10 shadow-xs text-center flex flex-col items-center justify-center">
                    <span className="text-[8px] font-bold text-on-surface-variant uppercase block">Assigned Unit</span>
                    <span className="text-xs font-black text-primary mt-1 font-mono">V-WM402</span>
                  </div>
                  <div className="bg-white p-3 rounded-xl border border-outline-variant/10 shadow-xs text-center flex flex-col items-center justify-center">
                    <span className="text-[8px] font-bold text-on-surface-variant uppercase block">Shift Time</span>
                    <span className="text-xs font-black text-primary mt-1 font-mono">06h 45m</span>
                  </div>
                  <div className="bg-white p-3 rounded-xl border border-outline-variant/10 shadow-xs text-center flex flex-col items-center justify-center">
                    <span className="text-[8px] font-bold text-on-surface-variant uppercase block">Shift Ledger</span>
                    <span className="text-xs font-black text-primary mt-1 font-mono">TZS 450k</span>
                  </div>
                </div>

                <button 
                  onClick={() => { setRole('citizen'); triggerToast('Logged out.'); }}
                  className="w-full bg-error-container text-error h-11 rounded-xl font-bold text-xs flex items-center justify-center gap-1 border border-error/10 hover:opacity-90"
                >
                  <span className="material-symbols-outlined text-sm font-bold">logout</span>
                  Logout Operator Account
                </button>
              </div>
            );
          default:
            return null;
        }
      })()}
    </main>

    {/* Driver Bottom Nav */}
    <nav className="fixed bottom-0 left-0 right-0 h-[68px] bg-white border-t border-outline-variant/30 flex items-center justify-around px-2 shadow-lg z-50">
      {[
        { id: 'home', label: 'Home', icon: 'home' },
        { id: 'route', label: 'Route Stops', icon: 'navigation' },
        { id: 'scan', label: 'Scan Card', icon: 'qr_code_scanner' },
        { id: 'reports', label: 'Reports', icon: 'report_problem' },
        { id: 'profile', label: 'Profile', icon: 'person' }
      ].map(tab => (
        <button
          key={tab.id}
          onClick={() => setDriverTab(tab.id as any)}
          className={`flex flex-col items-center justify-center gap-1 w-14 h-14 rounded-xl transition-all ${driverTab === tab.id ? 'text-primary' : 'text-on-surface-variant'}`}
        >
          <span className="material-symbols-outlined text-lg">{tab.icon}</span>
          <span className="text-[9px] font-bold tracking-tight">{tab.label}</span>
        </button>
      ))}
    </nav>
  </div>
)}

{/* 3. ADMIN PORTAL */}
{role === 'admin' && (
  <div className="flex-1 flex flex-col md:flex-row pb-12">
    {/* Left Desktop Sidebar / Mobile Horizontal Header */}
    <aside className="md:w-64 bg-[#0a3826] text-white flex flex-col shrink-0 border-r border-[#0e5138]">
      <div className="p-5 border-b border-[#0e5138] hidden md:flex items-center gap-3">
        <img className="w-10 h-10 rounded-full object-cover border border-primary-container" src={IMAGES.executive} alt="Executive" />
        <div>
          <h4 className="text-xs text-[#a8e7c5] uppercase tracking-wider font-bold">Executive Admin</h4>
          <p className="text-sm font-extrabold text-white">B. Mshana</p>
        </div>
      </div>
      {/* Navigation Links */}
      <nav className="p-3 flex md:flex-col gap-1 overflow-x-auto hide-scrollbar shrink-0">
        {[
          { id: 'dashboard', label: 'Overview Dashboard', icon: 'dashboard' },
          { id: 'citizens', label: 'Citizen Accounts', icon: 'person_search' },
          { id: 'tracking', label: 'GPS Fleet Tracking', icon: 'radar' },
          { id: 'reports', label: 'Complaints Center', icon: 'report_problem' }
        ].map(item => (
          <button
            key={item.id}
            onClick={() => setAdminTab(item.id as any)}
            className={`flex items-center gap-3 px-4 py-3 rounded-lg text-xs font-bold text-left transition-all shrink-0 md:w-full ${adminTab === item.id ? 'bg-[#a8e7c5] text-primary shadow-sm' : 'text-[#cee9d3] hover:bg-[#0e5138]'}`}
          >
            <span className="material-symbols-outlined text-base">{item.icon}</span>
            <span>{item.label}</span>
          </button>
        ))}
      </nav>
    </aside>

    {/* Admin Contents Panel */}
    <section className="flex-1 p-5 md:p-6 overflow-y-auto max-w-7xl mx-auto w-full flex flex-col gap-6">
      {(() => {
        switch (adminTab) {
          case 'dashboard':
            return (
              <div className="flex flex-col gap-6 animate-[fadeIn_0.3s_ease-out]">
                <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center gap-4">
                  <div>
                    <h2 className="text-2xl font-black text-on-surface tracking-tight">Operations Overview</h2>
                    <p className="text-xs text-on-surface-variant font-medium">TMWA waste management tracking metrics & GePG revenues</p>
                  </div>
                  <div className="flex items-center gap-2">
                    <button 
                      onClick={() => setShowAssignModal(true)}
                      className="bg-primary text-white text-xs px-4 py-2.5 rounded-lg font-bold hover:opacity-95 shadow-xs flex items-center gap-1 cursor-pointer"
                    >
                      <span className="material-symbols-outlined text-sm">directions_bus</span>
                      Assign Route
                    </button>
                    <button 
                      onClick={() => triggerToast('Mock data logs refreshed.')}
                      className="bg-white text-primary text-xs px-4 py-2.5 rounded-lg font-bold hover:bg-[#cee9d3]/15 border border-outline-variant/30 cursor-pointer"
                    >
                      System Sync
                    </button>
                  </div>
                </div>

                {/* KPI Cards Grid */}
                <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
                  {[
                    { title: 'Registered Citizens', value: '12,482', desc: '+4.2% MoM registered', color: 'border-l-primary' },
                    { title: 'Active Drivers', value: '450', desc: '82% currently active', color: 'border-l-secondary' },
                    { title: 'Fleet Vehicles', value: '380', desc: 'Active routes deployed', color: 'border-l-tertiary' },
                    { title: 'Revenue Today', value: `${revenueToday.toLocaleString()} TZS`, desc: 'GePG Direct collection', color: 'border-l-error' }
                  ].map((kpi, idx) => (
                    <div key={idx} className={`bg-white p-4 rounded-xl border border-outline-variant/25 shadow-xs flex flex-col gap-1 border-l-4 ${kpi.color}`}>
                      <span className="text-[10px] font-bold text-on-surface-variant uppercase tracking-wider">{kpi.title}</span>
                      <span className="text-xl font-black text-on-surface mt-0.5">{kpi.value}</span>
                      <span className="text-[9px] text-[#2d6a4f] font-medium">{kpi.desc}</span>
                    </div>
                  ))}
                </div>

                {/* Graphical Insights section */}
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
                  {/* Custom bar chart: Collection Efficiency */}
                  <div className="bg-white p-5 rounded-2xl border border-outline-variant/20 shadow-sm flex flex-col gap-4">
                    <div>
                      <h3 className="text-xs font-bold text-on-surface uppercase tracking-wider">Weekly Collection Efficiency</h3>
                      <p className="text-[10px] text-on-surface-variant mt-0.5 font-medium">Overall completed bins vs targeted</p>
                    </div>
                    <div className="h-44 flex items-end justify-between px-2 pt-4">
                      {[
                        { day: 'Mon', val: 78, h: 'h-[78%]' },
                        { day: 'Tue', val: 88, h: 'h-[88%]' },
                        { day: 'Wed', val: 92, h: 'h-[92%]' },
                        { day: 'Thu', val: 85, h: 'h-[85%]' },
                        { day: 'Fri', val: 94, h: 'h-[94%]' },
                        { day: 'Sat', val: 72, h: 'h-[72%]' },
                        { day: 'Sun', val: 65, h: 'h-[65%]' }
                      ].map((bar, idx) => (
                        <div key={idx} className="flex flex-col items-center gap-1.5 flex-1 group">
                          <div className="w-full max-w-[28px] bg-surface-container rounded-t-lg h-36 flex items-end overflow-hidden relative">
                            <div className={`w-full bg-primary rounded-t-md ${bar.h} transition-all duration-500 group-hover:bg-[#2d6a4f]`} />
                          </div>
                          <span className="text-[10px] font-bold text-on-surface-variant">{bar.day}</span>
                        </div>
                      ))}
                    </div>
                  </div>

                  {/* Revenue by Zone progress */}
                  <div className="bg-white p-5 rounded-2xl border border-outline-variant/20 shadow-sm flex flex-col gap-4">
                    <div>
                      <h3 className="text-xs font-bold text-on-surface uppercase tracking-wider">Revenue Collection by Zone</h3>
                      <p className="text-[10px] text-on-surface-variant mt-0.5 font-medium">Municipal targets performance progress</p>
                    </div>
                    <div className="flex flex-col gap-3 mt-1">
                      {[
                        { zone: 'Kariakoo Market District', val: '4.2M TZS', pr: 'w-[90%]' },
                        { zone: 'Kinondoni Central Block A', val: '3.8M TZS', pr: 'w-[78%]' },
                        { zone: 'Ilala Municipal Gate', val: '2.1M TZS', pr: 'w-[55%]' },
                        { zone: 'Temeke Zone 4 (Upanga)', val: '1.5M TZS', pr: 'w-[38%]' }
                      ].map((zone, idx) => (
                        <div key={idx} className="flex flex-col gap-1.5">
                          <div className="flex justify-between items-baseline text-xs font-bold text-on-surface">
                            <span>{zone.zone}</span>
                            <span className="text-primary font-mono">{zone.val}</span>
                          </div>
                          <div className="w-full bg-surface-container h-2 rounded-full overflow-hidden">
                            <div className={`bg-primary h-full rounded-full ${zone.pr}`} />
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>

                {/* Actionable Table Panel */}
                <div className="bg-white rounded-2xl border border-outline-variant/20 shadow-sm overflow-hidden flex flex-col">
                  <div className="p-4 border-b border-outline-variant/15 bg-white flex justify-between items-center">
                    <div>
                      <h4 className="text-xs font-bold text-on-surface uppercase tracking-wider">Latest Control Number Payments</h4>
                      <p className="text-[10px] text-on-surface-variant mt-0.5 font-medium">Real-time GePG direct receipts logs</p>
                    </div>
                    <span className="bg-[#beead1] text-primary px-2.5 py-0.5 rounded text-[8px] font-bold">AUTO SYNC ACTIVE</span>
                  </div>
                  <div className="overflow-x-auto">
                    <table className="w-full text-left text-xs border-collapse">
                      <thead>
                        <tr className="bg-surface-container text-on-surface-variant font-bold border-b border-outline-variant/10">
                          <th className="p-3">Citizen Name</th>
                          <th className="p-3">Receipt ID</th>
                          <th className="p-3">Collection Zone</th>
                          <th className="p-3">Amount</th>
                          <th className="p-3">Date</th>
                          <th className="p-3">Status</th>
                        </tr>
                      </thead>
                      <tbody>
                        {citizens.map((c, idx) => (
                          <tr key={idx} className="border-b border-outline-variant/10 hover:bg-surface-container-low">
                            <td className="p-3 font-bold text-on-surface">{c.name}</td>
                            <td className="p-3 font-mono">#GePG-{8200 + idx}</td>
                            <td className="p-3 text-on-surface-variant font-medium">{c.zone}</td>
                            <td className="p-3 font-bold text-primary">12,500 TZS</td>
                            <td className="p-3 text-on-surface-variant">Oct 20, 2023</td>
                            <td className="p-3">
                              <span className={`px-2 py-0.5 rounded-full text-[9px] font-bold ${c.paymentStatus === 'Paid' ? 'bg-[#beead1] text-primary' : 'bg-error-container text-error'}`}>
                                {c.paymentStatus}
                              </span>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </div>
              </div>
            );

          case 'citizens':
            return (
              <div className="flex flex-col gap-4 animate-[fadeIn_0.3s_ease-out]">
                <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center gap-3">
                  <div>
                    <h2 className="text-xl font-extrabold text-on-surface">Citizen Accounts Directory</h2>
                    <p className="text-xs text-on-surface-variant">Search or modify municipal waste membership registry</p>
                  </div>
                  <button 
                    onClick={() => setShowNewCitizenModal(true)}
                    className="bg-primary text-white text-xs font-bold px-4 py-2.5 rounded-lg flex items-center gap-1 hover:opacity-95 cursor-pointer"
                  >
                    <span className="material-symbols-outlined text-sm font-bold">person_add</span>
                    Add New Citizen
                  </button>
                </div>

                {/* Filtering Controls */}
                <div className="flex bg-white p-3 rounded-xl border border-outline-variant/20 shadow-xs gap-3">
                  <div className="flex-1 flex items-center gap-2 bg-surface-container h-10 px-3 rounded-lg">
                    <span className="material-symbols-outlined text-on-surface-variant text-sm">search</span>
                    <input 
                      type="text" 
                      placeholder="Search citizens by name, plate, ID, or phone number..."
                      value={searchCitizen}
                      onChange={(e) => setSearchCitizen(e.target.value)}
                      className="bg-transparent border-none text-xs w-full focus:outline-none"
                    />
                  </div>
                  <button 
                    onClick={() => setSearchCitizen('')}
                    className="bg-surface-container-high px-4 text-xs font-bold text-primary rounded-lg hover:bg-outline-variant/20 cursor-pointer"
                  >
                    Clear Search
                  </button>
                </div>

                {/* Citizens Grid */}
                <div className="bg-white rounded-xl border border-outline-variant/25 overflow-hidden shadow-sm">
                  <table className="w-full text-left text-xs border-collapse">
                    <thead>
                      <tr className="bg-surface-container-low text-on-surface-variant font-bold border-b border-outline-variant/10">
                        <th className="p-3">Citizen ID</th>
                        <th className="p-3">Full Name</th>
                        <th className="p-3">Phone Number</th>
                        <th className="p-3">Assigned Zone</th>
                        <th className="p-3">Payment Status</th>
                        <th className="p-3">QR Status</th>
                      </tr>
                    </thead>
                    <tbody>
                      {citizens.filter(c => c.name.toLowerCase().includes(searchCitizen.toLowerCase()) || c.id.toLowerCase().includes(searchCitizen.toLowerCase())).map((cit, idx) => (
                        <tr key={idx} className="border-b border-outline-variant/10 hover:bg-surface-container-low">
                          <td className="p-3 font-mono font-bold text-primary">{cit.id}</td>
                          <td className="p-3 font-bold text-on-surface">{cit.name}</td>
                          <td className="p-3 font-medium text-on-surface-variant">{cit.phone}</td>
                          <td className="p-3 text-on-surface-variant">{cit.zone}</td>
                          <td className="p-3">
                            <span className={`px-2.5 py-0.5 rounded-full text-[9px] font-bold ${cit.paymentStatus === 'Paid' ? 'bg-[#beead1] text-primary' : 'bg-error-container text-error'}`}>
                              {cit.paymentStatus}
                            </span>
                          </td>
                          <td className="p-3 text-on-surface-variant">
                            <span className="bg-[#beead1] text-primary px-2 py-0.5 rounded text-[9px] font-bold">ACTIVE</span>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            );

          case 'tracking':
            return (
              <div className="flex flex-col gap-4 animate-[fadeIn_0.3s_ease-out]">
                <div>
                  <h2 className="text-xl font-extrabold text-on-surface">Fleet Live GPS Monitor</h2>
                  <p className="text-xs text-on-surface-variant">Real-time coordinates telemetry of active municipal waste collectors</p>
                </div>

                <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
                  {/* Vector Map */}
                  <div className="lg:col-span-2 h-[350px] bg-[#eef4fd] rounded-2xl border border-outline-variant/40 overflow-hidden relative shadow-inner">
                    <svg className="absolute inset-0 w-full h-full" viewBox="0 0 100 100" preserveAspectRatio="none">
                      <path d="M 0,35 Q 35,50 60,40 T 100,45 L 100,100 L 0,100 Z" fill="#b1f0ce" opacity="0.3" />
                      {/* Street grids */}
                      <line x1="20" y1="0" x2="20" y2="100" stroke="#eae7ea" strokeWidth="0.5" />
                      <line x1="40" y1="0" x2="40" y2="100" stroke="#eae7ea" strokeWidth="0.5" />
                      <line x1="60" y1="0" x2="60" y2="100" stroke="#eae7ea" strokeWidth="0.5" />
                      <line x1="80" y1="0" x2="80" y2="100" stroke="#eae7ea" strokeWidth="0.5" />
                      {/* Active Route paths */}
                      <path d="M 20,10 L 40,50 L 80,60" fill="none" stroke="#2c694e" strokeWidth="1.5" strokeDasharray="3,3" />
                    </svg>

                    {/* Active moving vehicle markers on administrative map */}
                    {fleet.map((v, idx) => (
                      <div 
                        key={idx} 
                        style={{ top: `${v.y}%`, left: `${v.x}%` }}
                        className="absolute -translate-x-1/2 -translate-y-1/2 flex flex-col items-center group cursor-pointer transition-all duration-1000"
                        title={v.plate}
                      >
                        <div className={`w-8 h-8 rounded-full shadow-md flex items-center justify-center border-2 border-white text-white ${v.status === 'Breakdown' ? 'bg-error animate-bounce' : 'bg-primary'}`}>
                          <span className="material-symbols-outlined text-[14px]">local_shipping</span>
                        </div>
                        <span className="bg-white text-on-surface border border-outline-variant/30 text-[8px] font-bold px-1.5 py-0.5 rounded shadow-xs mt-1 font-mono">{v.plate}</span>
                      </div>
                    ))}
                  </div>

                  {/* Fleet Details list */}
                  <div className="flex flex-col gap-2 bg-white p-4 rounded-2xl border border-outline-variant/20 shadow-xs max-h-[350px] overflow-y-auto">
                    <h4 className="text-xs font-bold text-on-surface uppercase tracking-wider mb-2">Active Telemetry Fleet</h4>
                    {fleet.map((v, idx) => (
                      <div key={idx} className="p-3 rounded-lg bg-surface-container-low border border-outline-variant/15 flex flex-col gap-1.5">
                        <div className="flex justify-between items-center">
                          <div className="flex items-center gap-1.5">
                            <span className={`w-2 h-2 rounded-full ${v.status === 'Breakdown' ? 'bg-error animate-ping' : 'bg-primary animate-pulse'}`} />
                            <span className="font-mono font-bold text-xs">{v.plate}</span>
                          </div>
                          <span className={`px-2 py-0.5 rounded text-[8px] font-bold ${v.status === 'Breakdown' ? 'bg-error-container text-error' : 'bg-[#beead1] text-primary'}`}>
                            {v.status}
                          </span>
                        </div>
                        <div className="flex justify-between items-baseline text-[10px] text-on-surface-variant font-semibold">
                          <span>Speed: {v.speed}</span>
                          <span>Fuel level: {v.fuel}</span>
                        </div>
                        <div className="text-[9px] text-[#2c694e] font-bold uppercase tracking-wider font-mono">
                          {v.route}
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            );

          case 'reports':
            return (
              <div className="flex flex-col gap-4 animate-[fadeIn_0.3s_ease-out]">
                <div>
                  <h2 className="text-xl font-extrabold text-on-surface">Complaints & Grievance Registry</h2>
                  <p className="text-xs text-on-surface-variant">Inspect citizen filed dumping reports & assign field officers</p>
                </div>

                <div className="grid grid-cols-1 lg:grid-cols-3 gap-5">
                  {/* Left: Complaints List */}
                  <div className="lg:col-span-2 flex flex-col gap-2 max-h-[500px] overflow-y-auto pr-1">
                    {complaints.map(complaint => (
                      <div 
                        key={complaint.id}
                        onClick={() => setAdminSelectedComplaint(complaint)}
                        className={`p-4 rounded-xl border cursor-pointer transition-all flex flex-col gap-2.5 ${adminSelectedComplaint?.id === complaint.id ? 'bg-[#cee9d3]/15 border-primary shadow-sm' : 'bg-white border-outline-variant/15 hover:bg-surface-container-low'}`}
                      >
                        <div className="flex justify-between items-start gap-2">
                          <div>
                            <div className="flex items-center gap-2">
                              <span className="font-mono font-bold text-primary text-xs">{complaint.id}</span>
                              <span className={`text-[8px] px-2 py-0.5 rounded font-black ${complaint.urgency === 'CRITICAL' ? 'bg-error-container text-error' : 'bg-secondary-container text-primary'}`}>
                                {complaint.urgency}
                              </span>
                            </div>
                            <h4 className="text-xs font-bold text-on-surface mt-1.5">{complaint.location}</h4>
                            <p className="text-[10px] text-on-surface-variant mt-0.5">{complaint.type} • Filed {complaint.timestamp}</p>
                          </div>
                          <span className={`px-2.5 py-1 rounded-full text-[9px] font-bold uppercase tracking-wider ${complaint.status === 'Resolved' ? 'bg-[#beead1] text-primary' : complaint.status === 'Processing' ? 'bg-[#cee9d3] text-primary' : 'bg-surface-container text-on-surface-variant'}`}>
                            {complaint.status}
                          </span>
                        </div>
                        <p className="text-xs text-on-surface-variant font-medium leading-relaxed line-clamp-2">{complaint.description}</p>
                      </div>
                    ))}
                  </div>

                  {/* Right: Selected Detail Inspector Pane */}
                  <div className="bg-white p-5 rounded-2xl border border-outline-variant/20 shadow-sm flex flex-col gap-4">
                    {adminSelectedComplaint ? (
                      <div className="flex flex-col gap-4 animate-[fadeIn_0.2s_ease-out]">
                        <div className="border-b border-outline-variant/10 pb-3">
                          <span className="text-[9px] text-on-surface-variant font-bold uppercase tracking-wider block">Grievance Inspector</span>
                          <h3 className="text-base font-black text-on-surface mt-1">{adminSelectedComplaint.id}</h3>
                          <p className="text-[10px] text-on-surface-variant mt-0.5">Reporter: {adminSelectedComplaint.reporter} ({adminSelectedComplaint.phone})</p>
                        </div>

                        {adminSelectedComplaint.imageUrl && (
                          <div className="relative rounded-xl overflow-hidden border border-outline-variant/20 max-h-40">
                            <img src={adminSelectedComplaint.imageUrl} alt="Incident Attachment" className="w-full h-full object-cover" />
                            <div className="absolute bottom-2 left-2 bg-black/60 backdrop-blur-md text-white font-mono text-[8px] px-1.5 py-0.5 rounded">
                              GPS Coordinates: {adminSelectedComplaint.coords || '-6.7725, 39.2205'}
                            </div>
                          </div>
                        )}

                        <div className="flex flex-col gap-1.5 text-xs">
                          <span className="font-bold text-on-surface">Citizen Description:</span>
                          <p className="text-on-surface-variant leading-relaxed bg-surface-container-low p-3 rounded-lg border border-outline-variant/10 font-medium">
                            {adminSelectedComplaint.description}
                          </p>
                        </div>

                        <div className="flex flex-col gap-1 text-xs">
                          <span className="font-bold text-on-surface">Assigned Officer:</span>
                          <span className="text-primary font-extrabold">{adminSelectedComplaint.assignedOfficer}</span>
                        </div>

                        {adminSelectedComplaint.status !== 'Resolved' && (
                          <div className="grid grid-cols-2 gap-2 mt-2">
                            <button 
                              onClick={() => {
                                setComplaints(prev => prev.map(c => c.id === adminSelectedComplaint.id ? { ...c, status: 'Processing', assignedOfficer: 'Officer Juma M. (Dispatch)' } : c));
                                setAdminSelectedComplaint(prev => prev ? { ...prev, status: 'Processing', assignedOfficer: 'Officer Juma M. (Dispatch)' } : null);
                                triggerToast('Assigned Officer & updated status to Processing');
                              }}
                              className="bg-surface-container-high text-primary font-bold text-xs py-2.5 rounded-lg border border-outline-variant/30 hover:bg-[#cee9d3]/15 cursor-pointer"
                            >
                              Assign Officer
                            </button>
                            <button 
                              onClick={() => {
                                setComplaints(prev => prev.map(c => c.id === adminSelectedComplaint.id ? { ...c, status: 'Resolved' } : c));
                                setAdminSelectedComplaint(prev => prev ? { ...prev, status: 'Resolved' } : null);
                                triggerToast('Grievance marked as RESOLVED');
                              }}
                              className="bg-primary text-white font-bold text-xs py-2.5 rounded-lg hover:opacity-95 cursor-pointer"
                            >
                              Mark Resolved
                            </button>
                          </div>
                        )}
                      </div>
                    ) : (
                      <div className="text-center py-20 text-on-surface-variant flex flex-col items-center gap-2">
                        <span className="material-symbols-outlined text-4xl animate-pulse">report</span>
                        <p className="text-xs font-bold">Select a complaint from the registry list to inspect details</p>
                      </div>
                    )}
                  </div>
                </div>
              </div>
            );
          default:
            return null;
        }
      })()}
    </section>
  </div>
)}

{/* Assign Route Modal */}
{showAssignModal && (
  <div className="fixed inset-0 z-[100] bg-black/60 flex items-center justify-center p-4 backdrop-blur-xs animate-[fadeIn_0.2s_ease-out]">
    <div className="bg-white rounded-2xl w-full max-w-sm p-6 flex flex-col gap-4 shadow-2xl relative border border-outline-variant/30">
      <button onClick={() => setShowAssignModal(false)} className="absolute top-4 right-4 text-on-surface-variant hover:text-on-surface cursor-pointer">
        <span className="material-symbols-outlined text-base">close</span>
      </button>
      <div>
        <h3 className="text-lg font-extrabold text-on-surface">Assign Collector Route</h3>
        <p className="text-xs text-on-surface-variant mt-0.5">Redirect waste vehicles to specific municipal areas</p>
      </div>
      <div className="flex flex-col gap-3">
        <div>
          <label className="text-xs font-bold text-on-surface block mb-1">Target Vehicle Plate</label>
          <select 
            value={assignPlate} 
            onChange={(e) => setAssignPlate(e.target.value)}
            className="w-full bg-surface-container border border-outline-variant/30 h-11 px-3 rounded-lg text-sm font-semibold"
          >
            {fleet.map(v => (
              <option key={v.plate} value={v.plate}>{v.plate} ({v.driverName})</option>
            ))}
          </select>
        </div>
        <div>
          <label className="text-xs font-bold text-on-surface block mb-1">Target Service Zone</label>
          <select 
            value={assignZone} 
            onChange={(e) => setAssignZone(e.target.value)}
            className="w-full bg-surface-container border border-outline-variant/30 h-11 px-3 rounded-lg text-sm font-semibold"
          >
            <option value="Kinondoni Zone 4">Kinondoni Zone 4</option>
            <option value="Upanga Block G">Upanga Block G</option>
            <option value="Masaki Peninsula">Masaki Peninsula</option>
            <option value="Kariakoo Bazaar">Kariakoo Bazaar</option>
          </select>
        </div>
      </div>
      <button 
        onClick={executeRouteAssignment}
        className="w-full bg-primary text-white h-11 rounded-xl font-bold text-xs flex items-center justify-center gap-1 mt-2 hover:opacity-95 cursor-pointer"
      >
        <span className="material-symbols-outlined text-sm">navigation</span>
        Assign Vehicle Now
      </button>
    </div>
  </div>
)}

{/* Add Citizen Modal */}
{showNewCitizenModal && (
  <div className="fixed inset-0 z-[100] bg-black/60 flex items-center justify-center p-4 backdrop-blur-xs animate-[fadeIn_0.2s_ease-out]">
    <form onSubmit={addNewCitizenAdmin} className="bg-white rounded-2xl w-full max-w-sm p-6 flex flex-col gap-4 shadow-2xl relative border border-outline-variant/30">
      <button type="button" onClick={() => setShowNewCitizenModal(false)} className="absolute top-4 right-4 text-on-surface-variant hover:text-on-surface cursor-pointer">
        <span className="material-symbols-outlined text-base">close</span>
      </button>
      <div>
        <h3 className="text-lg font-extrabold text-on-surface">Register New Citizen</h3>
        <p className="text-xs text-on-surface-variant mt-0.5">Create a TMWA waste collection member account</p>
      </div>
      <div className="flex flex-col gap-3">
        <div>
          <label className="text-xs font-bold text-on-surface block mb-1">Full Name</label>
          <input 
            type="text" 
            required
            value={addCitName}
            onChange={(e) => setAddCitName(e.target.value)}
            placeholder="e.g. Asha Hamisi"
            className="w-full bg-surface-container border border-outline-variant/30 h-11 px-3 rounded-lg text-sm font-semibold focus:outline-primary"
          />
        </div>
        <div>
          <label className="text-xs font-bold text-on-surface block mb-1">Phone Number</label>
          <input 
            type="tel" 
            required
            value={addCitPhone}
            onChange={(e) => setAddCitPhone(e.target.value)}
            placeholder="e.g. +255 783 222 111"
            className="w-full bg-surface-container border border-outline-variant/30 h-11 px-3 rounded-lg text-sm font-semibold focus:outline-primary"
          />
        </div>
        <div>
          <label className="text-xs font-bold text-on-surface block mb-1">Assigned Zone</label>
          <select 
            value={addCitZone} 
            onChange={(e) => setAddCitZone(e.target.value)}
            className="w-full bg-surface-container border border-outline-variant/30 h-11 px-3 rounded-lg text-sm font-semibold"
          >
            <option value="Kinondoni, District A">Kinondoni, District A</option>
            <option value="Temeke, Zone 4">Temeke, Zone 4</option>
            <option value="Ilala, City Center">Ilala, City Center</option>
            <option value="Kinondoni, Kawe">Kinondoni, Kawe</option>
          </select>
        </div>
      </div>
      <button 
        type="submit"
        className="w-full bg-primary text-white h-11 rounded-xl font-bold text-xs flex items-center justify-center gap-1 mt-2 hover:opacity-95 cursor-pointer"
      >
        <span className="material-symbols-outlined text-sm">person_add</span>
        Create Citizen Member
      </button>
    </form>
  </div>
)}

{/* Receipt Generation Modal */}
{showReceiptModal && (
  <div className="fixed inset-0 z-[100] bg-black/60 flex items-center justify-center p-4 backdrop-blur-xs animate-[fadeIn_0.2s_ease-out]">
    <div className="bg-white rounded-2xl w-full max-w-sm p-6 flex flex-col gap-4 shadow-2xl relative text-center border-2 border-primary">
      <button onClick={() => setShowReceiptModal(null)} className="absolute top-4 right-4 text-on-surface-variant hover:text-on-surface cursor-pointer">
        <span className="material-symbols-outlined text-base">close</span>
      </button>
      <div className="flex flex-col items-center gap-2">
        <div className="w-12 h-12 rounded-full bg-[#beead1] text-primary flex items-center justify-center">
          <span className="material-symbols-outlined text-xl font-bold">verified_user</span>
        </div>
        <h3 className="text-lg font-black text-on-surface">GePG Municipal Receipt</h3>
        <p className="text-[10px] text-on-surface-variant font-mono uppercase">Control Number Transaction Confirmed</p>
      </div>

      <div className="bg-surface-container p-4 rounded-xl border border-outline-variant/20 text-left flex flex-col gap-2.5 font-mono text-xs">
        <div className="flex justify-between">
          <span className="text-on-surface-variant">Transaction Ref:</span>
          <span className="font-bold text-on-surface">{showReceiptModal.id}</span>
        </div>
        <div className="flex justify-between">
          <span className="text-on-surface-variant">Paid Amount:</span>
          <span className="font-bold text-primary">{showReceiptModal.amount}</span>
        </div>
        <div className="flex justify-between">
          <span className="text-on-surface-variant">Method Used:</span>
          <span className="font-bold text-on-surface">{showReceiptModal.method}</span>
        </div>
        <div className="flex justify-between">
          <span className="text-on-surface-variant">Date Paid:</span>
          <span className="font-bold text-on-surface">{showReceiptModal.date}</span>
        </div>
        <div className="flex justify-between border-t border-outline-variant/30 pt-2 text-[10px]">
          <span className="text-on-surface-variant">Service Class:</span>
          <span className="font-bold text-on-surface">Household Waste Class 1</span>
        </div>
      </div>

      <div className="text-[9px] text-on-surface-variant flex items-center justify-center gap-1 leading-relaxed">
        <span className="material-symbols-outlined text-xs text-primary">gavel</span>
        <span>Issued officially by TMWA & United Republic of Tanzania.</span>
      </div>

      <button 
        onClick={() => {
          alert('Receipt downloaded to device storage.');
          setShowReceiptModal(null);
        }}
        className="w-full bg-primary text-white h-11 rounded-xl font-bold text-xs flex items-center justify-center gap-1 hover:opacity-95 shadow-sm cursor-pointer"
      >
        <span className="material-symbols-outlined text-sm">download</span>
        Download PDF Copy
      </button>
    </div>
  </div>
)}

    </div>
  </div>
  );
}

