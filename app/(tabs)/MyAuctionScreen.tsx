import React, { useState, useEffect, useRef } from 'react';
import {
  StyleSheet,
  FlatList,
  ActivityIndicator,
  TouchableOpacity,
  Animated,
  Platform,
  Text,
  View,
} from 'react-native';
import { useRouter, Link } from 'expo-router';
import { SafeAreaView } from 'react-native-safe-area-context';
import * as Haptics from 'expo-haptics';
import { EnhancedHeader, HEADER_MAX_HEIGHT } from '@/components/EnhancedHeader';
import { useAuth } from '@/hooks/AuthContext';
import Toast from 'react-native-toast-message';



interface Auction {
  id: string;
  title: string;
  description: string;
  image: string;
  photo_url: string;
  startingPrice: number;
  currentPrice: number;
  hasBids: boolean;
  bidCount: number;
  endDate: string;
  endTimeDisplay?: string;
  status: 'active' | 'ended' | 'draft';
}


export default function MyAuctionsScreen() {
  const { token, username } = useAuth();
  const router = useRouter();
  const scrollY = useRef(new Animated.Value(0)).current;

  const [auctions, setAuctions] = useState<Auction[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);


  const fetchAuctions = async () => {
  try {
    const response = await fetch('http://10.0.0.170:5000/api/myauctionscreen', {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    });
    console.log("🐐 Auction object:", auctions);

    console.log('🐐 Token being sent:', token);

    console.log('🐐 Sending token:', token);


    if (response.status === 401) {
      console.warn('🐐 Unauthorized — redirecting to login');
      router.push('/login');
      Toast.show({
  type: 'error',
  text1: 'Your goat wandered off!',
  text2: 'Please log in again.',
});

      return;
    }

    if (!response.ok) {
      const errorData = await response.json();
      console.error('🐐 Backend error:', errorData.error || errorData.message);
     Toast.show({
  type: 'error',
  text1: 'Your goat wandered off!',
  text2: 'Please log in again.',
});

      return;
    }

    const data = await response.json();
    setAuctions(data.auctions || data);
  } catch (error) {
    console.error('🐐 Failed to fetch auctions:', error);
  } finally {
    setLoading(false);
    setRefreshing(false);
  }
};


  useEffect(() => {
    void fetchAuctions();
  }, []);

  const handleRefresh = () => {
    setRefreshing(true);
    void fetchAuctions();
  };

  const handleAuctionPress = async (auction: Auction) => {
    await Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    router.push(`/item/${auction.id}`);
  };

  const renderAuctionCard = ({ item }: { item: Auction }) => (
    <TouchableOpacity style={styles.card} onPress={() => handleAuctionPress(item)}>
      <View style={styles.cardHeader}>
        <Text style={styles.title}>{item.title}</Text>
        <Text style={[styles.status, styles[item.status]]}>
          {item.status.toUpperCase()}
        </Text>
      </View>
      <View style={styles.cardContent}>
        <View>
          <Text style={styles.label}>Current Price</Text>
          <Text style={styles.price}>
  ${ (item.currentPrice ?? 0).toFixed(2) }
</Text>


        </View>
        <View>
          <Text style={styles.label}>Bids</Text>
          <Text style={styles.bidCount}>{item.bidCount}</Text>
        </View>
        <View>
          <Text style={styles.label}>Ends</Text>
          <Text style={styles.time}>{new Date(item.endDate).toLocaleDateString()}</Text>
        </View>
      </View>
    </TouchableOpacity>
  );

  if (loading) {
    return (
      <SafeAreaView style={styles.container} edges={['bottom']}>
        <EnhancedHeader scrollY={scrollY} username={username} logoSource={0} />
        <View style={styles.centered}>
          <ActivityIndicator size="large" />
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.container} edges={['bottom']}>
      <EnhancedHeader scrollY={scrollY} username={username} logoSource={0} />
      <FlatList
        data={auctions}
        keyExtractor={(item) => item.id}
        renderItem={renderAuctionCard}
        contentContainerStyle={styles.list}
        onRefresh={handleRefresh}
        refreshing={refreshing}
        onScroll={Animated.event(
          [{ nativeEvent: { contentOffset: { y: scrollY } } }],
          { useNativeDriver: false }
        )}
        scrollEventThrottle={16}
        scrollIndicatorInsets={{ top: HEADER_MAX_HEIGHT }}
        ListEmptyComponent={
          <View style={styles.emptyContainer}>
            <Text style={styles.emptyTitle}>No Auctions Yet 🐐</Text>
            <Text style={styles.emptyText}>
              Your goat is waiting to list something fabulous.
            </Text>
          </View>
        }
      />
      <Link href="/CreateAuctionScreen" asChild>
        <TouchableOpacity style={styles.createButton}>
          <Text style={styles.createButtonText}>+ Create New Auction</Text>
        </TouchableOpacity>
      </Link>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { padding: 20 },
  header: { fontSize: 22, fontWeight: 'bold', marginBottom: 16 },
  thumbnailPreview: {
    width: '100%',
    height: 140,
    borderRadius: 8,
    marginBottom: 12,
  },
  input: {
    borderWidth: 1,
    borderColor: '#ccc',
    padding: 10,
    borderRadius: 6,
    marginBottom: 12,
    backgroundColor: 'white'
  },

  label: { marginBottom: 4, fontWeight: '500' },
  picker: {
    borderWidth: 1,
    borderColor: '#ccc',
    marginBottom: 12,
    borderRadius: 8,
  },


  centered: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    marginTop: HEADER_MAX_HEIGHT,
  },
  list: {
    padding: 16,
    paddingTop: HEADER_MAX_HEIGHT + 16,
  },
  card: {
    backgroundColor: '#fff',
    borderRadius: 12,
    padding: 16,
    marginBottom: 16,
    ...Platform.select({
      ios: {
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.1,
        shadowRadius: 4,
      },
      android: {
        elevation: 3,
      },
    }),
  },
  cardHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
  },
  cardContent: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  title: {
    fontSize: 18,
    fontWeight: '600',
    flex: 1,
  },
  status: {
    fontSize: 12,
    fontWeight: '600',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 4,
  },
  active: {
    backgroundColor: '#e6f7ed',
    color: '#1f7a3d',
  },
  ended: {
    backgroundColor: '#ffeaea',
    color: '#d63031',
  },
  draft: {
    backgroundColor: '#f5f5f5',
    color: '#666',
  },

  price: {
    fontSize: 20,
    fontWeight: '700',
    color: '#2d3436',
  },
  bidCount: {
    fontSize: 16,
    fontWeight: '600',
  },
  time: {
    fontSize: 14,
    color: '#2d3436',
  },
  createButton: {
    position: 'absolute',
    bottom: 24,
    left: 24,
    right: 24,
    backgroundColor: '#007AFF',
    padding: 16,
    borderRadius: 12,
    alignItems: 'center',
  },
  createButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '600',
  },
  emptyContainer: {
    alignItems: 'center',
    justifyContent: 'center',
    padding: 24,
  },
  emptyTitle: {
    fontSize: 20,
    fontWeight: '600',
    marginBottom: 8,
  },
  emptyText: {
    fontSize: 16,
    color: '#666',
    textAlign: 'center',
  },
});