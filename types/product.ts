export interface Product {
  id: string;
  brand: string;
  title: string;
  category?: string;
  material?: string;
  color?: string;
  occasion?: string;
  price?: number;
  distanceKm?: number;
  imageUrl?: string;
}

export type Products = Product[];


