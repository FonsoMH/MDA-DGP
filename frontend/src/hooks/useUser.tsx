import { useContext } from "react";
import { UserContext } from "../screens/auth/contexts/UserContext";

export function useUser(){
    const context = useContext(UserContext);

    if (!context) {
        throw new Error("useUser must be used within a UserProvider");
    }

    return context;
}