import React, { useEffect, useState } from 'react';
import { ScrollView, View } from 'react-native';
import { Button, Card, Text } from 'react-native-paper';
import { useAuth } from '../../context/AuthContext';
import { api } from '../../services/apiClient';
import { formatCurrency } from '../../utils/formatters';
import { theme } from '../../utils/theme';

export function DashboardScreen() {
  const { state, refreshBranches } = useAuth();
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(false);

  const load = async () => {
    if (!state.accessToken) return;
    setLoading(true);
    try {
      const res = await api.get('/me/dashboard', { accessToken: state.accessToken });
      setData(res);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    load();
  }, [state.accessToken, state.branchId]);

  return (
    <ScrollView style={{ flex: 1, backgroundColor: theme.colors.background }}>
      <View style={{ padding: theme.spacing.xl }}>
        <Text style={[theme.typography.displayL, { color: theme.colors.textPrimary }]}>Dashboard</Text>
        <Text style={[theme.typography.bodyM, { color: theme.colors.textSecondary, marginTop: 6 }]}>
          Branch: {state.branchId || '—'}
        </Text>

        <Card style={{ marginTop: theme.spacing.xl, borderRadius: theme.radii.card }}>
          <Card.Content>
            <Text style={[theme.typography.label, { color: theme.colors.textSecondary }]}>Today’s bookings</Text>
            <Text style={[theme.typography.displayL, { color: theme.colors.textPrimary, marginTop: 6 }]}>
              {data?.todaysBookings ?? 0}
            </Text>
          </Card.Content>
        </Card>

        <Card style={{ marginTop: theme.spacing.lg, borderRadius: theme.radii.card }}>
          <Card.Content>
            <Text style={[theme.typography.label, { color: theme.colors.textSecondary }]}>Today’s revenue</Text>
            <Text style={[theme.typography.displayL, { color: theme.colors.textPrimary, marginTop: 6 }]}>
              {formatCurrency(data?.todaysRevenue ?? 0)}
            </Text>
          </Card.Content>
        </Card>

        <Card style={{ marginTop: theme.spacing.lg, borderRadius: theme.radii.card }}>
          <Card.Content>
            <Text style={[theme.typography.label, { color: theme.colors.textSecondary }]}>Pending payments</Text>
            <Text style={[theme.typography.displayM, { color: theme.colors.textPrimary, marginTop: 6 }]}>
              {formatCurrency(data?.pendingPaymentsAmount ?? 0)} • {data?.pendingPaymentsCount ?? 0} invoices
            </Text>
          </Card.Content>
        </Card>

        <Button
          mode="outlined"
          onPress={load}
          loading={loading}
          style={{ marginTop: theme.spacing.xl, borderRadius: theme.radii.button }}
          contentStyle={{ height: 44 }}
        >
          Refresh
        </Button>

        <Button
          mode="text"
          onPress={refreshBranches}
          style={{ marginTop: 8 }}
        >
          Refresh branches
        </Button>
      </View>
    </ScrollView>
  );
}

