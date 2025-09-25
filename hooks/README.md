# Product Hooks Usage

This project uses TanStack Query hooks for product management.

## Available Hooks

### `useProducts()`
Basic hook to fetch products
```tsx
const { data, isLoading, error } = useProducts();
```

### `useProductsWithFormattedPrices()`
Enhanced hook with formatted prices and calculated fields
```tsx
const { data: products, isLoading, error } = useProductsWithFormattedPrices();
```

### `useRefreshProducts()`
Hook to manually refresh products
```tsx
const refreshProducts = useRefreshProducts();

// Call this to refresh
await refreshProducts();
```

## Manual Refresh

In development, you can manually refresh products by calling:
```js
// In browser console
window.refreshProducts();
```

## Product Data Structure

Each product includes:
- Basic fields: `id`, `name`, `description`, `category`, etc.
- Formatted prices: `formattedSellingPrice`, `formattedCostPrice`
- Calculated fields: `profit`, `profitMargin`, `isLowStock`
- Numeric values: `numericSellingPrice`, `numericCostPrice`

## Features

- ✅ Automatic data fetching with authentication
- ✅ Real-time loading states
- ✅ Error handling with retry
- ✅ Manual refresh capability
- ✅ Search functionality
- ✅ Currency formatting (IDR)
- ✅ Profit calculations
- ✅ Low stock warnings