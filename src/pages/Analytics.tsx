import { DashboardLayout } from "@/components/layout/DashboardLayout";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { useIssues } from "@/contexts/IssuesContext";
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, PieChart, Pie, Cell } from "recharts";
import { Loader2 } from "lucide-react";

const categoryLabels: Record<string, string> = {
  roads: "Roads",
  lighting: "Lighting",
  sanitation: "Sanitation",
  parks: "Parks",
  vandalism: "Vandalism",
  water: "Water",
  other: "Other",
};

const categoryColors: Record<string, string> = {
  roads: "hsl(215, 70%, 35%)",
  lighting: "hsl(174, 62%, 40%)",
  sanitation: "hsl(45, 90%, 50%)",
  parks: "hsl(120, 40%, 45%)",
  vandalism: "hsl(0, 70%, 50%)",
  water: "hsl(200, 70%, 50%)",
  other: "hsl(280, 50%, 50%)",
};

export default function Analytics() {
  const { issues, isLoading } = useIssues();

  const totalIssues = issues.length;
  const resolvedIssues = issues.filter((i) => i.status === "resolved").length;
  const inProgressIssues = issues.filter((i) => i.status === "in-progress").length;
  const openIssues = issues.filter((i) => i.status === "open").length;
  const resolutionRate = totalIssues > 0 ? Math.round((resolvedIssues / totalIssues) * 100) : 0;

  // Group by category
  const categoryData = Object.entries(
    issues.reduce((acc, issue) => {
      acc[issue.category] = (acc[issue.category] || 0) + 1;
      return acc;
    }, {} as Record<string, number>)
  ).map(([name, value]) => ({
    name: categoryLabels[name] || name,
    value,
    color: categoryColors[name] || "hsl(200, 50%, 50%)",
  }));

  // Group by status
  const statusData = [
    { status: "Open", count: openIssues, color: "hsl(45, 90%, 50%)" },
    { status: "In Progress", count: inProgressIssues, color: "hsl(215, 70%, 50%)" },
    { status: "Resolved", count: resolvedIssues, color: "hsl(120, 50%, 45%)" },
  ];

  if (isLoading) {
    return (
      <DashboardLayout>
        <div className="flex items-center justify-center h-64">
          <Loader2 className="w-8 h-8 animate-spin text-primary" />
        </div>
      </DashboardLayout>
    );
  }

  return (
    <DashboardLayout>
      <div className="space-y-6">
        <div>
          <h2 className="text-2xl font-display font-bold text-foreground">Analytics</h2>
          <p className="text-muted-foreground">Track community engagement and issue resolution</p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Status Distribution */}
          <Card className="shadow-card">
            <CardHeader>
              <CardTitle className="font-display">Issues by Status</CardTitle>
              <CardDescription>Current status distribution</CardDescription>
            </CardHeader>
            <CardContent>
              {totalIssues === 0 ? (
                <div className="h-[300px] flex items-center justify-center text-muted-foreground">
                  No data to display yet
                </div>
              ) : (
                <div className="h-[300px]">
                  <ResponsiveContainer width="100%" height="100%">
                    <BarChart data={statusData}>
                      <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
                      <XAxis dataKey="status" stroke="hsl(var(--muted-foreground))" fontSize={12} />
                      <YAxis stroke="hsl(var(--muted-foreground))" fontSize={12} allowDecimals={false} />
                      <Tooltip 
                        contentStyle={{ 
                          backgroundColor: "hsl(var(--card))", 
                          border: "1px solid hsl(var(--border))",
                          borderRadius: "8px"
                        }} 
                      />
                      <Bar dataKey="count" radius={[4, 4, 0, 0]} name="Issues">
                        {statusData.map((entry, index) => (
                          <Cell key={`cell-${index}`} fill={entry.color} />
                        ))}
                      </Bar>
                    </BarChart>
                  </ResponsiveContainer>
                </div>
              )}
            </CardContent>
          </Card>

          {/* Category Distribution */}
          <Card className="shadow-card">
            <CardHeader>
              <CardTitle className="font-display">Issues by Category</CardTitle>
              <CardDescription>Distribution of reported issues</CardDescription>
            </CardHeader>
            <CardContent>
              {categoryData.length === 0 ? (
                <div className="h-[300px] flex items-center justify-center text-muted-foreground">
                  No data to display yet
                </div>
              ) : (
                <>
                  <div className="h-[240px] flex items-center">
                    <ResponsiveContainer width="100%" height="100%">
                      <PieChart>
                        <Pie
                          data={categoryData}
                          cx="50%"
                          cy="50%"
                          innerRadius={50}
                          outerRadius={90}
                          paddingAngle={2}
                          dataKey="value"
                        >
                          {categoryData.map((entry, index) => (
                            <Cell key={`cell-${index}`} fill={entry.color} />
                          ))}
                        </Pie>
                        <Tooltip 
                          contentStyle={{ 
                            backgroundColor: "hsl(var(--card))", 
                            border: "1px solid hsl(var(--border))",
                            borderRadius: "8px"
                          }} 
                        />
                      </PieChart>
                    </ResponsiveContainer>
                  </div>
                  <div className="flex flex-wrap justify-center gap-4 mt-2">
                    {categoryData.map((cat) => (
                      <div key={cat.name} className="flex items-center gap-2">
                        <div className="w-3 h-3 rounded-full" style={{ backgroundColor: cat.color }} />
                        <span className="text-sm text-muted-foreground">{cat.name} ({cat.value})</span>
                      </div>
                    ))}
                  </div>
                </>
              )}
            </CardContent>
          </Card>

          {/* Quick Stats */}
          <Card className="lg:col-span-2 shadow-card">
            <CardHeader>
              <CardTitle className="font-display">Performance Metrics</CardTitle>
              <CardDescription>Key performance indicators</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
                <div className="text-center p-4 rounded-lg bg-muted/50">
                  <p className="text-3xl font-display font-bold text-primary">{resolutionRate}%</p>
                  <p className="text-sm text-muted-foreground mt-1">Resolution Rate</p>
                </div>
                <div className="text-center p-4 rounded-lg bg-muted/50">
                  <p className="text-3xl font-display font-bold text-accent">{totalIssues}</p>
                  <p className="text-sm text-muted-foreground mt-1">Total Reports</p>
                </div>
                <div className="text-center p-4 rounded-lg bg-muted/50">
                  <p className="text-3xl font-display font-bold text-primary">{resolvedIssues}</p>
                  <p className="text-sm text-muted-foreground mt-1">Resolved</p>
                </div>
                <div className="text-center p-4 rounded-lg bg-muted/50">
                  <p className="text-3xl font-display font-bold text-accent">{openIssues}</p>
                  <p className="text-sm text-muted-foreground mt-1">Open</p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </DashboardLayout>
  );
}
