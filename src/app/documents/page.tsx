
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Download, BookOpen } from "lucide-react";
import { getDocumentsPageContent, getDownloadableDocuments } from '@/lib/firebase-service';

export const dynamic = 'force-dynamic';

export default async function DocumentsPage() {
    const [content, documents] = await Promise.all([
        getDocumentsPageContent(),
        getDownloadableDocuments()
    ]);

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
              <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 p-6">
                <div className="flex items-center gap-4">
                  <BookOpen className="w-8 h-8 text-primary flex-shrink-0" />
                  <div>
                    <h3 className="font-bold text-lg">{doc.title}</h3>
                    <p className="text-sm text-muted-foreground mt-1">{doc.description}</p>
                  </div>
                </div>
                <Button asChild className="w-full sm:w-auto flex-shrink-0">
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
