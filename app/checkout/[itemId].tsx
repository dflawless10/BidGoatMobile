import React, { useEffect, useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  ActivityIndicator,
  Alert,
  Switch,
} from 'react-native';
import { useLocalSearchParams, useRouter } from 'expo-router';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { Ionicons } from '@expo/vector-icons';

const API_URL = 'http://10.0.0.170:5000';

type BuyerCostBreakdown = {
  item_price: number;
  shipping_cost: number;
  insurance_cost: number;
  total: number;
  weight_lbs: number;
  insurance_included: boolean;
};

type ItemDetail = {
  id: number;
  name: string;
  description?: string;
  price: number;
  buy_it_now?: number;
  photo_url?: string;
  weight_lbs?: number;
  seller?: {
    username: string;
    avg_rating: number;
  };
};

export default function CheckoutScreen() {
  const { itemId } = useLocalSearchParams();
  const router = useRouter();

  const [item, setItem] = useState<ItemDetail | null>(null);
  const [costBreakdown, setCostBreakdown] = useState<BuyerCostBreakdown | null>(null);
  const [includeInsurance, setIncludeInsurance] = useState(false);
  const [loading, setLoading] = useState(true);
  const [purchasing, setPurchasing] = useState(false);

  useEffect(() => {
    fetchItemAndCosts();
  }, [itemId, includeInsurance]);

  const fetchItemAndCosts = async () => {
    try {
      // Fetch item details
      const itemRes = await fetch(`${API_URL}/item/${itemId}`);
      const itemData = await itemRes.json();
      setItem(itemData);

      // Calculate buyer costs
      const costRes = await fetch(`${API_URL}/api/calculate-buyer-total`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          item_id: itemId,
          include_insurance: includeInsurance,
        }),
      });

      if (costRes.ok) {
        const costData = await costRes.json();
        setCostBreakdown(costData.breakdown);
      }
    } catch (error) {
      console.error('Failed to fetch checkout data:', error);
      Alert.alert('Error', 'Failed to load checkout information');
    } finally {
      setLoading(false);
    }
  };

  const handlePurchase = async () => {
    setPurchasing(true);
    try {
      const token = await AsyncStorage.getItem('jwtToken');
      if (!token) {
        Alert.alert('Not signed in', 'Please sign in to purchase');
        router.push('/sign-in');
        return;
      }

      const response = await fetch(`${API_URL}/item/${itemId}/bid`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          amount: item?.buy_it_now,
        }),
      });

      if (response.ok) {
        const data = await response.json();
        Alert.alert(
          '🎉 Purchase Successful!',
          `You've purchased ${item?.name}\n\nTotal: $${costBreakdown?.total.toFixed(2)}`,
          [
            {
              text: 'View Orders',
              onPress: () => router.push('/orders'),
            },
            {
              text: 'Continue Shopping',
              onPress: () => router.push('/discover'),
            },
          ]
        );
      } else {
        const error = await response.json();
        Alert.alert('Purchase Failed', error.error || 'Something went wrong');
      }
    } catch (error) {
      console.error('Purchase error:', error);
      Alert.alert('Error', 'Failed to complete purchase');
    } finally {
      setPurchasing(false);
    }
  };

  const getInsuranceLabel = () => {
    if (!item) return '';
    const price = item.buy_it_now || item.price;
    if (price <= 100) return 'Free';
    if (price <= 500) return '$2.99';
    if (price <= 1000) return '$4.99';
    if (price <= 5000) return '$9.99';
    return `$${(price * 0.01).toFixed(2)} (1%)`;
  };

  if (loading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#FF6B35" />
        <Text style={styles.loadingText}>Loading checkout...</Text>
      </View>
    );
  }

  if (!item || !costBreakdown) {
    return (
      <View style={styles.errorContainer}>
        <Text style={styles.errorText}>Item not found</Text>
        <TouchableOpacity onPress={() => router.back()} style={styles.backButton}>
          <Text style={styles.backButtonText}>Go Back</Text>
        </TouchableOpacity>
      </View>
    );
  }

  return (
    <ScrollView style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity onPress={() => router.back()}>
          <Ionicons name="arrow-back" size={24} color="#333" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Checkout</Text>
        <View style={{ width: 24 }} />
      </View>

      {/* Item Summary */}
      <View style={styles.itemCard}>
        <Text style={styles.itemName}>{item.name}</Text>
        {item.seller && (
          <View style={styles.sellerRow}>
            <Text style={styles.sellerLabel}>Sold by:</Text>
            <Text style={styles.sellerName}>{item.seller.username}</Text>
            {item.seller.avg_rating > 0 && (
              <Text style={styles.sellerRating}>⭐ {item.seller.avg_rating.toFixed(1)}</Text>
            )}
          </View>
        )}
      </View>

      {/* Cost Breakdown */}
      <View style={styles.breakdownCard}>
        <Text style={styles.sectionTitle}>Cost Breakdown</Text>

        <View style={styles.costRow}>
          <Text style={styles.costLabel}>Item Price</Text>
          <Text style={styles.costValue}>${costBreakdown.item_price.toFixed(2)}</Text>
        </View>

        <View style={styles.costRow}>
          <View style={styles.costLabelWithInfo}>
            <Text style={styles.costLabel}>Shipping</Text>
            <Text style={styles.weightInfo}>({costBreakdown.weight_lbs} lbs)</Text>
          </View>
          <Text style={styles.costValue}>${costBreakdown.shipping_cost.toFixed(2)}</Text>
        </View>

        <View style={styles.divider} />

        {/* Insurance Option */}
        <View style={styles.insuranceRow}>
          <View style={styles.insuranceLeft}>
            <Text style={styles.costLabel}>Insurance (optional)</Text>
            <Text style={styles.insuranceSubtext}>{getInsuranceLabel()}</Text>
          </View>
          <Switch
            value={includeInsurance}
            onValueChange={setIncludeInsurance}
            trackColor={{ false: '#ccc', true: '#FF6B35' }}
            thumbColor={includeInsurance ? '#fff' : '#f4f3f4'}
          />
        </View>

        {includeInsurance && (
          <View style={styles.costRow}>
            <Text style={styles.costLabelIndent}>Insurance Cost</Text>
            <Text style={styles.costValue}>${costBreakdown.insurance_cost.toFixed(2)}</Text>
          </View>
        )}

        <View style={styles.divider} />

        {/* Total */}
        <View style={styles.totalRow}>
          <Text style={styles.totalLabel}>Total</Text>
          <Text style={styles.totalValue}>${costBreakdown.total.toFixed(2)}</Text>
        </View>
      </View>

      {/* Shipping Info */}
      <View style={styles.infoCard}>
        <View style={styles.infoRow}>
          <Ionicons name="information-circle" size={20} color="#4299E1" />
          <Text style={styles.infoText}>
            Buyer pays shipping. Flat rate based on item weight.
          </Text>
        </View>
        {includeInsurance && (
          <View style={styles.infoRow}>
            <Ionicons name="shield-checkmark" size={20} color="#48BB78" />
            <Text style={styles.infoText}>
              Your purchase is insured up to ${(item.buy_it_now || item.price).toFixed(2)}
            </Text>
          </View>
        )}
      </View>

      {/* Purchase Button */}
      <TouchableOpacity
        style={[styles.purchaseButton, purchasing && styles.purchaseButtonDisabled]}
        onPress={handlePurchase}
        disabled={purchasing}
      >
        {purchasing ? (
          <ActivityIndicator color="#fff" />
        ) : (
          <>
            <Text style={styles.purchaseButtonText}>Complete Purchase</Text>
            <Text style={styles.purchaseButtonSubtext}>${costBreakdown.total.toFixed(2)}</Text>
          </>
        )}
      </TouchableOpacity>

      {/* Payment Info */}
      <Text style={styles.footerText}>
        💳 Secure payment processing with 256-bit encryption
      </Text>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F7FAFC',
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#F7FAFC',
  },
  loadingText: {
    marginTop: 12,
    fontSize: 16,
    color: '#666',
  },
  errorContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  errorText: {
    fontSize: 18,
    color: '#E53E3E',
    marginBottom: 20,
  },
  backButton: {
    backgroundColor: '#FF6B35',
    paddingHorizontal: 24,
    paddingVertical: 12,
    borderRadius: 8,
  },
  backButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '600',
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: 16,
    backgroundColor: '#fff',
    borderBottomWidth: 1,
    borderBottomColor: '#E2E8F0',
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: '#333',
  },
  itemCard: {
    backgroundColor: '#fff',
    margin: 16,
    padding: 16,
    borderRadius: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  itemName: {
    fontSize: 20,
    fontWeight: '700',
    color: '#1A202C',
    marginBottom: 8,
  },
  sellerRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  sellerLabel: {
    fontSize: 14,
    color: '#718096',
  },
  sellerName: {
    fontSize: 14,
    fontWeight: '600',
    color: '#2D3748',
  },
  sellerRating: {
    fontSize: 13,
    color: '#F6AD55',
  },
  breakdownCard: {
    backgroundColor: '#fff',
    marginHorizontal: 16,
    marginBottom: 16,
    padding: 20,
    borderRadius: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: '#1A202C',
    marginBottom: 16,
  },
  costRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 10,
  },
  costLabel: {
    fontSize: 15,
    color: '#4A5568',
  },
  costLabelWithInfo: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  weightInfo: {
    fontSize: 13,
    color: '#A0AEC0',
  },
  costValue: {
    fontSize: 16,
    fontWeight: '600',
    color: '#2D3748',
  },
  costLabelIndent: {
    fontSize: 15,
    color: '#718096',
    marginLeft: 16,
  },
  insuranceRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 12,
  },
  insuranceLeft: {
    flex: 1,
  },
  insuranceSubtext: {
    fontSize: 13,
    color: '#A0AEC0',
    marginTop: 2,
  },
  divider: {
    height: 1,
    backgroundColor: '#E2E8F0',
    marginVertical: 8,
  },
  totalRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingTop: 12,
  },
  totalLabel: {
    fontSize: 18,
    fontWeight: '700',
    color: '#1A202C',
  },
  totalValue: {
    fontSize: 24,
    fontWeight: '700',
    color: '#FF6B35',
  },
  infoCard: {
    backgroundColor: '#EDF2F7',
    marginHorizontal: 16,
    marginBottom: 16,
    padding: 16,
    borderRadius: 12,
    gap: 12,
  },
  infoRow: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: 10,
  },
  infoText: {
    flex: 1,
    fontSize: 14,
    color: '#4A5568',
    lineHeight: 20,
  },
  purchaseButton: {
    backgroundColor: '#FF6B35',
    marginHorizontal: 16,
    marginBottom: 12,
    padding: 18,
    borderRadius: 12,
    alignItems: 'center',
    shadowColor: '#FF6B35',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 5,
  },
  purchaseButtonDisabled: {
    backgroundColor: '#CBD5E0',
    shadowOpacity: 0,
  },
  purchaseButtonText: {
    color: '#fff',
    fontSize: 18,
    fontWeight: '700',
  },
  purchaseButtonSubtext: {
    color: '#fff',
    fontSize: 14,
    marginTop: 4,
    opacity: 0.9,
  },
  footerText: {
    textAlign: 'center',
    fontSize: 13,
    color: '#718096',
    marginHorizontal: 16,
    marginBottom: 32,
  },
});
