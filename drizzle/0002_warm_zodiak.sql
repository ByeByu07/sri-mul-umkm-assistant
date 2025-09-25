CREATE TABLE "midtrans_transaction" (
	"id" text PRIMARY KEY NOT NULL,
	"userId" text NOT NULL,
	"orderId" text NOT NULL,
	"transactionId" text,
	"grossAmount" numeric(12, 2) NOT NULL,
	"currency" text DEFAULT 'IDR' NOT NULL,
	"transactionStatus" text DEFAULT 'pending' NOT NULL,
	"paymentType" text,
	"type" text NOT NULL,
	"productId" text,
	"quantity" integer,
	"unitPrice" numeric(12, 2),
	"description" text,
	"notes" text,
	"snapToken" text,
	"redirectUrl" text,
	"midtransResponse" text,
	"webhookReceived" boolean DEFAULT false NOT NULL,
	"webhookData" text,
	"transactionDate" timestamp with time zone NOT NULL,
	"createdAt" timestamp with time zone DEFAULT now() NOT NULL,
	"updatedAt" timestamp with time zone DEFAULT now() NOT NULL,
	"settlementTime" timestamp with time zone,
	"fraudStatus" text,
	CONSTRAINT "midtrans_transaction_orderId_unique" UNIQUE("orderId")
);
--> statement-breakpoint
ALTER TABLE "midtrans_transaction" ADD CONSTRAINT "midtrans_transaction_userId_user_id_fk" FOREIGN KEY ("userId") REFERENCES "public"."user"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "midtrans_transaction" ADD CONSTRAINT "midtrans_transaction_productId_product_id_fk" FOREIGN KEY ("productId") REFERENCES "public"."product"("id") ON DELETE set null ON UPDATE no action;