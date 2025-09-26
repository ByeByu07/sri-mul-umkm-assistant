"use client";

import { MicIcon } from 'lucide-react';
import {
  PromptInput,
  PromptInputActionAddAttachments,
  PromptInputActionMenu,
  PromptInputActionMenuContent,
  PromptInputActionMenuTrigger,
  PromptInputAttachment,
  PromptInputAttachments,
  PromptInputBody,
  PromptInputButton,
  type PromptInputMessage,
  PromptInputSubmit,
  PromptInputTextarea,
  PromptInputToolbar,
  PromptInputTools,
} from '@/components/ai-elements/prompt-input';
import { Suggestion, Suggestions } from '@/components/ai-elements/suggestion';
import { useMicrophone } from '@/hooks/use-microphone';
import { toast } from 'sonner';

interface UserSession {
  user: {
    id: string;
    name?: string;
    email?: string;
    image?: string;
  };
}

interface ChatInputProps {
  onSubmit: (message: PromptInputMessage) => void;
  onSuggestionClick: (suggestion: string) => void;
  input: string;
  setInput: (value: string) => void;
  session: UserSession | null;
  status: string;
  suggestions?: string[];
  className?: string;
}

const defaultSuggestions = [
  'Kamu bisa ngapain aja',
  'Bisa bantu tambah produk',
  'Bisa bantu list produk',
  'Buatkan link pembayaran untuk produk saya',
  'Penjualan Hari Ini',
  'Penjualan Bulan Ini',
  'Total Pendapatan hingga Hari Ini',
  'Bantu hitung HPP',
];

export function ChatInput({
  onSubmit,
  onSuggestionClick,
  input,
  setInput,
  session,
  status,
  suggestions = defaultSuggestions,
  className
}: ChatInputProps) {
  // Microphone hook
  const {
    isRecording,
    isSupported: isMicSupported,
    transcript,
    startRecording,
    stopRecording,
    resetTranscript,
    error: micError
  } = useMicrophone({
    onTranscriptionComplete: (transcript) => {
      if (transcript.trim()) {
        setInput(prev => prev + (prev ? ' ' : '') + transcript);
        resetTranscript();
      }
    },
    onError: (error) => {
      toast(error);
    },
    language: 'id-ID'
  });

  return (
    <div className={`flex-shrink-0 p-4 space-y-3 bg-transparent ${className}`}>
      <div className="overflow-x-auto">
        <Suggestions className="mb-0">
          {suggestions.map((suggestion) => (
            <Suggestion
              key={suggestion}
              onClick={onSuggestionClick}
              suggestion={suggestion}
              className="text-xs sm:text-sm whitespace-nowrap flex-shrink-0"
            />
          ))}
        </Suggestions>
      </div>

      <PromptInput onSubmit={onSubmit} globalDrop multiple className="w-full bg-transparent">
        <PromptInputBody className="w-full relative bg-transparent">
          <PromptInputAttachments>
            {(attachment) => <PromptInputAttachment data={attachment} />}
          </PromptInputAttachments>
          <PromptInputTextarea
            placeholder={isRecording ? 'Listening...' : 'Mau buat catatan keuangan apa hari ini?'}
            onChange={(e) => setInput(e.target.value)}
            value={input}
            className="w-full resize-none bg-transparent"
            disabled={isRecording}
          />
          {isRecording && (
            <div className="absolute bottom-2 right-2 flex items-center gap-1 text-xs text-red-500">
              <div className="w-2 h-2 bg-red-500 rounded-full animate-pulse" />
              Recording...
            </div>
          )}
          {transcript && (
            <div className="absolute top-0 left-0 right-0 bg-blue-50 border-b text-xs p-2 text-blue-700">
              <span className="font-medium">Transcript:</span> {transcript}
            </div>
          )}
        </PromptInputBody>
        <PromptInputToolbar className="flex-wrap gap-2 w-full bg-transparent">
          <PromptInputTools className="flex-1 min-w-0">
            <PromptInputActionMenu>
              <PromptInputActionMenuTrigger />
              <PromptInputActionMenuContent>
                <PromptInputActionAddAttachments label='Tambah Gambar atau file'/>
              </PromptInputActionMenuContent>
            </PromptInputActionMenu>
            {isMicSupported && (
              <PromptInputButton
                onClick={isRecording ? stopRecording : startRecording}
                variant={isRecording ? 'default' : 'ghost'}
                className={`p-2 ${isRecording ? 'bg-red-500 hover:bg-red-600' : ''}`}
                disabled={!session}
                title={!session ? 'Please sign in to use microphone' : isRecording ? 'Stop recording' : 'Start voice input'}
              >
                <MicIcon size={14} className={`sm:w-4 sm:h-4 ${isRecording ? 'text-white animate-pulse' : ''}`} />
                <span className="sr-only">{isRecording ? 'Stop recording' : 'Start voice input'}</span>
              </PromptInputButton>
            )}
          </PromptInputTools>
          <PromptInputSubmit disabled={!input && !status} status={status} className="ml-2 flex-shrink-0" />
        </PromptInputToolbar>
      </PromptInput>
    </div>
  );
}