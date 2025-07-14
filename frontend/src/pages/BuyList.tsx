import { useEffect, useState } from "react";
import { Plus, Trash2, Download, Check, ShoppingCart } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Checkbox } from "@/components/ui/checkbox";
import { useToast } from "@/hooks/use-toast";

interface BuyListItem {
  _id: string;
  name: string;
  quantity: number;
  price: number;
  category: string;
  isCompleted: boolean;
  addedDate: string;
}

export default function BuyList() {
  const [newItemName, setNewItemName] = useState("");
  const [newItemQuantity, setNewItemQuantity] = useState(1);
  const [newItemPrice, setNewItemPrice] = useState(0);
  const [newItemCategory, setNewItemCategory] = useState("");
  const [items, setItems] = useState<BuyListItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const { toast } = useToast();

  // Fetch items on mount
  useEffect(() => {
    setLoading(true);
    fetch("/api/buylist")
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
      const res = await fetch("/api/buylist", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name: newItemName.trim(),
          quantity: newItemQuantity,
          price: newItemPrice,
          category: newItemCategory,
          isCompleted: false,
          addedDate: new Date().toISOString().split("T")[0],
        }),
      });
      if (!res.ok) throw new Error("Failed to add item");
      const newItem = await res.json();
      setItems([newItem, ...items]);
      setNewItemName("");
      setNewItemQuantity(1);
      setNewItemPrice(0);
      setNewItemCategory("");
      toast({ title: "Item added", description: `${newItem.name} added to buy list` });
    } catch {
      toast({ title: "Error", description: "Failed to add item", variant: "destructive" });
    }
  };

  const toggleItem = async (id: string) => {
    const item = items.find((i) => i._id === id);
    if (!item) return;
    try {
      const res = await fetch(`/api/buylist/${id}`, {
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
      const res = await fetch(`/api/buylist/${id}`, { method: "DELETE" });
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
      const res = await fetch("/api/purchases", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          date: new Date().toISOString().split("T")[0],
          items: [{
            name: item.name,
            quantity: item.quantity,
            price: item.price,
            category: item.category,
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
    <div className="space-y-8 animate-fade-in">
      {/* Header */}
      <div className="flex flex-col gap-2">
        <h1 className="text-3xl font-bold">Buy List</h1>
        <p className="text-muted-foreground">Manage components you need to purchase</p>
      </div>
      {/* Main Content */}
      <div className="lg:col-span-2 space-y-6">
        {/* Add New Item */}
        <Card className="glass-card">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Plus className="h-5 w-5" />
              Add New Item
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex gap-4 items-end">
              <div className="flex-1">
                <Input
                  placeholder="e.g., Arduino Uno R3"
                  value={newItemName}
                  onChange={(e) => setNewItemName(e.target.value)}
                  onKeyPress={(e) => e.key === "Enter" && addItem()}
                />
              </div>
              <div className="w-24">
                <Input
                  type="number"
                  min="1"
                  value={newItemQuantity}
                  onChange={(e) => setNewItemQuantity(parseInt(e.target.value) || 1)}
                />
              </div>
              <div className="w-32">
                <Input
                  type="number"
                  min="0"
                  step="0.01"
                  placeholder="Price"
                  value={newItemPrice}
                  onChange={(e) => setNewItemPrice(parseFloat(e.target.value) || 0)}
                />
              </div>
              <div className="w-32">
                <Input
                  type="text"
                  placeholder="Category"
                  value={newItemCategory}
                  onChange={(e) => setNewItemCategory(e.target.value)}
                />
              </div>
              <Button onClick={addItem} variant="neon">
                <Plus className="h-4 w-4" />
              </Button>
            </div>
          </CardContent>
        </Card>
        {/* Pending Items */}
        <Card className="glass-card">
          <CardHeader>
            <CardTitle className="flex items-center justify-between">
              <span className="flex items-center gap-2">
                <ShoppingCart className="h-5 w-5" />
                Pending Items ({pendingItems.length})
              </span>
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
                    className="flex items-center gap-4 p-4 bg-secondary/30 rounded-lg hover:bg-secondary/50 transition-smooth animate-slide-in"
                  >
                    <Checkbox
                      checked={item.isCompleted}
                      onCheckedChange={() => toggleItem(item._id)}
                    />
                    <div className="flex-1">
                      <h4 className="font-medium">{item.name}</h4>
                      <p className="text-sm text-muted-foreground">
                        Qty: {item.quantity} • Price: ${item.price} • Category: {item.category} • Added: {item.addedDate}
                      </p>
                    </div>
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={() => markAsBought(item)}
                      className="text-primary hover:text-primary"
                    >
                      <Check className="h-4 w-4 mr-1" />
                      Bought
                    </Button>
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={() => deleteItem(item._id)}
                      className="text-destructive hover:text-destructive"
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>
        {/* Completed Items */}
        {completedItems.length > 0 && (
          <Card className="glass-card">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Check className="h-5 w-5 text-primary" />
                Completed Items ({completedItems.length})
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                {completedItems.map((item) => (
                  <div
                    key={item._id}
                    className="flex items-center gap-4 p-4 bg-secondary/20 rounded-lg opacity-60"
                  >
                    <Checkbox
                      checked={item.isCompleted}
                      onCheckedChange={() => toggleItem(item._id)}
                    />
                    <div className="flex-1">
                      <h4 className="font-medium line-through">{item.name}</h4>
                      <p className="text-sm text-muted-foreground">
                        Qty: {item.quantity} • Added: {item.addedDate}
                      </p>
                    </div>
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={() => deleteItem(item._id)}
                      className="text-destructive hover:text-destructive"
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        )}
      </div>
      {/* Sidebar - Summary & Actions */}
      <Card className="glass-card">
        <CardHeader>
          <CardTitle>Summary</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <div className="flex justify-between items-center">
              <span>Total Items:</span>
              <span className="font-bold text-primary">{items.length}</span>
            </div>
            <div className="flex justify-between items-center">
              <span>Pending:</span>
              <span className="font-bold text-orange-400">{pendingItems.length}</span>
            </div>
            <div className="flex justify-between items-center">
              <span>Completed:</span>
              <span className="font-bold text-green-400">{completedItems.length}</span>
            </div>
            {pendingItems.length > 0 && (
              <div className="pt-4 border-t border-border">
                <h4 className="font-medium mb-2">Next to Buy:</h4>
                <div className="space-y-1 text-sm">
                  {pendingItems.slice(0, 3).map((item) => (
                    <div key={item._id} className="flex justify-between">
                      <span className="truncate mr-2">{item.name}</span>
                      <span className="text-primary">x{item.quantity}</span>
                    </div>
                  ))}
                  {pendingItems.length > 3 && (
                    <p className="text-muted-foreground">
                      +{pendingItems.length - 3} more items
                    </p>
                  )}
                </div>
              </div>
            )}
          </div>
        </CardContent>
      </Card>
      <Button onClick={downloadPDF} variant="neon" className="w-full">
        <Download className="h-4 w-4 mr-2" />
        Download PDF
      </Button>
      <Button
        variant="outline"
        className="w-full"
        onClick={async () => {
          const completed = items.filter((item) => item.isCompleted);
          if (completed.length > 0) {
            for (const item of completed) {
              await deleteItem(item._id);
            }
            toast({
              title: "Cleared completed items",
              description: `Removed ${completed.length} completed items`,
            });
          }
        }}
      >
        Clear Completed
      </Button>
    </div>
  );
}