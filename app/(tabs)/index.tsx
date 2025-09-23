import React, { useEffect, useState, useRef } from 'react';
import {
  StyleSheet,
  View,
  Text,
  Animated,
  SafeAreaView,
  ScrollView,
  TouchableOpacity,
  useColorScheme,
} from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { ImageBackground } from 'expo-image';
import * as SystemUI from 'expo-system-ui';
import WelcomeDashboard from '@/app/onboarding/WelcomeDashboard';
import EnhancedHeader from '@/app/components/EnhancedHeader';
import { AuctionCard } from '@/components/AuctionCard';
import type { AuctionPreview } from '@/types/auction';
import { playGoatSound } from '@/utils/GoatSound';
import { StatusBar } from 'expo-status-bar';
import {ListedItem} from "@/types/items";
import SparkleItemCard from "@/app/components/SparkleItemCard";


type LocalDisplayItem = {
  id: number;
  title: string;
  price: number;
  rarity?: 'common' | 'rare' | 'legendary';
  countdown?: boolean;
  end_time: string; // ✅ Make this required
  imageUrl?: string;
};



const goatColors = {
  light: {
    primary: '#023c69',
    background: '#d0d0c0',
    text: '#242c40',
    tabBackground: '#eee',
    overlay: 'rgba(255,255,255,0.85)',
  },
  dark: {
    primary: '#011d34',
    background: '#242c40',
    text: '#d0d0c0',
    tabBackground: '#333',
    overlay: 'rgba(0,0,0,0.6)',
  },
};

function HomeScreen() {
  const [username, setUsername] = useState<string | null>(null);
  const [activeCategory, setActiveCategory] = useState<'Just Listed' | 'Create Auction' | 'Sell Now'>('Just Listed');

  const scrollY = useRef(new Animated.Value(0)).current;
  const scheme = useColorScheme() ?? 'light';
  const theme = goatColors[scheme];
  const [items, setItems] = useState<ListedItem[]>([]);

  const [favoritedItems, setFavoritedItems] = useState<Record<number, boolean>>({});

const toggleFavorite = (id: number) => {
  setFavoritedItems((prev) => ({
    ...prev,
    [id]: !prev[id],
  }));
};



  useEffect(() => {
    const loadUsername = async () => {
      const [name, token] = await Promise.all([
        AsyncStorage.getItem('username'),
        AsyncStorage.getItem('jwtToken'),
      ]);

      if (name && token) {
        setUsername(name);
      } else {
        setUsername(null);
        await AsyncStorage.multiRemove(['username', 'jwtToken']);
      }
    };
    void loadUsername();
  }, []);

  useEffect(() => {
    SystemUI.setBackgroundColorAsync(theme.background);
  }, [theme.background]);

  useEffect(() => {
    const fetchItems = async () => {
      try {
        const token = await AsyncStorage.getItem('jwtToken');
        if (!token) return;

        let endpoint = '';
        switch (activeCategory) {
          case 'Just Listed':
            endpoint = '/api/jewelry-box';
            break;
          case 'Sell Now':
            endpoint = '/api/sell-now';
            break;
          case 'Create Auction':
            endpoint = '/api/auction-drafts';
            break;
        }

        const response = await fetch(`http://10.0.0.170:5000${endpoint}`, {
          headers: {
            Authorization: `Bearer ${token}`,
            'Content-Type': 'application/json',
          },
        });

      if (response.ok) {
        const data = await response.json();
        const mapped: ListedItem[] = data.items.map((item: any, index: number) => ({
          id: item.id || index,
          name: item.name,
          description: item.description || '',
          price: item.price || 0,
          photo_url: item.image || item.photo_url || '',
          bid_count: item.bid_count,
          listedAt: item.listedAt,
          auction_ends_at: item.auction_ends_at ?? '',
          end_time: item.end_time ?? '',
          timeLeft: item.timeLeft,
          arity: ['common', 'rare', 'legendary'].includes(item.rarity)
          ? item.rarity
          : 'common',
        }));

        console.log('🐐 Raw items:', data.items);


        setItems(mapped);
      } else {
        setItems([]);
      }
    } catch (err) {
      console.warn('Failed to fetch items:', err);
      setItems([]);
    }
  };

    fetchItems();
  }, [activeCategory]);

  const renderHeader = () => (
    <ImageBackground
      source={require('@/assets/goat.png')}
      style={styles.heroBackground}
      contentFit="cover"
    >
      <View style={[styles.overlay, { backgroundColor: theme.overlay }]}>
        <Text style={[styles.tagline, { color: theme.text }]}>Welcome to BidGoatMobile 🐐💎</Text>
        <WelcomeDashboard />
      </View>
    </ImageBackground>
  );

  const toPreview = (item: LocalDisplayItem): AuctionPreview => {
    const endsAt = item.end_time || new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString();
    return {
      id: String(item.id),
      end_time: endsAt,
      auction_ends_at: endsAt,
      item: {
        id: String(item.id),
        title: item.title,
        price: item.price,
        rarity: item.rarity,
        end_time: endsAt,
        auction_ends_at: endsAt,
      },
      title: "",
      price: 0,
    };
  };


  return (
    <SafeAreaView style={[styles.container, { backgroundColor: theme.background }]}>
      <EnhancedHeader scrollY={scrollY} username={username} />

      <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.categorySlider}>
        {(['Just Listed', 'Create Auction', 'Sell Now'] as const).map((label) => {
          const isActive = activeCategory === label;
          return (
            <TouchableOpacity
              key={label}
              onPress={() => setActiveCategory(label)}
              style={[
                styles.categoryTab,
                { backgroundColor: theme.tabBackground },
                isActive && { backgroundColor: theme.primary, borderColor: '#ffd700', borderWidth: 2 },
              ]}
            >
              <Text
                style={[
                  styles.categoryText,
                  { color: theme.text },
                  isActive && { color: '#fff', fontWeight: 'bold' },
                ]}
              >
                {label}
              </Text>
            </TouchableOpacity>
          );
        })}
      </ScrollView>

     <Animated.FlatList<ListedItem>
  data={items}
  keyExtractor={(item) => item.id.toString()}
  renderItem={({ item, index }) => {
    const isRareLike = item.description?.includes('Rare') || item.rarity === 'rare' || item.rarity === 'legendary';
    const wrapperStyle = [
      styles.itemWrapper,
      {
        backgroundColor: item.timeLeft ? '#fffbe6' : '#f8f8f8',
        borderColor: isRareLike ? '#ffd700' : '#ccc',
        borderWidth: 2,
      },
    ];
    return (
      <View style={wrapperStyle}>
        <SparkleItemCard
          item={item}
          isFavorited={favoritedItems[item.id]}
          toggleFavorite={toggleFavorite}
        />
      </View>
    );
  }}
  contentContainerStyle={styles.cardList}
  onScroll={Animated.event(
    [{ nativeEvent: { contentOffset: { y: scrollY } } }],
    { useNativeDriver: false }
  )}
  scrollEventThrottle={16}
  ListHeaderComponent={renderHeader}
  ListEmptyComponent={
    <Text style={{ textAlign: 'center', marginTop: 32, color: theme.text }}>
      No items yet—your goat magic awaits!
    </Text>
  }
/>

<StatusBar style={scheme === 'dark' ? 'light' : 'dark'} />
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  categorySlider: { paddingVertical: 12, paddingHorizontal: 16 },
  categoryTab: {
    paddingVertical: 8,
    paddingHorizontal: 16,
    borderRadius: 20,
    marginRight: 12,
  },
  categoryText: { fontSize: 16 },
  cardList: { paddingHorizontal: 16, paddingBottom: 120 },
  heroBackground: { width: '100%', minHeight: 260, justifyContent: 'center' },
  overlay: { flex: 1, justifyContent: 'center', alignItems: 'center', padding: 24 },
  tagline: { fontSize: 24, marginBottom: 32, textAlign: 'center' },
  itemWrapper: {
    borderRadius: 12,
    padding: 8,
    marginVertical: 8,
  },
});

export default HomeScreen;
