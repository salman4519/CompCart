import { useEffect, useState } from "react";
import { Package, ShoppingCart, Calendar, TrendingUp, Lock } from "lucide-react";
import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { useAuth } from "@/contexts/AuthContext";
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, PieChart, Pie, Cell, Legend } from 'recharts'; // Added PieChart, Pie, Cell, Legend

interface Purchase {
  _id: string;
  date: string;
  items: Array<{ name: string; quantity: number; price?: number; project?: string }>;
  billFile?: string;
  totalItems: number;
}

interface PurchaseWithProject extends Purchase {
  items: Array<{ name: string; quantity: number; price?: number; project?: string }>;
}

interface BuyListItem {
  _id: string;
  name: string;
  quantity: number;
  isCompleted: boolean;
  addedDate: string;
}

export default function Dashboard() {
  const { isAdmin } = useAuth();
  const [purchases, setPurchases] = useState<Purchase[]>([]);
  const [buyList, setBuyList] = useState<BuyListItem[]>([]);
  const [loading, setLoading] = useState(true);

  const API_URL = import.meta.env.VITE_API_URL;

  useEffect(() => {
    setLoading(true);
    Promise.all([
      fetch(`${API_URL}/api/purchases`).then((res) => res.json()),
      fetch(`${API_URL}/api/buylist`).then((res) => res.json()),
    ])
      .then(([purchasesData, buyListData]) => {
        setPurchases(purchasesData);
        setBuyList(buyListData);
        setLoading(false);
      })
      .catch(() => setLoading(false));
  }, []);

  // Calculate stats
  const totalItems = purchases.reduce((sum, p) => sum + p.totalItems, 0);
  const monthlyTotal = purchases.filter((p) => {
    const d = new Date(p.date);
    const now = new Date();
    return d.getMonth() === now.getMonth() && d.getFullYear() === now.getFullYear();
  }).reduce((sum, p) => sum + p.totalItems, 0);
  const pendingItems = buyList.filter((item) => !item.isCompleted).length;
  const lastPurchase = purchases.length > 0 ? purchases[0] : null;

  // Calculate total spent by project
  const totalSpentByProject = purchases.reduce((acc: Record<string, number>, purchase) => {
    purchase.items.forEach(item => {
      if (item.project && item.price !== undefined) {
        acc[item.project] = (acc[item.project] || 0) + item.price;
      }
    });
    return acc;
  }, {} as Record<string, number>);

  // Convert to array for rendering
  const projectSpendingList = Object.entries(totalSpentByProject).map(([project, spent]) => ({
    project, spent: Number(spent) // Ensure 'spent' is a number
  }));

  // Recent activity: last 4 purchases
  const recentActivity = purchases.slice(0, 4).map((p) => ({
    date: p.date,
    item: p.items[0]?.name || "-",
    quantity: p.items[0]?.quantity || 0,
  }));

  // Prepare data for charts
  const monthlyChartData = Array.from({ length: 12 }, (_, i) => {
    const date = new Date();
    date.setMonth(i);
    return {
      month: date.toLocaleString('default', { month: 'short' }),
      totalItems: 0,
    };
  });

  purchases.forEach(p => {
    const d = new Date(p.date);
    const monthIndex = d.getMonth();
    if (monthlyChartData[monthIndex]) {
      monthlyChartData[monthIndex].totalItems += p.totalItems;
    }
  });

  const projectChartDataMap = new Map<string, number>();
  purchases.forEach(p => {
    p.items.forEach(item => {
      const projectName = item.project || "Uncategorized";
      projectChartDataMap.set(projectName, (projectChartDataMap.get(projectName) || 0) + item.quantity);
    });
  });
  const projectChartData = Array.from(projectChartDataMap.entries()).map(([name, quantity]) => ({
    name,
    quantity,
    value: quantity, // Add value for PieChart
  }));

  const COLORS = ['#0088FE', '#00C49F', '#FFBB28', '#FF8042', '#A28DFF', '#FF6F61', '#6B5B95', '#88B04B']; // Colors for PieChart

  const quickActions = [
    {
      title: "Buy List",
      description: "Manage items to purchase",
      icon: Package,
      to: "/buy-list",
      color: "bg-secondary hover:bg-secondary/80"
    },
    {
      title: "Admin Panel",
      description: "View all purchases by date",
      icon: Calendar,
      to: "/admin",
      color: "bg-secondary hover:bg-secondary/80"
    }
  ];

  if (loading) return <div className="p-8 text-center">Loading dashboard...</div>;

  return (
    <div className="space-y-8 animate-fade-in">
      {/* Header */}
      <div className="flex flex-col gap-2">
        <h1 className="text-3xl font-bold">Dashboard</h1>
        <p className="text-muted-foreground">Component purchase tracking and inventory overview</p>
      </div>
      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <Card className="stat-card">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Items</CardTitle>
            <Package className="h-4 w-4 text-primary" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-primary">{totalItems}</div>
            <p className="text-xs text-muted-foreground">Components purchased</p>
          </CardContent>
        </Card>
        <Card className="stat-card">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">This Month</CardTitle>
            <TrendingUp className="h-4 w-4 text-primary" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-primary">{monthlyTotal}</div>
            <p className="text-xs text-muted-foreground">Items this month</p>
          </CardContent>
        </Card>
        <Card className="stat-card">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Pending</CardTitle>
            <ShoppingCart className="h-4 w-4 text-primary" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-primary">{pendingItems}</div>
            <p className="text-xs text-muted-foreground">Items to buy</p>
          </CardContent>
        </Card>
        <Card className="stat-card">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Last Purchase</CardTitle>
            <Calendar className="h-4 w-4 text-primary" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-primary">{lastPurchase ? lastPurchase.date : '-'}</div>
            <p className="text-xs text-muted-foreground">{lastPurchase ? lastPurchase.items[0]?.name : '-'}</p>
          </CardContent>
        </Card>
      </div>

      {/* Project Spending Summary */}
      <h2 className="text-2xl font-semibold mb-6">Project Spending Summary</h2>
      <Card className="glass-card">
        <CardContent className="p-6">
          {projectSpendingList.length === 0 ? (
            <p className="text-muted-foreground">No project spending to display.</p>
          ) : (
            <div className="space-y-3">
              {projectSpendingList.map(({ project, spent }) => (
                <div key={project} className="flex justify-between items-center py-2 border-b border-border/50 last:border-0">
                  <span className="font-medium">{project}</span>
                  <span className="text-primary font-bold">₹{spent.toFixed(2)}</span>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>

      {/* Quick Actions */}
      <h2 className="text-2xl font-semibold mb-6">Quick Actions</h2>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {quickActions.map((action, index) => (
          <Link key={action.to} to={action.to}>
            <Card className="glass-card hover-glow transition-smooth cursor-pointer h-full">
              <CardContent className="p-6 flex flex-col items-center text-center gap-4">
                <div className="p-4 rounded-full bg-primary/10">
                  <action.icon className="h-8 w-8 text-primary" />
                </div>
                <div>
                  <h3 className="font-semibold text-lg mb-2">{action.title}</h3>
                  <p className="text-muted-foreground">{action.description}</p>
                </div>
              </CardContent>
            </Card>
          </Link>
        ))}
      </div>

      {/* Monthly Purchase Chart */}
      <h2 className="text-2xl font-semibold mb-6">Monthly Purchases</h2>
      <Card className="glass-card">
        <CardContent className="p-6">
          <ResponsiveContainer width="100%" height={300}>
            <BarChart data={monthlyChartData}>
              <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--muted-foreground) / 0.2)" />
              <XAxis dataKey="month" stroke="hsl(var(--muted-foreground))" />
              <YAxis stroke="hsl(var(--muted-foreground))" />
              <Tooltip
                cursor={{ fill: 'hsl(var(--primary) / 0.2)' }}
                formatter={(value: number) => [`${value} items`, 'Total']}
                labelFormatter={(label: string) => `Month: ${label}`}
                contentStyle={{ backgroundColor: 'hsl(var(--card))', border: '1px solid hsl(var(--border))', borderRadius: '0.5rem' }}
                labelStyle={{ color: 'hsl(var(--foreground))' }}
                itemStyle={{ color: 'hsl(var(--primary))' }}
              />
              <Bar dataKey="totalItems" fill="hsl(var(--primary))" barSize={20} radius={[4, 4, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </CardContent>
      </Card>

      {/* Project Purchase Chart */}
      <h2 className="text-2xl font-semibold mb-6">Purchases by Project</h2>
      <Card className="glass-card">
        <CardContent className="p-6">
          <ResponsiveContainer width="100%" height={300}>
            <PieChart>
              <Pie
                data={projectChartData}
                dataKey="value"
                nameKey="name"
                cx="50%"
                cy="50%"
                outerRadius={100}
                fill="#8884d8"
                label
              >
                {projectChartData.map((entry, index) => (
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

      {/* Removed Recent Activity Section */}
      {/*
      <Card className="glass-card">
        <CardHeader>
          <CardTitle>Recent Activity</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {recentActivity.length === 0 ? (
              <p className="text-muted-foreground">No recent purchases.</p>
            ) : (
              recentActivity.map((activity, index) => (
                <div key={index} className="flex items-center justify-between py-2 border-b border-border/50 last:border-0">
                  <div>
                    <p className="font-medium">{activity.item}</p>
                    <p className="text-sm text-muted-foreground">{activity.date}</p>
                  </div>
                  <div className="text-sm text-primary font-medium">Qty: {activity.quantity}</div>
                </div>
              ))
            )}
          </div>
        </CardContent>
      </Card>
      */}
    </div>
  );
}