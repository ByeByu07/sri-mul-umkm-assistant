import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { CalendarDays, BarChart2 } from "lucide-react";

type DailyData = {
  date: string;
  sales: number;
  transactions: number;
};

type GetMonthlySalesProps = {
  month: number;
  year: number;
  summary: {
    totalSales: number;
    totalTransactions: number;
    averageDailySales: number;
  };
  dailyBreakdown: DailyData[];
};

export const GetMonthlySales = ({
  month,
  year,
  summary,
  dailyBreakdown,
}: GetMonthlySalesProps) => {
  const formatCurrency = (amount: number) =>
    new Intl.NumberFormat("id-ID", {
      style: "currency",
      currency: "IDR",
      minimumFractionDigits: 0,
    }).format(amount);

  const bulanIndo = new Intl.DateTimeFormat("id-ID", { month: "long" }).format(
    new Date(year, month - 1)
  );

  return (
    <Card className="max-w-lg border border-purple-200 bg-gradient-to-r from-purple-50 to-pink-50">
      <CardContent className="p-4 space-y-4">
        {/* Header */}
        <div className="flex items-center gap-2 mb-2">
          <div className="flex items-center justify-center w-8 h-8 bg-purple-500 rounded-full">
            <CalendarDays className="w-4 h-4 text-white" />
          </div>
          <div>
            <h3 className="font-semibold text-purple-800">Laporan Penjualan Bulanan</h3>
            <p className="text-xs text-purple-600">
              {bulanIndo} {year}
            </p>
          </div>
        </div>

        {/* Ringkasan */}
        <div className="grid grid-cols-3 gap-3 text-sm">
          <div className="flex flex-col">
            <span className="text-gray-500">Total Penjualan</span>
            <span className="font-medium text-green-600">
              {formatCurrency(summary.totalSales)}
            </span>
          </div>
          <div className="flex flex-col">
            <span className="text-gray-500">Transaksi</span>
            <span className="font-medium text-indigo-600">
              {summary.totalTransactions}
            </span>
          </div>
          <div className="flex flex-col">
            <span className="text-gray-500">Rata-rata Harian</span>
            <span className="font-medium text-blue-600">
              {formatCurrency(summary.averageDailySales)}
            </span>
          </div>
        </div>

        {/* Breakdown Harian */}
        <div className="space-y-2">
          <h4 className="text-xs font-semibold text-gray-700">Rincian Harian</h4>
          {dailyBreakdown.length === 0 ? (
            <p className="text-xs text-gray-500">Belum ada data transaksi bulan ini.</p>
          ) : (
            <ul className="space-y-2 max-h-60 overflow-y-auto">
              {dailyBreakdown.map((d, i) => {
                const tanggal = new Date(d.date).toLocaleDateString("id-ID", {
                  day: "numeric",
                  month: "short",
                });
                return (
                  <li
                    key={i}
                    className="flex justify-between items-center bg-white rounded border p-2 text-xs shadow-sm"
                  >
                    <div>
                      <p className="font-medium text-gray-800">{tanggal}</p>
                      <p className="text-gray-500">{d.transactions} transaksi</p>
                    </div>
                    <Badge variant="outline" className="text-green-700">
                      {formatCurrency(d.sales)}
                    </Badge>
                  </li>
                );
              })}
            </ul>
          )}
        </div>

        {/* Catatan */}
        <div className="bg-purple-50 border border-purple-200 rounded p-2 text-xs text-purple-700">
          <BarChart2 className="w-3 h-3 inline-block mr-1" />
          Pantau tren bulanan untuk mengukur pertumbuhan penjualan Anda 📈
        </div>
      </CardContent>
    </Card>
  );
};
