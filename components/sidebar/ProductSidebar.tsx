"use client";

import { useState } from "react";
import { RefreshCw } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { SidebarGroup, SidebarGroupContent, SidebarGroupLabel } from "@/components/ui/sidebar";
import { useProductsWithFormattedPrices, useRefreshProducts } from "@/hooks/use-products";

interface ProductSidebarProps {
  className?: string;
}

export function ProductSidebar({ className }: ProductSidebarProps) {
  const [searchTerm, setSearchTerm] = useState('');

  const { data: products, isLoading, isError } = useProductsWithFormattedPrices();
  const refreshProducts = useRefreshProducts();

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('id-ID', {
      style: 'currency',
      currency: 'IDR',
      minimumFractionDigits: 0,
    }).format(amount);
  };

  // Filter products based on search term
  const filteredProducts = (products || []).filter(product =>
    product.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    product.category?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <SidebarGroup className={`flex-1 flex flex-col min-h-0 ${className}`}>
      <SidebarGroupLabel>Produk</SidebarGroupLabel>
      <SidebarGroupContent className="flex-1 flex flex-col min-h-0">
        <div className="px-2 pb-2 flex-shrink-0">
          <Input
            placeholder="Cari produk..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="h-8 w-full"
          />
        </div>

        <div className="space-y-2 px-2 flex-1 min-h-0 overflow-y-auto">
          {isLoading && (
            <div className="flex items-center justify-center py-4">
              <RefreshCw className="h-4 w-4 animate-spin" />
              <span className="ml-2 text-sm text-muted-foreground">Loading products...</span>
            </div>
          )}

          {isError && (
            <div className="text-center py-4">
              <p className="text-sm text-red-600">Failed to load products</p>
              <Button
                size="sm"
                variant="outline"
                className="mt-2"
                onClick={refreshProducts}
              >
                <RefreshCw className="h-3 w-3 mr-1" />
                Retry
              </Button>
            </div>
          )}

          {!isLoading && !isError && filteredProducts.length === 0 && (
            <div className="text-center py-4">
              <p className="text-sm text-muted-foreground">
                {searchTerm ? 'No products found' : 'No products yet'}
              </p>
            </div>
          )}

          {filteredProducts.map((product) => (
            <Card key={product.id} className="p-3 w-full">
              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <h4 className="text-sm font-medium line-clamp-1 flex-1 min-w-0">{product.name}</h4>
                  <Badge
                    variant={product.isLowStock ? "destructive" : "secondary"}
                    className="text-xs flex-shrink-0 ml-2"
                  >
                    {product.currentStock || 0}
                  </Badge>
                </div>
                <p className="text-xs text-muted-foreground line-clamp-2">{product.description}</p>
                <div className="flex items-center justify-between">
                  <span className="text-xs font-medium truncate flex-1 min-w-0">{product.formattedSellingPrice}</span>
                  <Badge variant="outline" className="text-xs flex-shrink-0 ml-2">{product.category}</Badge>
                </div>
                {product.isLowStock && (
                  <p className="text-xs text-red-600">Stok rendah!</p>
                )}
              </div>
            </Card>
          ))}
        </div>
      </SidebarGroupContent>
    </SidebarGroup>
  );
}