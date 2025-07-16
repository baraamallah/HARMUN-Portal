
"use client";

import React, { useState, useEffect } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import {
  DndContext,
  closestCenter,
  PointerSensor,
  useSensor,
  useSensors,
  type DragEndEvent,
} from '@dnd-kit/core';
import {
  arrayMove,
  SortableContext,
  useSortable,
  verticalListSortingStrategy,
} from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';
import { Button } from "@/components/ui/button";
import { Form, FormControl, FormDescription, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion";
import { FileText, GalleryHorizontal, GripVertical } from "lucide-react";
import * as firebaseService from "@/lib/firebase-service";
import type * as T from "@/lib/types";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { useToast } from "@/hooks/use-toast";
import { Skeleton } from "@/components/ui/skeleton";

const galleryPageContentSchema = z.object({ title: z.string().min(5), subtitle: z.string().min(10) });

const galleryItemSchema = z.object({
    title: z.string().min(2, "Title is required."),
    type: z.enum(["image", "video"], { required_error: "Please select a media type." }),
    display: z.enum(['16:9', '4:3', '1:1', '3:4', '9:16', '2:3', 'circle'], { required_error: "Please select a display style." }),
    columnSpan: z.enum(['1', '2'], { required_error: "Please select a width." }),
    imageUrl: z.string().url("Must be a valid URL.").optional().or(z.literal("")).or(z.literal(null)),
    videoUrl: z.string().url("Must be a valid URL.").optional().or(z.literal("")).or(z.literal(null)),
}).refine(data => data.type === 'image' ? !!data.imageUrl : !!data.videoUrl, {
    message: "A URL for the selected media type is required.",
    path: ["imageUrl"], // Show error on one of the fields
});


function SortableGalleryItem({ item, onSave, onDelete }: { item: T.GalleryItem; onSave: (id: string, data: z.infer<typeof galleryItemSchema>, form: any) => void; onDelete: (id: string) => void }) {
    const { attributes, listeners, setNodeRef, transform, transition } = useSortable({ id: item.id });
    const style = {
        transform: CSS.Transform.toString(transform),
        transition,
    };
    
    return (
        <div ref={setNodeRef} style={style} className="flex items-start gap-2 mb-2">
            <Button variant="ghost" size="icon" {...attributes} {...listeners} className="cursor-grab active:cursor-grabbing mt-8">
                <GripVertical />
            </Button>
            <div className="flex-grow">
              <GalleryItemForm item={item} onSave={onSave} onDelete={onDelete} />
            </div>
        </div>
    );
}


function GalleryItemForm({ item, onSave, onDelete }: { item: T.GalleryItem; onSave: (id: string, data: any, form: any) => void; onDelete: (id: string) => void }) {
    const form = useForm({
        resolver: zodResolver(galleryItemSchema),
        defaultValues: { ...item, columnSpan: String(item.columnSpan || 1) as '1' | '2' },
    });
    const itemType = form.watch("type");
    React.useEffect(() => { form.reset({ ...item, columnSpan: String(item.columnSpan || 1) as '1' | '2' }); }, [item, form]);

    return (
        <Form {...form}>
            <form onSubmit={form.handleSubmit((data) => onSave(item.id, data, form))} className="p-4 border rounded-md space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                     <FormField control={form.control} name="title" render={({ field }) => <FormItem className="lg:col-span-4"><FormLabel>Title</FormLabel><FormControl><Input {...field} /></FormControl><FormMessage /></FormItem>} />
                    <FormField control={form.control} name="type" render={({ field }) => (
                        <FormItem>
                            <FormLabel>Media Type</FormLabel>
                            <Select onValueChange={field.onChange} value={field.value}>
                                <FormControl><SelectTrigger><SelectValue placeholder="Select type..." /></SelectTrigger></FormControl>
                                <SelectContent>
                                    <SelectItem value="image">Image</SelectItem>
                                    <SelectItem value="video">Video</SelectItem>
                                </SelectContent>
                            </Select>
                            <FormMessage />
                        </FormItem>
                    )} />
                     <FormField control={form.control} name="display" render={({ field }) => (
                        <FormItem>
                            <FormLabel>Aspect Ratio</FormLabel>
                            <Select onValueChange={field.onChange} value={field.value}>
                                <FormControl><SelectTrigger><SelectValue placeholder="Select ratio..." /></SelectTrigger></FormControl>
                                <SelectContent>
                                    <SelectItem value="16:9">16:9 (Landscape)</SelectItem>
                                    <SelectItem value="4:3">4:3 (Standard)</SelectItem>
                                    <SelectItem value="1:1">1:1 (Square)</SelectItem>
                                    <SelectItem value="3:4">3:4 (Portrait)</SelectItem>
                                    <SelectItem value="9:16">9:16 (Tall)</SelectItem>
                                    <SelectItem value="2:3">2:3 (Classic Portrait)</SelectItem>
                                    <SelectItem value="circle">Circle</SelectItem>
                                </SelectContent>
                            </Select>
                            <FormMessage />
                        </FormItem>
                    )} />
                    <FormField control={form.control} name="columnSpan" render={({ field }) => (
                        <FormItem>
                            <FormLabel>Width</FormLabel>
                            <Select onValueChange={field.onChange} value={String(field.value)}>
                                <FormControl><SelectTrigger><SelectValue placeholder="Select width..." /></SelectTrigger></FormControl>
                                <SelectContent>
                                    <SelectItem value="1">Single Column</SelectItem>
                                    <SelectItem value="2">Double Column</SelectItem>
                                </SelectContent>
                            </Select>
                            <FormMessage />
                        </FormItem>
                    )} />
                </div>
                 {itemType === 'image' && (
                    <FormField control={form.control} name="imageUrl" render={({ field }) => (
                        <FormItem>
                            <FormLabel>Image URL</FormLabel>
                            <FormControl><Input {...field} value={field.value || ''} /></FormControl>
                            <FormDescription>Provide a direct image link.</FormDescription>
                            <FormMessage />
                        </FormItem>
                    )}
                 />
                )}
                 {itemType === 'video' && (
                    <FormField control={form.control} name="videoUrl" render={({ field }) => (
                        <FormItem>
                            <FormLabel>Video URL</FormLabel>
                            <FormControl><Input {...field} value={field.value || ''} /></FormControl>
                             <FormDescription>Provide a direct video link.</FormDescription>
                            <FormMessage />
                        </FormItem>
                    )}
                )}

                <div className="flex gap-2 justify-end"><Button type="submit" size="sm">Save</Button><Button size="sm" variant="destructive" type="button" onClick={() => onDelete(item.id)}>Delete</Button></div>
            </form>
        </Form>
    );
}

function AddGalleryItemForm({ onAdd }: { onAdd: (data: any, form: any) => Promise<void> }) {
    const form = useForm<z.infer<typeof galleryItemSchema>>({ 
        resolver: zodResolver(galleryItemSchema), 
        defaultValues: { title: '', imageUrl: '', videoUrl: '', type: 'image', display: '4:3', columnSpan: '1' } 
    });
    const itemType = form.watch("type");

    return <Form {...form}><form onSubmit={form.handleSubmit((d) => onAdd(d, form))} className="space-y-4 p-4 border-t mt-4">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 items-end">
            <FormField control={form.control} name="title" render={({ field }) => <FormItem className="lg:col-span-4"><FormLabel>Title</FormLabel><FormControl><Input {...field} /></FormControl><FormMessage /></FormItem>} />
            <FormField control={form.control} name="type" render={({ field }) => (
                <FormItem>
                    <FormLabel>Media Type</FormLabel>
                    <Select onValueChange={(value) => {
                        field.onChange(value);
                        form.setValue('imageUrl', '');
                        form.setValue('videoUrl', '');
                    }} value={field.value}>
                        <FormControl><SelectTrigger><SelectValue placeholder="Select type..." /></SelectTrigger></FormControl>
                        <SelectContent>
                            <SelectItem value="image">Image</SelectItem>
                            <SelectItem value="video">Video</SelectItem>
                        </SelectContent>
                    </Select>
                    <FormMessage />
                </FormItem>
            )} />
             <FormField control={form.control} name="display" render={({ field }) => (
                <FormItem>
                    <FormLabel>Aspect Ratio</FormLabel>
                    <Select onValueChange={field.onChange} value={field.value}>
                        <FormControl><SelectTrigger><SelectValue placeholder="Select ratio..." /></SelectTrigger></FormControl>
                        <SelectContent>
                            <SelectItem value="16:9">16:9 (Landscape)</SelectItem>
                            <SelectItem value="4:3">4:3 (Standard)</SelectItem>
                            <SelectItem value="1:1">1:1 (Square)</SelectItem>
                            <SelectItem value="3:4">3:4 (Portrait)</SelectItem>
                            <SelectItem value="9:16">9:16 (Tall)</SelectItem>
                            <SelectItem value="2:3">2:3 (Classic Portrait)</SelectItem>
                            <SelectItem value="circle">Circle</SelectItem>
                        </SelectContent>
                    </Select>
                    <FormMessage />
                </FormItem>
            )} />
            <FormField control={form.control} name="columnSpan" render={({ field }) => (
                <FormItem>
                    <FormLabel>Width</FormLabel>
                    <Select onValueChange={field.onChange} value={String(field.value)}>
                        <FormControl><SelectTrigger><SelectValue placeholder="Select width..." /></SelectTrigger></FormControl>
                        <SelectContent>
                            <SelectItem value="1">Single Column</SelectItem>
                            <SelectItem value="2">Double Column</SelectItem>
                        </SelectContent>
                    </Select>
                    <FormMessage />
                </FormItem>
            )} />
        </div>
         {itemType === 'image' && (
            <FormField control={form.control} name="imageUrl" render={({ field }) => (
                <FormItem>
                    <FormLabel>Image URL</FormLabel>
                    <FormControl><Input {...field} /></FormControl>
                    <FormDescription>Provide a direct image link.</FormDescription>
                    <FormMessage />
                </FormItem>
            )}
         )}
        {itemType === 'video' && (
            <FormField control={form.control} name="videoUrl" render={({ field }) => (
                <FormItem>
                    <FormLabel>Video URL</FormLabel>
                    <FormControl><Input {...field} /></FormControl>
                    <FormDescription>Provide a direct video link.</FormDescription>
                    <FormMessage />
                </FormItem>
            )}
        )}
        <Button type="submit" size="sm">Add Media</Button>
    </form></Form>;
}

export default function GalleryTab() {
    const { toast } = useToast();
    const [loading, setLoading] = useState(true);
    const [galleryContent, setGalleryContent] = useState<T.GalleryPageContent>({ title: "", subtitle: "" });
    const [galleryItems, setGalleryItems] = useState<T.GalleryItem[]>([]);
    const [activeAccordion, setActiveAccordion] = useState<string | undefined>();
    const [hasReordered, setHasReordered] = useState(false);
    const sensors = useSensors(useSensor(PointerSensor));

    const loadData = React.useCallback(async () => {
        setLoading(true);
        try {
            const [content, items] = await Promise.all([
                firebaseService.getGalleryPageContent(),
                firebaseService.getGalleryItems()
            ]);
            setGalleryContent(content);
            setGalleryItems(items);
            setHasReordered(false);
        } catch (error) {
            console.error("Failed to fetch gallery data:", error);
            toast({ title: "Error", description: `Could not load gallery data.`, variant: "destructive" });
        } finally {
            setLoading(false);
        }
    }, [toast]);
    
    useEffect(() => {
        loadData();
    }, [loadData]);
    
    const handleDragEnd = (event: DragEndEvent) => {
        const { active, over } = event;
        if (active.id !== over?.id) {
            setGalleryItems((items) => {
                const oldIndex = items.findIndex((item) => item.id === active.id);
                const newIndex = items.findIndex((item) => item.id === over?.id);
                if (oldIndex === -1 || newIndex === -1) return items;
                const newOrder = arrayMove(items, oldIndex, newIndex);
                setHasReordered(true);
                return newOrder;
            });
        }
    };
    
    const handleSaveOrder = async () => {
        try {
            await firebaseService.updateGalleryItemsOrder(galleryItems);
            await loadData();
            toast({ title: "Success!", description: "Gallery order has been updated." });
        } catch (error) {
            toast({ title: "Error", description: `Could not save order. ${error instanceof Error ? error.message : ''}`, variant: "destructive" });
        }
    }

    const handleFormSubmit = async (updateFunction: Function, successMessage: string, formData: any, form: any) => {
        try {
            await updateFunction(formData);
            await loadData();
            toast({ title: "Success!", description: successMessage });
            form.reset(formData);
        } catch (error) {
            toast({ title: "Error", description: `Could not save data. ${error instanceof Error ? error.message : ''}`, variant: "destructive" });
        }
    };
    
    const handleUpdateItem = async (updateFunction: Function, id: string, itemData: any, message: string, form?: any) => {
        try {
            await updateFunction(id, itemData);
            await loadData();
            toast({ title: "Success!", description: message });
            if (form) form.reset(itemData);
        } catch (error) {
            toast({ title: "Error", description: `Could not save item. ${error instanceof Error ? error.message : ''}`, variant: "destructive" });
        }
    };
    
    const handleAddItem = async (addFunction: Function, addData: any, message: string, form?: any) => {
        try {
            await addFunction(addData);
            await loadData();
            toast({ title: "Success!", description: message });
            if (form) form.reset();
        } catch (error) {
            toast({ title: "Error", description: `Could not add item. ${error instanceof Error ? error.message : ''}`, variant: "destructive" });
        }
    };

    const handleDeleteItem = async (deleteFunction: Function, id: string, message: string) => {
        if (!confirm('Are you sure you want to delete this item?')) return;
        try {
            await deleteFunction(id);
            await loadData();
            toast({ title: "Success!", description: message });
        } catch (error) {
            toast({ title: "Error", description: `Could not delete item. ${error instanceof Error ? error.message : ''}`, variant: "destructive" });
        }
    };
    
    const galleryForm = useForm<z.infer<typeof galleryPageContentSchema>>({
        resolver: zodResolver(galleryPageContentSchema),
        defaultValues: galleryContent,
    });
    React.useEffect(() => { galleryForm.reset(galleryContent); }, [galleryContent, galleryForm]);

    if (loading) {
        return <div className="space-y-4"><Skeleton className="h-12 w-full" /><Skeleton className="h-64 w-full" /></div>;
    }

    return (
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
            <AccordionItem value="gallery-items">
                <AccordionTrigger><div className="flex items-center gap-2 text-lg"><GalleryHorizontal /> Gallery Media</div></AccordionTrigger>
                <AccordionContent className="p-1 space-y-6">
                    <Card><CardContent className="pt-6">
                        {hasReordered && (
                            <div className="flex justify-end mb-4">
                                <Button onClick={handleSaveOrder}>Save Order</Button>
                            </div>
                        )}
                        <DndContext sensors={sensors} collisionDetection={closestCenter} onDragEnd={handleDragEnd}>
                            <SortableContext items={galleryItems.map((item) => item.id)} strategy={verticalListSortingStrategy}>
                                {galleryItems.map((item) => (
                                    <SortableGalleryItem
                                        key={item.id}
                                        item={item}
                                        onSave={(id, saveData, form) => handleUpdateItem(firebaseService.updateGalleryItem, id, saveData, "Media item updated.", form)}
                                        onDelete={(id) => handleDeleteItem(firebaseService.deleteGalleryItem, id, "Media item deleted.")}
                                    />
                                ))}
                            </SortableContext>
                        </DndContext>
                        <AddGalleryItemForm onAdd={(addData, form) => handleAddItem(firebaseService.addGalleryItem, addData, "Media item added!", form)} />
                    </CardContent></Card>
                </AccordionContent>
            </AccordionItem>
        </Accordion>
    );
}
