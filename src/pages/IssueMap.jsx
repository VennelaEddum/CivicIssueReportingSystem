import { DashboardLayout } from "@/components/layout/DashboardLayout";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { useIssues } from "@/contexts/IssuesContext";
import { useNavigate } from "react-router-dom";
import { MapPin, Plus, AlertCircle } from "lucide-react";

const statusColors = {
  pending: "text-yellow-500",
  "in-progress": "text-blue-500",
  resolved: "text-green-500",
};

export default function IssueMap() {
  const { issues } = useIssues();
  const navigate = useNavigate();

  return (
    <DashboardLayout>
      <div className="space-y-6">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div>
            <h2 className="text-2xl font-display font-bold text-foreground">Issue Map</h2>
            <p className="text-muted-foreground">View reported issues on the map</p>
          </div>
          <Button variant="hero" onClick={() => navigate("/report")}>
            <Plus className="w-4 h-4" />
            Report Issue
          </Button>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Map placeholder */}
          <Card className="lg:col-span-2 shadow-card">
            <CardContent className="p-0">
              <div className="relative h-[500px] bg-muted rounded-lg overflow-hidden">
                {/* Grid pattern for map placeholder */}
                <div className="absolute inset-0 opacity-20">
                  <svg width="100%" height="100%">
                    <defs>
                      <pattern id="grid" width="40" height="40" patternUnits="userSpaceOnUse">
                        <path d="M 40 0 L 0 0 0 40" fill="none" stroke="currentColor" strokeWidth="0.5" />
                      </pattern>
                    </defs>
                    <rect width="100%" height="100%" fill="url(#grid)" />
                  </svg>
                </div>
                
                {issues.length === 0 ? (
                  <div className="absolute inset-0 flex items-center justify-center">
                    <div className="text-center">
                      <AlertCircle className="w-12 h-12 mx-auto text-muted-foreground mb-3" />
                      <p className="text-muted-foreground">No issues to display on map</p>
                    </div>
                  </div>
                ) : (
                  /* Issue markers - distributed across the map */
                  issues.map((issue, index) => {
                    const x = 15 + (index % 4) * 20 + Math.random() * 10;
                    const y = 15 + Math.floor(index / 4) * 25 + Math.random() * 10;
                    return (
                      <div
                        key={issue.id}
                        className="absolute transform -translate-x-1/2 -translate-y-1/2 cursor-pointer group"
                        style={{ left: `${Math.min(x, 85)}%`, top: `${Math.min(y, 85)}%` }}
                      >
                        <div className="relative">
                          <MapPin 
                            className={`w-8 h-8 ${statusColors[issue.status]} drop-shadow-lg transition-transform group-hover:scale-110`} 
                            fill="currentColor"
                            fillOpacity={0.2}
                          />
                          <div className="absolute bottom-full left-1/2 -translate-x-1/2 mb-2 px-2 py-1 bg-card text-card-foreground text-xs rounded shadow-lg opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap z-10">
                            {issue.title}
                          </div>
                        </div>
                      </div>
                    );
                  })
                )}

                <div className="absolute bottom-4 left-4 right-4 bg-card/90 backdrop-blur-sm rounded-lg p-3">
                  <p className="text-sm text-center text-muted-foreground">
                    Interactive map will be available when connected to a mapping service
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Legend & List */}
          <Card className="shadow-card">
            <CardHeader>
              <CardTitle className="font-display text-lg">Issue Legend</CardTitle>
              <CardDescription>Status indicators</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-center gap-3">
                <MapPin className="w-5 h-5 text-yellow-500" />
                <span className="text-sm">Pending Review</span>
              </div>
              <div className="flex items-center gap-3">
                <MapPin className="w-5 h-5 text-blue-500" />
                <span className="text-sm">In Progress</span>
              </div>
              <div className="flex items-center gap-3">
                <MapPin className="w-5 h-5 text-green-500" />
                <span className="text-sm">Resolved</span>
              </div>

              <div className="border-t border-border pt-4 mt-4">
                <h4 className="font-medium mb-3">Reported Issues ({issues.length})</h4>
                {issues.length === 0 ? (
                  <p className="text-sm text-muted-foreground">No issues reported yet</p>
                ) : (
                  <div className="space-y-2 max-h-[250px] overflow-y-auto">
                    {issues.map((issue) => (
                      <div key={issue.id} className="flex items-center justify-between p-2 rounded-lg hover:bg-muted/50 cursor-pointer transition-colors">
                        <span className="text-sm truncate flex-1">{issue.title}</span>
                        <Badge variant="outline" className="text-xs capitalize ml-2">
                          {issue.status.replace("-", " ")}
                        </Badge>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </DashboardLayout>
  );
}
