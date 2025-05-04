
import { PinterestAccount } from '../services/pinterest';
import { useQuery } from '@tanstack/react-query';

// Mock Pinterest accounts data
const mockAccounts: PinterestAccount[] = [
  {
    id: '1',
    name: 'Design Inspirations',
    username: 'designinspire',
    avatarUrl: 'https://via.placeholder.com/150',
    createdAt: '2023-01-15T10:30:00Z',
    impressions: { value: 12500, data: [10, 15, 25, 38, 50, 40, 35, 60, 75, 80] },
    engagements: { value: 5200, data: [5, 12, 18, 25, 32, 30, 28, 40, 45, 48] },
    clicks: { value: 3800, data: [3, 8, 15, 20, 25, 23, 20, 30, 35, 38] },
    saves: { value: 2200, data: [2, 5, 10, 12, 15, 13, 12, 18, 20, 22] },
    engaged: { value: 4500, data: [4, 10, 17, 23, 28, 26, 25, 35, 42, 45] }
  },
  {
    id: '2',
    name: 'Travel Adventures',
    username: 'traveladventures',
    avatarUrl: 'https://via.placeholder.com/150',
    createdAt: '2023-02-20T14:45:00Z',
    impressions: { value: 18700, data: [15, 20, 30, 45, 60, 55, 50, 70, 80, 90] },
    engagements: { value: 8100, data: [8, 15, 22, 30, 38, 35, 32, 45, 50, 55] },
    clicks: { value: 5600, data: [5, 10, 18, 25, 30, 28, 25, 35, 40, 43] },
    saves: { value: 3400, data: [3, 7, 12, 15, 18, 17, 16, 22, 25, 28] },
    engaged: { value: 6900, data: [6, 12, 20, 28, 34, 32, 30, 40, 48, 52] }
  },
  {
    id: '3',
    name: 'Food Recipes',
    username: 'foodrecipes',
    avatarUrl: 'https://via.placeholder.com/150',
    createdAt: '2023-03-10T09:15:00Z',
    impressions: { value: 21300, data: [18, 25, 35, 50, 65, 60, 55, 75, 85, 95] },
    engagements: { value: 9500, data: [9, 18, 25, 35, 42, 40, 38, 50, 55, 60] },
    clicks: { value: 6200, data: [6, 12, 20, 28, 33, 31, 28, 38, 43, 46] },
    saves: { value: 4100, data: [4, 8, 14, 17, 20, 19, 18, 24, 28, 30] },
    engaged: { value: 8200, data: [8, 15, 23, 32, 38, 36, 35, 45, 52, 58] }
  }
];

export function useMockPinterestAccounts() {
  return useQuery({
    queryKey: ['mockPinterestAccounts'],
    queryFn: () => mockAccounts,
  });
}
