import React, { useEffect, useState } from 'react';
import { Card, Button, Typography, Space, Descriptions, message, Row, Col, Divider, Statistic } from 'antd';
import { LogoutOutlined, EditOutlined, PlusOutlined, DollarOutlined, UserOutlined, CalendarOutlined, UsergroupAddOutlined } from '@ant-design/icons';
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
          <Card style={{ borderRadius: 8, boxShadow: '0 2px 8px rgba(0,0,0,0.1)' }}>
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
                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                          <Space>
                            <UserOutlined />
                            <Title level={4} style={{ margin: 0 }}>Booking Details</Title>
                          </Space>
                          <Button 
                            type="primary"
                            icon={<EditOutlined />}
                            onClick={handleEdit}
                          >
                            Edit Details
                          </Button>
                        </div>
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
                          <Title level={4} style={{ margin: 0 }}>Payment Information</Title>
                        </Space>
                      }
                      style={{ height: '100%', borderRadius: 8 }}
                      className="payment-info-card"
                    >
                      <Space direction="vertical" size="large" style={{ width: '100%' }}>
                        <div>
                          <Text type="secondary">Status</Text>
                          <div style={{ marginTop: 8 }}>
                            <Text strong style={{ 
                              color: getStatusColor(bookingData.paymentStatus),
                              fontSize: 20,
                              background: `${getStatusColor(bookingData.paymentStatus)}15`,
                              padding: '4px 12px',
                              borderRadius: 4
                            }}>
                              {bookingData.paymentStatus}
                            </Text>
                          </div>
                        </div>
                        <div>
                          <Text type="secondary">Total Amount</Text>
                          <div style={{ marginTop: 8 }}>
                            <Text strong style={{ fontSize: 28 }}>
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
                    style={{ height: 48, padding: '0 32px' }}
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