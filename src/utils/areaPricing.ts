import { AreaPricingResult } from '../types';
import { AreaName } from '../constants/areas';

const AREA_PRICING: Record<AreaName, AreaPricingResult> = {
  'Uttara Sector 7': { commissionPercent: 10, fixedDeliveryCharge: 30 },
  'Uttara Sector 10': { commissionPercent: 10, fixedDeliveryCharge: 30 },
  'Mirpur 10': { commissionPercent: 12, fixedDeliveryCharge: 35 },
  'Banani': { commissionPercent: 15, fixedDeliveryCharge: 40 },
  'Dhanmondi': { commissionPercent: 15, fixedDeliveryCharge: 45 },
  'Gulshan 1': { commissionPercent: 18, fixedDeliveryCharge: 50 },
  'Gulshan 2': { commissionPercent: 18, fixedDeliveryCharge: 50 },
  'Mohakhali': { commissionPercent: 14, fixedDeliveryCharge: 40 },
  'Farmgate': { commissionPercent: 12, fixedDeliveryCharge: 35 },
  'Motijheel': { commissionPercent: 10, fixedDeliveryCharge: 30 },
  'Shahbag': { commissionPercent: 13, fixedDeliveryCharge: 38 },
  'Tejgaon': { commissionPercent: 11, fixedDeliveryCharge: 32 },
  'Bashundhara': { commissionPercent: 10, fixedDeliveryCharge: 30 },
  'Khilgaon': { commissionPercent: 8, fixedDeliveryCharge: 25 },
  'Malibagh': { commissionPercent: 9, fixedDeliveryCharge: 28 },
};

const DEFAULT_PRICING: AreaPricingResult = {
  commissionPercent: 10,
  fixedDeliveryCharge: 30,
};

export const getAreaPricing = (area: string): AreaPricingResult => {
  return AREA_PRICING[area as AreaName] ?? DEFAULT_PRICING;
};

export const calculateCommission = (fee: number, area: string): number => {
  const { commissionPercent } = getAreaPricing(area);
  return Math.round((fee * commissionPercent) / 100);
};

export const calculateRiderEarnings = (fee: number, area: string): number => {
  return fee - calculateCommission(fee, area);
};

export type FeeBreakdown = {
  baseFee: number;
  commissionPercent: number;
  commission: number;
  deliveryCharge: number;
  total: number;
};

export const calculateFeeBreakdown = (fee: number, area: string): FeeBreakdown => {
  const pricing = getAreaPricing(area);
  const commission = Math.round((fee * pricing.commissionPercent) / 100);
  const deliveryCharge = pricing.fixedDeliveryCharge;
  const total = fee + commission + deliveryCharge;

  return {
    baseFee: fee,
    commissionPercent: pricing.commissionPercent,
    commission,
    deliveryCharge,
    total,
  };
};
