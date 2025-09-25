import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Wallet, PieChart } from "lucide-react";

type MonthlyData = {
  month: string;
  revenue: number;
  transactions: number;
};

type GetTotalRevenueProps = {
  period: {
    startDate: string;
    endDate: string;
  };
  summary: {
    totalRevenue: number;
    totalTransactions: number;
    averageTransactionValue: number;
  };
  monthlyBreakdown: MonthlyData[];
};

export const GetTotalRevenue = ({
  period,
  summary,
  monthlyBreakdown,
}: GetTotalRevenueProps) => {
  const formatCurrency = (amount: number) =>
    new Intl.NumberFormat("id-ID", {
      style: "currency",
      currency: "IDR",
      minimumFractionDigits: 0,
    }).format(amount);

  const formatMonth = (monthStr: string) => {
    // Input "YYYY-MM" → Output "MMM YYYY"
    const [year, month] = monthStr.split("-");
    return new Intl.DateTimeFormat("id-ID", {
      month: "long",
      year: "numeric",
    }).format(new Date(Number(year), Number(month) - 1));
  };

  return (
    <Card className="max-w-lg border border-emerald-200 bg-gradient-to-r from-emerald-50 to-green-50">
      <CardContent className="p-4 space-y-4">
        {/* Header */}
        <div className="flex items-center gap-2 mb-2">
          <div className="flex items-center justify-center w-8 h-8 bg-emerald-500 rounded-full">
            <Wallet className="w-4 h-4 text-white" />
          </div>
          <div>
            <h3 className="font-semibold text-emerald-800">
              Laporan Total Pendapatan
            </h3>
            <p className="text-xs text-emerald-600">
              Periode: {period.startDate} → {period.endDate}
            </p>
          </div>
        </div>

        {/* Ringkasan */}
        <div className="grid grid-cols-3 gap-3 text-sm">
          <div className="flex flex-col">
            <span className="text-gray-500">Total Pendapatan</span>
            <span className="font-medium text-green-600">
              {formatCurrency(summary.totalRevenue)}
            </span>
          </div>
          <div className="flex flex-col">
            <span className="text-gray-500">Jumlah Transaksi</span>
            <span className="font-medium text-indigo-600">
              {summary.totalTransactions}
            </span>
          </div>
          <div className="flex flex-col">
            <span className="text-gray-500">Rata-rata/Transaksi</span>
            <span className="font-medium text-blue-600">
              {formatCurrency(summary.averageTransactionValue)}
            </span>
          </div>
        </div>

        {/* Breakdown Bulanan */}
        <div className="space-y-2">
          <h4 className="text-xs font-semibold text-gray-700">Rincian Bulanan</h4>
          {monthlyBreakdown.length === 0 ? (
            <p className="text-xs text-gray-500">Tidak ada data bulanan.</p>
          ) : (
            <ul className="space-y-2 max-h-60 overflow-y-auto">
              {monthlyBreakdown.map((m, i) => (
                <li
                  key={i}
                  className="flex justify-between items-center bg-white rounded border p-2 text-xs shadow-sm"
                >
                  <div>
                    <p className="font-medium text-gray-800">
                      {formatMonth(m.month)}
                    </p>
                    <p className="text-gray-500">{m.transactions} transaksi</p>
                  </div>
                  <Badge variant="outline" className="text-green-700">
                    {formatCurrency(m.revenue)}
                  </Badge>
                </li>
              ))}
            </ul>
          )}
        </div>

        {/* Catatan */}
        <div className="bg-emerald-50 border border-emerald-200 rounded p-2 text-xs text-emerald-700">
          <PieChart className="w-3 h-3 inline-block mr-1" />
          Data ini menunjukkan total pendapatan kumulatif dan tren bulanan Anda.
        </div>
      </CardContent>
    </Card>
  );
};
