'use client';

import { useState } from 'react';

import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { useSession } from '@/libs/auth-client';

export function UserProfileForm() {
  const { data: session } = useSession();
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState<string | null>(null);

  if (!session?.user) {
    return (
      <div className="rounded-lg border bg-card p-6">
        <p className="text-muted-foreground">Loading profile...</p>
      </div>
    );
  }

  return (
    <div className="rounded-lg border bg-card p-6 space-y-6">
      <div className="space-y-4">
        <h2 className="text-lg font-semibold">Profile Information</h2>

        {message && (
          <div className="rounded-md bg-primary/10 p-3 text-sm text-primary">
            {message}
          </div>
        )}

        <div className="space-y-2">
          <Label htmlFor="name">Name</Label>
          <Input
            id="name"
            type="text"
            defaultValue={session.user.name}
            disabled
          />
        </div>

        <div className="space-y-2">
          <Label htmlFor="email">Email</Label>
          <Input
            id="email"
            type="email"
            defaultValue={session.user.email}
            disabled
          />
        </div>

        <Button
          disabled={loading}
          variant="outline"
          onClick={() => {
            setLoading(true);
            setMessage('Profile management coming soon.');
            setLoading(false);
          }}
        >
          {loading ? 'Saving...' : 'Update Profile'}
        </Button>
      </div>
    </div>
  );
}
