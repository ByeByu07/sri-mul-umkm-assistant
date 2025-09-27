import { streamText, UIMessage, convertToModelMessages, validateUIMessages } from 'ai';
import { tools } from '@/lib/ai-tools';
import { auth } from '@/lib/auth';
import { db } from '@/lib/db';
import { chatSession } from '@/drizzle/schema';
import { eq, and } from 'drizzle-orm';
import z from 'zod';

// Allow streaming responses up to 30 seconds
export const maxDuration = 30;

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

type Session = typeof auth.$Infer.Session;
type ExperimentalContext = {
  userId: string;
}

export async function POST(req: Request) {
  const {
    messages,
    id,
  }: {
    messages: UIMessage[];
    id?: string;
  } = await req.json();

  const chatId = id;

  const session: Session | null = await auth.api.getSession({ headers: req.headers })

  if (!session?.user?.id) {
    return new Response('Unauthorized', { status: 401 });
  }
  // const metadataSchema = z.object({
  //   userId: z.string()
  // })
  // // Validate incoming messages
  // let validatedMessages: UIMessage[];
  // try {
  //   validatedMessages = await validateUIMessages({ messages, tools, metadataSchema  });
  // } catch (error) {
  //   console.error('Message validation failed:', error);
  //   return new Response('Invalid message format', { status: 400 });
  // }

  // Load previous messages if chatId is provided
  // let previousMessages: UIMessage[] = [];
  // if (chatId) {
  //   try {
  //     const [foundChatSession] = await db
  //       .select()
  //       .from(chatSession)
  //       .where(and(
  //         eq(chatSession.id, chatId),
  //         eq(chatSession.userId, session.user.id)
  //       ))
  //       .limit(1);

  //     if (foundChatSession) {
  //       const rawMessages = JSON.parse(foundChatSession.messages || '[]');
  //       previousMessages = rawMessages;
  //       // Filter out invalid parts that cause validation errors
  //       // previousMessages = rawMessages.map((msg: any) => ({
  //       //   ...msg,
  //       //   parts: msg.parts?.filter((part: any) => {
  //       //     // Only keep valid UI message part types
  //       //     return part.type === 'text' ||
  //       //            part.type === 'tool-call' ||
  //       //            part.type === 'tool-result' ||
  //       //            part.type === 'reasoning' ||
  //       //            part.type === 'source-url' ||
  //       //            part.type === 'source-document' ||
  //       //            part.type === 'file';
  //       //   }) || []
  //       // }));
  //     }
  //   } catch (error) {
  //     console.error('Error loading previous messages:', error);
  //   }
  // }

  // Combine previous messages with new messages (avoid duplicates)
  // const allMessages = [...previousMessages, ...validatedMessages.slice(previousMessages.length)];
  // const allMessages : UIMessage[] = [...previousMessages, ...messages.slice(previousMessages.length)];

  // console.log("allMessages server", allMessages);

  // const allMessagesValidated = await validateUIMessages({
  //   messages: allMessages,
  //   tools,
  //   metadataSchema
  // });

  const result = streamText({
    model: models[0].value,
    messages: convertToModelMessages(messages),
    system:
      `You are a helpful assistant that can answer questions and help with tasks.
        if u are ask what u can do, answer with detail with spesific tool name and description, and the examples too how to use it.
        if user want u to help to calculate cogs (hpp), help them to calculate the requirements based on add product tool, then use the add product tool to add the product.
        if u want to give a formula, just give like a simple text (not latex), because i dont have good template to show the formula.
        u can help user with multiple tools at the sequence.
        `,
    tools,
    experimental_context: {
      userId: session.user.id,
    },
    onFinish: async ({ usage, finishReason, text, toolCalls, toolResults, response }) => {
      // Save complete conversation when AI response finishes
      if (chatId) {
        try {
          // Create the complete conversation including the new AI response
          const aiMessage: UIMessage = {
            id: response.id || `msg-${Date.now()}`,
            role: 'assistant',
            parts: [
              ...toolCalls?.map(tc => ({
                type: 'tool-call' as const,
                toolCallId: tc.toolCallId,
                toolName: tc.toolName,
                args: tc.args
              })) || [],
              ...toolResults?.map(tr => ({
                type: 'tool-result' as const,
                toolCallId: tr.toolCallId,
                toolName: tr.toolName,
                result: tr.output
              })) || [],
              { type: 'text', text }
            ]
          };

          const finalMessages = [...messages, aiMessage];

          // Save to database
          await db
            .update(chatSession)
            .set({
              messages: JSON.stringify(finalMessages),
              updatedAt: new Date(),
            })
            .where(and(
              eq(chatSession.id, chatId),
              eq(chatSession.userId, session.user.id)
            ));

          console.log(`Saved conversation for chat ${chatId} with ${finalMessages.length} messages`);
        } catch (error) {
          console.error('Error saving conversation:', error);
        }
      }
    },
    onError: async (error) => {
      console.error('Error streaming response:', error);
    }
  });

  // send sources and reasoning back to the client
  return result.toUIMessageStreamResponse({
    originalMessages: messages,
    // sendSources: true,
    // sendReasoning: true,
  });
}