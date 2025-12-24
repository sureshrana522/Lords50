
export enum UserRole {
  ADMIN = 'ADMIN',
  DIRECTOR = 'DIRECTOR',
  OPERATION_HEAD = 'OPERATION_HEAD',
  ADVANCE_MANAGER = 'ADVANCE_MANAGER',
  CLASSIC_MANAGER = 'CLASSIC_MANAGER',
  SUPER_MANAGER = 'SUPER_MANAGER',
  MANAGER = 'MANAGER',
  SHOWROOM = 'SHOWROOM',
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

export interface Customer {
  id: string;
  name: string;
  mobile: string;
  address: string;
  clothQuantityMeters: number;
  instagramId?: string;
  birthday?: string;
  isNew: boolean;
}

export interface GarmentMeasurements {
  length?: string;
  shoulder?: string;
  sleeve?: string;
  chest?: string;
  waist?: string;
  hip?: string;
  neck?: string;
  thigh?: string;
  knee?: string;
  bottom?: string;
  fork?: string;
  crossback?: string;
  [key: string]: string | undefined;
}

export interface Order {
  id: string;
  billNo: string;
  customerId?: string; 
  garmentType: string;
  customerName: string;
  mobile: string;
  items: string;
  date: string;
  deliveryDate?: string;
  trialDate?: string; 
  status: OrderStatus;
  totalAmount: number;
  paidAmount?: number;
  advance: number;
  showroomName: string;
  showroomId: string;
  currentOwner: UserRole; 
  isPendingAcceptance: boolean; 
  isConfirmedByExpert?: boolean;
  measurements?: GarmentMeasurements;
  clothMeters?: number;
  createdAt: string;
  deliveryCode: string;
  category: string;
}
