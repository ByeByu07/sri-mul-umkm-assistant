"use client";

import { Fragment } from 'react';
import { MessageCircle } from 'lucide-react';
import {
  Conversation,
  ConversationContent,
  ConversationScrollButton,
} from '@/components/ai-elements/conversation';
import { Message, MessageContent } from '@/components/ai-elements/message';
import { Response } from '@/components/ai-elements/response';
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
import { Actions } from '@/components/ai-elements/actions';
import { ToolWrapper } from '@/components/chatbot-messages/tool-wrapper';
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
import { CheckPaymentStatus } from '@/components/chatbot-messages/check-payment-status';

interface ConversationAreaProps {
  messages: any[];
  status: string;
  className?: string;
}

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

export function ConversationArea({ messages, status, className }: ConversationAreaProps) {
  return (
    <Conversation className={`flex-1 min-h-0 overflow-hidden z-2 ${className}`}>
      <ConversationContent className="px-4 overflow-y-auto">
        {messages.length === 0 && (
          <div className="flex flex-col items-center justify-center text-center py-8 absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2">
            <MessageCircle className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
            <h2 className="text-lg font-semibold text-center mb-2">
              Halo, dengan <span className="text-lg text-[#fb8500] font-bold font-[Lilita_One] tracking-widest text-shadow-sm">SRI MUL</span> disini
            </h2>
            <p className="text-sm text-muted-foreground">
              Bantu catat produkmu, hitung harga, rekap penjualanmu bahkan berdiskusi dengan Sri Mul
            </p>
          </div>
        )}

        {messages.map((message) => (
          <div key={message.id} className="w-full max-w-full">
            {message.role === 'assistant' && message.parts.filter((part: any) => part.type === 'source-url').length > 0 && (
              <Sources>
                <SourcesTrigger
                  count={
                    message.parts.filter(
                      (part: any) => part.type === 'source-url',
                    ).length
                  }
                />
                {message.parts.filter((part: any) => part.type === 'source-url').map((part: any, i: number) => (
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

            {message.parts.map((part: any, i: number) => {
              switch (part.type) {
                case 'text':
                  return (
                    <Fragment key={`${message.id}-${i}`}>
                      <div className={`w-full flex ${message.role === 'user' ? 'justify-end' : 'justify-start'}`}>
                        <Message
                          from={message.role}
                          className={`w-fit max-w-[80%] ${message.role === 'user'
                            ? 'text-white ml-auto'
                            : 'bg-gray-100 text-gray-900 mr-auto px-3 rounded-lg'
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

                case 'tool-result':
                  // Handle tool-result type from server
                  const toolResultKey = `tool-${part.toolName}` as keyof typeof toolConfig;
                  if (toolConfig[toolResultKey]) {
                    const config = toolConfig[toolResultKey];
                    const outputProps = config.props?.data === 'output' ? { data: part.result } : {};

                    return (
                      <ToolWrapper
                        key={`${message.id}-${i}`}
                        part={{
                          ...part,
                          type: toolResultKey,
                          output: part.result,
                          state: 'output-available'
                        }}
                        index={i}
                        loadingText={config.text}
                        OutputComponent={config.component}
                        outputProps={outputProps}
                      />
                    );
                  }
                  return null;

                case 'tool-call':
                  // Handle tool-call type (show loading state)
                  const toolCallKey = `tool-${part.toolName}` as keyof typeof toolConfig;
                  if (toolConfig[toolCallKey]) {
                    const config = toolConfig[toolCallKey];

                    return (
                      <ToolWrapper
                        key={`${message.id}-${i}`}
                        part={{
                          ...part,
                          type: toolCallKey,
                          state: 'input-streaming'
                        }}
                        index={i}
                        loadingText={config.text}
                        OutputComponent={config.component}
                        outputProps={{}}
                      />
                    );
                  }
                  return null;

                default:
                  // Handle all tools with one case!
                  if (toolConfig[part.type as keyof typeof toolConfig]) {
                    const config = toolConfig[part.type as keyof typeof toolConfig];
                    const outputProps = config.props?.data === 'output' ? { data: part.output } : {};

                    return (
                      <ToolWrapper
                        key={`${message.id}-${i}`}
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
  );
}