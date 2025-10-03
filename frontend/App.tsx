import React, { useEffect, useState } from "react";
import { StyleSheet, Text, View, FlatList } from "react-native";
import axios from "axios";

type Player = {
  id: number;
  name: string;
  score: number;
};

export default function App() {
  const [players, setPlayers] = useState<Player[]>([]);

  useEffect(() => {
    axios
      .get("http://192.168.1.117:5000/hello") // O tu IP si es móvil
      .then((res) => setPlayers(res.data))
      .catch((err) => console.log(err));
  }, []);

  const renderItem = ({ item }: { item: Player }) => (
    <View style={styles.card}>
      <Text style={styles.name}>{item.name}</Text>
      <Text style={styles.score}>Score: {item.score}</Text>
    </View>
  );

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Jugadores</Text>
      <FlatList
        data={players}
        keyExtractor={(item) => item.id.toString()}
        renderItem={renderItem}
        contentContainerStyle={{ paddingBottom: 20 }}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    paddingTop: 50,
    alignItems: "center",
    backgroundColor: "#f0f4f7",
  },
  title: {
    fontSize: 28,
    fontWeight: "bold",
    marginBottom: 20,
  },
  card: {
    backgroundColor: "#fff",
    padding: 20,
    marginVertical: 8,
    width: 300,
    borderRadius: 10,
    shadowColor: "#000",
    shadowOpacity: 0.1,
    shadowOffset: { width: 0, height: 2 },
    shadowRadius: 4,
    elevation: 3,
  },
  name: {
    fontSize: 20,
    fontWeight: "600",
  },
  score: {
    fontSize: 16,
    color: "#555",
    marginTop: 5,
  },
});
