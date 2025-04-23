import { ServiceType } from "@prisma/client";

interface ServiceDetails {
  priceId: string;
  maxDeclaredValue?: number;
  minQuantity?: number;
  commissionRate?: number;
  requiresMembership?: boolean;
  name: string;
}

export const SERVICE_DETAILS_MAP: Record<ServiceType, ServiceDetails> = {
  [ServiceType.BULK]: {
    priceId: "price_1QDZ9LCkQycn6ct2d3KmQbux",
    maxDeclaredValue: 10000,
    minQuantity: 5,
    requiresMembership: true,
    name: "Bulk Service",
  },
  [ServiceType.VALUE]: {
    priceId: "price_1QDZ7fCkQycn6ct2N08UY1Ka",
    maxDeclaredValue: 7500,
    name: "Value Service",
  },
  [ServiceType.CORE]: {
    priceId: "price_1QDZ8RCkQycn6ct23JF7wYaH",
    maxDeclaredValue: 12500,
    name: "Core Service",
  },
  [ServiceType.PLUS]: {
    priceId: "price_1RGzzjCkQycn6ct2mRd57iRL",
    maxDeclaredValue: 25000,
    commissionRate: 0.02,
    name: "Plus Service",
  },
  [ServiceType.PREMIUM]: {
    priceId: "price_1RH00CCkQycn6ct2oHWwbUfS",
    maxDeclaredValue: 45000,
    commissionRate: 0.02,
    name: "Premium Service",
  },
  [ServiceType.ULTIMATE]: {
    priceId: "price_1RH01ICkQycn6ct2PDZWFUER",
    commissionRate: 0.02,
    name: "Ultimate Service",
  },
};
