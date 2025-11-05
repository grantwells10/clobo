import { Redirect } from 'expo-router';

// need this so react doesnt get mad, redirect this jawn to search screen
export default function RootIndex() {
  return <Redirect href="/(tabs)/search" />;
}


