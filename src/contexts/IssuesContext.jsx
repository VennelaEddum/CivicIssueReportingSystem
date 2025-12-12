import { createContext, useContext, useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";
import { toast } from "@/hooks/use-toast";

const IssuesContext = createContext(undefined);

export function IssuesProvider({ children }) {
  const [issues, setIssues] = useState([]);
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
      setIssues(data);
    }
    setIsLoading(false);
  };

  useEffect(() => {
    fetchIssues();
  }, [isAuthenticated]);

  const addIssue = async (issue) => {
    if (!user) return;

    const { error } = await supabase.from("issues").insert({
      title: issue.title,
      category: issue.category,
      location: issue.location,
      description: issue.description,
      priority: issue.priority,
      reported_by: user.id,
      status: "open",
      photo_url: issue.photo_url || null,
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

  const updateIssueStatus = async (id, status) => {
    if (!user) return;

    const updateData = { status };
    
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

  const deleteIssue = async (id) => {
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
