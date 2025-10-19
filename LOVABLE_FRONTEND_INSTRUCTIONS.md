# Frontend Update Instructions for Lovable

## Overview
Update the frontend to fully integrate pressure vessel PDF analysis and live commodity pricing.

---

## 1. Update CommodityPricing Component

**File**: `src/components/CommodityPricing.tsx`

### Changes Needed:

1. **Add Update Button** to fetch live prices from the `update-commodity-prices` Edge Function
2. **Display All Materials** (Steel, Stainless Steel, Aluminum, Copper) instead of just 3
3. **Show Last Updated Timestamp**
4. **Add Loading State** while fetching prices

### Implementation:

```typescript
import { useState, useEffect } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { TrendingUp, TrendingDown, Minus, RefreshCw } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";

interface CommodityPrice {
  name: string;
  price: number;
  unit: string;
  change_percentage: number;
  trend: "up" | "down" | "stable";
  updated_at?: string;
}

const CommodityPricing = () => {
  const [prices, setPrices] = useState<CommodityPrice[]>([]);
  const [loading, setLoading] = useState(true);
  const [updating, setUpdating] = useState(false);

  const fetchPrices = async () => {
    try {
      const { data, error } = await supabase
        .from("commodity_prices")
        .select("*")
        .order("name");

      if (error) throw error;
      setPrices(data || []);
    } catch (error: any) {
      console.error("Error fetching prices:", error);
      toast.error("Failed to load commodity prices");
    } finally {
      setLoading(false);
    }
  };

  const updateLivePrices = async () => {
    setUpdating(true);
    try {
      const { data, error } = await supabase.functions.invoke("update-commodity-prices");

      if (error) throw error;

      if (data?.success) {
        toast.success("Commodity prices updated successfully!");
        await fetchPrices(); // Refresh the display
      }
    } catch (error: any) {
      console.error("Error updating prices:", error);
      toast.error("Failed to update live prices");
    } finally {
      setUpdating(false);
    }
  };

  useEffect(() => {
    fetchPrices();
  }, []);

  const getTrendIcon = (trend: string) => {
    switch (trend) {
      case "up":
        return <TrendingUp className="w-4 h-4 text-success" />;
      case "down":
        return <TrendingDown className="w-4 h-4 text-destructive" />;
      default:
        return <Minus className="w-4 h-4 text-muted-foreground" />;
    }
  };

  const lastUpdated = prices[0]?.updated_at
    ? new Date(prices[0].updated_at).toLocaleString()
    : "Never";

  return (
    <Card className="shadow-card">
      <CardHeader>
        <div className="flex items-center justify-between">
          <div>
            <CardTitle>Live Commodity Pricing</CardTitle>
            <CardDescription>
              Real-time market prices for raw materials
            </CardDescription>
            <p className="text-xs text-muted-foreground mt-1">
              Last updated: {lastUpdated}
            </p>
          </div>
          <Button
            onClick={updateLivePrices}
            disabled={updating}
            size="sm"
            variant="outline"
          >
            {updating ? (
              <>
                <RefreshCw className="w-4 h-4 mr-2 animate-spin" />
                Updating...
              </>
            ) : (
              <>
                <RefreshCw className="w-4 h-4 mr-2" />
                Update Prices
              </>
            )}
          </Button>
        </div>
      </CardHeader>
      <CardContent>
        {loading ? (
          <div className="flex items-center justify-center p-8">
            <RefreshCw className="w-6 h-6 animate-spin text-muted-foreground" />
          </div>
        ) : (
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
            {prices.map((commodity) => (
              <div
                key={commodity.name}
                className="p-4 rounded-lg border bg-card hover:shadow-sm transition-shadow"
              >
                <div className="flex items-center justify-between mb-2">
                  <h4 className="font-semibold text-sm">{commodity.name}</h4>
                  {getTrendIcon(commodity.trend)}
                </div>
                <div className="space-y-1">
                  <p className="text-2xl font-bold">
                    ${commodity.price.toFixed(2)}
                  </p>
                  <p className="text-xs text-muted-foreground">{commodity.unit}</p>
                  {commodity.change_percentage !== 0 && (
                    <p
                      className={`text-xs ${
                        commodity.change_percentage > 0
                          ? "text-success"
                          : "text-destructive"
                      }`}
                    >
                      {commodity.change_percentage > 0 ? "+" : ""}
                      {commodity.change_percentage.toFixed(2)}%
                    </p>
                  )}
                </div>
              </div>
            ))}
          </div>
        )}
      </CardContent>
    </Card>
  );
};

export default CommodityPricing;
```

---

## 2. Update Quote Page

**File**: `src/pages/Quote.tsx`

### Changes Needed:

1. **Import PressureVesselUpload** component
2. **Add State** for vessel dimensions
3. **Display Both CADUpload and PressureVesselUpload** side-by-side
4. **Pass vesselDimensions** to QuoteForm

### Implementation:

```typescript
import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import CADUpload from "@/components/CADUpload";
import PressureVesselUpload from "@/components/PressureVesselUpload";
import CommodityPricing from "@/components/CommodityPricing";
import QuoteForm from "@/components/QuoteForm";
import { Button } from "@/components/ui/button";

interface VesselDimensions {
  radius: number;
  height: number;
  wallThickness: number;
  unit: string;
}

const Quote = () => {
  const navigate = useNavigate();
  const [vesselDimensions, setVesselDimensions] = useState<VesselDimensions | null>(null);

  useEffect(() => {
    supabase.auth.getSession().then(({ data: { session } }) => {
      if (!session) {
        navigate("/auth");
      }
    });

    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((_event, session) => {
      if (!session) {
        navigate("/auth");
      }
    });

    return () => subscription.unsubscribe();
  }, [navigate]);

  const handleSignOut = async () => {
    await supabase.auth.signOut();
    navigate("/auth");
  };

  return (
    <div className="min-h-screen bg-background">
      {/* Navigation Bar */}
      <nav className="fixed top-0 left-0 right-0 z-50 bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60 border-b border-border">
        <div className="container mx-auto px-4 py-4 flex items-center justify-between">
          <h1
            className="text-2xl font-bold text-primary cursor-pointer"
            onClick={() => navigate("/")}
          >
            SmartSpec
          </h1>
          <div className="flex items-center gap-4">
            <Button onClick={() => navigate("/")} variant="ghost">
              Home
            </Button>
            <Button onClick={handleSignOut} variant="outline">
              Sign Out
            </Button>
          </div>
        </div>
      </nav>

      {/* Main Content */}
      <div className="container mx-auto px-4 pt-24 pb-12">
        <div className="max-w-6xl mx-auto">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold mb-4">Generate Your Quote</h2>
            <p className="text-lg text-muted-foreground">
              Upload your files and configure specifications to get instant pricing
            </p>
          </div>

          <div className="grid gap-6 mb-8">
            {/* File Upload Section */}
            <div className="grid gap-6 lg:grid-cols-2">
              <CADUpload />
              <PressureVesselUpload onDimensionsExtracted={setVesselDimensions} />
            </div>

            {/* Quote Form */}
            <QuoteForm vesselDimensions={vesselDimensions} />

            {/* Commodity Pricing */}
            <CommodityPricing />
          </div>
        </div>
      </div>
    </div>
  );
};

export default Quote;
```

---

## 3. QuoteForm Already Updated

The QuoteForm component has already been updated to:
- Accept `vesselDimensions` prop
- Display extracted dimensions
- Pass vessel dimensions to generate-quote function
- Show manual input overrides

**No additional changes needed for QuoteForm.**

---

## 4. Routing Configuration

**File**: `src/App.tsx`

Ensure the `/quote` route is properly configured:

```typescript
import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import Index from "./pages/Index";
import Auth from "./pages/Auth";
import Quote from "./pages/Quote";

function App() {
  return (
    <Router>
      <Routes>
        <Route path="/" element={<Index />} />
        <Route path="/auth" element={<Auth />} />
        <Route path="/quote" element={<Quote />} />
      </Routes>
    </Router>
  );
}

export default App;
```

---

## 5. Database Schema

The backend has created these new database tables:

### `pressure_vessel_uploads`
- `id` (UUID, primary key)
- `user_id` (UUID, references auth.users)
- `file_name` (TEXT)
- `file_path` (TEXT)
- `file_size` (BIGINT)
- `radius` (DOUBLE PRECISION)
- `height` (DOUBLE PRECISION)
- `wall_thickness` (DOUBLE PRECISION)
- `unit` (TEXT)
- `analyzed_at` (TIMESTAMPTZ)
- `created_at` (TIMESTAMPTZ)
- `updated_at` (TIMESTAMPTZ)

### `commodity_prices` (already exists)
- `name` (TEXT, unique)
- `price` (DOUBLE PRECISION)
- `unit` (TEXT)
- `change_percentage` (DOUBLE PRECISION)
- `trend` (TEXT)
- `updated_at` (TIMESTAMPTZ)

---

## 6. Testing the Updates

After implementing these changes:

1. **Test PDF Upload**:
   - Go to `/quote`
   - Upload a pressure vessel PDF drawing
   - Verify dimensions are extracted
   - Generate a quote

2. **Test Commodity Prices**:
   - Click "Update Prices" button
   - Verify all 4 materials show live prices
   - Check that timestamp updates

3. **Test Quote Generation**:
   - Verify quotes calculate correctly using vessel dimensions
   - Check manual input overrides work

---

## Summary of Backend Changes (Already Deployed)

✅ **analyze-pdf** Edge Function - Uses Claude Sonnet 4.5 vision API
✅ **update-commodity-prices** Edge Function - Fetches live Yahoo Finance data
✅ **generate-quote** Edge Function - Updated with cylinder shell volume calculations
✅ **pressure-vessel-pdfs** Storage Bucket - Created with RLS policies
✅ **pressure_vessel_uploads** Table - Created with proper schema
✅ **ANTHROPIC_API_KEY** - Configured in Supabase secrets

---

## Notes

- All backend functions are deployed and working
- The database migrations need to be applied (run the SQL files in Supabase Dashboard)
- PressureVesselUpload component follows the exact same pattern as CADUpload
- Commodity pricing uses real Yahoo Finance data with fallback averages
