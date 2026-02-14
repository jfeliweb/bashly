import { useRouter } from 'expo-router';
import { Text, TouchableOpacity, View } from 'react-native';

import { signOut, useSession } from '@/lib/auth-client';

export default function ProfileScreen() {
  const router = useRouter();
  const { data: session } = useSession();

  const handleSignOut = async () => {
    await signOut();
    router.replace('/(auth)/sign-in');
  };

  return (
    <View className="flex-1 bg-background p-6">
      <View className="mb-6 rounded-lg border border-border bg-card p-4">
        <Text className="mb-1 text-lg font-semibold text-foreground">
          {session?.user?.name || 'User'}
        </Text>
        <Text className="text-muted-foreground">
          {session?.user?.email || ''}
        </Text>
      </View>

      <TouchableOpacity
        className="items-center rounded-lg bg-destructive py-3"
        onPress={handleSignOut}
      >
        <Text className="font-semibold text-destructive-foreground">
          Sign Out
        </Text>
      </TouchableOpacity>
    </View>
  );
}
