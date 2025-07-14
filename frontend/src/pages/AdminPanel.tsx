import { useEffect, useState } from "react";
import { Lock, Calendar, Download, Eye, Search } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useToast } from "@/hooks/use-toast";
import { useAuth } from "@/contexts/AuthContext";
import { PurchaseForm, PurchaseItem } from "@/components/ui/PurchaseForm";

interface Purchase {
  _id: string;
  date: string;
  items: Array<{ name: string; quantity: number }>;
  billFile?: string;
  totalItems: number;
}

export default function AdminPanel() {
  const { isAdmin, login, logout } = useAuth();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [selectedDate, setSelectedDate] = useState(new Date().toISOString().split("T")[0]);
  const [searchQuery, setSearchQuery] = useState("");
  const { toast } = useToast();
  const [purchases, setPurchases] = useState<Purchase[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const API_URL = import.meta.env.VITE_API_URL;

  // Fetch purchases on mount
  useEffect(() => {
    setLoading(true);
    fetch(`${API_URL}/api/purchases`)
      .then((res) => res.json())
      .then((data) => {
        setPurchases(data);
        setLoading(false);
      })
      .catch(() => {
        setError("Failed to load purchases");
        setLoading(false);
      });
  }, []);

  const handleLogin = () => {
    if (login(email, password)) {
      toast({ title: "Login successful", description: "Welcome to the admin panel" });
    } else {
      toast({ title: "Login failed", description: "Invalid credentials", variant: "destructive" });
    }
  };

  const handleLogout = () => {
    logout();
    setEmail("");
    setPassword("");
    toast({ title: "Logged out", description: "You have been logged out successfully" });
  };

  const downloadReport = (purchase: Purchase) => {
    toast({ title: "Download started", description: `Downloading report for ${purchase.date}` });
  };

  const viewBill = (purchase: Purchase) => {
    toast({ title: "Opening bill", description: `Opening ${purchase.billFile}` });
  };

  const handleSavePurchase = async (purchase: { date: string; items: PurchaseItem[]; billFile?: File | null }) => {
    try {
      const res = await fetch(`${API_URL}/api/purchases`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          date: purchase.date,
          items: purchase.items,
          billFile: purchase.billFile ? purchase.billFile.name : undefined,
        }),
      });
      if (!res.ok) throw new Error();
      const newPurchase = await res.json();
      setPurchases([newPurchase, ...purchases]);
      toast({ title: "Purchase saved", description: `Saved ${purchase.items.length} items for ${purchase.date}` });
    } catch {
      toast({ title: "Error", description: "Failed to save purchase", variant: "destructive" });
    }
  };

  // Add update and delete functionality for purchases
  const handleUpdatePurchase = async (id: string, updatedPurchase: Partial<Purchase>) => {
    try {
      const res = await fetch(`${API_URL}/api/purchases/${id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(updatedPurchase),
      });
      if (!res.ok) throw new Error();
      const updated = await res.json();
      setPurchases(purchases.map((p) => (p._id === id ? updated : p)));
      toast({ title: "Purchase updated", description: `Purchase for ${updated.date} updated.` });
    } catch {
      toast({ title: "Error", description: "Failed to update purchase", variant: "destructive" });
    }
  };

  const handleDeletePurchase = async (id: string) => {
    try {
      const res = await fetch(`${API_URL}/api/purchases/${id}`, { method: "DELETE" });
      if (!res.ok) throw new Error();
      setPurchases(purchases.filter((p) => p._id !== id));
      toast({ title: "Purchase deleted", description: "Purchase removed from records." });
    } catch {
      toast({ title: "Error", description: "Failed to delete purchase", variant: "destructive" });
    }
  };

  const filteredPurchases = purchases.filter((purchase) => {
    const matchesDate = selectedDate ? purchase.date === selectedDate : true;
    const matchesSearch = searchQuery
      ? purchase.items.some((item) => item.name.toLowerCase().includes(searchQuery.toLowerCase()))
      : true;
    return matchesDate && matchesSearch;
  });

  if (!isAdmin) {
    return (
      <div className="min-h-screen flex items-center justify-center p-4">
        <Card className="w-full max-w-md glass-card">
          <CardHeader className="text-center">
            <div className="mx-auto mb-4 p-3 bg-primary/10 rounded-full w-fit">
              <Lock className="h-8 w-8 text-primary" />
            </div>
            <CardTitle className="text-2xl">compCart</CardTitle>
            <p className="text-muted-foreground">Please login to access purchase data</p>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <Label htmlFor="password">Password</Label>
              <Input id="password" type="password" placeholder="Enter password" value={password} onChange={(e) => setPassword(e.target.value)} onKeyPress={(e) => e.key === "Enter" && handleLogin()} />
            </div>
            <Button onClick={handleLogin} variant="neon" className="w-full">Login</Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  if (loading) return <div className="p-8 text-center">Loading purchases...</div>;
  if (error) return <div className="p-8 text-center text-red-500">{error}</div>;

  return (
    <div className="max-w-5xl mx-auto px-2 py-8 space-y-8 animate-fade-in">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold">Admin Panel</h1>
          <p className="text-muted-foreground">View and manage all purchase records</p>
        </div>
        <Button onClick={handleLogout} variant="outline">Logout</Button>
      </div>
      {/* New Purchase Form */}
      {isAdmin && (
        <Card className="glass-card">
          <CardHeader>
            <CardTitle>Add New Purchase</CardTitle>
          </CardHeader>
          <CardContent>
            <PurchaseForm onSave={handleSavePurchase} />
          </CardContent>
        </Card>
      )}
      {/* Filters */}
      <Card className="glass-card">
        <CardHeader>
          <CardTitle>Filters</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <Label htmlFor="date-filter">Select Date</Label>
              <Input id="date-filter" type="date" value={selectedDate} onChange={(e) => setSelectedDate(e.target.value)} />
            </div>
            <div>
              <Label htmlFor="search-filter">Search Items</Label>
              <div className="relative">
                <Search className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                <Input id="search-filter" placeholder="Search by item name..." value={searchQuery} onChange={(e) => setSearchQuery(e.target.value)} className="pl-10" />
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
      {/* Purchase Records */}
      <div className="space-y-6">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <h2 className="text-2xl font-semibold">Purchase Records ({filteredPurchases.length})</h2>
        </div>
        {filteredPurchases.length === 0 ? (
          <Card className="glass-card">
            <CardContent className="text-center py-12">
              <Calendar className="h-12 w-12 mx-auto mb-4 text-muted-foreground" />
              <h3 className="text-lg font-medium mb-2">No purchases found</h3>
              <p className="text-muted-foreground">No purchases match your current filters</p>
            </CardContent>
          </Card>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {filteredPurchases.map((purchase) => (
              <Card key={purchase._id} className="glass-card">
                <CardHeader>
                  <div className="flex flex-col gap-2 md:flex-row md:items-center md:justify-between">
                    <CardTitle className="flex items-center gap-2">
                      <Calendar className="h-5 w-5" />
                      {purchase.date}
                    </CardTitle>
                    <div className="flex flex-wrap gap-2 mt-2 md:mt-0">
                      {purchase.billFile && (
                        <Button size="sm" variant="outline" onClick={() => viewBill(purchase)}>
                          <Eye className="h-4 w-4 mr-1" />
                          View Bill
                        </Button>
                      )}
                      <Button size="sm" onClick={() => downloadReport(purchase)} variant="neon">
                        <Download className="h-4 w-4 mr-1" />
                        Download PDF
                      </Button>
                      <Button size="sm" variant="outline" onClick={() => handleDeletePurchase(purchase._id)} className="text-destructive hover:text-destructive">
                        Delete
                      </Button>
                    </div>
                  </div>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    <div className="flex items-center justify-between text-sm">
                      <span className="text-muted-foreground">Total Items:</span>
                      <span className="font-medium text-primary">{purchase.totalItems}</span>
                    </div>
                    <div>
                      <h4 className="font-medium mb-2">Items:</h4>
                      <div className="grid grid-cols-1 gap-2">
                        {purchase.items.map((item, index) => (
                          <div key={index} className="flex justify-between items-center p-2 bg-secondary/30 rounded">
                            <span className="text-sm">{item.name}</span>
                            <span className="text-sm font-medium text-primary">x{item.quantity}</span>
                          </div>
                        ))}
                      </div>
                    </div>
                    {purchase.billFile && (
                      <div className="flex items-center gap-2 p-3 bg-primary/10 rounded-lg">
                        <Eye className="h-4 w-4 text-primary" />
                        <span className="text-sm font-medium">Bill: {purchase.billFile}</span>
                      </div>
                    )}
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}