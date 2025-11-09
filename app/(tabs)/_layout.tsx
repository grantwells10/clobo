import { Tabs } from 'expo-router';
import { Activity, Search, User } from 'lucide-react-native';

import { HapticTab } from '@/components/haptic-tab';
import { Colors } from '@/styles/globalStyles';

const TAB_ICON_SIZE = 28;

export default function TabLayout() {

  return (
    <Tabs
      screenOptions={{
        tabBarActiveTintColor: Colors.text,
        tabBarInactiveTintColor: Colors.text,
        tabBarStyle: { backgroundColor: Colors.background },
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
          tabBarIcon: ({ color, size }) => <Search color={color} size={size ?? TAB_ICON_SIZE} />,
        }}
      />
      <Tabs.Screen
        name="activity"
        options={{
          title: 'Activity',
          tabBarIcon: ({ color, size }) => <Activity color={color} size={size ?? TAB_ICON_SIZE} />,
        }}
      />
      <Tabs.Screen
        name="profile"
        options={{
          title: 'Profile',
          tabBarIcon: ({ color, size }) => <User color={color} size={size ?? TAB_ICON_SIZE} />,
        }}
      />
    </Tabs>
  );
}
