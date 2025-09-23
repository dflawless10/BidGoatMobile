import React, {Fragment, useState} from 'react';
import {
  StyleSheet,
  View,
  TextInput,
  Animated,
  TouchableOpacity,
  Text,
  Pressable,
  Platform,
  Modal,
  Alert,
  FlatList,
  ScrollView,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';

interface HeaderProps {
  scrollY: Animated.Value;
  username?: string | null;
  onSearch?: (text: string) => void;
}

type Birthstone = {
  month: string;
  stone: string;
  color: string;
  meaning: string;
};

type CategoryItem = {
  label: string;
  key: string;
};

type CategoryGroup = {
  label: string;
  items: CategoryItem[];
};

const categories: CategoryGroup[] = [
  {
    label: 'Getting Started',
    items: [
      { label: 'Welcome', key: 'welcome' },
      { label: 'Help', key: 'help' },
      { label: 'Contact', key: 'contact' },
    ],
  },
  {
    label: 'Marketplace',
    items: [
      { label: 'Shop', key: 'shop' },
      { label: 'Sell', key: 'sell' },

    ],
  },
  {
    label: 'Goat Certified',
    items: [
      { label: "Watch Appraisal", key: 'watch-appraisal' },
      { label: "Diamond Appraisal", key: 'diamond-appraisal' },
      { label: 'Trending', key: 'trending' },
    ],
  },
  {
    label: 'Community',
    items: [
      { label: 'Reviews', key: 'reviews' },
      { label: 'Rewards', key: 'rewards' },
    ],
  },
];



const HEADER_MAX_HEIGHT = 120;
const HEADER_MIN_HEIGHT = 60;
const HEADER_SCROLL_DISTANCE = HEADER_MAX_HEIGHT - HEADER_MIN_HEIGHT;

const birthstones: Birthstone[] = [
  { month: 'January', stone: 'Garnet', color: '#8B0000', meaning: 'Deep red warmth, like a goat’s heartbeat in winter' },
  { month: 'February', stone: 'Amethyst', color: '#800080', meaning: 'Mystical purple, perfect for twilight bidding' },
  { month: 'March', stone: 'Aquamarine', color: '#7FFFD4', meaning: 'Ocean breeze meets barnyard calm' },
  { month: 'April', stone: 'Quartz', color: '#E0E0E0', meaning: 'Clean and crisp, like a fresh modal invocation' },
  { month: 'May', stone: 'Emerald', color: '#50C878', meaning: 'Lush green, like springtime goat whispers' },
  { month: 'June', stone: 'Pearl', color: '#dcdcdc', meaning: 'Soft shimmer, now visible against white tiles' },
  { month: 'July', stone: 'Ruby', color: '#E0115F', meaning: 'Bold and celebratory, like a winning bid' },
  { month: 'August', stone: 'Peridot', color: '#B4EEB4', meaning: 'Playful green with a hint of summer mischief' },
  { month: 'September', stone: 'Sapphire', color: '#0F52BA', meaning: 'Royal blue for confident contributors' },
  { month: 'October', stone: 'Opal', color: '#FFB6C1', meaning: 'Pastel magic with unpredictable sparkle trails' },
  { month: 'November', stone: 'Topaz', color: '#FFC87C', meaning: 'Golden warmth for cozy barnyard rituals' },
  { month: 'December', stone: 'Turquoise', color: '#40E0D0', meaning: 'Frosty teal for wintertime lore' },
];

const EnhancedHeader: React.FC<HeaderProps> = ({
  scrollY,
  username = null,
  onSearch,
}) => {
  const insets = useSafeAreaInsets();
  const router = useRouter();
  const [showMenu, setShowMenu] = useState(false);
  const [showGiftModal, setShowGiftModal] = useState(false);
  const [showBirthstoneModal, setShowBirthstoneModal] = useState(false);

  const scaleY = scrollY.interpolate({
    inputRange: [0, HEADER_SCROLL_DISTANCE],
    outputRange: [1, 0.5],
    extrapolate: 'clamp',
  });

  const opacity = scrollY.interpolate({
    inputRange: [0, HEADER_SCROLL_DISTANCE],
    outputRange: [1, 0.8],
    extrapolate: 'clamp',
  });

  const handleGiftNavigation = (occasion: string) => {
    if (occasion === 'birthday') {
      setShowGiftModal(false);
      setShowBirthstoneModal(true);
    } else {
      router.push(`/gift-finder/${occasion}`);
      setShowGiftModal(false);
    }
  };

  const handleBirthstonePress = (month: string, stone: string, meaning: string) => {
    Alert.alert(`💎 ${stone} Radiance`, `The Goat Oracle says: ${meaning} shines brightest in ${month}!`);
  };

  return (
  <Animated.View
    style={[
      styles.container,
      {
        transform: [{ scaleY }],
        paddingTop: Platform.OS === 'web' ? 30 : insets.top,
        opacity,
      },
    ]}
  >
    <View style={styles.topRow}>
      <View style={styles.left}>
        <TouchableOpacity onPress={() => setShowMenu(true)}>
          <Ionicons name="menu" size={24} color="#444" />
        </TouchableOpacity>

        <TouchableOpacity onPress={() => router.push('/sign-in')}>
          <Text style={styles.link}>Sign In</Text>
        </TouchableOpacity>

        <TouchableOpacity
  onPress={() => router.push('/register')}
  accessibilityLabel="Join the Herd"
  accessibilityRole="button"
>
  <Text style={styles.link}>
    🐐✨ Join the Herd
  </Text>
</TouchableOpacity>



        <TouchableOpacity onPress={() => router.push('/cart')}>
          <Ionicons name="cart" size={24} color="#444" />
        </TouchableOpacity>

        <TouchableOpacity onPress={() => setShowGiftModal(true)}>
          <Ionicons name="gift" size={24} color="#d14" />
        </TouchableOpacity>
      </View>
    </View>

    {username && (
      <Text style={styles.username}>Welcome, {username} 🐐</Text>
    )}

    <View style={styles.searchContainer}>
      <View style={styles.searchWrapper}>
        <Ionicons
          name="search"
          size={20}
          color="#666"
          style={styles.searchIcon}
        />
        <TextInput
          style={styles.searchInput}
          placeholder="Search BidGoat"
          placeholderTextColor="#999"
          onChangeText={onSearch}
        />
      </View>
    </View>

    {/* Main Menu Modal */}
    <Modal visible={showMenu} transparent animationType="slide" onRequestClose={() => setShowMenu(false)}>
  <Pressable style={styles.modalOverlay} onPress={() => setShowMenu(false)}>
    <View style={styles.modalContent} pointerEvents="box-none">
      <ScrollView contentContainerStyle={styles.modalScroll}>
        {/* Search Bar */}
        <View style={styles.searchWrapper}>
          <Ionicons name="search" size={20} color="#666" style={styles.searchIcon} />
          <TextInput
            style={styles.searchInput}
            placeholder="Search the Barnyard"
            placeholderTextColor="#999"
            onChangeText={onSearch}
          />
        </View>

            {/* Dynamically Render Category Groups */}
           {categories.map((group) => (
          <Fragment key={group.label}>
            <Text style={styles.modalHeader}>🐐 {group.label}</Text>
            {group.items.map((item) => (
              <TouchableOpacity
                key={item.key}
                style={styles.modalItem}
                onPress={() => {
                  router.push(`/explore/${item.key}`);
                  setShowMenu(false);
                }}
              >
                <Text style={styles.modalText}>{item.label}</Text>
              </TouchableOpacity>
            ))}
          </Fragment>
        ))}

        {/* Static Links */}
        <Text style={styles.modalHeader}>💍 My Barnyard</Text>
        <TouchableOpacity style={styles.modalItem} onPress={() => router.push('/jewelry-box')}>
          <Text style={styles.modalText}>My Jewelry Box</Text>
        </TouchableOpacity>
        <TouchableOpacity style={styles.modalItem} onPress={() => router.push('/about')}>
          <Text style={styles.modalText}>About</Text>
        </TouchableOpacity>
        <TouchableOpacity style={styles.modalItem} onPress={() => router.push('/help')}>
          <Text style={styles.modalText}>Help</Text>
        </TouchableOpacity>
        <TouchableOpacity style={styles.modalItem} onPress={() => setShowMenu(false)}>
          <Text style={styles.modalText}>🚪 Exit the Barnyard</Text>
        </TouchableOpacity>

        <TouchableOpacity onPress={() => setShowMenu(false)}>
          <Text style={styles.closeText}>Close</Text>
        </TouchableOpacity>
      </ScrollView>
    </View>
  </Pressable>
</Modal>

    {/* Gift Discovery Modal */}
    <Modal visible={showGiftModal} transparent animationType="fade" onRequestClose={() => setShowGiftModal(false)}>
  <Pressable style={styles.modalOverlay} onPress={() => setShowGiftModal(false)}>
    <View style={styles.modalContent} pointerEvents="box-none">
      <Text style={styles.modalHeader}>🎁 Discover Gift Ideas</Text>
      {['birthday', 'anniversary', 'halloween', 'wedding', 'thank-you', 'just-because'].map((occasion) => (
        <TouchableOpacity
          key={occasion}
          style={styles.modalItem}
          onPress={() => handleGiftNavigation(occasion)}
        >
          <Text style={styles.modalText}>🎀 {occasion.replace('-', ' ')} Gifts</Text>
        </TouchableOpacity>
      ))}
      <TouchableOpacity onPress={() => setShowGiftModal(false)}>
        <Text style={styles.closeText}>Close</Text>
      </TouchableOpacity>
    </View>
  </Pressable>
</Modal>


    {/* Birthstone Modal */}
    <Modal visible={showBirthstoneModal} transparent animationType="fade">
      <View style={styles.modalOverlay}>
        <View style={[styles.modalContent, { paddingBottom: 8 }]}>
          <Text style={styles.modalHeader}>💎 Birthday Sparkle Ritual</Text>
          <FlatList
            data={birthstones}
            numColumns={3}
            keyExtractor={(item: Birthstone) => item.month}
            contentContainerStyle={{ paddingBottom: 12 }}
            renderItem={({ item }: { item: Birthstone }) => {
              const textColor = item.color === '#dcdcdc' ? '#333' : '#fff';
              return (
                <TouchableOpacity
                  style={[styles.tile, { backgroundColor: item.color }]}
                  onPress={() =>
                    handleBirthstonePress(item.month, item.stone, item.meaning)
                  }
                >
                  <Text style={[styles.month, { color: textColor }]}>{item.month}</Text>
                  <Text style={[styles.stone, { color: textColor }]}>{item.stone}</Text>
                </TouchableOpacity>
              );
            }}
          />
          <TouchableOpacity onPress={() => setShowBirthstoneModal(false)}>
            <Text style={styles.closeText}>Close</Text>
          </TouchableOpacity>
        </View>
      </View>
    </Modal>
  </Animated.View>
);

};

const styles = StyleSheet.create({
  container: {
    position: Platform.OS === 'web' ? 'sticky' : 'absolute',
    top: 0,
    left: 0,
    right: 0,
    backgroundColor: '#fff',
    zIndex: 999,
    elevation: 3,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2,
    shadowRadius: 2,
    borderBottomWidth: 1,
    borderColor: '#ddd',
  },
  modalScroll: {
  paddingBottom: 32,
  paddingHorizontal: 16,
  alignItems: 'flex-start',
},

  topRow: {
    flexDirection: 'row',
    justifyContent: 'flex-start',
    paddingHorizontal: 16,
    height: 40,
    alignItems: 'center',
    gap: 16,
  },
  left: {
    flexDirection: 'row',
    gap: 16,
  },
  link: {
  color: '#8E44AD', // mystical purple
  fontSize: 18,
  fontWeight: 'bold',
  textShadowColor: '#F5F5F5',
  textShadowOffset: { width: 1, height: 1 },
  textShadowRadius: 2,
  },
  username: {
    fontSize: 16,
    fontWeight: '600',
    marginLeft: 16,
    marginBottom: 8,
    color: '#333',
  },
  searchContainer: {
    padding: 10,
    paddingHorizontal: 16,
  },
  searchWrapper: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#f6f6f6',
    borderRadius: 24,
    paddingHorizontal: 16,
    height: 44,
    borderWidth: 1,
    borderColor: '#ccc',
    marginBottom: 12,
  },
  searchIcon: {
    marginRight: 8,
  },
  searchInput: {
    flex: 1,
    fontSize: 16,
    color: '#000',
    height: '100%',
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.3)',
    justifyContent: 'center',
    alignItems: 'center',
  },
 modalContent: {
  backgroundColor: '#fff',
  padding: 24,
  borderRadius: 12,
  width: '80%',
  maxHeight: '90%',
  overflow: 'scroll', // optional for web
},
  backdrop: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.5)', // semi-transparent overlay
    justifyContent: 'center',
    alignItems: 'center',
  },

  modalHeader: {
    fontSize: 20,
    fontWeight: '700',
    marginBottom: 12,
    color: '#222',
    textAlign: 'center',
  },
  modalItem: {
  paddingVertical: 12,
  borderBottomWidth: 1,
  borderColor: '#eee',
  backgroundColor: '#fafafa', // temp debug
},

  modalText: {
    fontSize: 18,
    color: '#333',
    textAlign: 'center',
  },
  closeText: {
    marginTop: 16,
    fontSize: 16,
    color: '#888',
    textAlign: 'center',
  },
  tile: {
    flex: 1,
    margin: 6,
    padding: 12,
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
    height: 100,
    borderWidth: 1,
    borderColor: '#aaa',
    shadowColor: '#000',
    shadowOpacity: 0.1,
    shadowRadius: 4,
  },
  month: {
    fontSize: 16,
    fontWeight: '600',
    marginBottom: 4,
  },
  stone: {
    fontSize: 14,
    fontStyle: 'italic',
  },
});


export default EnhancedHeader;
