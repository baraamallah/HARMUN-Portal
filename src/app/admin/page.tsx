
"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { useFieldArray, useForm } from "react-hook-form";
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
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion";
import { PlusCircle, Newspaper, Users, FileText, Library, Globe, Trash2, CalendarDays, Settings, Home, FileBadge, UserSquare, Shield, HelpCircle, type LucideIcon, Upload, Download, KeyRound, GalleryHorizontal, Linkedin, Youtube, Facebook, Twitter, Instagram, type LucideProps } from "lucide-react";
import * as firebaseService from "@/lib/firebase-service";
import * as authService from "@/lib/auth-service";
import { Skeleton } from "@/components/ui/skeleton";
import type * as T from "@/lib/types";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Switch } from "@/components/ui/switch";
import { useAuth } from "@/context/auth-context";

const icons: Record<string, LucideIcon> = {
    HelpCircle, PlusCircle, Newspaper, Users, FileText, Library, Globe, Trash2, CalendarDays,
    Settings, Home, FileBadge, UserSquare, Shield, Upload, Download, KeyRound, GalleryHorizontal,
    Linkedin, Youtube, Facebook, Twitter, Instagram,
};

const Icon = ({ name, ...props }: { name: string } & LucideProps) => {
  const LucideIcon = icons[name];
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

const galleryImageSchema = z.object({
    title: z.string().min(2, "Title is required."),
    imageUrl: z.string().url("Must be a valid URL.").min(1, "Image URL is required."),
});

const socialLinkItemSchema = z.object({
  platform: z.string({ required_error: "Please select a platform."}).min(1, "Please select a platform."),
  url: z.string().url("Please enter a valid URL."),
});


// Reusable Form Components for list items
function HighlightItemForm({ item, onSave, onDelete }: { item: T.ConferenceHighlight; onSave: (id: string, data: z.infer<typeof highlightItemSchema>) => void; onDelete: (id: string) => void }) {
  const form = useForm<z.infer<typeof highlightItemSchema>>({
    resolver: zodResolver(highlightItemSchema),
    defaultValues: item,
  });

  React.useEffect(() => { form.reset(item); }, [item, form]);

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

function CodeOfConductItemForm({ item, onSave, onDelete }: { item: T.CodeOfConductItem; onSave: (id: string, data: z.infer<typeof codeOfConductItemSchema>) => void; onDelete: (id: string) => void }) {
    const form = useForm<z.infer<typeof codeOfConductItemSchema>>({
        resolver: zodResolver(codeOfConductItemSchema),
        defaultValues: item,
    });
     React.useEffect(() => { form.reset(item); }, [item, form]);

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

function SecretariatMemberForm({ member, onSave, onDelete }: { member: T.SecretariatMember; onSave: (id: string, data: Omit<T.SecretariatMember, 'id' | 'order'>) => void; onDelete: (id: string) => void }) {
    const form = useForm<z.infer<typeof secretariatMemberSchema>>({
        resolver: zodResolver(secretariatMemberSchema),
        defaultValues: member,
    });
    React.useEffect(() => { form.reset(member); }, [member, form]);

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

function ScheduleEventForm({ event, onSave, onDelete }: { event: T.ScheduleEvent; onSave: (id: string, data: z.infer<typeof scheduleEventSchema>) => void; onDelete: (id: string) => void }) {
    const form = useForm<z.infer<typeof scheduleEventSchema>>({
        resolver: zodResolver(scheduleEventSchema),
        defaultValues: event,
    });
    React.useEffect(() => { form.reset(event); }, [event, form]);

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

function GalleryImageForm({ image, onSave, onDelete }: { image: T.GalleryImage; onSave: (id: string, data: z.infer<typeof galleryImageSchema>) => void; onDelete: (id: string) => void }) {
    const form = useForm<z.infer<typeof galleryImageSchema>>({
        resolver: zodResolver(galleryImageSchema),
        defaultValues: image,
    });
    React.useEffect(() => { form.reset(image); }, [image, form]);

    return (
        <Form {...form}>
            <form onSubmit={form.handleSubmit((data) => onSave(image.id, data))} className="flex flex-wrap md:flex-nowrap gap-2 items-start p-2 border rounded-md mb-2">
                <FormField control={form.control} name="title" render={({ field }) => <FormItem><FormLabel>Title</FormLabel><FormControl><Input {...field} /></FormControl><FormMessage /></FormItem>} />
                <FormField control={form.control} name="imageUrl" render={({ field }) => <FormItem className="flex-grow w-full md:w-auto"><FormLabel>Image URL</FormLabel><FormControl><Input {...field} /></FormControl><FormMessage /></FormItem>} />
                <div className="flex gap-1 pt-6"><Button type="submit" size="sm">Save</Button><Button size="sm" variant="destructive" type="button" onClick={() => onDelete(image.id)}>Delete</Button></div>
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
const galleryPageContentSchema = z.object({ title: z.string().min(5), subtitle: z.string().min(10) });

const navLinksForAdmin = [
  { href: '/about', label: 'About' }, { href: '/committees', label: 'Committees' }, { href: '/news', label: 'News' },
  { href: '/sg-notes', label: 'SG Notes' }, { href: '/registration', label: 'Registration' }, { href: '/schedule', label: 'Schedule' },
  { href: '/secretariat', label: 'Secretariat' }, { href: '/documents', label: 'Documents' }, { href: '/gallery', label: 'Gallery'}
];

const siteConfigSchema = z.object({
  conferenceDate: z.string().min(1),
  mapEmbedUrl: z.string().url(),
  socialLinks: z.array(z.object({
      platform: z.string(),
      url: z.string().url().or(z.literal("")).or(z.literal("#")),
  })),
  footerText: z.string().min(5),
  navVisibility: z.object(Object.fromEntries(navLinksForAdmin.map(link => [link.href, z.boolean()]))),
});

const changePasswordSchema = z.object({
    currentPassword: z.string().min(6, "Password must be at least 6 characters."),
    newPassword: z.string().min(6, "New password must be at least 6 characters."),
    confirmPassword: z.string()
}).refine(data => data.newPassword === data.confirmPassword, {
    message: "New passwords do not match.",
    path: ["confirmPassword"],
});

// "Add New" Item Forms - each with its own useForm hook
function AddHighlightForm({ onAdd }: { onAdd: (data: any) => Promise<void> }) {
    const form = useForm({ resolver: zodResolver(highlightItemSchema), defaultValues: { icon: '', title: '', description: '' } });
    return <Form {...form}><form onSubmit={form.handleSubmit(async (d) => { await onAdd(d); form.reset(); })} className="flex flex-wrap md:flex-nowrap gap-2 items-end p-2 border-t mt-4">
        <FormField control={form.control} name="icon" render={({ field }) => <FormItem><FormLabel>Icon</FormLabel><FormControl><Input {...field} placeholder="e.g. Calendar" /></FormControl><FormMessage /></FormItem>} />
        <FormField control={form.control} name="title" render={({ field }) => <FormItem><FormLabel>Title</FormLabel><FormControl><Input {...field} /></FormControl><FormMessage /></FormItem>} />
        <FormField control={form.control} name="description" render={({ field }) => <FormItem className="flex-grow"><FormLabel>Description</FormLabel><FormControl><Input {...field} /></FormControl><FormMessage /></FormItem>} />
        <Button type="submit" size="sm">Add Highlight</Button>
    </form></Form>;
}
function AddCodeOfConductForm({ onAdd }: { onAdd: (data: any) => Promise<void> }) {
    const form = useForm({ resolver: zodResolver(codeOfConductItemSchema), defaultValues: { title: '', content: '' } });
    return <Form {...form}><form onSubmit={form.handleSubmit(async (d) => { await onAdd(d); form.reset(); })} className="flex flex-wrap md:flex-nowrap gap-2 items-end p-2 border-t mt-4">
        <FormField control={form.control} name="title" render={({ field }) => <FormItem><FormLabel>Title</FormLabel><FormControl><Input {...field} /></FormControl><FormMessage /></FormItem>} />
        <FormField control={form.control} name="content" render={({ field }) => <FormItem className="flex-grow"><FormLabel>Content</FormLabel><FormControl><Textarea {...field} rows={1} /></FormControl><FormMessage /></FormItem>} />
        <Button type="submit" size="sm">Add Rule</Button>
    </form></Form>;
}
function AddSecretariatMemberForm({ onAdd }: { onAdd: (data: any) => Promise<void> }) {
    const form = useForm({ resolver: zodResolver(secretariatMemberSchema), defaultValues: { name: '', role: '', imageUrl: '', bio: '' } });
    return <Form {...form}><form onSubmit={form.handleSubmit(async (d) => { await onAdd(d); form.reset(); })} className="flex flex-wrap lg:flex-nowrap gap-2 items-end p-2 border-t mt-4">
        <FormField control={form.control} name="name" render={({ field }) => <FormItem><FormLabel>Name</FormLabel><FormControl><Input {...field} /></FormControl><FormMessage /></FormItem>} />
        <FormField control={form.control} name="role" render={({ field }) => <FormItem><FormLabel>Role</FormLabel><FormControl><Input {...field} /></FormControl><FormMessage /></FormItem>} />
        <FormField control={form.control} name="imageUrl" render={({ field }) => <FormItem><FormLabel>Image URL</FormLabel><FormControl><Input {...field} /></FormControl><FormDescription>Use a standard image URL or a Google Drive "share" link.</FormDescription><FormMessage /></FormItem>} />
        <FormField control={form.control} name="bio" render={({ field }) => <FormItem className="flex-grow w-full lg:w-auto"><FormLabel>Bio</FormLabel><FormControl><Textarea {...field} rows={1} /></FormControl><FormMessage /></FormItem>} />
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
    const form = useForm({ resolver: zodResolver(scheduleEventSchema), defaultValues: { time: '', title: '', location: '', description: '' } });
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
function AddGalleryImageForm({ onAdd }: { onAdd: (data: any) => Promise<void> }) {
    const form = useForm({ resolver: zodResolver(galleryImageSchema), defaultValues: { title: '', imageUrl: '' } });
    return <Form {...form}><form onSubmit={form.handleSubmit(async (d) => { await onAdd(d); form.reset(); })} className="flex flex-wrap md:flex-nowrap gap-2 items-end p-2 border-t mt-4">
        <FormField control={form.control} name="title" render={({ field }) => <FormItem><FormLabel>Title</FormLabel><FormControl><Input {...field} /></FormControl><FormMessage /></FormItem>} />
        <FormField control={form.control} name="imageUrl" render={({ field }) => <FormItem className="flex-grow"><FormLabel>Image URL</FormLabel><FormControl><Input {...field} /></FormControl><FormDescription>Use a standard image URL or a Google Drive "share" link.</FormDescription><FormMessage /></FormItem>} />
        <Button type="submit" size="sm">Add Image</Button>
    </form></Form>;
}


const availablePlatforms = ['Twitter', 'Instagram', 'Facebook', 'LinkedIn', 'YouTube'];
function AddSocialLinkForm({ onAdd, existingPlatforms }: { onAdd: (link: T.SocialLink) => void; existingPlatforms: string[] }) {
    const form = useForm<z.infer<typeof socialLinkItemSchema>>({
        resolver: zodResolver(socialLinkItemSchema),
        defaultValues: { platform: '', url: '' },
    });

    const filteredPlatforms = availablePlatforms.filter(p => !existingPlatforms.includes(p));

    const handleAdd = (values: z.infer<typeof socialLinkItemSchema>) => {
        onAdd(values);
        form.reset();
    };

    return (
        <Form {...form}>
            <form onSubmit={form.handleSubmit(handleAdd)} className="p-2 border-t mt-4">
                <h4 className="font-semibold mb-2">Add New Social Link</h4>
                <div className="flex flex-wrap md:flex-nowrap gap-2 items-end">
                    <FormField
                        control={form.control}
                        name="platform"
                        render={({ field }) => (
                            <FormItem className="w-full md:w-auto">
                                <FormLabel>Platform</FormLabel>
                                <Select onValueChange={field.onChange} value={field.value}>
                                    <FormControl>
                                        <SelectTrigger><SelectValue placeholder="Select..." /></SelectTrigger>
                                    </FormControl>
                                    <SelectContent>
                                        {filteredPlatforms.map(p => <SelectItem key={p} value={p}>{p}</SelectItem>)}
                                    </SelectContent>
                                </Select>
                                <FormMessage />
                            </FormItem>
                        )}
                     />
                     <FormField
                        control={form.control}
                        name="url"
                        render={({ field }) => (
                             <FormItem className="flex-grow">
                                <FormLabel>URL</FormLabel>
                                <FormControl>
                                    <Input {...field} placeholder="https://..." />
                                </FormControl>
                                <FormMessage />
                             </FormItem>
                        )}
                     />
                    <Button type="submit" disabled={filteredPlatforms.length === 0}>Add</Button>
                </div>
                 {filteredPlatforms.length === 0 && <p className="text-xs text-muted-foreground mt-2">All available platforms have been added.</p>}
            </form>
        </Form>
    );
}


export default function AdminPage() {
  const { toast } = useToast();
  const { user } = useAuth();
  const [loading, setLoading] = useState(true);
  const [activeAccordion, setActiveAccordion] = useState<string | undefined>();
  const [data, setData] = useState<any>({
    homeContent: {}, aboutContent: {}, registrationContent: {}, documentsContent: {}, galleryContent: {}, siteConfig: { socialLinks: [] },
    posts: [], countries: [], committees: [], secretariat: [], schedule: [], highlights: [], codeOfConduct: [], galleryImages: []
  });

  const homeForm = useForm<z.infer<typeof homePageContentSchema>>({ resolver: zodResolver(homePageContentSchema) });
  const aboutForm = useForm<z.infer<typeof aboutPageContentSchema>>({ resolver: zodResolver(aboutPageContentSchema) });
  const registrationForm = useForm<z.infer<typeof registrationPageContentSchema>>({ resolver: zodResolver(registrationPageContentSchema) });
  const documentsForm = useForm<z.infer<typeof documentsPageContentSchema>>({ resolver: zodResolver(documentsPageContentSchema) });
  const galleryForm = useForm<z.infer<typeof galleryPageContentSchema>>({ resolver: zodResolver(galleryPageContentSchema) });
  const siteConfigForm = useForm<z.infer<typeof siteConfigSchema>>({ resolver: zodResolver(siteConfigSchema) });
  const changePasswordForm = useForm<z.infer<typeof changePasswordSchema>>({ resolver: zodResolver(changePasswordSchema), defaultValues: {currentPassword: "", newPassword: "", confirmPassword: ""}});

  const { fields: socialLinkFields, append: appendSocialLink, remove: removeSocialLink, replace: replaceSocialLinks } = useFieldArray({
    control: siteConfigForm.control,
    name: "socialLinks",
  });

  const fetchAllData = React.useCallback(async () => {
    try {
        setLoading(true);
        const [
            homeContent, aboutContent, registrationContent, documentsContent, galleryContent, siteConfig,
            posts, countries, committees, secretariat, schedule, highlights, codeOfConduct, galleryImages
        ] = await Promise.all([
            firebaseService.getHomePageContent(), firebaseService.getAboutPageContent(),
            firebaseService.getRegistrationPageContent(), firebaseService.getDocumentsPageContent(),
            firebaseService.getGalleryPageContent(), firebaseService.getSiteConfig(), 
            firebaseService.getAllPosts(), firebaseService.getCountries(), 
            firebaseService.getCommittees(), firebaseService.getSecretariat(), 
            firebaseService.getSchedule(), firebaseService.getHighlights(), 
            firebaseService.getCodeOfConduct(), firebaseService.getGalleryImages()
        ]);
        
        const allData = { homeContent, aboutContent, registrationContent, documentsContent, galleryContent, siteConfig, posts, countries, committees, secretariat, schedule, highlights, codeOfConduct, galleryImages };
        setData(allData);

        homeForm.reset(allData.homeContent);
        aboutForm.reset(allData.aboutContent);
        registrationForm.reset(allData.registrationContent);
        documentsForm.reset(allData.documentsContent);
        galleryForm.reset(allData.galleryContent);
        siteConfigForm.reset({
            ...allData.siteConfig,
            socialLinks: allData.siteConfig.socialLinks || [],
            footerText: allData.siteConfig.footerText,
            navVisibility: allData.siteConfig.navVisibility || {},
        });

    } catch (error) {
        console.error("Failed to fetch admin data:", error);
        toast({ title: "Error", description: "Could not load data from the database.", variant: "destructive" });
    } finally {
        setLoading(false);
    }
  }, [toast, homeForm, aboutForm, registrationForm, documentsForm, galleryForm, siteConfigForm]);

  useEffect(() => { fetchAllData(); }, [fetchAllData]);

  const handleFormSubmit = async (updateFunction: (data: any) => Promise<void>, successMessage: string, data: any, form: any) => {
    try {
        await updateFunction(data);
        toast({ title: "Success!", description: successMessage });
        form.reset(data); 
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
  const [galleryImportFile, setGalleryImportFile] = useState<File | null>(null);
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
                setCommitteeImportFile(null); setCountryImportFile(null); setSecretariatImportFile(null); setGalleryImportFile(null);
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
                topics: c.topics.join('\\n'),
                backgroundGuideUrl: c.backgroundGuideUrl,
            }));
            break;
        case 'secretariat.csv':
            flattenedData = data.map(({id, order, ...rest}: T.SecretariatMember) => ({...rest, order}));
            break;
        case 'countries.csv':
            flattenedData = data.map(({id, ...rest}: T.Country) => rest);
            break;
        case 'gallery.csv':
             flattenedData = data.map(({id, order, ...rest}: T.GalleryImage) => ({...rest, order}));
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
  
    const handleUpdateItem = async <T extends {id: string}>(
        updateFunction: (id: string, data: Partial<T>) => Promise<void>,
        id: string,
        itemData: Partial<T>,
        stateKey: keyof typeof data,
        message: string
    ) => {
        try {
            await updateFunction(id, itemData);
            setData(prev => ({
                ...prev,
                [stateKey]: prev[stateKey].map((item: T) => item.id === id ? { ...item, ...itemData } : item),
            }));
            toast({ title: "Success!", description: message });
        } catch (error) {
            toast({ title: "Error", description: `Could not save item. ${error instanceof Error ? error.message : ''}`, variant: "destructive" });
        }
    };

    const handleDeleteItem = async (
        deleteFunction: (id: string) => Promise<void>,
        id: string,
        stateKey: keyof typeof data,
        message: string
    ) => {
        if (!confirm('Are you sure you want to delete this item?')) return;
        try {
            await deleteFunction(id);
            setData(prev => ({
                ...prev,
                [stateKey]: prev[stateKey].filter((item: {id: string}) => item.id !== id),
            }));
            toast({ title: "Success!", description: message });
        } catch (error) {
            toast({ title: "Error", description: `Could not delete item. ${error instanceof Error ? error.message : ''}`, variant: "destructive" });
        }
    };

    const handleAddItem = async <T extends {id: string}>(
        addFunction: (data: any) => Promise<string>,
        getFunction: (id: string) => Promise<any>,
        addData: any,
        stateKey: keyof typeof data,
        message: string
    ) => {
        try {
            const newId = await addFunction(addData);
            const newItem = await getFunction(newId);
            setData(prev => ({
                ...prev,
                [stateKey]: [...prev[stateKey], newItem],
            }));
            toast({ title: "Success!", description: message });
        } catch (error) {
            toast({ title: "Error", description: `Could not add item. ${error instanceof Error ? error.message : ''}`, variant: "destructive" });
        }
    }

    const handleChangePassword = async (values: z.infer<typeof changePasswordSchema>) => {
        if (!user || !user.email) {
            toast({ title: "Error", description: "No user is logged in.", variant: "destructive" });
            return;
        }
        try {
            await authService.reauthenticateAndChangePassword(user.email, values.currentPassword, values.newPassword);
            toast({ title: "Success", description: "Your password has been changed." });
            changePasswordForm.reset();
        } catch (error) {
            toast({ title: "Error Changing Password", description: error instanceof Error ? error.message : "An unknown error occurred.", variant: "destructive" });
        }
    }

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
            <TabsList className="grid w-full grid-cols-3 lg:grid-cols-7">
                <TabsTrigger value="dashboard">Dashboard</TabsTrigger>
                <TabsTrigger value="pages">Pages</TabsTrigger>
                <TabsTrigger value="conference">Conference</TabsTrigger>
                <TabsTrigger value="team">Team</TabsTrigger>
                <TabsTrigger value="gallery">Gallery</TabsTrigger>
                <TabsTrigger value="settings">Settings</TabsTrigger>
                <TabsTrigger value="security">Security</TabsTrigger>
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
                        <CreatePostForm onAdd={(postData) => handleAddItem(firebaseService.addPost, (id) => firebaseService.getDocById('posts', id), postData, "posts", "Post created!")} />
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
                                            <TableCell className="text-right"><Button variant="ghost" size="icon" onClick={() => handleDeleteItem(firebaseService.deletePost, post.id, "posts", "Post deleted.")}> <Trash2 className="h-4 w-4 text-destructive" /></Button></TableCell>
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
                                        onSave={(id, saveData) => handleUpdateItem(firebaseService.updateHighlight, id, saveData, "highlights", "Highlight updated.")}
                                        onDelete={(id) => handleDeleteItem(firebaseService.deleteHighlight, id, "highlights", "Highlight deleted.")}
                                    />
                                ))}
                                <AddHighlightForm onAdd={(addData) => handleAddItem(firebaseService.addHighlight, (id) => firebaseService.getDocById('highlights', id), addData, "highlights", "Highlight added!")} />
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
                                        onSave={(id, saveData) => handleUpdateItem(firebaseService.updateCodeOfConductItem, id, saveData, "codeOfConduct", "Rule updated.")}
                                        onDelete={(id) => handleDeleteItem(firebaseService.deleteCodeOfConductItem, id, "codeOfConduct", "Rule deleted.")}
                                    />
                                ))}
                                <AddCodeOfConductForm onAdd={(addData) => handleAddItem(firebaseService.addCodeOfConductItem, (id) => firebaseService.getDocById('codeOfConduct', id), addData, "codeOfConduct", "Rule added!")} />
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
                                await handleAddItem(
                                    (data) => firebaseService.addCommittee(data),
                                    (id) => firebaseService.getDocById('committees', id),
                                    {
                                        name: values.name,
                                        chair: { name: values.chairName, bio: values.chairBio || "", imageUrl: values.chairImageUrl || "" },
                                        topics: (values.topics || "").split('\n').filter(Boolean), 
                                        backgroundGuideUrl: values.backgroundGuideUrl || "",
                                    },
                                    "committees",
                                    "Committee Added!"
                                );
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
                                                <Button variant="ghost" size="icon" onClick={() => handleDeleteItem(firebaseService.deleteCommittee, c.id, "committees", "Committee deleted.")}>
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
                        <AddCountryForm committees={data.committees} onAdd={(values) => handleAddItem(firebaseService.addCountry, (id) => firebaseService.getDocById('countries', id), values, "countries", "Country Added!")} />
                         <div className="border rounded-md max-h-96 overflow-y-auto">
                            <Table><TableHeader><TableRow><TableHead>Country</TableHead><TableHead>Committee</TableHead><TableHead>Status</TableHead><TableHead className="text-right">Actions</TableHead></TableRow></TableHeader>
                            <TableBody>
                                {data.countries?.map((country: T.Country) => (
                                    <TableRow key={country.id}>
                                        <TableCell>{country.name}</TableCell><TableCell>{country.committee}</TableCell>
                                        <TableCell><Badge variant={country.status === 'Available' ? 'secondary' : 'default'}>{country.status}</Badge></TableCell>
                                        <TableCell className="text-right flex items-center justify-end gap-2">
                                            <Switch checked={country.status === 'Assigned'} onCheckedChange={async () => { 
                                                const newStatus = country.status === 'Available' ? 'Assigned' : 'Available'; 
                                                handleUpdateItem(firebaseService.updateCountryStatus, country.id, {status: newStatus}, "countries", "Country status updated.");
                                            }} />
                                            <Button variant="ghost" size="icon" onClick={() => handleDeleteItem(firebaseService.deleteCountry, country.id, "countries", "Country deleted.")}> <Trash2 className="h-4 w-4 text-destructive" /></Button>
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
                                onSave={async (id, saveData) => {
                                    await firebaseService.updateScheduleEvent(id, { ...event, ...saveData });
                                    setData(prev => ({ ...prev, schedule: prev.schedule.map(d => d.id === event.dayId ? {...d, events: d.events.map(e => e.id === id ? {...e, ...saveData} : e)} : d)}));
                                    toast({title: "Event updated."});
                                }}
                                onDelete={async (id) => {
                                    if(!confirm('Are you sure?')) return;
                                    await firebaseService.deleteScheduleEvent(id);
                                    setData(prev => ({ ...prev, schedule: prev.schedule.map(d => d.id === event.dayId ? {...d, events: d.events.filter(e => e.id !== id)} : d)}));
                                    toast({title: "Event deleted."});
                                }}
                             />
                           ))}
                           <AddScheduleEventForm dayId={day.id} onAdd={async(eventData) => { 
                                const newId = await firebaseService.addScheduleEvent(eventData);
                                const newEvent = await firebaseService.getDocById('scheduleEvents', newId);
                                setData(p => ({...p, schedule: p.schedule.map(d => d.id === eventData.dayId ? {...d, events: [...d.events, newEvent]} : d)}));
                           }}/>
                        </CardContent></Card>
                       ))}
                       <Card><CardHeader><CardTitle>Add New Day</CardTitle></CardHeader>
                       <CardContent>
                         <AddScheduleDayForm onAdd={async(dayData) => { 
                            const newId = await firebaseService.addScheduleDay(dayData);
                            const newDay = await firebaseService.getDocById('scheduleDays', newId);
                            setData(p => ({...p, schedule: [...p.schedule, {...newDay, events: []}]}));
                         }} />
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
                                onSave={(id, saveData) => handleUpdateItem(firebaseService.updateSecretariatMember, id, saveData, "secretariat", "Member updated.")}
                                onDelete={(id) => handleDeleteItem(firebaseService.deleteSecretariatMember, id, "secretariat", "Member deleted.")}
                            />
                        ))}
                        <AddSecretariatMemberForm onAdd={(addData) => handleAddItem(firebaseService.addSecretariatMember, (id) => firebaseService.getDocById('secretariat', id), addData, "secretariat", "Member added!")} />
                    </CardContent>
                </Card>
            </TabsContent>
            
            <TabsContent value="gallery" className="mt-6">
                <Accordion type="single" collapsible value={activeAccordion} onValueChange={setActiveAccordion}>
                    <AccordionItem value="gallery-content">
                        <AccordionTrigger><div className="flex items-center gap-2 text-lg"><FileText /> Gallery Page Content</div></AccordionTrigger>
                        <AccordionContent className="p-1 space-y-6">
                             <Card><CardContent className="pt-6">
                                <Form {...galleryForm}><form onSubmit={galleryForm.handleSubmit((d) => handleFormSubmit(firebaseService.updateGalleryPageContent, "Gallery page content updated.", d, galleryForm))} className="space-y-4">
                                    <FormField control={galleryForm.control} name="title" render={({ field }) => <FormItem><FormLabel>Title</FormLabel><FormControl><Input {...field} /></FormControl><FormMessage /></FormItem>} />
                                    <FormField control={galleryForm.control} name="subtitle" render={({ field }) => <FormItem><FormLabel>Subtitle</FormLabel><FormControl><Textarea {...field} /></FormControl><FormMessage /></FormItem>} />
                                    <Button type="submit">Save Content</Button>
                                </form></Form>
                            </CardContent></Card>
                        </AccordionContent>
                    </AccordionItem>
                    <AccordionItem value="gallery-images">
                        <AccordionTrigger><div className="flex items-center gap-2 text-lg"><GalleryHorizontal /> Gallery Images</div></AccordionTrigger>
                        <AccordionContent className="p-1 space-y-6">
                            <Card><CardContent className="pt-6">
                                {data.galleryImages?.map((image: T.GalleryImage) => (
                                    <GalleryImageForm
                                        key={image.id}
                                        image={image}
                                        onSave={(id, saveData) => handleUpdateItem(firebaseService.updateGalleryImage, id, saveData, "galleryImages", "Image updated.")}
                                        onDelete={(id) => handleDeleteItem(firebaseService.deleteGalleryImage, id, "galleryImages", "Image deleted.")}
                                    />
                                ))}
                                <AddGalleryImageForm onAdd={(addData) => handleAddItem(firebaseService.addGalleryImage, (id) => firebaseService.getDocById('galleryImages', id), addData, "galleryImages", "Image added!")} />
                            </CardContent></Card>
                        </AccordionContent>
                    </AccordionItem>
                </Accordion>
            </TabsContent>


            <TabsContent value="settings" className="mt-6">
                <Accordion type="single" collapsible value={activeAccordion} onValueChange={setActiveAccordion}>
                    <AccordionItem value="site"><AccordionTrigger><div className="flex items-center gap-2 text-lg"><Settings /> Site & Navigation</div></AccordionTrigger>
                    <AccordionContent className="p-1 space-y-6">
                         <Form {...siteConfigForm}><form id="site-config-form" onSubmit={siteConfigForm.handleSubmit(async (values) => {
                                await handleFormSubmit(firebaseService.updateSiteConfig, "Site settings updated.", values, siteConfigForm)
                            })} className="space-y-4">
                        <Card><CardHeader><CardTitle>General Settings</CardTitle></CardHeader>
                        <CardContent className="space-y-4">
                           
                                <FormField control={siteConfigForm.control} name="conferenceDate" render={({ field }) => (<FormItem><FormLabel>Countdown Date</FormLabel><FormControl><Input {...field} /></FormControl><FormDescription>Format: YYYY-MM-DDTHH:mm:ss</FormDescription></FormItem>)} />
                                <FormField control={siteConfigForm.control} name="mapEmbedUrl" render={({ field }) => (<FormItem><FormLabel>Google Maps Embed URL</FormLabel><FormControl><Input {...field} /></FormControl></FormItem>)} />
                                <FormField control={siteConfigForm.control} name="footerText" render={({ field }) => (<FormItem><FormLabel>Footer Text</FormLabel><FormControl><Textarea {...field} /></FormControl></FormItem>)} />
                                <Button type="submit" form="site-config-form">Save General</Button>
                        </CardContent></Card>
                        
                         <Card><CardHeader><CardTitle>Social Media Links</CardTitle></CardHeader>
                         <CardContent>
                             <div className="space-y-4">
                                {socialLinkFields.map((field, index) => (
                                    <div key={field.id} className="flex items-end gap-2 p-2 border rounded-md">
                                         <FormField
                                            control={siteConfigForm.control}
                                            name={`socialLinks.${index}.platform`}
                                            render={({ field }) => (
                                                <FormItem>
                                                    <FormLabel>Platform</FormLabel>
                                                    <FormControl><Input {...field} readOnly className="font-semibold bg-muted" /></FormControl>
                                                </FormItem>
                                            )}
                                        />
                                        <FormField
                                            control={siteConfigForm.control}
                                            name={`socialLinks.${index}.url`}
                                            render={({ field }) => (
                                                <FormItem className="flex-grow">
                                                    <FormLabel>URL</FormLabel>
                                                    <FormControl><Input {...field} placeholder="https://..." /></FormControl>
                                                </FormItem>
                                            )}
                                        />
                                        <Button type="button" variant="destructive" size="icon" onClick={() => removeSocialLink(index)}><Trash2 className="h-4 w-4"/></Button>
                                    </div>
                                ))}
                            </div>
                            <AddSocialLinkForm
                                onAdd={appendSocialLink}
                                existingPlatforms={socialLinkFields.map(f => f.platform)}
                            />
                            <Button type="submit" form="site-config-form" className="mt-4">Save Social Links</Button>
                         </CardContent></Card>
                        
                        <Card><CardHeader><CardTitle>Navigation Visibility</CardTitle></CardHeader>
                        <CardContent>
                             <div className="space-y-2">
                                {navLinksForAdmin.map((link) => (
                                    <FormField key={link.href} control={siteConfigForm.control} name={`navVisibility.${link.href}` as const} render={({ field }) => (
                                        <FormItem className="flex flex-row items-center justify-between rounded-lg border p-3">
                                            <FormLabel>{link.label}</FormLabel>
                                            <FormControl><Switch checked={field.value} onCheckedChange={field.onChange} /></FormControl>
                                        </FormItem>
                                    )} />
                                ))}
                                <Button type="submit" form="site-config-form" className="w-full">Save Navigation</Button>
                             </div>
                        </CardContent></Card>
                        </form></Form>
                    </AccordionContent></AccordionItem>
                    <AccordionItem value="import-export"><AccordionTrigger><div className="flex items-center gap-2 text-lg"><Download /> Import / Export</div></AccordionTrigger>
                    <AccordionContent className="p-1"><Card><CardContent className="pt-6 grid md:grid-cols-2 lg:grid-cols-4 gap-6">
                        <div className="space-y-2 p-4 border rounded-lg">
                            <h3 className="font-semibold flex items-center gap-2"><Library/> Committees</h3>
                            <Button onClick={() => handleExport(data.committees, 'committees.csv')} className="w-full">Export to CSV</Button>
                            <div className="border-t pt-2 mt-2"><h4 className="font-semibold mb-2">Import</h4>
                                <FormDescription className="text-xs mb-2">CSV must have columns: name, chairName, chairBio, chairImageUrl, topics (use \n for multiple), backgroundGuideUrl.</FormDescription>
                                <div className="flex gap-2"><Input id="committeesImportFile" type="file" accept=".csv" onChange={handleFileChange(setCommitteeImportFile)}/>
                                <Button onClick={() => handleImport(committeeImportFile, firebaseService.importCommittees, 'committees')} disabled={!committeeImportFile || isImporting}><Upload/></Button></div>
                            </div>
                        </div>
                         <div className="space-y-2 p-4 border rounded-lg">
                            <h3 className="font-semibold flex items-center gap-2"><Globe/> Countries</h3>
                            <Button onClick={() => handleExport(data.countries, 'countries.csv')} className="w-full">Export to CSV</Button>
                            <div className="border-t pt-2 mt-2"><h4 className="font-semibold mb-2">Import</h4>
                                <FormDescription className="text-xs mb-2">CSV must have columns: name, committee, status (Available or Assigned).</FormDescription>
                                <div className="flex gap-2"><Input id="countriesImportFile" type="file" accept=".csv" onChange={handleFileChange(setCountryImportFile)}/>
                                <Button onClick={() => handleImport(countryImportFile, firebaseService.importCountries, 'countries')} disabled={!countryImportFile || isImporting}><Upload/></Button></div>
                            </div>
                        </div>
                         <div className="space-y-2 p-4 border rounded-lg">
                            <h3 className="font-semibold flex items-center gap-2"><Users/> Secretariat</h3>
                            <Button onClick={() => handleExport(data.secretariat, 'secretariat.csv')} className="w-full">Export to CSV</Button>
                            <div className="border-t pt-2 mt-2"><h4 className="font-semibold mb-2">Import</h4>
                                <FormDescription className="text-xs mb-2">CSV must have columns: name, role, bio, imageUrl, order.</FormDescription>
                                <div className="flex gap-2"><Input id="secretariatImportFile" type="file" accept=".csv" onChange={handleFileChange(setSecretariatImportFile)}/>
                                <Button onClick={() => handleImport(secretariatImportFile, firebaseService.importSecretariat, 'secretariat')} disabled={!secretariatImportFile || isImporting}><Upload/></Button></div>
                            </div>
                        </div>
                        <div className="space-y-2 p-4 border rounded-lg">
                            <h3 className="font-semibold flex items-center gap-2"><GalleryHorizontal/> Gallery</h3>
                            <Button onClick={() => handleExport(data.galleryImages, 'gallery.csv')} className="w-full">Export to CSV</Button>
                            <div className="border-t pt-2 mt-2"><h4 className="font-semibold mb-2">Import</h4>
                                <FormDescription className="text-xs mb-2">CSV must have columns: title, imageUrl, order.</FormDescription>
                                <div className="flex gap-2"><Input id="galleryImportFile" type="file" accept=".csv" onChange={handleFileChange(setGalleryImportFile)}/>
                                <Button onClick={() => handleImport(galleryImportFile, firebaseService.importGallery, 'gallery')} disabled={!galleryImportFile || isImporting}><Upload/></Button></div>
                            </div>
                        </div>
                    </CardContent></Card></AccordionContent></AccordionItem>
                </Accordion>
            </TabsContent>
            
            <TabsContent value="security" className="mt-6">
                <Card>
                    <CardHeader>
                        <CardTitle className="flex items-center gap-2"><KeyRound /> Change Password</CardTitle>
                        <CardDescription>Update the password for your admin account.</CardDescription>
                    </CardHeader>
                    <CardContent>
                        <Form {...changePasswordForm}>
                            <form onSubmit={changePasswordForm.handleSubmit(handleChangePassword)} className="space-y-4 max-w-sm">
                                <FormField
                                    control={changePasswordForm.control}
                                    name="currentPassword"
                                    render={({ field }) => (
                                        <FormItem>
                                            <FormLabel>Current Password</FormLabel>
                                            <FormControl><Input type="password" {...field} /></FormControl>
                                            <FormMessage />
                                        </FormItem>
                                    )}
                                />
                                <FormField
                                    control={changePasswordForm.control}
                                    name="newPassword"
                                    render={({ field }) => (
                                        <FormItem>
                                            <FormLabel>New Password</FormLabel>
                                            <FormControl><Input type="password" {...field} /></FormControl>
                                            <FormMessage />
                                        </FormItem>
                                    )}
                                />
                                <FormField
                                    control={changePasswordForm.control}
                                    name="confirmPassword"
                                    render={({ field }) => (
                                        <FormItem>
                                            <FormLabel>Confirm New Password</FormLabel>
                                            <FormControl><Input type="password" {...field} /></FormControl>
                                            <FormMessage />
                                        </FormItem>
                                    )}
                                />
                                <Button type="submit" disabled={changePasswordForm.formState.isSubmitting}>
                                    {changePasswordForm.formState.isSubmitting ? "Updating..." : "Update Password"}
                                </Button>
                            </form>
                        </Form>
                    </CardContent>
                </Card>
            </TabsContent>
        </Tabs>
    </div>
  );
}

    

    