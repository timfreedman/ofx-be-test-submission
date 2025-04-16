export interface Payment {
    id: string;
    amount: number;
    currency: string;
};

export type PaymentInput = Pick<Payment, 'amount' | 'currency'>;

export interface PaymentFilters {
    currency?: string;
};

export interface PaymentParameters {
  id: string;
}
