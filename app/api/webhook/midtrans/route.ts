import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db';
import { midtransTransaction, product, transaction } from '@/drizzle/schema';
import { eq } from 'drizzle-orm';
import crypto from 'crypto';

// Midtrans webhook notification interface
interface MidtransNotification {
  transaction_time: string;
  transaction_status: string;
  transaction_id: string;
  status_message: string;
  status_code: string;
  signature_key: string;
  payment_type: string;
  order_id: string;
  merchant_id: string;
  masked_card?: string;
  gross_amount: string;
  fraud_status: string;
  currency: string;
  settlement_time?: string;
  custom_field1?: string;
  custom_field2?: string;
  custom_field3?: string;
}

// Helper function to verify signature
function verifySignature(notification: MidtransNotification): boolean {
  const isProduction = process.env.NODE_ENV === "production";
  const serverKey = isProduction
    ? process.env.MIDTRANS_SERVER_KEY
    : process.env.MIDTRANS_SANDBOX_SERVER_KEY;

  if (!serverKey) {
    console.error('MIDTRANS_SERVER_KEY not found in environment variables');
    return false;
  }

  const { order_id, status_code, gross_amount, signature_key } = notification;
  const signatureString = `${order_id}${status_code}${gross_amount}${serverKey}`;
  const hash = crypto.createHash('sha512').update(signatureString).digest('hex');

  return hash === signature_key;
}

export async function POST(request: NextRequest) {
  try {
    const notification: MidtransNotification = await request.json();

    console.log('Received Midtrans notification:', notification);

    // Verify signature
    if (!verifySignature(notification)) {
      console.error('Invalid signature from Midtrans');
      return NextResponse.json(
        { error: 'Invalid signature' },
        { status: 401 }
      );
    }

    const {
      transaction_status,
      fraud_status,
      order_id,
      transaction_id,
      gross_amount,
      payment_type,
      settlement_time,
      custom_field1
    } = notification;

    // Find the transaction in our database
    const [existingTransaction] = await db
      .select()
      .from(midtransTransaction)
      .where(eq(midtransTransaction.orderId, order_id));

    if (!existingTransaction) {
      console.error(`Transaction not found: ${order_id}`);
      return NextResponse.json({ error: 'Transaction not found' }, { status: 404 });
    }

    // Update transaction status
    await db
      .update(midtransTransaction)
      .set({
        transactionId: transaction_id,
        transactionStatus: transaction_status,
        paymentType: payment_type,
        fraudStatus: fraud_status,
        webhookReceived: true,
        webhookData: JSON.stringify(notification),
        settlementTime: settlement_time ? new Date(settlement_time) : null,
        updatedAt: new Date()
      })
      .where(eq(midtransTransaction.orderId, order_id));

    console.log(`Transaction ${order_id} updated with status: ${transaction_status}`);

    // If payment is successful (settlement or capture), process the transaction
    if ((transaction_status === 'settlement' || transaction_status === 'capture') && fraud_status === 'accept') {
      // Parse custom field data
      let customData = null;
      if (custom_field1) {
        try {
          customData = JSON.parse(custom_field1);
        } catch (error) {
          console.error('Error parsing custom field:', error);
        }
      }

      // If this is a product transaction, update stock and record transaction
      if (existingTransaction.type === 'product' && existingTransaction.productId) {
        // Get product details
        const [productData] = await db
          .select()
          .from(product)
          .where(eq(product.id, existingTransaction.productId));

        if (productData) {
          // Update product stock
          const newStock = (productData.currentStock || 0) - (existingTransaction.quantity || 1);
          await db
            .update(product)
            .set({
              currentStock: Math.max(0, newStock),
              updatedAt: new Date()
            })
            .where(eq(product.id, existingTransaction.productId));

          console.log(`Product ${productData.name} stock updated: ${productData.currentStock} -> ${newStock}`);

          // Record the transaction
          await db.insert(transaction).values({
            id: crypto.randomUUID(),
            userId: existingTransaction.userId,
            type: 'income',
            amount: existingTransaction.grossAmount,
            description: `Online payment for ${productData.name} via Midtrans`,
            productId: existingTransaction.productId,
            quantity: existingTransaction.quantity,
            unitPrice: existingTransaction.unitPrice,
            transactionDate: new Date(),
            notes: `Midtrans Order ID: ${order_id}, Transaction ID: ${transaction_id}`
          });

          console.log(`Transaction recorded for product: ${productData.name}`);
        }
      } else if (existingTransaction.type === 'transaction') {
        // For general transactions, just record the transaction
        await db.insert(transaction).values({
          id: crypto.randomUUID(),
          userId: existingTransaction.userId,
          type: 'income',
          amount: existingTransaction.grossAmount,
          description: existingTransaction.description || `Online payment via Midtrans`,
          transactionDate: new Date(),
          notes: `Midtrans Order ID: ${order_id}, Transaction ID: ${transaction_id}`
        });

        console.log(`General transaction recorded for amount: ${existingTransaction.grossAmount}`);
      }
    } else if (transaction_status === 'cancel' || transaction_status === 'expire' || transaction_status === 'failure') {
      // For cancelled/expired/failed payments, we don't need to do anything special
      // The stock won't be deducted and no transaction will be recorded
      console.log(`Payment ${transaction_status} for order ${order_id} - no action required`);
    }

    return NextResponse.json({
      message: 'Webhook processed successfully',
      order_id,
      status: transaction_status
    });

  } catch (error) {
    console.error('Error processing Midtrans webhook:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

// Handle GET requests (for testing)
export async function GET() {
  return NextResponse.json({
    message: 'Midtrans webhook endpoint is active',
    timestamp: new Date().toISOString()
  });
}