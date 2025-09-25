import { Card, CardContent } from "@/components/ui/card";
import { TrendingUp, TrendingDown, Minus } from "lucide-react";

type ComparisonData = {
  comparison: {
    current: {
      month: number;
      year: number;
      totalSales: number;
      totalTransactions: number;
    };
    previous: {
      month: number;
      year: number;
      totalSales: number;
      totalTransactions: number;
    };
  };
  growth: {
    salesAmount: number;
    salesPercentage: number;
    transactionsAmount: number;
    transactionsPercentage: number;
    trend: "increasing" | "decreasing" | "stable";
  };
};

export const CompareMonthlySales = ({ comparison, growth }: ComparisonData) => {
  const formatCurrency = (amount: number) =>
    new Intl.NumberFormat("id-ID", {
      style: "currency",
      currency: "IDR",
      minimumFractionDigits: 0,
    }).format(amount);

  const bulanIndo = (month: number, year: number) =>
    new Intl.DateTimeFormat("id-ID", { month: "long", year: "numeric" }).format(
      new Date(year, month - 1)
    );

  const TrendIcon =
    growth.trend === "increasing"
      ? TrendingUp
      : growth.trend === "decreasing"
      ? TrendingDown
      : Minus;

  const trendColor =
    growth.trend === "increasing"
      ? "text-green-600"
      : growth.trend === "decreasing"
      ? "text-red-600"
      : "text-gray-600";

  return (
    <Card className="max-w-lg border border-yellow-200 bg-gradient-to-r from-yellow-50 to-orange-50">
      <CardContent className="p-4 space-y-4">
        {/* Header */}
        <div className="flex items-center gap-2 mb-2">
          <div className="flex items-center justify-center w-8 h-8 bg-yellow-500 rounded-full">
            <TrendIcon className={`w-4 h-4 text-white`} />
          </div>
          <div>
            <h3 className="font-semibold text-yellow-800">
              Perbandingan Penjualan Bulanan
            </h3>
            <p className="text-xs text-yellow-600">
              {bulanIndo(comparison.previous.month, comparison.previous.year)} ↔{" "}
              {bulanIndo(comparison.current.month, comparison.current.year)}
            </p>
          </div>
        </div>

        {/* Ringkasan */}
        <div className="grid grid-cols-2 gap-4 text-sm">
          <div className="flex flex-col bg-white rounded border p-2 shadow-sm">
            <span className="text-gray-500">Bulan Sebelumnya</span>
            <span className="font-medium text-red-600">
              {formatCurrency(comparison.previous.totalSales)}
            </span>
            <span className="text-xs text-gray-400">
              {comparison.previous.totalTransactions} transaksi
            </span>
          </div>
          <div className="flex flex-col bg-white rounded border p-2 shadow-sm">
            <span className="text-gray-500">Bulan Sekarang</span>
            <span className="font-medium text-green-600">
              {formatCurrency(comparison.current.totalSales)}
            </span>
            <span className="text-xs text-gray-400">
              {comparison.current.totalTransactions} transaksi
            </span>
          </div>
        </div>

        {/* Pertumbuhan */}
        <div className="bg-white border rounded p-3 text-sm">
          <p className={`font-medium ${trendColor} flex items-center gap-1`}>
            <TrendIcon className="w-4 h-4" />
            Tren Penjualan:{" "}
            {growth.trend === "increasing"
              ? "Naik 📈"
              : growth.trend === "decreasing"
              ? "Turun 📉"
              : "Stabil ⚖️"}
          </p>
          <div className="mt-2 grid grid-cols-2 gap-3 text-xs">
            <div>
              <span className="text-gray-500 block">Perubahan Nominal</span>
              <span className={`${trendColor} font-medium`}>
                {formatCurrency(growth.salesAmount)} (
                {growth.salesPercentage.toFixed(1)}%)
              </span>
            </div>
            <div>
              <span className="text-gray-500 block">Perubahan Transaksi</span>
              <span className="font-medium text-indigo-600">
                {growth.transactionsAmount} ({growth.transactionsPercentage.toFixed(1)}%)
              </span>
            </div>
          </div>
        </div>

        {/* Catatan */}
        <div className="bg-yellow-50 border border-yellow-200 rounded p-2 text-xs text-yellow-700">
          Gunakan data ini untuk memahami tren penjualan bulanan dan rencanakan strategi selanjutnya 🔍
        </div>
      </CardContent>
    </Card>
  );
};
