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
import { Paintbrush, Type, PlusCircle, Newspaper, Users, FileText, Library, Globe, Trash2, Share2, BookOpenText, Upload, Download, FileSpreadsheet, CalendarDays } from "lucide-react";
import { getTheme, updateTheme, getHomePageContent, updateHomePageContent, addPost, getAllPosts, formatTimestamp, getCountries, addCountry, updateCountryStatus, deleteCountry, getCommittees, addCommittee, deleteCommittee, getSiteConfig, updateSiteConfig, getAboutPageContent, updateAboutPageContent, defaultSiteConfig, importCommittees, importCountries } from "@/lib/firebase-service";
import { Skeleton } from "@/components/ui/skeleton";
import type { Post, Country, Committee, SiteConfig, HomePageContent, AboutPageContent } from "@/lib/types";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Switch } from "@/components/ui/switch";

const themeFormSchema = z.object({
  primaryColor: z.string().regex(/^(\d{1,3})\s(\d{1,3})%\s(\d{1,3})%$/, "Must be a valid HSL string (e.g., 227 66% 32%)"),
  backgroundColor: z.string().regex(/^(\d{1,3})\s(\d{1,3})%\s(\d{1,3})%$/, "Must be a valid HSL string (e.g., 210 17% 98%)"),
  accentColor: z.string().regex(/^(\d{1,3})\s(\d{1,3})%\s(\d{1,3})%$/, "Must be a valid HSL string (e.g., 47 96% 52%)"),
});

const contentFormSchema = z.object({
    heroTitle: z.string().min(5, "Title must be at least 5 characters."),
    heroSubtitle: z.string().min(10, "Subtitle must be at least 10 characters."),
    heroImageUrl: z.string().url({ message: "Please enter a valid URL." }),
});

const aboutContentFormSchema = z.object({
    title: z.string().min(5, "Title must be at least 5 characters."),
    subtitle: z.string().min(10, "Subtitle must be at least 10 characters."),
    imageUrl: z.string().url({ message: "Please enter a valid URL." }),
    whatIsTitle: z.string().min(5, "Title must be at least 5 characters."),
    whatIsPara1: z.string().min(20, "Content must be at least 20 characters."),
    whatIsPara2: z.string().min(20, "Content must be at least 20 characters."),
    storyTitle: z.string().min(5, "Title must be at least 5 characters."),
    storyPara1: z.string().min(20, "Content must be at least 20 characters."),
    storyPara2: z.string().min(20, "Content must be at least 20 characters."),
});

const postFormSchema = z.object({
    title: z.string().min(5, "Title must be at least 5 characters long."),
    content: z.string().min(20, "Content must be at least 20 characters long."),
    type: z.enum(['sg-note', 'news'], { required_error: "You must select a post type." }),
});

const countryMatrixFormSchema = z.object({
    name: z.string().min(2, "Country name is required."),
    committee: z.string({ required_error: "Please select a committee." }).min(1, "Please select a committee."),
});

const committeeFormSchema = z.object({
    name: z.string().min(3, "Committee name is required."),
    chairName: z.string().min(2, "Chair name is required."),
    chairBio: z.string().optional(),
    chairImageUrl: z.string().url("Must be a valid URL or be left empty.").or(z.literal("")).optional(),
    topics: z.string().optional(),
    backgroundGuideUrl: z.string().url("Must be a valid URL or be left empty.").or(z.literal("")).optional(),
});

const navLinksForAdmin = [
  { href: '/about', label: 'About' },
  { href: '/committees', label: 'Committees' },
  { href: '/news', label: 'News' },
  { href: '/sg-notes', label: 'SG Notes' },
  { href: '/registration', label: 'Registration' },
  { href: '/schedule', label: 'Schedule' },
  { href: '/secretariat', label: 'Secretariat' },
  { href: '/documents', label: 'Documents' },
];

const siteConfigFormSchema = z.object({
  conferenceDate: z.string().min(1, "Conference date is required."),
  twitter: z.string().url("Must be a valid URL.").or(z.literal("")).or(z.literal("#")),
  instagram: z.string().url("Must be a valid URL.").or(z.literal("")).or(z.literal("#")),
  facebook: z.string().url("Must be a valid URL.").or(z.literal("")).or(z.literal("#")),
  footerText: z.string().min(5, "Footer text must be at least 5 characters."),
  navVisibility: z.object(
    Object.fromEntries(navLinksForAdmin.map(link => [link.href, z.boolean()]))
  ),
});

export default function AdminPage() {
  const { toast } = useToast();
  const [loading, setLoading] = useState(true);
  const [posts, setPosts] = useState<Post[]>([]);
  const [countries, setCountries] = useState<Country[]>([]);
  const [committees, setCommittees] = useState<Committee[]>([]);
  
  const [committeeImportFile, setCommitteeImportFile] = useState<File | null>(null);
  const [isImportingCommittees, setIsImportingCommittees] = useState(false);
  const [countryImportFile, setCountryImportFile] = useState<File | null>(null);
  const [isImportingCountries, setIsImportingCountries] = useState(false);

  const themeForm = useForm<z.infer<typeof themeFormSchema>>({ resolver: zodResolver(themeFormSchema) });
  const contentForm = useForm<z.infer<typeof contentFormSchema>>({ resolver: zodResolver(contentFormSchema) });
  const aboutContentForm = useForm<z.infer<typeof aboutContentFormSchema>>({ resolver: zodResolver(aboutContentFormSchema) });
  const siteConfigForm = useForm<z.infer<typeof siteConfigFormSchema>>({ resolver: zodResolver(siteConfigFormSchema) });
  const postForm = useForm<z.infer<typeof postFormSchema>>({
    resolver: zodResolver(postFormSchema),
    defaultValues: { title: "", content: "" },
  });
  const countryMatrixForm = useForm<z.infer<typeof countryMatrixFormSchema>>({
    resolver: zodResolver(countryMatrixFormSchema),
    defaultValues: { name: "" },
  });
  const committeeForm = useForm<z.infer<typeof committeeFormSchema>>({
    resolver: zodResolver(committeeFormSchema),
    defaultValues: { name: "", chairName: "", chairBio: "", chairImageUrl: "", topics: "", backgroundGuideUrl: "" },
  });

  const fetchAdminData = React.useCallback(async () => {
    try {
        setLoading(true);
        const [theme, content, aboutContent, allPosts, allCountries, allCommittees, siteConfig] = await Promise.all([
            getTheme(),
            getHomePageContent(),
            getAboutPageContent(),
            getAllPosts(),
            getCountries(),
            getCommittees(),
            getSiteConfig(),
        ]);
        themeForm.reset(theme);
        contentForm.reset(content);
        aboutContentForm.reset(aboutContent);
        siteConfigForm.reset({
            ...siteConfig,
            ...siteConfig.socialLinks,
            footerText: siteConfig.footerText,
            navVisibility: siteConfig.navVisibility || defaultSiteConfig.navVisibility,
        });
        setPosts(allPosts);
        setCountries(allCountries);
        setCommittees(allCommittees);
    } catch (error) {
        console.error("Failed to fetch admin data:", error);
        toast({
            title: "Error",
            description: "Could not load data from the database.",
            variant: "destructive",
        });
    } finally {
        setLoading(false);
    }
  }, [toast, themeForm, contentForm, siteConfigForm, aboutContentForm]);

  useEffect(() => {
    fetchAdminData();
  }, [fetchAdminData]);

  async function onThemeSubmit(values: z.infer<typeof themeFormSchema>) {
    try {
      await updateTheme(values);
      toast({
        title: "Theme Updated!",
        description: "Your color settings have been saved. Refresh the page to see them applied.",
      });
    } catch (error) {
       toast({
        title: "Error Saving Theme",
        description: "Could not save theme settings to the database.",
        variant: "destructive",
      });
    }
  }

  async function onContentSubmit(values: z.infer<typeof contentFormSchema>) {
    try {
      const processedValues = {
        ...values,
        heroImageUrl: convertGoogleDriveLink(values.heroImageUrl),
      };
      await updateHomePageContent(processedValues);
      toast({
        title: "Content Updated!",
        description: "Home page content has been saved successfully.",
      });
    } catch (error) {
       toast({
        title: "Error Saving Content",
        description: "Could not save content to the database.",
        variant: "destructive",
      });
    }
  }

  async function onAboutContentSubmit(values: z.infer<typeof aboutContentFormSchema>) {
    try {
      const processedValues = {
          ...values,
          imageUrl: convertGoogleDriveLink(values.imageUrl),
      };
      await updateAboutPageContent(processedValues as AboutPageContent);
      toast({
        title: "About Page Updated!",
        description: "Your changes to the about page have been saved.",
      });
    } catch (error) {
       toast({
        title: "Error Saving Content",
        description: "Could not save about page content to the database.",
        variant: "destructive",
      });
    }
  }

  async function onSiteConfigSubmit(values: z.infer<typeof siteConfigFormSchema>) {
    try {
        const config: SiteConfig = {
            conferenceDate: values.conferenceDate,
            socialLinks: {
                twitter: values.twitter,
                instagram: values.instagram,
                facebook: values.facebook,
            },
            footerText: values.footerText,
            navVisibility: values.navVisibility,
        };
      await updateSiteConfig(config);
      toast({
        title: "Site Settings Updated!",
        description: "Your site-wide settings have been saved.",
      });
    } catch (error) {
       toast({
        title: "Error Saving Settings",
        description: "Could not save settings to the database.",
        variant: "destructive",
      });
    }
  }

  async function onPostSubmit(values: z.infer<typeof postFormSchema>) {
    try {
        await addPost(values);
        toast({
            title: "Post Created!",
            description: "Your new post has been published.",
        });
        postForm.reset();
        await fetchAdminData();
    } catch (error) {
        toast({
            title: "Error Creating Post",
            description: "Could not save the post to the database.",
            variant: "destructive",
        });
    }
  }

  async function onCountrySubmit(values: z.infer<typeof countryMatrixFormSchema>) {
    try {
        await addCountry({ ...values, status: 'Available' });
        toast({ title: "Country Added", description: `${values.name} has been added to the matrix.` });
        countryMatrixForm.reset({ name: ""});
        await fetchAdminData();
    } catch (error) {
        toast({ title: "Error", description: "Could not add country.", variant: "destructive" });
    }
  }

  async function handleStatusChange(id: string, currentStatus: 'Available' | 'Assigned') {
      const newStatus = currentStatus === 'Available' ? 'Assigned' : 'Available';
      try {
          await updateCountryStatus(id, newStatus);
          toast({ title: "Status Updated", description: `Status changed to ${newStatus}.` });
          await fetchAdminData();
      } catch (error) {
          toast({ title: "Error", description: "Could not update status.", variant: "destructive" });
      }
  }

  async function handleDeleteCountry(id: string, name: string) {
      if (confirm(`Are you sure you want to delete ${name}? This action cannot be undone.`)) {
          try {
              await deleteCountry(id);
              toast({ title: "Country Deleted", description: `${name} has been removed from the matrix.` });
              await fetchAdminData();
          } catch (error) {
              toast({ title: "Error", description: "Could not delete country.", variant: "destructive" });
          }
      }
  }

  async function onCommitteeSubmit(values: z.infer<typeof committeeFormSchema>) {
    try {
        const committeeData = {
            name: values.name,
            chair: {
                name: values.chairName,
                bio: values.chairBio || "The chair has not provided a biography yet.",
                imageUrl: convertGoogleDriveLink(values.chairImageUrl || "https://placehold.co/400x400.png"),
            },
            topics: (values.topics || "").split('\n').filter(topic => topic.trim() !== ''),
            backgroundGuideUrl: values.backgroundGuideUrl || "",
        };
        await addCommittee(committeeData);
        toast({ title: "Committee Added!", description: `The ${values.name} committee has been created.` });
        committeeForm.reset();
        await fetchAdminData();
    } catch (error) {
        toast({ title: "Error Adding Committee", description: "Could not save the committee.", variant: "destructive" });
    }
  }

  async function handleDeleteCommittee(id: string, name: string) {
      if (confirm(`Are you sure you want to delete the ${name} committee? This is irreversible.`)) {
          try {
              await deleteCommittee(id);
              toast({ title: "Committee Deleted", description: `The ${name} committee has been removed.` });
              await fetchAdminData();
          } catch (error) {
              toast({ title: "Error", description: "Could not delete the committee.", variant: "destructive" });
          }
      }
  }

  const downloadCsv = (data: string, filename: string) => {
    const blob = new Blob([data], { type: "text/csv;charset=utf-8;" });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.download = filename;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
  };

  const handleCommitteeExport = () => {
    const dataToExport = committees.map(c => ({
      name: c.name,
      chairName: c.chair.name,
      chairBio: c.chair.bio,
      chairImageUrl: c.chair.imageUrl,
      topics: c.topics.join('; '), // Join topics with a semicolon
      backgroundGuideUrl: c.backgroundGuideUrl,
    }));
    const csv = Papa.unparse(dataToExport);
    downloadCsv(csv, "harmun-committees-export.csv");
    toast({
        title: "Committees Exported",
        description: "Your committee data has been downloaded as a CSV file.",
    });
  };

  const handleCountryExport = () => {
    const dataToExport = countries.map(c => ({
      name: c.name,
      committee: c.committee,
      status: c.status,
    }));
    const csv = Papa.unparse(dataToExport);
    downloadCsv(csv, "harmun-countries-export.csv");
    toast({
        title: "Countries Exported",
        description: "Your country data has been downloaded as a CSV file.",
    });
  };

  const handleFileChange = (setter: React.Dispatch<React.SetStateAction<File | null>>) => (event: React.ChangeEvent<HTMLInputElement>) => {
    if (event.target.files && event.target.files.length > 0) {
        setter(event.target.files[0]);
    } else {
        setter(null);
    }
  };

  const handleCommitteeImport = async () => {
    if (!committeeImportFile) {
        toast({ title: "No file selected", description: "Please choose a committee CSV file to import.", variant: "destructive" });
        return;
    }
    if (!confirm("Are you sure you want to import committees? This will ERASE all existing committee data. This action cannot be undone.")) {
        return;
    }
    setIsImportingCommittees(true);
    Papa.parse(committeeImportFile, {
        header: true,
        skipEmptyLines: true,
        complete: async (results) => {
            try {
                const parsedData = results.data as any[];
                const committeesToImport = parsedData.map(row => ({
                    name: row.name || "Unnamed Committee",
                    chair: {
                        name: row.chairName || "TBD",
                        bio: row.chairBio || "The chair has not provided a biography yet.",
                        imageUrl: convertGoogleDriveLink(row.chairImageUrl || "https://placehold.co/400x400.png"),
                    },
                    topics: (row.topics || "").split(';').map((t: string) => t.trim()).filter(Boolean),
                    backgroundGuideUrl: row.backgroundGuideUrl || "",
                }));
                await importCommittees(committeesToImport);
                toast({
                    title: "Committee Import Successful!",
                    description: "Your committee data has been imported. The page will now reload.",
                });
                await fetchAdminData();
            } catch (error) {
                console.error("Import failed:", error);
                const errorMessage = error instanceof Error ? error.message : "An unknown error occurred.";
                toast({ title: "Import Failed", description: errorMessage, variant: "destructive" });
            } finally {
                setIsImportingCommittees(false);
                setCommitteeImportFile(null);
                const fileInput = document.getElementById('committeeImportFile') as HTMLInputElement;
                if (fileInput) fileInput.value = '';
            }
        },
        error: (error) => {
            toast({ title: "Error parsing CSV", description: error.message, variant: "destructive" });
            setIsImportingCommittees(false);
        }
    });
  };
  
  const handleCountryImport = async () => {
    if (!countryImportFile) {
        toast({ title: "No file selected", description: "Please choose a country CSV file to import.", variant: "destructive" });
        return;
    }
    if (!confirm("Are you sure you want to import countries? This will ERASE all existing country data. This action cannot be undone.")) {
        return;
    }
    setIsImportingCountries(true);
     Papa.parse(countryImportFile, {
        header: true,
        skipEmptyLines: true,
        complete: async (results) => {
            try {
                const parsedData = results.data as any[];
                 const countriesToImport = parsedData.map(row => ({
                    name: row.name || "Unnamed Country",
                    committee: row.committee || "Unassigned",
                    status: (row.status === 'Available' || row.status === 'Assigned') ? row.status : 'Available',
                }));
                await importCountries(countriesToImport);
                toast({
                    title: "Country Import Successful!",
                    description: "Your country data has been imported. The page will now reload.",
                });
                await fetchAdminData();
            } catch (error) {
                console.error("Import failed:", error);
                const errorMessage = error instanceof Error ? error.message : "An unknown error occurred.";
                toast({ title: "Import Failed", description: errorMessage, variant: "destructive" });
            } finally {
                setIsImportingCountries(false);
                setCountryImportFile(null);
                const fileInput = document.getElementById('countryImportFile') as HTMLInputElement;
                if (fileInput) fileInput.value = '';
            }
        },
        error: (error) => {
            toast({ title: "Error parsing CSV", description: error.message, variant: "destructive" });
            setIsImportingCountries(false);
        }
    });
  };

  if (loading) {
    return (
      <div className="space-y-8">
        {Array.from({ length: 4 }).map((_, i) => <Skeleton key={i} className="h-64 w-full" />)}
      </div>
    )
  }

  return (
    <div className="space-y-8">
        <div className="text-left">
            <h1 className="text-3xl font-bold">Admin Dashboard</h1>
            <p className="text-muted-foreground">Manage your conference website content and settings here.</p>
        </div>

        <Tabs defaultValue="dashboard" className="w-full">
            <TabsList className="grid w-full grid-cols-2 lg:grid-cols-4">
                <TabsTrigger value="dashboard">Dashboard</TabsTrigger>
                <TabsTrigger value="content">Content &amp; Posts</TabsTrigger>
                <TabsTrigger value="conference">Conference Data</TabsTrigger>
                <TabsTrigger value="settings">Site Settings</TabsTrigger>
            </TabsList>
            
            <TabsContent value="dashboard" className="mt-6">
                <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4">
                    <Card>
                        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                            <CardTitle className="text-sm font-medium">Total Registrations</CardTitle>
                            <Users className="h-4 w-4 text-muted-foreground" />
                        </CardHeader>
                        <CardContent>
                            <div className="text-2xl font-bold">0</div>
                            <p className="text-xs text-muted-foreground">This will update as delegates register.</p>
                        </CardContent>
                    </Card>
                    <Card>
                        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                            <CardTitle className="text-sm font-medium">Published Posts</CardTitle>
                            <FileText className="h-4 w-4 text-muted-foreground" />
                        </CardHeader>
                        <CardContent>
                            <div className="text-2xl font-bold">{posts.length}</div>
                            <p className="text-xs text-muted-foreground">Across News and SG Notes.</p>
                        </CardContent>
                    </Card>
                    <Card>
                        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                            <CardTitle className="text-sm font-medium">Countries in Matrix</CardTitle>
                            <Globe className="h-4 w-4 text-muted-foreground" />
                        </CardHeader>
                        <CardContent>
                            <div className="text-2xl font-bold">{countries.length}</div>
                            <p className="text-xs text-muted-foreground">Available and assigned positions.</p>
                        </CardContent>
                    </Card>
                    <Card>
                        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                            <CardTitle className="text-sm font-medium">Total Committees</CardTitle>
                            <Library className="h-4 w-4 text-muted-foreground" />
                        </CardHeader>
                        <CardContent>
                            <div className="text-2xl font-bold">{committees.length}</div>
                            <p className="text-xs text-muted-foreground">Number of active committees.</p>
                        </CardContent>
                    </Card>
                </div>
            </TabsContent>
            
            <TabsContent value="content" className="mt-6 space-y-8">
                <div className="grid lg:grid-cols-2 gap-8 items-start">
                    <Card>
                        <CardHeader>
                            <CardTitle className="flex items-center gap-2"><Type className="w-6 h-6" /> Home Page Content</CardTitle>
                            <CardDescription>Edit the main text and hero image on your home page.</CardDescription>
                        </CardHeader>
                        <CardContent>
                            <Form {...contentForm}><form onSubmit={contentForm.handleSubmit(onContentSubmit)} className="space-y-6">
                                <FormField control={contentForm.control} name="heroTitle" render={({ field }) => (<FormItem><FormLabel>Hero Title</FormLabel><FormControl><Input {...field} /></FormControl><FormMessage /></FormItem>)} />
                                <FormField control={contentForm.control} name="heroSubtitle" render={({ field }) => (<FormItem><FormLabel>Hero Subtitle</FormLabel><FormControl><Textarea {...field} rows={4} /></FormControl><FormMessage /></FormItem>)} />
                                <FormField control={contentForm.control} name="heroImageUrl" render={({ field }) => (<FormItem><FormLabel>Hero Image URL</FormLabel><FormControl><Input placeholder="https://example.com/image.png" {...field} /></FormControl><FormDescription>URL for the main hero banner image.</FormDescription><FormMessage /></FormItem>)} />
                                <Button type="submit" className="w-full">Save Content</Button>
                            </form></Form>
                        </CardContent>
                    </Card>
                     <Card>
                        <CardHeader>
                            <CardTitle className="flex items-center gap-2"><BookOpenText className="w-6 h-6" /> About Page Content</CardTitle>
                            <CardDescription>Edit the content for the "About" page.</CardDescription>
                        </CardHeader>
                        <CardContent>
                            <Form {...aboutContentForm}><form onSubmit={aboutContentForm.handleSubmit(onAboutContentSubmit)} className="space-y-6">
                                <FormField control={aboutContentForm.control} name="title" render={({ field }) => (<FormItem><FormLabel>Page Title</FormLabel><FormControl><Input {...field} /></FormControl><FormMessage /></FormItem>)} />
                                <FormField control={aboutContentForm.control} name="subtitle" render={({ field }) => (<FormItem><FormLabel>Page Subtitle</FormLabel><FormControl><Textarea {...field} rows={2} /></FormControl><FormMessage /></FormItem>)} />
                                <FormField control={aboutContentForm.control} name="imageUrl" render={({ field }) => (<FormItem><FormLabel>Image URL</FormLabel><FormControl><Input {...field} /></FormControl><FormMessage /></FormItem>)} />
                                <hr/>
                                <FormField control={aboutContentForm.control} name="whatIsTitle" render={({ field }) => (<FormItem><FormLabel>Section 1: Title</FormLabel><FormControl><Input {...field} /></FormControl><FormMessage /></FormItem>)} />
                                <FormField control={aboutContentForm.control} name="whatIsPara1" render={({ field }) => (<FormItem><FormLabel>Section 1: Paragraph 1</FormLabel><FormControl><Textarea {...field} rows={4} /></FormControl><FormMessage /></FormItem>)} />
                                <FormField control={aboutContentForm.control} name="whatIsPara2" render={({ field }) => (<FormItem><FormLabel>Section 1: Paragraph 2</FormLabel><FormControl><Textarea {...field} rows={4} /></FormControl><FormMessage /></FormItem>)} />
                                <hr/>
                                <FormField control={aboutContentForm.control} name="storyTitle" render={({ field }) => (<FormItem><FormLabel>Section 2: Title</FormLabel><FormControl><Input {...field} /></FormControl><FormMessage /></FormItem>)} />
                                <FormField control={aboutContentForm.control} name="storyPara1" render={({ field }) => (<FormItem><FormLabel>Section 2: Paragraph 1</FormLabel><FormControl><Textarea {...field} rows={4} /></FormControl><FormMessage /></FormItem>)} />
                                <FormField control={aboutContentForm.control} name="storyPara2" render={({ field }) => (<FormItem><FormLabel>Section 2: Paragraph 2</FormLabel><FormControl><Textarea {...field} rows={4} /></FormControl><FormMessage /></FormItem>)} />
                                <Button type="submit" className="w-full">Save About Page</Button>
                            </form></Form>
                        </CardContent>
                    </Card>
                </div>
                <Card>
                    <CardHeader>
                        <CardTitle className="flex items-center gap-2"><Newspaper className="w-6 h-6" /> Create & Manage Posts</CardTitle>
                        <CardDescription>Publish news articles or notes from the Secretary-General.</CardDescription>
                    </CardHeader>
                    <CardContent>
                        <Form {...postForm}>
                            <form onSubmit={postForm.handleSubmit(onPostSubmit)} className="space-y-6 mb-8">
                                <FormField control={postForm.control} name="title" render={({ field }) => (
                                    <FormItem><FormLabel>Post Title</FormLabel><FormControl><Input placeholder="e.g., Welcome to HARMUN 2025" {...field} /></FormControl><FormMessage /></FormItem>
                                )} />
                                <FormField control={postForm.control} name="type" render={({ field }) => (
                                    <FormItem><FormLabel>Post Type</FormLabel>
                                        <Select onValueChange={field.onChange} defaultValue={field.value}>
                                            <FormControl><SelectTrigger><SelectValue placeholder="Select a post type" /></SelectTrigger></FormControl>
                                            <SelectContent><SelectItem value="news">News</SelectItem><SelectItem value="sg-note">SG Note</SelectItem></SelectContent>
                                        </Select>
                                        <FormMessage />
                                    </FormItem>
                                )} />
                                <FormField control={postForm.control} name="content" render={({ field }) => (
                                    <FormItem><FormLabel>Content</FormLabel><FormControl><Textarea placeholder="Write your post content here..." {...field} rows={6} /></FormControl><FormMessage /></FormItem>
                                )} />
                                <Button type="submit" className="w-full" disabled={postForm.formState.isSubmitting}>
                                    <PlusCircle className="mr-2"/>
                                    {postForm.formState.isSubmitting ? "Publishing..." : "Publish Post"}
                                </Button>
                            </form>
                        </Form>
                        
                        <h3 className="text-lg font-semibold mb-4">Published Posts</h3>
                        <div className="border rounded-md max-h-96 overflow-y-auto">
                            <Table>
                                <TableHeader><TableRow><TableHead>Title</TableHead><TableHead>Type</TableHead><TableHead>Date</TableHead></TableRow></TableHeader>
                                <TableBody>
                                    {posts.length > 0 ? posts.map(post => (
                                        <TableRow key={post.id}>
                                            <TableCell className="font-medium">{post.title}</TableCell>
                                            <TableCell>{post.type === 'news' ? 'News' : 'SG Note'}</TableCell>
                                            <TableCell>{formatTimestamp(post.createdAt)}</TableCell>
                                        </TableRow>
                                    )) : (
                                        <TableRow><TableCell colSpan={3} className="text-center">No posts found.</TableCell></TableRow>
                                    )}
                                </TableBody>
                            </Table>
                        </div>
                    </CardContent>
                </Card>
            </TabsContent>
            
            <TabsContent value="conference" className="mt-6 space-y-8">
                 <Card>
                    <CardHeader>
                        <CardTitle className="flex items-center gap-2"><Library className="w-6 h-6" /> Committee Management</CardTitle>
                        <CardDescription>Add, remove, and manage conference committees.</CardDescription>
                    </CardHeader>
                    <CardContent>
                        <Form {...committeeForm}>
                            <form onSubmit={committeeForm.handleSubmit(onCommitteeSubmit)} className="space-y-6 mb-8 p-4 border rounded-lg">
                                <h3 className="text-lg font-semibold border-b pb-2">Add New Committee</h3>
                                <div className="grid md:grid-cols-2 gap-6">
                                    <FormField control={committeeForm.control} name="name" render={({ field }) => ( <FormItem><FormLabel>Committee Name</FormLabel><FormControl><Input placeholder="e.g., Security Council" {...field} /></FormControl><FormMessage /></FormItem> )} />
                                    <FormField control={committeeForm.control} name="chairName" render={({ field }) => ( <FormItem><FormLabel>Chair Name</FormLabel><FormControl><Input placeholder="e.g., Dr. Evelyn Reed" {...field} /></FormControl><FormMessage /></FormItem> )} />
                                </div>
                                <FormField control={committeeForm.control} name="chairBio" render={({ field }) => ( <FormItem><FormLabel>Chair Bio</FormLabel><FormControl><Textarea placeholder="Optional: Brief biography of the chair..." {...field} rows={3} /></FormControl><FormMessage /></FormItem> )} />
                                <FormField control={committeeForm.control} name="chairImageUrl" render={({ field }) => ( <FormItem><FormLabel>Chair Image URL</FormLabel><FormControl><Input placeholder="Optional: https://placehold.co/400x400.png" {...field} /></FormControl><FormMessage /></FormItem> )} />
                                <FormField control={committeeForm.control} name="topics" render={({ field }) => ( <FormItem><FormLabel>Topics</FormLabel><FormControl><Textarea placeholder="Optional: Enter each topic on a new line..." {...field} rows={3}/></FormControl><FormDescription>Separate each topic with a new line.</FormDescription><FormMessage /></FormItem> )} />
                                <FormField control={committeeForm.control} name="backgroundGuideUrl" render={({ field }) => ( <FormItem><FormLabel>Background Guide URL</FormLabel><FormControl><Input placeholder="Optional: https://example.com/guide.pdf" {...field} /></FormControl><FormMessage /></FormItem> )} />
                                <Button type="submit" className="w-full" disabled={committeeForm.formState.isSubmitting}><PlusCircle className="mr-2" />{committeeForm.formState.isSubmitting ? "Adding..." : "Add Committee"}</Button>
                            </form>
                        </Form>

                        <h3 className="text-lg font-semibold mt-6 mb-4">Existing Committees</h3>
                        <div className="border rounded-md max-h-96 overflow-y-auto">
                            <Table>
                                <TableHeader><TableRow><TableHead>Committee</TableHead><TableHead>Chair</TableHead><TableHead className="text-right">Actions</TableHead></TableRow></TableHeader>
                                <TableBody>
                                    {committees.length > 0 ? committees.map(c => (
                                        <TableRow key={c.id}>
                                            <TableCell className="font-medium">{c.name}</TableCell>
                                            <TableCell>{c.chair.name}</TableCell>
                                            <TableCell className="text-right">
                                                <Button variant="ghost" size="icon" onClick={() => handleDeleteCommittee(c.id, c.name)}>
                                                    <Trash2 className="h-4 w-4 text-destructive" />
                                                </Button>
                                            </TableCell>
                                        </TableRow>
                                    )) : (
                                        <TableRow><TableCell colSpan={3} className="text-center">No committees added yet.</TableCell></TableRow>
                                    )}
                                </TableBody>
                            </Table>
                        </div>
                    </CardContent>
                </Card>

                <Card>
                    <CardHeader>
                        <CardTitle className="flex items-center gap-2"><Globe className="w-6 h-6" /> Country Matrix Management</CardTitle>
                        <CardDescription>Add, remove, and manage country assignments for committees.</CardDescription>
                    </CardHeader>
                    <CardContent>
                        <Form {...countryMatrixForm}>
                            <form onSubmit={countryMatrixForm.handleSubmit(onCountrySubmit)} className="flex flex-col sm:flex-row sm:items-end gap-4 mb-6">
                                <FormField control={countryMatrixForm.control} name="name" render={({ field }) => (
                                    <FormItem className="flex-grow w-full sm:w-auto"><FormLabel>Country Name</FormLabel><FormControl><Input placeholder="e.g., Canada" {...field} /></FormControl><FormMessage /></FormItem>
                                )} />
                                <FormField control={countryMatrixForm.control} name="committee" render={({ field }) => (
                                    <FormItem className="flex-grow w-full sm:w-auto"><FormLabel>Committee</FormLabel>
                                        <Select onValueChange={field.onChange} defaultValue={field.value}>
                                            <FormControl><SelectTrigger><SelectValue placeholder="Select a committee" /></SelectTrigger></FormControl>
                                            <SelectContent>{committees.map(c => <SelectItem key={c.id} value={c.name}>{c.name}</SelectItem>)}</SelectContent>
                                        </Select>
                                        <FormMessage />
                                    </FormItem>
                                )} />
                                <Button type="submit" className="w-full sm:w-auto" disabled={!countryMatrixForm.formState.isValid || countryMatrixForm.formState.isSubmitting}><PlusCircle className="mr-2 h-4 w-4" /> Add Country</Button>
                            </form>
                        </Form>
                        <div className="border rounded-md max-h-96 overflow-y-auto">
                            <Table>
                                <TableHeader><TableRow><TableHead>Country</TableHead><TableHead>Committee</TableHead><TableHead>Status</TableHead><TableHead className="text-right">Actions</TableHead></TableRow></TableHeader>
                                <TableBody>
                                    {countries.length > 0 ? countries.map(country => (
                                        <TableRow key={country.id}>
                                            <TableCell className="font-medium">{country.name}</TableCell>
                                            <TableCell>{country.committee}</TableCell>
                                            <TableCell>
                                                <Badge variant={country.status === 'Available' ? 'secondary' : 'default'}>{country.status}</Badge>
                                            </TableCell>
                                            <TableCell className="text-right space-x-2 flex items-center justify-end">
                                                <div className="flex items-center gap-2">
                                                    <Switch
                                                        checked={country.status === 'Assigned'}
                                                        onCheckedChange={() => handleStatusChange(country.id, country.status)}
                                                        aria-label={`Set ${country.name} to ${country.status === 'Available' ? 'Assigned' : 'Available'}`}
                                                    />
                                                </div>
                                                <Button variant="ghost" size="icon" onClick={() => handleDeleteCountry(country.id, country.name)}>
                                                    <Trash2 className="h-4 w-4 text-destructive" />
                                                </Button>
                                            </TableCell>
                                        </TableRow>
                                    )) : (
                                        <TableRow><TableCell colSpan={4} className="text-center">No countries added yet.</TableCell></TableRow>
                                    )}
                                </TableBody>
                            </Table>
                        </div>
                    </CardContent>
                </Card>
            </TabsContent>
            
            <TabsContent value="settings" className="mt-6 space-y-8">
                <div className="grid lg:grid-cols-2 gap-8 items-start">
                    <Card>
                        <CardHeader>
                            <CardTitle className="flex items-center gap-2"><Paintbrush className="w-6 h-6" /> Theme Customization</CardTitle>
                            <CardDescription>Change the look and feel of your website.</CardDescription>
                        </CardHeader>
                        <CardContent>
                            <Form {...themeForm}><form onSubmit={themeForm.handleSubmit(onThemeSubmit)} className="space-y-6">
                                <FormField control={themeForm.control} name="primaryColor" render={({ field }) => (<FormItem><FormLabel>Primary Color</FormLabel><FormControl><Input placeholder="e.g., 227 66% 32%" {...field} /></FormControl><FormDescription>Used for main buttons, links, and highlights.</FormDescription><FormMessage /></FormItem>)} />
                                <FormField control={themeForm.control} name="backgroundColor" render={({ field }) => (<FormItem><FormLabel>Background Color</FormLabel><FormControl><Input placeholder="e.g., 210 17% 98%" {...field} /></FormControl><FormDescription>The main background color for most pages.</FormDescription><FormMessage /></FormItem>)} />
                                <FormField control={themeForm.control} name="accentColor" render={({ field }) => (<FormItem><FormLabel>Accent Color</FormLabel><FormControl><Input placeholder="e.g., 47 96% 52%" {...field} /></FormControl><FormDescription>Used for call-to-action buttons and special highlights.</FormDescription><FormMessage /></FormItem>)} />
                                <Button type="submit" className="w-full">Save Theme</Button>
                            </form></Form>
                        </CardContent>
                    </Card>

                    <Card>
                        <CardHeader>
                            <CardTitle className="flex items-center gap-2"><Share2 className="w-6 h-6" /> Site-wide Settings</CardTitle>
                            <CardDescription>Manage social media links, footer text, and navigation visibility.</CardDescription>
                        </CardHeader>
                        <CardContent>
                            <Form {...siteConfigForm}>
                                <form onSubmit={siteConfigForm.handleSubmit(onSiteConfigSubmit)} className="space-y-6">
                                    <FormField
                                        control={siteConfigForm.control}
                                        name="conferenceDate"
                                        render={({ field }) => (
                                            <FormItem>
                                                <FormLabel className="flex items-center gap-2"><CalendarDays className="w-4 h-4" /> Conference Countdown Date</FormLabel>
                                                <FormControl>
                                                    <Input
                                                        placeholder="YYYY-MM-DDTHH:mm:ss"
                                                        {...field}
                                                    />
                                                </FormControl>
                                                <FormDescription>
                                                    The target date for the homepage countdown. Use format: YYYY-MM-DDTHH:mm:ss
                                                </FormDescription>
                                                <FormMessage />
                                            </FormItem>
                                        )}
                                    />
                                    <FormField control={siteConfigForm.control} name="twitter" render={({ field }) => (<FormItem><FormLabel>Twitter URL</FormLabel><FormControl><Input placeholder="https://twitter.com/harmun" {...field} /></FormControl><FormMessage /></FormItem>)} />
                                    <FormField control={siteConfigForm.control} name="instagram" render={({ field }) => (<FormItem><FormLabel>Instagram URL</FormLabel><FormControl><Input placeholder="https://instagram.com/harmun" {...field} /></FormControl><FormMessage /></FormItem>)} />
                                    <FormField control={siteConfigForm.control} name="facebook" render={({ field }) => (<FormItem><FormLabel>Facebook URL</FormLabel><FormControl><Input placeholder="https://facebook.com/harmun" {...field} /></FormControl><FormMessage /></FormItem>)} />
                                    <FormField control={siteConfigForm.control} name="footerText" render={({ field }) => (<FormItem><FormLabel>Footer Text</FormLabel><FormControl><Textarea {...field} rows={2} /></FormControl><FormMessage /></FormItem>)} />
                                    
                                    <div>
                                        <h3 className="text-md font-semibold pt-4 border-t mb-2">Navigation Visibility</h3>
                                        <p className="text-sm text-muted-foreground mb-4">Toggle which pages appear in the main navigation bar.</p>
                                        <div className="space-y-2">
                                            {navLinksForAdmin.map((link) => (
                                                <FormField
                                                    key={link.href}
                                                    control={siteConfigForm.control}
                                                    name={`navVisibility.${link.href}` as const}
                                                    render={({ field }) => (
                                                        <FormItem className="flex flex-row items-center justify-between rounded-lg border p-3">
                                                            <FormLabel>{link.label}</FormLabel>
                                                            <FormControl>
                                                                <Switch
                                                                    checked={field.value}
                                                                    onCheckedChange={field.onChange}
                                                                />
                                                            </FormControl>
                                                        </FormItem>
                                                    )}
                                                />
                                            ))}
                                        </div>
                                    </div>
                                    
                                    <Button type="submit" className="w-full">Save Settings</Button>
                                </form>
                            </Form>
                        </CardContent>
                    </Card>
                </div>
                 <Card>
                    <CardHeader>
                        <CardTitle className="flex items-center gap-2"><Download className="w-6 h-6" /> Import / Export CSV Data</CardTitle>
                        <CardDescription>Backup and restore your data using CSV files. You can edit these in any spreadsheet software.</CardDescription>
                    </CardHeader>
                    <CardContent className="grid md:grid-cols-2 gap-8">
                        
                        <div className="space-y-6 p-6 border rounded-lg">
                            <h3 className="font-semibold text-lg flex items-center gap-2"><Library /> Committee Data</h3>
                            <p className="text-sm text-muted-foreground">Export all committees to a CSV file or import a file to overwrite existing committee data.</p>
                            <Button onClick={handleCommitteeExport} className="w-full">
                                <FileSpreadsheet className="mr-2" />
                                Export Committees to CSV
                            </Button>
                            <div className="border-t pt-6">
                                <h4 className="font-semibold mb-2">Import Committees</h4>
                                <p className="text-sm text-muted-foreground mb-3">
                                    <strong className="text-destructive">Warning:</strong> This will replace all current committees.
                                </p>
                                <div className="flex flex-col sm:flex-row gap-2">
                                    <Input id="committeeImportFile" type="file" accept=".csv" onChange={handleFileChange(setCommitteeImportFile)} className="flex-grow"/>
                                    <Button onClick={handleCommitteeImport} disabled={!committeeImportFile || isImportingCommittees} className="sm:w-auto">
                                        <Upload className="mr-2" />
                                        {isImportingCommittees ? "Importing..." : "Import"}
                                    </Button>
                                </div>
                            </div>
                        </div>

                        <div className="space-y-6 p-6 border rounded-lg">
                            <h3 className="font-semibold text-lg flex items-center gap-2"><Globe /> Country Data</h3>
                            <p className="text-sm text-muted-foreground">Export the full country matrix to a CSV file or import a file to overwrite it.</p>
                            <Button onClick={handleCountryExport} className="w-full">
                                <FileSpreadsheet className="mr-2" />
                                Export Countries to CSV
                            </Button>
                            <div className="border-t pt-6">
                                <h4 className="font-semibold mb-2">Import Countries</h4>
                                <p className="text-sm text-muted-foreground mb-3">
                                    <strong className="text-destructive">Warning:</strong> This will replace all current countries.
                                </p>
                                <div className="flex flex-col sm:flex-row gap-2">
                                    <Input id="countryImportFile" type="file" accept=".csv" onChange={handleFileChange(setCountryImportFile)} className="flex-grow"/>
                                    <Button onClick={handleCountryImport} disabled={!countryImportFile || isImportingCountries} className="sm:w-auto">
                                        <Upload className="mr-2" />
                                        {isImportingCountries ? "Importing..." : "Import"}
                                    </Button>
                                </div>
                            </div>
                        </div>
                    </CardContent>
                </Card>
            </TabsContent>
        </Tabs>
    </div>
  );
}
