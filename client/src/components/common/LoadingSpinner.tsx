import React from 'react';
import { Spin } from 'antd';

interface LoadingSpinnerProps {
  tip?: string;
}

const LoadingSpinner: React.FC<LoadingSpinnerProps> = ({ tip = 'Loading...' }) => {
  return (
    <div
      style={{
        position: 'fixed',
        top: 0,
        left: 0,
        right: 0,
        bottom: 0,
        display: 'flex',
        justifyContent: 'center',
        alignItems: 'center',
        background: 'rgba(255, 255, 255, 0.8)',
        zIndex: 1000
      }}
    >
      <Spin size="large" tip={tip} />
    </div>
  );
};

export default LoadingSpinner; 