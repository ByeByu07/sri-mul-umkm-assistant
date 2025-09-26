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
import { ToolUIPart } from 'ai';
import { toast } from 'sonner';
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
]

const toolConfig = {
  'tool-addProduct': { text: 'tambah produk...', component: AddProduct },
  'tool-deleteProduct': { text: 'hapus produk...', component: DeleteProduct },
  'tool-updateProduct': { text: 'update produk...', component: UpdateProduct },
  'tool-listProduct': { text: 'list produk...', component: ListProduct, props: { data: 'output' } },
  'tool-getDailySales': { text: 'list penjualan...', component: GetDailySales },
  'tool-getMonthlySales': { text: 'list penjualan bulanan...', component: GetMonthlySales },
  'tool-getTotalRevenue': { text: 'total penjualan...', component: GetTotalRevenue },
  'tool-recordTransaction': { text: 'record transaksi...', component: RecordTransaction },
  'tool-listTransaction': { text: 'list transaksi...', component: ListTransaction },
  'tool-compareMonthlySales': { text: 'perbandingan penjualan...', component: CompareMonthlySales },
  'tool-createPaymentLink': { text: 'membuat link pembayaran...', component: CreatePaymentLink },
  'tool-checkPaymentStatus': { text: 'status pembayaran...', component: CheckPaymentStatus }
};

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
  const [searchTerm, setSearchTerm] = useState('');
  const [showAuthModal, setShowAuthModal] = useState(false);
  const [activeTab, setActiveTab] = useState('produk');
  const { messages, sendMessage, status, error } = useChat();
  const { data: session, isPending } = authClient.useSession();

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

  // TanStack Query hooks
  const { data: products, isLoading, isError, error: productsError } = useProductsWithFormattedPrices();
  const refreshProducts = useRefreshProducts();

  React.useEffect(() => {
    (window as any).sendMessage = sendMessage;
    return () => {
      delete (window as any).sendMessage;
    };
  }, []);

  React.useEffect(() => {
    if (!isPending && !session) {
      setShowAuthModal(true);
    } else if (session) {
      setShowAuthModal(false);
    }
  }, [session, isPending]);

  const handleSubmit = (message: PromptInputMessage) => {
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

    sendMessage(
      {
        text: message.text || 'Sent with attachments',
        files: message.files,
        metadata: {
          userId: session?.user.id,
        },
      },
      {
        body: {
          model: model,
        },
      },
    ).catch((error) => {
      toast(error.message);
    }).finally(() => {
      refreshProducts();
    });

    setInput('');
  };

  const handleSuggestionClick = (suggestion: string) => {
    // Don't allow suggestions if not authenticated
    if (!session) {
      toast('Please sign in to use the chatbot');
      return;
    }

    sendMessage({ text: suggestion }, {
      body: {
        model: model,
      },
    }).catch((error) => {
      toast(error.message);
    }).finally(() => {
      refreshProducts();
    });

    setInput('');
  };

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('id-ID', {
      style: 'currency',
      currency: 'IDR',
      minimumFractionDigits: 0,
    }).format(amount);
  };

  // Filter products based on search term
  const filteredProducts = (products || []).filter(product =>
    product.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    product.category?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const handleSignOut = async () => {
    await authClient.signOut();
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
      <div className="flex h-screen w-full max-w-full overflow-hidden">
        {/* Auth Modal - shows when user is not authenticated */}
        <AuthModal
          open={showAuthModal}
          onOpenChange={(open) => {
            // Prevent closing modal when user is not authenticated
            if (!session) {
              return;
            }
            setShowAuthModal(open);
          }}
        />

        {/* Overlay to disable interaction when not authenticated */}
        {!session && (
          <div className="absolute inset-0 bg-black/20 backdrop-blur-sm z-40 pointer-events-all" />
        )}

        <Sidebar className="flex-shrink-0">
          <SidebarHeader>
            <div className="flex items-center gap-2 p-2 justify-center">
              <h1 className="text-lg font-bold font-[Lilita_One] text-[#fb8500] tracking-widest text-shadow-sm">Sri Mul</h1>
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
                <SidebarGroup className="flex-1 flex flex-col min-h-0">
                  <SidebarGroupLabel>Histori Percakapan</SidebarGroupLabel>
                  <SidebarGroupContent className="flex-1 flex flex-col min-h-0">
                    <div className="space-y-2 px-2 flex-1 min-h-0 overflow-y-auto">
                      <div className="text-center py-8">
                        <MessageCircle className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
                        <p className="text-sm text-muted-foreground">
                          Percakapanmu akan muncul di sini
                        </p>
                        <p className="text-xs text-muted-foreground mt-2">
                          Mulai percakapan untuk melihat sejarah percakapanmu
                        </p>
                      </div>
                    </div>
                  </SidebarGroupContent>
                </SidebarGroup>
              </TabsContent>

              <TabsContent value="produk" className="flex-1 flex flex-col min-h-0 mt-0">
                <SidebarGroup className="flex-1 flex flex-col min-h-0">
                  <SidebarGroupLabel>Produk</SidebarGroupLabel>
                  <SidebarGroupContent className="flex-1 flex flex-col min-h-0">
                    <div className="px-2 pb-2 flex-shrink-0">
                      <Input
                        placeholder="Cari produk..."
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                        className="h-8 w-full"
                      />
                    </div>

                    <div className="space-y-2 px-2 flex-1 min-h-0 overflow-y-auto">
                      {isLoading && (
                        <div className="flex items-center justify-center py-4">
                          <RefreshCw className="h-4 w-4 animate-spin" />
                          <span className="ml-2 text-sm text-muted-foreground">Loading products...</span>
                        </div>
                      )}

                      {isError && (
                        <div className="text-center py-4">
                          <p className="text-sm text-red-600">Failed to load products</p>
                          <Button
                            size="sm"
                            variant="outline"
                            className="mt-2"
                            onClick={refreshProducts}
                          >
                            <RefreshCw className="h-3 w-3 mr-1" />
                            Retry
                          </Button>
                        </div>
                      )}

                      {!isLoading && !isError && filteredProducts.length === 0 && (
                        <div className="text-center py-4">
                          <p className="text-sm text-muted-foreground">
                            {searchTerm ? 'No products found' : 'No products yet'}
                          </p>
                        </div>
                      )}

                      {filteredProducts.map((product) => (
                        <Card key={product.id} className="p-3 w-full">
                          <div className="space-y-2">
                            <div className="flex items-center justify-between">
                              <h4 className="text-sm font-medium line-clamp-1 flex-1 min-w-0">{product.name}</h4>
                              <Badge
                                variant={product.isLowStock ? "destructive" : "secondary"}
                                className="text-xs flex-shrink-0 ml-2"
                              >
                                {product.currentStock || 0}
                              </Badge>
                            </div>
                            <p className="text-xs text-muted-foreground line-clamp-2">{product.description}</p>
                            <div className="flex items-center justify-between">
                              <span className="text-xs font-medium truncate flex-1 min-w-0">{product.formattedSellingPrice}</span>
                              <Badge variant="outline" className="text-xs flex-shrink-0 ml-2">{product.category}</Badge>
                            </div>
                            {product.isLowStock && (
                              <p className="text-xs text-red-600">Stok rendah!</p>
                            )}
                          </div>
                        </Card>
                      ))}
                    </div>
                  </SidebarGroupContent>
                </SidebarGroup>
              </TabsContent>
            </Tabs>
          </SidebarContent>
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <SidebarFooter className="hidden md:block">
                <div className="flex items-center gap-2 p-2 overflow-hidden">
                  <Avatar className="w-8 h-8 flex-shrink-0">
                    <AvatarImage src={session?.user?.image || 'https://github.com/shadcn.png'} alt={session?.user?.name || 'User'} />
                    <AvatarFallback>CN</AvatarFallback>
                  </Avatar>
                  <div className="flex-1 text-sm min-w-0">
                    <p className="font-medium truncate">{session?.user?.name}</p>
                    <p className="text-xs text-muted-foreground truncate">{session?.user?.email}</p>
                  </div>
                </div>
              </SidebarFooter>
            </DropdownMenuTrigger>
            <DropdownMenuContent
              className="w-56 rounded-lg"
              side="right"
              align="end"
              sideOffset={4}
            >
              <DropdownMenuLabel className="p-0 font-normal">
                <div className="flex items-center gap-2 px-1 py-1.5 text-left text-sm">
                  <Avatar className="h-8 w-8 rounded-lg">
                    <AvatarImage src={session?.user?.image || 'https://github.com/shadcn.png'} alt={session?.user?.name || 'User'} />
                    <AvatarFallback className="rounded-lg">CN</AvatarFallback>
                  </Avatar>
                  <div className="grid flex-1 text-left text-sm leading-tight min-w-0">
                    <span className="truncate font-medium">{session?.user?.name || 'User'}</span>
                    <span className="text-muted-foreground truncate text-xs">
                      {session?.user?.email || 'user@example.com'}
                    </span>
                  </div>
                </div>
              </DropdownMenuLabel>
              <DropdownMenuSeparator />
              <DropdownMenuGroup>
                {/* <DropdownMenuItem>
                  <IconUserCircle />
                  Account
                </DropdownMenuItem>
                <DropdownMenuItem>
                  <IconCreditCard />
                  Billing
                </DropdownMenuItem> */}
                {/* <DropdownMenuItem>
                  <IconNotification />
                  Notifications
                </DropdownMenuItem> */}
              </DropdownMenuGroup>
              {/* <DropdownMenuSeparator /> */}
              <DropdownMenuItem onClick={handleSignOut}>
                <IconLogout />
                Keluar
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </Sidebar>

        <SidebarInset className="flex flex-col flex-1 min-w-0 overflow-hidden">
          {/* Header with sidebar trigger for mobile */}
          <header className="flex h-16 md:h-0 items-center gap-4 px-4 flex-shrink-0">
            <SidebarTrigger className="md:hidden" />
            <p className="text-xl font-semibold md:hidden truncate font-[Lilita_One] text-shadow-sm tracking-widest text-[#fb8500]">Sri Mul</p>
            <div className="flex-1" />
            {/* Mobile avatar in bottom left area */}
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <div className="md:hidden fixed top-4 right-4 z-50">
                  <Avatar className="w-10 h-10 border-2 border-white shadow-lg">
                    <AvatarImage src={session?.user?.image || 'https://github.com/shadcn.png'} />
                    <AvatarFallback>CN</AvatarFallback>
                  </Avatar>
                </div>
              </DropdownMenuTrigger>
              <DropdownMenuContent>
                <DropdownMenuLabel>
                <div className="flex items-center gap-2 px-1 py-1.5 text-left text-sm">
                  <Avatar className="h-8 w-8 rounded-lg">
                    <AvatarImage src={session?.user?.image || 'https://github.com/shadcn.png'} alt={session?.user?.name || 'User'} />
                    <AvatarFallback className="rounded-lg">CN</AvatarFallback>
                  </Avatar>
                  <div className="grid flex-1 text-left text-sm leading-tight min-w-0">
                    <span className="truncate font-medium">{session?.user?.name || 'User'}</span>
                    <span className="text-muted-foreground truncate text-xs">
                      {session?.user?.email || 'user@example.com'}
                    </span>
                  </div>
                </div>
                </DropdownMenuLabel>
                <DropdownMenuSeparator />
                <DropdownMenuGroup>
                  {/* <DropdownMenuItem>
                  <IconUserCircle />
                  Account
                </DropdownMenuItem>
                <DropdownMenuItem>
                  <IconCreditCard />
                  Billing
                </DropdownMenuItem> */}
                  {/* <DropdownMenuItem>
                  <IconNotification />
                  Notifications
                </DropdownMenuItem> */}
                </DropdownMenuGroup>
                {/* <DropdownMenuSeparator /> */}
                <DropdownMenuItem onClick={handleSignOut}>
                  <IconLogout />
                  Keluar
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </header>

          <div className="flex-1 flex flex-col min-h-0 overflow-hidden">
            <Conversation className="flex-1 min-h-0 overflow-hidden z-2">
              <ConversationContent className="px-4 overflow-y-auto">
                {messages.length === 0 && (
                  <div className="flex flex-col items-center justify-center text-center py-8 absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2">
                    <MessageCircle className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
                    <h2 className="text-lg font-semibold text-center mb-2">Halo, dengan <span className="text-lg text-[#fb8500] font-bold font-[Lilita_One] tracking-widest text-shadow-sm">Sri Mul</span> disini</h2>
                    <p className="text-sm text-muted-foreground">
                      Bantu catat produkmu, hitung harga, rekap penjualanmu bahkan berdiskusi dengan Sri Mul
                    </p>
                  </div>
                )}
                {messages.map((message) => (
                  <div key={message.id} className="w-full max-w-full">
                    {message.role === 'assistant' && message.parts.filter((part) => part.type === 'source-url').length > 0 && (
                      <Sources>
                        <SourcesTrigger
                          count={
                            message.parts.filter(
                              (part) => part.type === 'source-url',
                            ).length
                          }
                        />
                        {message.parts.filter((part) => part.type === 'source-url').map((part, i) => (
                          <SourcesContent key={`${message.id}-${i}`}>
                            <Source
                              key={`${message.id}-${i}`}
                              href={part.url}
                              title={part.url}
                            />
                          </SourcesContent>
                        ))}
                      </Sources>
                    )}
                    {message.parts.map((part, i) => {
                      switch (part.type) {
                        case 'text':
                          return (
                            <Fragment key={`${message.id}-${i}`}>
                              <div className={`w-full flex ${message.role === 'user' ? 'justify-end' : 'justify-start'}`}>
                                <Message
                                  from={message.role}
                                  className={`w-fit max-w-[80%] ${message.role === 'user'
                                    ? 'text-white ml-auto'
                                    : 'bg-gray-100 text-gray-900 mr-auto'
                                    }`}
                                >
                                  <MessageContent className="w-full max-w-full overflow-hidden">
                                    <Response className="w-full max-w-full break-words">
                                      {part.text}
                                    </Response>
                                  </MessageContent>
                                </Message>
                              </div>
                              {message.role === 'assistant' && i === messages.length - 1 && (
                                <Actions className="mt-2" />
                              )}
                            </Fragment>
                          );

                        case 'reasoning':
                          return (
                            <div key={`${message.id}-${i}`} className="w-full flex justify-start">
                              <Reasoning
                                className="w-full max-w-[80%] mr-auto"
                                isStreaming={status === 'streaming' && i === message.parts.length - 1 && message.id === messages.at(-1)?.id}
                              >
                                <ReasoningTrigger />
                                <ReasoningContent className="break-words">{part.text}</ReasoningContent>
                              </Reasoning>
                            </div>
                          );

                        default:
                          // Handle all tools with one case!
                          if (toolConfig[part.type]) {
                            const config = toolConfig[part.type];
                            const outputProps = config.props?.data === 'output' ? { data: part.output } : {};

                            return (
                              <ToolWrapper
                                key={i}
                                part={part}
                                index={i}
                                loadingText={config.text}
                                OutputComponent={config.component}
                                outputProps={outputProps}
                              />
                            );
                          }
                          return null;
                      }
                    })}
                  </div>
                ))}
                {status === 'submitted' && <Loader />}
              </ConversationContent>
              <ConversationScrollButton />
            </Conversation>

            <div className="flex-shrink-0 bg-background border-t p-4 space-y-3">
              <div className="overflow-x-auto">
                <Suggestions className="mb-0">
                  {suggestions.map((suggestion) => (
                    <Suggestion
                      key={suggestion}
                      onClick={handleSuggestionClick}
                      suggestion={suggestion}
                      className="text-xs sm:text-sm whitespace-nowrap flex-shrink-0"
                    />
                  ))}
                </Suggestions>
              </div>
              <PromptInput onSubmit={handleSubmit} globalDrop multiple className="w-full">
                <PromptInputBody className="w-full">
                  <PromptInputAttachments>
                    {(attachment) => <PromptInputAttachment data={attachment} />}
                  </PromptInputAttachments>
                  <PromptInputTextarea
                    placeholder={isRecording ? 'Listening...' : 'Mau buat catatan keuangan apa hari ini?'}
                    onChange={(e) => setInput(e.target.value)}
                    value={input}
                    className="w-full resize-none"
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
                <PromptInputToolbar className="flex-wrap gap-2 w-full">
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
          </div>
        </SidebarInset>
      </div>
    </SidebarProvider>
  );
};

export default ChatBot;