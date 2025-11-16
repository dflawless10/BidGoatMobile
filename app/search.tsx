import React, { useEffect, useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  ActivityIndicator,
  TouchableOpacity,
  Image,
  Dimensions, Alert,
} from 'react-native';
import { useRouter, useLocalSearchParams } from 'expo-router';
import { useAuth } from '@/hooks/AuthContext';
import { Ionicons } from '@expo/vector-icons';

interface SearchResult {
  id: string;
  item_id?: string;
  name?: string;
  title?: string;  // Add this
  price?: number;
  photo_url?: string;
  bid_count?: number;
  description?: string;
  tags?: string;
  score?: number;
  result_type?: string;  // Add this
  type?: string;  // Add this
}

const { width } = Dimensions.get('window');
const COLUMN_GAP = 12;
const NUM_COLUMNS = 2;
const ITEM_WIDTH = (width - 32 - COLUMN_GAP) / NUM_COLUMNS;

export default function SearchScreen() {
  const router = useRouter();
  const { q } = useLocalSearchParams<{ q: string }>();
  const { token } = useAuth();
  const [results, setResults] = useState<SearchResult[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const searchItems = async () => {
      if (!q) {
        setLoading(false);
        return;
      }

      try {
        setLoading(true);
        setError(null);

        const response = await fetch(
          `http://10.0.0.170:5000/api/v1/search?q=${encodeURIComponent(q)}&limit=50`,
          {
            headers: {
              'Authorization': `Bearer ${token}`,
              'Content-Type': 'application/json',
            },
          }
        );

        if (!response.ok) {
          throw new Error(`Search failed: ${response.status}`);
        }

        const data = await response.json();

        if (data.status === 'success') {
          setResults(data.data.items || []);
        } else {
          throw new Error(data.message || 'Search failed');
        }
      } catch (err) {
        console.error('🔍 Search error:', err);
        setError(err instanceof Error ? err.message : 'Search failed');
      } finally {
        setLoading(false);
      }
    };

    searchItems();
  }, [q, token]);

  const renderItem = ({ item }: { item: SearchResult }) => {
    const isHelp = item.result_type === 'help' || item.result_type === 'category';
    const itemId = item.id || item.item_id;

    if (isHelp) {
      const helpDetails = (item as any).details || item.description || 'No details available';
      return (
        <TouchableOpacity
          style={styles.helpCard}
          onPress={() => Alert.alert(item.title || '', helpDetails)}
          activeOpacity={0.9}
        >
          <Ionicons name="help-circle-outline" size={36} color="#FF6B35" />
          <View style={{flex: 1, marginLeft: 16}}>
            <Text style={{fontSize: 16, fontWeight: '600', color: '#242c40'}}>{item.title}</Text>
            <Text style={{fontSize: 14, color: '#666'}} numberOfLines={2}>{item.description}</Text>
          </View>
        </TouchableOpacity>
      );
    }

    return (
      <TouchableOpacity
        style={styles.cardWrapper}
        onPress={() => router.push(`/item/${itemId}`)}
        activeOpacity={0.9}
      >
        <View style={styles.card}>
          {item.photo_url && (
            <>
              <Image
                source={{ uri: item.photo_url }}
                style={styles.image}
                resizeMode="cover"
              />
              <View style={styles.priceTag}>
                <Text style={styles.priceText}>${(item.price || 0).toFixed(2)}</Text>
              </View>
            </>
          )}
          <Text style={styles.itemName} numberOfLines={2}>
            {item.name || item.title}
          </Text>
          {item.bid_count !== undefined && (
            <Text style={styles.bidCount}>🦩 {item.bid_count} bids</Text>
          )}
        </View>
      </TouchableOpacity>
    );
  };

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity
          onPress={() => router.back()}
          style={styles.backButton}
        >
          <Ionicons name="arrow-back" size={24} color="#242c40" />
        </TouchableOpacity>
        <Text style={styles.searchQuery} numberOfLines={1}>
          Results for "{q}"
        </Text>
      </View>

      {loading && (
        <View style={styles.centerContent}>
          <ActivityIndicator size="large" color="#FF6B35" />
          <Text style={styles.loadingText}>Searching...</Text>
        </View>
      )}

      {!loading && error && (
        <View style={styles.centerContent}>
          <Ionicons name="alert-circle" size={48} color="#e53e3e" />
          <Text style={styles.errorText}>{error}</Text>
          <TouchableOpacity
            style={styles.retryButton}
            onPress={() => {
              setLoading(true);
              setError(null);
            }}
          >
            <Text style={styles.retryButtonText}>Retry</Text>
          </TouchableOpacity>
        </View>
      )}

      {!loading && !error && results.length === 0 && (
        <View style={styles.centerContent}>
          <Ionicons name="search" size={48} color="#999" />
          <Text style={styles.emptyText}>No results found for "{q}"</Text>
          <Text style={styles.emptySubtext}>Try different keywords</Text>
        </View>
      )}

      {!loading && !error && results.length > 0 && (
        <FlatList
          data={results}
          keyExtractor={(item, index) => item.id || item.item_id || `item-${index}`}
          renderItem={renderItem}
          contentContainerStyle={styles.listContent}
          ListHeaderComponent={
            <Text style={styles.resultCount}>
              Found {results.length} result{results.length !== 1 ? 's' : ''}
            </Text>
          }
        />
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingTop: 60,
    paddingBottom: 16,
    backgroundColor: '#fff',
    borderBottomWidth: 1,
    borderBottomColor: '#eee',
  },
  backButton: {
    marginRight: 12,
  },
  searchQuery: {
    fontSize: 18,
    fontWeight: '600',
    color: '#242c40',
    flex: 1,
  },
  centerContent: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 32,
  },
  loadingText: {
    marginTop: 16,
    fontSize: 16,
    color: '#666',
  },
  errorText: {
    marginTop: 16,
    fontSize: 16,
    color: '#e53e3e',
    textAlign: 'center',
  },
  retryButton: {
    marginTop: 16,
    paddingHorizontal: 24,
    paddingVertical: 12,
    backgroundColor: '#FF6B35',
    borderRadius: 8,
  },
  retryButtonText: {
    color: '#fff',
    fontWeight: '600',
    fontSize: 16,
  },
  emptyText: {
    marginTop: 16,
    fontSize: 18,
    fontWeight: '600',
    color: '#666',
    textAlign: 'center',
  },
  emptySubtext: {
    marginTop: 8,
    fontSize: 14,
    color: '#999',
  },
  listContent: {
    paddingHorizontal: 16,
    paddingTop: 16,
    paddingBottom: 32,
  },
  columnWrapper: {
    gap: COLUMN_GAP,
    justifyContent: 'space-between',
  },
  resultCount: {
    fontSize: 14,
    color: '#666',
    marginBottom: 16,
    fontWeight: '500',
  },
  cardWrapper: {
    width: ITEM_WIDTH,
    marginBottom: 16,
  },
  card: {
    backgroundColor: '#f5f5f5',
    borderRadius: 12,
    padding: 12,
    position: 'relative',
    shadowColor: '#000',
    shadowOpacity: 0.1,
    shadowRadius: 4,
    shadowOffset: { width: 0, height: 2 },
    elevation: 3,
  },
  image: {
    width: '100%',
    height: 160,
    borderRadius: 8,
    marginBottom: 8,
  },
  priceTag: {
    position: 'absolute',
    top: 20,
    left: 20,
    backgroundColor: 'rgba(0, 0, 0, 0.7)',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 8,
  },
  priceText: {
    color: '#fff',
    fontWeight: '700',
    fontSize: 16,
  },
  itemName: {
    fontSize: 15,
    fontWeight: '600',
    color: '#242c40',
    marginBottom: 4,
  },
  bidCount: {
    fontSize: 12,
    color: '#666',
    fontWeight: '500',
  },
  helpCard: {
  flexDirection: 'row',
  padding: 16,
  marginBottom: 12,
  borderRadius: 12,
  borderWidth: 1,
  borderColor: '#FFE4D6',
  alignItems: 'center',
},
});
