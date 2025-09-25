"use client";

import React from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { ExternalLink, Copy, CreditCard, Package, Receipt, Check } from 'lucide-react';
import { toast } from 'sonner';
import { useChat } from '@ai-sdk/react';
import { authClient } from '@/lib/auth-client';

interface PaymentData {
  orderId: string;
  snapToken: string;
  redirectUrl: string;
  amount: number;
  type: 'product' | 'transaction';
  productName: string;
  quantity: number;
  unitPrice: number;
  description: string;
  status: string;
}

interface CreatePaymentLinkProps {
  success: boolean;
  paymentData?: PaymentData;
  message?: string;
  error?: string;
}

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

export function CreatePaymentLink({ success, paymentData, message, error }: CreatePaymentLinkProps) {

  const session = authClient.useSession();

  const handleCopyLink = async (link: string) => {
    try {
      await navigator.clipboard.writeText(link);
      toast('Payment link copied to clipboard!');
    } catch (err) {
      toast('Failed to copy link');
    }
  };

  const handleOpenPayment = (redirectUrl: string) => {
    window.open(redirectUrl, '_blank', 'noopener,noreferrer');
  };

  const handleCheckPaymentStatus = () => {
    window.sendMessage(
      {
        text: 'tolong cek status pembayaran dengan id ' + paymentData?.orderId,
        metadata: {
          userId: session?.data?.user?.id,
        },
      },
      {
        body: {
          model: models[0].value,
        },
      },
    ).catch((error) => {
      toast(error.message);
    })
  };

  if (!success) {
    return (
      <Card className="w-full max-w-md border-red-200 bg-red-50">
        <CardHeader>
          <div className="flex items-center space-x-2">
            <div className="w-8 h-8 rounded-full bg-red-100 flex items-center justify-center">
              <CreditCard className="w-4 h-4 text-red-600" />
            </div>
            <div>
              <CardTitle className="text-red-800 text-sm">Payment Creation Failed</CardTitle>
              <CardDescription className="text-red-600 text-xs">
                Unable to create payment link
              </CardDescription>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            <div className="p-3 bg-red-100 rounded-md border-l-4 border-red-500">
              <p className="text-red-700 text-xs font-medium">Error Details:</p>
              <p className="text-red-600 text-xs mt-1">{error}</p>
            </div>

            <div className="text-xs text-red-600">
              Please check your input and try again, or contact support if the issue persists.
            </div>
          </div>
        </CardContent>
      </Card>
    );
  }

  if (!paymentData) {
    return (
      <Card className="w-full max-w-md">
        <CardContent className="pt-6">
          <p className="text-sm text-muted-foreground">No payment data available</p>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="w-full max-w-md border-green-200 bg-green-50">
      <CardHeader>
        <div className="flex items-center space-x-2">
          <div className="w-8 h-8 rounded-full bg-green-100 flex items-center justify-center">
            <CreditCard className="w-4 h-4 text-green-600" />
          </div>
          <div>
            <CardTitle className="text-green-800 text-sm">Payment Link Created</CardTitle>
            <CardDescription className="text-green-600 text-xs">
              Ready to accept payment
            </CardDescription>
          </div>
        </div>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          {/* Payment Summary */}
          <div className="bg-white rounded-lg p-3 border border-green-200">
            <div className="flex items-start justify-between mb-2">
              <div className="flex items-center space-x-2">
                {paymentData.type === 'product' ? (
                  <Package className="w-4 h-4 text-blue-600" />
                ) : (
                  <Receipt className="w-4 h-4 text-purple-600" />
                )}
                <h4 className="font-medium text-sm">{paymentData.productName}</h4>
              </div>
              <Badge variant={paymentData.type === 'product' ? 'default' : 'secondary'} className="text-xs">
                {paymentData.type === 'product' ? 'Product' : 'Service'}
              </Badge>
            </div>

            <div className="space-y-1 text-xs text-muted-foreground">
              <div className="flex justify-between">
                <span>Order ID:</span>
                <span className="font-mono">{paymentData.orderId}</span>
              </div>
              <div className="flex justify-between">
                <span>Quantity:</span>
                <span>{paymentData.quantity}</span>
              </div>
              <div className="flex justify-between">
                <span>Unit Price:</span>
                <span>Rp {paymentData.unitPrice.toLocaleString('id-ID')}</span>
              </div>
              <div className="flex justify-between font-medium text-sm text-foreground border-t pt-1 mt-2">
                <span>Total Amount:</span>
                <span>Rp {paymentData.amount.toLocaleString('id-ID')}</span>
              </div>
            </div>

            {paymentData.description && (
              <div className="mt-2 pt-2 border-t border-green-100">
                <p className="text-xs text-muted-foreground">
                  <strong>Description:</strong> {paymentData.description}
                </p>
              </div>
            )}
          </div>

          {/* Action Buttons */}
          <div className="space-y-2">
            <Button
              onClick={() => handleOpenPayment(paymentData.redirectUrl)}
              className="w-full bg-green-600 hover:bg-green-700 text-white text-sm"
              size="sm"
            >
              <ExternalLink className="w-4 h-4 mr-2" />
              Open Payment Page
            </Button>

            <Button
              onClick={() => handleCopyLink(paymentData.redirectUrl)}
              variant="outline"
              className="w-full border-green-300 text-green-700 hover:bg-green-100 text-sm"
              size="sm"
            >
              <Copy className="w-4 h-4 mr-2" />
              Copy Payment Link
            </Button>
            <Button
              onClick={() => handleCheckPaymentStatus()}
              variant="outline"
              className="w-full border-green-300 text-green-700 hover:bg-green-100 text-sm"
              size="sm"
            >
              <Check className="w-4 h-4 mr-2" />
              Check Payment Status
            </Button>
          </div>

          {/* Success Message */}
          {message && (
            <div className="p-3 bg-green-100 rounded-md border-l-4 border-green-500">
              <p className="text-green-700 text-xs font-medium">{message}</p>
            </div>
          )}

          {/* Instructions */}
          <div className="text-xs text-muted-foreground bg-white p-3 rounded-md border border-green-200">
            <p className="font-medium mb-1">How to use this payment link:</p>
            <ol className="list-decimal list-inside space-y-1">
              <li>Share the link with your customer</li>
              <li>Customer clicks the link to access payment page</li>
              <li>Customer completes payment via various methods</li>
              <li>You'll receive notification once payment is confirmed</li>
              {paymentData.type === 'product' && (
                <li>Product stock will be automatically updated</li>
              )}
            </ol>
          </div>

          <div className="flex items-center justify-between pt-2 border-t border-green-200">
            <Badge variant="outline" className="text-xs">
              Status: {paymentData.status}
            </Badge>
            <span className="text-xs text-muted-foreground">
              Powered by Midtrans
            </span>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}