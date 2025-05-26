import React, { useState } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { Form, Input, InputNumber, DatePicker, Button, Card, Space, Typography, Row, Col, Divider, Alert, message } from 'antd';
import { UserOutlined, PhoneOutlined, MailOutlined, CalendarOutlined, UsergroupAddOutlined, DollarOutlined } from '@ant-design/icons';
import { hubspotService } from '../services/hubspotService';
import dayjs, { Dayjs } from 'dayjs';
import LoadingSpinner from './common/LoadingSpinner';

const { Title, Text } = Typography;

// Define form data type
interface FormData {
  firstName: string;
  lastName: string;
  email: string;
  phone: string;
  adults: number;
  childrenUnder18: number;
  childrenOver18: number;
  tripDate: Dayjs;
  price?: string;
}

interface BookingSubmitData {
  firstName: string;
  lastName: string;
  email: string;
  phone: string;
  adults: number;
  childrenUnder18: number;
  childrenOver18: number;
  tripDate: string;
  price: string;
  paymentStatus: 'Pending' | 'Paid' | 'Failed';
}

const Step1: React.FC = () => {
  const [form] = Form.useForm();
  const navigate = useNavigate();
  const location = useLocation();
  const [price, setPrice] = useState<number>(500); // Base price
  const [discount, setDiscount] = useState<number>(0);
  const [loading, setLoading] = useState(false);

  // Get edit mode and booking data from location state
  const { editMode, bookingData, personalOnly } = location.state || {};

  // Set initial form values if in edit mode
  React.useEffect(() => {
    if (editMode && bookingData) {
      form.setFieldsValue({
        ...bookingData,
        tripDate: bookingData.tripDate ? dayjs(bookingData.tripDate) : undefined
      });
      calculatePrice(bookingData);
    }
  }, [editMode, bookingData, form]);

  const calculatePrice = (values: any) => {
    let basePrice = 500;
    const adults = values.adults || 0;
    const childrenUnder18 = values.childrenUnder18 || 0;
    const childrenOver18 = values.childrenOver18 || 0;

    // Add adult price
    basePrice += adults * 200;

    // Add children prices
    basePrice += childrenUnder18 * 100;
    basePrice += childrenOver18 * 150;

    // Calculate discount if applicable
    let discountAmount = 0;
    if (values.tripDate) {
      // Handle both Dayjs object and string date formats
      const tripDate = dayjs.isDayjs(values.tripDate) ? values.tripDate : dayjs(values.tripDate);
      const today = dayjs();
      const diffDays = tripDate.diff(today, 'day');
      
      if (diffDays >= 15) {
        discountAmount = basePrice * 0.2;
      }
    }

    setDiscount(discountAmount);
    setPrice(basePrice - discountAmount);
  };

  const onValuesChange = (changedValues: any, allValues: any) => {
    calculatePrice(allValues);
  };

  const onFinish = async (values: FormData) => {
    try {
      setLoading(true);
      const formData: BookingSubmitData = {
        ...values,
        tripDate: values.tripDate.format('YYYY-MM-DD'),
        price: price.toFixed(2),
        paymentStatus: bookingData?.paymentStatus || 'Pending'
      };

      // Create or update contact in HubSpot
      await hubspotService.createOrUpdateContact(formData);
      message.success('Booking information saved successfully!');
      
      // If editing a paid booking or personalOnly is true, redirect to dashboard
      if (personalOnly || bookingData?.paymentStatus === 'Paid') {
        navigate('/dashboard');
      } else {
        // Otherwise proceed to review page
        navigate('/review', { state: formData });
      }
    } catch (error) {
      console.error('Error saving booking:', error);
      message.error('Failed to save booking information. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return <LoadingSpinner tip="Saving your booking..." />;
  }

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
          {editMode ? 'Edit Booking' : 'Ocean Trip Booking'}
        </Title>
        
        <Form
          form={form}
          layout="vertical"
          onFinish={onFinish}
          onValuesChange={onValuesChange}
          initialValues={{ adults: 0, childrenUnder18: 0, childrenOver18: 0 }}
          size="large"
        >
          <Card
            title={<Title level={4} style={{ margin: 0 }}>Personal Information</Title>}
            style={{ marginBottom: 24 }}
            className="form-section-card"
          >
            <Row gutter={[24, 16]}>
              <Col xs={24} sm={12}>
                <Form.Item
                  name="firstName"
                  label="First Name"
                  rules={[{ required: true, message: 'Please enter your first name' }]}
                >
                  <Input prefix={<UserOutlined />} placeholder="First Name" />
                </Form.Item>
              </Col>
              <Col xs={24} sm={12}>
                <Form.Item
                  name="lastName"
                  label="Last Name"
                  rules={[{ required: true, message: 'Please enter your last name' }]}
                >
                  <Input prefix={<UserOutlined />} placeholder="Last Name" />
                </Form.Item>
              </Col>
            </Row>

            <Row gutter={[24, 16]}>
              <Col xs={24} sm={12}>
                <Form.Item
                  name="email"
                  label="Email"
                  rules={[
                    { required: true, message: 'Please enter your email' },
                    { type: 'email', message: 'Please enter a valid email' }
                  ]}
                >
                  <Input 
                    prefix={<MailOutlined />} 
                    placeholder="Email" 
                    disabled={editMode}
                  />
                </Form.Item>
              </Col>
              <Col xs={24} sm={12}>
                <Form.Item
                  name="phone"
                  label="Phone"
                  rules={[{ required: true, message: 'Please enter your phone number' }]}
                >
                  <Input prefix={<PhoneOutlined />} placeholder="Phone" />
                </Form.Item>
              </Col>
            </Row>
          </Card>

          <Card
            title={<Title level={4} style={{ margin: 0 }}>Trip Details</Title>}
            style={{ marginBottom: 24 }}
            className="form-section-card"
          >
            <Row gutter={[24, 16]}>
              <Col xs={24} sm={12}>
                <Form.Item
                  name="tripDate"
                  label="Trip Date"
                  rules={[{ required: true, message: 'Please select a date' }]}
                >
                  <DatePicker 
                    style={{ width: '100%' }} 
                    prefix={<CalendarOutlined />}
                    disabledDate={(current) => current && current < dayjs().startOf('day')}
                    disabled={personalOnly || bookingData?.paymentStatus === 'Paid'}
                    format="YYYY-MM-DD"
                  />
                </Form.Item>
              </Col>
              <Col xs={24} sm={12}>
                <Form.Item
                  name="adults"
                  label="Number of Adults"
                  rules={[{ required: true, message: 'Please enter number of adults' }]}
                >
                  <InputNumber
                    min={1}
                    style={{ width: '100%' }}
                    prefix={<UsergroupAddOutlined />}
                    disabled={personalOnly || bookingData?.paymentStatus === 'Paid'}
                  />
                </Form.Item>
              </Col>
            </Row>

            <Row gutter={[24, 16]}>
              <Col xs={24} sm={12}>
                <Form.Item
                  name="childrenUnder18"
                  label="Children (≤18 years)"
                  rules={[{ required: true }]}
                >
                  <InputNumber
                    min={0}
                    style={{ width: '100%' }}
                    prefix={<UsergroupAddOutlined />}
                    disabled={personalOnly || bookingData?.paymentStatus === 'Paid'}
                  />
                </Form.Item>
              </Col>
              <Col xs={24} sm={12}>
                <Form.Item
                  name="childrenOver18"
                  label="Children (>18 years)"
                  rules={[{ required: true }]}
                >
                  <InputNumber
                    min={0}
                    style={{ width: '100%' }}
                    prefix={<UsergroupAddOutlined />}
                    disabled={personalOnly || bookingData?.paymentStatus === 'Paid'}
                  />
                </Form.Item>
              </Col>
            </Row>
          </Card>

          <Card 
            className="price-breakdown" 
            title={<Title level={4} style={{ margin: 0 }}><DollarOutlined /> Price Breakdown</Title>}
            style={{ marginBottom: 24, background: '#fafafa' }}
          >
            <Space direction="vertical" style={{ width: '100%' }} size="middle">
              <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                <Text>Base Price:</Text>
                <Text strong>$500</Text>
              </div>
              {form.getFieldValue('adults') > 0 && (
                <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                  <Text>Adults ({form.getFieldValue('adults')} × $200):</Text>
                  <Text strong>${form.getFieldValue('adults') * 200}</Text>
                </div>
              )}
              {form.getFieldValue('childrenUnder18') > 0 && (
                <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                  <Text>Children ≤18 ({form.getFieldValue('childrenUnder18')} × $100):</Text>
                  <Text strong>${form.getFieldValue('childrenUnder18') * 100}</Text>
                </div>
              )}
              {form.getFieldValue('childrenOver18') > 0 && (
                <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                  <Text>Children &gt;18 ({form.getFieldValue('childrenOver18')} × $150):</Text>
                  <Text strong>${form.getFieldValue('childrenOver18') * 150}</Text>
                </div>
              )}
              {discount > 0 && (
                <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                  <Text type="success">Early Booking Discount (20% off):</Text>
                  <Text type="success">-${discount.toFixed(2)}</Text>
                </div>
              )}
              <Divider style={{ margin: '12px 0' }} />
              <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                <Title level={4} style={{ margin: 0 }}>Total:</Title>
                <Title level={4} style={{ margin: 0 }}>${price.toFixed(2)}</Title>
              </div>
            </Space>
          </Card>

          <Form.Item style={{ marginBottom: 0 }}>
            <Button 
              type="primary" 
              htmlType="submit" 
              size="large" 
              block
              loading={loading}
              style={{ height: 50 }}
            >
              {editMode ? 'Update Booking' : 'Review Booking'}
            </Button>
          </Form.Item>
        </Form>
      </Card>
    </div>
  );
};

export default Step1;
