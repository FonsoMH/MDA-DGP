import { useState, useEffect } from "react";
import { fetchUsers } from "../api/userApi";
import { UserFrontend } from "../../types/users";

/**
 * Custom Hook para cargar y manejar la lista de usuarios.
 * @returns {{ users: UserFrontend[]; isLoading: boolean }}
 */
export function useUsers() {
  const [users, setUsers] = useState<UserFrontend[]>([]);
  const [isLoading, setIsLoading] = useState<boolean>(false);

  useEffect(() => {
    const loadUsers = async () => {
      setIsLoading(true);
      const data = await fetchUsers();
      setUsers(data);
      setIsLoading(false);
    };

    loadUsers();
  }, []);

  return { users, isLoading };
}
