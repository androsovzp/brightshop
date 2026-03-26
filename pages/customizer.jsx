import React from 'react';
import Layout from '../components/Layout';
import CustomizerComponent from '../components/Customizer';

export default function CustomizerPage() {
  return (
    <Layout title="Свій дизайн | BRIGHT SHOP">
      <CustomizerComponent onBack={() => window.history.back()} />
    </Layout>
  );
}
