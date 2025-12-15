import { useState, useEffect } from "react";
import { UserDeletionData } from "../../../types/users";
import { fetchuserDeletion } from "../api/userApi";



export const useUserDeletions = () => {
    const [deletions, setDeletions] = useState<UserDeletionData[]>([]);
    const [isLoading, setIsLoading] = useState(true);

    const fetchData = async () => {
        setIsLoading(true);
       
        const response = await fetchuserDeletion();

        setDeletions(response);
    
        setIsLoading(false);
        
    };

    useEffect(() => {
        fetchData();
    }, []);

    return { deletions, isLoading}; 
};