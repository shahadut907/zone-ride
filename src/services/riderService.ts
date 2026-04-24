import { Rider } from '../types';
import ridersData from '../data/riders.json';
import { mockGet } from './mockApi';

export const fetchRiders = (): Promise<Rider[]> =>
  mockGet<Rider[]>(ridersData as Rider[]);

export const fetchRidersByArea = async (area: string): Promise<Rider[]> => {
  const riders = await fetchRiders();
  return riders.filter((r) => r.servedAreas.includes(area));
};

export const fetchRiderById = async (id: string): Promise<Rider | undefined> => {
  const riders = await fetchRiders();
  return riders.find((r) => r.id === id);
};
