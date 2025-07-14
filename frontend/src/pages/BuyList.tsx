import { useEffect, useState } from "react";
import { Plus, Trash2, Download, Check, ShoppingCart } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Checkbox } from "@/components/ui/checkbox";
import { useToast } from "@/hooks/use-toast";
import { Label } from "@/components/ui/label";

interface BuyListItem {
  _id: string;
  name: string;
  quantity: string;
  project: string;
  isCompleted: boolean;
  addedDate: string;
}

export default function BuyList() {
  const [newItemName, setNewItemName] = useState("");
  const [newItemQuantity, setNewItemQuantity] = useState("");
  const [newItemProject, setNewItemProject] = useState("");
  const [items, setItems] = useState<BuyListItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const { toast } = useToast();
  const API_URL = import.meta.env.VITE_API_URL;

  // Fetch items on mount
  useEffect(() => {
    setLoading(true);
    fetch(`${API_URL}/api/buylist`)
      .then((res) => res.json())
      .then((data) => {
        setItems(data);
        setLoading(false);
      })
      .catch((err) => {
        setError("Failed to load buy list");
        setLoading(false);
      });
  }, []);

  const addItem = async () => {
    if (newItemName.trim() === "") {
      toast({
        title: "Error",
        description: "Please enter an item name",
        variant: "destructive",
      });
      return;
    }
    try {
      const res = await fetch(`${API_URL}/api/buylist`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name: newItemName.trim(),
          quantity: newItemQuantity,
          project: newItemProject,
          isCompleted: false,
          addedDate: new Date().toISOString().split("T")[0],
        }),
      });
      if (!res.ok) throw new Error("Failed to add item");
      const newItem = await res.json();
      setItems([newItem, ...items]);
      setNewItemName("");
      setNewItemQuantity("");
      setNewItemProject("");
      toast({ title: "Item added", description: `${newItem.name} added to buy list` });
    } catch {
      toast({ title: "Error", description: "Failed to add item", variant: "destructive" });
    }
  };

  const toggleItem = async (id: string) => {
    const item = items.find((i) => i._id === id);
    if (!item) return;
    try {
      const res = await fetch(`${API_URL}/api/buylist/${id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ ...item, isCompleted: !item.isCompleted }),
      });
      if (!res.ok) throw new Error();
      const updated = await res.json();
      setItems(items.map((i) => (i._id === id ? updated : i)));
    } catch {
      toast({ title: "Error", description: "Failed to update item", variant: "destructive" });
    }
  };

  const deleteItem = async (id: string) => {
    try {
      const res = await fetch(`${API_URL}/api/buylist/${id}`, { method: "DELETE" });
      if (!res.ok) throw new Error();
      setItems(items.filter((i) => i._id !== id));
      toast({ title: "Item removed", description: "Item deleted from buy list" });
    } catch {
      toast({ title: "Error", description: "Failed to delete item", variant: "destructive" });
    }
  };

  const downloadPDF = () => {
    toast({ title: "PDF Generated", description: "Buy list downloaded successfully" });
  };

  const pendingItems = items.filter((item) => !item.isCompleted);
  const completedItems = items.filter((item) => item.isCompleted);

  const markAsBought = async (item: BuyListItem) => {
    try {
      // 1. Create a new purchase
      const res = await fetch(`${API_URL}/api/purchases`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          date: new Date().toISOString().split("T")[0],
          items: [{
            name: item.name,
            quantity: item.quantity,

            category: item.project,
          }],
          totalItems: item.quantity,
        }),
      });
      if (!res.ok) throw new Error("Failed to add to purchases");

      // 2. Remove from buy list
      await deleteItem(item._id);

      // 3. Show toast
      toast({
        title: "Marked as bought",
        description: `${item.name} moved to purchases`,
      });
    } catch {
      toast({
        title: "Error",
        description: "Failed to mark as bought",
        variant: "destructive",
      });
    }
  };

  if (loading) return <div className="p-8 text-center">Loading buy list...</div>;
  if (error) return <div className="p-8 text-center text-red-500">{error}</div>;

  return (
    <div className="max-w-5xl mx-auto px-2 py-8 space-y-8 animate-fade-in">
      {/* Header */}
      <div className="flex flex-col gap-2 md:flex-row md:items-center md:justify-between">
        <div>
          <h1 className="text-3xl font-bold">CompCart</h1>
          <p className="text-muted-foreground">Manage components you need to purchase</p>
        </div>
        <Button onClick={downloadPDF} variant="neon" className="w-full md:w-auto mt-4 md:mt-0">
          <Download className="h-4 w-4 mr-2" />
          Download PDF
        </Button>
      </div>

      {/* Add New Item */}
      <Card className="glass-card">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Plus className="h-5 w-5" />
            Add New Item
          </CardTitle>
        </CardHeader>
        <CardContent>
          <form
            className="flex flex-col gap-2"
            onSubmit={e => { e.preventDefault(); addItem(); }}
          >
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="flex flex-col gap-1">
                <Label htmlFor="name-input">Name</Label>
                <Input
                  id="name-input"
                  className="flex-1 min-w-0"
                  placeholder="e.g., Arduino Uno R3"
                  value={newItemName}
                  onChange={(e) => setNewItemName(e.target.value)}
                />
              </div>
              <div className="flex flex-col gap-1">
                <Label htmlFor="quantity-input">Quantity</Label>
                <Input
                  id="quantity-input"
                  className="w-full"
                  type="text"
                  value={newItemQuantity}
                  onChange={(e) => setNewItemQuantity(e.target.value)}
                  placeholder="Qty"
                />
              </div>
              <div className="flex flex-col gap-1">
                <Label htmlFor="project-input">Project</Label>
                <Input
    id="project-input"
    className="w-full"
    type="text"
    placeholder="Project"
    value={newItemProject}
    onChange={(e) => setNewItemProject(e.target.value)}
    required
  />
              </div>
            </div>
            <Button type="submit" variant="neon" className="w-full md:w-auto mt-2 md:mt-0">
              <Plus className="h-4 w-4" />
              Add
            </Button>
          </form>
        </CardContent>
      </Card>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
        {/* Pending Items */}
        <Card className="glass-card">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <ShoppingCart className="h-5 w-5" />
              Pending Items <span className="ml-2 text-xs text-muted-foreground">({pendingItems.length})</span>
            </CardTitle>
          </CardHeader>
          <CardContent>
            {pendingItems.length === 0 ? (
              <p className="text-center text-muted-foreground py-8">No pending items. Add some items to your buy list!</p>
            ) : (
              <div className="space-y-3">
                {pendingItems.map((item) => (
                  <div
                    key={item._id}
                    className="flex flex-col sm:flex-row items-start sm:items-center gap-3 p-4 bg-secondary/30 rounded-lg hover:bg-secondary/50 transition-smooth animate-slide-in"
                  >
                    <div className="flex items-center gap-2">
                      <Checkbox
                        checked={item.isCompleted}
                        onCheckedChange={() => toggleItem(item._id)}
                      />
                    </div>
                    <div className="flex-1 w-full">
                      <h4 className="font-medium text-lg">{item.name}</h4>
                      <div className="flex flex-wrap gap-2 text-sm text-muted-foreground mt-1">
                        <span>Qty: {item.quantity}</span>
                        <span >Project: {item.project}</span>
                        <span>Added: {item.addedDate}</span>
                      </div>
                    </div>
                    <div className="flex gap-2 w-full sm:w-auto">
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => toggleItem(item._id)}
                        className="text-primary hover:text-primary w-full sm:w-auto"
                      >
                        <Check className="h-4 w-4 mr-1" />
                        {item.isCompleted ? "Completed" : "Mark as Completed"}
                      </Button>
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => deleteItem(item._id)}
                        className="text-destructive hover:text-destructive w-full sm:w-auto"
                      >
                        <Trash2 className="h-4 w-4" />
                        Delete
                      </Button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>

        {/* Completed Items */}
        <Card className="glass-card">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Check className="h-5 w-5 text-primary" />
              Completed Items <span className="ml-2 text-xs text-muted-foreground">({completedItems.length})</span>
            </CardTitle>
          </CardHeader>
          <CardContent>
            {completedItems.length === 0 ? (
              <p className="text-center text-muted-foreground py-8">No completed items yet.</p>
            ) : (
              <div className="space-y-3">
                {completedItems.map((item) => (
                  <div
                    key={item._id}
                    className="flex flex-col sm:flex-row items-start sm:items-center gap-3 p-4 bg-secondary/20 rounded-lg opacity-60"
                  >
                    <div className="flex items-center gap-2">
                      <Checkbox
                        checked={item.isCompleted}
                        onCheckedChange={() => toggleItem(item._id)}
                      />
                    </div>
                    <div className="flex-1 w-full">
                      <h4 className="font-medium text-lg line-through">{item.name}</h4>
                      <div className="flex flex-wrap gap-2 text-sm text-muted-foreground mt-1">
                        <span>Qty: {item.quantity}</span>
                        {item.project && <span className="break-all">Project: {item.project}</span>}
                        <span>Added: {item.addedDate}</span>
                      </div>
                    </div>
                    <div className="flex gap-2 w-full sm:w-auto">
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => deleteItem(item._id)}
                        className="text-destructive hover:text-destructive w-full sm:w-auto"
                      >
                        <Trash2 className="h-4 w-4" />
                        Delete
                      </Button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}