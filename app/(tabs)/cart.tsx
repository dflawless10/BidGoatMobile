import React from 'react';
import { View, Text, FlatList, StyleSheet, Button, Image } from 'react-native';
import { useCart } from 'utils/context/CartContext';
import { useRouter } from 'expo-router';

export default function CartScreen() {
  const { cartItems, removeFromCart } = useCart();
  const router = useRouter();

  const renderItem = ({ item }: { item: any }) => (
    <View style={styles.card}>
      <Image source={{ uri: item.photo_url }} style={styles.image} />
      <View style={styles.details}>
        <Text style={styles.name}>{item.name}</Text>
        <Text style={styles.price}>${item.price}</Text>
        <Button title="Remove" onPress={() => removeFromCart(item.id)} />
      </View>
    </View>
  );

  return (
    <View style={styles.container}>
      <Text style={styles.header}>🛒 Your Shopping Cart</Text>
      {cartItems.length > 0 ? (
        <>
          <FlatList
            data={cartItems}
            keyExtractor={(item) => item.id.toString()}
            renderItem={renderItem}
          />
          <Button title="Proceed to Checkout" onPress={() => router.push('/checkout')} />
        </>
      ) : (
        <Text style={styles.empty}>Your cart is empty.</Text>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, padding: 16 },
  header: { fontSize: 24, fontWeight: 'bold', marginBottom: 16 },
  empty: { fontSize: 18, textAlign: 'center', marginTop: 40 },
  card: {
    flexDirection: 'row',
    marginBottom: 16,
    backgroundColor: '#f8f8f8',
    padding: 12,
    borderRadius: 8,
  },
  image: { width: 80, height: 80, borderRadius: 6 },
  details: { marginLeft: 12, flex: 1 },
  name: { fontSize: 16, fontWeight: '600' },
  price: { fontSize: 14, color: '#333', marginBottom: 6 },
});
