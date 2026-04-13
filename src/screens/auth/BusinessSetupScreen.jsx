import React, { useState } from 'react';
import { KeyboardAvoidingView, Platform, View } from 'react-native';
import { Button, Card, Text, TextInput } from 'react-native-paper';
import { useAuth } from '../../context/AuthContext';
import { theme } from '../../utils/theme';

export function BusinessSetupScreen({ navigation }) {
  const { state, setupBusiness } = useAuth();
  const [name, setName] = useState('Sunita Beauty Parlour');
  const [type, setType] = useState('salon');
  const [city, setCity] = useState('Pune');
  const [loading, setLoading] = useState(false);

  const onSetup = async () => {
    setLoading(true);
    try {
      await setupBusiness({ name, type, phone: state.user?.mobile, city });
      navigation.replace('Main');
    } finally {
      setLoading(false);
    }
  };

  return (
    <KeyboardAvoidingView
      style={{ flex: 1, backgroundColor: theme.colors.background, padding: theme.spacing.xl }}
      behavior={Platform.OS === 'ios' ? 'padding' : undefined}
    >
      <View style={{ flex: 1, justifyContent: 'center' }}>
        <Text style={[theme.typography.displayM, { color: theme.colors.textPrimary }]}>Set up your business</Text>
        <Text style={[theme.typography.bodyM, { color: theme.colors.textSecondary, marginTop: 8 }]}>
          This creates your Business + Main Branch in Phase 2 backend.
        </Text>
        <Card style={{ marginTop: theme.spacing.xxl, borderRadius: theme.radii.card }}>
          <Card.Content>
            <TextInput label="Business name" value={name} onChangeText={setName} style={{ backgroundColor: 'transparent' }} />
            <TextInput
              label="Business type (salon/clinic/tuition/gym/autorepair/other)"
              value={type}
              onChangeText={setType}
              style={{ backgroundColor: 'transparent', marginTop: theme.spacing.lg }}
            />
            <TextInput label="City" value={city} onChangeText={setCity} style={{ backgroundColor: 'transparent', marginTop: theme.spacing.lg }} />
            <Button
              mode="contained"
              loading={loading}
              disabled={loading || !name}
              onPress={onSetup}
              style={{ marginTop: theme.spacing.xl, borderRadius: theme.radii.button }}
              contentStyle={{ height: 52 }}
            >
              Continue
            </Button>
          </Card.Content>
        </Card>
      </View>
    </KeyboardAvoidingView>
  );
}

