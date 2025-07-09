"use client";

import React, { useEffect, useState } from 'react';
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion";
import { Upload, FileText } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { getDocumentsPageContent, getCodeOfConduct } from '@/lib/firebase-service';
import type { DocumentsPageContent, CodeOfConductItem } from '@/lib/types';
import { Skeleton } from '@/components/ui/skeleton';

function PaperUploadForm({ title, description }: { title?: string; description?: string }) {
    const { toast } = useToast();

    const handleSubmit = (event: React.FormEvent<HTMLFormElement>) => {
        event.preventDefault();
        const form = event.currentTarget;
        const fileInput = form.elements.namedItem('paperFile') as HTMLInputElement;
        if (fileInput && fileInput.files && fileInput.files.length > 0) {
            toast({
                title: "File Uploaded",
                description: `${fileInput.files[0].name} has been submitted successfully.`,
            });
            form.reset();
        } else {
             toast({
                title: "No File Selected",
                description: "Please select a file to upload.",
                variant: "destructive"
            });
        }
    }

    return (
        <Card className="transition-all duration-300 hover:border-primary hover:-translate-y-1">
          <CardHeader>
            <CardTitle className="flex items-center gap-2"><Upload className="w-6 h-6 text-primary"/> {title}</CardTitle>
            <CardDescription>{description}</CardDescription>
          </CardHeader>
          <CardContent>
             <form onSubmit={handleSubmit} className="space-y-4">
                <Input id="paperFile" name="paperFile" type="file" accept=".pdf,.doc,.docx" />
                <Button type="submit" className="w-full">
                    <Upload className="mr-2 h-4 w-4" /> Upload Paper
                </Button>
            </form>
          </CardContent>
        </Card>
    )
}

export default function DocumentsPage() {
    const [content, setContent] = useState<DocumentsPageContent | null>(null);
    const [rules, setRules] = useState<CodeOfConductItem[]>([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        async function fetchData() {
            try {
                const [pageContent, codeOfConduct] = await Promise.all([
                    getDocumentsPageContent(),
                    getCodeOfConduct()
                ]);
                setContent(pageContent);
                setRules(codeOfConduct);
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
                 <div className="grid lg:grid-cols-2 gap-12 items-start">
                    <Skeleton className="h-64 w-full" />
                    <Skeleton className="h-96 w-full" />
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

      <div className="grid lg:grid-cols-2 gap-12 items-start animate-fade-in-up" style={{ animationDelay: '200ms' }}>
        <PaperUploadForm title={content?.uploadTitle} description={content?.uploadDescription} />
        
        <Card className="transition-all duration-300 hover:border-primary hover:-translate-y-1">
            <CardHeader>
                <CardTitle className="flex items-center gap-2"><FileText className="w-6 h-6 text-primary" /> {content?.codeOfConductTitle}</CardTitle>
                <CardDescription>{content?.codeOfConductDescription}</CardDescription>
            </CardHeader>
            <CardContent>
                <Accordion type="single" collapsible className="w-full">
                    {rules.length > 0 ? (
                        rules.map(rule => (
                            <AccordionItem value={`item-${rule.id}`} key={rule.id}>
                                <AccordionTrigger>{rule.title}</AccordionTrigger>
                                <AccordionContent>{rule.content}</AccordionContent>
                            </AccordionItem>
                        ))
                    ) : (
                        <p className="text-muted-foreground text-center py-4">The code of conduct is not available yet.</p>
                    )}
                </Accordion>
            </CardContent>
        </Card>
      </div>
    </div>
  );
}
