import React, { useEffect, useState } from 'react';
import { Card, Button, Typography, Space, Descriptions, message, Row, Col } from 'antd';
import { LogoutOutlined, EditOutlined, PlusOutlined } from '@ant-design/icons';
import { useNavigate } from 'react-router-dom';
import { hubspotService } from '../services/hubspotService';
import { clearSession, getEmailFromSession } from '../utils/sessionUtils';
import LoadingSpinner from './common/LoadingSpinner';

const { Title, Text } = Typography;

interface BookingData {
  email: string;
  firstName?: string;
  lastName?: string;
  phone?: string;
  adults?: number;
  childrenUnder18?: number;
  childrenOver18?: number;
  tripDate?: string;
  price?: string;
  paymentStatus?: 'Pending' | 'Paid' | 'Failed';
}

const DashboardPage: React.FC = () => {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [bookingData, setBookingData] = useState<BookingData | null>(null);

  useEffect(() => {
    fetchBookingData();
  }, []);

  const fetchBookingData = async () => {
    const email = getEmailFromSession();
    if (!email) {
      message.error('Session expired. Please log in again.');
      handleLogout();
      return;
    }

    try {
      const data = await hubspotService.getContactByEmail(email);
      setBookingData(data);
    } catch (error) {
      console.error('Error fetching booking data:', error);
      message.error('Failed to fetch booking data');
    } finally {
      setLoading(false);
    }
  };

  const handleLogout = () => {
    clearSession();
    navigate('/');
  };

  const handleEdit = () => {
    if (!bookingData) return;

    if (bookingData.paymentStatus === 'Paid') {
      navigate('/booking', { 
        state: { 
          editMode: true,
          personalOnly: true,
          bookingData 
        } 
      });
    } else {
      navigate('/booking', { 
        state: { 
          editMode: true,
          personalOnly: false,
          bookingData 
        } 
      });
    }
  };

  const handleNewBooking = () => {
    navigate('/booking');
  };

  if (loading) {
    return <LoadingSpinner tip="Loading your booking details..." />;
  }

  const getStatusColor = (status?: string) => {
    switch (status) {
      case 'Paid':
        return '#52c41a';
      case 'Pending':
        return '#faad14';
      default:
        return '#f5222d';
    }
  };

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
          <Card>
            <div style={{ 
              display: 'flex',
              justifyContent: 'space-between',
              alignItems: 'center',
              marginBottom: 32,
              borderBottom: '1px solid #f0f0f0',
              paddingBottom: 24
            }}>
              <Space>
                <Title level={2} style={{ margin: 0 }}>Dashboard</Title>
                {bookingData?.email && (
                  <Text type="secondary" style={{ fontSize: 16, marginLeft: 16 }}>
                    Welcome back, {bookingData.firstName || bookingData.email}!
                  </Text>
                )}
              </Space>
              <Button 
                type="primary" 
                danger
                icon={<LogoutOutlined />}
                onClick={handleLogout}
                size="large"
              >
                Logout
              </Button>
            </div>

            {bookingData && bookingData.paymentStatus ? (
              <>
                <Row gutter={[24, 24]}>
                  <Col xs={24} lg={16}>
                    <Card 
                      title={
                        <Space>
                          <Title level={4} style={{ margin: 0 }}>Booking Details</Title>
                          <Button 
                            type="primary"
                            icon={<EditOutlined />}
                            onClick={handleEdit}
                          >
                            Edit Details
                          </Button>
                        </Space>
                      }
                      style={{ height: '100%' }}
                    >
                      <Descriptions
                        bordered
                        column={{ xs: 1, sm: 2 }}
                        size="middle"
                        labelStyle={{ fontWeight: 500 }}
                      >
                        <Descriptions.Item label="Email" span={2}>{bookingData.email}</Descriptions.Item>
                        <Descriptions.Item label="First Name">{bookingData.firstName}</Descriptions.Item>
                        <Descriptions.Item label="Last Name">{bookingData.lastName}</Descriptions.Item>
                        <Descriptions.Item label="Phone" span={2}>{bookingData.phone}</Descriptions.Item>
                        <Descriptions.Item label="Trip Date" span={2}>{bookingData.tripDate}</Descriptions.Item>
                        <Descriptions.Item label="Number of Adults">{bookingData.adults}</Descriptions.Item>
                        <Descriptions.Item label="Total Children">
                          {(bookingData.childrenUnder18 || 0) + (bookingData.childrenOver18 || 0)}
                        </Descriptions.Item>
                      </Descriptions>
                    </Card>
                  </Col>
                  <Col xs={24} lg={8}>
                    <Card
                      title={<Title level={4} style={{ margin: 0 }}>Payment Information</Title>}
                      style={{ height: '100%' }}
                    >
                      <Space direction="vertical" size="large" style={{ width: '100%' }}>
                        <div>
                          <Text type="secondary">Status</Text>
                          <div>
                            <Text strong style={{ 
                              color: getStatusColor(bookingData.paymentStatus),
                              fontSize: 18
                            }}>
                              {bookingData.paymentStatus}
                            </Text>
                          </div>
                        </div>
                        <div>
                          <Text type="secondary">Total Amount</Text>
                          <div>
                            <Text strong style={{ fontSize: 24 }}>
                              ${bookingData.price}
                            </Text>
                          </div>
                        </div>
                      </Space>
                    </Card>
                  </Col>
                </Row>
              </>
            ) : (
              <div style={{ 
                textAlign: 'center',
                padding: '48px 24px',
                background: '#fafafa',
                borderRadius: 8
              }}>
                <Title level={3}>No Booking Found</Title>
                <Space direction="vertical" size="large" style={{ marginTop: 32 }}>
                  <Text type="secondary" style={{ fontSize: 16 }}>
                    You haven't made any bookings yet. Start your ocean adventure today!
                  </Text>
                  <Button 
                    type="primary" 
                    size="large"
                    icon={<PlusOutlined />}
                    onClick={handleNewBooking}
                  >
                    Book Your Trip
                  </Button>
                </Space>
              </div>
            )}
          </Card>
        </Col>
      </Row>
    </div>
  );
};

export default DashboardPage; 