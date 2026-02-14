import { Redirect, Tabs } from 'expo-router';
import { Text } from 'react-native';

import { useSession } from '@/lib/auth-client';

export default function TabsLayout() {
  const { data: session, isPending } = useSession();

  if (isPending) {
    return null;
  }

  if (!session?.user) {
    return <Redirect href="/(auth)/sign-in" />;
  }

  return (
    <Tabs
      screenOptions={{
        headerShown: true,
        tabBarActiveTintColor: '#0066FF',
      }}
    >
      <Tabs.Screen
        name="index"
        options={{
          title: 'Dashboard',
          tabBarIcon: ({ color }) => (
            <Text style={{ color, fontSize: 20 }}>&#x1F3E0;</Text>
          ),
        }}
      />
      <Tabs.Screen
        name="profile"
        options={{
          title: 'Profile',
          tabBarIcon: ({ color }) => (
            <Text style={{ color, fontSize: 20 }}>&#x1F464;</Text>
          ),
        }}
      />
    </Tabs>
  );
}
