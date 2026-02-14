import { Link, useRouter } from 'expo-router';
import { useState } from 'react';
import {
  ActivityIndicator,
  KeyboardAvoidingView,
  Platform,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from 'react-native';

import { signUp } from '@/lib/auth-client';

export default function SignUpScreen() {
  const router = useRouter();
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  const handleSignUp = async () => {
    if (!name || !email || !password) {
      setError('Please fill in all fields');
      return;
    }

    if (password.length < 8) {
      setError('Password must be at least 8 characters');
      return;
    }

    setError(null);
    setLoading(true);

    try {
      const result = await signUp.email({
        name,
        email,
        password,
      });

      if (result.error) {
        setError(result.error.message || 'Failed to create account');
      } else {
        router.replace('/(tabs)');
      }
    } catch {
      setError('An unexpected error occurred');
    } finally {
      setLoading(false);
    }
  };

  return (
    <KeyboardAvoidingView
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
      className="flex-1 bg-background"
    >
      <View className="flex-1 justify-center px-6">
        <Text className="mb-8 text-center text-3xl font-bold text-foreground">
          Create Account
        </Text>

        {error && (
          <View className="mb-4 rounded-lg bg-destructive/10 p-3">
            <Text className="text-sm text-destructive">{error}</Text>
          </View>
        )}

        <View className="mb-4">
          <Text className="mb-1 text-sm font-medium text-foreground">
            Name
          </Text>
          <TextInput
            className="rounded-lg border border-border bg-background px-4 py-3 text-foreground"
            placeholder="Your name"
            value={name}
            onChangeText={setName}
            autoComplete="name"
          />
        </View>

        <View className="mb-4">
          <Text className="mb-1 text-sm font-medium text-foreground">
            Email
          </Text>
          <TextInput
            className="rounded-lg border border-border bg-background px-4 py-3 text-foreground"
            placeholder="you@example.com"
            value={email}
            onChangeText={setEmail}
            autoCapitalize="none"
            keyboardType="email-address"
            autoComplete="email"
          />
        </View>

        <View className="mb-6">
          <Text className="mb-1 text-sm font-medium text-foreground">
            Password
          </Text>
          <TextInput
            className="rounded-lg border border-border bg-background px-4 py-3 text-foreground"
            placeholder="Create a password"
            value={password}
            onChangeText={setPassword}
            secureTextEntry
            autoComplete="new-password"
          />
        </View>

        <TouchableOpacity
          className="mb-4 items-center rounded-lg bg-primary py-3"
          onPress={handleSignUp}
          disabled={loading}
        >
          {loading ? (
            <ActivityIndicator color="white" />
          ) : (
            <Text className="font-semibold text-primary-foreground">
              Sign Up
            </Text>
          )}
        </TouchableOpacity>

        <View className="flex-row justify-center">
          <Text className="text-muted-foreground">
            Already have an account?{' '}
          </Text>
          <Link href="/(auth)/sign-in" asChild>
            <TouchableOpacity>
              <Text className="font-medium text-primary">Sign in</Text>
            </TouchableOpacity>
          </Link>
        </View>
      </View>
    </KeyboardAvoidingView>
  );
}
