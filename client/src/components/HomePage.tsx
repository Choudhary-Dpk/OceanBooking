import React, { useEffect } from 'react';
import { Card, Form, Input, Button, Typography, message } from 'antd';
import { MailOutlined } from '@ant-design/icons';
import { useNavigate } from 'react-router-dom';
import { isSessionValid } from '../utils/sessionUtils';

const { Title, Text } = Typography;

const HomePage: React.FC = () => {
  const navigate = useNavigate();

  useEffect(() => {
    // Check if session is valid and redirect to dashboard
    if (isSessionValid()) {
      navigate('/dashboard');
    }
  }, [navigate]);

  const handleSubmit = (values: { email: string }) => {
    try {
      // Save email and timestamp to session storage
      const sessionData = {
        email: values.email,
        timestamp: new Date().getTime()
      };
      sessionStorage.setItem('oceanBookingSession', JSON.stringify(sessionData));
      message.success('Email saved successfully!');
      navigate('/dashboard');
    } catch (error) {
      message.error('Failed to save email. Please try again.');
    }
  };

  return (
    <div style={{ 
      minHeight: '100vh',
      display: 'flex',
      justifyContent: 'center',
      alignItems: 'center',
      background: '#f0f2f5'
    }}>
      <Card style={{ width: 500, padding: '24px' }}>
        <Title level={2} style={{ textAlign: 'center', marginBottom: 32 }}>
          Welcome to Ocean Booking
        </Title>
        <Text style={{ 
          display: 'block',
          textAlign: 'center',
          marginBottom: 24,
          fontSize: '16px'
        }}>
          To proceed, enter your email ID. This will be your booking ID.
        </Text>

        <Form
          name="email_form"
          onFinish={handleSubmit}
          layout="vertical"
        >
          <Form.Item
            name="email"
            rules={[
              { required: true, message: 'Please enter your email!' },
              { type: 'email', message: 'Please enter a valid email!' }
            ]}
          >
            <Input 
              prefix={<MailOutlined />}
              placeholder="Enter your email"
              size="large"
            />
          </Form.Item>

          <Form.Item>
            <Button 
              type="primary" 
              htmlType="submit"
              size="large"
              block
            >
              Proceed to Dashboard
            </Button>
          </Form.Item>
        </Form>
      </Card>
    </div>
  );
};

export default HomePage; 