import React, { useState } from 'react';
import { KeyboardAvoidingView, Platform, View } from 'react-native';
import { Button, Card, Text, TextInput } from 'react-native-paper';
import { useAuth } from '../../context/AuthContext';
import { formatIndianMobile } from '../../utils/formatters';
import { theme } from '../../utils/theme';

export function LoginScreen({ navigation }) {
  const { state, requestOtp, verifyOtp } = useAuth();
  const [mobile, setMobile] = useState('');
  const [otp, setOtp] = useState('');
  const [stage, setStage] = useState('mobile');
  const [loading, setLoading] = useState(false);
  const digits = mobile.replace(/\D/g, '').slice(0, 10);

  const onContinue = async () => {
    setLoading(true);
    try {
      if (stage === 'mobile') {
        await requestOtp(digits);
        setStage('otp');
      } else {
        await verifyOtp(digits, otp);
        navigation.replace('BusinessSetup');
      }
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
        <Text style={[theme.typography.displayL, { color: theme.colors.textPrimary }]}>Vyoma</Text>
        <Text style={[theme.typography.bodyM, { color: theme.colors.textSecondary, marginTop: 8 }]}>
          Login with your mobile number (OTP: 1234).
        </Text>

        <Card style={{ marginTop: theme.spacing.xxl, borderRadius: theme.radii.card }}>
          <Card.Content>
            <TextInput
              label="Mobile (+91)"
              value={formatIndianMobile(mobile)}
              onChangeText={setMobile}
              keyboardType="phone-pad"
              maxLength={14}
              style={{ backgroundColor: 'transparent' }}
            />
            {stage === 'otp' ? (
              <TextInput
                label="OTP"
                value={otp}
                onChangeText={setOtp}
                keyboardType="number-pad"
                maxLength={4}
                style={{ backgroundColor: 'transparent', marginTop: theme.spacing.lg }}
              />
            ) : null}

            <Button
              mode="contained"
              loading={loading}
              disabled={loading || digits.length !== 10 || (stage === 'otp' && otp.length !== 4)}
              onPress={onContinue}
              style={{ marginTop: theme.spacing.xl, borderRadius: theme.radii.button }}
              contentStyle={{ height: 52 }}
            >
              {stage === 'mobile' ? 'Send OTP' : 'Verify & Continue'}
            </Button>
          </Card.Content>
        </Card>
      </View>
    </KeyboardAvoidingView>
  );
}

