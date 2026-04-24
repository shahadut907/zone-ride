// ============================================
// ZoneRide Type Definitions
// ============================================

export type Role = 'customer' | 'rider' | 'shop';

export type VehicleType = 'Bike' | 'Bicycle' | 'Walking';
export type SubscriptionState = 'subscribed' | 'unsubscribed' | 'blocked';

export type Rider = {
  id: string;
  name: string;
  rating: number;
  isActive: boolean;
  vehicleType: VehicleType;
  servedAreas: string[];
  phone: string;
  profileImage?: string;
  subscriptionState: SubscriptionState;
  distanceKm?: number;
};

export type Shop = {
  id: string;
  name: string;
  rating: number;
  isOpen: boolean;
  area: string;
  logoUrl?: string;
  workingHours: string;
  menuImages: string[];
  phone: string;
};

export type MenuCategory = 'Specials' | 'Rice & Biryani' | 'Burgers & Fast Food' | 'Pizza' | 'Traditional' | 'Snacks' | 'Bakery' | 'Drinks' | 'Desserts' | 'Combo Deals' | 'Sides';

export type MenuItem = {
  id: string;
  shopId: string;
  name: string;
  description: string;
  price: number;
  category: MenuCategory;
  isAvailable: boolean;
  imageUrl?: string;
};

export type DeliveryStatus =
  | 'POSTED'
  | 'ACCEPTED'
  | 'PICKED'
  | 'ON_THE_WAY'
  | 'DELIVERED'
  | 'COMPLETED'
  | 'REJECTED';

export type DeliveryRequest = {
  id: string;
  customerId: string;
  riderId?: string;
  shopId?: string;
  itemDescription: string;
  pickupLocation: string;
  deliveryLocation: string;
  deliveryTime: string;
  deliveryFee: number;
  area: string;
  status: DeliveryStatus;
  createdAt: string;
  customerName: string;
  customerPhone: string;
};

export type OrderStatus = 'PENDING' | 'ACCEPTED' | 'REJECTED' | 'ASSIGNED' | 'DELIVERED';

export type ShopOrder = {
  id: string;
  customerName: string;
  customerPhone: string;
  shopId: string;
  itemDetails: string;
  riderId?: string;
  status: OrderStatus;
  area: string;
  createdAt: string;
  totalAmount?: number;
};

export type ChatMessage = {
  id: string;
  senderRole: Role;
  text: string;
  timestamp: string;
};

export type ChatThread = {
  id: string;
  participantName: string;
  participantRole: Role;
  area: string;
  messages: ChatMessage[];
  lastMessage: string;
  lastTimestamp: string;
};

export type NotificationItem = {
  id: string;
  title: string;
  body: string;
  timestamp: string;
  isRead: boolean;
  role: Role | 'all';
};

export type AreaPricingResult = {
  commissionPercent: number;
  fixedDeliveryCharge: number;
};

export type CustomerSession = {
  id: string;
  name: string;
  phone: string;
  defaultAddress: string;
};

export type AppState = {
  isBootstrapped: boolean;
  currentRole: Role | null;
  selectedArea: string | null;
  notifications: NotificationItem[];
  customerSession: CustomerSession | null;
  riders: Rider[];
  shops: Shop[];
  requests: DeliveryRequest[];
  orders: ShopOrder[];
  chats: ChatThread[];
  menuItems: MenuItem[];
  isLoading: boolean;
  toastMessage: string | null;
};

export type AppAction =
  | { type: 'SET_BOOTSTRAPPED' }
  | { type: 'SET_ROLE'; payload: Role }
  | { type: 'CLEAR_ROLE' }
  | { type: 'SET_AREA'; payload: string }
  | { type: 'SET_CUSTOMER_SESSION'; payload: CustomerSession }
  | { type: 'CLEAR_CUSTOMER_SESSION' }
  | { type: 'SET_RIDERS'; payload: Rider[] }
  | { type: 'SET_SHOPS'; payload: Shop[] }
  | { type: 'SET_REQUESTS'; payload: DeliveryRequest[] }
  | { type: 'ADD_REQUEST'; payload: DeliveryRequest }
  | { type: 'UPDATE_REQUEST'; payload: { id: string; updates: Partial<DeliveryRequest> } }
  | { type: 'SET_ORDERS'; payload: ShopOrder[] }
  | { type: 'UPDATE_ORDER'; payload: { id: string; updates: Partial<ShopOrder> } }
  | { type: 'SET_CHATS'; payload: ChatThread[] }
  | { type: 'ADD_CHAT_THREAD'; payload: ChatThread }
  | { type: 'ADD_CHAT_MESSAGE'; payload: { threadId: string; message: ChatMessage } }
  | { type: 'SET_NOTIFICATIONS'; payload: NotificationItem[] }
  | { type: 'MARK_NOTIFICATION_READ'; payload: string }
  | { type: 'SET_LOADING'; payload: boolean }
  | { type: 'SHOW_TOAST'; payload: string }
  | { type: 'HIDE_TOAST' }
  | { type: 'UPDATE_RIDER_SUBSCRIPTION'; payload: { riderId: string; state: SubscriptionState } }
  | { type: 'TOGGLE_RIDER_ACTIVE'; payload: string }
  | { type: 'TOGGLE_SHOP_OPEN'; payload: string }
  | { type: 'SET_MENU_ITEMS'; payload: MenuItem[] }
  | { type: 'ADD_MENU_ITEM'; payload: MenuItem }
  | { type: 'UPDATE_MENU_ITEM'; payload: { id: string; updates: Partial<MenuItem> } }
  | { type: 'DELETE_MENU_ITEM'; payload: string }
  | { type: 'TOGGLE_MENU_ITEM_AVAILABLE'; payload: string }
  | { type: 'UPDATE_DEFAULT_ADDRESS'; payload: string };

export type RootStackParamList = {
  Splash: undefined;
  RoleSelection: undefined;
  CustomerLogin: undefined;
  AreaSelection: undefined;
  CustomerTabs: undefined;
  RiderTabs: undefined;
  ShopTabs: undefined;
  Notifications: undefined;
};

export type CustomerTabParamList = {
  Home: undefined;
  Requests: undefined;
  Chats: undefined;
  Profile: undefined;
};

export type CustomerStackParamList = {
  CustomerHome: undefined;
  DeliveryRequest: { riderId?: string; shopId?: string };
  ShopMenuView: { shopId: string; shopName: string };
};

export type CustomerRequestsStackParamList = {
  RequestsList: undefined;
  RequestTracking: { requestId: string };
};

export type CustomerChatsStackParamList = {
  ChatsList: undefined;
  ChatDetail: { threadId: string; participantName: string };
};

export type RiderTabParamList = {
  Requests: undefined;
  Earnings: undefined;
  Profile: undefined;
};

export type RiderStackParamList = {
  RiderRequests: undefined;
  DeliveryDetails: { requestId: string };
};

export type ShopTabParamList = {
  Orders: undefined;
  Menu: undefined;
  Riders: undefined;
  Profile: undefined;
};

export type ShopStackParamList = {
  ShopOrders: undefined;
  OrderDetails: { orderId: string };
};

export type ShopMenuStackParamList = {
  ShopMenu: undefined;
  AddMenuItem: { editItem?: MenuItem };
};
