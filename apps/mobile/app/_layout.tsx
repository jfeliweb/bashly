import '../global.css';

import { Slot } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import { PostHogProvider } from 'posthog-react-native';
import { SafeAreaProvider } from 'react-native-safe-area-context';

import { isPostHogEnabled, POSTHOG_HOST, POSTHOG_KEY } from '@/lib/posthog';

export default function RootLayout() {
  return (
    <SafeAreaProvider>
      <StatusBar style="auto" />
      {isPostHogEnabled
        ? (
            <PostHogProvider
              apiKey={POSTHOG_KEY}
              options={{ host: POSTHOG_HOST }}
            >
              <Slot />
            </PostHogProvider>
          )
        : <Slot />}
    </SafeAreaProvider>
  );
}
