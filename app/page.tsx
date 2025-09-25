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
  Menu
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
  'Penjualan Hari Ini',
  'Penjualan Bulan Ini',
  'Buatkan link pembayaran untuk produk saya',
  'Total Pendapatan hingga Hari Ini',
  'Bantu hitung HPP',
]

const ChatBot = () => {
  const [input, setInput] = useState('');
  const [model, setModel] = useState<string>(models[0].value);
  const [useMicrophone, setUseMicrophone] = useState<boolean>(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [showAuthModal, setShowAuthModal] = useState(false);
  const { messages, sendMessage, status, error } = useChat();
  const { data: session, isPending } = authClient.useSession();

  // TanStack Query hooks
  const { data: products, isLoading, isError, error: productsError } = useProductsWithFormattedPrices();
  const refreshProducts = useRefreshProducts();

  // Manual refresh function for external use
  const handleManualRefresh = async () => {
    await refreshProducts();
  };

  // Expose refresh function globally for debugging/testing
  // React.useEffect(() => {
  //   (window as any).refreshProducts = handleManualRefresh;
  //   return () => {
  //     delete (window as any).refreshProducts;
  //   };
  // }, []);

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
              <SparklesText className="text-lg font-semibold truncate">Sri Mul UMKM</SparklesText>
            </div>
          </SidebarHeader>
          <SidebarContent className="overflow-y-auto">
            {/* <SidebarGroup>
              <SidebarGroupLabel>Menu Utama</SidebarGroupLabel>
              <SidebarGroupContent>
                <SidebarMenu>
                  <SidebarMenuItem>
                    <SidebarMenuButton>
                      <BarChart3 className="w-4 h-4" />
                      <span>Dashboard</span>
                    </SidebarMenuButton>
                  </SidebarMenuItem>
                  <SidebarMenuItem>
                    <SidebarMenuButton isActive>
                      <Package className="w-4 h-4" />
                      <span>Produk</span>
                    </SidebarMenuButton>
                  </SidebarMenuItem>
                  <SidebarMenuItem>
                    <SidebarMenuButton>
                      <ShoppingCart className="w-4 h-4" />
                      <span>Transaksi</span>
                    </SidebarMenuButton>
                  </SidebarMenuItem>
                  <SidebarMenuItem>
                    <SidebarMenuButton>
                      <TrendingUp className="w-4 h-4" />
                      <span>Laporan</span>
                    </SidebarMenuButton>
                  </SidebarMenuItem>
                </SidebarMenu>
              </SidebarGroupContent>
            </SidebarGroup>

            <SidebarSeparator /> */}

            <SidebarGroup className="flex-1 flex flex-col min-h-0">
              <div className="flex items-center justify-between px-2">
                <SidebarGroupLabel>Produk Saya</SidebarGroupLabel>
                <Button
                  size="sm"
                  variant="ghost"
                  className="h-6 w-6 p-0"
                  onClick={refreshProducts}
                  disabled={isLoading}
                >
                  <RefreshCw className={`h-3 w-3 ${isLoading ? 'animate-spin' : ''}`} />
                </Button>
              </div>
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
                Log out
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </Sidebar>

        <SidebarInset className="flex flex-col flex-1 min-w-0 overflow-hidden">
          {/* Header with sidebar trigger for mobile */}
          <header className="flex h-16 md:h-0 items-center gap-4 px-4 flex-shrink-0">
            <SidebarTrigger className="md:hidden" />
            <SparklesText className="text-xl font-semibold md:hidden truncate">Sri Mul UMKM</SparklesText>
            <div className="flex-1" />
            {/* Mobile avatar in bottom left area */}
            <div className="md:hidden fixed bottom-4 left-4 z-50">
              <Avatar className="w-10 h-10 border-2 border-white shadow-lg">
                <AvatarImage src={session?.user?.image || 'https://github.com/shadcn.png'} />
                <AvatarFallback>CN</AvatarFallback>
              </Avatar>
            </div>
          </header>

          <div className="flex-1 flex flex-col min-h-0 overflow-hidden">
            <Conversation className="flex-1 min-h-0 overflow-hidden z-2">
              <Ripple
                className='z-1'
                mainCircleSize={300}
                mainCircleOpacity={0.3}
                numCircles={8}
                circleColor="#10b981"
                borderColor="#059669"
                backgroundColor="#10b981"
                gradient={{
                  from: "#10b981",
                  to: "rgba(16, 185, 129, 0)",
                  direction: "to_bottom"
                }}
              />
              <ConversationContent className="px-4 overflow-y-auto">
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
                              <Message from={message.role} className="w-full max-w-full">
                                <MessageContent className="w-full max-w-full overflow-hidden">
                                  <Response className="w-full max-w-full break-words">
                                    {part.text}
                                  </Response>
                                </MessageContent>
                              </Message>
                              {message.role === 'assistant' && i === messages.length - 1 && (
                                <Actions className="mt-2">
                                </Actions>
                              )}
                            </Fragment>
                          );
                        case 'reasoning':
                          return (
                            <Reasoning
                              key={`${message.id}-${i}`}
                              className="w-full max-w-full"
                              isStreaming={status === 'streaming' && i === message.parts.length - 1 && message.id === messages.at(-1)?.id}
                            >
                              <ReasoningTrigger />
                              <ReasoningContent className="break-words">{part.text}</ReasoningContent>
                            </Reasoning>
                          );
                        case 'tool-addProduct':
                          switch (part.state) {
                            case 'input-available':
                              return <div key={i} className="flex items-center gap-2 w-full"> <Spinner className="text-blue-500" size={64} /> tambah produk...</div>;
                            case 'output-available':
                              return (
                                <div key={i} className="w-full max-w-full">
                                  <AddProduct {...part.output as any} />
                                </div>
                              );
                            case 'output-error':
                              return <div key={i} className="w-full break-words">Error: {part.errorText}</div>;
                            default:
                              return null;
                          }
                        case 'tool-deleteProduct':
                          switch (part.state) {
                            case 'input-available':
                              return <div key={i} className="flex items-center gap-2 w-full"> <Spinner className="text-blue-500" size={64} /> hapus produk...</div>;
                            case 'output-available':
                              return (
                                <div key={i} className="w-full max-w-full">
                                  <DeleteProduct {...part.output as any} />
                                </div>
                              );
                            case 'output-error':
                              return <div key={i} className="w-full break-words">Error: {part.errorText}</div>;
                            default:
                              return null;
                          }
                        case 'tool-updateProduct':
                          switch (part.state) {
                            case 'input-available':
                              return <div key={i} className="flex items-center gap-2 w-full"> <Spinner className="text-blue-500" size={64} /> update produk...</div>;
                            case 'output-available':
                              return (
                                <div key={i} className="w-full max-w-full">
                                  <UpdateProduct {...part.output as any} />
                                </div>
                              );
                            case 'output-error':
                              return <div key={i} className="w-full break-words">Error: {part.errorText}</div>;
                            default:
                              return null;
                          }
                        case 'tool-listProduct':
                          switch (part.state) {
                            case 'input-available':
                              return <div key={i} className="flex items-center gap-2 w-full"> <Spinner className="text-blue-500" size={24} /> list produk...</div>;
                            case 'output-available':
                              return (
                                <div key={i} className="w-full max-w-full overflow-x-auto">
                                  <ListProduct data={part.output as any} />
                                </div>
                              );
                            case 'output-error':
                              return <div key={i} className="w-full break-words">Error: {part.errorText}</div>;
                            default:
                              return null;
                          }
                        case 'tool-getDailySales':
                          switch (part.state) {
                            case 'input-available':
                              return <div key={i} className="flex items-center gap-2 w-full"> <Spinner className="text-blue-500" size={24} /> list penjualan...</div>;
                            case 'output-available':
                              return (
                                <div key={i} className="w-full max-w-full overflow-x-auto">
                                  <GetDailySales {...part.output as any} />
                                </div>
                              );
                            case 'output-error':
                              return <div key={i} className="w-full break-words">Error: {part.errorText}</div>;
                            default:
                              return null;
                          }
                        case 'tool-getMonthlySales':
                          switch (part.state) {
                            case 'input-available':
                              return <div key={i} className="flex items-center gap-2 w-full"> <Spinner className="text-blue-500" size={24} /> list penjualan bulanan...</div>;
                            case 'output-available':
                              return (
                                <div key={i} className="w-full max-w-full overflow-x-auto">
                                  <GetMonthlySales {...part.output as any} />
                                </div>
                              );
                            case 'output-error':
                              return <div key={i} className="w-full break-words">Error: {part.errorText}</div>;
                            default:
                              return null;
                          }
                        case 'tool-getTotalRevenue':
                          switch (part.state) {
                            case 'input-available':
                              return <div key={i} className="flex items-center gap-2 w-full"> <Spinner className="text-blue-500" size={24} /> total penjualan...</div>;
                            case 'output-available':
                              return (
                                <div key={i} className="w-full max-w-full overflow-x-auto">
                                  <GetTotalRevenue {...part.output as any} />
                                </div>
                              );
                            case 'output-error':
                              return <div key={i} className="w-full break-words">Error: {part.errorText}</div>;
                            default:
                              return null;
                          }
                        case 'tool-recordTransaction':
                          switch (part.state) {
                            case 'input-available':
                              return <div key={i} className="flex items-center gap-2 w-full"> <Spinner className="text-blue-500" size={24} /> record transaksi...</div>;
                            case 'output-available':
                              return (
                                <div key={i} className="w-full max-w-full overflow-x-auto">
                                  <RecordTransaction {...part.output as any} />
                                </div>
                              );
                            case 'output-error':
                              return <div key={i} className="w-full break-words">Error: {part.errorText}</div>;
                            default:
                              return null;
                          }
                        case 'tool-listTransaction':
                          switch (part.state) {
                            case 'input-available':
                              return <div key={i} className="flex items-center gap-2 w-full"> <Spinner className="text-blue-500" size={24} /> list transaksi...</div>;
                            case 'output-available':
                              return (
                                <div key={i} className="w-full max-w-full overflow-x-auto">
                                  <ListTransaction {...part.output as any} />
                                </div>
                              );
                            case 'output-error':
                              return <div key={i} className="w-full break-words">Error: {part.errorText}</div>;
                            default:
                              return null;
                          }
                        case 'tool-compareMonthlySales':
                          switch (part.state) {
                            case 'input-available':
                              return <div key={i} className="flex items-center gap-2 w-full"> <Spinner className="text-blue-500" size={24} /> perbandingan penjualan...</div>;
                            case 'output-available':
                              return (
                                <div key={i} className="w-full max-w-full overflow-x-auto">
                                  <CompareMonthlySales {...part.output as any} />
                                </div>
                              );
                            case 'output-error':
                              return <div key={i} className="w-full break-words">Error: {part.errorText}</div>;
                            default:
                              return null;
                          }
                        case 'tool-createPaymentLink':
                          switch (part.state) {
                            case 'input-available':
                              return <div key={i} className="flex items-center gap-2 w-full"> <Spinner className="text-blue-500" size={24} /> membuat link pembayaran...</div>;
                            case 'output-available':
                              return (
                                <div key={i} className="w-full max-w-full">
                                  <CreatePaymentLink {...part.output as any} />
                                </div>
                              );
                            case 'output-error':
                              return <div key={i} className="w-full break-words">Error: {part.errorText}</div>;
                            default:
                              return null;
                          }
                        case 'tool-checkPaymentStatus':
                          switch (part.state) {
                            case 'input-available':
                              return <div key={i} className="flex items-center gap-2 w-full"> <Spinner className="text-blue-500" size={24} /> status pembayaran...</div>;
                            case 'output-available':
                              return (
                                <div key={i} className="w-full max-w-full">
                                  <CheckPaymentStatus {...part.output as any} />
                                </div>
                              );
                            case 'output-error':
                              return <div key={i} className="w-full break-words">Error: {part.errorText}</div>;
                            default:
                              return null;
                          }
                        default:
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
                    onChange={(e) => setInput(e.target.value)}
                    value={input}
                    className="w-full resize-none"
                  />
                </PromptInputBody>
                <PromptInputToolbar className="flex-wrap gap-2 w-full">
                  <PromptInputTools className="flex-1 min-w-0">
                    <PromptInputActionMenu>
                      <PromptInputActionMenuTrigger />
                      <PromptInputActionMenuContent>
                        <PromptInputActionAddAttachments />
                      </PromptInputActionMenuContent>
                    </PromptInputActionMenu>
                    <PromptInputButton
                      onClick={() => setUseMicrophone(!useMicrophone)}
                      variant={useMicrophone ? 'default' : 'ghost'}
                      className="p-2"
                    >
                      <MicIcon size={14} className="sm:w-4 sm:h-4" />
                      <span className="sr-only">Microphone</span>
                    </PromptInputButton>
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