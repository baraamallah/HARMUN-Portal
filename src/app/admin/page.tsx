"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import * as z from "zod";
import React, { useEffect, useState } from "react";

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
import { Paintbrush, Type, PlusCircle, Newspaper, Users, FileText, Library, Image as ImageIcon, Globe, Trash2 } from "lucide-react";
import { getTheme, updateTheme, getHomePageContent, updateHomePageContent, addPost, getAllPosts, formatTimestamp, getCountries, addCountry, updateCountryStatus, deleteCountry } from "@/lib/firebase-service";
import { Skeleton } from "@/components/ui/skeleton";
import type { Post, Country } from "@/lib/types";
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

const postFormSchema = z.object({
    title: z.string().min(5, "Title must be at least 5 characters long."),
    content: z.string().min(20, "Content must be at least 20 characters long."),
    type: z.enum(['sg-note', 'news'], { required_error: "You must select a post type." }),
});

const countryMatrixFormSchema = z.object({
    name: z.string().min(2, "Country name is required."),
    committee: z.string({ required_error: "Please select a committee." }),
});

const committeesList = ['Security Council (SC)', 'World Health Organization (WHO)', 'Human Rights Council (HRC)', 'United Nations Environment Programme (UNEP)'];

export default function AdminPage() {
  const { toast } = useToast();
  const [loading, setLoading] = useState(true);
  const [posts, setPosts] = useState<Post[]>([]);
  const [countries, setCountries] = useState<Country[]>([]);

  const themeForm = useForm<z.infer<typeof themeFormSchema>>({ resolver: zodResolver(themeFormSchema) });
  const contentForm = useForm<z.infer<typeof contentFormSchema>>({ resolver: zodResolver(contentFormSchema) });
  const postForm = useForm<z.infer<typeof postFormSchema>>({
    resolver: zodResolver(postFormSchema),
    defaultValues: { title: "", content: "" },
  });
  const countryMatrixForm = useForm<z.infer<typeof countryMatrixFormSchema>>({
    resolver: zodResolver(countryMatrixFormSchema),
    defaultValues: { name: "" },
  });

  const fetchAdminData = React.useCallback(async () => {
    try {
        setLoading(true);
        const [theme, content, allPosts, allCountries] = await Promise.all([
            getTheme(),
            getHomePageContent(),
            getAllPosts(),
            getCountries(),
        ]);
        themeForm.reset(theme);
        contentForm.reset(content);
        setPosts(allPosts);
        setCountries(allCountries);
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
  }, [toast, themeForm, contentForm]);

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
      await updateHomePageContent(values);
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
        countryMatrixForm.reset();
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

        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
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
        </div>

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
        </div>

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
                                    <SelectContent>{committeesList.map(c => <SelectItem key={c} value={c}>{c}</SelectItem>)}</SelectContent>
                                </Select>
                                <FormMessage />
                            </FormItem>
                        )} />
                        <Button type="submit" className="w-full sm:w-auto"><PlusCircle className="mr-2 h-4 w-4" /> Add Country</Button>
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

        <Card className="lg:col-span-2">
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
    </div>
  );
}
