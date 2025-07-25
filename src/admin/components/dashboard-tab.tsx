
"use client";

import React, { useState, useEffect, useCallback } from "react";
import { useForm } from "react-hook-form";

import { Button } from "@/components/ui/button";
import { Form, FormControl, FormField, FormItem, FormLabel } from "@/components/ui/form";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { PlusCircle, Globe, Library, Newspaper, Trash2 } from "lucide-react";
import * as firebaseService from "@/lib/firebase-service";
import type * as T from "@/lib/types";
import { useToast } from "@/hooks/use-toast";
import { Skeleton } from "@/components/ui/skeleton";

function CreatePostForm({ onAdd }: { onAdd: (data: any, form: any) => Promise<void> }) {
    const form = useForm({ defaultValues: { title: '', content: '', type: undefined } });
    return <Form {...form}><form onSubmit={form.handleSubmit(async (d) => { await onAdd(d, form); })} className="space-y-4 mb-6">
        <FormField control={form.control} name="title" rules={{required: true}} render={({ field }) => (<FormItem><FormLabel>Title</FormLabel><FormControl><Input {...field} /></FormControl></FormItem>)} />
        <FormField control={form.control} name="type" rules={{required: true}} render={({ field }) => ( <FormItem><FormLabel>Type</FormLabel><Select onValueChange={field.onChange}><FormControl><SelectTrigger><SelectValue placeholder="Select type" /></SelectTrigger></FormControl><SelectContent><SelectItem value="news">News</SelectItem><SelectItem value="sg-note">SG Note</SelectItem></SelectContent></Select></FormItem> )} />
        <FormField control={form.control} name="content" rules={{required: true}} render={({ field }) => (<FormItem><FormLabel>Content</FormLabel><FormControl><Textarea {...field} rows={5} /></FormControl></FormItem>)} />
        <Button type="submit" className="w-full"><PlusCircle className="mr-2"/>Publish Post</Button>
    </form></Form>;
}

export default function DashboardTab() {
    const { toast } = useToast();
    const [loading, setLoading] = useState(true);
    const [data, setData] = useState<{ posts: T.Post[], countries: T.Country[], committees: T.Committee[] }>({
        posts: [],
        countries: [],
        committees: [],
    });

     const loadData = useCallback(async () => {
        setLoading(true);
        try {
            const [posts, countries, committees] = await Promise.all([
                firebaseService.getAllPosts(),
                firebaseService.getCountries(),
                firebaseService.getCommittees(),
            ]);
            setData({ posts, countries, committees });
        } catch (error) {
            console.error("Failed to fetch dashboard data:", error);
            toast({ title: "Error", description: `Could not load dashboard data.`, variant: "destructive" });
        } finally {
            setLoading(false);
        }
    }, [toast]);

    useEffect(() => { loadData(); }, [loadData]);
    
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
        return (
            <div className="space-y-6">
                <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
                    <Skeleton className="h-28" />
                    <Skeleton className="h-28" />
                    <Skeleton className="h-28" />
                </div>
                <Skeleton className="h-96 mt-6" />
            </div>
        );
    }
    
    return (
        <div className="space-y-6">
            <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
                <Card className="animate-fade-in-up"><CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2"><CardTitle className="text-sm font-medium">Published Posts</CardTitle><Newspaper className="h-4 w-4 text-muted-foreground" /></CardHeader><CardContent><div className="text-2xl font-bold">{data.posts?.length || 0}</div><p className="text-xs text-muted-foreground">News & SG Notes</p></CardContent></Card>
                <Card className="animate-fade-in-up" style={{animationDelay: '150ms'}}><CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2"><CardTitle className="text-sm font-medium">Countries</CardTitle><Globe className="h-4 w-4 text-muted-foreground" /></CardHeader><CardContent><div className="text-2xl font-bold">{data.countries?.length || 0}</div><p className="text-xs text-muted-foreground">Registered in matrix</p></CardContent></Card>
                <Card className="animate-fade-in-up" style={{animationDelay: '300ms'}}><CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2"><CardTitle className="text-sm font-medium">Committees</CardTitle><Library className="h-4 w-4 text-muted-foreground" /></CardHeader><CardContent><div className="text-2xl font-bold">{data.committees?.length || 0}</div><p className="text-xs text-muted-foreground">Available for registration</p></CardContent></Card>
            </div>
            <Card className="animate-fade-in-up" style={{animationDelay: '450ms'}}>
                <CardHeader><CardTitle>Create & Manage Posts</CardTitle><CardDescription>Publish news articles or notes from the Secretary-General.</CardDescription></CardHeader>
                <CardContent>
                    <div className="grid md:grid-cols-5 gap-8">
                        <div className="md:col-span-2">
                             <CreatePostForm onAdd={(postData, form) => handleAction(firebaseService.addPost(postData), "Post created!", form)} />
                        </div>
                        <div className="md:col-span-3">
                            <h3 className="text-lg font-semibold mb-4">Published Posts</h3>
                            <div className="border rounded-md max-h-96 overflow-y-auto">
                                <Table>
                                    <TableHeader><TableRow><TableHead>Title</TableHead><TableHead>Type</TableHead><TableHead>Date</TableHead><TableHead className="text-right">Action</TableHead></TableRow></TableHeader>
                                    <TableBody>
                                        {data.posts?.map((post: T.Post) => (
                                            <TableRow key={post.id}>
                                                <TableCell className="font-medium">{post.title}</TableCell>
                                                <TableCell><span className="capitalize">{post.type}</span></TableCell>
                                                <TableCell>{firebaseService.formatTimestamp(post.createdAt)}</TableCell>
                                                <TableCell className="text-right"><Button variant="ghost" size="icon" onClick={() => handleDeleteItem(firebaseService.deletePost, post.id, "post")}> <Trash2 className="h-4 w-4 text-destructive" /></Button></TableCell>
                                            </TableRow>
                                        ))}
                                    </TableBody>
                                </Table>
                            </div>
                        </div>
                    </div>
                </CardContent>
            </Card>
        </div>
    );
}
