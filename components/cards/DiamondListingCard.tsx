import React from 'react';
import {View, Text, StyleSheet, Image, TouchableOpacity} from 'react-native';
import DiamondShapeRenderer from 'components/DiamondShapeRenderer';
import Svg, { Circle } from 'react-native-svg';

<Svg height="100" width="100">
  <Circle cx="50" cy="50" r="40" stroke="black" strokeWidth="2.5" fill="blue" />
</Svg>

type Props = {
  imageUrl: string;
  shape: string;
  carat: string;
  color: string;
  clarity: string;
  certified: string;
  price: string;
};

const DiamondListingCard = ({
  imageUrl,
  shape,
  carat,
  color,
  clarity,
  certified,
  price,
}: Props) => {
  return (
    <View style={styles.card}>
      <Image source={{ uri: imageUrl }} style={styles.image} />

     <TouchableOpacity onPress={() => console.log('Appraisal ritual summoned')}>
  <View style={styles.details}>

    <Text style={styles.title}>💎 {carat}ct {shape}</Text>
    <Text style={styles.specs}>🧬 Color: {color} | ✨ Clarity: {clarity}</Text>
    <Text style={styles.specs}>📜 Certified: {certified === 'Yes' ? 'GIA Verified' : 'Uncertified Magic'}</Text>
    <Text style={styles.price}>💰 ${price}</Text>
    <Text style={styles.footer}>Tap to summon appraisal ritual 🐐</Text>
  </View>
</TouchableOpacity>
    </View>
  );
};

const styles = StyleSheet.create({
  card: {
    flexDirection: 'row',
    borderRadius: 16,
    backgroundColor: '#fdfdfd',
    marginVertical: 10,
    elevation: 5,
    shadowColor: '#000',
    shadowOpacity: 0.15,
    shadowRadius: 8,
    shadowOffset: { width: 0, height: 4 },
    overflow: 'hidden',
    borderWidth: 1,
    borderColor: '#e0e0e0',
  },
  image: {
    width: 95,
    height: 150,
    borderTopLeftRadius: 16,
    borderBottomLeftRadius: 16,
    backgroundColor: '#eee',
  },
  details: {
    padding: 14,
    flex: 1,
    justifyContent: 'center',
  },
  title: {
    fontSize: 20,
    fontWeight: '700',
    color: '#333',
  },
  specs: {
    fontSize: 15,
    color: '#666',
    marginVertical: 2,
  },
  price: {
    fontSize: 22,
    color: '#0077cc',
    fontWeight: '800',
    marginTop: 8,
  },
  footer: {
    fontSize: 12,
    color: '#999',
    marginTop: 4,
    fontStyle: 'italic',
  },
});

export default DiamondListingCard;
