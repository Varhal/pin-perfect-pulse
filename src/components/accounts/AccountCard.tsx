
import React from 'react';
import { Link } from 'react-router-dom';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Card, CardContent } from '@/components/ui/card';
import MiniChart from '../ui/MiniChart';
import { cn } from '@/lib/utils';
import { PinterestAccount } from '../../services/pinterest';

interface AccountCardProps {
  account: PinterestAccount;
  className?: string;
}

const AccountCard: React.FC<AccountCardProps> = ({
  account,
  className
}) => {
  const formatNumber = (num: number): string => {
    if (num >= 1000000) {
      return (num / 1000000).toFixed(1) + 'M';
    }
    if (num >= 1000) {
      return (num / 1000).toFixed(1) + 'K';
    }
    return num.toString();
  };
  
  return (
    <Link to={`/account/${account.id}`} className="w-full">
      <Card className={cn("hover:shadow-md transition-shadow duration-200", className)}>
        <CardContent className="p-4 grid grid-cols-6 gap-4">
          {/* Account info */}
          <div className="col-span-6 md:col-span-1 flex items-center gap-3">
            <Avatar className="h-12 w-12">
              <AvatarImage src={account.avatarUrl} alt={account.name} />
              <AvatarFallback>{account.name.substring(0, 2).toUpperCase()}</AvatarFallback>
            </Avatar>
            <div className="flex flex-col">
              <span className="font-medium text-sm text-pinterest-dark">{account.name}</span>
              <span className="text-xs text-gray-500">@{account.username}</span>
            </div>
          </div>

          {/* Metrics */}
          <div className="col-span-6 md:col-span-1">
            <p className="text-sm text-gray-500">Impressions</p>
            <p className="text-lg font-semibold">{formatNumber(account.impressions.value)}</p>
            <MiniChart data={account.impressions.data} color="#e60023" />
          </div>
          
          <div className="col-span-6 md:col-span-1">
            <p className="text-sm text-gray-500">Engagements</p>
            <p className="text-lg font-semibold">{formatNumber(account.engagements.value)}</p>
            <MiniChart data={account.engagements.data} color="#0097e6" />
          </div>
          
          <div className="col-span-6 md:col-span-1">
            <p className="text-sm text-gray-500">Clicks</p>
            <p className="text-lg font-semibold">{formatNumber(account.clicks.value)}</p>
            <MiniChart data={account.clicks.data} color="#27ae60" />
          </div>
          
          <div className="col-span-6 md:col-span-1">
            <p className="text-sm text-gray-500">Saves</p>
            <p className="text-lg font-semibold">{formatNumber(account.saves.value)}</p>
            <MiniChart data={account.saves.data} color="#8e44ad" />
          </div>
          
          <div className="col-span-6 md:col-span-1">
            <p className="text-sm text-gray-500">Engaged</p>
            <p className="text-lg font-semibold">{formatNumber(account.engaged.value)}</p>
            <MiniChart data={account.engaged.data} color="#f39c12" />
          </div>
        </CardContent>
      </Card>
    </Link>
  );
};

export default AccountCard;
