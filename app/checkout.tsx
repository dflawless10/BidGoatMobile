// app1/checkout.tsx
import React, {useState} from 'react';
import {View, Text, StyleSheet, FlatList, Button, Alert, TextInput} from 'react-native';
import { useCart } from 'utils/context/CartContext';
import { useRouter } from 'expo-router';

 function CheckoutScreen() {
  const { cartItems } = useCart();
  const router = useRouter();
  const [address, setAddress] = useState('');
const [cardNumber, setCardNumber] = useState('');
const [exp, setExp] = useState('');
const [cvv, setCvv] = useState('');


  const total = cartItems.reduce((sum, item) => sum + item.price, 0);

  const handlePlaceOrder = () => {
    Alert.alert('Order Confirmed', `Your total is $${total.toFixed(2)} 🐐💍`);
    router.replace('/'); // Return to home or confirmation screen later
  };

  return (
    <View style={styles.container}>
      <Text style={styles.title}>💳 Checkout</Text>
      <FlatList
        data={cartItems}
        keyExtractor={(item) => item.id.toString()}
        renderItem={({ item }) => (
          <View style={styles.item}>
            <Text style={styles.name}>{item.name}</Text>
            <Text>${item.price.toFixed(2)}</Text>
          </View>
        )}
      />

      <View style={styles.summary}>
        <Text style={styles.total}>Total: ${total.toFixed(2)}</Text>
          <TextInput
  placeholder="Shipping Address"
  value={address}
  onChangeText={setAddress}
  style={styles.input}
/>
<TextInput
  placeholder="Card Number"
  value={cardNumber}
  onChangeText={setCardNumber}
  keyboardType="number-pad"
  style={styles.input}
/>
<TextInput
  placeholder="Exp (MM/YY)"
  value={exp}
  onChangeText={setExp}
  style={styles.input}
/>
<TextInput
  placeholder="CVV"
  value={cvv}
  onChangeText={setCvv}
  keyboardType="number-pad"
  style={styles.input}
/>

        <Button title="Place Order" onPress={handlePlaceOrder} />
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, padding: 20, backgroundColor: '#fff' },
  title: { fontSize: 24, fontWeight: 'bold', marginBottom: 16 },
  item: {
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderColor: '#eee',
  },
    input: {
    borderWidth: 1,
    borderColor: '#ccc',
    borderRadius: 6,
    padding: 10,
    marginBottom: 12,
    backgroundColor: '#fafafa',
  },
  name: { fontSize: 16, fontWeight: '500' },
  summary: { marginTop: 24 },
  total: { fontSize: 18, fontWeight: 'bold', marginBottom: 12 },
});

 export default CheckoutScreen;