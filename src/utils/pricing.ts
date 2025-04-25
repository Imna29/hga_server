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
    priceId: "price_1RHoFCCkQycn6ct2XOqv03cw",
    maxDeclaredValue: 10000,
    minQuantity: 5,
    requiresMembership: true,
    name: "Bulk Service",
  },
  [ServiceType.VALUE]: {
    priceId: "price_1RHoFGCkQycn6ct2Ivdyy7vQ",
    maxDeclaredValue: 7500,
    name: "Value Service",
  },
  [ServiceType.CORE]: {
    priceId: "price_1RHoFECkQycn6ct2imnZx6so",
    maxDeclaredValue: 12500,
    name: "Core Service",
  },
  [ServiceType.PLUS]: {
    priceId: "price_1RHoFACkQycn6ct2Jfru9hNB",
    maxDeclaredValue: 25000,
    commissionRate: 0.02,
    name: "Plus Service",
  },
  [ServiceType.PREMIUM]: {
    priceId: "price_1RHoF8CkQycn6ct2bSLoKwGo",
    maxDeclaredValue: 45000,
    commissionRate: 0.02,
    name: "Premium Service",
  },
  [ServiceType.ULTIMATE]: {
    priceId: "price_1RHoF5CkQycn6ct2beVShuqD",
    commissionRate: 0.02,
    name: "Ultimate Service",
  },
};
