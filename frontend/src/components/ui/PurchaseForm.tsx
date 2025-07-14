import { useState } from "react";
import { Plus, Trash2, Upload, Download, Calendar } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

export interface PurchaseItem {
  id: string;
  name: string;
  quantity: string;
  price: string;
  project: string;
}

export interface PurchaseFormProps {
  onSave: (purchase: { date: string; items: PurchaseItem[]; billFile?: string | null }) => void;
  initialDate?: string;
  initialItems?: PurchaseItem[];
  initialBillFile?: string | null;
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
    initialItems || [{ id: '1', name: '', quantity: '', price: '', project: '' }]
  );
  const [billFile, setBillFile] = useState<File | null>(null);

  const addItem = () => {
    setItems([...items, { id: Date.now().toString(), name: '', quantity: '', price: '', project: '' }]);
  };

  const removeItem = (id: string) => {
    if (items.length > 1) {
      setItems(items.filter(item => item.id !== id));
    }
  };

  const updateItem = (id: string, field: keyof PurchaseItem, value: string) => {
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

  const API_URL = import.meta.env.VITE_API_URL;

  const handleSave = async () => {
    const validItems = items.filter(item => item.name.trim() !== '');
    if (validItems.length === 0) {
      // Optionally, you can add a callback for error handling
      return;
    }
    let billFileName: string | null = initialBillFile || null;
    if (billFile && billFile instanceof File) {
      // Upload the file to the backend
      const formData = new FormData();
      formData.append('bill', billFile);
      const res = await fetch(`${API_URL}/api/purchases/upload-bill`, {
        method: 'POST',
        body: formData,
      });
      if (res.ok) {
        const data = await res.json();
        billFileName = data.filename;
      } else {
        // Optionally handle upload error
        return;
      }
    }
    onSave({ date: purchaseDate, items: validItems, billFile: billFileName });
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
            <div className="flex flex-col gap-1 max-w-xs">
              <Label htmlFor="purchase-date-input">Date</Label>
              <Input
                id="purchase-date-input"
                type="date"
                value={purchaseDate}
                onChange={(e) => setPurchaseDate(e.target.value)}
                className="max-w-xs"
              />
            </div>
          </CardContent>
        </Card>

        {/* Items List */}
        <Card className="glass-card">
          <CardHeader>
            <CardTitle>Items Purchased</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            {items.map((item, index) => (
              <div key={item.id} className="grid grid-cols-1 md:grid-cols-4 gap-2 md:gap-4 items-end animate-slide-in">
                <div className="flex flex-col gap-1">
                  <Label htmlFor={`item-${item.id}`}>Name</Label>
                  <Input
                    id={`item-${item.id}`}
                    placeholder="e.g., NodeMCU ESP32"
                    value={item.name}
                    onChange={(e) => updateItem(item.id, 'name', e.target.value)}
                  />
                </div>
                <div className="flex flex-col gap-1">
                  <Label htmlFor={`qty-${item.id}`}>Quantity</Label>
                  <Input
                    id={`qty-${item.id}`}
                    type="text"
                    value={item.quantity}
                    onChange={(e) => updateItem(item.id, 'quantity', e.target.value)}
                  />
                </div>
                <div className="flex flex-col gap-1">
                  <Label htmlFor={`price-${item.id}`}>Price</Label>
                  <Input
                    id={`price-${item.id}`}
                    type="text"
                    value={item.price}
                    onChange={(e) => updateItem(item.id, 'price', e.target.value)}
                  />
                </div>
                <div className="flex flex-col gap-1">
                  <Label htmlFor={`proj-${item.id}`}>Project</Label>
                  <Input
                    id={`proj-${item.id}`}
                    type="text"
                    value={item.project}
                    onChange={(e) => updateItem(item.id, 'project', e.target.value)}
                  />
                </div>
                <div className="flex items-end">
                  <Button
                    variant="outline"
                    size="icon"
                    onClick={() => removeItem(item.id)}
                    disabled={items.length === 1}
                    className="text-destructive hover:text-destructive mt-6 md:mt-0"
                  >
                    <Trash2 className="h-4 w-4" />
                  </Button>
                </div>
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
                <Label htmlFor="bill-upload">Upload Bill</Label>
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