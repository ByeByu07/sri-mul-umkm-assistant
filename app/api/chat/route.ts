import { streamText, UIMessage, convertToModelMessages } from 'ai';
import { tools } from '@/lib/ai-tools';
import { auth } from '@/lib/auth';

// Allow streaming responses up to 30 seconds
export const maxDuration = 30;

type Session = typeof auth.$Infer.Session;
type ExperimentalContext = {
  userId: string;
}

export async function POST(req: Request) {
  const {
    messages,
    model,
  }: { 
    messages: UIMessage[]; 
    model: string; 
  } = await req.json();

  const session: Session | null = await auth.api.getSession({ headers: req.headers })

  console.info('user id: ' + session?.user.id)

  const result = streamText({
    model: model,
    messages: convertToModelMessages(messages),
    system:
      `You are a helpful assistant that can answer questions and help with tasks.
        if u are ask what u can do, answer with detail with spesific tool name and description
      `,
    tools,
    experimental_context: {
      userId: session?.user.id,
    },
  });

  // send sources and reasoning back to the client
  return result.toUIMessageStreamResponse({
    originalMessages: messages,
    sendSources: true,
    sendReasoning: true,
  });
}