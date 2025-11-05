export interface Product {
  id: string;
  brand: string;
  title: string;
  category?: string;
  material?: string;
  color?: string;
  occasion?: string;
  sizes?: string[];
  sizeLabel?: string; // human-friendly size line for detail
  popularityScore?: number;
  price?: number;
  distanceKm?: number;
  imageUrl?: string;
  description?: string;
  washingInstructions?: string;
  owner?: {
    name: string;
    avatarUrl?: string;
    mutualFriends?: number;
  };
}

export type Products = Product[];


