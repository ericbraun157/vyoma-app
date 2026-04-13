import React from 'react';
import { ScrollView, View } from 'react-native';
import { Button, Card, Text } from 'react-native-paper';
import { useAuth } from '../../context/AuthContext';
import { theme } from '../../utils/theme';

export function SettingsScreen({ navigation }) {
  const { state, setBranch, logout } = useAuth();

  return (
    <ScrollView style={{ flex: 1, backgroundColor: theme.colors.background }}>
      <View style={{ padding: theme.spacing.xl }}>
        <Text style={[theme.typography.displayL, { color: theme.colors.textPrimary }]}>More</Text>

        <Card style={{ marginTop: theme.spacing.xl, borderRadius: theme.radii.card }}>
          <Card.Content>
            <Text style={[theme.typography.displayM, { color: theme.colors.textPrimary }]}>Branch</Text>
            <Text style={[theme.typography.bodyS, { color: theme.colors.textSecondary, marginTop: 4 }]}>
              This is the Phase 2 branch switcher; APIs are branch-scoped.
            </Text>

            <View style={{ marginTop: theme.spacing.lg, gap: 8 }}>
              {(state.branches || []).map((b) => (
                <Button
                  key={b.id}
                  mode={b.id === state.branchId ? 'contained' : 'outlined'}
                  onPress={() => setBranch(b.id)}
                  style={{ borderRadius: theme.radii.button }}
                >
                  {b.name}
                </Button>
              ))}
              {!state.branches?.length ? (
                <Text style={[theme.typography.bodyM, { color: theme.colors.textSecondary }]}>
                  No branches loaded yet.
                </Text>
              ) : null}
            </View>
          </Card.Content>
        </Card>

        <Card style={{ marginTop: theme.spacing.lg, borderRadius: theme.radii.card }}>
          <Card.Content>
            <Text style={[theme.typography.displayM, { color: theme.colors.textPrimary }]}>Plan</Text>
            <Text style={[theme.typography.bodyM, { color: theme.colors.textSecondary, marginTop: 6 }]}>
              Current: {String(state?.plan || 'free')}
            </Text>
            <Button
              mode="contained"
              onPress={() => navigation.navigate('Pricing')}
              style={{ marginTop: theme.spacing.lg, borderRadius: theme.radii.button }}
              contentStyle={{ height: 52 }}
            >
              Upgrade
            </Button>
          </Card.Content>
        </Card>

        <Button
          mode="text"
          onPress={logout}
          style={{ marginTop: theme.spacing.xl }}
        >
          Logout
        </Button>
      </View>
    </ScrollView>
  );
}

