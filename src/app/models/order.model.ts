export type OrderStatus = 'sent' | 'accepted' | 'inProgress' | 'ready' | 'finished' | 'cancelled';

export interface BagOrder {
  id?: string;
  userId?: string;
  userEmail?: string;
  customerName: string;
  phone: string;
  modelId: string;
  materialId: string;
  color: string;
  sizeId: string;
  handleId: string;
  addons: string[];
  quantity: number;
  note?: string;
  price: number;
  status: OrderStatus;
  createdAt: string;
  updatedAt?: string;
}

export interface AdminBagOrder extends BagOrder {
  ownerUid: string;
  orderId: string;
}
