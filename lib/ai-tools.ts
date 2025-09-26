import { tool as createTool, Tool, ToolCallOptions } from 'ai';
import { z } from 'zod';
import { db } from '@/lib/db';
import { product, transaction, transactionCategory, midtransTransaction } from '@/drizzle/schema';
import { and, eq, gte, lte, desc, sum, sql, count } from 'drizzle-orm';

type ExperimentalContext = {
    userId: string;
}

export const addProductTool = createTool({
    description: "add new product to catalog user",
    parameters: z.object({
        name: z.string(),
        description: z.string(),
        category: z.string(),
        sellingPrice: z.number(),
        costPrice: z.number(),
        currentStock: z.number(),
        minimumStock: z.number(),
        status: z.enum(['active', 'inactive', 'discontinued']),
        sku: z.string().optional()
    }),
    inputSchema: z.object({
        name: z.string(),
        description: z.string(),
        category: z.string(),
        sellingPrice: z.number(),
        costPrice: z.number(),
        currentStock: z.number(),
        minimumStock: z.number(),
        status: z.enum(['active', 'inactive', 'discontinued']),
        sku: z.string().optional()
    }),
    execute: async ({ name, description, category, sellingPrice, costPrice, currentStock, minimumStock, status, sku }, { experimental_context }: ToolCallOptions) => {

        try {
            await db.insert(product).values({
                id: crypto.randomUUID(),
                userId: experimental_context?.userId,
                name,
                description,
                category,
                sellingPrice: sellingPrice.toString(),
                costPrice: costPrice.toString(),
                currentStock,
                minimumStock,
                status,
                sku: sku || null
            });

            return {
                name,
                description,
                category,
                sellingPrice,
                costPrice,
                currentStock,
                minimumStock,
                status,
                sku: sku || null
            }
        } catch (error) {
            console.log(error);
        }
    }
});

export const deleteProductTool = createTool({
    description: "delete the product from catalog user",
    inputSchema: z.object({
        name: z.string().describe("this the name of product, make this in lowercase"),
    }),
    execute: async ({ name }, { experimental_context }: ToolCallOptions) => {
        try {
            const productItem = await db.select().from(product).where(eq(product.userId, experimental_context?.userId));
            const productItemFiltered = productItem.filter(item => item.name.toLowerCase() === name.toLowerCase());

            await db.delete(product).where(eq(product.id, productItemFiltered[0].id));

            return {
                name,
                description: productItemFiltered[0].description,
                category: productItemFiltered[0].category,
                sellingPrice: productItemFiltered[0].sellingPrice,
                costPrice: productItemFiltered[0].costPrice,
                currentStock: productItemFiltered[0].currentStock,
                minimumStock: productItemFiltered[0].minimumStock,
                status: productItemFiltered[0].status,
                sku: productItemFiltered[0].sku
            }
        } catch (error) {
            console.log(error);
        }
    }
})

export const updateProductTool = createTool({
    description: "update the product in catalog user",
    inputSchema: z.object({
        name: z.string(),
        description: z.string().optional(),
        category: z.string().optional(),
        sellingPrice: z.number().optional(),
        costPrice: z.number().optional(),
        currentStock: z.number().optional(),
        minimumStock: z.number().optional(),
        status: z.enum(['active', 'inactive', 'discontinued']).optional(),
        sku: z.string().optional()
    }),
    execute: async ({ name, description, category, sellingPrice, costPrice, currentStock, minimumStock, status, sku }, { experimental_context }: ToolCallOptions) => {
        try {
            const productItem = await db.select().from(product).where(eq(product.userId, experimental_context?.userId));
            const productItemFiltered = productItem.filter(item => item.name.toLowerCase() === name.toLowerCase());

            const updatedProduct = await db.update(product).set({
                name,
                description,
                category,
                sellingPrice: sellingPrice?.toString(),
                costPrice: costPrice?.toString(),
                currentStock,
                minimumStock,
                status,
                sku: sku || null
            }).where(eq(product.id, productItemFiltered[0].id)).returning();

            return {
                name: updatedProduct[0].name,
                description: updatedProduct[0].description,
                category: updatedProduct[0].category,
                sellingPrice: updatedProduct[0].sellingPrice,
                costPrice: updatedProduct[0].costPrice,
                currentStock: updatedProduct[0].currentStock,
                minimumStock: updatedProduct[0].minimumStock,
                status: updatedProduct[0].status,
                sku: updatedProduct[0].sku
            }
        } catch (error) {
            console.log(error);
        }
    }
})

export const listProductTool = createTool({
    description: "list all products in user's catalog",
    inputSchema: z.object({}), // No input needed to list all products
    execute: async ({ }, { experimental_context }: ToolCallOptions) => {
        try {
            if (!experimental_context?.userId) {
                throw new Error('User ID is required');
            }

            const products = await db
                .select()
                .from(product)
                .where(eq(product.userId, experimental_context.userId))
                .orderBy(desc(product.createdAt));

            return {
                success: true,
                count: products.length,
                products: products.map(p => ({
                    id: p.id,
                    name: p.name,
                    description: p.description,
                    category: p.category,
                    sellingPrice: parseFloat(p.sellingPrice || '0'),
                    costPrice: parseFloat(p.costPrice || '0'),
                    currentStock: p.currentStock || 0,
                    minimumStock: p.minimumStock || 0,
                    status: p.status,
                    sku: p.sku,
                    isLowStock: (p.currentStock || 0) < (p.minimumStock || 0)
                }))
            };
        } catch (error) {
            console.error('Error listing products:', error);
            return {
                success: false,
                error: error instanceof Error ? error.message : 'Failed to list products'
            };
        }
    }
})

export const getDailySalesTool = createTool({
    description: "get the daily sales data for today",
    inputSchema: z.object({
        date: z.string().optional().describe("Date in YYYY-MM-DD format, defaults to today")
    }),
    execute: async ({ date }, { experimental_context }: ToolCallOptions) => {
        try {
            if (!experimental_context?.userId) {
                throw new Error('User ID is required');
            }

            const targetDate = date ? new Date(date) : new Date();
            const startOfDay = new Date(targetDate);
            startOfDay.setHours(0, 0, 0, 0);

            const endOfDay = new Date(targetDate);
            endOfDay.setHours(23, 59, 59, 999);

            const dailySales = await db
                .select({
                    totalAmount: sum(transaction.amount),
                    totalTransactions: count(),
                })
                .from(transaction)
                .where(
                    and(
                        eq(transaction.userId, experimental_context.userId),
                        eq(transaction.type, 'income'),
                        gte(transaction.transactionDate, startOfDay),
                        lte(transaction.transactionDate, endOfDay)
                    )
                );

            const salesDetails = await db
                .select({
                    id: transaction.id,
                    amount: transaction.amount,
                    description: transaction.description,
                    quantity: transaction.quantity,
                    unitPrice: transaction.unitPrice,
                    productName: product.name,
                    transactionDate: transaction.transactionDate
                })
                .from(transaction)
                .leftJoin(product, eq(transaction.productId, product.id))
                .where(
                    and(
                        eq(transaction.userId, experimental_context.userId),
                        eq(transaction.type, 'income'),
                        gte(transaction.transactionDate, startOfDay),
                        lte(transaction.transactionDate, endOfDay)
                    )
                )
                .orderBy(desc(transaction.transactionDate));

            return {
                date: targetDate.toISOString().split('T')[0],
                summary: {
                    totalSales: parseFloat(dailySales[0]?.totalAmount || '0'),
                    totalTransactions: dailySales[0]?.totalTransactions || 0
                },
                transactions: salesDetails.map(t => ({
                    id: t.id,
                    amount: parseFloat(t.amount || '0'),
                    description: t.description,
                    quantity: t.quantity || 0,
                    unitPrice: parseFloat(t.unitPrice || '0'),
                    productName: t.productName,
                    time: t.transactionDate
                }))
            };
        } catch (error) {
            console.error('Error getting daily sales:', error);
            return {
                success: false,
                error: error instanceof Error ? error.message : 'Failed to get daily sales'
            };
        }
    }
})

export const getMonthlySalesTool = createTool({
    description: "get the monthly sales data",
    inputSchema: z.object({
        month: z.number().optional().describe("Month number (1-12), defaults to current month"),
        year: z.number().optional().describe("Year, defaults to current year")
    }),
    execute: async ({ month, year }, { experimental_context }: ToolCallOptions) => {
        try {
            if (!experimental_context?.userId) {
                throw new Error('User ID is required');
            }

            const now = new Date();
            const targetMonth = month || (now.getMonth() + 1);
            const targetYear = year || now.getFullYear();

            const startOfMonth = new Date(targetYear, targetMonth - 1, 1);
            const endOfMonth = new Date(targetYear, targetMonth, 0, 23, 59, 59, 999);

            const monthlySales = await db
                .select({
                    totalAmount: sum(transaction.amount),
                    totalTransactions: count(),
                })
                .from(transaction)
                .where(
                    and(
                        eq(transaction.userId, experimental_context.userId),
                        eq(transaction.type, 'income'),
                        gte(transaction.transactionDate, startOfMonth),
                        lte(transaction.transactionDate, endOfMonth)
                    )
                );

            // Daily breakdown
            const dailyBreakdown = await db
                .select({
                    day: sql<string>`DATE(${transaction.transactionDate})`,
                    totalAmount: sum(transaction.amount),
                    totalTransactions: count(),
                })
                .from(transaction)
                .where(
                    and(
                        eq(transaction.userId, experimental_context.userId),
                        eq(transaction.type, 'income'),
                        gte(transaction.transactionDate, startOfMonth),
                        lte(transaction.transactionDate, endOfMonth)
                    )
                )
                .groupBy(sql`DATE(${transaction.transactionDate})`)
                .orderBy(sql`DATE(${transaction.transactionDate})`);

            return {
                month: targetMonth,
                year: targetYear,
                summary: {
                    totalSales: parseFloat(monthlySales[0]?.totalAmount || '0'),
                    totalTransactions: monthlySales[0]?.totalTransactions || 0,
                    averageDailySales: parseFloat(monthlySales[0]?.totalAmount || '0') / new Date(targetYear, targetMonth, 0).getDate()
                },
                dailyBreakdown: dailyBreakdown.map(d => ({
                    date: d.day,
                    sales: parseFloat(d.totalAmount || '0'),
                    transactions: d.totalTransactions || 0
                }))
            };
        } catch (error) {
            console.error('Error getting monthly sales:', error);
            return {
                success: false,
                error: error instanceof Error ? error.message : 'Failed to get monthly sales'
            };
        }
    }
})

export const compareMonthlySalesTool = createTool({
    description: "compare monthly sales between current and previous month",
    inputSchema: z.object({
        currentMonth: z.number().optional().describe("Current month (1-12), defaults to current month"),
        currentYear: z.number().optional().describe("Current year, defaults to current year"),
        previousMonth: z.number().optional().describe("Previous month (1-12), defaults to previous month"),
        previousYear: z.number().optional().describe("Previous year, defaults to appropriate year")
    }),
    execute: async ({ currentMonth, currentYear, previousMonth, previousYear }, { experimental_context }: ToolCallOptions) => {
        try {
            if (!experimental_context?.userId) {
                throw new Error('User ID is required');
            }

            const now = new Date();
            const curMonth = currentMonth || (now.getMonth() + 1);
            const curYear = currentYear || now.getFullYear();

            // Calculate previous month/year
            let prevMonth, prevYear;
            if (previousMonth && previousYear) {
                prevMonth = previousMonth;
                prevYear = previousYear;
            } else {
                if (curMonth === 1) {
                    prevMonth = 12;
                    prevYear = curYear - 1;
                } else {
                    prevMonth = curMonth - 1;
                    prevYear = curYear;
                }
            }

            // Current month data
            const currentStart = new Date(curYear, curMonth - 1, 1);
            const currentEnd = new Date(curYear, curMonth, 0, 23, 59, 59, 999);

            const currentSales = await db
                .select({
                    totalAmount: sum(transaction.amount),
                    totalTransactions: count(),
                })
                .from(transaction)
                .where(
                    and(
                        eq(transaction.userId, experimental_context.userId),
                        eq(transaction.type, 'income'),
                        gte(transaction.transactionDate, currentStart),
                        lte(transaction.transactionDate, currentEnd)
                    )
                );

            // Previous month data
            const previousStart = new Date(prevYear, prevMonth - 1, 1);
            const previousEnd = new Date(prevYear, prevMonth, 0, 23, 59, 59, 999);

            const previousSales = await db
                .select({
                    totalAmount: sum(transaction.amount),
                    totalTransactions: count(),
                })
                .from(transaction)
                .where(
                    and(
                        eq(transaction.userId, experimental_context.userId),
                        eq(transaction.type, 'income'),
                        gte(transaction.transactionDate, previousStart),
                        lte(transaction.transactionDate, previousEnd)
                    )
                );

            const currentTotal = parseFloat(currentSales[0]?.totalAmount || '0');
            const previousTotal = parseFloat(previousSales[0]?.totalAmount || '0');
            const currentTransactions = currentSales[0]?.totalTransactions || 0;
            const previousTransactions = previousSales[0]?.totalTransactions || 0;

            const salesGrowth = previousTotal > 0 ? ((currentTotal - previousTotal) / previousTotal) * 100 : 0;
            const transactionGrowth = previousTransactions > 0 ? ((currentTransactions - previousTransactions) / previousTransactions) * 100 : 0;

            return {
                comparison: {
                    current: {
                        month: curMonth,
                        year: curYear,
                        totalSales: currentTotal,
                        totalTransactions: currentTransactions
                    },
                    previous: {
                        month: prevMonth,
                        year: prevYear,
                        totalSales: previousTotal,
                        totalTransactions: previousTransactions
                    }
                },
                growth: {
                    salesAmount: currentTotal - previousTotal,
                    salesPercentage: salesGrowth,
                    transactionsAmount: currentTransactions - previousTransactions,
                    transactionsPercentage: transactionGrowth,
                    trend: salesGrowth > 0 ? 'increasing' : salesGrowth < 0 ? 'decreasing' : 'stable'
                }
            };
        } catch (error) {
            console.error('Error comparing monthly sales:', error);
            return {
                success: false,
                error: error instanceof Error ? error.message : 'Failed to compare monthly sales'
            };
        }
    }
})

export const getTotalRevenueTool = createTool({
    description: "get the total revenue/income of user up to today",
    inputSchema: z.object({
        startDate: z.string().optional().describe("Start date in YYYY-MM-DD format"),
        endDate: z.string().optional().describe("End date in YYYY-MM-DD format, defaults to today")
    }),
    execute: async ({ startDate, endDate }, { experimental_context }: ToolCallOptions) => {
        try {
            if (!experimental_context?.userId) {
                throw new Error('User ID is required');
            }

            let conditions = [
                eq(transaction.userId, experimental_context.userId),
                eq(transaction.type, 'income')
            ];

            if (startDate) {
                conditions.push(gte(transaction.transactionDate, new Date(startDate)));
            }

            if (endDate) {
                conditions.push(lte(transaction.transactionDate, new Date(endDate)));
            } else {
                conditions.push(lte(transaction.transactionDate, new Date()));
            }

            const totalRevenue = await db
                .select({
                    totalAmount: sum(transaction.amount),
                    totalTransactions: count(),
                })
                .from(transaction)
                .where(and(...conditions));

            // Monthly breakdown for the period
            const monthlyBreakdown = await db
                .select({
                    month: sql<string>`TO_CHAR(${transaction.transactionDate}, 'YYYY-MM')`,
                    totalAmount: sum(transaction.amount),
                    totalTransactions: count(),
                })
                .from(transaction)
                .where(and(...conditions))
                .groupBy(sql`TO_CHAR(${transaction.transactionDate}, 'YYYY-MM')`)
                .orderBy(sql`TO_CHAR(${transaction.transactionDate}, 'YYYY-MM')`);

            return {
                period: {
                    startDate: startDate || 'Beginning',
                    endDate: endDate || new Date().toISOString().split('T')[0]
                },
                summary: {
                    totalRevenue: parseFloat(totalRevenue[0]?.totalAmount || '0'),
                    totalTransactions: totalRevenue[0]?.totalTransactions || 0,
                    averageTransactionValue: totalRevenue[0]?.totalTransactions
                        ? parseFloat(totalRevenue[0]?.totalAmount || '0') / totalRevenue[0].totalTransactions
                        : 0
                },
                monthlyBreakdown: monthlyBreakdown.map(m => ({
                    month: m.month,
                    revenue: parseFloat(m.totalAmount || '0'),
                    transactions: m.totalTransactions || 0
                }))
            };
        } catch (error) {
            console.error('Error getting total revenue:', error);
            return {
                success: false,
                error: error instanceof Error ? error.message : 'Failed to get total revenue'
            };
        }
    }
})

export const recordTransactionTool = createTool({
    description: "record a new transaction (income or expense), for instance the sales or maybe the expenses, directly use this of any income or expense or sales.",
    inputSchema: z.object({
        type: z.enum(['income', 'expense']).describe("Transaction type"),
        name: z.string().describe("Product name"),
        amount: z.number().optional().describe("Transaction amount"),
        description: z.string().optional().describe("Transaction description"),
        productId: z.string().optional().describe("Product ID if related to product sale"),
        quantity: z.number().optional().describe("Quantity of items (for sales)"),
        unitPrice: z.number().optional().describe("Price per unit (for sales)"),
        expenseType: z.enum(['operating', 'cogs', 'capital', 'other']).optional().describe("Expense type (for expenses)"),
        transactionDate: z.string().optional().describe("Transaction date in YYYY-MM-DD format, defaults to today"),
        notes: z.string().optional().describe("Additional notes")
    }),
    execute: async ({ amount, description, productId, quantity, unitPrice, expenseType, transactionDate, notes, name, type }, { experimental_context }: ToolCallOptions) => {
        try {
            if (!experimental_context?.userId) {
                throw new Error('User ID is required');
            }

            const productItem = await db.select().from(product).where(eq(product.userId, experimental_context?.userId));
            const productItemFiltered = productItem.filter(item => item.name.toLowerCase() === name.toLowerCase());

            const transactionId = crypto.randomUUID();
            const transDate = transactionDate ? new Date(transactionDate) : new Date();

            let newTransaction = null;

            const totalAmount = productItemFiltered[0]?.sellingPrice * quantity;

            if (productItemFiltered.length === 0) {
                newTransaction = await db.insert(transaction).values({
                    id: transactionId,
                    userId: experimental_context.userId,
                    type,
                    amount: amount?.toString() || null,
                    description,
                    productId: productId || null,
                    quantity: quantity || null,
                    unitPrice: unitPrice || null,
                    expenseType: expenseType || null,
                    transactionDate: transDate,
                    notes: notes || null
                }).returning();
            }

            if (productItemFiltered.length > 0) {
                newTransaction = await db.insert(transaction).values({
                    id: transactionId,
                    userId: experimental_context.userId,
                    type,
                    amount: totalAmount.toString() || null,
                    description,
                    productId: productId || null,
                    quantity: quantity || null,
                    unitPrice: productItemFiltered[0]?.sellingPrice || null,
                    expenseType: expenseType || null,
                    transactionDate: transDate,
                    notes: notes || null
                }).returning()

                await db.update(product).set({
                    currentStock: productItemFiltered[0]?.currentStock - quantity
                }).where(eq(product.id, productItemFiltered[0]?.id));
            }

            return {
                success: true,
                transaction: {
                    id: newTransaction[0]?.id || null,
                    type: newTransaction[0]?.type || null,
                    amount: parseFloat(newTransaction[0]?.amount) || null,
                    description: newTransaction[0]?.description || null,
                    quantity: newTransaction[0]?.quantity || null,
                    unitPrice: newTransaction[0]?.unitPrice ? parseFloat(newTransaction[0]?.unitPrice) : null,
                    expenseType: newTransaction[0]?.expenseType || null,
                    transactionDate: newTransaction[0]?.transactionDate || null,
                    notes: newTransaction[0]?.notes || null
                }
            };
        } catch (error) {
            console.error('Error recording transaction:', error);
            return {
                success: false,
                error: error instanceof Error ? error.message : 'Failed to record transaction'
            };
        }
    }
})

export const listTransactionTool = createTool({
    description: "list transactions with optional filtering",
    inputSchema: z.object({
        type: z.enum(['income', 'expense']).optional().describe("Filter by transaction type"),
        limit: z.number().optional().describe("Maximum number of transactions to return (default 50)"),
        startDate: z.string().optional().describe("Start date filter in YYYY-MM-DD format"),
        endDate: z.string().optional().describe("End date filter in YYYY-MM-DD format")
    }),
    execute: async ({ type, limit = 50, startDate, endDate }, { experimental_context }: ToolCallOptions) => {
        try {
            if (!experimental_context?.userId) {
                throw new Error('User ID is required');
            }

            let conditions = [eq(transaction.userId, experimental_context.userId)];

            if (type) {
                conditions.push(eq(transaction.type, type));
            }

            if (startDate) {
                conditions.push(gte(transaction.transactionDate, new Date(startDate)));
            }

            if (endDate) {
                conditions.push(lte(transaction.transactionDate, new Date(endDate)));
            }

            const transactions = await db
                .select({
                    id: transaction.id,
                    type: transaction.type,
                    amount: transaction.amount,
                    description: transaction.description,
                    quantity: transaction.quantity,
                    unitPrice: transaction.unitPrice,
                    expenseType: transaction.expenseType,
                    transactionDate: transaction.transactionDate,
                    notes: transaction.notes,
                    productName: product.name
                })
                .from(transaction)
                .leftJoin(product, eq(transaction.productId, product.id))
                .where(and(...conditions))
                .orderBy(desc(transaction.transactionDate))
                .limit(limit);

            return {
                success: true,
                count: transactions.length,
                transactions: transactions.map(t => ({
                    id: t.id,
                    type: t.type,
                    amount: parseFloat(t.amount),
                    description: t.description,
                    quantity: t.quantity,
                    unitPrice: t.unitPrice ? parseFloat(t.unitPrice) : null,
                    expenseType: t.expenseType,
                    transactionDate: t.transactionDate,
                    notes: t.notes,
                    productName: t.productName
                }))
            };
        } catch (error) {
            console.error('Error listing transactions:', error);
            return {
                success: false,
                error: error instanceof Error ? error.message : 'Failed to list transactions'
            };
        }
    }
})

export const makePaymentMidtrans = createTool({
    description: "Create a Midtrans payment link for products or general transactions. For products, it will automatically get price and stock. For general transactions, price is required.",
    inputSchema: z.object({
        type: z.enum(['product', 'transaction']).describe("Type of payment - 'product' for existing products, 'transaction' for general payments"),
        name: z.string().describe("Product name (for product type) or transaction description (for transaction type)"),
        price: z.number().optional().describe("Price per unit - required for transaction type, optional for product type (will use product price)"),
        quantity: z.number().default(1).describe("Quantity - defaults to 1"),
        description: z.string().optional().describe("Additional description for the payment"),
        notes: z.string().optional().describe("Additional notes about the transaction")
    }),
    execute: async ({type, name, price, quantity = 1, description, notes}, {experimental_context}: ToolCallOptions) => {
        try {
            if (!experimental_context?.userId) {
                throw new Error('User ID is required');
            }

            // Call our internal API route to create payment
            const response = await fetch(`${process.env.NEXT_PUBLIC_BASE_URL}/api/midtrans`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'x-user-id': experimental_context.userId
                },
                body: JSON.stringify({
                    type,
                    name,
                    price,
                    quantity,
                    description,
                    notes
                })
            });

            const result = await response.json();

            if (!response.ok) {
                return {
                    success: false,
                    error: result.error || 'Failed to create payment link'
                };
            }

            return result;

        } catch (error) {
            console.error('Error creating Midtrans payment:', error);
            return {
                success: false,
                error: error instanceof Error ? error.message : 'Failed to create payment link'
            };
        }
    }
})

export const checkPaymentMidtrans = createTool({
    description: "Check Midtrans payment status for a specific transaction.",
    inputSchema: z.object({
        orderId: z.string().describe("Order ID")
    }),
    execute: async ({orderId}, {experimental_context}: ToolCallOptions) => {
        try {
            if (!experimental_context?.userId) {
                throw new Error('User ID is required');
            }

            const result = await db.select().from(midtransTransaction).where(eq(midtransTransaction.orderId, orderId));

            console.log(result);

            return {
                success: true,
                transaction: {
                    id: result[0]?.id || null,
                    type: result[0]?.type || null,
                    status: result[0]?.transactionStatus || null,
                    grossAmount: parseFloat(result[0]?.grossAmount) || null,
                    paymentType: result[0]?.paymentType || null,
                    description: result[0]?.description || null,
                    quantity: result[0]?.quantity || null,
                    transactionDate: result[0]?.transactionDate || null,
                }
            };

        } catch (error) {
            console.error('Error creating Midtrans payment:', error);
            return {
                success: false,
                error: error instanceof Error ? error.message : 'Failed to create payment link'
            };
        }
    }
})

// export const addExpenseTool = createTool({
//     description: "add a new expense transaction",
//     inputSchema: z.object({
//         amount: z.number().describe("Expense amount"),
//         description: z.string().describe("Expense description"),
//         expenseType: z.enum(['operating', 'cogs', 'capital', 'other']).describe("Type of expense"),
//         transactionDate: z.string().optional().describe("Expense date in YYYY-MM-DD format, defaults to today"),
//         notes: z.string().optional().describe("Additional notes about the expense")
//     }),
//     execute: async({ amount, description, expenseType, transactionDate, notes }, { experimental_context }: ToolCallOptions) => {
//         try {
//             if (!experimental_context?.userId) {
//                 throw new Error('User ID is required');
//             }

//             const expenseId = crypto.randomUUID();
//             const expenseDate = transactionDate ? new Date(transactionDate) : new Date();

//             const newExpense = await db.insert(transaction).values({
//                 id: expenseId,
//                 userId: experimental_context.userId,
//                 type: 'expense',
//                 amount: amount.toString(),
//                 description,
//                 expenseType,
//                 transactionDate: expenseDate,
//                 notes: notes || null
//             }).returning();

//             return {
//                 success: true,
//                 expense: {
//                     id: newExpense[0].id,
//                     amount: parseFloat(newExpense[0].amount),
//                     description: newExpense[0].description,
//                     expenseType: newExpense[0].expenseType,
//                     transactionDate: newExpense[0].transactionDate,
//                     notes: newExpense[0].notes
//                 }
//             };
//         } catch (error) {
//             console.error('Error adding expense:', error);
//             return {
//                 success: false,
//                 error: error instanceof Error ? error.message : 'Failed to add expense'
//             };
//         }
//     }
// })

// export const addIncomeTool = createTool({
//     description: "add a new income transaction",
//     inputSchema: z.object({
//         amount: z.number().describe("Income amount"),
//         description: z.string().describe("Income description"),
//         productId: z.string().optional().describe("Product ID if this income is from product sale"),
//         quantity: z.number().optional().describe("Quantity of items sold"),
//         unitPrice: z.number().optional().describe("Price per unit"),
//         transactionDate: z.string().optional().describe("Income date in YYYY-MM-DD format, defaults to today"),
//         notes: z.string().optional().describe("Additional notes about the income")
//     }),
//     execute: async({ amount, description, productId, quantity, unitPrice, transactionDate, notes }, { experimental_context }: ToolCallOptions) => {
//         try {
//             if (!experimental_context?.userId) {
//                 throw new Error('User ID is required');
//             }

//             const incomeId = crypto.randomUUID();
//             const incomeDate = transactionDate ? new Date(transactionDate) : new Date();

//             const newIncome = await db.insert(transaction).values({
//                 id: incomeId,
//                 userId: experimental_context.userId,
//                 type: 'income',
//                 amount: amount.toString(),
//                 description,
//                 productId: productId || null,
//                 quantity: quantity || null,
//                 unitPrice: unitPrice ? unitPrice.toString() : null,
//                 transactionDate: incomeDate,
//                 notes: notes || null
//             }).returning();

//             return {
//                 success: true,
//                 income: {
//                     id: newIncome[0].id,
//                     amount: parseFloat(newIncome[0].amount),
//                     description: newIncome[0].description,
//                     quantity: newIncome[0].quantity,
//                     unitPrice: newIncome[0].unitPrice ? parseFloat(newIncome[0].unitPrice) : null,
//                     transactionDate: newIncome[0].transactionDate,
//                     notes: newIncome[0].notes
//                 }
//             };
//         } catch (error) {
//             console.error('Error adding income:', error);
//             return {
//                 success: false,
//                 error: error instanceof Error ? error.message : 'Failed to add income'
//             };
//         }
//     }
// })

// export const listExpenseTool = createTool({
//     description: "list expense transactions with optional filtering",
//     inputSchema: z.object({
//         expenseType: z.enum(['operating', 'cogs', 'capital', 'other']).optional().describe("Filter by expense type"),
//         limit: z.number().optional().describe("Maximum number of expenses to return (default 50)"),
//         startDate: z.string().optional().describe("Start date filter in YYYY-MM-DD format"),
//         endDate: z.string().optional().describe("End date filter in YYYY-MM-DD format")
//     }),
//     execute: async({ expenseType, limit = 50, startDate, endDate }, { experimental_context }: ToolCallOptions) => {
//         try {
//             if (!experimental_context?.userId) {
//                 throw new Error('User ID is required');
//             }

//             let conditions = [
//                 eq(transaction.userId, experimental_context.userId),
//                 eq(transaction.type, 'expense')
//             ];

//             if (expenseType) {
//                 conditions.push(eq(transaction.expenseType, expenseType));
//             }

//             if (startDate) {
//                 conditions.push(gte(transaction.transactionDate, new Date(startDate)));
//             }

//             if (endDate) {
//                 conditions.push(lte(transaction.transactionDate, new Date(endDate)));
//             }

//             const expenses = await db
//                 .select({
//                     id: transaction.id,
//                     amount: transaction.amount,
//                     description: transaction.description,
//                     expenseType: transaction.expenseType,
//                     transactionDate: transaction.transactionDate,
//                     notes: transaction.notes
//                 })
//                 .from(transaction)
//                 .where(and(...conditions))
//                 .orderBy(desc(transaction.transactionDate))
//                 .limit(limit);

//             const totalExpense = await db
//                 .select({
//                     totalAmount: sum(transaction.amount),
//                     count: count()
//                 })
//                 .from(transaction)
//                 .where(and(...conditions));

//             return {
//                 success: true,
//                 summary: {
//                     totalExpense: parseFloat(totalExpense[0]?.totalAmount || '0'),
//                     totalTransactions: totalExpense[0]?.count || 0
//                 },
//                 expenses: expenses.map(e => ({
//                     id: e.id,
//                     amount: parseFloat(e.amount),
//                     description: e.description,
//                     expenseType: e.expenseType,
//                     transactionDate: e.transactionDate,
//                     notes: e.notes
//                 }))
//             };
//         } catch (error) {
//             console.error('Error listing expenses:', error);
//             return {
//                 success: false,
//                 error: error instanceof Error ? error.message : 'Failed to list expenses'
//             };
//         }
//     }
// })

// export const listIncomeTool = createTool({
//     description: "list income transactions with optional filtering",
//     inputSchema: z.object({
//         limit: z.number().optional().describe("Maximum number of incomes to return (default 50)"),
//         startDate: z.string().optional().describe("Start date filter in YYYY-MM-DD format"),
//         endDate: z.string().optional().describe("End date filter in YYYY-MM-DD format"),
//         productId: z.string().optional().describe("Filter by specific product ID")
//     }),
//     execute: async({ limit = 50, startDate, endDate, productId }, { experimental_context }: ToolCallOptions) => {
//         try {
//             if (!experimental_context?.userId) {
//                 throw new Error('User ID is required');
//             }

//             let conditions = [
//                 eq(transaction.userId, experimental_context.userId),
//                 eq(transaction.type, 'income')
//             ];

//             if (productId) {
//                 conditions.push(eq(transaction.productId, productId));
//             }

//             if (startDate) {
//                 conditions.push(gte(transaction.transactionDate, new Date(startDate)));
//             }

//             if (endDate) {
//                 conditions.push(lte(transaction.transactionDate, new Date(endDate)));
//             }

//             const incomes = await db
//                 .select({
//                     id: transaction.id,
//                     amount: transaction.amount,
//                     description: transaction.description,
//                     quantity: transaction.quantity,
//                     unitPrice: transaction.unitPrice,
//                     transactionDate: transaction.transactionDate,
//                     notes: transaction.notes,
//                     productName: product.name
//                 })
//                 .from(transaction)
//                 .leftJoin(product, eq(transaction.productId, product.id))
//                 .where(and(...conditions))
//                 .orderBy(desc(transaction.transactionDate))
//                 .limit(limit);

//             const totalIncome = await db
//                 .select({
//                     totalAmount: sum(transaction.amount),
//                     count: count()
//                 })
//                 .from(transaction)
//                 .where(and(...conditions));

//             return {
//                 success: true,
//                 summary: {
//                     totalIncome: parseFloat(totalIncome[0]?.totalAmount || '0'),
//                     totalTransactions: totalIncome[0]?.count || 0
//                 },
//                 incomes: incomes.map(i => ({
//                     id: i.id,
//                     amount: parseFloat(i.amount),
//                     description: i.description,
//                     quantity: i.quantity,
//                     unitPrice: i.unitPrice ? parseFloat(i.unitPrice) : null,
//                     transactionDate: i.transactionDate,
//                     notes: i.notes,
//                     productName: i.productName
//                 }))
//             };
//         } catch (error) {
//             console.error('Error listing incomes:', error);
//             return {
//                 success: false,
//                 error: error instanceof Error ? error.message : 'Failed to list incomes'
//             };
//         }
//     }
// })


export const tools = {
    addProduct: addProductTool as Tool,
    deleteProduct: deleteProductTool as Tool,
    updateProduct: updateProductTool as Tool,
    listProduct: listProductTool as Tool,
    getDailySales: getDailySalesTool as Tool,
    getMonthlySales: getMonthlySalesTool as Tool,
    compareMonthlySales: compareMonthlySalesTool as Tool,
    getTotalRevenue: getTotalRevenueTool as Tool,
    recordTransaction: recordTransactionTool as Tool,
    listTransaction: listTransactionTool as Tool,
    createPaymentLink: makePaymentMidtrans as Tool,
    checkPaymentStatus: checkPaymentMidtrans as Tool
} satisfies Record<string, Tool<any, any>>;