import { useState, useCallback, useRef } from 'react';
import { useJarvisStore } from '../store/useJarvisStore';

export function useVoiceManager() {
  const { sendMessage, isListening, setIsListening, isSpeaking, setIsSpeaking } = useJarvisStore();
  const recognitionRef = useRef<any>(null);

  const startListening = useCallback(() => {
    if (!('webkitSpeechRecognition' in window)) {
      console.warn('Speech recognition not supported');
      return;
    }

    const SpeechRecognition = (window as any).webkitSpeechRecognition;
    recognitionRef.current = new SpeechRecognition();
    recognitionRef.current.continuous = true;
    recognitionRef.current.interimResults = true;

    recognitionRef.current.onstart = () => setIsListening(true);
    recognitionRef.current.onend = () => setIsListening(false);

    recognitionRef.current.onresult = (event: any) => {
      const isFinal = event.results[event.results.length - 1].isFinal;
      const transcript = event.results[event.results.length - 1][0].transcript;
      
      if (isFinal) {
        console.log('Final Transcript:', transcript);
        sendMessage(transcript);
      }
    };

    recognitionRef.current.start();
  }, []);

  const stopListening = useCallback(() => {
    recognitionRef.current?.stop();
  }, []);

  const speak = useCallback((text: string) => {
    const utterance = new SpeechSynthesisUtterance(text);
    utterance.onstart = () => setIsSpeaking(true);
    utterance.onend = () => setIsSpeaking(false);
    
    // Premium voice settings
    utterance.rate = 1.0;
    utterance.pitch = 1.0;
    
    window.speechSynthesis.speak(utterance);
  }, []);

  return {
    isListening,
    isSpeaking,
    startListening,
    stopListening,
    speak,
  };
}
