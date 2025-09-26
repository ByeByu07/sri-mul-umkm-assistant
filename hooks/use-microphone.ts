"use client";

import { useState, useRef, useCallback, useEffect } from 'react';

interface UseMicrophoneOptions {
  onTranscriptionComplete?: (transcript: string) => void;
  onError?: (error: string) => void;
  language?: string;
}

interface UseMicrophoneReturn {
  isRecording: boolean;
  isSupported: boolean;
  transcript: string;
  startRecording: () => void;
  stopRecording: () => void;
  resetTranscript: () => void;
  error: string | null;
}

export function useMicrophone({
  onTranscriptionComplete,
  onError,
  language = 'id-ID'
}: UseMicrophoneOptions = {}): UseMicrophoneReturn {
  const [isRecording, setIsRecording] = useState(false);
  const [isSupported, setIsSupported] = useState(false);
  const [transcript, setTranscript] = useState('');
  const [error, setError] = useState<string | null>(null);

  const recognitionRef = useRef<SpeechRecognition | null>(null);
  const timeoutRef = useRef<NodeJS.Timeout | null>(null);

  // Check if browser supports speech recognition
  useEffect(() => {
    if (typeof window !== 'undefined') {
      const SpeechRecognition =
        window.SpeechRecognition ||
        (window as any).webkitSpeechRecognition;

      if (SpeechRecognition) {
        setIsSupported(true);
        recognitionRef.current = new SpeechRecognition();

        const recognition = recognitionRef.current;
        recognition.continuous = true;
        recognition.interimResults = true;
        recognition.lang = language;
        recognition.maxAlternatives = 1;

        // Handle speech recognition results
        recognition.onresult = (event) => {
          let finalTranscript = '';
          let interimTranscript = '';

          for (let i = event.resultIndex; i < event.results.length; i++) {
            const result = event.results[i];
            const transcriptPart = result[0].transcript;

            if (result.isFinal) {
              finalTranscript += transcriptPart;
            } else {
              interimTranscript += transcriptPart;
            }
          }

          const fullTranscript = finalTranscript || interimTranscript;
          setTranscript(fullTranscript);

          // Clear existing timeout
          if (timeoutRef.current) {
            clearTimeout(timeoutRef.current);
          }

          // Set timeout to stop recording after 3 seconds of silence
          if (finalTranscript) {
            timeoutRef.current = setTimeout(() => {
              stopRecording();
              onTranscriptionComplete?.(finalTranscript.trim());
            }, 1500);
          }
        };

        // Handle errors
        recognition.onerror = (event) => {
          let errorMessage = 'Speech recognition error';

          switch (event.error) {
            case 'no-speech':
              errorMessage = 'No speech detected. Please try again.';
              break;
            case 'audio-capture':
              errorMessage = 'Audio capture failed. Please check your microphone.';
              break;
            case 'not-allowed':
              errorMessage = 'Microphone access denied. Please allow microphone permissions.';
              break;
            case 'network':
              errorMessage = 'Network error. Please check your internet connection.';
              break;
            case 'service-not-allowed':
              errorMessage = 'Speech recognition service not allowed.';
              break;
            default:
              errorMessage = `Speech recognition error: ${event.error}`;
          }

          setError(errorMessage);
          onError?.(errorMessage);
          setIsRecording(false);
        };

        // Handle end of recognition
        recognition.onend = () => {
          setIsRecording(false);
          if (timeoutRef.current) {
            clearTimeout(timeoutRef.current);
          }
        };

        // Handle start of recognition
        recognition.onstart = () => {
          setError(null);
        };
      } else {
        setIsSupported(false);
        setError('Speech recognition is not supported in this browser.');
      }
    }

    return () => {
      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current);
      }
    };
  }, [language, onTranscriptionComplete, onError]);

  const startRecording = useCallback(() => {
    if (!isSupported || !recognitionRef.current) {
      setError('Speech recognition is not supported.');
      onError?.('Speech recognition is not supported.');
      return;
    }

    if (isRecording) {
      return;
    }

    try {
      setError(null);
      setTranscript('');
      recognitionRef.current.start();
      setIsRecording(true);
    } catch (err) {
      const errorMessage = 'Failed to start speech recognition.';
      setError(errorMessage);
      onError?.(errorMessage);
    }
  }, [isSupported, isRecording, onError]);

  const stopRecording = useCallback(() => {
    if (recognitionRef.current && isRecording) {
      recognitionRef.current.stop();
      setIsRecording(false);

      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current);
      }
    }
  }, [isRecording]);

  const resetTranscript = useCallback(() => {
    setTranscript('');
    setError(null);
  }, []);

  return {
    isRecording,
    isSupported,
    transcript,
    startRecording,
    stopRecording,
    resetTranscript,
    error
  };
}