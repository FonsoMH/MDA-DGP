import { useState, useEffect, useCallback } from "react";
import { fetchUsers } from "../api/userApi";
import { useFocusEffect } from "@react-navigation/native";
import { UserFrontend } from "../../../types/users";

/**
 * Custom Hook para cargar y manejar la lista de usuarios.
 * @returns {{ users: UserFrontend[]; isLoading: boolean }}
 */
export function useUsers() {
  const [users, setUsers] = useState<UserFrontend[]>([]);
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [error, setError] = useState<Error | null>(null);

  // useEffect(() => {
  //   const loadUsers = async () => {
  //     setIsLoading(true);
  //     const data = await fetchUsers();
  //     setUsers(data);
  //     setIsLoading(false);
  //   };

  //   loadUsers();
  // }, []);

  const loadUsersData = useCallback(async () => {
    setIsLoading(true);
    try {
        const data = await fetchUsers();
        setUsers(data);
    } catch (error) {
        setError(error as Error);
    } finally {
        setIsLoading(false);
    }
  }, []);

  useFocusEffect(
      useCallback(() => {
          loadUsersData();
      }, [loadUsersData])
  );

  return { users, isLoading , refetch: loadUsersData, error};
}
