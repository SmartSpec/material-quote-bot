import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { TrendingUp, DollarSign, Activity } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";

const CommodityPricing = () => {
  const { data: commodities, isLoading } = useQuery({
    queryKey: ['commodity-prices'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('commodity_prices')
        .select('*')
        .order('name');
      
      if (error) throw error;
      return data;
    },
    refetchInterval: 300000, // Refetch every 5 minutes
  });

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
          {isLoading ? (
            <p className="text-center text-muted-foreground">Loading prices...</p>
          ) : (
            commodities?.map((commodity) => (
              <div
                key={commodity.id}
                className="flex items-center justify-between p-4 rounded-lg bg-muted/50 hover:bg-muted transition-colors duration-200"
              >
                <div className="flex items-center gap-3">
                  <DollarSign className="w-5 h-5 text-primary" />
                  <div>
                    <p className="font-medium">{commodity.name}</p>
                    <p className="text-sm text-muted-foreground">{commodity.unit}</p>
                  </div>
                </div>
                <div className="flex items-center gap-3">
                  <span className="text-lg font-bold">${commodity.price.toFixed(2)}</span>
                  {commodity.change_percentage && (
                    <Badge
                      variant={commodity.trend === "up" ? "default" : "destructive"}
                      className={commodity.trend === "up" ? "bg-success" : ""}
                    >
                      <TrendingUp className={`w-3 h-3 mr-1 ${commodity.trend === "down" ? "rotate-180" : ""}`} />
                      {commodity.change_percentage > 0 ? "+" : ""}{commodity.change_percentage}%
                    </Badge>
                  )}
                </div>
              </div>
            ))
          )}
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
