import React, { useEffect, useState } from 'react';
import {
  View, Text, FlatList, Image, StyleSheet,
  TouchableOpacity, ActivityIndicator, Alert
} from 'react-native';
import AsyncStorage from "@react-native-async-storage/async-storage";
import { useRouter } from 'expo-router';




type SellerItem = {
  id: number;
  name: string;
  price: number;
  photo_url: string;
  bid_count: number;
};

const API_URL = 'http://10.0.0.170:5000';

function SellerDashboardScreen() {
  const [items, setItems] = useState<SellerItem[]>([]);
  const [loading, setLoading] = useState(true);
  const router = useRouter();

  useEffect(() => {
    const fetchSellerItems = async () => {
      const token = await AsyncStorage.getItem('jwtToken');
      try {
        const res = await fetch(`${API_URL}/seller/items`, {
          headers: { Authorization: `Bearer ${token}` }
        });
        const data = await res.json();
        setItems(data);
      } catch (err) {
        console.error('Error loading items:', err);
      } finally {
        setLoading(false);
      }
    };
    fetchSellerItems();
  }, []);

  const handleDelete = async (itemId: number) => {
    const token = await AsyncStorage.getItem('jwtToken');
    try {
      const res = await fetch(`${API_URL}/item/${itemId}`, {
        method: 'DELETE',
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      if (res.ok) {
        Alert.alert('Deleted!', 'Item removed from your vault.');
        setItems((prevItems) => prevItems.filter((item) => item.id !== itemId));
      } else {
        const message = await res.text();
        Alert.alert('Error', message);
      }
    } catch (error) {
      console.error('Delete error:', error);
      Alert.alert('Error', 'Could not delete item.');
    }
  };

  if (loading) return <ActivityIndicator style={{ marginTop: 20 }} />;
  return (
    <FlatList
      data={items}
      keyExtractor={(item) => item.id.toString()}
      contentContainerStyle={styles.container}
      renderItem={({ item }) => (
        <TouchableOpacity
          style={styles.card}
          onPress={() => router.push(`/item/${item.id}`)}
        >
          <Image source={{ uri: item.photo_url }} style={styles.image} />
          <View style={styles.details}>
            <Text style={styles.name}>{item.name}</Text>
            <Text>💰 ${item.price}</Text>
            <Text>📊 Bids: {item.bid_count}</Text>

            <View style={styles.actionRow}>
              <TouchableOpacity onPress={() =>
                router.push({
                  pathname: '/seller/item/[itemId]/edit',
                  params: { itemId: item.id.toString() }
                })
              }>
                <Text style={styles.actionText}>✏️ Edit</Text>
              </TouchableOpacity>

              <TouchableOpacity onPress={() => handleDelete(item.id)}>
                <Text style={[styles.actionText, { color: '#e53e3e' }]}>🗑️ Delete</Text>
              </TouchableOpacity>
            </View>
          </View>
        </TouchableOpacity>
      )}
    />
  );
}

const styles = StyleSheet.create({
  container: { padding: 16 },
  card: {
    flexDirection: 'row',
    marginBottom: 12,
    borderWidth: 1,
    borderColor: '#ddd',
    borderRadius: 8,
    overflow: 'hidden',
  },
  actionRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: 10,
  },
  actionText: {
    fontSize: 14,
    fontWeight: '500',
    paddingVertical: 4,
    paddingHorizontal: 8,
    backgroundColor: '#edf2f7',
    borderRadius: 6,
  },
  image: { width: 100, height: 100 },
  details: { padding: 10, flex: 1 },
  name: { fontSize: 18, fontWeight: '600', marginBottom: 4 }
});
export default SellerDashboardScreen;