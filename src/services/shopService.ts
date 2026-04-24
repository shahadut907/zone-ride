import { Shop } from '../types';
import shopsData from '../data/shops.json';
import { mockGet } from './mockApi';

export const fetchShops = (): Promise<Shop[]> =>
  mockGet<Shop[]>(shopsData as Shop[]);

export const fetchShopsByArea = async (area: string): Promise<Shop[]> => {
  const shops = await fetchShops();
  return shops.filter((s) => s.area === area);
};

export const fetchShopById = async (id: string): Promise<Shop | undefined> => {
  const shops = await fetchShops();
  return shops.find((s) => s.id === id);
};
