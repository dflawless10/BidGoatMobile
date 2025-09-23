import React from 'react';
import { Image, TouchableOpacity, StyleSheet } from 'react-native';
import Animated, { FadeIn } from 'react-native-reanimated';
import { router } from 'expo-router';

import { ThemedText } from '@/components/ThemedText';
import { ThemedView } from '@/components/ThemedView';

import UnTappedHeart from '@/assets/unTappedHeart.svg';
import TappedHeart from '@/assets/TappedHeart.svg';

export type ListedItem = {
  id: number;
  name: string;
  description: string;
  price: number;
  photo_url: string;
  bid_count?: number;
  listedAt?: string;
  timeLeft?: string;
  end_time?: string;
  rarity?: 'common' | 'rare' | 'legendary'; // ✅ Add this
};


export default function SparkleItemCard({
  item,
  isFavorited,
  toggleFavorite,
}: Readonly<{
  item: ListedItem;
  isFavorited: boolean;
  toggleFavorite: (id: number) => void;
}>) {

  return (
    <ThemedView style={styles.card}>
      <Image source={{ uri: item.photo_url }} style={styles.image} />
      <ThemedText type="defaultSemiBold">{item.name}</ThemedText>
      <ThemedText>${item.price}</ThemedText>

      <TouchableOpacity
        onPress={() => toggleFavorite(item.id)}
        style={styles.heartIcon}
        accessibilityLabel="Toggle favorite"
        activeOpacity={0.7}
      >
        {isFavorited ? (
          <TappedHeart width={28} height={28} />
        ) : (
          <UnTappedHeart width={28} height={28} />
        )}
      </TouchableOpacity>

      <Animated.View entering={FadeIn}>
        <ThemedText style={styles.featuredBadge}>🌟 Featured</ThemedText>
      </Animated.View>

      <ThemedText
        type="link"
        style={{ marginTop: 6 }}
        onPress={() => router.push(`/item/${item.id}` as const)}
      >
        View Listing
      </ThemedText>
    </ThemedView>
  );
}

const styles = StyleSheet.create({
  card: {
    padding: 12,
    borderRadius: 12,
    backgroundColor: '#fff',
    marginBottom: 12,
    elevation: 2,
  },
  image: {
    width: '100%',
    height: 160,
    borderRadius: 8,
    marginBottom: 8,
  },
  heartIcon: {
    position: 'absolute',
    top: 12,
    right: 12,
  },
  featuredBadge: {
    marginTop: 4,
    fontSize: 12,
    color: '#888',
  },
});
