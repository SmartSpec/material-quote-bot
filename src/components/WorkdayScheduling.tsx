import { useState } from "react";
import { Calendar } from "@/components/ui/calendar";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import workdayLogo from "@/assets/workday-logo.png";

const WorkdayScheduling = () => {
  const [date, setDate] = useState<Date | undefined>(new Date());

  // Simulated worker schedule data
  const scheduleData = [
    { name: "John Smith", role: "Welder", shift: "Morning (6AM-2PM)", availability: "Available" },
    { name: "Sarah Johnson", role: "Fabricator", shift: "Afternoon (2PM-10PM)", availability: "Available" },
    { name: "Mike Chen", role: "Quality Inspector", shift: "Morning (6AM-2PM)", availability: "On Leave" },
    { name: "Emily Davis", role: "CNC Operator", shift: "Night (10PM-6AM)", availability: "Available" },
    { name: "Robert Garcia", role: "Welder", shift: "Afternoon (2PM-10PM)", availability: "Available" },
    { name: "Lisa Anderson", role: "Assembly Tech", shift: "Morning (6AM-2PM)", availability: "Available" },
  ];

  return (
    <Card className="border-border shadow-card">
      <CardHeader>
        <div className="flex items-center gap-3 mb-2">
          <img src={workdayLogo} alt="Workday" className="w-10 h-10" />
          <div>
            <CardTitle>Worker Scheduling & Availability</CardTitle>
            <CardDescription>Live view of shifts and worker availability for the next month</CardDescription>
          </div>
        </div>
      </CardHeader>
      <CardContent>
        <div className="grid md:grid-cols-2 gap-6">
          <div>
            <h3 className="font-semibold mb-4 text-foreground">Calendar View</h3>
            <Calendar
              mode="single"
              selected={date}
              onSelect={setDate}
              className="rounded-md border border-border"
            />
          </div>
          
          <div>
            <h3 className="font-semibold mb-4 text-foreground">Today's Schedule</h3>
            <div className="space-y-3">
              {scheduleData.map((worker, index) => (
                <div 
                  key={index}
                  className="p-3 rounded-lg border border-border bg-card hover:shadow-sm transition-shadow"
                >
                  <div className="flex justify-between items-start mb-1">
                    <div>
                      <p className="font-medium text-foreground">{worker.name}</p>
                      <p className="text-sm text-muted-foreground">{worker.role}</p>
                    </div>
                    <Badge 
                      variant={worker.availability === "Available" ? "default" : "secondary"}
                      className={worker.availability === "Available" ? "bg-green-500/10 text-green-700 dark:text-green-400 hover:bg-green-500/20" : ""}
                    >
                      {worker.availability}
                    </Badge>
                  </div>
                  <p className="text-xs text-muted-foreground mt-2">{worker.shift}</p>
                </div>
              ))}
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};

export default WorkdayScheduling;
