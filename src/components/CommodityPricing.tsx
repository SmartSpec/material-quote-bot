import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { TrendingUp, DollarSign, Activity } from "lucide-react";
import { Badge } from "@/components/ui/badge";

const CommodityPricing = () => {
  const commodities = [
    { name: "Steel Rebar", price: "$725.50", change: "+2.3%", trend: "up" },
    { name: "Aluminum", price: "$2,450.00", change: "-0.8%", trend: "down" },
    { name: "Copper", price: "$8,920.00", change: "+1.5%", trend: "up" },
    { name: "Stainless Steel", price: "$1,875.00", change: "+0.4%", trend: "up" },
  ];

  return (
    <Card className="shadow-card hover:shadow-elegant transition-shadow duration-300">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Activity className="w-5 h-5 text-primary" />
          Live Commodity Prices
        </CardTitle>
        <CardDescription>
          Real-time pricing updated every 5 minutes
        </CardDescription>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          {commodities.map((commodity, index) => (
            <div
              key={index}
              className="flex items-center justify-between p-4 rounded-lg bg-muted/50 hover:bg-muted transition-colors duration-200"
            >
              <div className="flex items-center gap-3">
                <DollarSign className="w-5 h-5 text-primary" />
                <div>
                  <p className="font-medium">{commodity.name}</p>
                  <p className="text-sm text-muted-foreground">Per metric ton</p>
                </div>
              </div>
              <div className="flex items-center gap-3">
                <span className="text-lg font-bold">{commodity.price}</span>
                <Badge
                  variant={commodity.trend === "up" ? "default" : "destructive"}
                  className={commodity.trend === "up" ? "bg-success" : ""}
                >
                  <TrendingUp className={`w-3 h-3 mr-1 ${commodity.trend === "down" ? "rotate-180" : ""}`} />
                  {commodity.change}
                </Badge>
              </div>
            </div>
          ))}
        </div>
        
        <div className="mt-6 p-4 rounded-lg bg-primary/5 border border-primary/20">
          <div className="flex items-start gap-3">
            <TrendingUp className="w-5 h-5 text-primary mt-0.5" />
            <div>
              <p className="text-sm font-medium">Market Update</p>
              <p className="text-xs text-muted-foreground mt-1">
                Prices include regional adjustments and supplier markups. 
                Quote validity: 7 days with escalation clause.
              </p>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};

export default CommodityPricing;
