import React, { useState } from 'react';
import { Modal, Button, Space, Typography, message } from 'antd';
import { DollarOutlined, ExclamationCircleOutlined } from '@ant-design/icons';
import { paymentService } from '../services/paymentService';
import type { PaymentStatus } from '../services/paymentService';
import LoadingSpinner from './common/LoadingSpinner';

const { Text, Title } = Typography;

interface PaymentModalProps {
  isOpen: boolean;
  onClose: () => void;
  amount: string;
  bookingData: {
    email: string;
    firstName?: string;
    lastName?: string;
    [key: string]: any;
  };
  onPaymentComplete: (status: PaymentStatus) => void;
}

const PaymentModal: React.FC<PaymentModalProps> = ({
  isOpen,
  onClose,
  amount,
  bookingData,
  onPaymentComplete,
}) => {
  const [processing, setProcessing] = useState(false);

  const showConfirmation = (status: PaymentStatus) => {
    const modal = Modal.confirm({
      title: 'Confirm Payment Status',
      icon: <ExclamationCircleOutlined />,
      content: `Are you sure you want to mark this payment as ${status}?`,
      okText: 'Yes',
      cancelText: 'No',
      async onOk() {
        try {
          setProcessing(true);
          await paymentService.updatePaymentStatus(bookingData.email, status);
          onPaymentComplete(status);
          onClose();
        } catch (error) {
          console.error('Error updating payment status:', error);
          message.error('Failed to update payment status');
        } finally {
          setProcessing(false);
        }
      },
      onCancel() {
        modal.destroy();
      },
    });
  };

  const getButtonProps = (status: PaymentStatus) => {
    const baseProps = {
      type: 'primary' as const,
      onClick: () => showConfirmation(status),
      disabled: processing,
    };

    switch (status) {
      case 'Paid':
        return {
          ...baseProps,
          style: { backgroundColor: '#52c41a', borderColor: '#52c41a' },
          icon: <DollarOutlined />,
        };
      case 'Pending':
        return {
          ...baseProps,
          style: { backgroundColor: '#faad14', borderColor: '#faad14' },
        };
      case 'Failed':
        return {
          ...baseProps,
          danger: true,
        };
    }
  };

  return (
    <>
      {processing && <LoadingSpinner tip="Processing payment..." />}
      <Modal
        title={
          <Title level={4}>
            <DollarOutlined /> Payment Simulation
          </Title>
        }
        open={isOpen}
        onCancel={onClose}
        footer={null}
        centered
        maskClosable={false}
      >
        <div style={{ textAlign: 'center', marginBottom: 24 }}>
          <Title level={3}>Amount to Pay</Title>
          <Title level={2} type="success">${amount}</Title>
          {bookingData.firstName && (
            <Text>
              for {bookingData.firstName} {bookingData.lastName}
            </Text>
          )}
        </div>

        <div style={{ textAlign: 'center' }}>
          <Space direction="vertical" style={{ width: '100%' }}>
            <Text>Select Payment Status:</Text>
            <Space size="middle">
              <Button {...getButtonProps('Paid')}>
                Mark as Paid
              </Button>
              <Button {...getButtonProps('Pending')}>
                Mark as Pending
              </Button>
              <Button {...getButtonProps('Failed')}>
                Mark as Failed
              </Button>
            </Space>
          </Space>
        </div>
      </Modal>
    </>
  );
};

export default PaymentModal; 