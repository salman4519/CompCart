import { useState } from "react";
import { Plus, Trash2, Upload, Download, Calendar } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

export interface PurchaseItem {
  id: string;
  name: string;
  quantity: number;
}

export interface PurchaseFormProps {
  onSave: (purchase: { date: string; items: PurchaseItem[]; billFile?: File | null }) => void;
  initialDate?: string;
  initialItems?: PurchaseItem[];
  initialBillFile?: File | null;
}

export function PurchaseForm({
  onSave,
  initialDate,
  initialItems,
  initialBillFile,
}: PurchaseFormProps) {
  const [purchaseDate, setPurchaseDate] = useState(
    initialDate || new Date().toISOString().split('T')[0]
  );
  const [items, setItems] = useState<PurchaseItem[]>(
    initialItems || [{ id: '1', name: '', quantity: 1 }]
  );
  const [billFile, setBillFile] = useState<File | null>(initialBillFile || null);

  const addItem = () => {
    setItems([...items, { id: Date.now().toString(), name: '', quantity: 1 }]);
  };

  const removeItem = (id: string) => {
    if (items.length > 1) {
      setItems(items.filter(item => item.id !== id));
    }
  };

  const updateItem = (id: string, field: 'name' | 'quantity', value: string | number) => {
    setItems(items.map(item =>
      item.id === id ? { ...item, [field]: value } : item
    ));
  };

  const handleFileUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      setBillFile(file);
    }
  };

  const handleSave = () => {
    const validItems = items.filter(item => item.name.trim() !== '');
    if (validItems.length === 0) {
      // Optionally, you can add a callback for error handling
      return;
    }
    onSave({ date: purchaseDate, items: validItems, billFile });
    // Optionally reset form here
  };

  return (
    <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
      {/* Main Form */}
      <div className="lg:col-span-2 space-y-6">
        {/* Date Selection */}
        <Card className="glass-card">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Calendar className="h-5 w-5" />
              Purchase Date
            </CardTitle>
          </CardHeader>
          <CardContent>
            <Input
              type="date"
              value={purchaseDate}
              onChange={(e) => setPurchaseDate(e.target.value)}
              className="max-w-xs"
            />
          </CardContent>
        </Card>

        {/* Items List */}
        <Card className="glass-card">
          <CardHeader>
            <CardTitle>Items Purchased</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            {items.map((item, index) => (
              <div key={item.id} className="flex gap-4 items-end animate-slide-in">
                <div className="flex-1">
                  <Label htmlFor={`item-${item.id}`}>Item Name</Label>
                  <Input
                    id={`item-${item.id}`}
                    placeholder="e.g., NodeMCU ESP32"
                    value={item.name}
                    onChange={(e) => updateItem(item.id, 'name', e.target.value)}
                  />
                </div>
                <div className="w-24">
                  <Label htmlFor={`qty-${item.id}`}>Quantity</Label>
                  <Input
                    id={`qty-${item.id}`}
                    type="number"
                    min="1"
                    value={item.quantity}
                    onChange={(e) => updateItem(item.id, 'quantity', parseInt(e.target.value) || 1)}
                  />
                </div>
                <Button
                  variant="outline"
                  size="icon"
                  onClick={() => removeItem(item.id)}
                  disabled={items.length === 1}
                  className="text-destructive hover:text-destructive"
                >
                  <Trash2 className="h-4 w-4" />
                </Button>
              </div>
            ))}
            <Button
              onClick={addItem}
              variant="outline"
              className="w-full mt-4"
            >
              <Plus className="h-4 w-4 mr-2" />
              Add Another Item
            </Button>
          </CardContent>
        </Card>

        {/* Bill Upload */}
        <Card className="glass-card">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Upload className="h-5 w-5" />
              Bill Upload
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div className="border-2 border-dashed border-border rounded-lg p-6 text-center">
                <input
                  type="file"
                  accept=".jpg,.jpeg,.png,.pdf"
                  onChange={handleFileUpload}
                  className="hidden"
                  id="bill-upload"
                />
                <label
                  htmlFor="bill-upload"
                  className="cursor-pointer block"
                >
                  <Upload className="h-8 w-8 mx-auto mb-2 text-muted-foreground" />
                  <p className="text-sm text-muted-foreground">
                    Click to upload bill (JPG, PNG, PDF)
                  </p>
                </label>
              </div>
              {billFile && (
                <div className="flex items-center gap-2 p-3 bg-secondary/50 rounded-lg">
                  <Upload className="h-4 w-4 text-primary" />
                  <span className="text-sm font-medium">{billFile.name}</span>
                </div>
              )}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Sidebar - Preview & Actions */}
      <div className="space-y-6">
        <Card className="glass-card">
          <CardHeader>
            <CardTitle>Purchase Preview</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              <div className="flex justify-between items-center pb-2 border-b border-border">
                <span className="font-medium">Date:</span>
                <span className="text-primary">{purchaseDate}</span>
              </div>
              <div>
                <h4 className="font-medium mb-2">Items ({items.filter(i => i.name.trim()).length}):</h4>
                <div className="space-y-1 text-sm">
                  {items
                    .filter(item => item.name.trim() !== '')
                    .map((item, index) => (
                      <div key={item.id} className="flex justify-between">
                        <span>{item.name}</span>
                        <span className="text-primary">x{item.quantity}</span>
                      </div>
                    ))}
                </div>
              </div>
              {billFile && (
                <div className="flex justify-between items-center pt-2 border-t border-border">
                  <span className="font-medium">Bill:</span>
                  <span className="text-primary text-sm">Uploaded</span>
                </div>
              )}
            </div>
          </CardContent>
        </Card>
        <div className="space-y-3">
          <Button
            onClick={handleSave}
            variant="neon"
            className="w-full"
          >
            Save Purchase
          </Button>
        </div>
      </div>
    </div>
  );
} 