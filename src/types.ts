export type ProductCondition = 'brand-new' | 'uk-used';

export interface Product {
  id: string;
  name: string;
  brand: 'Apple' | 'Samsung' | 'Google' | 'Xiaomi' | 'OnePlus' | 'Accessories';
  model: string;
  description: string;
  price: number;
  previousPrice?: number;
  condition: ProductCondition;
  colors: string[];
  storageOptions: string[];
  stock: number;
  images: string[];
  specifications: Record<string, string>;
  warranty: string;
  isAvailable: boolean;
  // iPhone & Smartphone specific fields
  batteryHealth?: number; // e.g. 88, 92, 100
  simConfig?: 'Physical SIM + eSIM' | 'Dual eSIM' | 'Dual Physical SIM' | 'Single Nano-SIM';
  faceId?: 'Working 100%' | 'Touch ID Active' | 'Biometrics Tested';
  physicalCondition?: 'Brand New Sealed' | 'Open Box (10/10)' | 'Flawless Grade A+' | 'Grade A (Minor Signs)';
  networkStatus?: 'Factory Unlocked (All Networks)' | 'Global Sim Unlocked';
  categoryId: 'apple-iphone' | 'samsung' | 'google-pixel' | 'other-android' | 'phone-accessories';
  featured?: boolean;
  isNewArrival?: boolean;
  isBestSeller?: boolean;
  createdAt: string;
  updatedAt?: string;
}

export interface Category {
  id: string;
  name: string;
  slug: string;
  iconName: string;
  description: string;
  itemCount?: number;
}

export interface Banner {
  id: string;
  title: string;
  subtitle: string;
  badge: string;
  ctaText: string;
  ctaLink: string;
  imageUrl: string;
  order: number;
  isActive: boolean;
  accentColor?: string;
}

export interface CartItem {
  productId: string;
  product: Product;
  quantity: number;
  selectedColor: string;
  selectedStorage: string;
}

export interface SavedAddress {
  id: string;
  fullName: string;
  phone: string;
  state: string;
  lga: string;
  address: string;
  isDefault?: boolean;
}

export interface UserProfile {
  uid: string;
  email: string;
  fullName: string;
  phone?: string;
  profilePhotoUrl?: string;
  role: 'customer' | 'admin';
  savedAddresses: SavedAddress[];
  wishlist: string[]; // product IDs
  createdAt: string;
  updatedAt?: string;
}

export type OrderStatus =
  | 'Pending Payment'
  | 'Payment Verification'
  | 'Confirmed'
  | 'Processing'
  | 'Ready for Pickup'
  | 'Dispatched'
  | 'In Transit'
  | 'Delivered'
  | 'Cancelled';

export type PaymentMethod = 'pay-now' | 'credably-bnpl' | 'save-to-buy';
export type PaymentStatus = 'pending' | 'verifying' | 'paid' | 'failed';
export type FulfillmentType = 'delivery' | 'pickup';

export interface OrderItem {
  productId: string;
  productName: string;
  productImage: string;
  price: number;
  quantity: number;
  color: string;
  storage: string;
  condition: ProductCondition;
}

export interface Order {
  id: string;
  orderNumber: string;
  userId: string;
  customerName: string;
  customerEmail: string;
  customerPhone: string;
  items: OrderItem[];
  subtotal: number;
  deliveryFee: number;
  total: number;
  fulfillmentType: FulfillmentType;
  deliveryAddress?: {
    state: string;
    lga: string;
    fullAddress: string;
    instructions?: string;
  };
  pickupLocationId?: string;
  paymentMethod: PaymentMethod;
  paymentStatus: PaymentStatus;
  orderStatus: OrderStatus;
  paymentReference?: string;
  proofOfPaymentUrl?: string;
  trackingNumber?: string;
  notes?: string;
  verifiedBy?: string;
  verifiedAt?: string;
  createdAt: string;
  updatedAt?: string;
}

export type SavingsFrequency = 'daily' | 'weekly' | 'monthly';
export type SavingsStatus = 'active' | 'completed' | 'cancelled' | 'converted_to_order';

export interface SavingsPlan {
  id: string;
  userId: string;
  userEmail: string;
  userName: string;
  productId: string;
  productName: string;
  productImage: string;
  selectedColor?: string;
  selectedStorage?: string;
  targetAmount: number;
  savedAmount: number;
  frequency: SavingsFrequency;
  durationWeeks: number;
  depositAmount: number; // installment per period
  startDate: string;
  targetDate: string;
  nextExpectedDepositDate: string;
  status: SavingsStatus;
  orderId?: string;
  createdAt: string;
  updatedAt?: string;
}

export interface SavingsTransaction {
  id: string;
  planId: string;
  userId: string;
  amount: number;
  paymentMethod: 'bank_transfer' | 'online_gateway' | 'card';
  reference: string;
  proofOfPaymentUrl?: string;
  status: 'pending' | 'verified' | 'rejected';
  verifiedBy?: string;
  verifiedAt?: string;
  notes?: string;
  createdAt: string;
}

export interface BNPLApplication {
  id: string;
  userId: string;
  customerName: string;
  customerEmail: string;
  customerPhone: string;
  orderId?: string;
  productId: string;
  productName: string;
  requestedAmount: number;
  downPayment: number;
  monthlyInstallment: number;
  tenureMonths: number;
  employmentStatus: string;
  monthlyIncome: number;
  bvnOrNinMasked: string;
  credablyReference: string;
  status: 'pending' | 'approved' | 'rejected' | 'disbursed' | 'cancelled';
  credablyDecisionNotes?: string;
  createdAt: string;
  updatedAt?: string;
}

export interface BankDetails {
  bankName: string;
  accountName: string;
  accountNumber: string;
  instructions: string;
}

export interface ContactInfo {
  phone: string;
  email: string;
  address: string;
  whatsappNumber: string;
  openingHours: string;
}

export interface BusinessSettings {
  bankDetails: BankDetails;
  contactInfo: ContactInfo;
  deliveryFees: Record<string, number>;
  pickupLocations: Array<{
    id: string;
    name: string;
    address: string;
    phone: string;
    readyTime: string;
  }>;
  savingsRules: {
    allowedDurationsWeeks: number[];
    minDepositPercent: number;
    dailyAllowed: boolean;
    weeklyAllowed: boolean;
    monthlyAllowed: boolean;
    lockPolicy: string;
  };
  credablyConfig: {
    merchantId: string;
    isLive: boolean;
    minTenureMonths: number;
    maxTenureMonths: number;
    interestRatePercent: number;
    downPaymentPercent: number;
  };
}
