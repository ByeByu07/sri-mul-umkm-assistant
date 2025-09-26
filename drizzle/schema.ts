import { pgTable, text, boolean, timestamp, decimal, integer, uuid, pgEnum } from "drizzle-orm/pg-core";
import { relations } from "drizzle-orm";

// Enums
export const transactionTypeEnum = pgEnum('transaction_type', ['income', 'expense']);
export const expenseTypeEnum = pgEnum('expense_type', ['operating', 'cogs', 'capital', 'other']);
export const productStatusEnum = pgEnum('product_status', ['active', 'inactive', 'discontinued']);
// Chat enum removed (not needed for now)

// User and Auth Tables (existing)
export const user = pgTable("user", {
    id: text('id').primaryKey(),
    name: text('name').notNull(),
    email: text('email').notNull().unique(),
    username: text('username'),
    displayUsername: text('displayUsername'),
    emailVerified: boolean('emailVerified').default(false).notNull(),
    image: text('image'),
    businessName: text('businessName'),
    businessType: text('businessType'),
    currency: text('currency').default('USD').notNull(),
    createdAt: timestamp('createdAt', { withTimezone: true }).defaultNow().notNull(),
    updatedAt: timestamp('updatedAt', { withTimezone: true }).defaultNow().notNull()
});

export const session = pgTable("session", {
    id: text('id').primaryKey(),
    expiresAt: timestamp('expiresAt', { withTimezone: true }).notNull(),
    token: text('token').notNull().unique(),
    createdAt: timestamp('createdAt', { withTimezone: true }).notNull(),
    updatedAt: timestamp('updatedAt', { withTimezone: true }).notNull(),
    ipAddress: text('ipAddress'),
    userAgent: text('userAgent'),
    userId: text('userId').notNull().references(() => user.id, { onDelete: 'cascade' })
});

export const account = pgTable("account", {
    id: text('id').primaryKey(),
    accountId: text('accountId').notNull(),
    providerId: text('providerId').notNull(),
    userId: text('userId').notNull().references(() => user.id, { onDelete: 'cascade' }),
    accessToken: text('accessToken'),
    refreshToken: text('refreshToken'),
    idToken: text('idToken'),
    accessTokenExpiresAt: timestamp('accessTokenExpiresAt', { withTimezone: true }),
    refreshTokenExpiresAt: timestamp('refreshTokenExpiresAt', { withTimezone: true }),
    scope: text('scope'),
    password: text('password'),
    createdAt: timestamp('createdAt', { withTimezone: true }).notNull(),
    updatedAt: timestamp('updatedAt', { withTimezone: true }).notNull()
});

export const verification = pgTable("verification", {
    id: text('id').primaryKey(),
    identifier: text('identifier').notNull(),
    value: text('value').notNull(),
    expiresAt: timestamp('expiresAt', { withTimezone: true }).notNull(),
    createdAt: timestamp('createdAt', { withTimezone: true }).defaultNow(),
    updatedAt: timestamp('updatedAt', { withTimezone: true }).defaultNow()
});

// Product Management
export const product = pgTable("product", {
    id: text('id').primaryKey(),
    userId: text('userId').notNull().references(() => user.id, { onDelete: 'cascade' }),
    name: text('name').notNull(),
    description: text('description'),
    sku: text('sku'),
    category: text('category'),
    status: productStatusEnum('status').default('active').notNull(),
    
    // Pricing
    sellingPrice: decimal('sellingPrice', { precision: 12, scale: 2 }),
    costPrice: decimal('costPrice', { precision: 12, scale: 2 }), // For COGS calculation
    
    // Inventory
    currentStock: integer('currentStock').default(0),
    minimumStock: integer('minimumStock').default(0),
    
    // Metadata
    createdAt: timestamp('createdAt', { withTimezone: true }).defaultNow().notNull(),
    updatedAt: timestamp('updatedAt', { withTimezone: true }).defaultNow().notNull()
});

// Transaction Categories for better organization
export const transactionCategory = pgTable("transaction_category", {
    id: text('id').primaryKey(),
    userId: text('userId').notNull().references(() => user.id, { onDelete: 'cascade' }),
    name: text('name').notNull(),
    type: transactionTypeEnum('type').notNull(),
    description: text('description'),
    isDefault: boolean('isDefault').default(false).notNull(),
    createdAt: timestamp('createdAt', { withTimezone: true }).defaultNow().notNull(),
    updatedAt: timestamp('updatedAt', { withTimezone: true }).defaultNow().notNull()
});

// Main Transactions Table
export const transaction = pgTable("transaction", {
    id: text('id').primaryKey(),
    userId: text('userId').notNull().references(() => user.id, { onDelete: 'cascade' }),
    type: transactionTypeEnum('type').notNull(),
    amount: decimal('amount', { precision: 12, scale: 2 }).notNull(),
    description: text('description').notNull(),
    
    // References
    categoryId: text('categoryId').references(() => transactionCategory.id, { onDelete: 'set null' }),
    productId: text('productId').references(() => product.id, { onDelete: 'set null' }),
    
    // For expense transactions
    expenseType: expenseTypeEnum('expenseType'),
    
    // For income transactions with products
    quantity: integer('quantity'), // How many products sold
    unitPrice: decimal('unitPrice', { precision: 12, scale: 2 }), // Price per unit
    
    // Additional fields
    transactionDate: timestamp('transactionDate', { withTimezone: true }).notNull(),
    receiptUrl: text('receiptUrl'), // For storing receipt images
    notes: text('notes'),
    
    // Metadata
    createdAt: timestamp('createdAt', { withTimezone: true }).defaultNow().notNull(),
    updatedAt: timestamp('updatedAt', { withTimezone: true }).defaultNow().notNull()
});

// Chat History Tables
export const chatSession = pgTable("chat_session", {
    id: text('id').primaryKey(),
    userId: text('userId').notNull().references(() => user.id, { onDelete: 'cascade' }),
    title: text('title').notNull(),
    summary: text('summary'),
    // Store complete UIMessage[] as JSON for proper persistence
    messages: text('messages').notNull().default('[]'), // JSON stringified UIMessage[]
    createdAt: timestamp('createdAt', { withTimezone: true }).defaultNow().notNull(),
    updatedAt: timestamp('updatedAt', { withTimezone: true }).defaultNow().notNull()
});

// Inventory Tracking
export const inventoryMovement = pgTable("inventory_movement", {
    id: text('id').primaryKey(),
    productId: text('productId').notNull().references(() => product.id, { onDelete: 'cascade' }),
    transactionId: text('transactionId').references(() => transaction.id, { onDelete: 'set null' }),
    
    type: text('type').notNull(), // 'in', 'out', 'adjustment'
    quantity: integer('quantity').notNull(),
    reason: text('reason'), // 'sale', 'purchase', 'return', 'damage', 'adjustment'
    
    balanceBefore: integer('balanceBefore').notNull(),
    balanceAfter: integer('balanceAfter').notNull(),
    
    createdAt: timestamp('createdAt', { withTimezone: true }).defaultNow().notNull()
});

// Midtrans Payment Transactions
export const midtransTransaction = pgTable("midtrans_transaction", {
    id: text('id').primaryKey(),
    userId: text('userId').notNull().references(() => user.id, { onDelete: 'cascade' }),
    orderId: text('orderId').notNull().unique(), // Midtrans order_id
    transactionId: text('transactionId'), // Midtrans transaction_id (received after payment)

    // Payment Details
    grossAmount: decimal('grossAmount', { precision: 12, scale: 2 }).notNull(),
    currency: text('currency').default('IDR').notNull(),

    // Payment Status
    transactionStatus: text('transactionStatus').default('pending').notNull(), // pending, settlement, expire, cancel, deny, failure
    paymentType: text('paymentType'), // credit_card, bank_transfer, etc.

    // Transaction Type and Related Data
    type: text('type').notNull(), // 'product' or 'transaction'
    productId: text('productId').references(() => product.id, { onDelete: 'set null' }),
    quantity: integer('quantity'),
    unitPrice: decimal('unitPrice', { precision: 12, scale: 2 }),
    description: text('description'),
    notes: text('notes'),

    // Midtrans Response Data
    snapToken: text('snapToken'), // Snap token for frontend
    redirectUrl: text('redirectUrl'), // Redirect URL after payment
    midtransResponse: text('midtransResponse'), // JSON string of full Midtrans response

    // Webhook Data
    webhookReceived: boolean('webhookReceived').default(false).notNull(),
    webhookData: text('webhookData'), // JSON string of webhook data

    // Metadata
    transactionDate: timestamp('transactionDate', { withTimezone: true }).notNull(),
    createdAt: timestamp('createdAt', { withTimezone: true }).defaultNow().notNull(),
    updatedAt: timestamp('updatedAt', { withTimezone: true }).defaultNow().notNull(),

    // Settlement details
    settlementTime: timestamp('settlementTime', { withTimezone: true }),
    fraudStatus: text('fraudStatus'), // accept, challenge, deny
});

// Business Reports Cache (for performance)
export const reportCache = pgTable("report_cache", {
    id: text('id').primaryKey(),
    userId: text('userId').notNull().references(() => user.id, { onDelete: 'cascade' }),
    reportType: text('reportType').notNull(), // 'monthly_summary', 'cogs_analysis', 'profit_loss'
    periodStart: timestamp('periodStart', { withTimezone: true }).notNull(),
    periodEnd: timestamp('periodEnd', { withTimezone: true }).notNull(),
    data: text('data').notNull(), // JSON string with report data
    createdAt: timestamp('createdAt', { withTimezone: true }).defaultNow().notNull(),
    expiresAt: timestamp('expiresAt', { withTimezone: true }).notNull()
});

// Relations
export const userRelations = relations(user, ({ many }) => ({
    products: many(product),
    transactions: many(transaction),
    categories: many(transactionCategory),
    midtransTransactions: many(midtransTransaction),
    chatSessions: many(chatSession),
}));

export const productRelations = relations(product, ({ one, many }) => ({
    user: one(user, {
        fields: [product.userId],
        references: [user.id]
    }),
    transactions: many(transaction),
    inventoryMovements: many(inventoryMovement),
    midtransTransactions: many(midtransTransaction)
}));

export const transactionRelations = relations(transaction, ({ one, many }) => ({
    user: one(user, {
        fields: [transaction.userId],
        references: [user.id]
    }),
    product: one(product, {
        fields: [transaction.productId],
        references: [product.id]
    }),
    category: one(transactionCategory, {
        fields: [transaction.categoryId],
        references: [transactionCategory.id]
    }),
    inventoryMovements: many(inventoryMovement)
}));

export const midtransTransactionRelations = relations(midtransTransaction, ({ one }) => ({
    user: one(user, {
        fields: [midtransTransaction.userId],
        references: [user.id]
    }),
    product: one(product, {
        fields: [midtransTransaction.productId],
        references: [product.id]
    })
}));

export const chatSessionRelations = relations(chatSession, ({ one }) => ({
    user: one(user, {
        fields: [chatSession.userId],
        references: [user.id]
    })
}));