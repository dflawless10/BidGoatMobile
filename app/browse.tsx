import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import MascotOverlay from '../app/components/MascotOverlay';
import SparkleTrail from '../app/sparkletrail/SparkleTrail';
import type { MascotMood } from '@/types/goatmoods';

export default function BrowseScreen() {
  const mood: MascotMood = 'Curious';

  return (
    <View style={styles.container}>
      <Text style={styles.title}>🔍 Browse & Bid</Text>
      <Text style={styles.subtitle}>
        The auction winds are stirring. Explore, bid, and let fate sparkle.
      </Text>

      {/* Replace with auction browser or filter UI */}
      <Text style={styles.placeholder}>[🌀 Auction browser coming soon 🌀]</Text>

      <SparkleTrail mood={mood} milestoneLevel={1} />
      <MascotOverlay
        mood={mood}
        message="Auction winds are stirring..."
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
