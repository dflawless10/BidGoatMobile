import React, { useCallback, useEffect, useState } from 'react';
import {
  FlatList,
  Image,
  Platform,
  StyleSheet,
  TouchableOpacity,
} from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { useFocusEffect } from '@react-navigation/native';
import { format } from 'date-fns';
import { router, Link } from 'expo-router';
import Animated, { FadeIn } from 'react-native-reanimated';

import ParallaxScrollView from '@/components/ParallaxScrollView';
import { ThemedText } from '@/components/ThemedText';
import { ThemedView } from '@/components/ThemedView';
import { Collapsible } from '@/components/Collapsible';
import { ExternalLink } from '@/components/ExternalLink';
import ExploreSlider from '@/components/ExploreSlider';
import ItemScreen from '@/app/seller/list-item';

import UnTappedHeart from '@/assets/unTappedHeart.svg';
import TappedHeart from '@/assets/TappedHeart.svg';

export type ListedItem = {
  id: number;
  name: string;
  description: string;
  price: number;
  photo_url: string;
  bid_count: number;
  listedAt: string;
  timeLeft: string;
  auction_ends_at: string;
};

function shuffleArray(array: ListedItem[]): ListedItem[] {
  return array
    .map((item) => ({ item, sort: Math.random() }))
    .sort((a, b) => a.sort - b.sort)
    .map(({ item }) => item);
}

const JustListedCard = React.memo(
  ({
    item,
    isFavorited,
    toggleFavorite,
  }: {
    item: ListedItem;
    isFavorited: boolean;
    toggleFavorite: (id: number) => void;
  }) => (
    <ThemedView style={styles.carouselCard}>
      <Image source={{ uri: item.photo_url }} style={styles.carouselImage} />
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
  )
);

export default function TabTwoScreen() {
  const [justListedItems, setJustListedItems] = useState<ListedItem[]>([]);
  const [favoritedItems, setFavoritedItems] = useState<Record<number, boolean>>({});

  const toggleFavorite = async (id: number) => {
  const updated = {
    ...favoritedItems,
    [id]: !favoritedItems[id],
  };

  setFavoritedItems(updated);

  try {
    await AsyncStorage.setItem('favoritedItems', JSON.stringify(updated));
    console.log(`Favorited item ${id} stored locally`);
  } catch (err) {
    console.error('Failed to store favorite:', err);
  }

  if (updated[id]) {
    console.log(`TappedHeart activated for item ${id} 🫀 Redirecting to /favorites`);
    router.push('/favorites');
  }
};

  const fetchJustListed = async () => {
  try {
    const token = await AsyncStorage.getItem('jwtToken');
    if (!token) {
      console.warn('No token found');
      return;
    }

    const response = await fetch('http://10.0.0.170:5000/api/jewelry-box', {
      headers: {
        Authorization: `Bearer ${token}`,
        'Content-Type': 'application/json',
      },
    });

    if (!response.ok) {
      console.warn('Response not OK:', await response.text());
      return;
    }

    const data = await response.json();

    if (Array.isArray(data.items)) {
      const safeItems = data.items.map((item: ListedItem) => ({
        ...item,
        photo_url: item.photo_url || 'https://your-default-image.com/goat.png',
      }));

      setJustListedItems(shuffleArray(safeItems));
    } else {
      console.warn('🐐 No items array in response:', data);
      setJustListedItems([]);
    }
  } catch (err) {
    console.error('Failed to fetch just listed items:', err);
  }
};


  useFocusEffect(
    useCallback(() => {
      fetchJustListed();
    }, [])
  );

  const renderItem = useCallback(
    ({ item }: { item: ListedItem }) => (
      <JustListedCard
        item={item}
        isFavorited={favoritedItems[item.id]}
        toggleFavorite={toggleFavorite}
      />
    ),
    [favoritedItems]
  );

  return (
    <ParallaxScrollView
      headerBackgroundColor={{ light: '#D0D0D0', dark: '#353636' }}
      headerImage={<></>}
    >
      <ThemedView style={{ paddingVertical: 16 }}>
        <ThemedText type="title">Just Listed</ThemedText>

        <FlatList
          data={justListedItems}
          extraData={favoritedItems}
          keyExtractor={(item) => item.id.toString()}
          renderItem={renderItem}
          pagingEnabled
          decelerationRate="fast"
          snapToAlignment="center"
          horizontal
          showsHorizontalScrollIndicator={false}
          contentContainerStyle={{ paddingHorizontal: 12 }}
        />
      </ThemedView>

      <ThemedView style={styles.titleContainer}>
        <ThemedText type="title">Explore</ThemedText>
      </ThemedView>

      <ExploreSlider />

      <Collapsible title="List Your Item">
        <ItemScreen />
      </Collapsible>

      <Collapsible title="Just Listed">
        <ThemedText>🆕 Fresh arrivals, just listed:</ThemedText>

        {justListedItems.length > 0 ? (
          justListedItems.map((item) => {
            const formattedDate = item.listedAt
  ? format(new Date(item.listedAt), 'PPP')
  : 'Unknown';

            return (
              <ThemedView key={item.id} style={styles.itemCard}>
                <Image source={{ uri: item.photo_url }} style={styles.thumbnail} />
                <ThemedText type="defaultSemiBold">{item.name}</ThemedText>
                <ThemedText>{item.description}</ThemedText>
                <ThemedText>${item.price}</ThemedText>
                <ThemedText>📅 {formattedDate}</ThemedText>

                <TouchableOpacity
                  onPress={() => toggleFavorite(item.id)}
                  style={styles.heartIcon}
                  accessibilityLabel="Toggle favorite"
                  activeOpacity={0.7}
                >
                  {favoritedItems[item.id] ? (
                    <TappedHeart width={28} height={28} />
                  ) : (
                    <UnTappedHeart width={28} height={28} />
                  )}
                </TouchableOpacity>

                <ThemedText
                  type="link"
                  style={{ marginTop: 8 }}
                  onPress={() => router.push(`/item/${item.id}` as const)}
                >
                  View Listing
                </ThemedText>
              </ThemedView>
            );
          })
        ) : (
          <ThemedText>No items listed yet</ThemedText>
        )}
      </Collapsible>

      <Collapsible title="Android, iOS, and web support">
        <ThemedText>
          You can open this project on Android, iOS, and the web. To open the web version, press{' '}
          <ThemedText type="defaultSemiBold">w</ThemedText> in the terminal running this project.
        </ThemedText>
      </Collapsible>

      <Collapsible title="Mascot Image Tips">
        <ThemedText>
          Our goat mascots sparkle best at{' '}
          <ThemedText type="defaultSemiBold">@2x</ThemedText> and{' '}
          <ThemedText type="defaultSemiBold">@3x</ThemedText> resolution. Use SVG for animations and WAV for bleats.
        </ThemedText>

        <Image
          source={require('@/assets/winkingGoat.svg')}
          style={{ alignSelf: 'center', width: 120, height: 120, marginVertical: 12 }}
        />

        <Link href={'/mascot-guidelines' as any}>
          <ThemedText type="link">View Mascot Guidelines</ThemedText>
        </Link>
      </Collapsible>

      <Collapsible title="Custom fonts">
        <ThemedText>
          Open <ThemedText type="defaultSemiBold">app/_layout.tsx</ThemedText> to see how to load{' '}
          <ThemedText style={{ fontFamily: 'SpaceMono' }}>
            custom fonts such as this one.
          </ThemedText>
        </ThemedText>
        <ExternalLink href="https://docs.expo.dev/versions/latest/sdk/font">
          <ThemedText type="link">Learn more</ThemedText>
        </ExternalLink>
      </Collapsible>

      <Collapsible title="Light and dark mode components">
        <ThemedText>
          This template has light and dark mode support. The{' '}
          <ThemedText type="defaultSemiBold">useColorScheme()</ThemedText> hook lets you inspect
          what the user&apos;s current color scheme is, and so you can adjust UI colors accordingly.
        </ThemedText>
        <ExternalLink href="https://docs.expo.dev/develop/user-interface/color-themes/">
          <ThemedText type="link">Learn more</ThemedText>
        </ExternalLink>
      </Collapsible>

      <Collapsible title="Animations">
        <ThemedText>
          This template includes an example of an animated component. The{' '}
          <ThemedText type="defaultSemiBold">components/HelloWave.tsx</ThemedText> component uses
          the powerful <ThemedText type="defaultSemiBold">react-native-reanimated</ThemedText>{' '}
          library to create a waving hand animation.
        </ThemedText>
        {Platform.select({
          ios: (
            <ThemedText>
              The <ThemedText type="defaultSemiBold">components/ParallaxScrollView.tsx</ThemedText>{' '}
              component provides a parallax effect for the header image.
            </ThemedText>
          ),
        })}
      </Collapsible>
    </ParallaxScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
  },
  header: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    zIndex: 1,
    backgroundColor: 'transparent',
  },
  headerImage: {
    color: '#808080',
    bottom: -90,
    left: -35,
    position: 'absolute',
  },
  titleContainer: {
    paddingHorizontal: 16,
    paddingVertical: 12,
  },
  listedImage: {
    height: 100,
    borderRadius: 8,
    marginVertical: 8,
    alignSelf: 'center',
  },
    itemCard: {
    marginVertical: 12,
    padding: 12,
    borderRadius: 10,
    backgroundColor: '#f9f9f9',
  },
    thumbnail: {
  width: '100%',
  height: 160,
  borderRadius: 8,
  marginBottom: 8,
},
    carouselCard: {
    width: 240,
    marginRight: 12,
    padding: 12,
    borderRadius: 12,
    backgroundColor: '#fff',
    shadowColor: '#000',
    shadowOpacity: 0.1,
    shadowRadius: 6,
    elevation: 3,
  },

carouselImage: {
  width: '100%',
  height: 140,
  borderRadius: 8,
  marginBottom: 8,
},
  featuredBadge: {
    marginTop: 6,
    fontSize: 12,
    color: '#ff9900',
  },
   heartIcon: {
    position: 'absolute',
    top: 12,
    right: 12,
    zIndex: 10,
  },


});