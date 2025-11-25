// types/profile.ts
export interface ProfileStats {
    items: number;
    friends: number;
    borrows: number;
    lends: number;
  }
  
export interface Listing {
    id: string;
    imageUrl: string | { uri: string } | number; // Support string URI, object URI, or require() number
    alt: string;
    title?: string;
    brand?: string;
    sizeLabel?: string;
    material?: string;
    color?: string;
    occasion?: string;
    description?: string;
    washingInstructions?: string;
    isLent?: boolean;
  }
  
export interface Profile {
    name: string;
    location: string;
    avatarUrl: string | { uri: string } | number; // Support string URI, object URI, or require() number
    bio: string;
    stats: ProfileStats;
    listings: Listing[];
  }  
  
export interface SelectedImage {
    uri: string;
    name: string;
  }