import { ADDONS, BAG_MODELS, HANDLES, MATERIALS, SIZES } from '../models/order-options.model';

export interface PriceInput {
  modelId: string;
  materialId: string;
  sizeId: string;
  handleId: string;
  addons: string[];
  quantity: number;
}

function priceOf(collection: { id: string; price: number }[], id: string): number {
  return collection.find(item => item.id === id)?.price ?? 0;
}

export function calculateBagPrice(input: PriceInput): number {
  const base = priceOf(BAG_MODELS, input.modelId);
  const material = priceOf(MATERIALS, input.materialId);
  const size = priceOf(SIZES, input.sizeId);
  const handle = priceOf(HANDLES, input.handleId);
  const addons = (input.addons || []).reduce((sum, addonId) => sum + priceOf(ADDONS, addonId), 0);
  const quantity = Number(input.quantity) > 0 ? Number(input.quantity) : 1;

  return (base + material + size + handle + addons) * quantity;
}
