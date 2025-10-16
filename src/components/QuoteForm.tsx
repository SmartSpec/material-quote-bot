import { useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Calculator, Download } from "lucide-react";
import { toast } from "sonner";

const QuoteForm = () => {
  const [quantity, setQuantity] = useState("1");
  const [material, setMaterial] = useState("");
  const [process, setProcess] = useState("");
  const [isGenerating, setIsGenerating] = useState(false);

  const handleGenerateQuote = () => {
    if (!material || !process) {
      toast.error("Please select material and process type");
      return;
    }

    setIsGenerating(true);
    
    // Simulate quote generation
    setTimeout(() => {
      setIsGenerating(false);
      toast.success("Quote generated successfully! Ready for download.");
    }, 2000);
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
              <SelectItem value="laser">Laser Cutting</SelectItem>
              <SelectItem value="bending">Bending</SelectItem>
              <SelectItem value="welding">Welding</SelectItem>
              <SelectItem value="coating">Coating/Finishing</SelectItem>
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
            disabled={isGenerating}
          >
            <Download className="w-4 h-4 mr-2" />
            Download PDF
          </Button>
        </div>

        <div className="p-4 rounded-lg bg-muted/50 border border-border">
          <div className="flex justify-between items-center mb-2">
            <span className="text-sm text-muted-foreground">Estimated Price</span>
            <span className="text-2xl font-bold text-primary">$1,245.00</span>
          </div>
          <div className="text-xs text-muted-foreground space-y-1">
            <div className="flex justify-between">
              <span>Material Cost:</span>
              <span>$850.00</span>
            </div>
            <div className="flex justify-between">
              <span>Processing:</span>
              <span>$295.00</span>
            </div>
            <div className="flex justify-between">
              <span>Overhead & Energy:</span>
              <span>$100.00</span>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};

export default QuoteForm;
