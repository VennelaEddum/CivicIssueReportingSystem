import { DashboardLayout } from "@/components/layout/DashboardLayout";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { useIssues } from "@/contexts/IssuesContext";
import { useAuth } from "@/contexts/AuthContext";
import { 
  AlertCircle, 
  CheckCircle2, 
  Clock, 
  TrendingUp,
  Plus,
  MapPin,
  Calendar,
  Eye,
  Loader2
} from "lucide-react";
import { useNavigate } from "react-router-dom";
import { formatDistanceToNow } from "date-fns";

const statusColors = {
  open: "bg-yellow-500/10 text-yellow-600 border-yellow-500/20",
  "in-progress": "bg-blue-500/10 text-blue-600 border-blue-500/20",
  resolved: "bg-green-500/10 text-green-600 border-green-500/20",
};

const categoryLabels: Record<string, string> = {
  roads: "Roads & Potholes",
  lighting: "Street Lighting",
  sanitation: "Sanitation & Waste",
  parks: "Parks & Recreation",
  vandalism: "Vandalism & Graffiti",
  water: "Water & Drainage",
  other: "Other",
};

export default function Dashboard() {
  const navigate = useNavigate();
  const { issues, isLoading } = useIssues();
  const { role } = useAuth();

  const isAdmin = role === "admin";

  const totalIssues = issues.length;
  const resolvedIssues = issues.filter((i) => i.status === "resolved").length;
  const inProgressIssues = issues.filter((i) => i.status === "in-progress").length;
  const openIssues = issues.filter((i) => i.status === "open").length;
  const resolutionRate = totalIssues > 0 ? Math.round((resolvedIssues / totalIssues) * 100) : 0;

  const recentIssues = issues.slice(0, 5);

  const formatDate = (dateString: string) => {
    try {
      return formatDistanceToNow(new Date(dateString), { addSuffix: true });
    } catch {
      return dateString;
    }
  };

  const stats = [
    {
      title: "Total Issues",
      value: totalIssues.toString(),
      description: "Reported by community",
      icon: AlertCircle,
    },
    {
      title: "Resolved",
      value: resolvedIssues.toString(),
      description: `${resolutionRate}% resolution rate`,
      icon: CheckCircle2,
    },
    {
      title: "In Progress",
      value: inProgressIssues.toString(),
      description: "Being addressed",
      icon: Clock,
    },
    {
      title: "Open",
      value: openIssues.toString(),
      description: "Awaiting review",
      icon: TrendingUp,
    },
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
        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div>
            <h2 className="text-2xl font-display font-bold text-foreground">Dashboard</h2>
            <p className="text-muted-foreground">
              Overview of civic issues in your area
              {isAdmin && <span className="ml-2 text-primary">(Admin View)</span>}
            </p>
          </div>
          {!isAdmin && (
            <Button variant="hero" onClick={() => navigate("/report")}>
              <Plus className="w-4 h-4" />
              Report Issue
            </Button>
          )}
        </div>

        {/* Stats Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {stats.map((stat) => (
            <Card key={stat.title} className="shadow-card hover:shadow-elevated transition-shadow duration-200">
              <CardHeader className="flex flex-row items-center justify-between pb-2">
                <CardTitle className="text-sm font-medium text-muted-foreground">
                  {stat.title}
                </CardTitle>
                <stat.icon className="w-5 h-5 text-accent" />
              </CardHeader>
              <CardContent>
                <div className="text-3xl font-display font-bold">{stat.value}</div>
                <p className="text-xs text-muted-foreground mt-1">{stat.description}</p>
              </CardContent>
            </Card>
          ))}
        </div>

        {/* Recent Issues */}
        <Card className="shadow-card">
          <CardHeader className="flex flex-row items-center justify-between">
            <div>
              <CardTitle className="font-display">Recent Issues</CardTitle>
              <CardDescription>Latest reported issues in your community</CardDescription>
            </div>
            {issues.length > 0 && (
              <Button variant="outline" onClick={() => navigate("/issues")}>
                <Eye className="w-4 h-4 mr-2" />
                View All
              </Button>
            )}
          </CardHeader>
          <CardContent>
            {recentIssues.length === 0 ? (
              <div className="text-center py-8">
                <AlertCircle className="w-10 h-10 mx-auto text-muted-foreground mb-3" />
                <p className="text-muted-foreground mb-4">
                  {isAdmin ? "No issues reported by citizens yet" : "No issues reported yet"}
                </p>
                {!isAdmin && (
                  <Button variant="default" onClick={() => navigate("/report")}>
                    Report First Issue
                  </Button>
                )}
              </div>
            ) : (
              <div className="space-y-4">
                {recentIssues.map((issue) => (
                  <div
                    key={issue.id}
                    className="flex flex-col sm:flex-row sm:items-center gap-4 p-4 rounded-lg border border-border hover:bg-muted/50 transition-colors duration-200"
                  >
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 mb-1">
                        <h4 className="font-medium text-foreground truncate">{issue.title}</h4>
                        <Badge variant="outline" className={statusColors[issue.status]}>
                          {issue.status === "open" ? "Open" : issue.status.replace("-", " ")}
                        </Badge>
                      </div>
                      <div className="flex flex-wrap items-center gap-x-4 gap-y-1 text-sm text-muted-foreground">
                        <span className="flex items-center gap-1">
                          <MapPin className="w-3.5 h-3.5" />
                          {issue.location}
                        </span>
                        <span className="flex items-center gap-1">
                          <Calendar className="w-3.5 h-3.5" />
                          {formatDate(issue.created_at)}
                        </span>
                      </div>
                    </div>
                    <Badge variant="secondary" className="self-start sm:self-center">
                      {categoryLabels[issue.category] || issue.category}
                    </Badge>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </DashboardLayout>
  );
}
