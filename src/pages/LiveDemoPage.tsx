import React from 'react';
import { PhoneSimulator } from '../components/simulator/PhoneSimulator';
import { MobileAppContainer } from '../components/mobile/MobileAppContainer';

export const LiveDemoPage: React.FC = () => {
  return (
    <div style={{ minHeight: 'calc(100vh - 72px)', background: '#090A14' }}>
      <PhoneSimulator>
        <MobileAppContainer />
      </PhoneSimulator>
    </div>
  );
};
