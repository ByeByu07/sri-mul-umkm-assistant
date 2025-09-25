import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { CheckCircle, XCircle, ArrowDownCircle, ArrowUpCircle } from "lucide-react";

type TransactionData = {
  id: string;
  type: "income" | "expense";
  amount: number;
  description: string;
  quantity?: number | null;
  unitPrice?: number | null;
  expenseType?: "operating" | "cogs" | "capital" | "other" | null;
  transactionDate: string;
  notes?: string | null;
};

type RecordTransactionProps = {
  success: boolean;
  transaction?: TransactionData;
  error?: string;
};

export const RecordTransaction = ({ success, transaction, error }: RecordTransactionProps) => {
  const formatCurrency = (amount: number) =>
    new Intl.NumberFormat("id-ID", {
      style: "currency",
      currency: "IDR",
      minimumFractionDigits: 0,
    }).format(amount);

  if (!success) {
    return (
      <Card className="max-w-lg border border-red-200 bg-gradient-to-r from-red-50 to-rose-50">
        <CardContent className="p-4">
          <div className="flex items-center gap-2 mb-3">
            <div className="flex items-center justify-center w-8 h-8 bg-red-500 rounded-full">
              <XCircle className="w-4 h-4 text-white" />
            </div>
            <div>
              <h3 className="font-semibold text-red-800">Gagal Mencatat Transaksi ❌</h3>
              <p className="text-xs text-red-600">{error}</p>
            </div>
          </div>
        </CardContent>
      </Card>
    );
  }

  if (!transaction) return null;

  const isIncome = transaction.type === "income";

  return (
    <Card className="max-w-lg border border-green-200 bg-gradient-to-r from-green-50 to-emerald-50">
      <CardContent className="p-4 space-y-3">
        {/* Header */}
        <div className="flex items-center gap-2 mb-2">
          <div
            className={`flex items-center justify-center w-8 h-8 rounded-full ${
              isIncome ? "bg-green-500" : "bg-orange-500"
            }`}
          >
            {isIncome ? (
              <ArrowUpCircle className="w-4 h-4 text-white" />
            ) : (
              <ArrowDownCircle className="w-4 h-4 text-white" />
            )}
          </div>
          <div>
            <h3 className="font-semibold text-gray-800">
              {isIncome ? "Transaksi Pemasukan Dicatat ✅" : "Transaksi Pengeluaran Dicatat ✅"}
            </h3>
            <p className="text-xs text-gray-600">
              {new Date(transaction.transactionDate).toLocaleDateString("id-ID", {
                day: "numeric",
                month: "long",
                year: "numeric",
              })}
            </p>
          </div>
        </div>

        {/* Detail Transaksi */}
        <div className="grid grid-cols-2 gap-3 text-sm">
          <div className="flex flex-col">
            <span className="text-gray-500">Nominal</span>
            <span className={isIncome ? "text-green-600 font-medium" : "text-orange-600 font-medium"}>
              {formatCurrency(transaction.amount)}
            </span>
          </div>
          <div className="flex flex-col">
            <span className="text-gray-500">Tipe</span>
            <Badge
              variant="outline"
              className={isIncome ? "text-green-700 capitalize" : "text-orange-700 capitalize"}
            >
              {isIncome ? "Pemasukan" : "Pengeluaran"}
            </Badge>
          </div>
          {transaction.quantity && transaction.unitPrice && (
            <div className="flex flex-col col-span-2">
              <span className="text-gray-500">Jumlah & Harga Satuan</span>
              <span className="text-gray-800 font-medium">
                {transaction.quantity} × {formatCurrency(transaction.unitPrice)}
              </span>
            </div>
          )}
          {transaction.expenseType && (
            <div className="flex flex-col col-span-2">
              <span className="text-gray-500">Jenis Pengeluaran</span>
              <span className="text-gray-800 font-medium capitalize">
                {transaction.expenseType}
              </span>
            </div>
          )}
          <div className="flex flex-col col-span-2">
            <span className="text-gray-500">Deskripsi</span>
            <span className="text-gray-800">{transaction.description}</span>
          </div>
          {transaction.notes && (
            <div className="flex flex-col col-span-2">
              <span className="text-gray-500">Catatan Tambahan</span>
              <span className="text-gray-800 italic">{transaction.notes}</span>
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="bg-green-50 border border-green-200 rounded p-2 text-xs text-green-700 flex items-center gap-1">
          <CheckCircle className="w-3 h-3" />
          Transaksi berhasil dicatat dalam sistem.
        </div>
      </CardContent>
    </Card>
  );
};
