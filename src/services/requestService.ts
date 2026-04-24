import { DeliveryRequest } from '../types';
import requestsData from '../data/requests.json';
import { mockGet, mockPost, mockPatch } from './mockApi';

export const fetchRequests = (): Promise<DeliveryRequest[]> =>
  mockGet<DeliveryRequest[]>(requestsData as DeliveryRequest[]);

export const fetchRequestsByArea = async (
  area: string
): Promise<DeliveryRequest[]> => {
  const requests = await fetchRequests();
  return requests.filter((r) => r.area === area);
};

export const fetchRequestById = async (
  id: string
): Promise<DeliveryRequest | undefined> => {
  const requests = await fetchRequests();
  return requests.find((r) => r.id === id);
};

export const createRequest = (
  request: DeliveryRequest
): Promise<DeliveryRequest> => mockPost(request);

export const updateRequest = (
  request: DeliveryRequest
): Promise<DeliveryRequest> => mockPatch(request);
