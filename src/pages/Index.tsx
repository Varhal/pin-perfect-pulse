import React, { useState, useEffect } from 'react';
import { useToast } from '@/hooks/use-toast';
import Layout from '../components/layout/Layout';
import AccountList from '../components/accounts/AccountList';
import AddAccountModal from '../components/accounts/AddAccountModal';
import { Button } from '@/components/ui/button';
import { Plus } from 'lucide-react';
import { fetchPinterestAccounts, PinterestAccount } from '../services/pinterest';

const Index = () => {
  const [accounts, setAccounts] = useState<PinterestAccount[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const { toast } = useToast();

  const fetchAccounts = async () => {
    setIsLoading(true);
    try {
      const data = await fetchPinterestAccounts();
      setAccounts(data);
    } catch (error) {
      console.error('Error fetching accounts:', error);
      toast({
        title: "Error loading accounts",
        description: "Failed to load your Pinterest accounts. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchAccounts();
  }, []);

  return (
    <Layout>
      <div className="space-y-6">
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
          <div>
            <h1 className="text-2xl font-bold tracking-tight">Pinterest Accounts</h1>
            <p className="text-muted-foreground">
              Manage and monitor your Pinterest accounts performance
            </p>
          </div>
          <Button onClick={() => setIsAddModalOpen(true)} className="flex items-center gap-2">
            <Plus className="h-4 w-4" />
            Add Account
          </Button>
        </div>
        
        {isLoading ? (
          <div className="flex items-center justify-center h-64">
            <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-pinterest-red"></div>
          </div>
        ) : (
          <AccountList accounts={accounts} />
        )}
        
        <AddAccountModal 
          open={isAddModalOpen} 
          onClose={() => setIsAddModalOpen(false)} 
          onSuccess={() => {
            setIsAddModalOpen(false);
            fetchAccounts();
          }}
        />
      </div>
    </Layout>
  );
};

export default Index;
