import React, { useState, useCallback, useRef, useEffect } from 'react';
import {
  FlatList, View, Text, Image, TouchableOpacity, RefreshControl,
  ActivityIndicator, StyleSheet, Dimensions, Platform
} from 'react-native';
import * as Haptics from 'expo-haptics';
import { useRouter } from 'expo-router';
import { BlurView } from 'expo-blur';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import Animated, { FadeInDown } from 'react-native-reanimated';
import { Audio } from 'expo-av';
import { playGoatSoundByName } from '@/assets/sounds/officialGoatSoundsSoundtrack';
import { useFocusEffect } from '@react-navigation/native';
import ListHeader from '../components/ListHeader';
import {formatDistanceToNow} from "date-fns"; // ✅ External header component

const { width } = Dimensions.get('window');
const COLUMN_GAP = 12;
const NUM_COLUMNS = 2;
const ITEM_WIDTH = (width - 32 - COLUMN_GAP) / NUM_COLUMNS;

interface AuctionItem {
  id: string;
  title: string;
  description: string;
  image: string;
  price: number;
  recent_bids: string;
  photo_url: string;
  auction_ends_at: string;
  end_time: string;
  bidCount: number;
  seller: {
    name: string;
    avatar: string;
  };
  category: string;
}

export default function Discover() {
  const router = useRouter();
  const [refreshing, setRefreshing] = useState(false);
  const [loading, setLoading] = useState(false);
  const [items, setItems] = useState<AuctionItem[]>([]);
  const flatListRef = useRef<FlatList>(null);
  const [sound, setSound] = useState<Audio.Sound | null>(null);



  useEffect(() => {
    fetchItems();
  }, []);

  useFocusEffect(
    useCallback(() => {
      fetchItems();
    }, [])
  );



  const fetchItems = async () => {
    let data: AuctionItem[] = [];
    try {
      const res = await fetch('http://10.0.0.170:5000/items/discover');
      data = await res.json();
      const normalized = data.map((item: AuctionItem) => ({
        ...item,
        end_time: item.end_time ?? '',
      }));
      setItems(normalized);
    } catch (err) {
      console.error('Discover fetch error:', err);
      console.log('Fallback items:', data);
    }
  };

  const onRefresh = useCallback(async () => {
    setRefreshing(true);
    await fetchItems();
    setRefreshing(false);
  }, []);

  const getSuggestedBid = (item: AuctionItem) => {
    const base = item.price || 0;
    const increment = item.bidCount > 10 ? 200 : 100;
    return base + increment;
  };

  const playBah = async () => {
    await playGoatSoundByName('Stutter Baa');
  };

  const handleItemPress = async (item: AuctionItem) => {
  await Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
  await playBah();
  router.push(`/item/${item.id}`);
};



  const formatTime = (iso: string): string => {
  if (!iso) return "Auction ended";
  const end = new Date(iso);
  if (isNaN(end.getTime())) return "Auction ended";
  const now = new Date();
  const diffMs = end.getTime() - now.getTime();
  if (diffMs <= 0) return "Auction ended";
  const diffHrs = Math.floor(diffMs / (1000 * 60 * 60));
  const diffMin = Math.floor((diffMs % (1000 * 60 * 60)) / (1000 * 60));
  return `${diffHrs}h ${diffMin}m left`;
};




  const renderItem = ({ item, index }: { item: AuctionItem; index: number }) => (
    <Animated.View
  entering={FadeInDown.delay(index * 100).springify()}

>

      <TouchableOpacity
        style={styles.itemContainer}
        onPress={() => handleItemPress(item)}
        activeOpacity={0.9}
      >
        <View style={styles.imageContainer}>
          <Image source={{ uri: item.photo_url }} style={styles.image} />
          <BlurView intensity={80} style={styles.priceTag}>
            <Text style={styles.priceText}>${(item.price ?? 0).toFixed(2)}</Text>
          </BlurView>
        </View>

        <View style={styles.infoContainer}>
          <Text style={styles.title} numberOfLines={2}>{item.title}</Text>

          <View style={styles.sellerContainer}>
            {item.seller?.avatar && (
              <Image source={{ uri: item.seller.avatar }} style={styles.sellerAvatar} />
            )}
            {item.seller?.name && (
              <Text style={styles.sellerName} numberOfLines={1}>{item.seller.name}</Text>
            )}
          </View>

          <View style={styles.statsContainer}>


<Text>🪙 {(item.recent_bids ?? []).length} bids</Text>


            <MaterialCommunityIcons name="clock-outline" size={14} color="#666" />
            <Text style={styles.statsText}>{formatTime(item.end_time)}</Text>
          </View>

          <View style={styles.categoryTag}>
            <Text style={styles.categoryText}>{item.category}</Text>
          </View>
        </View>
      </TouchableOpacity>
    </Animated.View>
  );

  return (
    <>
      <ListHeader
        title="Discover Treasures"
        subtitle="Find unique pieces from verified sellers"
      />
      <FlatList
        ref={flatListRef}
        data={items}
        renderItem={renderItem}
        keyExtractor={(item) => item.id}
        numColumns={2}
        contentContainerStyle={styles.list}
        columnWrapperStyle={styles.columnWrapper}
        refreshControl={
          <RefreshControl
            refreshing={refreshing}
            onRefresh={onRefresh}
            tintColor="#007AFF"
          />
        }
        onEndReached={async () => {
          setLoading(true);
          await new Promise(res => setTimeout(res, 1500));
          setLoading(false);
        }}
        onEndReachedThreshold={0.5}
        ListFooterComponent={() => loading && (
          <ActivityIndicator size="large" style={styles.loader} />
        )}
      />
    </>
  );
}

const styles = StyleSheet.create({
  list: {
    padding: 16,
    paddingBottom: 100,
  },

  columnWrapper: {
    gap: COLUMN_GAP,
    justifyContent: 'space-between',
  },
  itemContainer: {
    width: ITEM_WIDTH,
    marginBottom: 16,
    borderRadius: 16,
    backgroundColor: '#fff',
    ...Platform.select({
      ios: {
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.1,
        shadowRadius: 8,
      },
      android: {
        elevation: 3,
      },
    }),
  },
  imageContainer: {
    position: 'relative',
    borderTopLeftRadius: 16,
    borderTopRightRadius: 16,
    overflow: 'hidden',
  },
  image: {
    width: '100%',
    height: ITEM_WIDTH * 1.2,
    borderTopLeftRadius: 16,
    borderTopRightRadius: 16,
  },
  priceTag: {
    position: 'absolute',
    bottom: 8,
    left: 8,
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 8,
    overflow: 'hidden',
  },
  priceText: {
    color: '#fff',
    fontWeight: '600',
    fontSize: 16,
  },
  infoContainer: {
    padding: 12,
  },
  title: {
    fontSize: 16,
    fontWeight: '600',
    marginBottom: 8,
  },
  sellerContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 8,
  },
  sellerAvatar: {
    width: 20,
    height: 20,
    borderRadius: 10,
    marginRight: 6,
  },
  sellerName: {
    fontSize: 12,
    color: '#666',
    flex: 1,
  },
  statsContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    flexWrap: 'wrap',
    marginTop: 4,
  },
  statsText: {
    fontSize: 12,
    color: '#666',
    marginRight: 8,
  },
  categoryTag: {
    position: 'absolute',
    top: -156,
    right: 8,
    backgroundColor: 'rgba(255, 255, 255, 0.9)',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 12,
    },
  categoryText: {
    fontSize: 12,
    fontWeight: '500',
    color: '#333',
  },
  loader: {
    marginVertical: 20,
    alignSelf: 'center',
  },
  emptyState: {
    paddingTop: 60,
    alignItems: 'center',
  },
  emptyText: {
    fontSize: 16,
    color: '#999',
    marginTop: 12,
  },
  sparkleTrail: {
    position: 'absolute',
    top: 0,
    left: 0,
    width: ITEM_WIDTH,
    height: ITEM_WIDTH * 1.2,
    zIndex: 10,
    pointerEvents: 'none',
  },
  goatYawnOverlay: {
    position: 'absolute',
    bottom: 0,
    right: 0,
    width: 60,
    height: 60,
    zIndex: 5,
    opacity: 0.8,
  },
});
