
"use client";

import React, { useState, useEffect } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { useToast } from "@/hooks/use-toast";
import { DndContext, closestCenter, type DragEndEvent, useSensor, PointerSensor, KeyboardSensor } from "@dnd-kit/core";
import { SortableContext, useSortable, verticalListSortingStrategy, sortableKeyboardCoordinates } from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";

import { Button } from "@/components/ui/button";
import { Form, FormControl, FormDescription, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { PlusCircle, Trash2, GripVertical, GalleryHorizontal } from "lucide-react";
import * as firebaseService from "@/lib/firebase-service";
import type * as T from "@/lib/types";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";

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
                
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
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
                                <SelectItem value="1:1">Square</SelectItem>
                                <SelectItem value="16:9">Landscape</SelectItem>
                                <SelectItem value="4:3">Standard</SelectItem>
                                <SelectItem value="3:4">Portrait</SelectItem>
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
                 <div className="flex justify-end gap-2"><Button type="submit">Save</Button><Button type="button" variant="destructive" onClick={() => onDelete(item.id)}>Delete</Button></div>
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
        <Card><CardHeader><CardTitle>Add New Gallery Item</CardTitle></CardHeader>
        <CardContent>
            <Form {...form}><form onSubmit={form.handleSubmit((d) => onAdd(d, form))} className="space-y-4">
                 <FormField control={form.control} name="title" render={({ field }) => <FormItem><FormLabel>Title</FormLabel><FormControl><Input {...field} /></FormControl><FormMessage /></FormItem>} />
                 <FormField control={form.control} name="imageUrl" render={({ field }) => <FormItem><FormLabel>Image URL</FormLabel><FormControl><Input {...field} /></FormControl><FormDescription>Provide a direct image link.</FormDescription><FormMessage /></FormItem>} />
                 <FormField control={form.control} name="description" render={({ field }) => <FormItem><FormLabel>Description</FormLabel><FormControl><Textarea {...field} rows={3} /></FormControl><FormMessage /></FormItem>} />
                 <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <FormField control={form.control} name="aspectRatio" render={({ field }) => (
                        <FormItem><FormLabel>Aspect Ratio</FormLabel>
                        <Select onValueChange={field.onChange} defaultValue={field.value}>
                            <FormControl><SelectTrigger><SelectValue placeholder="Select..." /></SelectTrigger></FormControl>
                            <SelectContent><SelectItem value="1:1">Square</SelectItem><SelectItem value="16:9">Landscape</SelectItem><SelectItem value="4:3">Standard</SelectItem><SelectItem value="3:4">Portrait</SelectItem></SelectContent>
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


    const loadData = React.useCallback(async () => {
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
    
    const handlePageContentSave = async (formData: z.infer<typeof galleryPageContentSchema>) => {
        try {
            await firebaseService.updateGalleryPageContent(formData);
            setData(prev => ({ ...prev, content: { ...prev.content, ...formData } as T.GalleryPageContent }));
            toast({ title: "Success!", description: "Gallery page content updated." });
        } catch (error) { toast({ title: "Error", description: `Could not save data. ${error instanceof Error ? error.message : ''}`, variant: "destructive" }); }
    };
    
    const handleUpdateItem = async (id: string, itemData: z.infer<typeof galleryItemSchema>) => {
        try {
            await firebaseService.updateGalleryItem(id, itemData);
            setData(p => ({ ...p, items: p.items.map(i => i.id === id ? {...i, ...itemData} : i) }));
            toast({ title: "Success!", description: "Item updated." });
        } catch (error) { toast({ title: "Error", description: `Could not save item. ${error instanceof Error ? error.message : ''}`, variant: "destructive" }); }
    };

    const handleDeleteItem = async (id: string) => {
        if (!confirm('Are you sure you want to delete this item?')) return;
        try {
            await firebaseService.deleteGalleryItem(id);
            setData(prev => ({ ...prev, items: prev.items.filter(item => item.id !== id) }));
            toast({ title: "Success!", description: "Item deleted." });
        } catch (error) { toast({ title: "Error", description: `Could not delete item. ${error instanceof Error ? error.message : ''}`, variant: "destructive" }); }
    };
    
    const handleAddItem = async (addData: any, form: any) => {
        try {
            const newId = await firebaseService.addGalleryItem(addData);
            const newItem = await firebaseService.getDocById('gallery', newId);
            setData(prev => ({ ...prev, items: [...prev.items, newItem] }));
            toast({ title: "Success!", description: "Item added!" });
            if (form) form.reset();
        } catch (error) { toast({ title: "Error", description: `Could not add item. ${error instanceof Error ? error.message : ''}`, variant: "destructive" }); }
    };
    
    const handleDragEnd = async (event: DragEndEvent) => {
        const { active, over } = event;
        if (over && active.id !== over.id) {
            const oldIndex = data.items.findIndex((item) => item.id === active.id);
            const newIndex = data.items.findIndex((item) => item.id === over.id);
            
            const newItems = Array.from(data.items);
            const [movedItem] = newItems.splice(oldIndex, 1);
            newItems.splice(newIndex, 0, movedItem);
            
            const originalItems = data.items;
            setData(prev => ({...prev, items: newItems}));

            try {
                await firebaseService.updateGalleryItemsOrder(newItems);
                toast({title: "Success", description: "Gallery order updated."});
            } catch (error) {
                toast({title: "Error", description: "Failed to update order.", variant: "destructive"});
                // Revert UI on failure
                setData(prev => ({...prev, items: originalItems}));
            }
        }
    };
    
    if (loading) return <div className="space-y-4"><Skeleton className="h-48 w-full" /><Skeleton className="h-64 w-full" /></div>;

    return (
        <div className="space-y-6">
            <h2 className="text-2xl font-bold flex items-center gap-2"><GalleryHorizontal /> Gallery Page Management</h2>
            <Card>
                <CardHeader><CardTitle>Gallery Page Content</CardTitle></CardHeader>
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

            <Card>
                <CardHeader><CardTitle>Manage Gallery Items</CardTitle></CardHeader>
                <CardContent>
                    <DndContext sensors={sensors} collisionDetection={closestCenter} onDragEnd={handleDragEnd}>
                        <SortableContext items={data.items.map(i => i.id)} strategy={verticalListSortingStrategy}>
                            {data.items.map((item) => (
                                <SortableGalleryItem key={item.id} item={item} onSave={handleUpdateItem} onDelete={handleDeleteItem} />
                            ))}
                        </SortableContext>
                    </DndContext>
                </CardContent>
            </Card>
            
            <AddGalleryItemForm onAdd={handleAddItem} />
        </div>
    );
}
