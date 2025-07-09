"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import * as z from "zod";
import React, { useEffect, useState } from "react";
import Papa from "papaparse";

import { Button } from "@/components/ui/button";
import {
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { useToast } from "@/hooks/use-toast";
import { convertGoogleDriveLink } from "@/lib/utils";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion";
import * as icons from "lucide-react";
import { PlusCircle, Newspaper, Users, FileText, Library, Globe, Trash2, CalendarDays, Settings, Home, FileBadge, UserSquare, Shield, HelpCircle, type LucideIcon, Upload, Download } from "lucide-react";
import * as firebaseService from "@/lib/firebase-service";
import { Skeleton } from "@/components/ui/skeleton";
import type * as T from "@/lib/types";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Switch } from "@/components/ui/switch";

const Icon = ({ name, ...props }: { name: string } & React.ComponentProps<LucideIcon>) => {
  const LucideIcon = (icons as unknown as Record<string, LucideIcon>)[name];
  if (!LucideIcon) return <HelpCircle {...props} />;
  return <LucideIcon {...props} />;
};

// Schemas for individual item forms
const highlightItemSchema = z.object({
  icon: z.string().min(1, "Icon name is required."),
  title: z.string().min(3, "Title is required."),
  description: z.string().min(5, "Description is required."),
});

const codeOfConductItemSchema = z.object({
  title: z.string().min(3, "Title is required."),
  content: z.string().min(10, "Content is required."),
});

const secretariatMemberSchema = z.object({
  name: z.string().min(2, "Name is required."),
  role: z.string().min(2, "Role is required."),
  imageUrl: z.string().url("Must be a valid URL.").or(z.literal("")),
  bio: z.string(),
});

const scheduleEventSchema = z.object({
    time: z.string().min(1, "Time is required."),
    title: z.string().min(3, "Title is required."),
    location: z.string(),
    description: z.string().optional(),
});


// Reusable Form Components for list items
function HighlightItemForm({ item, onSave, onDelete }: { item: T.ConferenceHighlight; onSave: (id: string, data: z.infer<typeof highlightItemSchema>) => Promise<void>; onDelete: (id: string) => Promise<void> }) {
  const form = useForm<z.infer<typeof highlightItemSchema>>({
    resolver: zodResolver(highlightItemSchema),
    defaultValues: { icon: item.icon, title: item.title, description: item.description },
  });

  React.useEffect(() => {
    form.reset({ icon: item.icon, title: item.title, description: item.description });
  }, [item, form]);

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit((data) => onSave(item.id, data))} className="flex flex-wrap md:flex-nowrap gap-2 items-start p-2 border rounded-md mb-2">
        <FormField control={form.control} name="icon" render={({ field }) => <FormItem><FormLabel>Icon</FormLabel><FormControl><Input {...field} /></FormControl><FormMessage /></FormItem>} />
        <FormField control={form.control} name="title" render={({ field }) => <FormItem><FormLabel>Title</FormLabel><FormControl><Input {...field} /></FormControl><FormMessage /></FormItem>} />
        <FormField control={form.control} name="description" render={({ field }) => <FormItem className="flex-grow w-full md:w-auto"><FormLabel>Description</FormLabel><FormControl><Input {...field} /></FormControl><FormMessage /></FormItem>} />
        <div className="flex gap-1 pt-6"><Button type="submit" size="sm">Save</Button><Button size="sm" variant="destructive" type="button" onClick={() => onDelete(item.id)}>Delete</Button></div>
      </form>
    </Form>
  );
}

function CodeOfConductItemForm({ item, onSave, onDelete }: { item: T.CodeOfConductItem; onSave: (id: string, data: z.infer<typeof codeOfConductItemSchema>) => Promise<void>; onDelete: (id: string) => Promise<void> }) {
    const form = useForm<z.infer<typeof codeOfConductItemSchema>>({
        resolver: zodResolver(codeOfConductItemSchema),
        defaultValues: { title: item.title, content: item.content },
    });
     React.useEffect(() => {
        form.reset({ title: item.title, content: item.content });
    }, [item, form]);

    return (
        <Form {...form}>
            <form onSubmit={form.handleSubmit((data) => onSave(item.id, data))} className="flex flex-wrap md:flex-nowrap gap-2 items-start p-2 border rounded-md mb-2">
                <FormField control={form.control} name="title" render={({ field }) => <FormItem><FormLabel>Title</FormLabel><FormControl><Input {...field} /></FormControl><FormMessage /></FormItem>} />
                <FormField control={form.control} name="content" render={({ field }) => <FormItem className="flex-grow w-full md:w-auto"><FormLabel>Content</FormLabel><FormControl><Textarea {...field} rows={1} /></FormControl><FormMessage /></FormItem>} />
                <div className="flex gap-1 pt-6"><Button type="submit" size="sm">Save</Button><Button size="sm" variant="destructive" type="button" onClick={() => onDelete(item.id)}>Delete</Button></div>
            </form>
        </Form>
    );
}

function SecretariatMemberForm({ member, onSave, onDelete }: { member: T.SecretariatMember; onSave: (id: string, data: Omit<T.SecretariatMember, 'id' | 'order'>) => Promise<void>; onDelete: (id: string) => Promise<void> }) {
    const form = useForm<z.infer<typeof secretariatMemberSchema>>({
        resolver: zodResolver(secretariatMemberSchema),
        defaultValues: { name: member.name, role: member.role, imageUrl: member.imageUrl, bio: member.bio },
    });
    React.useEffect(() => {
        form.reset({ name: member.name, role: member.role, imageUrl: member.imageUrl, bio: member.bio });
    }, [member, form]);

    return (
        <Form {...form}>
            <form onSubmit={form.handleSubmit((data) => onSave(member.id, data))} className="flex flex-wrap lg:flex-nowrap gap-2 items-start p-2 border rounded-md mb-2">
                <FormField control={form.control} name="name" render={({ field }) => <FormItem><FormLabel>Name</FormLabel><FormControl><Input {...field} /></FormControl><FormMessage /></FormItem>} />
                <FormField control={form.control} name="role" render={({ field }) => <FormItem><FormLabel>Role</FormLabel><FormControl><Input {...field} /></FormControl><FormMessage /></FormItem>} />
                <FormField control={form.control} name="imageUrl" render={({ field }) => <FormItem><FormLabel>Image URL</FormLabel><FormControl><Input {...field} /></FormControl><FormMessage /></FormItem>} />
                <FormField control={form.control} name="bio" render={({ field }) => <FormItem className="flex-grow w-full lg:w-auto"><FormLabel>Bio</FormLabel><FormControl><Textarea {...field} rows={1} /></FormControl><FormMessage /></FormItem>} />
                <div className="flex gap-1 pt-6"><Button type="submit" size="sm">Save</Button><Button size="sm" variant="destructive" type="button" onClick={() => onDelete(member.id)}>Delete</Button></div>
            </form>
        </Form>
    );
}

function ScheduleEventForm({ event, onSave, onDelete }: { event: T.ScheduleEvent; onSave: (id: string, data: z.infer<typeof scheduleEventSchema>) => Promise<void>; onDelete: (id: string) => Promise<void> }) {
    const form = useForm<z.infer<typeof scheduleEventSchema>>({
        resolver: zodResolver(scheduleEventSchema),
        defaultValues: { time: event.time, title: event.title, location: event.location, description: event.description },
    });
    React.useEffect(() => {
        form.reset({ time: event.time, title: event.title, location: event.location, description: event.description });
    }, [event, form]);

    return (
        <Form {...form}>
            <form onSubmit={form.handleSubmit((data) => onSave(event.id, data))} className="flex flex-wrap md:flex-nowrap gap-2 items-start p-2 border rounded-md mb-2">
                <FormField control={form.control} name="time" render={({ field }) => <FormItem><FormLabel>Time</FormLabel><FormControl><Input {...field} /></FormControl><FormMessage /></FormItem>} />
                <FormField control={form.control} name="title" render={({ field }) => <FormItem className="flex-grow"><FormLabel>Title</FormLabel><FormControl><Input {...field} /></FormControl><FormMessage /></FormItem>} />
                <FormField control={form.control} name="location" render={({ field }) => <FormItem><FormLabel>Location</FormLabel><FormControl><Input {...field} /></FormControl><FormMessage /></FormItem>} />
                <div className="flex gap-1 pt-6"><Button type="submit" size="sm">Save</Button><Button size="sm" variant="destructive" type="button" onClick={() => onDelete(event.id)}>Delete</Button></div>
            </form>
        </Form>
    );
}

// Schemas for main page forms
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
    title: z.string().min(5), subtitle: z.string().min(10), paperDeadline: z.string().min(5),
    uploadTitle: z.string().min(5), uploadDescription: z.string().min(10),
    codeOfConductTitle: z.string().min(5), codeOfConductDescription: z.string().min(10),
});

const navLinksForAdmin = [
  { href: '/about', label: 'About' }, { href: '/committees', label: 'Committees' }, { href: '/news', label: 'News' },
  { href: '/sg-notes', label: 'SG Notes' }, { href: '/registration', label: 'Registration' }, { href: '/schedule', label: 'Schedule' },
  { href: '/secretariat', label: 'Secretariat' }, { href: '/documents', label: 'Documents' },
];
const siteConfigSchema = z.object({
  conferenceDate: z.string().min(1), mapEmbedUrl: z.string().url(),
  twitter: z.string().url().or(z.literal("")).or(z.literal("#")),
  instagram: z.string().url().or(z.literal("")).or(z.literal("#")),
  facebook: z.string().url().or(z.literal("")).or(z.literal("#")),
  footerText: z.string().min(5),
  navVisibility: z.object(Object.fromEntries(navLinksForAdmin.map(link => [link.href, z.boolean()]))),
});

// "Add New" Item Forms - each with its own useForm hook
function AddHighlightForm({ onAdd }: { onAdd: (data: any) => Promise<void> }) {
    const form = useForm({ defaultValues: { icon: '', title: '', description: '' } });
    return <Form {...form}><form onSubmit={form.handleSubmit(async (d) => { await onAdd(d); form.reset(); })} className="flex flex-wrap md:flex-nowrap gap-2 items-end p-2 border-t mt-4">
        <FormField control={form.control} name="icon" render={({ field }) => <FormItem><FormLabel>Icon</FormLabel><FormControl><Input {...field} placeholder="e.g. Calendar" /></FormControl></FormItem>} />
        <FormField control={form.control} name="title" render={({ field }) => <FormItem><FormLabel>Title</FormLabel><FormControl><Input {...field} /></FormControl></FormItem>} />
        <FormField control={form.control} name="description" render={({ field }) => <FormItem className="flex-grow"><FormLabel>Description</FormLabel><FormControl><Input {...field} /></FormControl></FormItem>} />
        <Button type="submit" size="sm">Add Highlight</Button>
    </form></Form>;
}
function AddCodeOfConductForm({ onAdd }: { onAdd: (data: any) => Promise<void> }) {
    const form = useForm({ defaultValues: { title: '', content: '' } });
    return <Form {...form}><form onSubmit={form.handleSubmit(async (d) => { await onAdd(d); form.reset(); })} className="flex flex-wrap md:flex-nowrap gap-2 items-end p-2 border-t mt-4">
        <FormField control={form.control} name="title" render={({ field }) => <FormItem><FormLabel>Title</FormLabel><FormControl><Input {...field} /></FormControl></FormItem>} />
        <FormField control={form.control} name="content" render={({ field }) => <FormItem className="flex-grow"><FormLabel>Content</FormLabel><FormControl><Textarea {...field} rows={1} /></FormControl></FormItem>} />
        <Button type="submit" size="sm">Add Rule</Button>
    </form></Form>;
}
function AddSecretariatMemberForm({ onAdd }: { onAdd: (data: any) => Promise<void> }) {
    const form = useForm({ defaultValues: { name: '', role: '', imageUrl: '', bio: '' } });
    return <Form {...form}><form onSubmit={form.handleSubmit(async (d) => { await onAdd(d); form.reset(); })} className="flex flex-wrap lg:flex-nowrap gap-2 items-end p-2 border-t mt-4">
        <FormField control={form.control} name="name" render={({ field }) => <FormItem><FormLabel>Name</FormLabel><FormControl><Input {...field} /></FormControl></FormItem>} />
        <FormField control={form.control} name="role" render={({ field }) => <FormItem><FormLabel>Role</FormLabel><FormControl><Input {...field} /></FormControl></FormItem>} />
        <FormField control={form.control} name="imageUrl" render={({ field }) => <FormItem><FormLabel>Image URL</FormLabel><FormControl><Input {...field} /></FormControl><FormDescription>Use a standard image URL or a Google Drive "share" link.</FormDescription></FormItem>} />
        <FormField control={form.control} name="bio" render={({ field }) => <FormItem className="flex-grow w-full lg:w-auto"><FormLabel>Bio</FormLabel><FormControl><Textarea {...field} rows={1} /></FormControl></FormItem>} />
        <Button type="submit" size="sm">Add Member</Button>
    </form></Form>;
}
function AddScheduleDayForm({ onAdd }: { onAdd: (data: any) => Promise<void> }) {
    const form = useForm({ defaultValues: { title: '', date: '' } });
    return <Form {...form}><form onSubmit={form.handleSubmit(async (d) => { await onAdd(d); form.reset(); })} className="flex gap-2 items-end">
        <FormField control={form.control} name="title" render={({ field }) => <FormItem className="flex-grow"><FormLabel>Day Title</FormLabel><FormControl><Input {...field} /></FormControl></FormItem>} />
        <FormField control={form.control} name="date" render={({ field }) => <FormItem className="flex-grow"><FormLabel>Date</FormLabel><FormControl><Input {...field} /></FormControl></FormItem>} />
        <Button type="submit" size="sm">Add Day</Button>
    </form></Form>;
}
function AddScheduleEventForm({ dayId, onAdd }: { dayId: string; onAdd: (data: any) => Promise<void> }) {
    const form = useForm({ defaultValues: { time: '', title: '', location: '' } });
    return <Form {...form}><form onSubmit={form.handleSubmit(async (d) => { await onAdd({ ...d, dayId }); form.reset(); })} className="flex flex-wrap md:flex-nowrap gap-2 items-end p-2 border-t mt-4">
        <FormField control={form.control} name="time" render={({ field }) => <FormItem><FormLabel>Time</FormLabel><FormControl><Input placeholder="e.g. 9:00 AM" {...field} /></FormControl></FormItem>} />
        <FormField control={form.control} name="title" render={({ field }) => <FormItem className="flex-grow"><FormLabel>Title</FormLabel><FormControl><Input {...field} /></FormControl></FormItem>} />
        <FormField control={form.control} name="location" render={({ field }) => <FormItem><FormLabel>Location</FormLabel><FormControl><Input {...field} /></FormControl></FormItem>} />
        <Button type="submit" size="sm">Add Event</Button>
    </form></Form>;
}
function AddCountryForm({ committees, onAdd }: { committees: T.Committee[]; onAdd: (data: any) => Promise<void> }) {
    const form = useForm({ defaultValues: { name: '', committee: '' } });
    return <Form {...form}><form onSubmit={form.handleSubmit(async (d) => { await onAdd({ ...d, status: 'Available' }); form.reset(); })} className="flex items-end gap-2 mb-4">
        <FormField control={form.control} name="name" render={({ field }) => <FormItem className="flex-grow"><FormLabel>Country Name</FormLabel><FormControl><Input {...field} /></FormControl></FormItem>} />
        <FormField control={form.control} name="committee" render={({ field }) => <FormItem className="flex-grow"><FormLabel>Committee</FormLabel><Select onValueChange={field.onChange} value={field.value}><FormControl><SelectTrigger><SelectValue placeholder="Select..." /></SelectTrigger></FormControl><SelectContent>{committees?.map((c: T.Committee) => <SelectItem key={c.id} value={c.name}>{c.name}</SelectItem>)}</SelectContent></Select></FormItem>} />
        <Button type="submit"><PlusCircle className="mr-2 h-4 w-4" /> Add</Button>
    </form></Form>;
}
function AddCommitteeForm({ onAdd }: { onAdd: (data: any) => Promise<void> }) {
    const form = useForm({ defaultValues: { name: '', chairName: '', chairBio: '', chairImageUrl: '', topics: '', backgroundGuideUrl: '' } });
    return <Form {...form}><form onSubmit={form.handleSubmit(async (d) => { await onAdd(d); form.reset(); })} className="space-y-4">
        <div className="grid md:grid-cols-2 gap-4">
            <FormField control={form.control} name="name" render={({ field }) => ( <FormItem><FormLabel>Committee Name</FormLabel><FormControl><Input {...field} /></FormControl></FormItem> )} />
            <FormField control={form.control} name="chairName" render={({ field }) => ( <FormItem><FormLabel>Chair Name</FormLabel><FormControl><Input {...field} /></FormControl></FormItem> )} />
        </div>
         <FormField control={form.control} name="chairImageUrl" render={({ field }) => ( <FormItem><FormLabel>Chair Image URL</FormLabel><FormControl><Input {...field} /></FormControl></FormItem> )} />
        <FormField control={form.control} name="chairBio" render={({ field }) => ( <FormItem><FormLabel>Chair Bio</FormLabel><FormControl><Textarea {...field} rows={3} /></FormControl></FormItem> )} />
        <FormField control={form.control} name="topics" render={({ field }) => ( <FormItem><FormLabel>Topics (one per line)</FormLabel><FormControl><Textarea {...field} rows={3}/></FormControl></FormItem> )} />
        <FormField control={form.control} name="backgroundGuideUrl" render={({ field }) => ( <FormItem><FormLabel>Background Guide URL</FormLabel><FormControl><Input {...field} /></FormControl></FormItem> )} />
        <Button type="submit"><PlusCircle className="mr-2" />Add Committee</Button>
    </form></Form>;
}
function CreatePostForm({ onAdd }: { onAdd: (data: any) => Promise<void> }) {
    const form = useForm({ defaultValues: { title: '', content: '', type: undefined } });
    return <Form {...form}><form onSubmit={form.handleSubmit(async (d) => { await onAdd(d); form.reset(); })} className="space-y-4 mb-6">
        <FormField control={form.control} name="title" rules={{required: true}} render={({ field }) => (<FormItem><FormLabel>Title</FormLabel><FormControl><Input {...field} /></FormControl></FormItem>)} />
        <FormField control={form.control} name="type" rules={{required: true}} render={({ field }) => ( <FormItem><FormLabel>Type</FormLabel><Select onValueChange={field.onChange}><FormControl><SelectTrigger><SelectValue placeholder="Select type" /></SelectTrigger></FormControl><SelectContent><SelectItem value="news">News</SelectItem><SelectItem value="sg-note">SG Note</SelectItem></SelectContent></Select></FormItem> )} />
        <FormField control={form.control} name="content" rules={{required: true}} render={({ field }) => (<FormItem><FormLabel>Content</FormLabel><FormControl><Textarea {...field} rows={5} /></FormControl></FormItem>)} />
        <Button type="submit" className="w-full"><PlusCircle className="mr-2"/>Publish Post</Button>
    </form></Form>;
}

export default function AdminPage() {
  const { toast } = useToast();
  const [loading, setLoading] = useState(true);
  const [activeAccordion, setActiveAccordion] = useState<string | undefined>();
  const [data, setData] = useState<any>({});

  const homeForm = useForm<z.infer<typeof homePageContentSchema>>({ resolver: zodResolver(homePageContentSchema) });
  const aboutForm = useForm<z.infer<typeof aboutPageContentSchema>>({ resolver: zodResolver(aboutPageContentSchema) });
  const registrationForm = useForm<z.infer<typeof registrationPageContentSchema>>({ resolver: zodResolver(registrationPageContentSchema) });
  const documentsForm = useForm<z.infer<typeof documentsPageContentSchema>>({ resolver: zodResolver(documentsPageContentSchema) });
  const siteConfigForm = useForm<z.infer<typeof siteConfigSchema>>({ resolver: zodResolver(siteConfigSchema) });

  const fetchAllData = React.useCallback(async () => {
    try {
        setLoading(true);
        const [
            homeContent, aboutContent, registrationContent, documentsContent, siteConfig,
            posts, countries, committees, secretariat, schedule, highlights, codeOfConduct
        ] = await Promise.all([
            firebaseService.getHomePageContent(), firebaseService.getAboutPageContent(),
            firebaseService.getRegistrationPageContent(), firebaseService.getDocumentsPageContent(),
            firebaseService.getSiteConfig(), firebaseService.getAllPosts(),
            firebaseService.getCountries(), firebaseService.getCommittees(),
            firebaseService.getSecretariat(), firebaseService.getSchedule(),
            firebaseService.getHighlights(), firebaseService.getCodeOfConduct()
        ]);
        
        const allData = { homeContent, aboutContent, registrationContent, documentsContent, siteConfig, posts, countries, committees, secretariat, schedule, highlights, codeOfConduct };
        setData(allData);

        homeForm.reset(allData.homeContent);
        aboutForm.reset(allData.aboutContent);
        registrationForm.reset(allData.registrationContent);
        documentsForm.reset(allData.documentsContent);
        siteConfigForm.reset({
            ...allData.siteConfig, ...allData.siteConfig.socialLinks, footerText: allData.siteConfig.footerText,
            navVisibility: allData.siteConfig.navVisibility || {},
        });

    } catch (error) {
        console.error("Failed to fetch admin data:", error);
        toast({ title: "Error", description: "Could not load data from the database.", variant: "destructive" });
    } finally {
        setLoading(false);
    }
  }, [toast, homeForm, aboutForm, registrationForm, documentsForm, siteConfigForm]);

  useEffect(() => { fetchAllData(); }, [fetchAllData]);

  // Generic submit handler for main page forms
  const handleFormSubmit = async (updateFunction: (data: any) => Promise<void>, successMessage: string, data: any, form: any) => {
    try {
        let processedData = data;
        if (data.heroImageUrl) processedData.heroImageUrl = convertGoogleDriveLink(data.heroImageUrl);
        if (data.imageUrl) processedData.imageUrl = convertGoogleDriveLink(data.imageUrl);

        await updateFunction(processedData);
        toast({ title: "Success!", description: successMessage });
        form.reset(processedData); // Re-sync form with saved data
    } catch (error) {
        toast({ title: "Error", description: `Could not save data. ${error instanceof Error ? error.message : ''}`, variant: "destructive" });
    }
  };
  
    const handleFileChange = (setter: React.Dispatch<React.SetStateAction<File | null>>) => (event: React.ChangeEvent<HTMLInputElement>) => {
        if (event.target.files && event.target.files.length > 0) setter(event.target.files[0]); else setter(null);
    };
  
  const [committeeImportFile, setCommitteeImportFile] = useState<File | null>(null);
  const [countryImportFile, setCountryImportFile] = useState<File | null>(null);
  const [secretariatImportFile, setSecretariatImportFile] = useState<File | null>(null);
  const [isImporting, setIsImporting] = useState(false);

  const handleImport = async (file: File | null, importFunction: (data: any[]) => Promise<void>, type: string) => {
    if (!file) {
        toast({ title: "No file selected", description: `Please choose a ${type} CSV file.`, variant: "destructive" });
        return;
    }
    if (!confirm(`Are you sure you want to import ${type}? This will ERASE all existing data for ${type}. This action cannot be undone.`)) return;
    
    setIsImporting(true);
    Papa.parse(file, {
        header: true,
        skipEmptyLines: true,
        complete: async (results) => {
            try {
                await importFunction(results.data as any[]);
                toast({ title: "Import Successful!", description: `Your ${type} data has been imported.` });
                await fetchAllData();
            } catch (error) {
                toast({ title: "Import Failed", description: error instanceof Error ? error.message : "An unknown error occurred.", variant: "destructive" });
            } finally {
                setIsImporting(false);
                setCommitteeImportFile(null); setCountryImportFile(null); setSecretariatImportFile(null);
                const fileInput = document.getElementById(`${type}ImportFile`) as HTMLInputElement;
                if (fileInput) fileInput.value = '';
            }
        },
        error: (err) => {
            toast({ title: "Error parsing CSV", description: err.message, variant: "destructive" });
            setIsImporting(false);
        }
    });
  };

  const handleExport = (data: any[], filename: string) => {
    let flattenedData;
    switch(filename) {
        case 'committees.csv':
            flattenedData = data.map((c: T.Committee) => ({
                name: c.name,
                chairName: c.chair.name,
                chairBio: c.chair.bio,
                chairImageUrl: c.chair.imageUrl,
                topics: c.topics.join('\\n'), // Join topics with newline for CSV
                backgroundGuideUrl: c.backgroundGuideUrl,
            }));
            break;
        case 'secretariat.csv':
            flattenedData = data.map(({id, order, ...rest}: T.SecretariatMember) => rest);
            break;
        case 'countries.csv':
            flattenedData = data.map(({id, ...rest}: T.Country) => rest);
            break;
        default:
            flattenedData = data;
    }
    const csv = Papa.unparse(flattenedData);
    const blob = new Blob([csv], { type: "text/csv;charset=utf-8;" });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.download = filename;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    toast({ title: "Export Successful", description: `Downloaded ${filename}` });
  };

  if (loading) {
    return <div className="space-y-8 p-8">{Array.from({ length: 4 }).map((_, i) => <Skeleton key={i} className="h-64 w-full" />)}</div>
  }

  return (
    <div className="space-y-8">
        <div className="text-left">
            <h1 className="text-3xl font-bold font-headline">Admin Dashboard</h1>
            <p className="text-muted-foreground">Manage your conference website content and settings here.</p>
        </div>

        <Tabs defaultValue="pages" className="w-full">
            <TabsList className="grid w-full grid-cols-2 lg:grid-cols-5">
                <TabsTrigger value="dashboard">Dashboard</TabsTrigger>
                <TabsTrigger value="pages">Pages</TabsTrigger>
                <TabsTrigger value="conference">Conference</TabsTrigger>
                <TabsTrigger value="team">Team</TabsTrigger>
                <TabsTrigger value="settings">Settings</TabsTrigger>
            </TabsList>
            
            <TabsContent value="dashboard" className="mt-6">
                <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4">
                    <Card><CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2"><CardTitle className="text-sm font-medium">Published Posts</CardTitle><FileText className="h-4 w-4 text-muted-foreground" /></CardHeader><CardContent><div className="text-2xl font-bold">{data.posts.length}</div></CardContent></Card>
                    <Card><CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2"><CardTitle className="text-sm font-medium">Countries</CardTitle><Globe className="h-4 w-4 text-muted-foreground" /></CardHeader><CardContent><div className="text-2xl font-bold">{data.countries.length}</div></CardContent></Card>
                    <Card><CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2"><CardTitle className="text-sm font-medium">Committees</CardTitle><Library className="h-4 w-4 text-muted-foreground" /></CardHeader><CardContent><div className="text-2xl font-bold">{data.committees.length}</div></CardContent></Card>
                    <Card><CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2"><CardTitle className="text-sm font-medium">Secretariat</CardTitle><Users className="h-4 w-4 text-muted-foreground" /></CardHeader><CardContent><div className="text-2xl font-bold">{data.secretariat.length}</div></CardContent></Card>
                </div>
                <Card className="mt-6">
                    <CardHeader><CardTitle className="flex items-center gap-2"><Newspaper /> Create & Manage Posts</CardTitle></CardHeader>
                    <CardContent>
                        <CreatePostForm onAdd={async (values) => {
                            await firebaseService.addPost(values as any);
                            toast({ title: "Post Created!" });
                            fetchAllData();
                        }} />
                         <h3 className="text-lg font-semibold mb-4">Published Posts</h3>
                        <div className="border rounded-md max-h-96 overflow-y-auto">
                            <Table>
                                <TableHeader><TableRow><TableHead>Title</TableHead><TableHead>Type</TableHead><TableHead>Date</TableHead><TableHead className="text-right">Action</TableHead></TableRow></TableHeader>
                                <TableBody>
                                    {data.posts.map((post: T.Post) => (
                                        <TableRow key={post.id}>
                                            <TableCell>{post.title}</TableCell>
                                            <TableCell>{post.type}</TableCell>
                                            <TableCell>{firebaseService.formatTimestamp(post.createdAt)}</TableCell>
                                            <TableCell className="text-right"><Button variant="ghost" size="icon" onClick={async () => { if(confirm('Are you sure you want to delete this post?')) { await firebaseService.deletePost(post.id); fetchAllData(); }}}> <Trash2 className="h-4 w-4 text-destructive" /></Button></TableCell>
                                        </TableRow>
                                    ))}
                                </TableBody>
                            </Table>
                        </div>
                    </CardContent>
                </Card>
            </TabsContent>

            <TabsContent value="pages" className="mt-6">
                <Accordion type="single" collapsible value={activeAccordion} onValueChange={setActiveAccordion}>
                    <AccordionItem value="home">
                        <AccordionTrigger><div className="flex items-center gap-2 text-lg"><Home /> Home Page</div></AccordionTrigger>
                        <AccordionContent className="p-1 space-y-6">
                            <Card><CardHeader><CardTitle>Hero Section</CardTitle></CardHeader>
                            <CardContent>
                                <Form {...homeForm}><form onSubmit={homeForm.handleSubmit((d) => handleFormSubmit(firebaseService.updateHomePageContent, "Home page content updated.", d, homeForm))} className="space-y-4">
                                    <FormField control={homeForm.control} name="heroTitle" render={({ field }) => <FormItem><FormLabel>Title</FormLabel><FormControl><Input {...field} /></FormControl><FormMessage /></FormItem>} />
                                    <FormField control={homeForm.control} name="heroSubtitle" render={({ field }) => <FormItem><FormLabel>Subtitle</FormLabel><FormControl><Textarea {...field} /></FormControl><FormMessage /></FormItem>} />
                                    <FormField control={homeForm.control} name="heroImageUrl" render={({ field }) => <FormItem><FormLabel>Image URL</FormLabel><FormControl><Input {...field} /></FormControl><FormDescription>Use a standard image URL or a Google Drive "share" link.</FormDescription><FormMessage /></FormItem>} />
                                    <Button type="submit">Save Hero</Button>
                                </form></Form>
                            </CardContent></Card>
                            <Card><CardHeader><CardTitle>Highlights Section</CardTitle></CardHeader>
                            <CardContent>
                                {data.highlights?.map((item: T.ConferenceHighlight) => (
                                    <HighlightItemForm
                                        key={item.id}
                                        item={item}
                                        onSave={async (id, data) => { await firebaseService.updateHighlight(id, data); fetchAllData(); }}
                                        onDelete={async (id) => { if(confirm('Are you sure you want to delete this highlight?')) { await firebaseService.deleteHighlight(id); fetchAllData(); } }}
                                    />
                                ))}
                                <AddHighlightForm onAdd={async (d) => { await firebaseService.addHighlight(d); fetchAllData(); }} />
                            </CardContent></Card>
                        </AccordionContent>
                    </AccordionItem>
                    <AccordionItem value="about">
                        <AccordionTrigger><div className="flex items-center gap-2 text-lg"><FileBadge /> About Page</div></AccordionTrigger>
                        <AccordionContent className="p-1"><Card><CardContent className="pt-6">
                            <Form {...aboutForm}><form onSubmit={aboutForm.handleSubmit((d) => handleFormSubmit(firebaseService.updateAboutPageContent, "About page content updated.", d, aboutForm))} className="space-y-4">
                                <FormField control={aboutForm.control} name="title" render={({ field }) => (<FormItem><FormLabel>Page Title</FormLabel><FormControl><Input {...field} /></FormControl><FormMessage /></FormItem>)} />
                                <FormField control={aboutForm.control} name="subtitle" render={({ field }) => (<FormItem><FormLabel>Page Subtitle</FormLabel><FormControl><Textarea {...field} rows={2} /></FormControl><FormMessage /></FormItem>)} />
                                <FormField control={aboutForm.control} name="imageUrl" render={({ field }) => (<FormItem><FormLabel>Image URL</FormLabel><FormControl><Input {...field} /></FormControl><FormDescription>Use a standard image URL or a Google Drive "share" link.</FormDescription><FormMessage /></FormItem>)} /> <hr/>
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
                            <Form {...registrationForm}><form onSubmit={registrationForm.handleSubmit((d) => handleFormSubmit(firebaseService.updateRegistrationPageContent, "Registration page updated.", d, registrationForm))} className="space-y-4">
                                <FormField control={registrationForm.control} name="title" render={({ field }) => <FormItem><FormLabel>Title</FormLabel><FormControl><Input {...field} /></FormControl><FormMessage /></FormItem>} />
                                <FormField control={registrationForm.control} name="subtitle" render={({ field }) => <FormItem><FormLabel>Subtitle</FormLabel><FormControl><Textarea {...field} /></FormControl><FormMessage /></FormItem>} />
                                <Button type="submit">Save</Button>
                            </form></Form>
                        </CardContent></Card></AccordionContent>
                    </AccordionItem>
                     <AccordionItem value="documents">
                        <AccordionTrigger><div className="flex items-center gap-2 text-lg"><Shield /> Documents Page</div></AccordionTrigger>
                        <AccordionContent className="p-1 space-y-6">
                             <Card><CardHeader><CardTitle>Page Content</CardTitle></CardHeader>
                            <CardContent>
                                <Form {...documentsForm}><form onSubmit={documentsForm.handleSubmit((d) => handleFormSubmit(firebaseService.updateDocumentsPageContent, "Documents page updated.", d, documentsForm))} className="space-y-4">
                                    <FormField control={documentsForm.control} name="title" render={({ field }) => <FormItem><FormLabel>Title</FormLabel><FormControl><Input {...field} /></FormControl><FormMessage /></FormItem>} />
                                    <FormField control={documentsForm.control} name="subtitle" render={({ field }) => <FormItem><FormLabel>Subtitle</FormLabel><FormControl><Textarea {...field} /></FormControl><FormMessage /></FormItem>} />
                                    <FormField control={documentsForm.control} name="uploadTitle" render={({ field }) => <FormItem><FormLabel>Upload Box Title</FormLabel><FormControl><Input {...field} /></FormControl><FormMessage /></FormItem>} />
                                    <FormField control={documentsForm.control} name="uploadDescription" render={({ field }) => <FormItem><FormLabel>Upload Box Description</FormLabel><FormControl><Textarea {...field} /></FormControl><FormMessage /></FormItem>} />
                                    <FormField control={documentsForm.control} name="codeOfConductTitle" render={({ field }) => <FormItem><FormLabel>Code of Conduct Title</FormLabel><FormControl><Input {...field} /></FormControl><FormMessage /></FormItem>} />
                                    <FormField control={documentsForm.control} name="codeOfConductDescription" render={({ field }) => <FormItem><FormLabel>CoC Description</FormLabel><FormControl><Textarea {...field} /></FormControl><FormMessage /></FormItem>} />
                                    <Button type="submit">Save Content</Button>
                                </form></Form>
                            </CardContent></Card>
                            <Card><CardHeader><CardTitle>Code of Conduct Items</CardTitle></CardHeader>
                            <CardContent>
                                {data.codeOfConduct?.map((item: T.CodeOfConductItem) => (
                                    <CodeOfConductItemForm
                                        key={item.id}
                                        item={item}
                                        onSave={async (id, data) => { await firebaseService.updateCodeOfConductItem(id, data); fetchAllData(); }}
                                        onDelete={async (id) => { if(confirm('Are you sure you want to delete this rule?')) { await firebaseService.deleteCodeOfConductItem(id); fetchAllData(); } }}
                                    />
                                ))}
                                <AddCodeOfConductForm onAdd={async (d) => { await firebaseService.addCodeOfConductItem(d); fetchAllData(); }} />
                            </CardContent></Card>
                        </AccordionContent>
                    </AccordionItem>
                </Accordion>
            </TabsContent>

            <TabsContent value="conference" className="mt-6">
                 <Accordion type="single" collapsible value={activeAccordion} onValueChange={setActiveAccordion}>
                    <AccordionItem value="committees"><AccordionTrigger><div className="flex items-center gap-2 text-lg"><Library /> Committees</div></AccordionTrigger>
                    <AccordionContent className="p-1 space-y-6">
                        <Card><CardHeader><CardTitle>Add New Committee</CardTitle></CardHeader>
                        <CardContent>
                            <AddCommitteeForm onAdd={async(values) => {
                                await firebaseService.addCommittee({
                                    name: values.name,
                                    chair: { name: values.chairName, bio: values.chairBio || "", imageUrl: values.chairImageUrl || "" },
                                    topics: (values.topics || "").split('\n').filter(Boolean), 
                                    backgroundGuideUrl: values.backgroundGuideUrl || "",
                                });
                                toast({ title: "Committee Added!" });
                                fetchAllData();
                            }}/>
                        </CardContent></Card>
                        <Card><CardHeader><CardTitle>Existing Committees</CardTitle></CardHeader>
                        <CardContent>
                             <div className="border rounded-md max-h-96 overflow-y-auto">
                                <Table><TableHeader><TableRow><TableHead>Committee</TableHead><TableHead>Chair</TableHead><TableHead className="text-right">Actions</TableHead></TableRow></TableHeader>
                                <TableBody>
                                    {data.committees?.map((c: T.Committee) => (
                                        <TableRow key={c.id}>
                                            <TableCell>{c.name}</TableCell><TableCell>{c.chair.name}</TableCell>
                                            <TableCell className="text-right">
                                                <Button variant="ghost" size="icon" onClick={async () => { if (confirm(`Delete ${c.name}?`)) { await firebaseService.deleteCommittee(c.id); fetchAllData(); }}}>
                                                    <Trash2 className="h-4 w-4 text-destructive" />
                                                </Button>
                                            </TableCell>
                                        </TableRow>
                                    ))}
                                </TableBody></Table>
                            </div>
                        </CardContent></Card>
                    </AccordionContent></AccordionItem>
                    <AccordionItem value="countries"><AccordionTrigger><div className="flex items-center gap-2 text-lg"><Globe /> Country Matrix</div></AccordionTrigger>
                    <AccordionContent className="p-1"><Card><CardContent className="pt-6">
                        <AddCountryForm committees={data.committees} onAdd={async(values) => {
                             await firebaseService.addCountry(values as any);
                             fetchAllData();
                        }} />
                         <div className="border rounded-md max-h-96 overflow-y-auto">
                            <Table><TableHeader><TableRow><TableHead>Country</TableHead><TableHead>Committee</TableHead><TableHead>Status</TableHead><TableHead className="text-right">Actions</TableHead></TableRow></TableHeader>
                            <TableBody>
                                {data.countries?.map((country: T.Country) => (
                                    <TableRow key={country.id}>
                                        <TableCell>{country.name}</TableCell><TableCell>{country.committee}</TableCell>
                                        <TableCell><Badge variant={country.status === 'Available' ? 'secondary' : 'default'}>{country.status}</Badge></TableCell>
                                        <TableCell className="text-right flex items-center justify-end gap-2">
                                            <Switch checked={country.status === 'Assigned'} onCheckedChange={async () => { const newStatus = country.status === 'Available' ? 'Assigned' : 'Available'; await firebaseService.updateCountryStatus(country.id, newStatus); fetchAllData(); }} />
                                            <Button variant="ghost" size="icon" onClick={async () => { if (confirm(`Delete ${country.name}?`)) { await firebaseService.deleteCountry(country.id); fetchAllData(); }}}> <Trash2 className="h-4 w-4 text-destructive" /></Button>
                                        </TableCell>
                                    </TableRow>
                                ))}
                            </TableBody></Table>
                        </div>
                    </CardContent></Card></AccordionContent></AccordionItem>
                    <AccordionItem value="schedule"><AccordionTrigger><div className="flex items-center gap-2 text-lg"><CalendarDays /> Schedule</div></AccordionTrigger>
                    <AccordionContent className="p-1 space-y-4">
                       {data.schedule?.map((day: T.ScheduleDay) => (
                        <Card key={day.id}><CardHeader><CardTitle>{day.title} - {day.date}</CardTitle></CardHeader>
                        <CardContent>
                           {day.events.map((event) => (
                             <ScheduleEventForm
                                key={event.id}
                                event={event}
                                onSave={async (id, data) => { await firebaseService.updateScheduleEvent(id, { ...event, ...data }); fetchAllData(); }}
                                onDelete={async (id) => { if(confirm('Are you sure you want to delete this event?')) { await firebaseService.deleteScheduleEvent(id); fetchAllData(); } }}
                             />
                           ))}
                           <AddScheduleEventForm dayId={day.id} onAdd={async(d) => { await firebaseService.addScheduleEvent(d); fetchAllData(); }}/>
                        </CardContent></Card>
                       ))}
                       <Card><CardHeader><CardTitle>Add New Day</CardTitle></CardHeader>
                       <CardContent>
                         <AddScheduleDayForm onAdd={async(d) => { await firebaseService.addScheduleDay(d); fetchAllData(); }} />
                       </CardContent>
                       </Card>
                    </AccordionContent></AccordionItem>
                 </Accordion>
            </TabsContent>

            <TabsContent value="team" className="mt-6">
                <Card>
                    <CardHeader><CardTitle>Secretariat Members</CardTitle></CardHeader>
                    <CardContent>
                        {data.secretariat?.map((member: T.SecretariatMember) => (
                            <SecretariatMemberForm
                                key={member.id}
                                member={member}
                                onSave={async (id, data) => { await firebaseService.updateSecretariatMember(id, data); fetchAllData(); }}
                                onDelete={async (id) => { if(confirm('Are you sure?')) { await firebaseService.deleteSecretariatMember(id); fetchAllData(); } }}
                            />
                        ))}
                        <AddSecretariatMemberForm onAdd={async(d) => { await firebaseService.addSecretariatMember(d); fetchAllData(); }} />
                    </CardContent>
                </Card>
            </TabsContent>

            <TabsContent value="settings" className="mt-6">
                <Accordion type="single" collapsible value={activeAccordion} onValueChange={setActiveAccordion}>
                    <AccordionItem value="site"><AccordionTrigger><div className="flex items-center gap-2 text-lg"><Settings /> Site & Navigation</div></AccordionTrigger>
                    <AccordionContent className="p-1 space-y-6">
                        <Card><CardHeader><CardTitle>General Settings</CardTitle></CardHeader>
                        <CardContent>
                            <Form {...siteConfigForm}><form onSubmit={siteConfigForm.handleSubmit(async (values) => {
                                const { twitter, instagram, facebook, footerText, conferenceDate, mapEmbedUrl, navVisibility } = values;
                                const config = { conferenceDate, mapEmbedUrl, socialLinks: { twitter, instagram, facebook }, footerText, navVisibility };
                                await handleFormSubmit(firebaseService.updateSiteConfig, "Site settings updated.", config, siteConfigForm)
                            })} className="space-y-4">
                                <FormField control={siteConfigForm.control} name="conferenceDate" render={({ field }) => (<FormItem><FormLabel>Countdown Date</FormLabel><FormControl><Input {...field} /></FormControl><FormDescription>Format: YYYY-MM-DDTHH:mm:ss</FormDescription></FormItem>)} />
                                <FormField control={siteConfigForm.control} name="mapEmbedUrl" render={({ field }) => (<FormItem><FormLabel>Google Maps Embed URL</FormLabel><FormControl><Input {...field} /></FormControl></FormItem>)} />
                                <FormField control={siteConfigForm.control} name="twitter" render={({ field }) => (<FormItem><FormLabel>Twitter URL</FormLabel><FormControl><Input {...field} /></FormControl></FormItem>)} />
                                <FormField control={siteConfigForm.control} name="instagram" render={({ field }) => (<FormItem><FormLabel>Instagram URL</FormLabel><FormControl><Input {...field} /></FormControl></FormItem>)} />
                                <FormField control={siteConfigForm.control} name="facebook" render={({ field }) => (<FormItem><FormLabel>Facebook URL</FormLabel><FormControl><Input {...field} /></FormControl></FormItem>)} />
                                <FormField control={siteConfigForm.control} name="footerText" render={({ field }) => (<FormItem><FormLabel>Footer Text</FormLabel><FormControl><Textarea {...field} /></FormControl></FormItem>)} />
                                <Button type="submit">Save General</Button>
                            </form></Form>
                        </CardContent></Card>
                        <Card><CardHeader><CardTitle>Navigation Visibility</CardTitle></CardHeader>
                        <CardContent>
                             <Form {...siteConfigForm}><form onSubmit={siteConfigForm.handleSubmit(async (values) => { 
                                const currentConfig = await firebaseService.getSiteConfig();
                                await firebaseService.updateSiteConfig({ ...currentConfig, navVisibility: values.navVisibility }); 
                                toast({title: "Nav Updated!"});
                             })} className="space-y-2">
                                {navLinksForAdmin.map((link) => (
                                    <FormField key={link.href} control={siteConfigForm.control} name={`navVisibility.${link.href}` as const} render={({ field }) => (
                                        <FormItem className="flex flex-row items-center justify-between rounded-lg border p-3">
                                            <FormLabel>{link.label}</FormLabel>
                                            <FormControl><Switch checked={field.value} onCheckedChange={field.onChange} /></FormControl>
                                        </FormItem>
                                    )} />
                                ))}
                                <Button type="submit" className="w-full">Save Navigation</Button>
                            </form></Form>
                        </CardContent></Card>
                    </AccordionContent></AccordionItem>
                    <AccordionItem value="import-export"><AccordionTrigger><div className="flex items-center gap-2 text-lg"><Download /> Import / Export</div></AccordionTrigger>
                    <AccordionContent className="p-1"><Card><CardContent className="pt-6 grid md:grid-cols-3 gap-6">
                        <div className="space-y-2 p-4 border rounded-lg">
                            <h3 className="font-semibold flex items-center gap-2"><Library/> Committees</h3>
                            <Button onClick={() => handleExport(data.committees, 'committees.csv')} className="w-full">Export to CSV</Button>
                            <div className="border-t pt-2 mt-2"><h4 className="font-semibold mb-2">Import</h4>
                                <div className="flex gap-2"><Input id="committeesImportFile" type="file" accept=".csv" onChange={handleFileChange(setCommitteeImportFile)}/>
                                <Button onClick={() => handleImport(committeeImportFile, firebaseService.importCommittees, 'committees')} disabled={!committeeImportFile || isImporting}><Upload/></Button></div>
                            </div>
                        </div>
                         <div className="space-y-2 p-4 border rounded-lg">
                            <h3 className="font-semibold flex items-center gap-2"><Globe/> Countries</h3>
                            <Button onClick={() => handleExport(data.countries, 'countries.csv')} className="w-full">Export to CSV</Button>
                            <div className="border-t pt-2 mt-2"><h4 className="font-semibold mb-2">Import</h4>
                                <div className="flex gap-2"><Input id="countriesImportFile" type="file" accept=".csv" onChange={handleFileChange(setCountryImportFile)}/>
                                <Button onClick={() => handleImport(countryImportFile, firebaseService.importCountries, 'countries')} disabled={!countryImportFile || isImporting}><Upload/></Button></div>
                            </div>
                        </div>
                         <div className="space-y-2 p-4 border rounded-lg">
                            <h3 className="font-semibold flex items-center gap-2"><Users/> Secretariat</h3>
                            <Button onClick={() => handleExport(data.secretariat, 'secretariat.csv')} className="w-full">Export to CSV</Button>
                            <div className="border-t pt-2 mt-2"><h4 className="font-semibold mb-2">Import</h4>
                                <div className="flex gap-2"><Input id="secretariatImportFile" type="file" accept=".csv" onChange={handleFileChange(setSecretariatImportFile)}/>
                                <Button onClick={() => handleImport(secretariatImportFile, firebaseService.importSecretariat, 'secretariat')} disabled={!secretariatImportFile || isImporting}><Upload/></Button></div>
                            </div>
                        </div>
                    </CardContent></Card></AccordionContent></AccordionItem>
                </Accordion>
            </TabsContent>
        </Tabs>
    </div>
  );
}
