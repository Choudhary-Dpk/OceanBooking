import React, { useState } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import axios from 'axios';
import { Card, Button, Descriptions, Typography, Space, message, Divider } from 'antd';
import { CheckCircleOutlined, DollarOutlined } from '@ant-design/icons';
import PaymentModal from './PaymentModal';

const { Title, Text } = Typography;

// Define the expected structure of the booking data from previous steps
interface Child {
  age: number;
}

interface BookingData {
  firstName: string;
  lastName: string;
  email: string;
  phone: string;
  adults: number;
  childrenUnder18: number;
  childrenOver18: number;
  tripDate: string;
  price: string;
  paymentStatus?: string;
}

const Step3: React.FC = () => {
  const { state } = useLocation();
  const navigate = useNavigate();
  const [isPaymentModalOpen, setIsPaymentModalOpen] = useState(false);

  const bookingData = state as BookingData;

  // Redirect to dashboard if booking is already paid
  React.useEffect(() => {
    if (bookingData?.paymentStatus === 'Paid') {
      message.info('This booking is already paid. Redirecting to dashboard...');
      navigate('/dashboard');
    }
  }, [bookingData, navigate]);

  const handlePaymentComplete = async (status: 'Pending' | 'Failed' | 'Paid') => {
    // Navigate based on payment status
    if (status === 'Paid') {
      message.success('Payment successful. Redirecting to dashboard...');
      navigate('/dashboard/');
    } else if (status === 'Pending') {
      message.error('Payment still pending. Please try again after sometime.');
      navigate('/dashboard/');
    } else {
      // For failed payments, stay on the same page
      message.error('Payment failed. Please try again after sometime.');
      navigate('/dashboard/');
    }
  };

  // Calculate the base price and components for display
  const basePrice = 500;
  const adultsCost = bookingData.adults * 200;
  const childrenUnder18Cost = bookingData.childrenUnder18 * 100;
  const childrenOver18Cost = bookingData.childrenOver18 * 150;
  const subtotal = basePrice + adultsCost + childrenUnder18Cost + childrenOver18Cost;
  const finalPrice = parseFloat(bookingData.price);
  const discount = subtotal - finalPrice;

  return (
    <div style={{ 
      padding: '32px 24px',
      maxWidth: 1000,
      margin: '0 auto',
      minHeight: '100vh',
      background: '#f5f5f5'
    }}>
      <Card style={{ 
        boxShadow: '0 4px 12px rgba(0,0,0,0.05)',
        borderRadius: 8
      }}>
        <Title level={2} style={{ 
          textAlign: 'center', 
          marginBottom: 32,
          borderBottom: '1px solid #f0f0f0',
          paddingBottom: 24
        }}>
          Review & Payment
        </Title>

        <Card
          title={<Title level={4} style={{ margin: 0 }}>Booking Details</Title>}
          style={{ marginBottom: 24 }}
          className="booking-details-card"
        >
          <Descriptions 
            bordered 
            column={{ xs: 1, sm: 2 }}
            size="middle"
            labelStyle={{ fontWeight: 500 }}
          >
            <Descriptions.Item label="Full Name" span={2}>
              {bookingData.firstName} {bookingData.lastName}
            </Descriptions.Item>
            <Descriptions.Item label="Email" span={2}>{bookingData.email}</Descriptions.Item>
            <Descriptions.Item label="Phone" span={2}>{bookingData.phone}</Descriptions.Item>
            <Descriptions.Item label="Trip Date" span={2}>{bookingData.tripDate}</Descriptions.Item>
            <Descriptions.Item label="Number of Adults">{bookingData.adults}</Descriptions.Item>
            <Descriptions.Item label="Total Children">
              {bookingData.childrenUnder18 + bookingData.childrenOver18}
            </Descriptions.Item>
          </Descriptions>
        </Card>

        <Card 
          title={<Title level={4} style={{ margin: 0 }}><DollarOutlined /> Price Breakdown</Title>}
          style={{ marginBottom: 24, background: '#fafafa' }}
          className="price-breakdown-card"
        >
          <Space direction="vertical" style={{ width: '100%' }} size="middle">
            <div style={{ display: 'flex', justifyContent: 'space-between' }}>
              <Text>Base Price:</Text>
              <Text strong>${basePrice.toFixed(2)}</Text>
            </div>
            {bookingData.adults > 0 && (
              <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                <Text>Adults ({bookingData.adults} × $200):</Text>
                <Text strong>${adultsCost.toFixed(2)}</Text>
              </div>
            )}
            {bookingData.childrenUnder18 > 0 && (
              <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                <Text>Children ≤18 ({bookingData.childrenUnder18} × $100):</Text>
                <Text strong>${childrenUnder18Cost.toFixed(2)}</Text>
              </div>
            )}
            {bookingData.childrenOver18 > 0 && (
              <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                <Text>Children &gt;18 ({bookingData.childrenOver18} × $150):</Text>
                <Text strong>${childrenOver18Cost.toFixed(2)}</Text>
              </div>
            )}
            <div style={{ display: 'flex', justifyContent: 'space-between' }}>
              <Text>Subtotal:</Text>
              <Text strong>${subtotal.toFixed(2)}</Text>
            </div>
            {discount > 0 && (
              <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                <Text type="success">Early Booking Discount (20% off):</Text>
                <Text type="success">-${discount.toFixed(2)}</Text>
              </div>
            )}
            <Divider style={{ margin: '12px 0' }} />
            <div style={{ display: 'flex', justifyContent: 'space-between' }}>
              <Title level={3} style={{ margin: 0 }}>Final Price:</Title>
              <Title level={3} style={{ margin: 0 }}>${finalPrice.toFixed(2)}</Title>
            </div>
          </Space>
        </Card>

        <div style={{ textAlign: 'center' }}>
          <Button
            type="primary"
            size="large"
            icon={<CheckCircleOutlined />}
            onClick={() => setIsPaymentModalOpen(true)}
            style={{ height: 50, minWidth: 200 }}
          >
            Proceed to Payment
          </Button>
        </div>
      </Card>

      <PaymentModal
        isOpen={isPaymentModalOpen}
        onClose={() => setIsPaymentModalOpen(false)}
        amount={finalPrice.toFixed(2)}
        bookingData={bookingData}
        onPaymentComplete={handlePaymentComplete}
      />
    </div>
  );
};

export default Step3;
