// FavoriteCarouselCard.tsx
import React from 'react';
import {  Text, TouchableOpacity, StyleSheet, Image } from 'react-native';
import Animated, { FadeInDown } from 'react-native-reanimated';
import WinkingGoat from '../assets/winkingGoat.svg';
import DiamondIcon from '../assets/diamond.svg';
import {transform} from "lodash";
import { calculateTimeLeft } from '@/utils/time';

type Props = {
  item: {
    id: number;
    name: string;
    description: string;
    photo_url: string;
    registration_time: string;
  };
  onTap: (id: number) => void;
  animatedStyle: any;
};

const FavoriteCarouselCard: React.FC<Props> = ({ item, onTap, animatedStyle }) => {


  return (
    <Animated.View entering={FadeInDown} style={styles.carouselCard}>
      <Text style={styles.title}>{item.name ?? 'Unnamed Item'}</Text>
<Text style={styles.description}>{item.description ?? 'No description available.'}</Text>
<Image source={{ uri: item.photo_url ?? 'https://via.placeholder.com/240x140.png?text=No+Image' }} style={styles.carouselImage} />
<Text style={styles.timeLeft}>Time Left: {calculateTimeLeft(item.registration_time ?? '')}</Text>


      <TouchableOpacity
        onPress={() => onTap(item.id)}
        style={styles.heartIcon}
        accessibilityLabel="Tap to favorite this item"
        activeOpacity={0.8}
      >
        <Animated.View style={[styles.iconWrapper, animatedStyle ??{ }]}>
          <WinkingGoat width={80} height={80} />
        </Animated.View>
        <Animated.View style={[styles.iconWrapper, animatedStyle ??{ transform}]}>
          <DiamondIcon width={30} height={30} />
        </Animated.View>
      </TouchableOpacity>
    </Animated.View>
  );
};

const styles = StyleSheet.create({
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
  title: {
    fontSize: 18,
    fontWeight: '600',
    marginBottom: 4,
  },
  description: {
    fontSize: 14,
    color: '#555',
    marginBottom: 6,
  },
  timeLeft: {
    fontSize: 12,
    color: '#999',
    marginBottom: 6,
  },
  heartIcon: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 8,
  },
  iconWrapper: {
    marginHorizontal: 4,
  },
});

export default FavoriteCarouselCard;
