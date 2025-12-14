"use client";

import { useEffect, useState } from "react";
import { createClient } from "@/lib/supabase/client";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui";
import { FileText, Download, File, Image, FileSpreadsheet, Presentation } from "lucide-react";
import { format } from "date-fns";
import type { Document } from "@/types/database";

export default function DocumentsPage() {
  const [documents, setDocuments] = useState<Document[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    fetchDocuments();
  }, []);

  const fetchDocuments = async () => {
    const supabase = createClient();
    const { data: { user } } = await supabase.auth.getUser();

    if (!user) return;

    // Get user's cohort
    const { data: membership } = await supabase
      .from("cohort_members")
      .select("cohort_id")
      .eq("user_id", user.id)
      .single() as { data: { cohort_id: string } | null };

    if (!membership) {
      setIsLoading(false);
      return;
    }

    // Get documents for the cohort
    const { data } = await supabase
      .from("documents")
      .select("*")
      .eq("cohort_id", membership.cohort_id)
      .order("created_at", { ascending: false });

    if (data) {
      setDocuments(data);
    }
    setIsLoading(false);
  };

  const handleDownload = async (doc: Document) => {
    const supabase = createClient();
    const { data } = await supabase.storage
      .from("documents")
      .createSignedUrl(doc.file_path, 3600); // 1 hour expiry

    if (data?.signedUrl) {
      window.open(data.signedUrl, "_blank");
    }
  };

  const getFileIcon = (fileType: string) => {
    if (fileType.includes("image")) return <Image className="w-6 h-6" />;
    if (fileType.includes("spreadsheet") || fileType.includes("excel"))
      return <FileSpreadsheet className="w-6 h-6" />;
    if (fileType.includes("presentation") || fileType.includes("powerpoint"))
      return <Presentation className="w-6 h-6" />;
    if (fileType.includes("pdf")) return <FileText className="w-6 h-6" />;
    return <File className="w-6 h-6" />;
  };

  const formatFileSize = (bytes: number) => {
    if (bytes < 1024) return `${bytes} B`;
    if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
    return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
  };

  if (isLoading) {
    return (
      <div className="text-center py-12 text-muted-foreground">
        Loading documents...
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold text-foreground">Documents</h1>
        <p className="text-muted-foreground mt-1">
          Resources and materials shared by your moderators
        </p>
      </div>

      {documents.length === 0 ? (
        <Card className="text-center py-16">
          <CardContent>
            <FileText className="w-16 h-16 text-muted-foreground mx-auto mb-4" />
            <h2 className="text-xl font-semibold text-foreground mb-2">
              No Documents Yet
            </h2>
            <p className="text-muted-foreground max-w-md mx-auto">
              Your moderators will share resources and materials here as your
              journey progresses.
            </p>
          </CardContent>
        </Card>
      ) : (
        <Card>
          <CardHeader>
            <CardTitle>Available Resources ({documents.length})</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="divide-y divide-border">
              {documents.map((doc) => (
                <div
                  key={doc.id}
                  className="py-4 first:pt-0 last:pb-0 flex items-center justify-between"
                >
                  <div className="flex items-center gap-4">
                    <div className="w-12 h-12 bg-primary/10 rounded-xl flex items-center justify-center text-primary">
                      {getFileIcon(doc.file_type)}
                    </div>
                    <div>
                      <h3 className="font-medium text-foreground">{doc.title}</h3>
                      {doc.description && (
                        <p className="text-sm text-muted-foreground mt-0.5">
                          {doc.description}
                        </p>
                      )}
                      <div className="flex items-center gap-3 mt-1 text-xs text-muted-foreground">
                        <span>{formatFileSize(doc.file_size)}</span>
                        <span>•</span>
                        <span>{format(new Date(doc.created_at), "MMM d, yyyy")}</span>
                      </div>
                    </div>
                  </div>
                  <button
                    onClick={() => handleDownload(doc)}
                    className="flex items-center gap-2 px-4 py-2 bg-primary text-primary-foreground rounded-lg hover:bg-primary/90 transition-colors text-sm font-medium"
                  >
                    <Download className="w-4 h-4" />
                    Download
                  </button>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
