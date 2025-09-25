import { Package, AlertTriangle, TrendingUp, ShoppingBag } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';

type Product = {
    id: string;
    name: string;
    description: string;
    category: string;
    sellingPrice: number;
    costPrice: number;
    currentStock: number;
    minimumStock: number;
    status: string;
    sku?: string | null;
    isLowStock: boolean;
};

type ListProductResponse = {
    success: boolean;
    count: number;
    products: Product[];
};

type ListProductProps = {
    data: ListProductResponse;
};

export const ListProduct = ({ data }: ListProductProps) => {
    const formatCurrency = (amount: number) => {
        return new Intl.NumberFormat('id-ID', {
            style: 'currency',
            currency: 'IDR',
            minimumFractionDigits: 0,
        }).format(amount);
    };

    const calculateProfit = (sellingPrice: number, costPrice: number) => {
        const profit = sellingPrice - costPrice;
        const profitMargin = costPrice > 0 ? ((profit / costPrice) * 100).toFixed(1) : '0';
        return { profit, profitMargin };
    };

    if (!data.success || data.count === 0) {
        return (
            <Card className="max-w-4xl border border-gray-200">
                <CardContent className="p-6 text-center">
                    <ShoppingBag className="w-12 h-12 text-gray-400 mx-auto mb-4" />
                    <h3 className="font-semibold text-gray-700 mb-2">Tidak Ada Produk</h3>
                    <p className="text-gray-500 text-sm">Belum ada produk yang ditambahkan ke inventori.</p>
                </CardContent>
            </Card>
        );
    }

    const lowStockCount = data.products.filter(p => p.isLowStock).length;
    const activeProducts = data.products.filter(p => p.status === 'active').length;

    return (
        <Card className="max-w-6xl border border-blue-200 bg-gradient-to-r from-blue-50 to-indigo-50">
            <CardHeader className="pb-4">
                <div className="flex items-center gap-3 mb-2">
                    <div className="flex items-center justify-center w-10 h-10 bg-blue-500 rounded-lg">
                        <Package className="w-5 h-5 text-white" />
                    </div>
                    <div>
                        <CardTitle className="text-blue-800">Daftar Produk Inventori 📦</CardTitle>
                        <p className="text-sm text-blue-600">Total {data.count} produk dalam katalog</p>
                    </div>
                </div>

                <div className="flex gap-4 mt-4">
                    <div className="flex items-center gap-2 px-3 py-2 bg-green-100 rounded-lg">
                        <TrendingUp className="w-4 h-4 text-green-600" />
                        <span className="text-sm text-green-700 font-medium">{activeProducts} Aktif</span>
                    </div>
                    {lowStockCount > 0 && (
                        <div className="flex items-center gap-2 px-3 py-2 bg-red-100 rounded-lg">
                            <AlertTriangle className="w-4 h-4 text-red-600" />
                            <span className="text-sm text-red-700 font-medium">{lowStockCount} Stok Rendah</span>
                        </div>
                    )}
                </div>
            </CardHeader>

            <CardContent className="p-0">
                <div className="overflow-x-auto">
                    <Table>
                        <TableHeader>
                            <TableRow className="bg-gray-50">
                                <TableHead className="font-semibold">Produk</TableHead>
                                <TableHead className="font-semibold">Kategori</TableHead>
                                <TableHead className="font-semibold text-right">Harga</TableHead>
                                <TableHead className="font-semibold text-right">Keuntungan</TableHead>
                                <TableHead className="font-semibold text-center">Stok</TableHead>
                                <TableHead className="font-semibold text-center">Status</TableHead>
                            </TableRow>
                        </TableHeader>
                        <TableBody>
                            {data.products.map((product) => {
                                const { profit, profitMargin } = calculateProfit(product.sellingPrice, product.costPrice);

                                return (
                                    <TableRow key={product.id} className="hover:bg-gray-50">
                                        <TableCell>
                                            <div>
                                                <div className="font-medium text-gray-900">{product.name}</div>
                                                <div className="text-xs text-gray-500 line-clamp-2 mt-1">
                                                    {product.description}
                                                </div>
                                                {product.sku && (
                                                    <div className="text-xs text-gray-400 mt-1">SKU: {product.sku}</div>
                                                )}
                                            </div>
                                        </TableCell>

                                        <TableCell>
                                            <Badge variant="outline" className="text-xs">
                                                {product.category}
                                            </Badge>
                                        </TableCell>

                                        <TableCell className="text-right">
                                            <div className="space-y-1">
                                                <div className="font-medium text-green-600">
                                                    {formatCurrency(product.sellingPrice)}
                                                </div>
                                                <div className="text-xs text-gray-500">
                                                    Modal: {formatCurrency(product.costPrice)}
                                                </div>
                                            </div>
                                        </TableCell>

                                        <TableCell className="text-right">
                                            <div className="space-y-1">
                                                <div className="font-medium text-emerald-600">
                                                    {formatCurrency(profit)}
                                                </div>
                                                <div className="text-xs text-gray-500">
                                                    {profitMargin}% margin
                                                </div>
                                            </div>
                                        </TableCell>

                                        <TableCell className="text-center">
                                            <div className="space-y-1">
                                                <div className={`font-medium ${product.isLowStock ? 'text-red-600' : 'text-blue-600'}`}>
                                                    {product.currentStock}
                                                </div>
                                                <div className="text-xs text-gray-500">
                                                    Min: {product.minimumStock}
                                                </div>
                                                {product.isLowStock && (
                                                    <Badge variant="destructive" className="text-xs">
                                                        Rendah
                                                    </Badge>
                                                )}
                                            </div>
                                        </TableCell>

                                        <TableCell className="text-center">
                                            <Badge
                                                variant={product.status.toLowerCase() === 'active' ? 'default' : 'secondary'}
                                                className="text-xs capitalize"
                                            >
                                                {product.status}
                                            </Badge>
                                        </TableCell>
                                    </TableRow>
                                );
                            })}
                        </TableBody>
                    </Table>
                </div>

                {/* Summary Footer */}
                <div className="bg-gradient-to-r from-gray-50 to-blue-50 p-4 border-t">
                    <div className="flex justify-between items-center text-sm">
                        <div className="text-gray-600">
                            Menampilkan {data.products.length} dari {data.count} produk
                        </div>
                        <div className="flex gap-6 text-xs">
                            <span className="text-green-600">
                                💰 Total Modal: {formatCurrency(data.products.reduce((sum, p) => sum + (p.costPrice * p.currentStock), 0))}
                            </span>
                            <span className="text-blue-600">
                                📊 Total Nilai Jual: {formatCurrency(data.products.reduce((sum, p) => sum + (p.sellingPrice * p.currentStock), 0))}
                            </span>
                        </div>
                    </div>
                </div>
            </CardContent>
        </Card>
    );
};