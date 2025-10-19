import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { Warehouse } from "lucide-react";

const FloorSpaceCapacity = () => {
  const totalCapacity = 1120000; // sq ft
  const usedPercentage = 40;
  const usedSpace = (totalCapacity * usedPercentage) / 100;
  const availableSpace = totalCapacity - usedSpace;

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center gap-2">
          <Warehouse className="w-5 h-5 text-primary" />
          <CardTitle>Floor Space Capacity</CardTitle>
        </div>
        <CardDescription>Warehouse floor availability and usage</CardDescription>
      </CardHeader>
      <CardContent>
        <div className="space-y-6">
          <div>
            <div className="flex justify-between items-center mb-2">
              <span className="text-sm font-medium">Current Usage</span>
              <span className="text-2xl font-bold text-primary">{usedPercentage}%</span>
            </div>
            <Progress value={usedPercentage} className="h-3" />
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mt-6">
            <div className="bg-muted/50 rounded-lg p-4">
              <p className="text-sm text-muted-foreground mb-1">Total Capacity</p>
              <p className="text-2xl font-bold">{(totalCapacity / 1000).toFixed(0)}K sq ft</p>
            </div>

            <div className="bg-muted/50 rounded-lg p-4">
              <p className="text-sm text-muted-foreground mb-1">Space Used</p>
              <p className="text-2xl font-bold text-orange-500">{(usedSpace / 1000).toFixed(0)}K sq ft</p>
            </div>

            <div className="bg-muted/50 rounded-lg p-4">
              <p className="text-sm text-muted-foreground mb-1">Space Available</p>
              <p className="text-2xl font-bold text-green-500">{(availableSpace / 1000).toFixed(0)}K sq ft</p>
            </div>
          </div>

          <div className="bg-primary/5 border border-primary/20 rounded-lg p-4 mt-4">
            <p className="text-sm font-medium text-primary">
              Room for {availableSpace.toLocaleString()} sq ft more capacity
            </p>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};

export default FloorSpaceCapacity;
