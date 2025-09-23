import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import MascotOverlay from '../app/components/MascotOverlay';
import SparkleTrail from '../app/sparkletrail/SparkleTrail';
import type { MascotMood } from '@/types/goatmoods';

export default function BuyScreen() {
  const mood: MascotMood = 'Excited';

  return (
    <View style={styles.container}>
      <Text style={styles.title}>💍 Buy Bling</Text>
      <Text style={styles.subtitle}>
        The sparkle you seek is just a bid away. Let’s find your next treasure.
      </Text>

      {/* Replace with actual listing grid or search component */}
      <Text style={styles.placeholder}>[✨ Listings will appear here ✨]</Text>

      <SparkleTrail mood={mood} milestoneLevel={1} />
      <MascotOverlay
        mood="Shimmer" // ✅ Must match MascotMood union
        message="Sparkle on, seller!"
        position="bottom"
        visible={true}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, padding: 20, backgroundColor: '#fff' },
  title: { fontSize: 24, fontWeight: 'bold', marginBottom: 12 },
  subtitle: { fontSize: 16, marginBottom: 20 },
  placeholder: { fontSize: 16, color: '#888', textAlign: 'center' },
});
