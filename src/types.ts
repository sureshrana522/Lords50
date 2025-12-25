
export enum UserRole {
  ADMIN = 'ADMIN',
  DIRECTOR = 'DIRECTOR',
  OPERATION_HEAD = 'OPERATION_HEAD',
  ADVANCE_MANAGER = 'ADVANCE_MANAGER',
  CLASSIC_MANAGER = 'CLASSIC_MANAGER',
  SUPER_MANAGER = 'SUPER_MANAGER',
  MANAGER = 'MANAGER',
  SHOWROOM = 'SHOWROOM',
  BOOKING_MASTER = 'BOOKING_MASTER',
  MEASUREMENT = 'MEASUREMENT',
  CUTTING = 'CUTTING',
  SHIRT_MAKER = 'SHIRT_MAKER',
  PANT_MAKER = 'PANT_MAKER',
  MATERIAL = 'MATERIAL',
  KAJ_BUTTON = 'KAJ_BUTTON',
  PRESS = 'PRESS',
  DELIVERY = 'DELIVERY',
  CUSTOMER = 'CUSTOMER'
}

export enum OrderStatus {
  BOOKED = 'BOOKED',
  MEASURED = 'MEASURED',
  CUTTING_DONE = 'CUTTING_DONE',
  STITCHING = 'STITCHING',
  KAJ_BUTTON = 'KAJ_BUTTON',
  PRESSING = 'PRESSING',
  READY = 'READY',
  OUT_FOR_DELIVERY = 'OUT_FOR_DELIVERY',
  DELIVERED = 'DELIVERED'
}

export enum DressCategory {
  ROYAL_CLASSIC_SUIT = 'Royal Classic Suit',
  URBAN_ELITE_SET = 'Urban Elite Set',
  EXECUTIVE_LINE = 'Executive Line',
  FESTIVE_PREMIUM = 'Festive Premium',
  TRENDY_PARTY_FIT = 'Trendy Party Fit',
  IMPERIAL_CEREMONY = 'Imperial Ceremony',
  SIGNATURE_LUXURY = 'Signature Luxury',
  LORDS_SPECIAL_EDITION = 'Lords Special Edition'
}

export interface ClothDetail {
  brand: string;
  length: number; // in meters
  color: string;
  pattern?: string;
}

export interface TimelineEvent {
  status: OrderStatus;
  role: UserRole;
  workerName: string;
  timestamp: string;
  action: 'ACCEPTED' | 'COMPLETED' | 'HANDOVER';
}

export interface Order {
  id: string;
  billNo: string;
  customerName: string;
  mobile: string;
  address?: string;
  garmentType: string;
  category: DressCategory;
  status: OrderStatus;
  currentOwner: UserRole;
  previousOwner?: UserRole; // Track who worked on it last for payment
  assignedWorkerName?: string; // The specific name of the worker holding the order
  isPendingAcceptance: boolean;
  isUrgent?: boolean; // New Flag for Urgent Orders
  totalAmount: number;
  deliveryDate: string;
  createdAt: string;
  referralPartnerId?: string;
  isOutsourced?: boolean;
  clothDetail: ClothDetail;
  secretCode: string; // Secure Delivery Code
  timelineLogs: TimelineEvent[]; // Full tracking history
  measurements?: any;
}

export interface Customer {
  id: string;
  name: string;
  mobile: string;
  address?: string;
  instagramId?: string;
  birthday?: string;
  clothQuantityMeters: number;
  isNew: boolean;
}

export interface ReferralPartner {
  id: string;
  name: string;
  shopName?: string;
  mobile: string;
  commissionEarned: number;
}

export interface UserProfile {
  id: string;
  name: string;
  role: UserRole;
  mobile?: string;
  email?: string;
  image?: string;
  referralCode?: string;
  referredBy?: string; // Code of the referrer
  joinedAt?: string;
}

export interface WithdrawalRequest {
  id: string;
  userId: string;
  userName: string;
  userRole: UserRole;
  amount: number;
  email: string;
  tpin: string;
  method: 'UPI' | 'QR_CODE';
  upiId?: string;
  qrCodeImage?: string; // Base64 string
  status: 'PENDING' | 'APPROVED' | 'REJECTED';
  requestDate: string;
}

export interface AddMoneyRequest {
  id: string;
  userId: string;
  userName: string;
  userRole: UserRole;
  amount: number;
  utr: string;
  status: 'PENDING' | 'APPROVED' | 'REJECTED';
  requestDate: string;
}
