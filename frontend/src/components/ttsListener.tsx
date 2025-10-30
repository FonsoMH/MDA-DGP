import * as Speech from 'expo-speech';


let isSpeaking = false;


export const initializeTtsListeners = async () => {
  console.log('Expo Speech inicializado ✅');
  
};


export const playTTS = async (message: string) => {
  if (!message) return;

  
  if (isSpeaking) {
    Speech.stop();
    isSpeaking = false;
  }

  console.log('TTS reproducirá:', message);

  
  Speech.speak(message, {
    language: 'es-ES',       
    rate: 0.8,               
    pitch: 0.9,              
    onStart: () => {
      isSpeaking = true;
      console.log('🗣️ TTS empezó');
    },
    onDone: () => {
      isSpeaking = false;
      console.log('✅ TTS terminó');
    },
    onStopped: () => {
      isSpeaking = false;
      console.log('⏹️ TTS detenido');
    },
    onError: (error) => {
      isSpeaking = false;
      console.error('❌ Error en TTS:', error);
    },
  });
};


export const stopTTS = () => {
  if (isSpeaking) {
    Speech.stop();
    isSpeaking = false;
    console.log('🛑 TTS detenido manualmente');
  }
};
