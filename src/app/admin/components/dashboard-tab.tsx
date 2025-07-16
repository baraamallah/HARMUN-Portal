
"use client";

import React, { useState, useEffect } from "react";
import { useForm } from "react-hook-form";

import { Button } from "@/components/ui/button";
import { Form, FormControl, FormField, FormItem, FormLabel } from "@/components/ui/form";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { PlusCircle, FileText, Globe, Library, Newspaper, Trash2 } from "lucide-react";
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

    useEffect(() => {
        const fetchData = async () => {
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
        };
        fetchData();
    }, [toast]);
    
    const handleAddItem = async (addFunction: Function, itemData: any, stateKey: keyof typeof data, message: string, form?: any) => {
        try {
            const newId = await addFunction(itemData);
            const newItem = await firebaseService.getDocById(stateKey as string, newId);
            setData(prev => ({ ...prev, [stateKey]: [newItem, ...prev[stateKey] as any[]] }));
            toast({ title: "Success!", description: message });
            if (form) form.reset();
        } catch (error) {
            toast({ title: "Error", description: `Could not add item. ${error instanceof Error ? error.message : ''}`, variant: "destructive" });
        }
    };
    
    const handleDeleteItem = async (deleteFunction: Function, id: string, stateKey: keyof typeof data, message: string) => {
        if (!confirm('Are you sure you want to delete this item?')) return;
        try {
            await deleteFunction(id);
            setData(prev => ({ ...prev, [stateKey]: (prev[stateKey] as any[]).filter((item: {id: string}) => item.id !== id) }));
            toast({ title: "Success!", description: message });
        } catch (error) {
            toast({ title: "Error", description: `Could not delete item. ${error instanceof Error ? error.message : ''}`, variant: "destructive" });
        }
    };
    
    if (loading) {
        return (
            <>
                <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
                    <Skeleton className="h-24" />
                    <Skeleton className="h-24" />
                    <Skeleton className="h-24" />
                </div>
                <Skeleton className="h-96 mt-6" />
            </>
        );
    }
    
    return (
        <>
            <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
                <Card><CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2"><CardTitle className="text-sm font-medium">Published Posts</CardTitle><FileText className="h-4 w-4 text-muted-foreground" /></CardHeader><CardContent><div className="text-2xl font-bold">{data.posts?.length || 0}</div></CardContent></Card>
                <Card><CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2"><CardTitle className="text-sm font-medium">Countries</CardTitle><Globe className="h-4 w-4 text-muted-foreground" /></CardHeader><CardContent><div className="text-2xl font-bold">{data.countries?.length || 0}</div></CardContent></Card>
                <Card><CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2"><CardTitle className="text-sm font-medium">Committees</CardTitle><Library className="h-4 w-4 text-muted-foreground" /></CardHeader><CardContent><div className="text-2xl font-bold">{data.committees?.length || 0}</div></CardContent></Card>
            </div>
            <Card className="mt-6">
                <CardHeader><CardTitle className="flex items-center gap-2"><Newspaper /> Create & Manage Posts</CardTitle></CardHeader>
                <CardContent>
                    <CreatePostForm onAdd={(postData, form) => handleAddItem(firebaseService.addPost, postData, "posts", "Post created!", form)} />
                    <h3 className="text-lg font-semibold mb-4">Published Posts</h3>
                    <div className="border rounded-md max-h-96 overflow-y-auto">
                        <Table>
                            <TableHeader><TableRow><TableHead>Title</TableHead><TableHead>Type</TableHead><TableHead>Date</TableHead><TableHead className="text-right">Action</TableHead></TableRow></TableHeader>
                            <TableBody>
                                {data.posts?.map((post: T.Post) => (
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
        </>
    );
}
