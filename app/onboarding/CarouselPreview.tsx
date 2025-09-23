import React, { useEffect, useRef, useState } from 'react';
import { View, Text, Image, StyleSheet, Dimensions, Animated } from 'react-native';
import Carousel from 'react-native-reanimated-carousel';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { playGoatSound } from '@/utils/GoatSound';

const { width } = Dimensions.get('window');

type Category = 'Just Listed' | 'Create Auction' | 'Sell Now';

type CarouselItem = {
  title: string;
  image: { uri: string };
  countdown?: string;
};

interface Props {
  category: Category;
  onFirstSwipe?: () => void;
}

const TEN_MIN_MS = 10 * 60 * 1000;
const LAST_GOAT_KEY = 'last_goat_sound_ts';

const CarouselPreview: React.FC<Props> = ({ category, onFirstSwipe }) => {
  const fade = useRef(new Animated.Value(0)).current;
  const scale = useRef(new Animated.Value(0.98)).current;
  const lastGoatRef = useRef<number>(0);
  const [carouselItems, setCarouselItems] = useState<CarouselItem[]>([]);
  const hasTriggeredSwipe = useRef(false);

  // Load last goat sound timestamp
  useEffect(() => {
    let mounted = true;
    AsyncStorage.getItem(LAST_GOAT_KEY)
      .then((v) => {
        if (!mounted) return;
        const parsed = v ? Number(v) : 0;
        lastGoatRef.current = Number.isFinite(parsed) ? parsed : 0;
      })
      .catch(() => {});
    return () => {
      mounted = false;
    };
  }, []);

  // Animate fade/scale on category change
  useEffect(() => {
    fade.setValue(0);
    scale.setValue(0.98);
    Animated.parallel([
      Animated.timing(fade, { toValue: 1, duration: 260, useNativeDriver: true }),
      Animated.spring(scale, { toValue: 1, useNativeDriver: true, bounciness: 6 }),
    ]).start();
  }, [category]);

  // Fetch dynamic items
  useEffect(() => {
    const fetchItems = async () => {
      try {
        const token = await AsyncStorage.getItem('jwtToken');
        if (!token) return;

        const response = await fetch('http://10.0.0.170:5000/api/jewelry-box', {
          headers: {
            Authorization: `Bearer ${token}`,
            'Content-Type': 'application/json',
          },
        });

        if (response.ok) {
          const data = await response.json();
          const mapped = data.items.map((item: any) => ({
            title: item.name,
            image: { uri: item.photo_url },
            countdown: item.timeLeft,
          }));
          setCarouselItems(mapped);
        }
      } catch (err) {
        console.warn('Failed to fetch carousel items:', err);
      }
    };

    if (category === 'Just Listed') {
      fetchItems();
    }
  }, [category]);

  const maybePlayGoat = (titleLen: number) => {
    const now = Date.now();
    if (now - lastGoatRef.current >= TEN_MIN_MS) {
      playGoatSound(titleLen);
      lastGoatRef.current = now;
      AsyncStorage.setItem(LAST_GOAT_KEY, String(now)).catch(() => {});
    }
  };

  return (
    <Animated.View style={{ opacity: fade, transform: [{ scale }] }}>
      <Carousel
        key={category}
        loop
        width={width}
        height={260}
        autoPlay
        data={carouselItems}
        scrollAnimationDuration={1800}
        onSnapToItem={(index) => {
          maybePlayGoat(carouselItems[index].title.length);
          if (!hasTriggeredSwipe.current && onFirstSwipe) {
            hasTriggeredSwipe.current = true;
            onFirstSwipe();
          }
        }}
        renderItem={({ item }) => {
          const isRare = item.title.toLowerCase().includes('rare');
          const wrapperStyle = [
            styles.item,
            {
              backgroundColor: item.countdown ? '#fffbe6' : '#f8f8f8',
              borderColor: isRare ? '#ffd700' : '#ccc',
              borderWidth: 2,
            },
          ];
          return (
            <View style={wrapperStyle}>
              <Image source={item.image} style={styles.image} />
              <Text style={styles.title}>{item.title}</Text>
              {item.countdown && (
                <Text style={styles.countdown}>Ends in: {item.countdown}</Text>
              )}
            </View>
          );
        }}
      />
    </Animated.View>
  );
};

const styles = StyleSheet.create({
  item: {
    borderRadius: 12,
    padding: 20,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 2,
    borderColor: '#ccc',
  },
  image: {
    width: 260,
    height: 160,
    resizeMode: 'cover',
    borderRadius: 10,
    marginBottom: 12,
  },
  title: { fontSize: 18, fontWeight: 'bold', color: '#222' },
  countdown: { fontSize: 14, color: '#888', marginTop: 6 },
});

export default CarouselPreview;
