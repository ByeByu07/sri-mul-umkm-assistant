import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db';
import { midtransTransaction, product, user } from '@/drizzle/schema';
import { eq } from 'drizzle-orm';
import { auth } from '@/lib/auth';
import * as MidtransClient from "midtrans-client";
import { headers } from "next/headers";

type Session = typeof auth.$Infer.Session

export async function POST(request: NextRequest) {
  try {
    // const session : Session | null = await auth.api.getSession({
    //   headers: await headers(),
    // });

    // if (!session || !session.user) {
    //   return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    // }

    const userId = request.headers.get('x-user-id') || '';
    const _user = await db.select().from(user).where(eq(user.id, userId));
    const userEmail = _user[0].email;
    const username = _user[0].name;

    const body = await request.json();
    const { type, name, price, quantity = 1, description, notes } = body;

    let finalPrice = price;
    let productId: string | null = null;
    let unitPrice = price;

    // Setup Midtrans client
    const isProduction = process.env.NODE_ENV === "production";
    const serverKey = isProduction
        ? process.env.MIDTRANS_SERVER_KEY
        : process.env.MIDTRANS_SANDBOX_SERVER_KEY;
    const clientKey = isProduction
        ? process.env.MIDTRANS_CLIENT_KEY
        : process.env.MIDTRANS_SANDBOX_CLIENT_KEY;

    if (!serverKey || !clientKey) {
        console.error("Missing Midtrans configuration");
        return NextResponse.json(
            { success: false, error: "Payment service configuration error" },
            { status: 500 }
        );
    }

    const midtransClient = new MidtransClient.Snap({
        isProduction,
        serverKey,
        clientKey,
    });

    // If type is product, find the product and get its price
    if (type === 'product') {
      const products = await db.select().from(product).where(eq(product.userId, userId));
      const foundProduct = products.find(p => p.name.toLowerCase() === name.toLowerCase());

      if (!foundProduct) {
        return NextResponse.json({
          success: false,
          error: `Produk "${name}" tidak ditemukan. Silahkan periksa nama produk atau buat produk terlebih dahulu.`
        }, { status: 404 });
      }

      // Check stock if it's a product
      if ((foundProduct.currentStock || 0) < quantity) {
        return NextResponse.json({
          success: false,
          error: `Stok tidak mencukupi. Tersedia: ${foundProduct.currentStock || 0}, Diminta: ${quantity}`
        }, { status: 400 });
      }

      productId = foundProduct.id;
      unitPrice = parseFloat(foundProduct.sellingPrice || '0');
      finalPrice = unitPrice * quantity;
    } else {
      // For transaction type, price is required
      if (!price) {
        return NextResponse.json({
          success: false,
          error: 'Harga diperlukan untuk pembayaran transaksi'
        }, { status: 400 });
      }
      finalPrice = price * quantity;
      unitPrice = price;
    }

    // Generate unique order ID (Midtrans has 50 character limit)
    const timestampShort = Date.now().toString().slice(-8);
    const orderId = `UMKM-${timestampShort}-${Math.random().toString(36).substr(2, 6)}`;
    const transactionDate = new Date();

    // Ensure order ID is under 50 characters
    if (orderId.length > 50) {
        throw new Error(`Generated order ID too long: ${orderId.length} chars`);
    }

    // Create Midtrans transaction using client
    const _midtransTransaction = await midtransClient.createTransaction({
        transaction_details: {
            order_id: orderId,
            gross_amount: Math.round(finalPrice)
        },
        customer_details: {
            first_name: username,
            email: userEmail,
        },
        item_details: [{
            id: productId || 'general-transaction',
            price: Math.round(unitPrice),
            quantity: quantity,
            name: name,
            category: type === 'product' ? 'Product' : 'Service'
        }],
        callbacks: {
            finish: `${process.env.NEXT_PUBLIC_BASE_URL}/payment/finish`
        },
        metadata: {
            userId,
            type,
            productId,
            quantity,
            description,
            notes,
            username,
            userEmail,
        }
    });

    // Save transaction to database
    const newMidtransTransaction = await db.insert(midtransTransaction).values({
      id: crypto.randomUUID(),
      userId,
      orderId: orderId,
      transactionId: _midtransTransaction.transaction_id,
      grossAmount: finalPrice.toString(),
      currency: 'IDR',
      type,
      productId,
      quantity,
      unitPrice: unitPrice.toString(),
      description: description || `Payment for ${name}`,
      notes,
      snapToken: _midtransTransaction.token,
      redirectUrl: _midtransTransaction.redirect_url,
      midtransResponse: JSON.stringify(_midtransTransaction),
      transactionStatus: 'pending',
      transactionDate,
      webhookReceived: false
    }).returning();

    return NextResponse.json({
      success: true,
      paymentData: {
        orderId,
        snapToken: _midtransTransaction.token,
        redirectUrl: _midtransTransaction.redirect_url,
        amount: finalPrice,
        type,
        productName: name,
        quantity,
        unitPrice,
        description: description || `Payment for ${name}`,
        status: 'pending'
      },
      message: `Link pembayaran ${name} berhasil dibuat. Harga total: Rp ${finalPrice.toLocaleString('id-ID')}`
    });

  } catch (error) {
    console.error('Error creating Midtrans payment:', error);
    return NextResponse.json({
      success: false,
      error: error instanceof Error ? error.message : 'Failed to create payment link'
    }, { status: 500 });
  }
}

// Handle GET requests (for testing)
export async function GET() {
  return NextResponse.json({
    message: 'Midtrans API endpoint is active',
    timestamp: new Date().toISOString()
  });
}