import { Text, View } from 'react-native';

import { useSession } from '@/lib/auth-client';

export default function DashboardScreen() {
  const { data: session } = useSession();

  return (
    <View className="flex-1 bg-background p-6">
      <Text className="mb-2 text-2xl font-bold text-foreground">
        Welcome, {session?.user?.name || 'User'}
      </Text>
      <Text className="text-muted-foreground">
        Your dashboard content goes here.
      </Text>
    </View>
  );
}
