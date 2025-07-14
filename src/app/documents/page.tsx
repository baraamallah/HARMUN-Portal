

"use client";

import React, { useEffect, useState } from 'react';
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Download, BookOpen } from "lucide-react";
import { getDocumentsPageContent, getDownloadableDocuments } from '@/lib/firebase-service';
import type { DocumentsPageContent, DownloadableDocument } from '@/lib/types';
import { Skeleton } from '@/components/ui/skeleton';

export default function DocumentsPage() {
    const [content, setContent] = useState<DocumentsPageContent | null>(null);
    const [documents, setDocuments] = useState<DownloadableDocument[]>([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        async function fetchData() {
            try {
                const [pageContent, pageDocuments] = await Promise.all([
                    getDocumentsPageContent(),
                    getDownloadableDocuments()
                ]);
                setContent(pageContent);
                setDocuments(pageDocuments);
            } catch (error) {
                console.error("Failed to load documents page data", error);
            } finally {
                setLoading(false);
            }
        }
        fetchData();
    }, []);

    if (loading) {
        return (
            <div className="container mx-auto px-4 py-12 md:py-20">
                <div className="text-center mb-12">
                    <Skeleton className="h-12 w-3/4 mx-auto" />
                    <Skeleton className="h-6 w-1/2 mx-auto mt-4" />
                </div>
                 <div className="space-y-4 max-w-4xl mx-auto">
                    <Skeleton className="h-32 w-full" />
                    <Skeleton className="h-32 w-full" />
                    <Skeleton className="h-32 w-full" />
                 </div>
            </div>
        )
    }

  return (
    <div className="container mx-auto px-4 py-12 md:py-20">
      <div className="text-center mb-12 animate-fade-in-up">
        <h1 className="text-4xl md:text-5xl font-bold font-headline text-foreground">{content?.title}</h1>
        <p className="mt-4 text-lg text-muted-foreground max-w-2xl mx-auto">
          {content?.subtitle}
        </p>
      </div>

      <div className="max-w-4xl mx-auto space-y-6">
        {documents.length > 0 ? (
          documents.map((doc, index) => (
            <Card key={doc.id} className="animate-fade-in-up transition-all duration-300 hover:border-primary hover:-translate-y-1" style={{ animationDelay: `${index * 150}ms` }}>
              <div className="flex items-center justify-between p-6">
                <div className="flex items-center gap-4">
                  <BookOpen className="w-8 h-8 text-primary flex-shrink-0" />
                  <div>
                    <h3 className="font-bold text-lg">{doc.title}</h3>
                    <p className="text-sm text-muted-foreground mt-1">{doc.description}</p>
                  </div>
                </div>
                <Button asChild>
                  <a href={doc.url} target="_blank" rel="noopener noreferrer">
                    <Download className="mr-2 h-4 w-4" />
                    Download
                  </a>
                </Button>
              </div>
            </Card>
          ))
        ) : (
          <div className="text-center text-muted-foreground py-16 animate-fade-in-up">
            <p>No documents are available for download at this time.</p>
          </div>
        )}
      </div>
    </div>
  );
}
