import React, { useEffect, useMemo, useState } from 'react';
import { SafeAreaView } from 'react-native-safe-area-context';
import { NavigationContainer } from '@react-navigation/native';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { createStackNavigator } from '@react-navigation/stack';
import { Provider as PaperProvider } from 'react-native-paper';
import { StatusBar } from 'expo-status-bar';
import MaterialCommunityIcons from '@expo/vector-icons/MaterialCommunityIcons';

import { paperTheme } from './src/utils/theme';
import { AuthProvider, useAuth } from './src/context/AuthContext';
import { LoginScreen } from './src/screens/auth/LoginScreen';
import { BusinessSetupScreen } from './src/screens/auth/BusinessSetupScreen';
import { DashboardScreen } from './src/screens/dashboard/DashboardScreen';
import { SettingsScreen } from './src/screens/settings/SettingsScreen';
import { PricingScreen } from './src/screens/settings/PricingScreen';

const RootStack = createStackNavigator();
const Tab = createBottomTabNavigator();
const MoreStack = createStackNavigator();

function MoreNavigator() {
  return (
    <MoreStack.Navigator screenOptions={{ headerShown: false }}>
      <MoreStack.Screen name="Settings" component={SettingsScreen} />
      <MoreStack.Screen name="Pricing" component={PricingScreen} />
    </MoreStack.Navigator>
  );
}

function MainNavigator() {
  return (
    <Tab.Navigator
      screenOptions={({ route }) => ({
        headerShown: false,
        tabBarShowLabel: false,
        tabBarStyle: { height: 64 },
        tabBarIcon: ({ focused, color, size }) => {
          const iconMap = {
            Dashboard: focused ? 'view-dashboard' : 'view-dashboard-outline',
            More: 'menu',
          };
          const name = iconMap[route.name] || 'circle-outline';
          return <MaterialCommunityIcons name={name} size={size} color={color} />;
        },
        tabBarActiveTintColor: paperTheme.colors.primary,
        tabBarInactiveTintColor: paperTheme.colors.placeholder,
      })}
    >
      <Tab.Screen name="Dashboard" component={DashboardScreen} />
      <Tab.Screen name="More" component={MoreNavigator} />
    </Tab.Navigator>
  );
}

function AuthNavigator() {
  return (
    <RootStack.Navigator screenOptions={{ headerShown: false }}>
      <RootStack.Screen name="Login" component={LoginScreen} />
      <RootStack.Screen name="BusinessSetup" component={BusinessSetupScreen} />
    </RootStack.Navigator>
  );
}

function AppGate() {
  const { state, bootstrap } = useAuth();
  const [ready, setReady] = useState(false);

  useEffect(() => {
    bootstrap().finally(() => setReady(true));
  }, [bootstrap]);

  if (!ready) return <SafeAreaView style={{ flex: 1, backgroundColor: paperTheme.colors.background }} />;

  return (
    <NavigationContainer>
      <RootStack.Navigator screenOptions={{ headerShown: false }}>
        {state.accessToken ? (
          <RootStack.Screen name="Main" component={MainNavigator} />
        ) : (
          <RootStack.Screen name="Auth" component={AuthNavigator} />
        )}
      </RootStack.Navigator>
    </NavigationContainer>
  );
}

export default function App() {
  const theme = useMemo(() => paperTheme, []);
  return (
    <PaperProvider theme={theme}>
      <StatusBar style="dark" />
      <AuthProvider>
        <AppGate />
      </AuthProvider>
    </PaperProvider>
  );
}

