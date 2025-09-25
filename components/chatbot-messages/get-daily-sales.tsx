import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { ArrowUpCircle, ShoppingCart } from "lucide-react";

type Transaction = {
  id: string;
  amount: number;
  description: string;
  quantity: number;
  unitPrice: number;
  productName?: string | null;
  time: string;
};

type getDailySalesProps = {
  date: string;
  summary: {
    totalSales: number;
    totalTransactions: number;
  };
  transactions: Transaction[];
};

export const GetDailySales = ({ date, summary, transactions }: getDailySalesProps) => {
  const formatCurrency = (amount: number) =>
    new Intl.NumberFormat("id-ID", {
      style: "currency",
      currency: "IDR",
      minimumFractionDigits: 0,
    }).format(amount);

  return (
    <Card className="max-w-lg border border-blue-200 bg-gradient-to-r from-blue-50 to-indigo-50">
      <CardContent className="p-4 space-y-4">
        {/* Header */}
        <div className="flex items-center gap-2 mb-2">
          <div className="flex items-center justify-center w-8 h-8 bg-blue-500 rounded-full">
            <ArrowUpCircle className="w-4 h-4 text-white" />
          </div>
          <div>
            <h3 className="font-semibold text-blue-800">Laporan Penjualan Harian</h3>
            <p className="text-xs text-blue-600">Tanggal: {date}</p>
          </div>
        </div>

        {/* Ringkasan */}
        <div className="grid grid-cols-2 gap-3 text-sm">
          <div className="flex flex-col">
            <span className="text-gray-500">Total Penjualan</span>
            <span className="font-medium text-green-600">{formatCurrency(summary.totalSales)}</span>
          </div>
          <div className="flex flex-col">
            <span className="text-gray-500">Jumlah Transaksi</span>
            <span className="font-medium text-indigo-600">{summary.totalTransactions}</span>
          </div>
        </div>

        {/* Daftar Transaksi */}
        <div className="space-y-2">
          <h4 className="text-xs font-semibold text-gray-700">Detail Transaksi</h4>
          {transactions.length === 0 ? (
            <p className="text-xs text-gray-500">Belum ada transaksi hari ini.</p>
          ) : (
            <ul className="space-y-2">
              {transactions.map((t) => (
                <li
                  key={t.id}
                  className="flex justify-between items-center bg-white rounded border p-2 text-xs shadow-sm"
                >
                  <div>
                    <p className="font-medium text-gray-800">
                      {t.productName || "Produk Tanpa Nama"}
                    </p>
                    <p className="text-gray-500">
                      {t.quantity} × {formatCurrency(t.unitPrice)}
                    </p>
                    {t.description && (
                      <p className="text-gray-400 italic">{t.description}</p>
                    )}
                  </div>
                  <Badge variant="outline" className="text-green-700">
                    +{formatCurrency(t.amount)}
                  </Badge>
                </li>
              ))}
            </ul>
          )}
        </div>

        {/* Catatan */}
        <div className="bg-blue-50 border border-blue-200 rounded p-2 text-xs text-blue-700">
          <ShoppingCart className="w-3 h-3 inline-block mr-1" />
          Terus pantau penjualan harian untuk optimasi stok dan keuntungan!
        </div>
      </CardContent>
    </Card>
  );
};
