import { useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Calculator, Download } from "lucide-react";
import { toast } from "sonner";
import { supabase } from "@/integrations/supabase/client";

const QuoteForm = () => {
  const [quantity, setQuantity] = useState("1");
  const [material, setMaterial] = useState("");
  const [process, setProcess] = useState("");
  const [isGenerating, setIsGenerating] = useState(false);
  const [generatedQuote, setGeneratedQuote] = useState<any>(null);

  const handleGenerateQuote = async () => {
    if (!material || !process) {
      toast.error("Please select material and process type");
      return;
    }

    setIsGenerating(true);
    
    try {
      const { data: { user } } = await supabase.auth.getUser();
      
      if (!user) {
        toast.error("Please sign in to generate quotes");
        return;
      }

      const { data, error } = await supabase.functions.invoke('generate-quote', {
        body: {
          quantity: parseInt(quantity),
          material,
          process,
          cadUploadId: null,
        },
      });

      if (error) throw error;

      setGeneratedQuote(data);
      toast.success("Quote generated successfully!");
    } catch (error: any) {
      toast.error(error.message || "Failed to generate quote");
    } finally {
      setIsGenerating(false);
    }
  };

  return (
    <Card className="shadow-card hover:shadow-elegant transition-shadow duration-300">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Calculator className="w-5 h-5 text-primary" />
          Quote Configuration
        </CardTitle>
        <CardDescription>
          Configure your part specifications for accurate pricing
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-6">
        <div className="space-y-2">
          <Label htmlFor="quantity">Quantity</Label>
          <Input
            id="quantity"
            type="number"
            min="1"
            value={quantity}
            onChange={(e) => setQuantity(e.target.value)}
            placeholder="Enter quantity"
          />
        </div>

        <div className="space-y-2">
          <Label htmlFor="material">Material Type</Label>
          <Select value={material} onValueChange={setMaterial}>
            <SelectTrigger>
              <SelectValue placeholder="Select material" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="steel">Steel</SelectItem>
              <SelectItem value="aluminum">Aluminum</SelectItem>
              <SelectItem value="copper">Copper</SelectItem>
              <SelectItem value="stainless">Stainless Steel</SelectItem>
            </SelectContent>
          </Select>
        </div>

        <div className="space-y-2">
          <Label htmlFor="process">Fabrication Process</Label>
          <Select value={process} onValueChange={setProcess}>
            <SelectTrigger>
              <SelectValue placeholder="Select process" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="laser-cutting">Laser Cutting</SelectItem>
              <SelectItem value="cnc-machining">CNC Machining</SelectItem>
              <SelectItem value="sheet-metal">Sheet Metal</SelectItem>
              <SelectItem value="welding">Welding</SelectItem>
            </SelectContent>
          </Select>
        </div>

        <div className="pt-4 space-y-3">
          <Button 
            className="w-full" 
            size="lg"
            onClick={handleGenerateQuote}
            disabled={isGenerating}
          >
            {isGenerating ? (
              <>
                <div className="w-4 h-4 mr-2 border-2 border-primary-foreground border-t-transparent rounded-full animate-spin" />
                Generating Quote...
              </>
            ) : (
              <>
                <Calculator className="w-4 h-4 mr-2" />
                Generate Quote
              </>
            )}
          </Button>
          
          <Button 
            variant="outline" 
            className="w-full"
            disabled={!generatedQuote}
          >
            <Download className="w-4 h-4 mr-2" />
            Download PDF
          </Button>
        </div>

        {generatedQuote && (
          <div className="p-4 rounded-lg bg-primary/5 border border-primary/20">
            <h4 className="font-semibold mb-3">Estimated Price Breakdown</h4>
            <div className="space-y-2 text-sm">
              <div className="flex justify-between">
                <span className="text-muted-foreground">Material Cost:</span>
                <span className="font-medium">${generatedQuote.material_cost.toFixed(2)}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-muted-foreground">Fabrication:</span>
                <span className="font-medium">${generatedQuote.fabrication_cost.toFixed(2)}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-muted-foreground">Overhead & Risk:</span>
                <span className="font-medium">${generatedQuote.overhead_cost.toFixed(2)}</span>
              </div>
              <div className="pt-2 border-t border-primary/20 flex justify-between text-base">
                <span className="font-semibold">Total:</span>
                <span className="font-bold text-primary">${generatedQuote.total_price.toFixed(2)}</span>
              </div>
              <div className="text-xs text-muted-foreground mt-2">
                Valid until: {new Date(generatedQuote.valid_until).toLocaleDateString()}
              </div>
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
};

export default QuoteForm;
