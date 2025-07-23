import { useEffect, useState } from "react";
import { Lock, Calendar, Plus, Trash2, Download, Eye, Search } from "lucide-react"; // Added Download, Eye, Search
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
  items: Array<{ name: string; quantity: number; price?: number; project?: string }>;
  billFile?: string;
  totalItems: number;
}

interface Project {
  _id: string;
  name: string;
  // startDate: string; // Removed
}

export default function AdminPanel() {
  const { isAdmin, login, logout } = useAuth();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const { toast } = useToast();
  const API_URL = import.meta.env.VITE_API_URL;

  // Purchase-related States
  const [purchases, setPurchases] = useState<Purchase[]>([]); // Re-added
  const [selectedDate, setSelectedDate] = useState(new Date().toISOString().split("T")[0]); // Re-added
  const [searchQuery, setSearchQuery] = useState(""); // Re-added
  const [loading, setLoading] = useState(true); // Re-added
  const [error, setError] = useState<string | null>(null); // Re-added

  // Project Management States
  const [projects, setProjects] = useState<Project[]>([]);
  const [newProjectName, setNewProjectName] = useState('');
  // const [newProjectStartDate, setNewProjectStartDate] = useState(''); // Removed

  useEffect(() => {
    if (isAdmin) {
      fetchProjects();
      fetchPurchases(); // Call fetch purchases when admin is logged in
    }
  }, [isAdmin]);

  const fetchPurchases = async () => { // Re-added
    setLoading(true);
    try {
      const res = await fetch(`${API_URL}/api/purchases`);
      if (!res.ok) throw new Error('Failed to load purchases');
      const data = await res.json();
      setPurchases(data);
    } catch (err: any) {
      setError(err.message);
      toast({ title: 'Error', description: `Failed to load purchases: ${err.message}`, variant: 'destructive' });
    } finally {
      setLoading(false);
    }
  };

  const fetchProjects = async () => {
    try {
      const res = await fetch(`${API_URL}/api/projects`);
      if (!res.ok) throw new Error('Failed to fetch projects');
      const data = await res.json();
      setProjects(data);
    } catch (err: any) {
      toast({ title: 'Error', description: `Failed to load projects: ${err.message}`, variant: 'destructive' });
    }
  };

  const addProject = async () => {
    if (newProjectName.trim() === '' /* || newProjectStartDate.trim() === '' */) { // Removed date check
      toast({ title: 'Error', description: 'Please enter project name', variant: 'destructive' }); // Updated message
      return;
    }
    try {
      const res = await fetch(`${API_URL}/api/projects`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name: newProjectName.trim() /* , startDate: newProjectStartDate */ }), // Removed startDate
      });
      if (!res.ok) throw new Error('Failed to add project');
      const newProject = await res.json();
      setProjects([...projects, newProject]);
      setNewProjectName('');
      // setNewProjectStartDate(''); // Removed
      toast({ title: 'Project Added', description: `${newProject.name} added successfully` });
    } catch (err: any) {
      toast({ title: 'Error', description: `Failed to add project: ${err.message}`, variant: 'destructive' });
    }
  };

  const deleteProject = async (id: string) => {
    try {
      const res = await fetch(`${API_URL}/api/projects/${id}`, { method: 'DELETE' });
      if (!res.ok) throw new Error('Failed to delete project');
      setProjects(projects.filter(proj => proj._id !== id));
      toast({ title: 'Project Deleted', description: 'Project removed successfully' });
    } catch (err: any) {
      toast({ title: 'Error', description: `Failed to delete project: ${err.message}`, variant: 'destructive' });
    }
  };

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

  const handleSavePurchase = async (purchase: { date: string; items: PurchaseItem[]; billFile?: string | null }) => {
    try {
      const res = await fetch(`${API_URL}/api/purchases`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          date: purchase.date,
          items: purchase.items,
          billFile: purchase.billFile || undefined,
        }),
      });
      if (!res.ok) throw new Error();
      const newPurchase = await res.json();
      setPurchases([newPurchase, ...purchases]); // Now update local state
      toast({ title: "Purchase saved", description: `Saved ${purchase.items.length} items for ${purchase.date}` });
    } catch {
      toast({ title: "Error", description: "Failed to save purchase", variant: "destructive" });
    }
  };

  const handleDeletePurchase = async (id: string) => { // Re-added
    try {
      const res = await fetch(`${API_URL}/api/purchases/${id}`, { method: "DELETE" });
      if (!res.ok) throw new Error();
      setPurchases(purchases.filter((p) => p._id !== id));
      toast({ title: "Purchase deleted", description: "Purchase removed from records." });
    } catch {
      toast({ title: "Error", description: "Failed to delete purchase", variant: "destructive" });
    }
  };

  const viewBill = (purchase: Purchase) => { // Re-added
    if (purchase.billFile) {
      const isFullUrl = purchase.billFile.startsWith('http://') || purchase.billFile.startsWith('https://');
      const billUrl = isFullUrl
        ? purchase.billFile
        : `${API_URL}/uploads/${purchase.billFile}`;
      window.open(billUrl, '_blank');
    }
  };

  const filteredPurchases = purchases.filter((purchase) => { // Re-added
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
            <CardTitle className="text-2xl">Admin Panel</CardTitle>
            <p className="text-muted-foreground">Please login to access admin features</p>
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

  return (
    <div className="max-w-5xl mx-auto px-2 py-8 space-y-8 animate-fade-in">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold">Admin Panel</h1>
          <p className="text-muted-foreground">Manage purchases and projects</p>
        </div>
        <Button onClick={handleLogout} variant="outline">Logout</Button>
      </div>

      {/* Add New Purchase Form */}
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

      {/* Project Management Section */}
      <Card className="glass-card">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Plus className="h-5 w-5" />
            Add New Project
          </CardTitle>
        </CardHeader>
        <CardContent>
          <form onSubmit={e => { e.preventDefault(); addProject(); }} className="flex flex-col md:flex-row gap-4">
            <Input
              type="text"
              placeholder="Project Name"
              value={newProjectName}
              onChange={e => setNewProjectName(e.target.value)}
              className="flex-1"
            />
            {/* Removed date input */}
            {/*
            <Input
              type="date"
              value={newProjectStartDate}
              onChange={e => setNewProjectStartDate(e.target.value)}
              className="w-auto"
            />
            */}
            <Button type="submit" variant="neon">
              Add Project
            </Button>
          </form>
        </CardContent>
      </Card>

      <Card className="glass-card">
        <CardHeader>
          <CardTitle>Existing Projects ({projects.length})</CardTitle>
        </CardHeader>
        <CardContent>
          {projects.length === 0 ? (
            <p className="text-muted-foreground text-center py-4">No projects added yet.</p>
          ) : (
            <div className="space-y-4">
              {projects.map(project => (
                <div key={project._id} className="flex items-center justify-between p-4 bg-secondary/30 rounded-lg animate-slide-in">
                  <div>
                    <h3 className="font-medium text-lg">{project.name}</h3>
                    {/* Removed startDate display */}
                    {/* <p className="text-sm text-muted-foreground flex items-center gap-1"><Calendar className="h-3 w-3" /> Started: {project.startDate}</p> */}
                  </div>
                  <Button variant="destructive" size="sm" onClick={() => deleteProject(project._id)}>
                    <Trash2 className="h-4 w-4" />
                  </Button>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>

      {/* Filters for Purchases */}
      <Card className="glass-card">
        <CardHeader>
          <CardTitle>Filters for Purchases</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <Label htmlFor="purchase-date-filter">Select Date</Label>
              <Input id="purchase-date-filter" type="date" value={selectedDate} onChange={(e) => setSelectedDate(e.target.value)} />
            </div>
            <div>
              <Label htmlFor="purchase-search-filter">Search Items</Label>
              <div className="relative">
                <Search className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                <Input id="purchase-search-filter" placeholder="Search by item name..." value={searchQuery} onChange={(e) => setSearchQuery(e.target.value)} className="pl-10" />
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
        {loading ? (
          <div className="p-8 text-center">Loading purchases...</div>
        ) : error ? (
          <div className="p-8 text-center text-red-500">{error}</div>
        ) : filteredPurchases.length === 0 ? (
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
                      <Button size="sm" variant="destructive" onClick={() => handleDeletePurchase(purchase._id)}>
                        <Trash2 className="h-4 w-4" />
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
                            <div className="flex flex-wrap gap-2 text-sm text-muted-foreground mt-1">
                              <span>Qty: {item.quantity}</span>
                              {item.price !== undefined && <span>Price: ₹{item.price.toFixed(2)}</span>} {/* Display item price */}
                              {item.project && <span>Project: {item.project}</span>}
                            </div>
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