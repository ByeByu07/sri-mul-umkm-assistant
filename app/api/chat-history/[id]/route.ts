import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@/lib/auth';
import { db } from '@/lib/db';
import { chatSession } from '@/drizzle/schema';
import { eq, and } from 'drizzle-orm';
import { generateId, validateUIMessages, UIMessage } from 'ai';
import { headers } from 'next/headers';
import Replicate from "replicate";

// GET - Fetch specific chat session with messages
export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const _params = await params;
    const id = _params.id;
    const session = await auth.api.getSession({
      headers: await headers(),
    });

    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    // Get chat session
    const [foundChatSession] = await db
      .select()
      .from(chatSession)
      .where(and(
        eq(chatSession.id, id),
        eq(chatSession.userId, session.user.id)
      ))
      .limit(1);

    if (!foundChatSession) {
      return NextResponse.json({ error: 'Chat session not found' }, { status: 404 });
    }

    // Parse messages from JSON stored in session
    const messages: UIMessage[] = JSON.parse(foundChatSession.messages || '[]');

    const sessionWithMessages = {
      ...foundChatSession,
      messages
    };

    return NextResponse.json({ chatSession: sessionWithMessages });
  } catch (error) {
    console.error('Error fetching chat session:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

// PUT - Update chat session (save messages)
export async function PUT(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const _params = await params;
    const id = _params.id;
    const session = await auth.api.getSession({
      headers: await headers(),
    });

    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { messages, title, summary } = await request.json();

    // Verify ownership
    const [foundChatSession] = await db
      .select()
      .from(chatSession)
      .where(and(
        eq(chatSession.id, id),
        eq(chatSession.userId, session.user.id)
      ))
      .limit(1);

    if (!foundChatSession) {
      return NextResponse.json({ error: 'Chat session not found' }, { status: 404 });
    }

    // Validate messages if provided
    let validatedMessages: UIMessage[] = [];
    if (messages && Array.isArray(messages)) {
      try {
        validatedMessages = await validateUIMessages({ messages });
      } catch (error) {
        console.error('Message validation failed:', error);
        return NextResponse.json({ error: 'Invalid message format' }, { status: 400 });
      }
    }

    let summaryResult = "";
    if (summary) {
      const replicate = new Replicate({
        auth: process.env.REPLICATE_API_TOKEN,
      });

      const input = {
        top_p: 0.9,
        prompt: `You are the summary of this chat session: ${foundChatSession.messages}`,
        max_tokens: 512,
        min_tokens: 0,
        temperature: 0.6,
        system_prompt: "You are an expert in summarizing chat sessions.",
        presence_penalty: 0,
        frequency_penalty: 0
      };

      let temp = await replicate.run("ibm-granite/granite-8b-code-instruct-128k", { input });
      // @ts-ignore
      summaryResult = temp.join("");
    }

    // Update chat session with validated messages
    const [updatedSession] = await db
      .update(chatSession)
      .set({
        title: title || foundChatSession.title,
        messages: validatedMessages.length > 0 ? JSON.stringify(validatedMessages) : foundChatSession.messages,
        summary: summaryResult || foundChatSession.summary,
        updatedAt: new Date(),
      })
      .where(eq(chatSession.id, id))
      .returning();

    return NextResponse.json({ chatSession: updatedSession });
  } catch (error) {
    console.error('Error updating chat session:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

// DELETE - Delete chat session
export async function DELETE(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {

    const _params = await params;
    const id = _params.id;

    const session = await auth.api.getSession({
      headers: await headers(),
    });

    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    // Verify ownership
    const [foundChatSession] = await db
      .select()
      .from(chatSession)
      .where(and(
        eq(chatSession.id, id),
        eq(chatSession.userId, session.user.id)
      ))
      .limit(1);

    if (!foundChatSession) {
      return NextResponse.json({ error: 'Chat session not found' }, { status: 404 });
    }

    // Delete chat session (messages are stored in the session itself now)
    await db
      .delete(chatSession)
      .where(eq(chatSession.id, id));

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Error deleting chat session:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}