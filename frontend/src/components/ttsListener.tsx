import * as Speech from 'expo-speech';


let isSpeaking = false;



export const playTTS = async (message: string, onDoneCallBack?: () => void) => {
  if (!message) return;

  
  if (isSpeaking) {
    Speech.stop();
    isSpeaking = false;
  }
  
  Speech.speak(message, {
    language: 'es-ES',       
    rate: 0.8,               
    pitch: 0.9,              
    onStart: () => {
      isSpeaking = true;
    },
    onDone: () => {
      isSpeaking = false;
      if (onDoneCallBack) {
        onDoneCallBack();
      }
    },
    onStopped: () => {
      isSpeaking = false;
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
  }
};