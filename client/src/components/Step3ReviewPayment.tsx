import React, { useState } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import axios from 'axios';
import { Card, Button, Descriptions, Typography, Space, message, Divider, Row, Col, Statistic } from 'antd';
import { CheckCircleOutlined, DollarOutlined, UserOutlined, CalendarOutlined, UsergroupAddOutlined } from '@ant-design/icons';
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
              textAlign: 'center', 
              marginBottom: 32,
              borderBottom: '1px solid #f0f0f0',
              paddingBottom: 24
            }}>
              <Title level={2} style={{ margin: 0 }}>
                Review & Payment
              </Title>
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
                  style={{ borderRadius: 8 }}
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
                            <Text strong style={{ fontSize: 16 }}>{bookingData.firstName}</Text>
                          </div>
                        </Col>
                        <Col xs={24} sm={12}>
                          <Text type="secondary">Last Name</Text>
                          <div>
                            <Text strong style={{ fontSize: 16 }}>{bookingData.lastName}</Text>
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
                            <Text strong style={{ fontSize: 16 }}>{bookingData.phone}</Text>
                          </div>
                        </Col>
                      </Row>
                    </div>

                    <Divider style={{ margin: '8px 0' }} />

                    {/* Trip Details and Participants in one row */}
                    <Row gutter={[24, 24]}>
                      {/* Trip Details Section */}
                      <Col xs={24} md={12}>
                        <Card 
                          title={
                            <Space>
                              <CalendarOutlined />
                              <Text strong>Trip Details</Text>
                            </Space>
                          }
                          size="small"
                          style={{ height: '100%' }}
                        >
                          <Space direction="vertical" style={{ width: '100%' }} size="large">
                            <div>
                              <Text type="secondary">Trip Date</Text>
                              <div style={{ marginTop: 8 }}>
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
                            </div>
                          </Space>
                        </Card>
                      </Col>

                      {/* Participants Section */}
                      <Col xs={24} md={12}>
                        <Card
                          title={
                            <Space>
                              <UsergroupAddOutlined />
                              <Text strong>Participants</Text>
                            </Space>
                          }
                          size="small"
                          style={{ height: '100%' }}
                        >
                          <Row gutter={[16, 16]}>
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
                        </Card>
                      </Col>
                    </Row>
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
                  style={{ borderRadius: 8 }}
                  className="price-breakdown-card"
                >
                  <Space direction="vertical" style={{ width: '100%' }} size="middle">
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

export default Step3;
