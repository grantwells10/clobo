import { Tabs } from 'expo-router';
import { Activity, Search, User } from 'lucide-react-native';

import { HapticTab } from '@/components/haptic-tab';

export default function TabLayout() {

  return (
    <Tabs
      screenOptions={{
        tabBarActiveTintColor: '#000',
        tabBarInactiveTintColor: '#000',
        tabBarStyle: { backgroundColor: '#fff' },
        // SWITCH THIS IF WE WANT TO DELETE THE WORDS BELOW THE ICONS
        tabBarShowLabel: true,
        headerShown: false,
        tabBarButton: HapticTab,
      }}>
      <Tabs.Screen
        name="index"
        options={{
          // hide the index redirect route from the tab bar
          href: null,
        }}
      />
      <Tabs.Screen
        name="search"
        options={{
          title: 'Search',
          tabBarIcon: ({ color, size }) => <Search color={color} size={size ?? 28} />,
        }}
      />
      <Tabs.Screen
        name="activity"
        options={{
          title: 'Activity',
          tabBarIcon: ({ color, size }) => <Activity color={color} size={size ?? 28} />,
        }}
      />
      <Tabs.Screen
        name="profile"
        options={{
          title: 'Profile',
          tabBarIcon: ({ color, size }) => <User color={color} size={size ?? 28} />,
        }}
      />
    </Tabs>
  );
}
