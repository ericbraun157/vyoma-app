import React, { useState } from 'react';
import { Alert, ScrollView, View } from 'react-native';
import { Button, Card, Text } from 'react-native-paper';
import RazorpayCheckout from 'react-native-razorpay';
import { useAuth } from '../../context/AuthContext';
import { api } from '../../services/apiClient';
import { theme } from '../../utils/theme';

export function PricingScreen() {
  const { state } = useAuth();
  const [loadingPlan, setLoadingPlan] = useState(null);

  const upgrade = async (plan) => {
    if (!state.businessId) {
      Alert.alert('Business not set up yet');
      return;
    }
    setLoadingPlan(plan);
    try {
      const res = await api.post(
        '/billing/subscriptions/razorpay/create-order',
        { businessId: state.businessId, plan },
        { accessToken: state.accessToken },
      );

      const options = {
        key: res.keyId,
        amount: res.order.amount,
        currency: res.order.currency || 'INR',
        name: 'Vyoma',
        description: `${plan.toUpperCase()} plan`,
        order_id: res.order.id,
        prefill: {
          contact: state.user?.mobile,
        },
        notes: {
          businessId: state.businessId,
          plan,
        },
        theme: { color: theme.colors.primary },
      };

      // In dev environments, backend may return a dummy order; skip checkout gracefully.
      if (res.order.id === 'order_dummy') {
        Alert.alert('Test mode', 'Razorpay keys not configured on backend. Set RAZORPAY_KEY_ID/SECRET.');
        return;
      }

      await RazorpayCheckout.open(options);
      Alert.alert('Payment initiated', 'If webhook is configured, plan will update on backend.');
    } catch (e) {
      Alert.alert('Upgrade failed', e?.message || 'Unknown error');
    } finally {
      setLoadingPlan(null);
    }
  };

  return (
    <ScrollView style={{ flex: 1, backgroundColor: theme.colors.background }}>
      <View style={{ padding: theme.spacing.xl }}>
        <Text style={[theme.typography.displayL, { color: theme.colors.textPrimary }]}>Upgrade plan</Text>

        <Card style={{ marginTop: theme.spacing.xl, borderRadius: theme.radii.card }}>
          <Card.Content>
            <Text style={[theme.typography.displayM, { color: theme.colors.textPrimary }]}>Basic — ₹799 / month</Text>
            <Text style={[theme.typography.bodyM, { color: theme.colors.textSecondary, marginTop: 8 }]}>
              Unlimited bookings • GST invoices • WhatsApp reminders
            </Text>
            <Button
              mode="contained"
              loading={loadingPlan === 'basic'}
              onPress={() => upgrade('basic')}
              style={{ marginTop: theme.spacing.lg, borderRadius: theme.radii.button }}
              contentStyle={{ height: 52 }}
            >
              Upgrade to Basic
            </Button>
          </Card.Content>
        </Card>

        <Card style={{ marginTop: theme.spacing.lg, borderRadius: theme.radii.card }}>
          <Card.Content>
            <Text style={[theme.typography.displayM, { color: theme.colors.textPrimary }]}>Pro — ₹1,499 / month</Text>
            <Text style={[theme.typography.bodyM, { color: theme.colors.textSecondary, marginTop: 8 }]}>
              Everything in Basic • Inventory • Advanced analytics
            </Text>
            <Button
              mode="contained"
              loading={loadingPlan === 'pro'}
              onPress={() => upgrade('pro')}
              style={{ marginTop: theme.spacing.lg, borderRadius: theme.radii.button }}
              contentStyle={{ height: 52 }}
            >
              Upgrade to Pro
            </Button>
          </Card.Content>
        </Card>
      </View>
    </ScrollView>
  );
}

