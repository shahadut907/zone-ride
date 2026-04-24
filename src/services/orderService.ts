import { ShopOrder } from '../types';
import ordersData from '../data/orders.json';
import { mockGet, mockPost, mockPatch } from './mockApi';

export const fetchOrders = (): Promise<ShopOrder[]> =>
  mockGet<ShopOrder[]>(ordersData as ShopOrder[]);

export const fetchOrdersByShop = async (
  shopId: string
): Promise<ShopOrder[]> => {
  const orders = await fetchOrders();
  return orders.filter((o) => o.shopId === shopId);
};

export const fetchOrderById = async (
  id: string
): Promise<ShopOrder | undefined> => {
  const orders = await fetchOrders();
  return orders.find((o) => o.id === id);
};

export const createOrder = (order: ShopOrder): Promise<ShopOrder> =>
  mockPost(order);

export const updateOrder = (order: ShopOrder): Promise<ShopOrder> =>
  mockPatch(order);
