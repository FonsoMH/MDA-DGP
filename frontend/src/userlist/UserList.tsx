import React from "react";
import { View, Text, StyleSheet, ActivityIndicator } from "react-native";
import { useUsers } from "./hook/useUserList";

function UserList() {
  const { users, isLoading } = useUsers();

  if (isLoading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#000" />
        <Text>Cargando usuarios...</Text>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Lista de Usuarios</Text>
      {users.map((user) => (
        <View key={user.userId} style={styles.userCard}>
          <Text style={styles.name}>{user.name}</Text>
          <Text style={styles.email}>{user.email}</Text>
          <Text style={styles.role}>{user.role}</Text>
        </View>
      ))}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#F7F8FA",
    padding: 20,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
  },
  title: {
    fontSize: 26,
    fontWeight: "bold",
    marginBottom: 20,
    textAlign: "center",
  },
  userCard: {
    backgroundColor: "#fff",
    padding: 15,
    marginBottom: 10,
    borderRadius: 10,
    shadowColor: "#000",
    shadowOpacity: 0.1,
    shadowRadius: 5,
    elevation: 2,
  },
  name: {
    fontSize: 18,
    fontWeight: "600",
  },
  email: {
    fontSize: 16,
    color: "#666",
  },
  role: {
    fontSize: 16,
    color: "#333",
  },
});

export default UserList;
