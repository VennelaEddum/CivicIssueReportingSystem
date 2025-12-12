import { createContext, useContext, useState, useEffect, ReactNode } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";
import { toast } from "@/hooks/use-toast";

export interface Issue {
  id: string;
  title: string;
  category: string;
  location: string;
  description: string;
  status: "open" | "in-progress" | "resolved";
  priority: string;
  created_at: string;
  reported_by: string;
  resolved_by?: string;
  resolved_at?: string;
}

interface IssuesContextType {
  issues: Issue[];
  isLoading: boolean;
  addIssue: (issue: { title: string; category: string; location: string; description: string; priority: string }) => Promise<void>;
  updateIssueStatus: (id: string, status: Issue["status"]) => Promise<void>;
  deleteIssue: (id: string) => Promise<void>;
  refetch: () => Promise<void>;
}

const IssuesContext = createContext<IssuesContextType | undefined>(undefined);

export function IssuesProvider({ children }: { children: ReactNode }) {
  const [issues, setIssues] = useState<Issue[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const { user, isAuthenticated } = useAuth();

  const fetchIssues = async () => {
    if (!isAuthenticated) {
      setIssues([]);
      setIsLoading(false);
      return;
    }

    setIsLoading(true);
    const { data, error } = await supabase
      .from("issues")
      .select("*")
      .order("created_at", { ascending: false });

    if (error) {
      console.error("Error fetching issues:", error);
      toast({
        title: "Error",
        description: "Failed to load issues",
        variant: "destructive",
      });
    } else {
      setIssues(data as Issue[]);
    }
    setIsLoading(false);
  };

  useEffect(() => {
    fetchIssues();
  }, [isAuthenticated]);

  const addIssue = async (issue: { title: string; category: string; location: string; description: string; priority: string }) => {
    if (!user) return;

    const { error } = await supabase.from("issues").insert({
      title: issue.title,
      category: issue.category,
      location: issue.location,
      description: issue.description,
      priority: issue.priority,
      reported_by: user.id,
      status: "open",
    });

    if (error) {
      console.error("Error adding issue:", error);
      toast({
        title: "Error",
        description: "Failed to report issue",
        variant: "destructive",
      });
      throw error;
    }

    await fetchIssues();
  };

  const updateIssueStatus = async (id: string, status: Issue["status"]) => {
    if (!user) return;

    const updateData: { status: string; resolved_by?: string; resolved_at?: string } = { status };
    
    if (status === "resolved") {
      updateData.resolved_by = user.id;
      updateData.resolved_at = new Date().toISOString();
    }

    const { error } = await supabase
      .from("issues")
      .update(updateData)
      .eq("id", id);

    if (error) {
      console.error("Error updating issue:", error);
      toast({
        title: "Error",
        description: "Failed to update issue status",
        variant: "destructive",
      });
      throw error;
    }

    await fetchIssues();
  };

  const deleteIssue = async (id: string) => {
    const { error } = await supabase.from("issues").delete().eq("id", id);

    if (error) {
      console.error("Error deleting issue:", error);
      toast({
        title: "Error",
        description: "Failed to delete issue",
        variant: "destructive",
      });
      throw error;
    }

    await fetchIssues();
  };

  return (
    <IssuesContext.Provider value={{ issues, isLoading, addIssue, updateIssueStatus, deleteIssue, refetch: fetchIssues }}>
      {children}
    </IssuesContext.Provider>
  );
}

export function useIssues() {
  const context = useContext(IssuesContext);
  if (context === undefined) {
    throw new Error("useIssues must be used within an IssuesProvider");
  }
  return context;
}
