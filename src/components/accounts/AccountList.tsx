
import React, { useState, useMemo } from 'react';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Search, ChevronDown } from 'lucide-react';
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from '@/components/ui/dropdown-menu';
import AccountCard from './AccountCard';
import { PinterestAccount } from '../../services/pinterest';

interface AccountListProps {
  accounts: PinterestAccount[];
}

type SortOption = {
  label: string;
  value: keyof PinterestAccount | 'createdAt-asc' | 'createdAt-desc';
};

const sortOptions: SortOption[] = [
  {
    label: 'Newer first',
    value: 'createdAt-desc'
  }, 
  {
    label: 'Older first',
    value: 'createdAt-asc'
  }, 
  {
    label: 'Impressions',
    value: 'impressions'
  }, 
  {
    label: 'Engagements',
    value: 'engagements'
  }, 
  {
    label: 'Clicks',
    value: 'clicks'
  }, 
  {
    label: 'Saves',
    value: 'saves'
  }, 
  {
    label: 'Engaged',
    value: 'engaged'
  }
];

const AccountList: React.FC<AccountListProps> = ({ accounts }) => {
  const [searchQuery, setSearchQuery] = useState('');
  const [sortBy, setSortBy] = useState<SortOption>(sortOptions[0]);
  
  const filteredAccounts = useMemo(() => {
    return accounts.filter(account => 
      account.name.toLowerCase().includes(searchQuery.toLowerCase()) || 
      account.username.toLowerCase().includes(searchQuery.toLowerCase())
    );
  }, [accounts, searchQuery]);
  
  const sortedAccounts = useMemo(() => {
    return [...filteredAccounts].sort((a, b) => {
      if (sortBy.value === 'createdAt-desc') {
        return new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime();
      }
      if (sortBy.value === 'createdAt-asc') {
        return new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime();
      }

      // For other metrics
      const key = sortBy.value as keyof PinterestAccount;
      if (key === 'impressions' || key === 'engagements' || key === 'clicks' || key === 'saves' || key === 'engaged') {
        return (b[key] as { value: number }).value - (a[key] as { value: number }).value;
      }
      return 0;
    });
  }, [filteredAccounts, sortBy]);

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row gap-4 justify-between">
        <div className="relative">
          <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-gray-500" />
          <Input 
            type="text" 
            placeholder="Search accounts..." 
            className="pl-9 w-full sm:w-[300px]" 
            value={searchQuery} 
            onChange={e => setSearchQuery(e.target.value)} 
          />
        </div>
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="outline" className="flex items-center gap-2">
              <span>Sort by: {sortBy.label}</span>
              <ChevronDown className="h-4 w-4" />
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end" className="w-48">
            {sortOptions.map(option => (
              <DropdownMenuItem 
                key={option.value.toString()} 
                onClick={() => setSortBy(option)} 
                className="cursor-pointer"
              >
                {option.label}
              </DropdownMenuItem>
            ))}
          </DropdownMenuContent>
        </DropdownMenu>
      </div>

      {sortedAccounts.length === 0 ? (
        <div className="text-center py-10">
          <p className="text-gray-500">No accounts found</p>
          {accounts.length === 0 && (
            <p className="mt-2 text-sm text-gray-400">Add your first Pinterest account by clicking the "Add Account" button above.</p>
          )}
        </div>
      ) : (
        <div className="flex flex-wrap w-full gap-4">
          {sortedAccounts.map(account => (
            <AccountCard key={account.id} account={account} />
          ))}
        </div>
      )}
    </div>
  );
};

export default AccountList;
