const rawActivity = require('./activity.json');

type ActivityItem = typeof rawActivity[number];

let activityItems: ActivityItem[] = [...rawActivity];

export function getActivityItems(): ActivityItem[] {
  return activityItems;
}

export function setActivityItems(items: ActivityItem[]): void {
  activityItems = items;
}

export function updateActivityItem(id: string, updates: Partial<ActivityItem>): void {
  activityItems = activityItems.map(item => 
    item.id === id ? { ...item, ...updates } : item
  );
}

export function addActivityItem(item: ActivityItem): void {
  activityItems.push(item);
}

export function removeActivityItem(id: string): void {
  activityItems = activityItems.filter(item => item.id !== id);
}

