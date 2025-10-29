import { useEffect, useState } from "react";

export default function FeedbackScreen({ result }) {
    const [feedback, setFeedback] = useState(null);
    
    useEffect(() => {
        fetch(`/feedback?result=${result}`)
            .then(res => res.json())
            .then(data => setFeedback(data))
            .catch(err => console.error("Error al obtener feedback:", err));
    }, [result]);

    if (!feedback) {
        return <div>Cargando feedback...</div>;
    }

    return (
        <div
        className="flex flex-col justify-center items-center h-screen bg-cover bg-center"
        style={{ backgroundImage: `url(${feedback.url})` }}
        >
        <div className="bg-white bg-opacity-70 rounded-2xl p-6 shadow-lg text-center">
            {/* Cambiar por un mensaje autogenerado o guardar en multimedia frases del estilo ¡Bien Jugado! y cargarlas de la BD */}
            <h2 className="text-2xl font-bold">{feedback.message}</h2>
            <button
            onClick={() => window.location.reload()}
            className="mt-6 bg-blue-600 text-white px-4 py-2 rounded-xl hover:bg-blue-700"
            >
            Jugar de nuevo
            </button>
        </div>
        </div>
    );  

}