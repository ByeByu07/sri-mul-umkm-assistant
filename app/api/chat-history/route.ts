import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@/lib/auth';
import { db } from '@/lib/db';
import { chatSession } from '@/drizzle/schema';
import { eq, desc } from 'drizzle-orm';
import { generateId, validateUIMessages, UIMessage } from 'ai';
import { headers } from 'next/headers';

// GET - Fetch all chat sessions for the user
export async function GET(request: NextRequest) {
  try {
    const session = await auth.api.getSession({
      headers: await headers(),
    });

    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    // Fetch chat sessions with message count from JSON
    const sessions = await db
      .select()
      .from(chatSession)
      .where(eq(chatSession.userId, session.user.id))
      .orderBy(desc(chatSession.updatedAt));

    const formattedSessions = sessions.map(session => {
      const messages: UIMessage[] = JSON.parse(session.messages || '[]');
      return {
        id: session.id,
        title: session.title,
        summary: session.summary,
        createdAt: session.createdAt,
        updatedAt: session.updatedAt,
        _count: {
          messages: messages.length
        }
      };
    });

    return NextResponse.json({ chatSessions: formattedSessions });
  } catch (error) {
    console.error('Error fetching chat sessions:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

// POST - Create a new chat session
export async function POST(request: NextRequest) {
  try {
    const session = await auth.api.getSession({
      headers: await headers(),
    });

    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { title } = await request.json();

    if (!title) {
      return NextResponse.json({ error: 'Title is required' }, { status: 400 });
    }

    // Create new chat session with empty messages array
    const [newChatSession] = await db
      .insert(chatSession)
      .values({
        id: generateId(),
        title,
        userId: session.user.id,
        messages: '[]', // Initialize with empty UIMessage array
      })
      .returning();

    return NextResponse.json({ chatSession: newChatSession });
  } catch (error) {
    console.error('Error creating chat session:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}