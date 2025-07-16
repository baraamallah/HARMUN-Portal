
"use client";

import React, { useState, useEffect, useCallback } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";

import { Button } from "@/components/ui/button";
import { Form, FormControl, FormDescription, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion";
import { Home, FileBadge, UserSquare, Book } from "lucide-react";
import * as firebaseService from "@/lib/firebase-service";
import type * as T from "@/lib/types";
import { useToast } from "@/hooks/use-toast";
import { Skeleton } from "@/components/ui/skeleton";

const homePageContentSchema = z.object({
    heroTitle: z.string().min(5),
    heroSubtitle: z.string().min(10),
    heroImageUrl: z.string(),
});
const aboutPageContentSchema = z.object({
    title: z.string().min(5), subtitle: z.string().min(10), imageUrl: z.string(),
    whatIsTitle: z.string().min(5), whatIsPara1: z.string().min(20), whatIsPara2: z.string().min(20),
    storyTitle: z.string().min(5), storyPara1: z.string().min(20), storyPara2: z.string().min(20),
});
const registrationPageContentSchema = z.object({ title: z.string().min(5), subtitle: z.string().min(10) });
const documentsPageContentSchema = z.object({
    title: z.string().min(5), subtitle: z.string().min(10),
});

const highlightItemSchema = z.object({
  icon: z.string().min(1, "Icon name is required."),
  title: z.string().min(3, "Title is required."),
  description: z.string().min(5, "Description is required."),
});

const downloadableDocumentSchema = z.object({
  title: z.string().min(3, "Title is required."),
  description: z.string().min(5, "Description is required."),
  url: z.string().url("A valid URL is required."),
});


function HighlightItemForm({ item, onSave, onDelete }: { item: T.ConferenceHighlight; onSave: (id: string, data: z.infer<typeof highlightItemSchema>) => void; onDelete: (id: string) => void }) {
  const form = useForm<z.infer<typeof highlightItemSchema>>({
    resolver: zodResolver(highlightItemSchema),
    defaultValues: item,
  });

  React.useEffect(() => { form.reset(item); }, [item, form]);

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit((data) => onSave(item.id, data))} className="flex flex-wrap gap-2 items-start p-2 border rounded-md mb-2">
        <FormField control={form.control} name="icon" render={({ field }) => <FormItem><FormLabel>Icon</FormLabel><FormControl><Input {...field} /></FormControl><FormMessage /></FormItem>} />
        <FormField control={form.control} name="title" render={({ field }) => <FormItem><FormLabel>Title</FormLabel><FormControl><Input {...field} /></FormControl><FormMessage /></FormItem>} />
        <FormField control={form.control} name="description" render={({ field }) => <FormItem className="flex-grow w-full md:w-auto"><FormLabel>Description</FormLabel><FormControl><Input {...field} /></FormControl><FormMessage /></FormItem>} />
        <div className="flex gap-1 pt-6"><Button type="submit" size="sm">Save</Button><Button size="sm" variant="destructive" type="button" onClick={() => onDelete(item.id)}>Delete</Button></div>
      </form>
    </Form>
  );
}

function DownloadableDocumentForm({ item, onSave, onDelete }: { item: T.DownloadableDocument; onSave: (id: string, data: z.infer<typeof downloadableDocumentSchema>) => void; onDelete: (id: string) => void }) {
    const form = useForm<z.infer<typeof downloadableDocumentSchema>>({
        resolver: zodResolver(downloadableDocumentSchema),
        defaultValues: item,
    });
     React.useEffect(() => { form.reset(item); }, [item, form]);

    return (
        <Form {...form}>
            <form onSubmit={form.handleSubmit((data) => onSave(item.id, data))} className="flex flex-wrap gap-2 items-start p-2 border rounded-md mb-2">
                <FormField control={form.control} name="title" render={({ field }) => <FormItem><FormLabel>Title</FormLabel><FormControl><Input {...field} /></FormControl><FormMessage /></FormItem>} />
                <FormField control={form.control} name="description" render={({ field }) => <FormItem className="flex-grow w-full md:w-auto"><FormLabel>Description</FormLabel><FormControl><Textarea {...field} rows={1} /></FormControl><FormMessage /></FormItem>} />
                <FormField control={form.control} name="url" render={({ field }) => <FormItem className="flex-grow w-full md:w-auto"><FormLabel>File URL</FormLabel><FormControl><Input {...field} /></FormControl><FormMessage /></FormItem>} />
                <div className="flex gap-1 pt-6"><Button type="submit" size="sm">Save</Button><Button size="sm" variant="destructive" type="button" onClick={() => onDelete(item.id)}>Delete</Button></div>
            </form>
        </Form>
    );
}

function AddHighlightForm({ onAdd }: { onAdd: (data: any, form: any) => Promise<void> }) {
    const form = useForm({ resolver: zodResolver(highlightItemSchema), defaultValues: { icon: '', title: '', description: '' } });
    return <Form {...form}><form onSubmit={form.handleSubmit((d) => onAdd(d, form))} className="flex flex-wrap gap-2 items-end p-2 border-t mt-4">
        <FormField control={form.control} name="icon" render={({ field }) => <FormItem><FormLabel>Icon</FormLabel><FormControl><Input {...field} placeholder="e.g. Calendar" /></FormControl><FormMessage /></FormItem>} />
        <FormField control={form.control} name="title" render={({ field }) => <FormItem><FormLabel>Title</FormLabel><FormControl><Input {...field} /></FormControl><FormMessage /></FormItem>} />
        <FormField control={form.control} name="description" render={({ field }) => <FormItem className="flex-grow"><FormLabel>Description</FormLabel><FormControl><Input {...field} /></FormControl><FormMessage /></FormItem>} />
        <Button type="submit" size="sm">Add Highlight</Button>
    </form></Form>;
}

function AddDownloadableDocumentForm({ onAdd }: { onAdd: (data: any, form: any) => Promise<void> }) {
    const form = useForm({ resolver: zodResolver(downloadableDocumentSchema), defaultValues: { title: '', description: '', url: '' } });

    return <Form {...form}><form onSubmit={form.handleSubmit((d) => onAdd(d, form))} className="flex flex-wrap gap-2 items-end p-2 border-t mt-4">
        <FormField control={form.control} name="title" render={({ field }) => <FormItem><FormLabel>Title</FormLabel><FormControl><Input {...field} /></FormControl><FormMessage /></FormItem>} />
        <FormField control={form.control} name="description" render={({ field }) => <FormItem className="flex-grow w-full"><FormLabel>Description</FormLabel><FormControl><Textarea {...field} rows={1} /></FormControl><FormMessage /></FormItem>} />
        <FormField control={form.control} name="url" render={({ field }) => <FormItem className="flex-grow w-full"><FormLabel>File URL</FormLabel><FormControl><Input {...field} /></FormControl><FormMessage /></FormItem>} />
        <Button type="submit" size="sm" className="w-full sm:w-auto">Add Document</Button>
    </form></Form>;
}


export default function PagesTab() {
    const { toast } = useToast();
    const [loading, setLoading] = useState(true);
    const [activeAccordion, setActiveAccordion] = useState<string | undefined>();
    const [data, setData] = useState<any>({
        homeContent: null, aboutContent: null, registrationContent: null, documentsContent: null, 
        highlights: [], documents: []
    });
    
    const loadData = useCallback(async () => {
        setLoading(true);
        try {
            const [homeContent, aboutContent, registrationContent, documentsContent, highlights, documents] = await Promise.all([
                firebaseService.getHomePageContent(),
                firebaseService.getAboutPageContent(),
                firebaseService.getRegistrationPageContent(),
                firebaseService.getDocumentsPageContent(),
                firebaseService.getHighlights(),
                firebaseService.getDownloadableDocuments()
            ]);
            setData({ homeContent, aboutContent, registrationContent, documentsContent, highlights, documents });
        } catch (error) {
            console.error("Failed to fetch page data:", error);
            toast({ title: "Error", description: `Could not load page content.`, variant: "destructive" });
        } finally {
            setLoading(false);
        }
    }, [toast]);
    
    useEffect(() => { loadData(); }, [loadData]);
    
    const homeForm = useForm<z.infer<typeof homePageContentSchema>>({ resolver: zodResolver(homePageContentSchema), defaultValues: data.homeContent || {} });
    const aboutForm = useForm<z.infer<typeof aboutPageContentSchema>>({ resolver: zodResolver(aboutPageContentSchema), defaultValues: data.aboutContent || {} });
    const registrationForm = useForm<z.infer<typeof registrationPageContentSchema>>({ resolver: zodResolver(registrationPageContentSchema), defaultValues: data.registrationContent || {} });
    const documentsForm = useForm<z.infer<typeof documentsPageContentSchema>>({ resolver: zodResolver(documentsPageContentSchema), defaultValues: data.documentsContent || {} });

    useEffect(() => { if(data.homeContent) homeForm.reset(data.homeContent); }, [data.homeContent, homeForm]);
    useEffect(() => { if(data.aboutContent) aboutForm.reset(data.aboutContent); }, [data.aboutContent, aboutForm]);
    useEffect(() => { if(data.registrationContent) registrationForm.reset(data.registrationContent); }, [data.registrationContent, registrationForm]);
    useEffect(() => { if(data.documentsContent) documentsForm.reset(data.documentsContent); }, [data.documentsContent, documentsForm]);


    const handleAction = async (action: Promise<any>, successMessage: string, formToReset?: any) => {
        try {
            await action;
            toast({ title: "Success!", description: successMessage });
            await loadData();
             if (formToReset) {
                formToReset.reset();
            }
        } catch (error) {
            const errorMessage = error instanceof Error ? error.message : "An unknown error occurred.";
            toast({ title: "Error", description: `Action failed: ${errorMessage}`, variant: "destructive" });
        }
    };

    const handleDeleteItem = async (deleteFunction: Function, id: string, itemName: string) => {
        if (!confirm(`Are you sure you want to delete this ${itemName}?`)) return;
        await handleAction(deleteFunction(id), `${itemName} deleted.`);
    };

    if (loading) {
        return <div className="space-y-4"><Skeleton className="h-12 w-full" /><Skeleton className="h-64 w-full" /><Skeleton className="h-64 w-full" /></div>;
    }

    return (
        <Accordion type="single" collapsible value={activeAccordion} onValueChange={setActiveAccordion}>
            <AccordionItem value="home">
                <AccordionTrigger><div className="flex items-center gap-2 text-lg"><Home /> Home Page</div></AccordionTrigger>
                <AccordionContent className="p-1 space-y-6">
                    <Card><CardHeader><CardTitle>Hero Section</CardTitle></CardHeader>
                    <CardContent>
                        <Form {...homeForm}><form onSubmit={homeForm.handleSubmit((d) => handleAction(firebaseService.updateHomePageContent(d), "Home page content updated."))} className="space-y-4">
                            <FormField control={homeForm.control} name="heroTitle" render={({ field }) => <FormItem><FormLabel>Title</FormLabel><FormControl><Input {...field} /></FormControl><FormMessage /></FormItem>} />
                            <FormField control={homeForm.control} name="heroSubtitle" render={({ field }) => <FormItem><FormLabel>Subtitle</FormLabel><FormControl><Textarea {...field} /></FormControl><FormMessage /></FormItem>} />
                            <FormField control={homeForm.control} name="heroImageUrl" render={({ field }) => <FormItem><FormLabel>Image URL</FormLabel><FormControl><Input {...field} /></FormControl><FormDescription>Provide a direct image link.</FormDescription><FormMessage /></FormItem>} />
                            <Button type="submit">Save Hero</Button>
                        </form></Form>
                    </CardContent></Card>
                    <Card><CardHeader><CardTitle>Highlights Section</CardTitle></CardHeader>
                    <CardContent>
                        {data.highlights?.map((item: T.ConferenceHighlight) => (
                            <HighlightItemForm
                                key={item.id}
                                item={item}
                                onSave={(id, saveData) => handleAction(firebaseService.updateHighlight(id, saveData), "Highlight updated.")}
                                onDelete={(id) => handleDeleteItem(firebaseService.deleteHighlight, id, "highlight")}
                            />
                        ))}
                        <AddHighlightForm onAdd={(addData, form) => handleAction(firebaseService.addHighlight(addData), "Highlight added!", form)} />
                    </CardContent></Card>
                </AccordionContent>
            </AccordionItem>
            <AccordionItem value="about">
                <AccordionTrigger><div className="flex items-center gap-2 text-lg"><FileBadge /> About Page</div></AccordionTrigger>
                <AccordionContent className="p-1"><Card><CardContent className="pt-6">
                    <Form {...aboutForm}><form onSubmit={aboutForm.handleSubmit((d) => handleAction(firebaseService.updateAboutPageContent(d), "About page content updated."))} className="space-y-4">
                        <FormField control={aboutForm.control} name="title" render={({ field }) => (<FormItem><FormLabel>Page Title</FormLabel><FormControl><Input {...field} /></FormControl><FormMessage /></FormItem>)} />
                        <FormField control={aboutForm.control} name="subtitle" render={({ field }) => (<FormItem><FormLabel>Page Subtitle</FormLabel><FormControl><Textarea {...field} rows={2} /></FormControl><FormMessage /></FormItem>)} />
                        <FormField control={aboutForm.control} name="imageUrl" render={({ field }) => (<FormItem><FormLabel>Image URL</FormLabel><FormControl><Input {...field} /></FormControl><FormDescription>Provide a direct image link.</FormDescription><FormMessage /></FormItem>)} /> <hr/>
                        <FormField control={aboutForm.control} name="whatIsTitle" render={({ field }) => (<FormItem><FormLabel>Section 1: Title</FormLabel><FormControl><Input {...field} /></FormControl><FormMessage /></FormItem>)} />
                        <FormField control={aboutForm.control} name="whatIsPara1" render={({ field }) => (<FormItem><FormLabel>Section 1: Paragraph 1</FormLabel><FormControl><Textarea {...field} rows={4} /></FormControl><FormMessage /></FormItem>)} />
                        <FormField control={aboutForm.control} name="whatIsPara2" render={({ field }) => (<FormItem><FormLabel>Section 1: Paragraph 2</FormLabel><FormControl><Textarea {...field} rows={4} /></FormControl><FormMessage /></FormItem>)} /> <hr/>
                        <FormField control={aboutForm.control} name="storyTitle" render={({ field }) => (<FormItem><FormLabel>Section 2: Title</FormLabel><FormControl><Input {...field} /></FormControl><FormMessage /></FormItem>)} />
                        <FormField control={aboutForm.control} name="storyPara1" render={({ field }) => (<FormItem><FormLabel>Section 2: Paragraph 1</FormLabel><FormControl><Textarea {...field} rows={4} /></FormControl><FormMessage /></FormItem>)} />
                        <FormField control={aboutForm.control} name="storyPara2" render={({ field }) => (<FormItem><FormLabel>Section 2: Paragraph 2</FormLabel><FormControl><Textarea {...field} rows={4} /></FormControl><FormMessage /></FormItem>)} />
                        <Button type="submit">Save About Page</Button>
                    </form></Form>
                </CardContent></Card></AccordionContent>
            </AccordionItem>
            <AccordionItem value="registration">
                <AccordionTrigger><div className="flex items-center gap-2 text-lg"><UserSquare /> Registration Page</div></AccordionTrigger>
                <AccordionContent className="p-1"><Card><CardContent className="pt-6">
                    <Form {...registrationForm}><form onSubmit={registrationForm.handleSubmit((d) => handleAction(firebaseService.updateRegistrationPageContent(d), "Registration page updated."))} className="space-y-4">
                        <FormField control={registrationForm.control} name="title" render={({ field }) => <FormItem><FormLabel>Title</FormLabel><FormControl><Input {...field} /></FormControl><FormMessage /></FormItem>} />
                        <FormField control={registrationForm.control} name="subtitle" render={({ field }) => <FormItem><FormLabel>Subtitle</FormLabel><FormControl><Textarea {...field} /></FormControl><FormMessage /></FormItem>} />
                        <Button type="submit">Save</Button>
                    </form></Form>
                </CardContent></Card></AccordionContent>
            </AccordionItem>
            <AccordionItem value="documents">
                <AccordionTrigger><div className="flex items-center gap-2 text-lg"><Book /> Documents Page</div></AccordionTrigger>
                <AccordionContent className="p-1 space-y-6">
                    <Card><CardHeader><CardTitle>Page Content</CardTitle></CardHeader>
                    <CardContent>
                        <Form {...documentsForm}><form onSubmit={documentsForm.handleSubmit((d) => handleAction(firebaseService.updateDocumentsPageContent(d), "Documents page updated."))} className="space-y-4">
                            <FormField control={documentsForm.control} name="title" render={({ field }) => <FormItem><FormLabel>Title</FormLabel><FormControl><Input {...field} /></FormControl><FormMessage /></FormItem>} />
                            <FormField control={documentsForm.control} name="subtitle" render={({ field }) => <FormItem><FormLabel>Subtitle</FormLabel><FormControl><Textarea {...field} /></FormControl><FormMessage /></FormItem>} />
                            <Button type="submit">Save Content</Button>
                        </form></Form>
                    </CardContent></Card>
                    <Card><CardHeader><CardTitle>Downloadable Documents</CardTitle></CardHeader>
                    <CardContent>
                        {data.documents?.map((item: T.DownloadableDocument) => (
                            <DownloadableDocumentForm
                                key={item.id}
                                item={item}
                                onSave={(id, saveData) => handleAction(firebaseService.updateDownloadableDocument(id, saveData), "Document updated.")}
                                onDelete={(id) => handleDeleteItem(firebaseService.deleteDownloadableDocument, id, "document")}
                            />
                        ))}
                        <AddDownloadableDocumentForm onAdd={(addData, form) => handleAction(firebaseService.addDownloadableDocument(addData), "Document added!", form)} />
                    </CardContent></Card>
                </AccordionContent>
            </AccordionItem>
        </Accordion>
    );
}
