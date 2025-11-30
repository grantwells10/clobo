import type { Listing } from '@/types/profile';

let userListings: Listing[] = [];

export function getUserListing(id: string): Listing | undefined {
  return userListings.find(listing => listing.id === id);
}

export function setUserListings(listings: Listing[]) {
  userListings = listings;
}

export function addUserListing(listing: Listing) {
  userListings.push(listing);
}

export function removeUserListing(id: string) {
  userListings = userListings.filter(listing => listing.id !== id);
}
