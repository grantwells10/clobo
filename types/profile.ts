// types/profile.ts
export interface ProfileStats {
    items: number;
    friends: number;
    borrows: number;
    lends: number;
  }
  
export interface Listing {
    id: string;
    imageUrl: string;
    alt: string;
  }
  
export interface Profile {
    name: string;
    location: string;
    avatarUrl: string;
    bio: string;
    stats: ProfileStats;
    listings: Listing[];
  }  