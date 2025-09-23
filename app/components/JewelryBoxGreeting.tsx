
import React from 'react';
import { View, Text, Button, StyleSheet } from 'react-native';
import { useRouter } from 'expo-router';



interface Props {
  username: string;
}

const JewelryBoxGreeting: React.FC<Props> = ({ username }) => {
  const router = useRouter();

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Welcome back, {username} 💍</Text>
      <Button
        title="📦 Open Jewelry Box"
        onPress={() => router.replace('/(tabs)/JewelryBoxScreen')}
      />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    marginVertical: 24,
    padding: 12,
  },
  title: {
    fontSize: 20,
    fontWeight: '600',
    marginBottom: 12,
  },
});

export default JewelryBoxGreeting;
