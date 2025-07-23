import React, { useEffect, useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { TrendingUp, Calendar, Package, BarChart3, Search, Download, Eye } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, LineChart, Line, AreaChart, Area, PieChart, Pie, Cell, Legend } from 'recharts'; // Added LineChart, Line, AreaChart, Area, PieChart, Pie, Cell, Legend

type MonthlyTrend = { month: string; items: number; spent: number };
type YearlyTrend = { year: string; items: number; spent: number };
type CategoryBreakdown = { category: string; count: number };

type ReportData = {
  totalSpent: number;
  totalPurchases: number;
  monthlyTrends: MonthlyTrend[];
  categoryBreakdown: CategoryBreakdown[];
  yearlyTrends: YearlyTrend[]; // Add yearly trends to ReportData
};

interface Purchase {
  _id: string;
  date: string;
  items: Array<{ name: string; quantity: number; price?: number; project?: string }>;
  billFile?: string;
  totalItems: number;
}

export default function Reports() {
  const [data, setData] = useState<ReportData | null>(null);
  const [purchases, setPurchases] = useState<Purchase[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedDate, setSelectedDate] = useState(""); // New state for date filter
  const [searchQuery, setSearchQuery] = useState(""); // New state for search query

  useEffect(() => {
    Promise.all([
      fetch(`${import.meta.env.VITE_API_URL}/api/reports/summary`).then((res) => res.json()),
      fetch(`${import.meta.env.VITE_API_URL}/api/purchases`).then((res) => res.json()),
    ])
      .then(([summaryData, purchasesData]) => {
        setData(summaryData);
        setPurchases(purchasesData);
        setLoading(false);
      })
      .catch(() => setLoading(false));
  }, []);

  if (loading) return <div>Loading...</div>;
  if (!data) return <div>Failed to load report data.</div>;

  const filteredPurchases = purchases.filter((purchase) => {
    const matchesDate = selectedDate ? purchase.date === selectedDate : true;
    const matchesSearch = searchQuery
      ? purchase.items.some((item) => item.name.toLowerCase().includes(searchQuery.toLowerCase()))
      : true;
    return matchesDate && matchesSearch;
  });

  const API_URL = import.meta.env.VITE_API_URL;

  const viewBill = (purchase: Purchase) => {
    if (purchase.billFile) {
      const isFullUrl = purchase.billFile.startsWith('http://') || purchase.billFile.startsWith('https://');
      const billUrl = isFullUrl
        ? purchase.billFile
        : `${API_URL}/uploads/${purchase.billFile}`;
      window.open(billUrl, '_blank');
    }
  };

  const projectBreakdownChartDataMap = new Map<string, number>();
  filteredPurchases.forEach(p => {
    p.items.forEach(item => {
      const projectName = item.project || "Uncategorized";
      projectBreakdownChartDataMap.set(projectName, (projectBreakdownChartDataMap.get(projectName) || 0) + item.quantity);
    });
  });
  const projectBreakdownChartData = Array.from(projectBreakdownChartDataMap.entries()).map(([name, quantity]) => ({
    name,
    value: quantity,
  }));

  const COLORS = ['#0088FE', '#00C49F', '#FFBB28', '#FF8042', '#A28DFF', '#FF6F61', '#6B5B95', '#88B04B']; // Colors for PieChart

  return (
    <div className="space-y-8 animate-fade-in">
      {/* Header */}
      <div className="flex flex-col gap-2">
        <h1 className="text-3xl font-bold">Reports & Analytics</h1>
        <p className="text-muted-foreground">
          Analyze your component purchasing patterns and spending
        </p>
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <Card className="stat-card">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Spent</CardTitle>
            <TrendingUp className="h-4 w-4 text-primary" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-primary">₹{data.totalSpent}</div>
          </CardContent>
        </Card>
        <Card className="stat-card">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Purchases</CardTitle>
            <Calendar className="h-4 w-4 text-primary" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-primary">{data.totalPurchases}</div>
          </CardContent>
        </Card>
        <Card className="stat-card">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Projects</CardTitle>
            <Package className="h-4 w-4 text-primary" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-primary">{data.categoryBreakdown.length}</div>
          </CardContent>
        </Card>
        <Card className="stat-card">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Top Month</CardTitle>
            <BarChart3 className="h-4 w-4 text-primary" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-primary">
              {data.monthlyTrends.length > 0 ? data.monthlyTrends.reduce((a, b) => (a.spent > b.spent ? a : b)).month : "-"}
            </div>
          </CardContent>
        </Card>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* Monthly Trends Chart */}
        <Card className="glass-card">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <BarChart3 className="h-5 w-5" />
              Monthly Purchase Trends
            </CardTitle>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={300}>
              <LineChart data={data.monthlyTrends}>
                <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--muted-foreground) / 0.2)" />
                <XAxis dataKey="month" stroke="hsl(var(--muted-foreground))" />
                <YAxis stroke="hsl(var(--muted-foreground))" />
                <Tooltip
                  cursor={{ fill: 'hsl(var(--primary) / 0.2)' }}
                  formatter={(value: number) => [`₹${value}`, 'Spent']}
                  labelFormatter={(label: string) => `Month: ${label}`}
                  contentStyle={{ backgroundColor: 'hsl(var(--card))', border: '1px solid hsl(var(--border))', borderRadius: '0.5rem' }}
                  labelStyle={{ color: 'hsl(var(--foreground))' }}
                  itemStyle={{ color: 'hsl(var(--primary))' }}
                />
                <Line type="monotone" dataKey="spent" stroke="hsl(var(--primary))" activeDot={{ r: 8 }} />
              </LineChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        {/* Yearly Trends Chart */}
        <Card className="glass-card">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <BarChart3 className="h-5 w-5" />
              Yearly Purchase Trends
            </CardTitle>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={300}>
              <AreaChart data={data.yearlyTrends}>
                <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--muted-foreground) / 0.2)" />
                <XAxis dataKey="year" stroke="hsl(var(--muted-foreground))" />
                <YAxis stroke="hsl(var(--muted-foreground))" />
                <Tooltip
                  cursor={{ fill: 'hsl(var(--primary) / 0.2)' }}
                  formatter={(value: number) => [`₹${value}`, 'Spent']}
                  labelFormatter={(label: string) => `Year: ${label}`}
                  contentStyle={{ backgroundColor: 'hsl(var(--card))', border: '1px solid hsl(var(--border))', borderRadius: '0.5rem' }}
                  labelStyle={{ color: 'hsl(var(--foreground))' }}
                  itemStyle={{ color: 'hsl(var(--primary))' }}
                />
                <Area type="monotone" dataKey="spent" stroke="hsl(var(--accent))" fill="hsl(var(--accent) / 0.8)" />
              </AreaChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        {/* Project Breakdown Chart */}
        <Card className="glass-card">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Package className="h-5 w-5" />
              Project Breakdown
            </CardTitle>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={300}>
              <PieChart>
                <Pie
                  data={projectBreakdownChartData}
                  dataKey="value"
                  nameKey="name"
                  cx="50%"
                  cy="50%"
                  outerRadius={100}
                  fill="#8884d8"
                  label
                >
                  {projectBreakdownChartData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                  ))}
                </Pie>
                <Tooltip
                  formatter={(value: number, name: string) => [`${value} items`, `Project: ${name}`]}
                  contentStyle={{ backgroundColor: 'hsl(var(--card))', border: '1px solid hsl(var(--border))', borderRadius: '0.5rem' }}
                  labelStyle={{ color: 'hsl(var(--foreground))' }}
                  itemStyle={{ color: 'hsl(var(--primary))' }}
                />
                <Legend layout="vertical" align="right" verticalAlign="middle" />
              </PieChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>
      </div>

      {/* Filters */}
      <Card className="glass-card">
        <CardHeader>
          <CardTitle>Filters</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <Label htmlFor="report-date-filter">Select Date</Label>
              <Input id="report-date-filter" type="date" value={selectedDate} onChange={(e) => setSelectedDate(e.target.value)} />
            </div>
            <div>
              <Label htmlFor="report-search-filter">Search Items</Label>
              <div className="relative">
                <Search className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                <Input id="report-search-filter" placeholder="Search by item name..." value={searchQuery} onChange={(e) => setSearchQuery(e.target.value)} className="pl-10" />
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* All Purchased Items */}
      <Card className="glass-card" id="report-content">
        <CardHeader>
          <CardTitle className="flex items-center justify-between">
            All Purchased Items ({filteredPurchases.length})
          </CardTitle>
        </CardHeader>
        <CardContent>
          {filteredPurchases.length === 0 ? (
            <p className="text-muted-foreground">No purchased items to display.</p>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {filteredPurchases.map((purchase) => (
                <Card key={purchase._id} className="glass-card animate-slide-in">
                  <CardHeader>
                    <CardTitle className="text-lg font-semibold flex items-center justify-between w-full">
                      Purchase on {purchase.date}
                      {purchase.billFile && (
                        <Button size="sm" variant="outline" onClick={() => viewBill(purchase)}>
                          <Eye className="h-4 w-4 mr-1" />
                          View Bill
                        </Button>
                      )}
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <p className="text-sm text-muted-foreground">Total Items: {purchase.totalItems}</p>
                    <h4 className="font-medium mt-3 mb-1">Items:</h4>
                    <ul className="list-disc pl-5 space-y-1">
                      {purchase.items.map((item, itemIndex) => (
                        <li key={itemIndex} className="text-sm">
                          {item.name} (Qty: {item.quantity}, Price: ₹{item.price || 0})
                        </li>
                      ))}
                    </ul>
                  </CardContent>
                </Card>
              ))}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}