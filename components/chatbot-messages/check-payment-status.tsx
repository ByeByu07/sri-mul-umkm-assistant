import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import {
  CheckCircle,
  XCircle,
  Clock,
  CreditCard,
  AlertTriangle,
} from "lucide-react";

type PaymentData = {
  id: string | null;
  type: string | null;
  status: string | null;
  grossAmount: number | null;
  paymentType: string | null;
  description: string | null;
  quantity: number | null;
  transactionDate: string | null;
};

type MidtransPaymentProps = {
  success: boolean;
  transaction?: PaymentData;
  error?: string;
};

export const CheckPaymentStatus = ({
  success,
  transaction,
  error,
}: MidtransPaymentProps) => {
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
          <XCircle className="w-5 h-5 text-red-500" />
          <div>
            <h3 className="font-semibold text-red-800">Gagal Mengecek Status</h3>
            <p className="text-xs text-red-600">{error}</p>
          </div>
        </CardContent>
      </Card>
    );
  }

  if (!transaction) {
    return (
      <Card className="max-w-lg border border-gray-200 bg-gradient-to-r from-gray-50 to-slate-50">
        <CardContent className="p-4 flex items-center gap-2">
          <AlertTriangle className="w-5 h-5 text-gray-500" />
          <div>
            <h3 className="font-semibold text-gray-700">Data Tidak Ditemukan</h3>
            <p className="text-xs text-gray-500">
              Transaksi tidak tersedia di sistem Midtrans.
            </p>
          </div>
        </CardContent>
      </Card>
    );
  }

  const status = transaction.status?.toLowerCase() || "unknown";

  let statusLabel = "Tidak Diketahui";
  let statusColor = "bg-gray-500";
  let statusMessage = "Status transaksi tidak diketahui.";
  let StatusIcon = AlertTriangle;

  switch (status) {
    case "pending":
      statusLabel = "Menunggu ⏳";
      statusColor = "bg-yellow-500";
      statusMessage = "Pembayaran masih menunggu konfirmasi.";
      StatusIcon = Clock;
      break;
    case "settlement":
      statusLabel = "Berhasil ✅";
      statusColor = "bg-green-500";
      statusMessage = "Pembayaran berhasil diproses.";
      StatusIcon = CheckCircle;
      break;
    case "expire":
      statusLabel = "Kedaluwarsa ⏰";
      statusColor = "bg-orange-500";
      statusMessage = "Waktu pembayaran telah habis.";
      StatusIcon = AlertTriangle;
      break;
    case "cancel":
      statusLabel = "Dibatalkan ❌";
      statusColor = "bg-red-500";
      statusMessage = "Transaksi dibatalkan oleh pengguna.";
      StatusIcon = XCircle;
      break;
    case "deny":
      statusLabel = "Ditolak 🚫";
      statusColor = "bg-red-600";
      statusMessage = "Pembayaran ditolak.";
      StatusIcon = XCircle;
      break;
    case "failure":
      statusLabel = "Gagal ❌";
      statusColor = "bg-red-700";
      statusMessage = "Terjadi kegagalan dalam transaksi.";
      StatusIcon = XCircle;
      break;
  }

  return (
    <Card className="max-w-lg border border-indigo-200 bg-gradient-to-r from-indigo-50 to-blue-50">
      <CardContent className="p-4 space-y-3">
        {/* Header */}
        <div className="flex items-center gap-2 mb-2">
          <div
            className={`flex items-center justify-center w-8 h-8 rounded-full ${statusColor}`}
          >
            <StatusIcon className="w-4 h-4 text-white" />
          </div>
          <div>
            <h3 className="font-semibold text-gray-800">
              Status Pembayaran: {statusLabel}
            </h3>
            <p className="text-xs text-gray-600">
              {transaction.transactionDate
                ? new Date(transaction.transactionDate).toLocaleString("id-ID")
                : "-"}
            </p>
          </div>
        </div>

        {/* Detail Transaksi */}
        <div className="grid grid-cols-2 gap-3 text-sm">
          <div className="flex flex-col">
            <span className="text-gray-500">ID Transaksi</span>
            <span className="font-medium text-gray-800">{transaction.id}</span>
          </div>
          <div className="flex flex-col">
            <span className="text-gray-500">Jenis</span>
            <span className="font-medium text-gray-800">
              {transaction.type || "-"}
            </span>
          </div>
          <div className="flex flex-col">
            <span className="text-gray-500">Nominal</span>
            <span className="font-medium text-green-600">
              {transaction.grossAmount
                ? formatCurrency(transaction.grossAmount)
                : "-"}
            </span>
          </div>
          <div className="flex flex-col">
            <span className="text-gray-500">Metode Bayar</span>
            <span className="flex items-center gap-1 font-medium text-indigo-700">
              <CreditCard className="w-3 h-3" />
              {transaction.paymentType || "-"}
            </span>
          </div>
          <div className="flex flex-col col-span-2">
            <span className="text-gray-500">Deskripsi</span>
            <span className="text-gray-800">
              {transaction.description || "-"}
            </span>
          </div>
          {transaction.quantity && (
            <div className="flex flex-col col-span-2">
              <span className="text-gray-500">Jumlah Item</span>
              <span className="text-gray-800">{transaction.quantity}</span>
            </div>
          )}
        </div>

        {/* Footer */}
        <div
          className={`rounded p-2 text-xs ${
            status.startsWith("settlement")
              ? "bg-green-50 border border-green-200 text-green-700"
              : status === "pending"
              ? "bg-yellow-50 border border-yellow-200 text-yellow-700"
              : "bg-red-50 border border-red-200 text-red-700"
          }`}
        >
          {statusMessage}
        </div>
      </CardContent>
    </Card>
  );
};
