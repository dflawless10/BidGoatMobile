import { useLocalSearchParams, useRouter} from 'expo-router';
import {useEffect, useRef, useState} from 'react';
import {
  View,
  Text,
  ActivityIndicator,
  StyleSheet,
  TextInput,
  Button,
  Alert,
  FlatList,
  ScrollView, TouchableOpacity, Dimensions
} from 'react-native';
import { Image } from 'expo-image';
import AsyncStorage from "@react-native-async-storage/async-storage";
import { format, parseISO, formatDistanceToNow } from 'date-fns';
import { GoatFlip } from '@/components/GoatAnimator/goatFlip';
import { playGoatSoundByName } from "@/assets/sounds/officialGoatSoundsSoundtrack";
import FavoriteCard from "@/components/ui/FavoriteCard";
import {AuctionItem} from "@/types/items";
import {triggerGoatAnimation} from "@/explore/Animated";
import {triggerGoat} from "@/utils/goatFeedback";
import { useAppSelector } from '@/hooks/reduxHooks';
import {JewelryItem} from "@/types";
import  { useCartBackend } from 'hooks/usecartBackend';
import {Ionicons} from "@expo/vector-icons";
import ShimmerPlaceholder from "react-native-shimmer-placeholder";
import {useSimilarItemsSearch} from "@/hooks/useSimilarItemsSearch";



function safeFormat(dateString: string | undefined, formatStr: string): string {
  if (!dateString) return 'Unknown';
  try {
    const iso = dateString.includes('T') ? dateString : dateString.replace(' ', 'T') + 'Z';
    const parsed = parseISO(iso);
    return format(parsed, formatStr);
  } catch {
    return 'Unknown';
  }
}


interface User {
  id: number;
  email: string;
  username: string;
  firstname: string;
  lastname: string;
  avatar_url?: string;
  address?: string; // 🐐 Add this line
  city?: string;
  state?: string;
  zip?: string;
  country?: string;
  jewelryBox?: JewelryItem[];
}


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
  must_sell_duration?: number;
  additional_photos?: string[];
  category?: string;
  tags?: string;
  photo_url?: string;
  listed_at: string;
  recent_bids?: Bid[];
  is_highest_bidder?: number;
  type?: string;
  item_media?: string[];
  rarity?: string;
  auction_ends_at?: string;
  weight_lbs?: number;
  seller?: {
    id?: number;
    email?: string;
    username: string;
    items_sold: number;
    joined: string;
    is_premium?: boolean;
  };
};

type SimilarItem = Pick<AuctionItem, 'id' | 'title' | 'description' | 'image' | 'price'> & {
  mascot: { emoji: string };
  isFavorite: boolean;
};

const getThumbSize = () => {
  const { width } = Dimensions.get('window');
  if (width < 360) return 56;       // small phones
  if (width < 400) return 64;       // most phones
  if (width < 520) return 72;       // large phones
  return 80;                        // tablets
};
const THUMB_SIZE = 72;

const API_URL = 'http://10.0.0.170:5000';
const fallbackImage = 'https://via.placeholder.com/300x200.png?text=No+Image+Available';

export default function ItemScreen() {
  const { itemId } = useLocalSearchParams();
  const [item, setItem] = useState<ItemDetail | null>(null);
  const [bidAmount, setBidAmount] = useState<string>('');
  const [showGoatBah, setShowGoatBah] = useState(false);
  const router = useRouter(); // ✅ Inside component
  const [activeIndex, setActiveIndex] = useState(0);
  const flatListRef = useRef<FlatList>(null);
  const [thumbSize, setThumbSize] = useState(getThumbSize());
  const [similarItems, setSimilarItems] = useState<AuctionItem[]>([]);
 const [loading, setLoading] = useState (false);


const { cartItems } = useCartBackend();
  useEffect(() => {
    if (itemId) fetchItem();
  }, [itemId]);


  const fetchItem = async () => {
    try {
      const res = await fetch(`${API_URL}/item/${itemId}`);
      const data = await res.json();
      setItem(data);

      // Fetch similar items by category
      if (data.category) {
        const similarRes = await fetch(`${API_URL}/items/discover`);
        const allItems = await similarRes.json();
        const filtered = allItems
          .filter((i: any) => i.category === data.category && i.id !== data.id)
          .slice(0, 5)
          .map((i: any) => ({
            id: i.id || i.item_id,
            item_id: i.item_id || i.id,
            Item: i.Item || i.id,
            name: i.name,
            title: i.name || i.title,
            description: i.description || '',
            price: i.price || 0,
            photo_url: i.photo_url,
            image_url: i.photo_url,
            image: i.photo_url,
            listed_at: i.listed_at || i.registration_time || new Date().toISOString(),
            registration_time: i.registration_time || i.listedAt || new Date().toISOString(),
            auction_ends_at: i.auction_ends_at || i.end_time || '',
            end_time: i.end_time || i.auction_ends_at,
            bidCount: i.bidCount || i.bid_count || 0,
            bid_count: i.bid_count || i.bidCount || 0,
            quantity_available: i.quantity_available || 1,
            isFavorite: false,
            mascot: { emoji: '🐐' },
            isWatched: false,
            timeLeft: '',
            watchers: '',
            category: i.category || '',
            tags: i.tags || '',
            preview: false,
            isWishlisted: '',
            auction_id: i.auction_id || 0,
            AuctionId: i.auction_id || 0,
            Auction_id: i.auction_id || 0,
            AuctionItem: { id: i.id || 0 },
            is_trending: i.is_trending || false,
            reserve_price: i.reserve_price || 0,
            final_price: i.final_price || 0,
            is_sold: i.is_sold || false,
            sold_to: i.sold_to || '',
            gem: '',
            carat: 0,
            color: '',
            size: '',
            condition: '',
            origin: '',
            certification: '',
            material: '',
          }));
        console.log('🐐 Similar items fetched:', filtered.length);
        setSimilarItems(filtered);
      }
    } catch (error) {
      console.error('Error fetching item:', error);
    }
  };

  useEffect(() => {
  const sub = Dimensions.addEventListener('change', () => {
    setThumbSize(getThumbSize());
  });
  return () => sub.remove();
}, []);

  const triggerGoatBah = () => {
    setShowGoatBah(true);
    setTimeout(() => setShowGoatBah(false), 3000);
  };

  const handleBidSubmit = async () => {
    const numericBid = Number.parseFloat(bidAmount);
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
  console.error('Bid placement error:', error);
  Alert.alert('Error', 'Could not place bid');
}

  };

  const user = useAppSelector(state => state.user.profile);


  const scrollToIndex = (index: number) => {
  if (flatListRef.current) {
    flatListRef.current.scrollToIndex({ index, animated: true });
    setActiveIndex(index);
  }
};

  const { addToCart, isInCart } = useCartBackend();

console.log('🧪 item snapshot:', item);


const handleBuyNow = async () => {
  if (!item?.buy_it_now) return;


  Alert.alert(
  'Confirm Purchase',
  `Buy this item now for $${item.buy_it_now}?`,
  [
    { text: 'Cancel', style: 'cancel' },
    {
      text: 'Confirm',
      onPress: () => router.push(`/checkout/${item.id}` as any),
    },
  ]
);
  // Navigate to the checkout screen with shipping and insurance options
  router.push(`/checkout/${item.id}` as any);
};

const handleAddToCart = () => Alert.alert('Added to Cart', 'Goat winked and carted it!');
  const handleFavorite = () => Alert.alert('Favorited', 'Goat bleated with joy!');


  if (!item) return <ActivityIndicator style={{ marginTop: 20 }} />;

  // Prepare data
  const formattedDate = safeFormat(item.listed_at, 'PPP');
  const mediaArray = Array.isArray(item?.additional_photos) ? item!.additional_photos! : [];
  const allImages = [item.photo_url, ...mediaArray].filter(Boolean);

  const handleViewSeller = () => {
    const sellerId = item?.seller?.id;
    if (typeof sellerId === 'number' && Number.isInteger(sellerId) && sellerId > 0) {
      router.push(`/seller/${sellerId}`);
    } else {
      Alert.alert('Invalid Seller', 'This item has no valid seller profile.');
    }
  };

  const displayPrice =
  typeof item.buy_it_now === 'number'
    ? item.buy_it_now
    : typeof item.highest_bid === 'number'
    ? item.highest_bid
    : item.price;


  return (
    <View style={{ flex: 1, backgroundColor: '#fff' }}>
        {/* Back Button */}
          <TouchableOpacity onPress={() => router.back()} style={styles.backButton}>
            <Text style={styles.backButtonText}>← Back</Text>
          </TouchableOpacity>
       <TouchableOpacity
    onPress={() => router.back()}
    style={{
      position: 'absolute',
      top: 48, // adjust for status bar / safe area
      left: 16,
      zIndex: 999,
      backgroundColor: 'white',
      paddingVertical: 6,
      paddingHorizontal: 12,
      borderRadius: 8,
      shadowColor: '#000',
      shadowOpacity: 0.1,
      shadowOffset: { width: 0, height: 2 },
      shadowRadius: 4,
      elevation: 3,
    }}
  >
    <Text style={{ fontSize: 16, color: '#4b3f72', fontWeight: '600' }}>← Back</Text>
  </TouchableOpacity>
       {/* Cart Button */}
  <View style={styles.floatingCart}>
    <TouchableOpacity onPress={() => router.push('/cart')}>
      <Ionicons name="cart" size={28} color="#6A0DAD" />
      <Text style={styles.cartBadge}>{cartItems.length}</Text>
    </TouchableOpacity>
  </View>
      <ScrollView contentContainerStyle={{ paddingBottom: 100 }}>
        {/* Image Gallery */}
        <View style={styles.imageGalleryContainer}>
          <TouchableOpacity
            onPress={() => router.push({
              pathname: '/FullImageScreen',
              params: { mediaArray: JSON.stringify(allImages), index: '0' }
            })}
          >
            <Image
              source={{ uri: item.photo_url || fallbackImage }}
              style={styles.mainImage}
              contentFit="cover"
              transition={200}
              cachePolicy="memory-disk"
              priority="high"
            />
          </TouchableOpacity>

          {/* Thumbnail Strip */}
          {allImages.length > 1 && (
            <FlatList
              horizontal
              showsHorizontalScrollIndicator={false}
              style={styles.thumbnailScroll}
              contentContainerStyle={{ paddingHorizontal: 12, gap: 8 }}
              data={allImages}
              keyExtractor={(item, idx) => `${item}-${idx}`}
              renderItem={({ item: uri, index: idx }) => (
                <TouchableOpacity
                  onPress={() => router.push({
                    pathname: '/FullImageScreen',
                    params: { mediaArray: JSON.stringify(allImages), index: String(idx) }
                  })}
                  style={[styles.thumbnail, idx === 0 && styles.thumbnailActive]}
                >
                  <Image
                    source={{ uri }}
                    style={styles.thumbnailImage}
                    contentFit="cover"
                    transition={100}
                    cachePolicy="memory-disk"
                  />
                </TouchableOpacity>
              )}
              initialNumToRender={3}
              maxToRenderPerBatch={2}
              windowSize={5}
            />
          )}



        </View>

        {/* Content Container */}
        <View style={styles.contentContainer}>
          {/* Title & Category */}
          <View style={styles.headerSection}>
            <Text style={styles.itemTitle}>{item.name || 'Unnamed'}</Text>
            {item.category && (
              <View style={styles.categoryBadge}>
                <Text style={styles.categoryText}>{item.category}</Text>
              </View>
            )}
          </View>

          {/* Price Cards */}
          <View style={styles.priceSection}>
            <View style={styles.priceCard}>
              <Text style={styles.priceLabel}>Starting Bid</Text>
              <Text style={styles.priceValue}>${item.price}</Text>
            </View>
            {item.buy_it_now && (
              <View style={[styles.priceCard, styles.buyNowCard]}>
                <Text style={styles.priceLabel}>Buy It Now</Text>
                <Text style={[styles.priceValue, styles.buyNowPrice]}>${item.buy_it_now}</Text>
              </View>
            )}
          </View>

          {/* Auction Info - Important Details */}
          <View style={styles.auctionInfoCard}>
            <View style={styles.infoRow}>
              <Text style={styles.infoLabel}>🕒 Listed</Text>
              <Text style={styles.infoValue}>{formattedDate}</Text>
            </View>
            <View style={styles.infoRow}>
              <Text style={styles.infoLabel}>⏳ Ends</Text>
              <Text style={[styles.infoValue, styles.endTimeText]}>
                {item.auction_ends_at ? format(new Date(item.auction_ends_at), 'PPPp') : 'No end time'}
              </Text>
            </View>
            <View style={styles.infoRow}>
              <Text style={styles.infoLabel}>🔒 Reserve</Text>
              <Text style={styles.infoValue}>
                ${item.reserve_price ?? 'Not set'}
              </Text>
            </View>
            <View style={styles.infoRow}>
              <Text style={styles.infoLabel}>💰 Highest Bid</Text>
              <Text style={[styles.infoValue, styles.highestBidText]}>
                ${item.highest_bid ?? item.price}
              </Text>
            </View>
          </View>

          {/* Description */}
          <View style={styles.descriptionCard}>
            <Text style={styles.sectionTitle}>Description</Text>
            <Text style={styles.descriptionText}>
              {item.description || 'No description available'}
            </Text>
          </View>

          {/* Recent Bids */}
          {item.recent_bids && item.recent_bids.length > 0 && (
            <View style={styles.section}>
              <Text style={styles.sectionTitle}>Recent Bids</Text>
              {item.recent_bids.map((bid, index) => (
                <Text key={`${bid.user_id}-${bid.timestamp}-${index}`} style={styles.bidRow}>
                  🏷️ ${bid.amount} by User #{bid.user_id} — {formatDistanceToNow(new Date(bid.timestamp), { addSuffix: true })}
                </Text>
              ))}
            </View>
          )}

          {item.is_highest_bidder && (
            <Text style={styles.badge}>🥇 You're winning!</Text>
          )}

          {/* Bid Input */}
          <TextInput
            placeholder="Enter your bid"
            keyboardType="numeric"
            style={styles.input}
            value={bidAmount}
            onChangeText={setBidAmount}
          />

          {/* Action Buttons */}
          <View style={styles.buttonGroup}>
            <View style={styles.actionButton}>
              <Button title="Place Bid" onPress={handleBidSubmit} color="#4b3f72" />
            </View>
            {item.buy_it_now && !item.is_highest_bidder && (
              <View style={styles.actionButton}>
                <Button title="Buy It Now" onPress={handleBuyNow} color="#d69e2e" />
              </View>
            )}
            <View style={styles.actionButton}>
              <Button title="Add to Cart" onPress={handleAddToCart} color="#2c7a7b" />
            </View>
            <View style={styles.actionButton}>
              <Button title="Favorite" onPress={handleFavorite} color="#e53e3e" />
            </View>
          </View>

        </View>
        {/* End contentContainer */}

      {showGoatBah && (
        <View style={{ alignItems: 'center', marginVertical: 16 }}>
          <GoatFlip trigger={showGoatBah} mood="Celebrate" />
          <Text style={{ fontSize: 18, marginTop: 8 }}>🐐 GOAT CONFIRMED!</Text>
        </View>
      )}

      <View style={styles.feeBreakdown}>
        <Text style={styles.feeTitle}>💰 Cost Breakdown</Text>
        <View style={styles.feeRow}>
          <Text style={styles.feeLabel}>
            {item.buy_it_now ? 'Buy It Now Price' : 'Current Bid'}
          </Text>
          <Text style={styles.feeValue}>
  {displayPrice === null ? 'Price not available' : `$${displayPrice.toFixed(2)}`}
</Text>
        </View>
        <View style={styles.feeRow}>
          <Text style={styles.feeLabel}>+ Shipping (buyer pays)</Text>
          <Text style={styles.feeNote}>Calculated at checkout</Text>
        </View>
        <View style={styles.feeRow}>
          <Text style={styles.feeLabel}>+ Insurance (optional)</Text>
          <Text style={styles.feeNote}>Calculated at checkout</Text>
        </View>
        <View style={styles.feeDivider} />
        <View style={styles.feeRow}>
          <Text style={styles.feeTotalLabel}>You Pay</Text>
          <Text style={styles.feeTotalValue}>
  {displayPrice === null ? 'Price not available' : `$${displayPrice.toFixed(2)}+`}
</Text>
        </View>
        <Text style={styles.feeDisclaimer}>
          💡 Sellers earn {item.seller?.is_premium ? '92%' : '89%'} after BidGoat fees
        </Text>
      </View>

      <View style={styles.section}>
        <Text style={styles.sectionTitle}>🚚 Shipping & Delivery</Text>
        <Text>📦 Shipping calculated at checkout based on weight ({item.weight_lbs || 1} lbs)</Text>
        <Text>🔒 Buyer Protection included</Text>
        <Text>💳 Payments: Credit Card, PayPal, Apple Pay</Text>
      </View>

      <View style={styles.section}>
  <Text style={styles.sectionTitle}>👤 Seller Info</Text>
  {item.seller?.username ? <Text>Username: {item.seller.username}</Text> : null}
  {typeof item.seller?.items_sold === 'number' ? <Text>Items Sold: {item.seller.items_sold}</Text> : null}
  {item.seller?.joined ? <Text>Joined: {item.seller.joined}</Text> : null}
  <TouchableOpacity
    onPress={handleViewSeller}
  >
    <Text style={{ color: '#6A0DAD', fontWeight: '600' }}>View Seller Profile</Text>
  </TouchableOpacity>
</View>

      <View style={styles.section}>
  <Text style={styles.sectionTitle}>🧲 Similar Items</Text>
  {loading ? (
    <ShimmerPlaceholder />
  ) : (
    <FlatList
      data={similarItems}
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
  )}
</View>

        </ScrollView>


      </View>


  )

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
     marginVertical: 8,
    marginBottom: 4,
    color: '#2d3748',
  },
 floatingCart: {
  position: 'absolute',
  top: 48, // adjust for SafeArea / StatusBar
  right: 16,
  zIndex: 999,
  backgroundColor: '#fff',
  padding: 8,
  borderRadius: 24,
  shadowColor: '#000',
  shadowOpacity: 0.1,
  shadowOffset: { width: 0, height: 2 },
  shadowRadius: 4,
  elevation: 4,
  flexDirection: 'row',
  alignItems: 'center',
},
cartBadge: {
  marginLeft: 6,
  fontSize: 14,
  fontWeight: 'bold',
  color: '#6A0DAD',
},

  arrowCircle: {
  width: 40,
  height: 40,
  borderRadius: 20,
  backgroundColor: '#fff',
  justifyContent: 'center',
  alignItems: 'center',
  shadowColor: '#000',
  shadowOffset: { width: 0, height: 2 },
  shadowOpacity: 0.2,
  shadowRadius: 4,
  elevation: 5,
  marginHorizontal: 8,
},

carouselImage: {
  width: 200,
  height: 200,
  borderRadius: 8,
  marginHorizontal: 8,
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
  mustSellTease: {
  fontSize: 14,
  color: '#D97706', // warm amber
  fontWeight: '600',
  marginTop: 8,
  marginBottom: 12,
},
  highestBid: {
    fontSize: 24,
    fontWeight: 'bold',
    marginVertical: 8,
    color: '#2f855a', // confident green
  },
  bidRow: {
    fontSize: 14,
    color: '#4a5568', // muted gray
    marginBottom: 4,
    marginVertical: 2,
  },
  badge: {
    backgroundColor: '#ecc94b', // gold-ish
    padding: 6,
    borderRadius: 4,
    textAlign: 'center',
    marginVertical: 8,
    fontWeight: 'bold',
    fontSize: 16,
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
    color: '#fffg',
  },
  feeBreakdown: {
    marginTop: 16,
    marginBottom: 16,
    padding: 16,
    backgroundColor: '#FFF5E6',
    borderRadius: 12,
    borderWidth: 2,
    borderColor: '#FFD580',
  },
  feeTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: '#1A202C',
    marginBottom: 12,
  },
  feeRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 6,
  },
  feeLabel: {
    fontSize: 15,
    color: '#4A5568',
  },
  feeValue: {
    fontSize: 16,
    fontWeight: '600',
    color: '#2D3748',
  },
  feeNote: {
    fontSize: 13,
    color: '#A0AEC0',
    fontStyle: 'italic',
  },
  feeDivider: {
    height: 1,
    backgroundColor: '#FFD580',
    marginVertical: 8,
  },
  feeTotalLabel: {
    fontSize: 18,
    fontWeight: '700',
    color: '#1A202C',
  },
  feeTotalValue: {
    fontSize: 20,
    fontWeight: '700',
    color: '#FF6B35',
  },
  feeDisclaimer: {
    fontSize: 12,
    color: '#718096',
    marginTop: 8,
    fontStyle: 'italic',
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
  flexDirection: 'row',
  alignItems: 'center',
    flexWrap: 'wrap',
  justifyContent: 'space-between',
  marginVertical: 12,
},
  arrowButton: {
    padding: 8,
    backgroundColor: '#edf2f7',
    borderRadius: 8,
    marginHorizontal: 6,
  },
  arrowText: {
    fontSize: 18,
    color: '#2d3748',
    fontWeight: '700',
  },
  thumbWrap: {
    width: THUMB_SIZE,
    height: THUMB_SIZE,
    borderRadius: 8,
    overflow: 'hidden',
    marginRight: 8,
    borderWidth: 1,
    borderColor: '#e2e8f0',
  },
  thumb: {
    width: '100%',
    height: '100%',
  },
  thumbnailWrapper: {
  marginRight: 8,
  borderRadius: 8,
  overflow: 'hidden',
  borderWidth: 1,
  borderColor: '#e2e8f0',
},
   thumbActive: {
    borderColor: '#6A0DAD',
    borderWidth: 2,
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
  flexBasis: '48%',
  marginBottom: 8,
},
bidButton: {
  backgroundColor: '#4b3f72',
},
buyButton: {
  backgroundColor: '#d69e2e',
},
cartButton: {
  backgroundColor: '#2c7a7b',
},
favoriteButton: {
  backgroundColor: '#e53e3e',
},
// New modern styles
imageGalleryContainer: {
  position: 'relative',
  backgroundColor: '#fff',
},
mainImage: {
  width: '100%',
  height: 400,
  resizeMode: 'cover',
},
thumbnailScroll: {
  backgroundColor: '#fff',
  paddingVertical: 12,
},
thumbnail: {
  width: 60,
  height: 60,
  borderRadius: 8,
  overflow: 'hidden',
  borderWidth: 2,
  borderColor: 'transparent',
},
thumbnailActive: {
  borderColor: '#6A0DAD',
},
thumbnailImage: {
  width: '100%',
  height: '100%',
},
backButton: {
  position: 'absolute',
  top: 16,
  left: 16,
  backgroundColor: 'rgba(255,255,255,0.9)',
  paddingHorizontal: 16,
  paddingVertical: 8,
  borderRadius: 20,
},
backButtonText: {
  fontSize: 14,
  fontWeight: '600',
  color: '#2d3748',
},
contentContainer: {
  padding: 16,
  backgroundColor: '#f8f9fa',
},
headerSection: {
  marginBottom: 16,
},
itemTitle: {
  fontSize: 24,
  fontWeight: '700',
  color: '#1a202c',
  marginBottom: 8,
},
categoryBadge: {
  alignSelf: 'flex-start',
  backgroundColor: '#e2e8f0',
  paddingHorizontal: 12,
  paddingVertical: 6,
  borderRadius: 16,
},
categoryText: {
  fontSize: 12,
  fontWeight: '600',
  color: '#4a5568',
},
priceSection: {
  flexDirection: 'row',
  gap: 12,
  marginBottom: 16,
},
priceCard: {
  flex: 1,
  backgroundColor: '#fff',
  padding: 16,
  borderRadius: 12,
  borderWidth: 2,
  borderColor: '#4299e1',
},
buyNowCard: {
  borderColor: '#d69e2e',
},
priceLabel: {
  fontSize: 12,
  color: '#718096',
  marginBottom: 4,
  textTransform: 'uppercase',
  fontWeight: '600',
},
priceValue: {
  fontSize: 24,
  fontWeight: '700',
  color: '#4299e1',
},
buyNowPrice: {
  color: '#d69e2e',
},
auctionInfoCard: {
  backgroundColor: '#fff',
  padding: 16,
  borderRadius: 12,
  marginBottom: 16,
},
infoRow: {
  flexDirection: 'row',
  justifyContent: 'space-between',
  alignItems: 'center',
  paddingVertical: 8,
  borderBottomWidth: 1,
  borderBottomColor: '#e2e8f0',
},
infoLabel: {
  fontSize: 14,
  color: '#4a5568',
  fontWeight: '500',
},
infoValue: {
  fontSize: 14,
  color: '#2d3748',
  fontWeight: '600',
},
endTimeText: {
  color: '#c53030',
},
highestBidText: {
  color: '#2f855a',
  fontSize: 16,
},
descriptionCard: {
  backgroundColor: '#fff',
  padding: 16,
  borderRadius: 12,
  marginBottom: 16,
},
descriptionText: {
  fontSize: 15,
  color: '#4a5568',
  lineHeight: 22,
},

});
