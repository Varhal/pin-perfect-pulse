import React, { useState } from 'react';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { createPinterestAccount } from '../../services/pinterest/accountsApi';
import { useToast } from '@/hooks/use-toast';
import { useQueryClient } from '@tanstack/react-query';

interface AddAccountModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: () => void;
}

const AddAccountModal: React.FC<AddAccountModalProps> = ({ isOpen, onClose, onSuccess }) => {
  const [formData, setFormData] = useState({
    name: '',
    username: '',
    apiKey: '',
    appId: '',
    appSecret: '',
    refreshToken: '',
    avatarUrl: ''
  });
  const [isLoading, setIsLoading] = useState(false);
  const { toast } = useToast();
  const queryClient = useQueryClient();

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);

    try {
      const requiredFields = ['name', 'username', 'apiKey', 'appId', 'appSecret'];
      const missingFields = requiredFields.filter(field => !formData[field as keyof typeof formData]);

      if (missingFields.length > 0) {
        throw new Error(`Please fill in all required fields: ${missingFields.join(', ')}`);
      }

      const result = await createPinterestAccount({
        name: formData.name,
        username: formData.username,
        apiKey: formData.apiKey,
        appId: formData.appId,
        appSecret: formData.appSecret,
        refreshToken: formData.refreshToken || undefined,
        avatarUrl: formData.avatarUrl || undefined
      });

      if (result) {
        toast({
          title: 'Success',
          description: `Pinterest account "${formData.name}" has been added.`,
        });
        queryClient.invalidateQueries({ queryKey: ['pinterestAccounts'] });
        onSuccess();
      } else {
        throw new Error('Failed to create account');
      }
    } catch (error) {
      console.error('Error adding account:', error);
      toast({
        title: 'Error',
        description: error instanceof Error ? error.message : 'Failed to add Pinterest account.',
        variant: 'destructive',
      });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-[500px]">
        <DialogHeader>
          <DialogTitle>Add Pinterest Account</DialogTitle>
          <DialogDescription>
            Connect a new Pinterest account to your dashboard.
          </DialogDescription>
        </DialogHeader>
        <form onSubmit={handleSubmit}>
          <div className="grid gap-4 py-4">
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="name" className="text-right">
                Name *
              </Label>
              <Input
                id="name"
                name="name"
                value={formData.name}
                onChange={handleChange}
                className="col-span-3"
                placeholder="My Brand Account"
                required
              />
            </div>
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="username" className="text-right">
                Username *
              </Label>
              <Input
                id="username"
                name="username"
                value={formData.username}
                onChange={handleChange}
                className="col-span-3"
                placeholder="@mybrand"
                required
              />
            </div>
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="apiKey" className="text-right">
                Access Token *
              </Label>
              <Input
                id="apiKey"
                name="apiKey"
                value={formData.apiKey}
                onChange={handleChange}
                className="col-span-3"
                placeholder="pina_..."
                required
              />
            </div>
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="refreshToken" className="text-right">
                Refresh Token
              </Label>
              <Input
                id="refreshToken"
                name="refreshToken"
                value={formData.refreshToken}
                onChange={handleChange}
                className="col-span-3"
                placeholder="pinr_..."
              />
            </div>
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="appId" className="text-right">
                App ID *
              </Label>
              <Input
                id="appId"
                name="appId"
                value={formData.appId}
                onChange={handleChange}
                className="col-span-3"
                placeholder="12345678"
                required
              />
            </div>
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="appSecret" className="text-right">
                App Secret *
              </Label>
              <Input
                id="appSecret"
                name="appSecret"
                value={formData.appSecret}
                onChange={handleChange}
                className="col-span-3"
                placeholder="your_app_secret"
                type="password"
                required
              />
            </div>
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="avatarUrl" className="text-right">
                Avatar URL
              </Label>
              <Input
                id="avatarUrl"
                name="avatarUrl"
                value={formData.avatarUrl}
                onChange={handleChange}
                className="col-span-3"
                placeholder="https://example.com/avatar.png"
              />
            </div>
          </div>
          <DialogFooter>
            <Button type="button" variant="outline" onClick={onClose} disabled={isLoading}>
              Cancel
            </Button>
            <Button type="submit" disabled={isLoading}>
              {isLoading ? 'Adding...' : 'Add Account'}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
};

export default AddAccountModal;
