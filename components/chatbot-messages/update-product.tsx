import { Check, Package, AlertTriangle } from 'lucide-react';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';

type UpdateProductProps = {
    name: string;
    description: string;
    category: string;
    sellingPrice: number;
    costPrice: number;
    currentStock: number;
    minimumStock: number;
    status: string;
};

export const UpdateProduct = ({
    name,
    description,
    category,
    sellingPrice,
    costPrice,
    currentStock,
    minimumStock,
    status
}: UpdateProductProps) => {
    const formatCurrency = (amount: number) => {
        return new Intl.NumberFormat('id-ID', {
            style: 'currency',
            currency: 'IDR',
            minimumFractionDigits: 0,
        }).format(amount);
    };

    const profit = sellingPrice - costPrice;
    const profitMargin = ((profit / costPrice) * 100).toFixed(1);
    const isLowStock = currentStock < minimumStock;

    return (
        <Card className="max-w-lg border border-green-200 bg-gradient-to-r from-green-50 to-emerald-50">
            <CardContent className="p-4">
                {/* Success Header */}
                <div className="flex items-center gap-2 mb-3">
                    <div className="flex items-center justify-center w-8 h-8 bg-green-500 rounded-full">
                        <Check className="w-4 h-4 text-white" />
                    </div>
                    <div>
                        <h3 className="font-semibold text-green-800">Produk Di Update! ✅</h3>
                        <p className="text-xs text-green-600">Berhasil diupdate ke inventori</p>
                    </div>
                </div>

                {/* Product Info */}
                <div className="space-y-3">
                    <div>
                        <div className="flex items-start justify-between mb-1">
                            <h4 className="font-medium text-gray-900 text-sm">{name}</h4>
                            <Badge variant="outline" className="text-xs ml-2">
                                {category}
                            </Badge>
                        </div>
                        <p className="text-xs text-gray-600 line-clamp-2">{description}</p>
                    </div>

                    {/* Key Info Grid */}
                    <div className="grid grid-cols-2 gap-3 text-xs">
                        <div className="space-y-1">
                            <div className="flex justify-between">
                                <span className="text-gray-500">Harga Jual:</span>
                                <span className="font-medium text-green-600">{formatCurrency(sellingPrice)}</span>
                            </div>
                            <div className="flex justify-between">
                                <span className="text-gray-500">Keuntungan:</span>
                                <span className="font-medium text-emerald-600">
                                    {formatCurrency(profit)} ({profitMargin}%)
                                </span>
                            </div>
                        </div>
                        <div className="space-y-1">
                            <div className="flex justify-between">
                                <span className="text-gray-500">Stok:</span>
                                <span className={`font-medium ${isLowStock ? 'text-red-600' : 'text-blue-600'}`}>
                                    {currentStock}
                                </span>
                            </div>
                            <div className="flex justify-between">
                                <span className="text-gray-500">Status:</span>
                                <Badge variant={status.toLowerCase() === 'active' ? 'default' : 'secondary'} className="text-xs capitalize">
                                    {status}
                                </Badge>
                            </div>
                        </div>
                    </div>

                    {/* Warnings */}
                    {isLowStock && (
                        <div className="bg-orange-50 border border-orange-200 rounded p-2 flex items-center gap-2">
                            <AlertTriangle className="w-3 h-3 text-orange-500" />
                            <span className="text-xs text-orange-700">
                                Stok rendah! (Min: {minimumStock})
                            </span>
                        </div>
                    )}

                    {/* Quick Tip */}
                    <div className="bg-blue-50 border border-blue-200 rounded p-2">
                        <p className="text-xs text-blue-700">
                            💡 Profit {profitMargin}% per item - {formatCurrency(profit)} keuntungan!
                        </p>
                    </div>
                </div>
            </CardContent>
        </Card>
    );
};