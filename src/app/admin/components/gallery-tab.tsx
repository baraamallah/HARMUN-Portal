
"use client";

import React, { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";

import { Button } from "@/components/ui/button";
import { Form, FormControl, FormDescription, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion";
import { FileText, GalleryHorizontal, Wand2 } from "lucide-react";
import * as firebaseService from "@/lib/firebase-service";
import type * as T from "@/lib/types";
import { convertGoogleDriveLink } from "@/lib/utils";

const galleryPageContentSchema = z.object({ title: z.string().min(5), subtitle: z.string().min(10) });
const galleryImageSchema = z.object({
    title: z.string().min(2, "Title is required."),
    imageUrl: z.string().url("Must be a valid URL.").min(1, "Image URL is required."),
});

function GalleryImageForm({ image, onSave, onDelete }: { image: T.GalleryImage; onSave: (id: string, data: z.infer<typeof galleryImageSchema>, form: any) => void; onDelete: (id: string) => void }) {
    const form = useForm<z.infer<typeof galleryImageSchema>>({
        resolver: zodResolver(galleryImageSchema),
        defaultValues: image,
    });
    React.useEffect(() => { form.reset(image); }, [image, form]);

    const handleConvertUrl = () => {
        const url = form.getValues("imageUrl");
        form.setValue("imageUrl", convertGoogleDriveLink(url));
    }

    return (
        <Form {...form}>
            <form onSubmit={form.handleSubmit((data) => onSave(image.id, data, form))} className="flex flex-wrap md:flex-nowrap gap-2 items-start p-2 border rounded-md mb-2">
                <FormField control={form.control} name="title" render={({ field }) => <FormItem><FormLabel>Title</FormLabel><FormControl><Input {...field} /></FormControl><FormMessage /></FormItem>} />
                <FormField control={form.control} name="imageUrl" render={({ field }) => <FormItem className="flex-grow w-full md:w-auto"><FormLabel>Image URL</FormLabel><div className="flex gap-2"><FormControl><Input {...field} /></FormControl><Button type="button" variant="outline" size="icon" onClick={handleConvertUrl}><Wand2 className="h-4 w-4"/></Button></div><FormMessage /></FormItem>} />
                <div className="flex gap-1 pt-6"><Button type="submit" size="sm">Save</Button><Button size="sm" variant="destructive" type="button" onClick={() => onDelete(image.id)}>Delete</Button></div>
            </form>
        </Form>
    );
}

function AddGalleryImageForm({ onAdd }: { onAdd: (data: any, form: any) => Promise<void> }) {
    const form = useForm({ resolver: zodResolver(galleryImageSchema), defaultValues: { title: '', imageUrl: '' } });

    const handleConvertUrl = () => {
        const url = form.getValues("imageUrl");
        form.setValue("imageUrl", convertGoogleDriveLink(url));
    }

    return <Form {...form}><form onSubmit={form.handleSubmit((d) => onAdd(d, form))} className="flex flex-wrap md:flex-nowrap gap-2 items-end p-2 border-t mt-4">
        <FormField control={form.control} name="title" render={({ field }) => <FormItem><FormLabel>Title</FormLabel><FormControl><Input {...field} /></FormControl><FormMessage /></FormItem>} />
        <FormField control={form.control} name="imageUrl" render={({ field }) => <FormItem className="flex-grow"><FormLabel>Image URL</FormLabel><div className="flex gap-2"><FormControl><Input {...field} /></FormControl><Button type="button" variant="outline" size="icon" onClick={handleConvertUrl}><Wand2 className="h-4 w-4"/></Button></div><FormDescription>Use a standard image URL or a Google Drive "share" link.</FormDescription><FormMessage /></FormItem>} />
        <Button type="submit" size="sm">Add Image</Button>
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
            <AccordionItem value="gallery-images">
                <AccordionTrigger><div className="flex items-center gap-2 text-lg"><GalleryHorizontal /> Gallery Images</div></AccordionTrigger>
                <AccordionContent className="p-1 space-y-6">
                    <Card><CardContent className="pt-6">
                        {data.galleryImages?.map((image: T.GalleryImage) => (
                            <GalleryImageForm
                                key={image.id}
                                image={image}
                                onSave={(id, saveData, form) => handleUpdateItem(firebaseService.updateGalleryImage, id, saveData, "galleryImages", "Image updated.", form)}
                                onDelete={(id) => handleDeleteItem(firebaseService.deleteGalleryImage, id, "galleryImages", "Image deleted.")}
                            />
                        ))}
                        <AddGalleryImageForm onAdd={(addData, form) => handleAddItem(firebaseService.addGalleryImage, addData, "galleryImages", "Image added!", form)} />
                    </CardContent></Card>
                </AccordionContent>
            </AccordionItem>
        </Accordion>
    );
}
