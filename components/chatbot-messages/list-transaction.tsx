import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { ArrowUpCircle, ArrowDownCircle, FileX } from "lucide-react";

type Transaction = {
  id: string;
  type: "income" | "expense";
  amount: number;
  description: string;
  quantity?: number | null;
  unitPrice?: number | null;
  expenseType?: string | null;
  transactionDate: string;
  notes?: string | null;
  productName?: string | null;
};

type ListTransactionProps = {
  success: boolean;
  count?: number;
  transactions?: Transaction[];
  error?: string;
};

export const ListTransaction = ({
  success,
  count,
  transactions,
  error,
}: ListTransactionProps) => {
  const formatCurrency = (amount: number) =>
    new Intl.NumberFormat("id-ID", {
      style: "currency",
      currency: "IDR",
      minimumFractionDigits: 0,
    }).format(amount);

  if (!success) {
    return (
      <Card className="max-w-lg border border-red-200 bg-gradient-to-r from-red-50 to-rose-50">
        <CardContent className="p-4 flex items-center gap-2">
          <FileX className="w-5 h-5 text-red-500" />
          <div>
            <h3 className="font-semibold text-red-800">Gagal Memuat Transaksi</h3>
            <p className="text-xs text-red-600">{error}</p>
          </div>
        </CardContent>
      </Card>
    );
  }

  if (!transactions || transactions.length === 0) {
    return (
      <Card className="max-w-lg border border-gray-200 bg-gradient-to-r from-gray-50 to-slate-50">
        <CardContent className="p-4 flex items-center gap-2">
          <FileX className="w-5 h-5 text-gray-500" />
          <div>
            <h3 className="font-semibold text-gray-700">Tidak Ada Transaksi</h3>
            <p className="text-xs text-gray-500">Belum ada data transaksi untuk filter ini.</p>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="max-w-lg border border-blue-200 bg-gradient-to-r from-blue-50 to-indigo-50">
      <CardContent className="p-4 space-y-3">
        {/* Header */}
        <div>
          <h3 className="font-semibold text-blue-800">Daftar Transaksi</h3>
          <p className="text-xs text-blue-600">Menampilkan {count} transaksi terbaru</p>
        </div>

        {/* List Transaksi */}
        <ul className="space-y-2 max-h-72 overflow-y-auto">
          {transactions.map((t) => {
            const isIncome = t.type === "income";
            return (
              <li
                key={t.id}
                className="flex justify-between items-center bg-white rounded border p-2 text-xs shadow-sm"
              >
                <div>
                  <p className="font-medium text-gray-800">
                    {t.productName || t.description}
                  </p>
                  <p className="text-gray-500">
                    {new Date(t.transactionDate).toLocaleDateString("id-ID", {
                      day: "numeric",
                      month: "short",
                      year: "numeric",
                    })}
                  </p>
                  {t.quantity && t.unitPrice && (
                    <p className="text-gray-400">
                      {t.quantity} × {formatCurrency(t.unitPrice)}
                    </p>
                  )}
                  {t.expenseType && (
                    <p className="text-gray-400 italic">
                      Jenis: {t.expenseType}
                    </p>
                  )}
                  {t.notes && (
                    <p className="text-gray-400 italic">{t.notes}</p>
                  )}
                </div>
                <Badge
                  variant="outline"
                  className={`${
                    isIncome ? "text-green-700" : "text-orange-700"
                  } flex items-center gap-1`}
                >
                  {isIncome ? (
                    <ArrowUpCircle className="w-3 h-3" />
                  ) : (
                    <ArrowDownCircle className="w-3 h-3" />
                  )}
                  {formatCurrency(t.amount)}
                </Badge>
              </li>
            );
          })}
        </ul>
      </CardContent>
    </Card>
  );
};
