import { NextResponse } from 'next/server';
import { db } from '@/lib/db';
import { product } from '@/drizzle/schema';
import { eq } from 'drizzle-orm';
import { auth } from '@/lib/auth';

export async function GET(req: Request) {
  try {
    // Get session similar to chat route
    const session = await auth.api.getSession({ headers: req.headers });

    if (!session?.user.id) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      );
    }

    const products = await db
      .select()
      .from(product)
      .where(eq(product.userId, session.user.id))
      .orderBy(product.createdAt);

    return NextResponse.json({
      success: true,
      data: products,
    });
  } catch (error) {
    console.error('Error fetching products:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}