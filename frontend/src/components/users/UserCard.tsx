import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';

export type UserRole = "Administrador" | "Tutor" | "Estudiante";

export interface User {
  id: number;
  name: string;
  email: string;
  role: UserRole;
}

//TODO añadir funcionalidades a botones
interface UserCardProps {
  user: User;
  onEdit?: (id: number) => void;   // placeholder
  onDelete?: (id: number) => void; // placeholder
}

const getRoleStyles = (role: UserRole) => {
  switch (role) {
    case "Administrador":
      return { backgroundColor: "#F3E8FF", color: "#6E11B0" };
    case "Tutor":
      return { backgroundColor: "#DBEAFE", color: "#193CB8" };
    case "Estudiante":
      return { backgroundColor: "#DCFCE7", color: "#016630" };
  }
};

const UserCard: React.FC<UserCardProps> = ({ user, onEdit, onDelete }) => {
  const roleStyle = getRoleStyles(user.role);

  return (
    <View style={styles.card}>
      <View style={styles.info}>
        <Text style={styles.name}>{user.name}</Text>
        <Text style={styles.email}>{user.email}</Text>
      </View>

      <View style={[styles.roleContainer, { backgroundColor: roleStyle.backgroundColor }]}>
        <Text style={[styles.roleText, { color: roleStyle.color }]}>{user.role}</Text>
      </View>

      <View style={styles.actions}>
        <TouchableOpacity style={styles.editButton} onPress={() => onEdit?.(user.id)}>
          <Text style={styles.actionText}>Editar</Text>
        </TouchableOpacity>
        <TouchableOpacity style={styles.deleteButton} onPress={() => onDelete?.(user.id)}>
          <Text style={styles.actionText}>Eliminar</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  card: {
    backgroundColor: "#fff",
    borderRadius: 12,
    padding: 15,
    marginVertical: 8,
    marginHorizontal: 16,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  info: { flex: 1, marginRight: 10 },
  name: { fontWeight: "600", fontSize: 16, color: "#101828" },
  email: { fontSize: 14, color: "#717182" },
  roleContainer: { paddingVertical: 4, paddingHorizontal: 8, borderRadius: 8 },
  roleText: { fontSize: 12, fontWeight: "600" },
  actions: { flexDirection: "row", marginLeft: 10, gap: 6 },
  editButton: {
    backgroundColor: "#3B82F6",
    paddingVertical: 6,
    paddingHorizontal: 10,
    borderRadius: 8,
  },
  deleteButton: {
    backgroundColor: "#FF4D4F",
    paddingVertical: 6,
    paddingHorizontal: 10,
    borderRadius: 8,
  },
  actionText: { color: "#fff", fontWeight: "600" },
});

export default UserCard;
