'use client';

import { useState, useEffect } from 'react';
import { useUser } from '@clerk/nextjs';
import { Button } from '@/components/ui/button';
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Loader2, ExternalLink, AlertCircle, CheckCircle2 } from 'lucide-react';
import type { SubscriptionStatus } from '@/lib/stripe';

export function SubscriptionManager() {
  const { user } = useUser();
  const [subscription, setSubscription] = useState<SubscriptionStatus | null>(null);
  const [loading, setLoading] = useState(true);
  const [portalLoading, setPortalLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    fetchSubscription();
  }, []);

  const fetchSubscription = async () => {
    try {
      setLoading(true);
      setError(null);
      const response = await fetch('/api/stripe/subscription');
      if (!response.ok) {
        throw new Error('Failed to fetch subscription');
      }
      const data = await response.json();
      setSubscription(data);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to load subscription');
    } finally {
      setLoading(false);
    }
  };

  const openCustomerPortal = async () => {
    try {
      setPortalLoading(true);
      const response = await fetch('/api/stripe/portal', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({}),
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.error || 'Failed to open billing portal');
      }

      const { url } = await response.json();
      window.location.href = url;
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to open billing portal');
    } finally {
      setPortalLoading(false);
    }
  };

  const getTierColor = (tier: string) => {
    switch (tier) {
      case 'max':
        return 'bg-purple-500';
      case 'pro':
        return 'bg-blue-500';
      default:
        return 'bg-gray-500';
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'active':
        return 'bg-green-500';
      case 'trialing':
        return 'bg-blue-500';
      case 'past_due':
        return 'bg-yellow-500';
      case 'canceled':
        return 'bg-red-500';
      default:
        return 'bg-gray-500';
    }
  };

  const formatDate = (dateString: string | null) => {
    if (!dateString) return 'N/A';
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
    });
  };

  if (loading) {
    return (
      <Card>
        <CardContent className="flex items-center justify-center py-12">
          <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
        </CardContent>
      </Card>
    );
  }

  if (error) {
    return (
      <Card>
        <CardContent className="flex items-center gap-3 py-6">
          <AlertCircle className="h-5 w-5 text-red-500" />
          <span className="text-red-500">{error}</span>
          <Button variant="outline" size="sm" onClick={fetchSubscription}>
            Retry
          </Button>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center justify-between">
          <span>Subscription</span>
          <Badge className={getTierColor(subscription?.tier || 'free')}>
            {subscription?.tier?.toUpperCase() || 'FREE'}
          </Badge>
        </CardTitle>
        <CardDescription>Manage your subscription and billing</CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        {/* Current Plan Info */}
        <div className="grid grid-cols-2 gap-4">
          <div>
            <p className="text-sm text-muted-foreground">Status</p>
            <div className="flex items-center gap-2 mt-1">
              {subscription?.status === 'active' ? (
                <CheckCircle2 className="h-4 w-4 text-green-500" />
              ) : (
                <AlertCircle className="h-4 w-4 text-yellow-500" />
              )}
              <Badge variant="outline" className={getStatusColor(subscription?.status || 'none')}>
                {subscription?.status === 'none'
                  ? 'No subscription'
                  : subscription?.status?.replace('_', ' ').toUpperCase()}
              </Badge>
            </div>
          </div>
          <div>
            <p className="text-sm text-muted-foreground">Billing Interval</p>
            <p className="font-medium mt-1">
              {subscription?.interval
                ? subscription.interval.charAt(0).toUpperCase() + subscription.interval.slice(1)
                : 'N/A'}
            </p>
          </div>
        </div>

        {subscription?.currentPeriodEnd && (
          <div>
            <p className="text-sm text-muted-foreground">
              {subscription.cancelAtPeriodEnd ? 'Access until' : 'Next billing date'}
            </p>
            <p className="font-medium mt-1">{formatDate(subscription.currentPeriodEnd)}</p>
          </div>
        )}

        {subscription?.cancelAtPeriodEnd && (
          <div className="bg-yellow-50 dark:bg-yellow-900/20 border border-yellow-200 dark:border-yellow-800 rounded-lg p-3">
            <p className="text-sm text-yellow-800 dark:text-yellow-200">
              Your subscription is set to cancel at the end of the current billing period.
              You&apos;ll continue to have access until {formatDate(subscription.currentPeriodEnd)}.
            </p>
          </div>
        )}

        {/* User Email */}
        <div>
          <p className="text-sm text-muted-foreground">Account Email</p>
          <p className="font-medium mt-1">{user?.emailAddresses[0]?.emailAddress}</p>
        </div>
      </CardContent>
      <CardFooter className="flex flex-col sm:flex-row gap-3">
        {subscription?.tier === 'free' ? (
          <Button asChild className="w-full sm:w-auto">
            <a href="/pricing">Upgrade Plan</a>
          </Button>
        ) : (
          <Button
            onClick={openCustomerPortal}
            disabled={portalLoading}
            className="w-full sm:w-auto"
          >
            {portalLoading ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Loading...
              </>
            ) : (
              <>
                Manage Billing
                <ExternalLink className="ml-2 h-4 w-4" />
              </>
            )}
          </Button>
        )}
        {subscription?.tier !== 'max' && subscription?.tier !== 'free' && (
          <Button asChild variant="outline" className="w-full sm:w-auto">
            <a href="/pricing">Upgrade Plan</a>
          </Button>
        )}
      </CardFooter>
    </Card>
  );
}
