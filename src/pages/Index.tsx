
import React from 'react';
import Layout from '../components/layout/Layout';
import AccountList from '../components/accounts/AccountList';
import { mockAccounts } from '../data/mockData';

const Index = () => {
  return (
    <Layout>
      <div className="space-y-6">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">Pinterest Accounts</h1>
          <p className="text-muted-foreground">
            Manage and monitor your Pinterest accounts performance
          </p>
        </div>
        <AccountList accounts={mockAccounts} />
      </div>
    </Layout>
  );
};

export default Index;
