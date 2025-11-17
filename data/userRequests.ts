import type { Product } from '@/types/product';

export interface ActivityRequest {
  id: string;
  brand: string;
  title: string;
  category?: string;
  material?: string;
  color?: string;
  occasion?: string;
  sizes?: string[];
  sizeLabel?: string;
  distanceKm?: number;
  popularityScore?: number;
  imageUrl?: string;
  description?: string;
  washingInstructions?: string;
  owner?: {
    name: string;
    avatarUrl?: string;
    mutualFriends?: number;
  };
  activity: {
    role: 'requesting';
    direction: 'to';
    person: {
      name: 'You';
      avatarUrl?: string;
    };
    status: 'requested' | 'approved';
    requestedDate: string;
  };
}

let userRequests: ActivityRequest[] = [];

export function getUserRequests(): ActivityRequest[] {
  return userRequests;
}

export function addUserRequest(product: Product): void {
  // Check if request already exists
  if (userRequests.some(req => req.id === product.id)) {
    return;
  }

  const request: ActivityRequest = {
    id: product.id,
    brand: product.brand,
    title: product.title,
    category: product.category,
    material: product.material,
    color: product.color,
    occasion: product.occasion,
    sizes: product.sizes,
    sizeLabel: product.sizeLabel,
    distanceKm: product.distanceKm,
    popularityScore: product.popularityScore,
    imageUrl: product.imageUrl,
    description: product.description,
    washingInstructions: product.washingInstructions,
    owner: product.owner,
    activity: {
      role: 'requesting',
      direction: 'to',
      person: {
        name: 'You',
        avatarUrl: 'https://i.pravatar.cc/100?img=1', // Default user avatar
      },
      status: 'requested',
      requestedDate: new Date().toISOString().split('T')[0], // Today's date in YYYY-MM-DD format
    },
  };

  userRequests.push(request);
}

export function removeUserRequest(id: string): void {
  userRequests = userRequests.filter(req => req.id !== id);
}

export function updateRequestStatus(id: string, status: 'requested' | 'approved'): void {
  const request = userRequests.find(req => req.id === id);
  if (request) {
    request.activity.status = status;
  }
}

