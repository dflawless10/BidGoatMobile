// app1/_layout.tsx
import React from 'react';
import { Platform } from 'react-native';
import  useColorScheme  from '@/hooks/useColorScheme';
import { Tabs } from 'expo-router';
import { HapticTab } from '@/components/HapticTab';
import { IconSymbol } from '@/components/ui/IconSymbol';
import TabBarBackground from '@/components/ui/TabBarBackground';
import { Colors } from '@/constants/Colors';
import { CartProvider } from 'utils/context/CartContext';
import PersistentSearchBar from '@/components/PersistentSearchBar';


export default function AppLayout() {
  const colorScheme = useColorScheme();

  return (
    <CartProvider>

      <Tabs
        initialRouteName="explore"
        screenOptions={{
          tabBarActiveTintColor: Colors[colorScheme ?? 'light'].tint,
          headerShown: false,
          tabBarButton: HapticTab,
          tabBarBackground: TabBarBackground,
          tabBarStyle: Platform.select({
            ios: {
              position: 'absolute',
            },
            default: {},
          }),
        }}
      >
        <Tabs.Screen
          name="index"
          options={{
            title: 'Home',
            tabBarIcon: ({ color }) => (
              <IconSymbol size={28} name="house.fill" color={color} />
            ),
          }}
        />
        <Tabs.Screen
          name="explore"
          options={{
            title: 'Explore',
            tabBarIcon: ({ color }) => (
              <IconSymbol size={28} name="paperplane.fill" color={color} />
            ),
          }}
        />
        <Tabs.Screen
          name="cart"
          options={{
            title: 'Cart',
            tabBarIcon: ({ color }) => (
              <IconSymbol size={28} name="cart.fill" color={color} />
            ),
          }}
        />
      </Tabs>
    </CartProvider>
  );
}