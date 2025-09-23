import {router, useLocalSearchParams} from 'expo-router';
import { useEffect, useState } from 'react';
import {
  View,
  Text,
  ActivityIndicator,
  StyleSheet,
  TextInput,
  Button,
  Alert,
  FlatList,
  TouchableOpacity,
  ScrollView
} from 'react-native';
import { Image } from 'expo-image';
import AsyncStorage from "@react-native-async-storage/async-storage";
import { format, formatDistanceToNow } from 'date-fns';
import React from 'react';
import { GoatFlip } from '@/components/GoatAnimator/goatFlip';
import { playGoatSoundByName } from "@/assets/sounds/officialGoatSoundsSoundtrack";
import FavoriteCard from "@/components/ui/FavoriteCard";
import {AuctionItem} from "@/types/items";

type Bid = {
  id: string;
  amount: number;
  user_id: number;
  timestamp: string;
};

type ItemDetail = {
  id: number;
  name: string;
  description?: string;
  price: number;
  highest_bid?: number;
  reserve_price?: number;
  buy_it_now?: number;
  additional_photos?: string[];
  category?: string;
  tags?: string;
  photo_url?: string;
  listedAt?: string;
  recent_bids?: Bid[];
  is_highest_bidder?: number;
  type?: string;
  item_media?: string[];
  rarity?: string;
  auction_ends_at?: string;
  seller?: {
    username: string;
    items_sold: number;
    joined: string;
  };
};

const API_URL = 'http://10.0.0.170:5000';
const fallbackImage = 'https://via.placeholder.com/300x200.png?text=No+Image+Available';

export default function ItemScreen() {
  const { itemId } = useLocalSearchParams();
  const [item, setItem] = useState<ItemDetail | null>(null);
  const [bidAmount, setBidAmount] = useState<string>('');
  const [showGoatBah, setShowGoatBah] = useState(false);

  useEffect(() => {
    if (itemId) fetchItem();
  }, [itemId]);

  const fetchItem = async () => {
    try {
      const res = await fetch(`${API_URL}/item/${itemId}?user_id=129`);
      const data = await res.json();
      setItem(data);
    } catch (error) {
      console.error('Error fetching item:', error);
    }
  };



  const triggerGoatBah = () => {
    setShowGoatBah(true);
    setTimeout(() => setShowGoatBah(false), 3000);
  };

  const handleBidSubmit = async () => {
    const numericBid = parseFloat(bidAmount);
    if (!item || isNaN(numericBid) || numericBid <= item.price) {
      Alert.alert('Invalid bid', 'Enter a valid amount above the current price');
      return;
    }

    try {
      const token = await AsyncStorage.getItem('jwtToken');
      const res = await fetch(`${API_URL}/item/${item.id}/bid`, {
        method: 'POST',
        headers: {
          Authorization: `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ amount: numericBid }),
      });

      if (res.ok) {
        triggerGoatBah();
        await playGoatSoundByName('Victory Baa');
        setBidAmount('');
        await fetchItem();
      } else {
        const message = await res.text();
        Alert.alert('Error', message);
      }
    } catch (error) {
      Alert.alert('Error', 'Could not place bid');
    }
  };

  const handleBuyNow = () => Alert.alert('Buy It Now', 'Goat is preparing your sparkle trail...');
  const handleAddToCart = () => Alert.alert('Added to Cart', 'Goat winked and carted it!');
  const handleFavorite = () => Alert.alert('Favorited', 'Goat bleated with joy!');
  const handleViewSeller = () => Alert.alert('Seller Info', 'Viewing seller profile...');

  if (!item) return <ActivityIndicator style={{ marginTop: 20 }} />;

  const formattedDate = item.listedAt ? format(new Date(item.listedAt), 'PPP') : 'Unknown';
  const mediaArray = item.additional_photos || [];

 const similarItems: AuctionItem[] = [
   {
     id: 101,
     title: 'Sexy Lady Challenge Coin',
     description: 'Playful heads/tails novelty gift',
     image: 'https://via.placeholder.com/150x150.png?text=Sexy+Coin',
     isFavorite: true,
     mascot: {emoji: '💃'},
     price: 11.99,
     timeLeft: undefined,
     item_id: 0,
     auction_id: 0,
     current_bid: 0,
     end_time: "",
     auction_ends_at: "",
     bidCount: 0,
     image_url: ""
   },
   {
     id: 102,
     title: 'NASA Challenge Coin',
     description: 'Official collectible with space vibes',
     image: 'https://via.placeholder.com/150x150.png?text=NASA+Coin',
     isFavorite: false,
     mascot: {emoji: '🚀'},
     price: 14.99,
     timeLeft: undefined,
     item_id: 0,
     auction_id: 0,
     current_bid: 0,
     end_time: "",
     auction_ends_at: "",
     bidCount: 0,
     image_url: ""
   },
];


  return (
    <ScrollView contentContainerStyle={styles.container}>
      <Image source={{ uri: item.photo_url || fallbackImage }} style={styles.image} />
      <Text style={styles.title}>{item.name || 'Unnamed'}</Text>
      <Text>{item.description || 'No description available'}</Text>
      <Text>💰 Starting Price: ${item.price}</Text>
      {item.buy_it_now && <Text>💸 Buy It Now: ${item.buy_it_now}</Text>}
      <Text>📂 Category: {item.category || 'Uncategorized'}</Text>
      <Text>🏷️ Tags: {item.tags || 'No tags'}</Text>
      <Text>🧬 Rarity: {item.rarity || 'common'}</Text>
      <Text>🕒 Listed: {formattedDate}</Text>
      <Text>⏳ Ends: {item.auction_ends_at ? format(new Date(item.auction_ends_at), 'PPPp') : 'No end time set'}</Text>
      <Text>🔒 Reserve Price: ${item.reserve_price ?? 'Not Met'}</Text>
      <Text style={styles.highestBid}>Highest Bid: ${item.highest_bid ?? 'None yet'}</Text>

      {mediaArray.length > 0 && (
        <FlatList
          data={mediaArray}
          horizontal
          keyExtractor={(uri, idx) => `${uri}-${idx}`}
          renderItem={({ item }) => (
            <Image source={{ uri: item }} style={styles.additionalImage} />
          )}
          contentContainerStyle={{ marginVertical: 12 }}
          showsHorizontalScrollIndicator={false}
        />
      )}

      {showGoatBah && (
        <View style={{ alignItems: 'center', marginVertical: 16 }}>
          <GoatFlip trigger={showGoatBah} mood="Celebrate" />
          <Text style={{ fontSize: 18, marginTop: 8 }}>🐐 GOAT CONFIRMED!</Text>
        </View>
      )}

      {item.recent_bids?.map((bid) => (
        <Text key={bid.id || bid.timestamp} style={styles.bidRow}>
          🏷️ ${bid.amount} by User #{bid.user_id} — {formatDistanceToNow(new Date(bid.timestamp), { addSuffix: true })}
        </Text>
      ))}

      {item.is_highest_bidder && (
        <Text style={styles.badge}>🥇 You’re winning!</Text>
      )}

      <TextInput
        placeholder="Enter your bid"
        keyboardType="numeric"
        style={styles.input}
        value={bidAmount}
        onChangeText={setBidAmount}
      />
      <View style={styles.buttonGroup}>
  <View style={styles.actionButton}>
    <Button title="Place Bid" onPress={handleBidSubmit} color="#4b3f72" />
  </View>
  <View style={styles.actionButton}>
    <Button title="Buy It Now" onPress={handleBuyNow} color="#d69e2e" />
  </View>
  <View style={styles.actionButton}>
    <Button title="Add to Cart" onPress={handleAddToCart} color="#2c7a7b" />
  </View>
  <View style={styles.actionButton}>
    <Button title="Favorite" onPress={handleFavorite} color="#e53e3e" />
  </View>
</View>


      <View style={styles.section}>
        <Text style={styles.sectionTitle}>🚚 Shipping & Delivery</Text>
        <Text>Method: USPS Ground Advantage</Text>
        <Text>Estimated: Sep 18–24</Text>
        <Text>Returns: Seller does not accept returns</Text>
        <Text>Payments:  Mastercard, PayPal</Text>
      </View>

      <View style={styles.section}>
        <Text style={styles.sectionTitle}>👤 Seller Info</Text>
        <Text>Username: {item.seller?.username || 'Unknown'}</Text>
        <Text>Items Sold: {item.seller?.items_sold ?? 0}</Text>
        <Text>Joined: {item.seller?.joined || 'Unknown'}</Text>
        <Button title="View Seller Profile" onPress={handleViewSeller} />
      </View>

      <View style={styles.section}>
  <Text style={styles.sectionTitle}>🧲 Similar Items</Text>
  <FlatList
    data={similarItems} // array of AuctionItem
    horizontal
    keyExtractor={(item) => item.id.toString()}
    renderItem={({ item }) => (
      <FavoriteCard
        item={item}
        handleBid={() => router.push(`/item/${item.id}`)}
        handleUnfavorite={() => console.log('Unfavorite logic here')}
      />
    )}
    showsHorizontalScrollIndicator={false}
  />
</View>

    </ScrollView>
  );
}



const styles = StyleSheet.create({
  container: {
    padding: 16,
    backgroundColor: '#fffef8',
  },
  image: {
    height: 180,
    borderRadius: 10,
    marginBottom: 12,
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    marginBottom: 4,
    color: '#2d3748',
  },
  input: {
    borderWidth: 1,
    borderColor: '#ccc',
    padding: 8,
    marginVertical: 12,
    borderRadius: 6,
    fontSize: 16,
  },
  additionalImage: {
    width: 120,
    height: 120,
    borderRadius: 8,
    marginRight: 10,
  },
  highestBid: {
    fontSize: 20,
    fontWeight: '600',
    marginVertical: 6,
    color: '#2f855a', // confident green
  },
  bidRow: {
    fontSize: 14,
    color: '#4a5568', // muted gray
    marginBottom: 4,
  },
  badge: {
    backgroundColor: '#ecc94b', // gold-ish
    padding: 6,
    borderRadius: 4,
    textAlign: 'center',
    marginVertical: 6,
    fontWeight: 'bold',
    color: '#1a202c',
  },
  section: {
    marginTop: 20,
    padding: 12,
    backgroundColor: '#f7fafc',
    borderRadius: 8,
    borderColor: '#e2e8f0',
    borderWidth: 1,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '600',
    marginBottom: 8,
    color: '#2c5282',
  },
  similarImage: {
    width: 100,
    height: 100,
    borderRadius: 8,
    marginRight: 10,
  },
  buttonGroup: {
  marginTop: 24,
  marginBottom: 32,
  flexDirection: 'column',
  alignItems: 'center',
},

actionButton: {
  width: '90%',
  paddingVertical: 14,
  paddingHorizontal: 24,
  marginVertical: 8,
  borderRadius: 32,
  shadowColor: '#000',
  shadowOffset: { width: 0, height: 2 },
  shadowOpacity: 0.1,
  shadowRadius: 4,
  elevation: 3,
},

bidButton: {
  backgroundColor: '#4b3f72', // regal purple
},

buyButton: {
  backgroundColor: '#d69e2e', // golden goat
},

cartButton: {
  backgroundColor: '#2c7a7b', // teal helper
},

favoriteButton: {
  backgroundColor: '#e53e3e', // affectionate red
},


});
