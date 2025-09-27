"use client";

import { useState, useEffect, useCallback } from 'react';
import { toast } from 'sonner';
import { UIMessage } from 'ai';
import { authClient } from '@/lib/auth-client';

export interface ChatSession {
  id: string;
  title: string;
  summary: string;
  userId: string;
  createdAt: Date;
  updatedAt: Date;
  _count?: {
    messages: number;
  };
}

export interface ChatSessionWithMessages extends ChatSession {
  messages: UIMessage[];
}

interface UseChatHistoryReturn {
  chatSessions: ChatSession[];
  currentSession: ChatSessionWithMessages | null;
  isLoading: boolean;
  error: string | null;
  createNewChat: (title?: string) => Promise<ChatSession | null>;
  loadChatSession: (id: string) => Promise<ChatSessionWithMessages | null>;
  saveChatSession: (id: string, messages: UIMessage[], title?: string) => Promise<boolean>;
  deleteChatSession: (id: string) => Promise<boolean>;
  refreshChatSessions: () => Promise<void>;
  renameTitleChatSession: (id: string, title: string) => Promise<boolean>;
  summaryWithAIChatSession: (id: string) => Promise<boolean>;
}

export function useChatHistory(): UseChatHistoryReturn {
  const [chatSessions, setChatSessions] = useState<ChatSession[]>([]);
  const [currentSession, setCurrentSession] = useState<ChatSessionWithMessages | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const { data: session, isPending } = authClient.useSession();

  // Fetch all chat sessions
  const fetchChatSessions = useCallback(async () => {
    try {
      setIsLoading(true);
      setError(null);

      const response = await fetch('/api/chat-history');

      if (!response.ok) {
        throw new Error('Failed to fetch chat sessions');
      }

      const data = await response.json();
      setChatSessions(data.chatSessions || []);
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Terjadi kesalahan yang tidak diketahui';
      setError(errorMessage);

      if (!session) {
        toast(`Gagal memuat riwayat chat. Coba login terlebih dahulu`);
      } else {
        toast(`Gagal memuat riwayat chat: ${errorMessage}`);
      }
    } finally {
      setIsLoading(false);
    }
  }, []);

  // Create a new chat session
  const createNewChat = useCallback(async (title?: string): Promise<ChatSession | null> => {
    try {
      setError(null);

      const chatTitle = title || `Chat Baru ${new Date().toLocaleDateString()}`;

      const response = await fetch('/api/chat-history', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ title: chatTitle }),
      });

      if (!response.ok) {
        throw new Error('Failed to create new chat');
      }

      const data = await response.json();
      const newSession = data.chatSession;

      // Add to local state
      setChatSessions(prev => [newSession, ...prev]);

      // Set as current session with empty messages
      setCurrentSession({
        ...newSession,
        messages: [],
      });

      toast('Chat baru berhasil dibuat');
      return newSession;
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Terjadi kesalahan yang tidak diketahui';
      setError(errorMessage);
      toast(`Gagal membuat chat baru: ${errorMessage}`);
      return null;
    }
  }, []);

  // Load specific chat session with messages
  const loadChatSession = useCallback(async (id: string): Promise<ChatSessionWithMessages | null> => {
    try {
      setIsLoading(true);
      setError(null);

      const response = await fetch(`/api/chat-history/${id}`);

      if (!response.ok) {
        throw new Error('Failed to load chat session');
      }

      const data = await response.json();
      const sessionWithMessages: ChatSessionWithMessages = {
        ...data.chatSession,
        messages: data.chatSession.messages || [],
      };

      setCurrentSession(sessionWithMessages);
      return sessionWithMessages;
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Terjadi kesalahan yang tidak diketahui';
      setError(errorMessage);
      toast(`Gagal memuat chat: ${errorMessage}`);
      return null;
    } finally {
      setIsLoading(false);
    }
  }, []);

  // Save chat session messages
  const saveChatSession = useCallback(async (
    id: string,
    messages: UIMessage[],
    title?: string
  ): Promise<boolean> => {
    try {
      setError(null);

      const response = await fetch(`/api/chat-history/${id}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ messages, title }),
      });

      if (!response.ok) {
        throw new Error('Failed to save chat session');
      }

      // Update local state
      if (currentSession && currentSession.id === id) {
        setCurrentSession(prev => prev ? {
          ...prev,
          messages: messages, // Store UIMessages directly
          ...(title && { title }),
        } : null);
      }

      // Update sessions list if title changed
      if (title) {
        setChatSessions(prev => prev.map(session =>
          session.id === id ? { ...session, title } : session
        ));
      }

      return true;
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Terjadi kesalahan yang tidak diketahui';
      setError(errorMessage);
      toast(`Gagal menyimpan chat: ${errorMessage}`);
      return false;
    } finally {
      setIsLoading(false);
    }
  }, [currentSession]);

  // Delete chat session
  const deleteChatSession = useCallback(async (id: string): Promise<boolean> => {
    try {
      setError(null);
      setIsLoading(true);

      const response = await fetch(`/api/chat-history/${id}`, {
        method: 'DELETE',
      });

      if (!response.ok) {
        throw new Error('Failed to delete chat session');
      }

      // Remove from local state
      setChatSessions(prev => prev.filter(session => session.id !== id));

      // Clear current session if it's the deleted one
      if (currentSession?.id === id) {
        setCurrentSession(null);
      }

      toast('Chat berhasil dihapus');
      return true;
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Terjadi kesalahan yang tidak diketahui';
      setError(errorMessage);
      toast(`Gagal menghapus chat: ${errorMessage}`);
      return false;
    } finally {
      setIsLoading(false);
    }
  }, [currentSession]);

  const renameTitleChatSession = useCallback(async (id: string, title: string): Promise<boolean> => {
    try {
      setError(null);
      setIsLoading(true);

      const response = await fetch(`/api/chat-history/${id}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ title }),
      });

      if (!response.ok) {
        throw new Error('Failed to rename chat session');
      }

      // Update local state
      setChatSessions(prev => prev.map(session =>
        session.id === id ? { ...session, title } : session
      ));

      toast('Judul chat berhasil diubah');
      return true;
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Terjadi kesalahan yang tidak diketahui';
      setError(errorMessage);
      toast(`Gagal mengubah judul chat: ${errorMessage}`);
      return false;
    } finally {
      setIsLoading(false);
    }
  }, []);

  const summaryWithAIChatSession = useCallback(async (id: string) => {
    try {
      setIsLoading(true);
      setError(null);

      const response = await fetch(`/api/chat-history/${id}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ summary: true }),
      });

      if (!response.ok) {
        throw new Error('Failed to rename chat session');
      }

      const data = await response.json();

      console.log("Data: ", data);

      // Update local state
      setChatSessions(prev => prev.map(session =>
        session.id === id ? { ...session, summary: data.chatSession.summary } : session
      ));

      toast('Ringkasan dengan AI berhasil dibuat');
      return true;
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Terjadi kesalahan yang tidak diketahui';
      setError(errorMessage);
      toast(`Gagal membuat ringkasan: ${errorMessage}`);
      return false;
    } finally {
      setIsLoading(false);
    }
  }, []);

  // Refresh chat sessions list
  const refreshChatSessions = useCallback(async () => {
    await fetchChatSessions();
  }, [fetchChatSessions]);

  // Load chat sessions on mount
  useEffect(() => {
    fetchChatSessions();
  }, [fetchChatSessions]);

  return {
    chatSessions,
    currentSession,
    isLoading,
    error,
    createNewChat,
    loadChatSession,
    saveChatSession,
    deleteChatSession,
    renameTitleChatSession,
    summaryWithAIChatSession,
    refreshChatSessions,
  };
}