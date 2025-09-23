// components/ReceiptView.tsx
import React from 'react';
import { View, Text, StyleSheet, Image } from 'react-native';
import { CartItem } from 'utils/context/CartContext';

export default function ReceiptView({
  items,
  total,
  address,
  deliveryDate,
}: {
  items: CartItem[];
  total: number;
  address: string;
  deliveryDate: string;
}) {
  return (
    <View style={styles.container}>
      <Text style={styles.heading}>🧾 Receipt Summary</Text>
      <Text style={styles.section}>📦 Shipping to:</Text>
      <Text style={styles.detail}>{address}</Text>

      <Text style={styles.section}>🎁 Items:</Text>
      {items.map((item) => (
        <View key={item.id} style={styles.itemRow}>
          <Image source={{ uri: item.photo_url }} style={styles.thumbnail} />
          <View style={{ marginLeft: 10 }}>
            <Text>{item.name}</Text>
            <Text>${item.price.toFixed(2)}</Text>
          </View>
        </View>
      ))}

      <Text style={styles.section}>🕒 Estimated Delivery:</Text>
      <Text style={styles.detail}>{deliveryDate}</Text>

      <Text style={styles.section}>💰 Total:</Text>
      <Text style={styles.total}>${total.toFixed(2)}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { padding: 16, backgroundColor: '#f9f9f9', borderRadius: 10 },
  heading: { fontSize: 18, fontWeight: 'bold', marginBottom: 12 },
  section: { fontSize: 16, fontWeight: '600', marginTop: 12 },
  detail: { fontSize: 14, marginBottom: 6 },
  total: { fontSize: 18, fontWeight: 'bold', color: '#222', marginTop: 8 },
  itemRow: {
    flexDirection: 'row',
    marginVertical: 8,
    alignItems: 'center',
  },
  thumbnail: { width: 60, height: 60, borderRadius: 6 },
});
