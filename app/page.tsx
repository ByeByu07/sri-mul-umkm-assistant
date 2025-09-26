'use client';

import {
  Conversation,
  ConversationContent,
  ConversationScrollButton,
} from '@/components/ai-elements/conversation';
import { Message, MessageContent } from '@/components/ai-elements/message';
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
  PromptInputModelSelect,
  PromptInputModelSelectContent,
  PromptInputModelSelectItem,
  PromptInputModelSelectTrigger,
  PromptInputModelSelectValue,
  PromptInputSubmit,
  PromptInputTextarea,
  PromptInputToolbar,
  PromptInputTools,
} from '@/components/ai-elements/prompt-input';
import {
  Actions
  // ActionsTrigger,
  // ActionsContent,
} from '@/components/ai-elements/actions';
import { Fragment, useState } from 'react';
import React from 'react';
import { useChat } from '@ai-sdk/react';
import { Response } from '@/components/ai-elements/response';
import {
  GlobeIcon,
  MicIcon,
  Package,
  BarChart3,
  ShoppingCart,
  TrendingUp,
  Plus,
  Search,
  Menu,
  MessageCircle,
  Package2
} from 'lucide-react';
import {
  Source,
  Sources,
  SourcesContent,
  SourcesTrigger,
} from '@/components/ai-elements/sources';
import {
  Reasoning,
  ReasoningContent,
  ReasoningTrigger,
} from '@/components/ai-elements/reasoning';
import { Loader } from '@/components/ai-elements/loader';
import { Suggestion, Suggestions } from '@/components/ai-elements/suggestion';
import { authClient } from '@/lib/auth-client';
import { useRouter } from 'next/navigation';
import { Ripple } from "@/components/ui/ripple";
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Button } from '@/components/ui/button';
import { SparklesText } from '@/components/ui/sparkles-text';
import {
  Sidebar,
  SidebarContent,
  SidebarGroup,
  SidebarGroupContent,
  SidebarGroupLabel,
  SidebarHeader,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  SidebarProvider,
  SidebarTrigger,
  SidebarInset,
  SidebarFooter,
  SidebarSeparator
} from '@/components/ui/sidebar';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { DotPattern } from '@/components/ui/dot-pattern';
import { cn } from '@/lib/utils';
import { DefaultChatTransport, generateId, ToolUIPart, UIMessage, validateUIMessages } from 'ai';
import { toast } from 'sonner';
import { z } from 'zod';
import { useProductsWithFormattedPrices, useRefreshProducts } from '@/hooks/use-products';
import { RefreshCw } from 'lucide-react';
import { Spinner } from '@/components/ui/shadcn-io/spinner';
import { AddProduct } from '@/components/chatbot-messages/add-product';
import { DeleteProduct } from '@/components/chatbot-messages/delete-product';
import { UpdateProduct } from '@/components/chatbot-messages/update-product';
import { ListProduct } from '@/components/chatbot-messages/list-product';
import { GetDailySales } from '@/components/chatbot-messages/get-daily-sales';
import { GetMonthlySales } from '@/components/chatbot-messages/get-monthly-sales';
import { GetTotalRevenue } from '@/components/chatbot-messages/get-total-revenue';
import { CompareMonthlySales } from '@/components/chatbot-messages/compare-monthly-sales';
import { RecordTransaction } from '@/components/chatbot-messages/record-transaction';
import { ListTransaction } from '@/components/chatbot-messages/list-transaction';
import { CreatePaymentLink } from '@/components/chatbot-messages/create-payment-link';
import { DropdownMenu, DropdownMenuContent, DropdownMenuGroup, DropdownMenuItem, DropdownMenuLabel, DropdownMenuSeparator, DropdownMenuTrigger } from '@/components/ui/dropdown-menu';
import { IconCreditCard, IconLogout, IconNotification, IconUserCircle } from '@tabler/icons-react';
import { AuthModal } from '@/components/auth-modal';
import { CheckPaymentStatus } from '@/components/chatbot-messages/check-payment-status';
import { ToolWrapper } from '@/components/chatbot-messages/tool-wrapper';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { useMicrophone } from '@/hooks/use-microphone';

// New modular components
import { ProductSidebar } from '@/components/sidebar/ProductSidebar';
import { ChatSidebar } from '@/components/sidebar/ChatSidebar';
import { UserProfileDropdown } from '@/components/common/UserProfileDropdown';
import { ConversationArea } from '@/components/chat/ConversationArea';
import { ChatInput } from '@/components/chat/ChatInput';
import { AuthenticationWrapper } from '@/components/auth/AuthenticationWrapper';
import { MobileHeader } from '@/components/common/MobileHeader';
import { useChatHistory } from '@/hooks/use-chat-history';
import { tools } from '@/lib/ai-tools';
import { useUIState } from '@ai-sdk/rsc';

const models = [
  {
    name: 'GPT 4o',
    value: 'openai/gpt-4o',
  },
  {
    name: 'Deepseek R1',
    value: 'deepseek/deepseek-r1',
  },
];

const suggestions = [
  'Kamu bisa ngapain aja',
  'Bisa bantu tambah produk',
  'Bisa bantu list produk',
  'Buatkan link pembayaran untuk produk saya',
  'Penjualan Hari Ini',
  'Penjualan Bulan Ini',
  'Total Pendapatan hingga Hari Ini',
  'Bantu hitung HPP',
];

const sidebarTabs = [
  {
    name: 'Produk',
    value: 'produk',
    icon: Package2
  },
  {
    name: 'Chat',
    value: 'chat',
    icon: MessageCircle
  },
];

const ChatBot = () => {
  const [input, setInput] = useState('');
  const [model, setModel] = useState<string>(models[0].value);
  const [showAuthModal, setShowAuthModal] = useState(false);
  const [activeTab, setActiveTab] = useState('produk');
  const [currentChatId, setCurrentChatId] = useState<string | null>(null);
  const [initialMessages, setInitialMessages] = useState<UIMessage[]>([]);
  const [isCreatingChat, setIsCreatingChat] = useState(false);

  // Initialize useChat with proper messages
  const { messages, sendMessage, status, stop } = useChat({
    transport: new DefaultChatTransport({
      api: '/api/chat',
    }),
    messages: initialMessages,
    id: currentChatId || undefined,
    onFinish: async (message) => {
      // Auto-save is now handled by the API route onFinish callback
      console.log('Chat response completed');
    },
    onError: (error) => {
      toast(error.message);
    }
  });

  const { data: session, isPending } = authClient.useSession();

  // Chat history management
  const {
    chatSessions,
    currentSession,
    isLoading: chatHistoryLoading,
    error: chatHistoryError,
    loadChatSession,
    saveChatSession,
    createNewChat,
    refreshChatSessions,
    deleteChatSession,
    renameTitleChatSession,
    summaryWithAIChatSession,
  } = useChatHistory();

  React.useEffect(() => {
    console.log(messages);
  }, [messages]);

  // TanStack Query hooks
  const refreshProducts = useRefreshProducts();

  // React.useEffect(() => {
  //   (window as any).sendMessage = sendUserMessage;
  //   return () => {
  //     delete (window as any).sendMessage;
  //   };
  // }, []);

  React.useEffect(() => {
    if (!isPending && !session) {
      setShowAuthModal(true);
    } else if (session) {
      setShowAuthModal(false);
    }
  }, [session, isPending]);

  const handleSubmit = async (message: PromptInputMessage) => {
    // Don't allow submission if not authenticated
    if (!session) {
      toast('Please sign in to use the chatbot');
      return;
    }

    const hasText = Boolean(message.text);
    const hasAttachments = Boolean(message.files?.length);

    if (!(hasText || hasAttachments)) {
      return;
    }

    // Prevent multiple chat creations
    if (isCreatingChat) {
      return;
    }

    // Create new chat if none exists
    if (!currentChatId) {
      setIsCreatingChat(true);
      try {
        const newChatId = await handleNewChat();
        if (newChatId) {
          sendUserMessage(message);
        }
      } finally {
        setIsCreatingChat(false);
      }
      return;
    }

    sendUserMessage(message);
  };

  const sendUserMessage = (message: PromptInputMessage) => {
    sendMessage({
      text: message.text || 'Sent with attachments',
      files: message.files,
      metadata: {
        userId: session?.user.id,
      },
    }).catch((error) => {
      toast(error.message);
    }).finally(() => {
      refreshProducts();
    });

    setInput('');
  };

  const handleSuggestionClick = async (suggestion: string) => {
    // Don't allow suggestions if not authenticated
    if (!session) {
      toast('Please sign in to use the chatbot');
      return;
    }

    // Prevent multiple chat creations
    if (isCreatingChat) {
      return;
    }

    // Create new chat if none exists
    if (!currentChatId) {
      setIsCreatingChat(true);
      try {
        const newChatId = await handleNewChat();
        if (newChatId) {
          sendTextMessage(suggestion);
        }
      } finally {
        setIsCreatingChat(false);
      }
      return;
    }

    sendTextMessage(suggestion);
    setInput('');
  };

  const sendTextMessage = (text: string) => {
    sendMessage({
      text: text,
      metadata: {
        userId: session?.user.id,
      },
    }).catch((error) => {
      toast(error.message);
    }).finally(() => {
      refreshProducts();
    });
  };

  const handleNewChat = async (): Promise<string | null> => {
    try {
      const newSession = await createNewChat();
      refreshChatSessions();
      if (newSession) {
        setCurrentChatId(newSession.id);
        // Reset to empty messages for new chat
        setInitialMessages([]);
        return newSession.id;
      }
    } catch (error) {
      console.error('Error creating new chat:', error);
      toast('Failed to create new chat');
    }
    return null;
  };

  const handleRenameChat = async (chatId: string, title: string) => {
    try {
      await renameTitleChatSession(chatId, title);
      refreshChatSessions();
    } catch (error) {
      console.error('Error renaming chat:', error);
      toast('Failed to rename chat');
    }
  };

  const handleSummaryWithAI = async (chatId: string) => {
    try {
      await summaryWithAIChatSession(chatId);
      refreshChatSessions();
    } catch (error) {
      console.error('Error summarizing chat:', error);
      toast('Failed to summarize chat');
    }
  };

  const handleDeleteChat = async (chatId: string) => {
    try {
      await deleteChatSession(chatId);
      refreshChatSessions();
    } catch (error) {
      console.error('Error deleting chat:', error);
      toast('Failed to delete chat');
    }
  };

  const handleChatSelect = async (chatId: string) => {
    setCurrentChatId(chatId);

    const session = await loadChatSession(chatId);
    if (session && session.messages.length > 0) {
      // Set initial messages for useChat to load
      setCurrentChatId(null);
      setInitialMessages([]);
      // console.log('Loaded messages for chat:', chatId, session.messages);

      setTimeout(() => {
        setCurrentChatId(chatId);
        setInitialMessages(session.messages);
      }, 0);
    } else {
      // No messages in this session, start fresh
      setCurrentChatId(chatId);
      setInitialMessages([]);
    }
  };

  const handleSubmitWithChat = (message: any) => {
    handleSubmit(message);
  };

  // Show loading state while checking authentication
  if (isPending) {
    return (
      <div className="flex h-screen w-full items-center justify-center">
        <div className="flex flex-col items-center space-y-4">
          <RefreshCw className="h-8 w-8 animate-spin" />
          <p className="text-muted-foreground">Loading...</p>
        </div>
      </div>
    );
  }

  return (
    <SidebarProvider>
      <AuthenticationWrapper
        session={session}
        showAuthModal={showAuthModal}
        onAuthModalChange={setShowAuthModal}
      >
        <div className="flex h-screen w-full max-w-full overflow-hidden">
          <Sidebar className="flex-shrink-0">
            <SidebarHeader>
              <div className="flex items-center gap-2 p-2 justify-center">
                <h1 className="text-lg font-bold font-[Lilita_One] text-[#fb8500] tracking-widest text-shadow-sm">SRI MUL</h1>
              </div>
            </SidebarHeader>

            <SidebarContent className="overflow-y-auto">
              <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full h-full flex flex-col">
                <div className="px-2 pb-2 flex-shrink-0">
                  <TabsList className="grid w-full grid-cols-2">
                    {sidebarTabs.map(tab => (
                      <TabsTrigger key={tab.value} value={tab.value} className="flex items-center gap-2">
                        <tab.icon className="w-4 h-4" />
                        {tab.name}
                      </TabsTrigger>
                    ))}
                  </TabsList>
                </div>

                <TabsContent value="chat" className="flex-1 flex flex-col min-h-0 mt-0">
                  <ChatSidebar
                    onChatSelect={handleChatSelect}
                    onNewChat={handleNewChat}
                    onDeleteChat={handleDeleteChat}
                    onSummaryWithAI={handleSummaryWithAI}
                    onRenameChat={handleRenameChat}
                    selectedChatId={currentChatId}
                    chatSessions={chatSessions}
                    isLoading={chatHistoryLoading}
                    error={chatHistoryError}
                  />
                </TabsContent>

                <TabsContent value="produk" className="flex-1 flex flex-col min-h-0 mt-0">
                  <ProductSidebar />
                </TabsContent>
              </Tabs>
            </SidebarContent>

            <SidebarFooter className="hidden md:block">
              <UserProfileDropdown session={session} variant="desktop" />
            </SidebarFooter>
          </Sidebar>

          <SidebarInset className="flex flex-col flex-1 min-w-0 overflow-hidden">
            <MobileHeader session={session} />

            <div className="flex-1 flex flex-col min-h-0 overflow-hidden">
              <ConversationArea
                messages={messages}
                status={status === 'streaming' ? 'in_progress' : 'awaiting_message'}
              />

              <ChatInput
                onSubmit={handleSubmitWithChat}
                onSuggestionClick={handleSuggestionClick}
                input={input}
                setInput={setInput}
                session={session}
                status={status === 'streaming' ? 'in_progress' : 'awaiting_message'}
                suggestions={suggestions}
              />
            </div>
          </SidebarInset>
        </div>
      </AuthenticationWrapper>
    </SidebarProvider>
  );
};

export default ChatBot;