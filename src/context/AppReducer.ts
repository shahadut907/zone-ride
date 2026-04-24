import { AppState, AppAction } from '../types';

export const initialState: AppState = {
  isBootstrapped: false,
  currentRole: null,
  selectedArea: null,
  notifications: [],
  customerSession: null,
  riders: [],
  shops: [],
  requests: [],
  orders: [],
  chats: [],
  menuItems: [],
  isLoading: false,
  toastMessage: null,
};

export const appReducer = (state: AppState, action: AppAction): AppState => {
  switch (action.type) {
    case 'SET_BOOTSTRAPPED':
      return { ...state, isBootstrapped: true };

    case 'SET_ROLE':
      return { ...state, currentRole: action.payload };

    case 'CLEAR_ROLE':
      return { ...state, currentRole: null, selectedArea: null };

    case 'SET_AREA':
      return { ...state, selectedArea: action.payload };

    case 'SET_CUSTOMER_SESSION':
      return { ...state, customerSession: action.payload };

    case 'CLEAR_CUSTOMER_SESSION':
      return { ...state, customerSession: null };

    case 'SET_RIDERS':
      return { ...state, riders: action.payload };

    case 'SET_SHOPS':
      return { ...state, shops: action.payload };

    case 'SET_REQUESTS':
      return { ...state, requests: action.payload };

    case 'ADD_REQUEST':
      return { ...state, requests: [...state.requests, action.payload] };

    case 'UPDATE_REQUEST':
      return {
        ...state,
        requests: state.requests.map((r) =>
          r.id === action.payload.id
            ? { ...r, ...action.payload.updates }
            : r
        ),
      };

    case 'SET_ORDERS':
      return { ...state, orders: action.payload };

    case 'UPDATE_ORDER':
      return {
        ...state,
        orders: state.orders.map((o) =>
          o.id === action.payload.id
            ? { ...o, ...action.payload.updates }
            : o
        ),
      };

    case 'SET_CHATS':
      return { ...state, chats: action.payload };

    case 'ADD_CHAT_THREAD':
      return { ...state, chats: [...state.chats, action.payload] };

    case 'ADD_CHAT_MESSAGE':
      return {
        ...state,
        chats: state.chats.map((thread) =>
          thread.id === action.payload.threadId
            ? {
                ...thread,
                messages: [...thread.messages, action.payload.message],
                lastMessage: action.payload.message.text,
                lastTimestamp: action.payload.message.timestamp,
              }
            : thread
        ),
      };

    case 'SET_NOTIFICATIONS':
      return { ...state, notifications: action.payload };

    case 'MARK_NOTIFICATION_READ':
      return {
        ...state,
        notifications: state.notifications.map((n) =>
          n.id === action.payload ? { ...n, isRead: true } : n
        ),
      };

    case 'SET_LOADING':
      return { ...state, isLoading: action.payload };

    case 'SHOW_TOAST':
      return { ...state, toastMessage: action.payload };

    case 'HIDE_TOAST':
      return { ...state, toastMessage: null };

    case 'UPDATE_RIDER_SUBSCRIPTION':
      return {
        ...state,
        riders: state.riders.map((r) =>
          r.id === action.payload.riderId
            ? { ...r, subscriptionState: action.payload.state }
            : r
        ),
      };

    case 'TOGGLE_RIDER_ACTIVE':
      return {
        ...state,
        riders: state.riders.map((r) =>
          r.id === action.payload ? { ...r, isActive: !r.isActive } : r
        ),
      };

    case 'TOGGLE_SHOP_OPEN':
      return {
        ...state,
        shops: state.shops.map((s) =>
          s.id === action.payload ? { ...s, isOpen: !s.isOpen } : s
        ),
      };

    case 'SET_MENU_ITEMS':
      return { ...state, menuItems: action.payload };

    case 'ADD_MENU_ITEM':
      return { ...state, menuItems: [...state.menuItems, action.payload] };

    case 'UPDATE_MENU_ITEM':
      return {
        ...state,
        menuItems: state.menuItems.map((item) =>
          item.id === action.payload.id
            ? { ...item, ...action.payload.updates }
            : item
        ),
      };

    case 'DELETE_MENU_ITEM':
      return {
        ...state,
        menuItems: state.menuItems.filter((item) => item.id !== action.payload),
      };

    case 'TOGGLE_MENU_ITEM_AVAILABLE':
      return {
        ...state,
        menuItems: state.menuItems.map((item) =>
          item.id === action.payload
            ? { ...item, isAvailable: !item.isAvailable }
            : item
        ),
      };

    case 'UPDATE_DEFAULT_ADDRESS':
      return {
        ...state,
        customerSession: state.customerSession
          ? { ...state.customerSession, defaultAddress: action.payload }
          : state.customerSession,
      };

    default:
      return state;
  }
};
