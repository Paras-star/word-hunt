import { StyleSheet, Text, View } from 'react-native';

export default function HomeScreen() {
  return (
    <View style={styles.container}>
      <Text style={styles.title}>Word Hunt</Text>
      <Text style={styles.subtitle}>Environment setup successful</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#ffffff',
    alignItems: 'center',
    justifyContent: 'center',
    padding: 24,
  },
  title: {
    fontSize: 34,
    fontWeight: '800',
    color: '#1a1a1a',
  },
  subtitle: {
    marginTop: 8,
    fontSize: 16,
    color: '#4a4a4a',
  },
});
