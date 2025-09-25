import { useQuery, useQueryClient } from '@tanstack/react-query';
import { toast } from 'sonner';

// Type definition based on the schema
export type Product = {
  id: string;
  userId: string;
  name: string;
  description: string | null;
  sku: string | null;
  category: string | null;
  status: 'active' | 'inactive' | 'discontinued';
  sellingPrice: string | null; // Decimal comes as string from DB
  costPrice: string | null;
  currentStock: number | null;
  minimumStock: number | null;
  createdAt: Date;
  updatedAt: Date;
};

type ProductsResponse = {
  success: boolean;
  data: Product[];
};

const fetchProducts = async (): Promise<Product[]> => {
  const response = await fetch('/api/products', {
    method: 'GET',
    credentials: 'include', // Important for session cookies
  });

  if (!response.ok) {
    const errorData = await response.json().catch(() => ({}));
    throw new Error(errorData.error || 'Failed to fetch products');
  }

  const result: ProductsResponse = await response.json();
  return result.data;
};

export const useProducts = () => {
  return useQuery({
    queryKey: ['products'],
    queryFn: fetchProducts,
    staleTime: 5 * 60 * 1000, // 5 minutes
    retry: (failureCount, error) => {
      // Don't retry on auth errors
      if (error.message.includes('Unauthorized')) {
        return false;
      }
      return failureCount < 3;
    },
    onError: (error: Error) => {
      toast.error(`Failed to load products: ${error.message}`);
    },
  });
};

export const useRefreshProducts = () => {
  const queryClient = useQueryClient();

  const refreshProducts = async () => {
    try {
      await queryClient.invalidateQueries({ queryKey: ['products'] });
      await queryClient.refetchQueries({ queryKey: ['products'] });
      toast.success('Products refreshed successfully!');
    } catch (error) {
      toast.error('Failed to refresh products');
    }
  };

  return refreshProducts;
};

// Helper hook to get products with formatted prices
export const useProductsWithFormattedPrices = () => {
  const { data: products, ...rest } = useProducts();

  const formatCurrency = (amount: string | null) => {
    if (!amount) return 'Rp 0';
    const numericAmount = parseFloat(amount);
    return new Intl.NumberFormat('id-ID', {
      style: 'currency',
      currency: 'IDR',
      minimumFractionDigits: 0,
    }).format(numericAmount);
  };

  const formattedProducts = products?.map(product => ({
    ...product,
    formattedSellingPrice: formatCurrency(product.sellingPrice),
    formattedCostPrice: formatCurrency(product.costPrice),
    numericSellingPrice: product.sellingPrice ? parseFloat(product.sellingPrice) : 0,
    numericCostPrice: product.costPrice ? parseFloat(product.costPrice) : 0,
    profit: product.sellingPrice && product.costPrice
      ? parseFloat(product.sellingPrice) - parseFloat(product.costPrice)
      : 0,
    profitMargin: product.sellingPrice && product.costPrice && parseFloat(product.costPrice) > 0
      ? (((parseFloat(product.sellingPrice) - parseFloat(product.costPrice)) / parseFloat(product.costPrice)) * 100).toFixed(1)
      : '0',
    isLowStock: (product.currentStock || 0) < (product.minimumStock || 0),
  })) || [];

  return {
    data: formattedProducts,
    products: formattedProducts, // alias for convenience
    ...rest,
  };
};