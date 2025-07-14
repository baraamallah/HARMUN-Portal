
"use client";

import React, { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";

import { Button } from "@/components/ui/button";
import { Form, FormControl, FormDescription, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion";
import { FileText, GalleryHorizontal, Wand2 } from "lucide-react";
import * as firebaseService from "@/lib/firebase-service";
import type * as T from "@/lib/types";
import { convertGoogleDriveLink } from "@/lib/utils";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";

const galleryPageContentSchema = z.object({ title: z.string().min(5), subtitle: z.string().min(10) });

const galleryItemSchema = z.object({
    title: z.string().min(2, "Title is required."),
    type: z.enum(["image", "video"], { required_error: "Please select a media type." }),
    display: z.enum(["default", "square", "circle"], { required_error: "Please select a display style." }),
    url: z.string().url("Must be a valid URL.").min(1, "URL is required."),
});


function GalleryItemForm({ item, onSave, onDelete }: { item: T.GalleryItem; onSave: (id: string, data: z.infer<typeof galleryItemSchema>, form: any) => void; onDelete: (id: string) => void }) {
    const form = useForm<z.infer<typeof galleryItemSchema>>({
        resolver: zodResolver(galleryItemSchema),
        defaultValues: { ...item, url: item.imageUrl || item.videoUrl || '' },
    });
    const itemType = form.watch("type");
    React.useEffect(() => { form.reset({ ...item, url: item.imageUrl || item.videoUrl || '' }); }, [item, form]);

    const handleConvertUrl = () => {
        const url = form.getValues("url");
        form.setValue("url", convertGoogleDriveLink(url));
    }

    return (
        <Form {...form}>
            <form onSubmit={form.handleSubmit((data) => onSave(item.id, data, form))} className="p-2 border rounded-md mb-2 space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                     <FormField control={form.control} name="title" render={({ field }) => <FormItem><FormLabel>Title</FormLabel><FormControl><Input {...field} /></FormControl><FormMessage /></FormItem>} />
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
                            <FormLabel>Display Style</FormLabel>
                            <Select onValueChange={field.onChange} value={field.value}>
                                <FormControl><SelectTrigger><SelectValue placeholder="Select style..." /></SelectTrigger></FormControl>
                                <SelectContent>
                                    <SelectItem value="default">Default</SelectItem>
                                    <SelectItem value="square">Square</SelectItem>
                                    <SelectItem value="circle">Circle</SelectItem>
                                </SelectContent>
                            </Select>
                            <FormMessage />
                        </FormItem>
                    )} />
                </div>
                 <FormField control={form.control} name="url" render={({ field }) => (
                    <FormItem>
                        <FormLabel>{itemType === 'video' ? "Video URL" : "Image URL"}</FormLabel>
                        <div className="flex gap-2">
                            <FormControl><Input {...field} /></FormControl>
                            {itemType === 'image' && <Button type="button" variant="outline" size="icon" onClick={handleConvertUrl}><Wand2 className="h-4 w-4"/></Button>}
                        </div>
                        <FormMessage />
                    </FormItem>
                )} />

                <div className="flex gap-2 justify-end"><Button type="submit" size="sm">Save</Button><Button size="sm" variant="destructive" type="button" onClick={() => onDelete(item.id)}>Delete</Button></div>
            </form>
        </Form>
    );
}

function AddGalleryItemForm({ onAdd }: { onAdd: (data: any, form: any) => Promise<void> }) {
    const form = useForm<z.infer<typeof galleryItemSchema>>({ 
        resolver: zodResolver(galleryItemSchema), 
        defaultValues: { title: '', url: '', type: 'image', display: 'default' } 
    });
    const itemType = form.watch("type");

    const handleConvertUrl = () => {
        const url = form.getValues("url");
        form.setValue("url", convertGoogleDriveLink(url));
    }

    return <Form {...form}><form onSubmit={form.handleSubmit((d) => onAdd(d, form))} className="space-y-4 p-2 border-t mt-4">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 items-end">
            <FormField control={form.control} name="title" render={({ field }) => <FormItem><FormLabel>Title</FormLabel><FormControl><Input {...field} /></FormControl><FormMessage /></FormItem>} />
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
                    <FormLabel>Display Style</FormLabel>
                    <Select onValueChange={field.onChange} value={field.value}>
                        <FormControl><SelectTrigger><SelectValue placeholder="Select style..." /></SelectTrigger></FormControl>
                        <SelectContent>
                            <SelectItem value="default">Default</SelectItem>
                            <SelectItem value="square">Square</SelectItem>
                            <SelectItem value="circle">Circle</SelectItem>
                        </SelectContent>
                    </Select>
                    <FormMessage />
                </FormItem>
            )} />
        </div>
        <FormField control={form.control} name="url" render={({ field }) => (
            <FormItem>
                <FormLabel>{itemType === 'video' ? "Video URL" : "Image URL"}</FormLabel>
                <div className="flex gap-2">
                    <FormControl><Input {...field} /></FormControl>
                    {itemType === 'image' && <Button type="button" variant="outline" size="icon" onClick={handleConvertUrl}><Wand2 className="h-4 w-4"/></Button>}
                </div>
                <FormDescription>For images, you can use a standard URL or a Google Drive "share" link.</FormDescription>
                <FormMessage />
            </FormItem>
        )} />
        <Button type="submit" size="sm">Add Media</Button>
    </form></Form>;
}

export default function GalleryTab({ data, handleAddItem, handleUpdateItem, handleDeleteItem, handleFormSubmit }: any) {
    const [activeAccordion, setActiveAccordion] = useState<string | undefined>();

    const galleryForm = useForm<z.infer<typeof galleryPageContentSchema>>({
        defaultValues: data.galleryContent,
    });
    React.useEffect(() => { galleryForm.reset(data.galleryContent); }, [data.galleryContent, galleryForm]);

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
                        {data.galleryItems?.map((item: T.GalleryItem) => (
                            <GalleryItemForm
                                key={item.id}
                                item={item}
                                onSave={(id, saveData, form) => handleUpdateItem(firebaseService.updateGalleryItem, id, saveData, "galleryItems", "Media item updated.", form)}
                                onDelete={(id) => handleDeleteItem(firebaseService.deleteGalleryItem, id, "galleryItems", "Media item deleted.")}
                            />
                        ))}
                        <AddGalleryItemForm onAdd={(addData, form) => handleAddItem(firebaseService.addGalleryItem, addData, "galleryItems", "Media item added!", form)} />
                    </CardContent></Card>
                </AccordionContent>
            </AccordionItem>
        </Accordion>
    );
}

    