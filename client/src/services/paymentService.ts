import axiosInstance from './axiosConfig';

export type PaymentStatus = 'Pending' | 'Paid' | 'Failed';

interface PaymentUpdateResponse {
  email: string;
  paymentStatus: PaymentStatus;
  price: string;
  // ... other fields from contact
}

export const paymentService = {
  async updatePaymentStatus(email: string, status: PaymentStatus): Promise<PaymentUpdateResponse> {
    try {
      const response = await axiosInstance.patch(`/api/hubspot/contact/${email}/payment`, {
        status
      });
      return response.data;
    } catch (error) {
      console.error('Error updating payment status:', error);
      throw error;
    }
  }
}; 