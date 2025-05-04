
import React from 'react';
import Layout from '@/components/layout/Layout';
import AccountList from '@/components/accounts/AccountList';

const Index = () => {
  return (
    <Layout>
      <div className="container mx-auto py-6">
        <h1 className="text-2xl font-bold mb-6">Pinterest Accounts</h1>
        <AccountList />
      </div>
    </Layout>
  );
};

export default Index;
