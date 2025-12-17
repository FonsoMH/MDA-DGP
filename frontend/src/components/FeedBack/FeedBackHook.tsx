import { useCallback, useEffect, useState } from "react"
import { FeedbackData } from "../../types/feedback"
import { FeedBackApi } from "./FeedBackApi";


export const FeedBackHook = () => {
    const [feedback, setFeedback] = useState<FeedbackData | null>(null);
    const [loading, setLoading] = useState<boolean>(false);


    const getFeedBack= useCallback(async () =>{
        setLoading(true);

        
        const data = await FeedBackApi();
        setFeedback(data);

        setLoading(false);
        
    }, []);

    useEffect(() => {
        getFeedBack();
    }, [getFeedBack])

    return { feedback, loading };
}