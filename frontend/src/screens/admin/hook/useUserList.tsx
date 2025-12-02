import { useState, useEffect, useCallback } from "react";
import { fetchUsers } from "../api/userApi";
import { useFocusEffect } from "@react-navigation/native";
import { UserFrontend, PaginatedUsersResponse } from "../../../types/users";

/**
 * Custom Hook para cargar y manejar la lista de usuarios.
 * @returns {{ users: UserFrontend[]; isLoading: boolean }}
 */
export function useUsers() {
  const [users, setUsers] = useState<PaginatedUsersResponse>({ items: [], total_count: 0, total_pages: 0, current_page: 0 });
  const [isLoading, setIsLoading] = useState<boolean>(false);

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
        console.error("Error al cargar usuarios:", error);
    } finally {
        setIsLoading(false);
    }
  }, []);

  useFocusEffect(
      useCallback(() => {
          loadUsersData();
      }, [loadUsersData])
  );

  return { users, isLoading , refetch: loadUsersData};
}
