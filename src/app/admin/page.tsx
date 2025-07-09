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
import { Paintbrush, Type, PlusCircle, Newspaper } from "lucide-react";
import { getTheme, updateTheme, getHomePageContent, updateHomePageContent, addPost, getAllPosts, formatTimestamp } from "@/lib/firebase-service";
import { Skeleton } from "@/components/ui/skeleton";
import type { Post } from "@/lib/types";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";

const themeFormSchema = z.object({
  primaryColor: z.string().regex(/^(\d{1,3})\s(\d{1,3})%\s(\d{1,3})%$/, "Must be a valid HSL string (e.g., 227 66% 32%)"),
  backgroundColor: z.string().regex(/^(\d{1,3})\s(\d{1,3})%\s(\d{1,3})%$/, "Must be a valid HSL string (e.g., 210 17% 98%)"),
  accentColor: z.string().regex(/^(\d{1,3})\s(\d{1,3})%\s(\d{1,3})%$/, "Must be a valid HSL string (e.g., 47 96% 52%)"),
});

const contentFormSchema = z.object({
    heroTitle: z.string().min(5, "Title must be at least 5 characters."),
    heroSubtitle: z.string().min(10, "Subtitle must be at least 10 characters."),
});

const postFormSchema = z.object({
    title: z.string().min(5, "Title must be at least 5 characters long."),
    content: z.string().min(20, "Content must be at least 20 characters long."),
    type: z.enum(['sg-note', 'news'], { required_error: "You must select a post type." }),
});

export default function AdminPage() {
  const { toast } = useToast();
  const [loading, setLoading] = useState(true);
  const [posts, setPosts] = useState<Post[]>([]);

  const themeForm = useForm<z.infer<typeof themeFormSchema>>({ resolver: zodResolver(themeFormSchema) });
  const contentForm = useForm<z.infer<typeof contentFormSchema>>({ resolver: zodResolver(contentFormSchema) });
  const postForm = useForm<z.infer<typeof postFormSchema>>({
    resolver: zodResolver(postFormSchema),
    defaultValues: { title: "", content: "" },
  });

  const fetchPosts = React.useCallback(async () => {
    try {
        const allPosts = await getAllPosts();
        setPosts(allPosts);
    } catch (error) {
        console.error("Failed to fetch posts:", error);
        toast({ title: "Error", description: "Could not load posts.", variant: "destructive" });
    }
  }, [toast]);

  useEffect(() => {
    async function fetchData() {
      try {
        const [theme, content] = await Promise.all([
          getTheme(),
          getHomePageContent(),
          fetchPosts(),
        ]);
        themeForm.reset(theme);
        contentForm.reset(content);
      } catch (error) {
        console.error("Failed to fetch admin data:", error);
        toast({
          title: "Error",
          description: "Could not load settings from the database.",
          variant: "destructive",
        });
      } finally {
        setLoading(false);
      }
    }
    fetchData();
  }, [themeForm, contentForm, toast, fetchPosts]);

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
        await fetchPosts(); // Refresh the list of posts
    } catch (error) {
        toast({
            title: "Error Creating Post",
            description: "Could not save the post to the database.",
            variant: "destructive",
        });
    }
  }
  
  if (loading) {
    return (
      <div className="space-y-8">
        {/* Loading skeletons... */}
      </div>
    )
  }

  return (
    <div className="space-y-8">
        <div className="text-left">
            <h1 className="text-3xl font-bold">Admin Dashboard</h1>
            <p className="text-muted-foreground">Manage your conference website content and settings here.</p>
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
                    <CardDescription>Edit the main text on your home page hero section.</CardDescription>
                </CardHeader>
                <CardContent>
                    <Form {...contentForm}><form onSubmit={contentForm.handleSubmit(onContentSubmit)} className="space-y-6">
                        <FormField control={contentForm.control} name="heroTitle" render={({ field }) => (<FormItem><FormLabel>Hero Title</FormLabel><FormControl><Input {...field} /></FormControl><FormMessage /></FormItem>)} />
                        <FormField control={contentForm.control} name="heroSubtitle" render={({ field }) => (<FormItem><FormLabel>Hero Subtitle</FormLabel><FormControl><Textarea {...field} rows={4} /></FormControl><FormMessage /></FormItem>)} />
                        <Button type="submit" className="w-full">Save Content</Button>
                    </form></Form>
                </CardContent>
            </Card>
        </div>

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
