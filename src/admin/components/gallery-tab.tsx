
"use client";

import React, { useState, useEffect, useCallback } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { useToast } from "@/hooks/use-toast";
import { DndContext, closestCenter, type DragEndEvent, useSensor, PointerSensor, KeyboardSensor } from "@dnd-kit/core";
import { SortableContext, useSortable, verticalListSortingStrategy, sortableKeyboardCoordinates } from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";
import { arrayMove } from "@dnd-kit/sortable";

import { Button } from "@/components/ui/button";
import { Form, FormControl, FormDescription, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { PlusCircle, Trash2, GripVertical, GalleryHorizontal } from "lucide-react";
import * as firebaseService from "@/lib/firebase-service";
import type * as T from "@/lib/types";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Separator } from "@/components/ui/separator";

// Schemas
const galleryPageContentSchema = z.object({
    title: z.string().min(5, "Title is required."),
    subtitle: z.string().min(10, "Subtitle is required."),
});

const galleryItemSchema = z.object({
    title: z.string().min(3, "Title is required."),
    description: z.string().optional(),
    imageUrl: z.string().url("A valid image URL is required."),
    mediaType: z.enum(['image', 'video']).default('image'),
    aspectRatio: z.enum(['1:1', '16:9', '4:3', '3:4']).default('1:1'),
    width: z.enum(['single', 'double']).default('single'),
});

// Components
function GalleryItemForm({ item, onSave, onDelete }: { item: T.GalleryItem; onSave: (id: string, data: z.infer<typeof galleryItemSchema>) => void; onDelete: (id: string) => void; }) {
    const form = useForm<z.infer<typeof galleryItemSchema>>({ resolver: zodResolver(galleryItemSchema), defaultValues: item });
    React.useEffect(() => { form.reset(item); }, [item, form]);

    return (
        <Form {...form}>
            <form onSubmit={form.handleSubmit((data: z.infer<typeof galleryItemSchema>) => onSave(item.id, data))} className="p-4 border rounded-md space-y-4 flex-grow">
                 <FormField control={form.control} name="title" render={({ field }) => <FormItem><FormLabel>Title</FormLabel><FormControl><Input {...field} /></FormControl><FormMessage /></FormItem>} />
                <FormField control={form.control} name="imageUrl" render={({ field }) => <FormItem><FormLabel>Image URL</FormLabel><FormControl><Input {...field} /></FormControl><FormDescription>Provide a direct image link.</FormDescription><FormMessage /></FormItem>} />
                <FormField control={form.control} name="description" render={({ field }) => <FormItem><FormLabel>Description</FormLabel><FormControl><Textarea {...field} rows={2} /></FormControl><FormMessage /></FormItem>} />
                
                <Separator />
                
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4 pt-2">
                    <FormField control={form.control} name="mediaType" render={({ field }) => (
                        <FormItem><FormLabel>Media Type</FormLabel>
                        <Select onValueChange={field.onChange} defaultValue={field.value}>
                            <FormControl><SelectTrigger><SelectValue placeholder="Select..." /></SelectTrigger></FormControl>
                            <SelectContent><SelectItem value="image">Image</SelectItem><SelectItem value="video" disabled>Video (soon)</SelectItem></SelectContent>
                        </Select><FormMessage /></FormItem>
                    )} />
                    <FormField control={form.control} name="aspectRatio" render={({ field }) => (
                        <FormItem><FormLabel>Aspect Ratio</FormLabel>
                        <Select onValueChange={field.onChange} defaultValue={field.value}>
                            <FormControl><SelectTrigger><SelectValue placeholder="Select..." /></SelectTrigger></FormControl>
                            <SelectContent>
                                <SelectItem value="1:1">Square (1:1)</SelectItem>
                                <SelectItem value="16:9">Landscape (16:9)</SelectItem>
                                <SelectItem value="4:3">Standard (4:3)</SelectItem>
                                <SelectItem value="3:4">Portrait (3:4)</SelectItem>
                            </SelectContent>
                        </Select><FormMessage /></FormItem>
                    )} />
                    <FormField control={form.control} name="width" render={({ field }) => (
                        <FormItem><FormLabel>Column Width</FormLabel>
                        <Select onValueChange={field.onChange} defaultValue={field.value}>
                            <FormControl><SelectTrigger><SelectValue placeholder="Select..." /></SelectTrigger></FormControl>
                            <SelectContent><SelectItem value="single">Single</SelectItem><SelectItem value="double">Double</SelectItem></SelectContent>
                        </Select><FormMessage /></FormItem>
                    )} />
                </div>
                 <div className="flex justify-end gap-2 pt-4"><Button type="submit">Save</Button><Button type="button" variant="destructive" onClick={() => onDelete(item.id)}>Delete</Button></div>
            </form>
        </Form>
    );
}

function SortableGalleryItem({ item, onSave, onDelete }: { item: T.GalleryItem; onSave: (id: string, data: z.infer<typeof galleryItemSchema>) => void; onDelete: (id: string) => void; }) {
    const { attributes, listeners, setNodeRef, transform, transition } = useSortable({ id: item.id });
    const style = { transform: CSS.Transform.toString(transform), transition };
    return (
        <div ref={setNodeRef} style={style} className="flex items-start gap-2 mb-4 bg-card">
            <button {...attributes} {...listeners} className="p-2 mt-10 shrink-0 text-muted-foreground hover:text-foreground cursor-grab active:cursor-grabbing"><GripVertical /></button>
            <GalleryItemForm item={item} onSave={onSave} onDelete={onDelete} />
        </div>
    );
}


function AddGalleryItemForm({ onAdd }: { onAdd: (data: any, form: any) => Promise<void> }) {
    const form = useForm<z.infer<typeof galleryItemSchema>>({ 
        resolver: zodResolver(galleryItemSchema), 
        defaultValues: { title: "", imageUrl: "", description: "", mediaType: "image", aspectRatio: "1:1", width: "single" } 
    });

    return (
        <Card className="animate-fade-in-up" style={{ animationDelay: '300ms' }}><CardHeader><CardTitle>Add New Gallery Item</CardTitle></CardHeader>
        <CardContent>
            <Form {...form}><form onSubmit={form.handleSubmit((d) => onAdd(d, form))} className="space-y-4">
                 <FormField control={form.control} name="title" render={({ field }) => <FormItem><FormLabel>Title</FormLabel><FormControl><Input {...field} /></FormControl><FormMessage /></FormItem>} />
                 <FormField control={form.control} name="imageUrl" render={({ field }) => <FormItem><FormLabel>Image URL</FormLabel><FormControl><Input {...field} /></FormControl><FormDescription>Provide a direct image link.</FormDescription><FormMessage /></FormItem>} />
                 <FormField control={form.control} name="description" render={({ field }) => <FormItem><FormLabel>Description</FormLabel><FormControl><Textarea {...field} rows={3} /></FormControl><FormMessage /></FormItem>} />
                 
                <Separator />
                
                 <div className="grid grid-cols-1 md:grid-cols-3 gap-4 pt-2">
                    <FormField control={form.control} name="mediaType" render={({ field }) => (
                        <FormItem><FormLabel>Media Type</FormLabel>
                        <Select onValueChange={field.onChange} defaultValue={field.value}>
                            <FormControl><SelectTrigger><SelectValue placeholder="Select..." /></SelectTrigger></FormControl>
                            <SelectContent><SelectItem value="image">Image</SelectItem><SelectItem value="video" disabled>Video (soon)</SelectItem></SelectContent>
                        </Select><FormMessage /></FormItem>
                    )} />
                    <FormField control={form.control} name="aspectRatio" render={({ field }) => (
                        <FormItem><FormLabel>Aspect Ratio</FormLabel>
                        <Select onValueChange={field.onChange} defaultValue={field.value}>
                            <FormControl><SelectTrigger><SelectValue placeholder="Select..." /></SelectTrigger></FormControl>
                            <SelectContent>
                                <SelectItem value="1:1">Square (1:1)</SelectItem>
                                <SelectItem value="16:9">Landscape (16:9)</SelectItem>
                                <SelectItem value="4:3">Standard (4:3)</SelectItem>
                                <SelectItem value="3:4">Portrait (3:4)</SelectItem>
                            </SelectContent>
                        </Select><FormMessage /></FormItem>
                    )} />
                    <FormField control={form.control} name="width" render={({ field }) => (
                        <FormItem><FormLabel>Column Width</FormLabel>
                        <Select onValueChange={field.onChange} defaultValue={field.value}>
                            <FormControl><SelectTrigger><SelectValue placeholder="Select..." /></SelectTrigger></FormControl>
                            <SelectContent><SelectItem value="single">Single</SelectItem><SelectItem value="double">Double</SelectItem></SelectContent>
                        </Select><FormMessage /></FormItem>
                    )} />
                </div>
                <Button type="submit"><PlusCircle className="mr-2" />Add Item</Button>
            </form></Form>
        </CardContent></Card>
    );
}


export default function GalleryTab() {
    const { toast } = useToast();
    const [loading, setLoading] = useState(true);
    const [data, setData] = useState<{ content: T.GalleryPageContent | null; items: T.GalleryItem[] }>({ content: null, items: [] });
    
    const pageContentForm = useForm<z.infer<typeof galleryPageContentSchema>>({ resolver: zodResolver(galleryPageContentSchema) });
    
    const sensors = [useSensor(PointerSensor), useSensor(KeyboardSensor, { coordinateGetter: sortableKeyboardCoordinates })];

    const loadData = useCallback(async () => {
        setLoading(true);
        try {
            const [content, items] = await Promise.all([
                firebaseService.getGalleryPageContent(),
                firebaseService.getGalleryItems(),
            ]);
            setData({ content, items });
            if (content) {
                pageContentForm.reset(content);
            }
        } catch (error) {
            toast({ title: "Error", description: `Could not load gallery data.`, variant: "destructive" });
        } finally {
            setLoading(false);
        }
    }, [toast, pageContentForm]);

    useEffect(() => { loadData(); }, [loadData]);
    
    const handleAction = useCallback(async (action: Promise<any>, successMessage: string, formToReset?: any) => {
        try {
            await action;
            toast({ title: "Success!", description: successMessage });
            await loadData(); // Always reload data from the source of truth
            if (formToReset) {
                formToReset.reset();
            }
        } catch (error) {
            const errorMessage = error instanceof Error ? error.message : "An unknown error occurred.";
            toast({ title: "Error", description: `Action failed: ${errorMessage}`, variant: "destructive" });
        }
    }, [toast, loadData]);

    const handlePageContentSave = useCallback((formData: z.infer<typeof galleryPageContentSchema>) => {
        handleAction(firebaseService.updateGalleryPageContent(formData), "Gallery page content updated.");
    }, [handleAction]);

    const handleUpdateItem = useCallback((id: string, itemData: z.infer<typeof galleryItemSchema>) => {
        handleAction(firebaseService.updateGalleryItem(id, itemData), "Gallery item updated.");
    }, [handleAction]);

    const handleDeleteItem = useCallback((id: string) => {
        if (!confirm('Are you sure you want to delete this item?')) return;
        handleAction(firebaseService.deleteGalleryItem(id), "Gallery item deleted.");
    }, [handleAction]);

    const handleAddItem = useCallback((addData: any, form: any) => {
        handleAction(firebaseService.addGalleryItem(addData), "Gallery item added!", form);
    }, [handleAction]);
    
    const handleDragEnd = async (event: DragEndEvent) => {
        const { active, over } = event;
        if (over && active.id !== over.id) {
            const oldItems = data.items;
            const oldIndex = oldItems.findIndex((item) => item.id === active.id);
            const newIndex = oldItems.findIndex((item) => item.id === over.id);
            const newItems = arrayMove(oldItems, oldIndex, newIndex);
            
            // Optimistically update UI
            setData(prev => ({...prev, items: newItems}));

            try {
                await firebaseService.updateGalleryItemsOrder(newItems);
                toast({title: "Success", description: "Gallery order updated."});
            } catch (error) {
                toast({title: "Error", description: "Failed to update order.", variant: "destructive"});
                setData(prev => ({...prev, items: oldItems})); // Revert on failure
            }
        }
    };
    
    if (loading) return <div className="space-y-4"><Skeleton className="h-48 w-full" /><Skeleton className="h-64 w-full" /></div>;

    return (
        <div className="space-y-6">
            <Card className="animate-fade-in-up">
                <CardHeader>
                     <div className="flex items-start gap-4">
                        <GalleryHorizontal className="h-8 w-8 text-muted-foreground" />
                        <div>
                            <CardTitle>Gallery Page Management</CardTitle>
                            <CardDescription>Manage the main title and gallery items for your public gallery page.</CardDescription>
                        </div>
                    </div>
                </CardHeader>
                <CardContent>
                    <Form {...pageContentForm}>
                        <form onSubmit={pageContentForm.handleSubmit(handlePageContentSave)} className="space-y-4">
                            <FormField control={pageContentForm.control} name="title" render={({ field }) => <FormItem><FormLabel>Title</FormLabel><FormControl><Input {...field} /></FormControl><FormMessage /></FormItem>} />
                            <FormField control={pageContentForm.control} name="subtitle" render={({ field }) => <FormItem><FormLabel>Subtitle</FormLabel><FormControl><Textarea {...field} /></FormControl><FormMessage /></FormItem>} />
                            <Button type="submit">Save Content</Button>
                        </form>
                    </Form>
                </CardContent>
            </Card>

            <div className="grid md:grid-cols-5 gap-8">
                <div className="md:col-span-2">
                     <AddGalleryItemForm onAdd={handleAddItem} />
                </div>
                 <div className="md:col-span-3">
                    <Card className="animate-fade-in-up" style={{ animationDelay: '300ms' }}>
                        <CardHeader><CardTitle>Manage Gallery Items</CardTitle><CardDescription>Drag to reorder items.</CardDescription></CardHeader>
                        <CardContent className="max-h-[40rem] overflow-y-auto pr-2">
                            <DndContext sensors={sensors} collisionDetection={closestCenter} onDragEnd={handleDragEnd}>
                                <SortableContext items={data.items.map(i => i.id)} strategy={verticalListSortingStrategy}>
                                    {data.items.map((item) => (
                                        <SortableGalleryItem key={item.id} item={item} onSave={handleUpdateItem} onDelete={handleDeleteItem} />
                                    ))}
                                </SortableContext>
                            </DndContext>
                        </CardContent>
                    </Card>
                </div>
            </div>
        </div>
    );
}
