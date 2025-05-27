import React, { useState, useEffect } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import axios from 'axios';
import { Card, Button, Typography, Space, message, Divider, Row, Col, Statistic } from 'antd';
import { CheckCircleOutlined, DollarOutlined, UserOutlined, CalendarOutlined, UsergroupAddOutlined, ArrowLeftOutlined } from '@ant-design/icons';
import PaymentModal from './PaymentModal';

const { Title, Text } = Typography;

interface BookingData {
  firstName?: string;
  lastName?: string;
  email: string;
  phone?: string;
  adults: number;
  childrenUnder18: number;
  childrenOver18: number;
  tripDate: string;
  price: string;
  paymentStatus?: 'Pending' | 'Paid' | 'Failed';
}

const Step2: React.FC = () => {
  const { state } = useLocation();
  const navigate = useNavigate();
  const [isPaymentModalOpen, setIsPaymentModalOpen] = useState(false);
  const [bookingData, setBookingData] = useState<BookingData | null>(null);

  useEffect(() => {
    // Try to get booking data from location state first
    if (state) {
      setBookingData(state as BookingData);
    } else {
      // If no state, try to get from session storage
      const savedData = sessionStorage.getItem('bookingFormData');
      if (savedData) {
        setBookingData(JSON.parse(savedData));
      } else {
        // If no data found, redirect to step 1
        message.error('No booking data found. Please start over.');
        navigate('/booking');
      }
    }
  }, [state, navigate]);

  // Redirect to dashboard if booking is already paid
  useEffect(() => {
    if (bookingData?.paymentStatus === 'Paid') {
      message.info('This booking is already paid. Redirecting to dashboard...');
      navigate('/dashboard');
    }
  }, [bookingData, navigate]);

  const handleBack = () => {
    if (bookingData) {
      navigate('/booking', { state: { editMode: true, bookingData } });
    } else {
      navigate('/booking');
    }
  };

  const handlePaymentComplete = async (status: 'Pending' | 'Failed' | 'Paid') => {
    // Clear session storage after successful payment
    if (status === 'Paid') {
      sessionStorage.removeItem('bookingFormData');
      message.success('Payment successful. Redirecting to dashboard...');
      navigate('/dashboard/');
    } else if (status === 'Pending') {
      message.error('Payment still pending. Please try again after sometime.');
      navigate('/dashboard/');
    } else {
      message.error('Payment failed. Please try again after sometime.');
      navigate('/dashboard/');
    }
  };

  if (!bookingData) {
    return null; // or return a loading spinner
  }

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
      maxWidth: 1200,
      margin: '0 auto',
      minHeight: '100vh',
      background: '#f5f5f5'
    }}>
      <Row gutter={[0, 24]}>
        <Col span={24}>
          <Card style={{ 
            borderRadius: 8,
            boxShadow: '0 2px 8px rgba(0,0,0,0.1)'
          }}>
            <div style={{ 
              display: 'flex',
              justifyContent: 'space-between',
              alignItems: 'center',
              marginBottom: 32,
              borderBottom: '1px solid #f0f0f0',
              paddingBottom: 24
            }}>
              <Space>
                <Button 
                  icon={<ArrowLeftOutlined />} 
                  onClick={handleBack}
                  size="large"
                >
                  Back
                </Button>
                <Title level={2} style={{ margin: 0 }}>
                  Review & Payment
                </Title>
              </Space>
            </div>

            <Row gutter={[24, 24]}>
              <Col xs={24} lg={16}>
                <Card
                  title={
                    <Space>
                      <UserOutlined />
                      <Title level={4} style={{ margin: 0 }}>Booking Details</Title>
                    </Space>
                  }
                  style={{ height: '100%', borderRadius: 8 }}
                  className="booking-details-card"
                >
                  <Space direction="vertical" size="large" style={{ width: '100%' }}>
                    {/* Personal Information Section */}
                    <div>
                      <Title level={5} style={{ marginBottom: 16 }}>
                        <UserOutlined /> Personal Information
                      </Title>
                      <Row gutter={[24, 16]}>
                        <Col xs={24} sm={12}>
                          <Text type="secondary">First Name</Text>
                          <div>
                            <Text strong style={{ fontSize: 16 }}>{bookingData.firstName || 'N/A'}</Text>
                          </div>
                        </Col>
                        <Col xs={24} sm={12}>
                          <Text type="secondary">Last Name</Text>
                          <div>
                            <Text strong style={{ fontSize: 16 }}>{bookingData.lastName || 'N/A'}</Text>
                          </div>
                        </Col>
                        <Col xs={24}>
                          <Text type="secondary">Email</Text>
                          <div>
                            <Text strong style={{ fontSize: 16 }}>{bookingData.email}</Text>
                          </div>
                        </Col>
                        <Col xs={24}>
                          <Text type="secondary">Phone</Text>
                          <div>
                            <Text strong style={{ fontSize: 16 }}>{bookingData.phone || 'N/A'}</Text>
                          </div>
                        </Col>
                      </Row>
                    </div>

                    <Divider style={{ margin: '8px 0' }} />

                    {/* Trip Details Section */}
                    <div>
                      <Title level={5} style={{ marginBottom: 16 }}>
                        <CalendarOutlined /> Trip Details
                      </Title>
                      <Row gutter={[24, 16]}>
                        <Col xs={24}>
                          <Text type="secondary">Trip Date</Text>
                          <div>
                            <Text strong style={{ 
                              fontSize: 16,
                              background: '#e6f7ff',
                              padding: '4px 12px',
                              borderRadius: 4,
                              border: '1px solid #91d5ff'
                            }}>
                              <CalendarOutlined style={{ marginRight: 8 }} />
                              {bookingData.tripDate}
                            </Text>
                          </div>
                        </Col>
                      </Row>
                    </div>

                    <Divider style={{ margin: '8px 0' }} />

                    {/* Participants Section */}
                    <div>
                      <Title level={5} style={{ marginBottom: 16 }}>
                        <UsergroupAddOutlined /> Participants
                      </Title>
                      <Row gutter={[24, 16]}>
                        <Col xs={24} sm={8}>
                          <Card size="small" style={{ textAlign: 'center', background: '#f6ffed', borderColor: '#b7eb8f' }}>
                            <Statistic
                              title={<Text strong>Adults</Text>}
                              value={bookingData.adults}
                              prefix={<UserOutlined />}
                            />
                          </Card>
                        </Col>
                        <Col xs={24} sm={8}>
                          <Card size="small" style={{ textAlign: 'center', background: '#fff7e6', borderColor: '#ffd591' }}>
                            <Statistic
                              title={<Text strong>Children ≤18</Text>}
                              value={bookingData.childrenUnder18}
                              prefix={<UserOutlined />}
                            />
                          </Card>
                        </Col>
                        <Col xs={24} sm={8}>
                          <Card size="small" style={{ textAlign: 'center', background: '#f9f0ff', borderColor: '#d3adf7' }}>
                            <Statistic
                              title={<Text strong>Children &gt;18</Text>}
                              value={bookingData.childrenOver18}
                              prefix={<UserOutlined />}
                            />
                          </Card>
                        </Col>
                      </Row>
                    </div>
                  </Space>
                </Card>
              </Col>

              <Col xs={24} lg={8}>
                <Card
                  title={
                    <Space>
                      <DollarOutlined />
                      <Title level={4} style={{ margin: 0 }}>Price Breakdown</Title>
                    </Space>
                  }
                  style={{ height: '100%', borderRadius: 8 }}
                  className="price-breakdown-card"
                >
                  <Space direction="vertical" size="large" style={{ width: '100%' }}>
                    <Row gutter={[16, 16]} align="middle">
                      <Col xs={12}>
                        <Text type="secondary">Subtotal</Text>
                        <div style={{ marginTop: 8 }}>
                          <Text strong style={{ fontSize: 16 }}>${subtotal.toFixed(2)}</Text>
                        </div>
                      </Col>
                      {discount > 0 && (
                        <Col xs={12} style={{ textAlign: 'right' }}>
                          <Text type="secondary">Discount</Text>
                          <div style={{ marginTop: 8 }}>
                            <Text type="success" strong style={{ fontSize: 16 }}>
                              -${discount.toFixed(2)}
                            </Text>
                          </div>
                        </Col>
                      )}
                    </Row>

                    <Divider style={{ margin: '12px 0' }} />

                    <Row gutter={[16, 16]} align="middle">
                      <Col xs={12}>
                        <Text strong style={{ fontSize: 16 }}>Final Price</Text>
                      </Col>
                      <Col xs={12} style={{ textAlign: 'right' }}>
                        <Text strong style={{ fontSize: 20 }}>${finalPrice.toFixed(2)}</Text>
                      </Col>
                    </Row>

                    <Button
                      type="primary"
                      size="large"
                      icon={<CheckCircleOutlined />}
                      onClick={() => setIsPaymentModalOpen(true)}
                      style={{ 
                        width: '100%',
                        height: 48,
                        marginTop: 16,
                        borderRadius: 4
                      }}
                    >
                      Proceed to Payment
                    </Button>
                  </Space>
                </Card>
              </Col>
            </Row>
          </Card>
        </Col>
      </Row>

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

export default Step2;
