

"use client";

import React, { useState, useEffect } from "react";
import Papa from "papaparse";
import { useForm, useFieldArray } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";

import { Button } from "@/components/ui/button";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion";
import { Download, Upload, Settings, Trash2, Library, Globe } from "lucide-react";
import * as firebaseService from "@/lib/firebase-service";
import type * as T from "@/lib/types";
import { Switch } from "@/components/ui/switch";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useToast } from "@/hooks/use-toast";
import { Skeleton } from "@/components/ui/skeleton";


const navLinksForAdmin = [
  { href: '/about', label: 'About' }, { href: '/committees', label: 'Committees' }, { href: '/news', label: 'News' },
  { href: '/sg-notes', label: 'SG Notes' }, { href: '/registration', label: 'Registration' }, { href: '/schedule', label: 'Schedule' },
  { href: '/documents', label: 'Documents' }
];

const generalSettingsSchema = z.object({
  conferenceDate: z.string().min(1),
  mapEmbedUrl: z.string().url(),
  footerText: z.string().min(5),
});

const socialLinkItemSchema = z.object({
  platform: z.string({ required_error: "Please select a platform."}).min(1, "Please select a platform."),
  url: z.string().url("Please enter a valid URL."),
});

const socialLinksSchema = z.object({
  socialLinks: z.array(z.object({
      id: z.string().optional(),
      platform: z.string(),
      url: z.string().url().or(z.literal("")).or(z.literal("#")),
  })),
});

const navVisibilitySchema = z.object({
  navVisibility: z.object(Object.fromEntries(navLinksForAdmin.map(link => [link.href, z.boolean()]))),
});

const availablePlatforms = ['Twitter', 'Instagram', 'Facebook', 'Linkedin', 'Youtube', 'Tiktok'];

function AddSocialLinkForm({ onAdd, existingPlatforms }: { onAdd: (link: T.SocialLink) => void; existingPlatforms: string[] }) {
    const form = useForm<z.infer<typeof socialLinkItemSchema>>({
        resolver: zodResolver(socialLinkItemSchema),
        defaultValues: { platform: '', url: '' },
    });
    const filteredPlatforms = availablePlatforms.filter(p => !existingPlatforms.includes(p));

    const handleAdd = (data: z.infer<typeof socialLinkItemSchema>) => {
        onAdd(data);
        form.reset();
    };

    return (
        <Form {...form}>
            <form onSubmit={form.handleSubmit(handleAdd)} className="p-2 border-t mt-4">
                <h4 className="font-semibold mb-2">Add New Social Link</h4>
                <div className="flex flex-wrap md:flex-nowrap gap-2 items-end">
                    <FormField
                        control={form.control}
                        name="platform"
                        render={({ field }) => (
                            <FormItem className="w-full md:w-auto">
                                <FormLabel>Platform</FormLabel>
                                <Select onValueChange={field.onChange} value={field.value}>
                                    <FormControl>
                                        <SelectTrigger><SelectValue placeholder="Select..." /></SelectTrigger>
                                    </FormControl>
                                    <SelectContent>
                                        {filteredPlatforms.map(p => <SelectItem key={p} value={p}>{p}</SelectItem>)}
                                    </SelectContent>
                                </Select>
                                <FormMessage />
                            </FormItem>
                        )}
                    />
                    <FormField
                        control={form.control}
                        name="url"
                        render={({ field }) => (
                            <FormItem className="flex-grow">
                                <FormLabel>URL</FormLabel>
                                <FormControl>
                                    <Input {...field} placeholder="https://..." />
                                </FormControl>
                                <FormMessage />
                            </FormItem>
                        )}
                    />
                    <Button type="submit" disabled={filteredPlatforms.length === 0}>Add</Button>
                </div>
                {filteredPlatforms.length === 0 && <p className="text-xs text-muted-foreground mt-2">All available platforms have been added.</p>}
            </form>
        </Form>
    );
}

export default function SettingsTab() {
    const { toast } = useToast();
    const [loading, setLoading] = useState(true);
    const [data, setData] = useState<any>({
        siteConfig: { socialLinks: [], navVisibility: {} },
        committees: [], countries: []
    });
    
    const [activeAccordion, setActiveAccordion] = useState<string | undefined>();
    const [committeeImportFile, setCommitteeImportFile] = useState<File | null>(null);
    const [countryImportFile, setCountryImportFile] = useState<File | null>(null);
    const [isImporting, setIsImporting] = useState(false);

    const generalSettingsForm = useForm<z.infer<typeof generalSettingsSchema>>({ resolver: zodResolver(generalSettingsSchema), defaultValues: data.siteConfig });
    const socialLinksForm = useForm<z.infer<typeof socialLinksSchema>>({ resolver: zodResolver(socialLinksSchema), defaultValues: { socialLinks: data.siteConfig.socialLinks || [] } });
    const navVisibilityForm = useForm<z.infer<typeof navVisibilitySchema>>({ resolver: zodResolver(navVisibilitySchema), defaultValues: { navVisibility: data.siteConfig.navVisibility || {} } });
    
    const { fields: socialLinkFields, append: appendSocialLink, remove: removeSocialLink, replace: replaceSocialLinks } = useFieldArray({
        control: socialLinksForm.control,
        name: "socialLinks",
    });

    const loadData = React.useCallback(async () => {
        setLoading(true);
        try {
            const [siteConfig, committees, countries] = await Promise.all([
                firebaseService.getSiteConfig(),
                firebaseService.getCommittees(),
                firebaseService.getCountries(),
            ]);
            setData({ siteConfig, committees, countries });
            generalSettingsForm.reset(siteConfig);
            replaceSocialLinks(siteConfig.socialLinks || []);
            navVisibilityForm.reset({ navVisibility: siteConfig.navVisibility || {} });
        } catch (error) {
            console.error("Failed to fetch settings data:", error);
            toast({ title: "Error", description: `Could not load settings data.`, variant: "destructive" });
        } finally {
            setLoading(false);
        }
    }, [toast, generalSettingsForm, replaceSocialLinks, navVisibilityForm]);

    React.useEffect(() => {
        loadData();
    }, [loadData]);


    const handleFormSubmit = async (updateFunction: Function, formValues: any, form: any) => {
        try {
            await updateFunction(formValues);
            setData(prev => ({...prev, siteConfig: {...prev.siteConfig, ...formValues}}));
            toast({ title: "Success!", description: "Settings updated." });
            form.reset(formValues);
        } catch (error) {
            toast({ title: "Error", description: `Could not save data. ${error instanceof Error ? error.message : ''}`, variant: "destructive" });
        }
    };

    const handleFileChange = (setter: React.Dispatch<React.SetStateAction<File | null>>) => (event: React.ChangeEvent<HTMLInputElement>) => {
        if (event.target.files && event.target.files.length > 0) setter(event.target.files[0]); else setter(null);
    };

    const handleImport = async (file: File | null, importFunction: (data: any[]) => Promise<void>, type: string) => {
        if (!file) {
            toast({ title: "No file selected", description: `Please choose a ${type} CSV file.`, variant: "destructive" });
            return;
        }
        if (!confirm(`Are you sure you want to import ${type}? This will ERASE all existing data for ${type}. This action cannot be undone.`)) return;
        
        setIsImporting(true);
        Papa.parse(file, {
            header: true,
            skipEmptyLines: true,
            complete: async (results) => {
                try {
                    await importFunction(results.data as any[]);
                    toast({ title: "Import Successful!", description: `Your ${type} data has been imported.` });
                    await loadData();
                } catch (error) {
                    toast({ title: "Import Failed", description: error instanceof Error ? error.message : "An unknown error occurred.", variant: "destructive" });
                } finally {
                    setIsImporting(false);
                    setCommitteeImportFile(null); setCountryImportFile(null);
                    const fileInput = document.getElementById(`${type}ImportFile`) as HTMLInputElement;
                    if (fileInput) fileInput.value = '';
                }
            },
            error: (err) => {
                toast({ title: "Error parsing CSV", description: err.message, variant: "destructive" });
                setIsImporting(false);
            }
        });
    };

    const handleExport = (dataToExport: any[], filename: string) => {
        let flattenedData;
        switch(filename) {
            case 'committees.csv':
                flattenedData = dataToExport.map((c: T.Committee) => ({
                    name: c.name,
                    chairName: c.chair.name,
                    chairBio: c.chair.bio,
                    chairImageUrl: c.chair.imageUrl,
                    topics: c.topics.join('\\n'),
                    backgroundGuideUrl: c.backgroundGuideUrl,
                }));
                break;
            case 'countries.csv':
                flattenedData = dataToExport.map(({id, ...rest}: T.Country) => rest);
                break;
            default:
                flattenedData = dataToExport;
        }
        const csv = Papa.unparse(flattenedData);
        const blob = new Blob([csv], { type: "text/csv;charset=utf-8;" });
        const url = URL.createObjectURL(blob);
        const link = document.createElement("a");
        link.href = url;
        link.download = filename;
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
        toast({ title: "Export Successful", description: `Downloaded ${filename}` });
    };

    if (loading) {
        return <div className="space-y-4"><Skeleton className="h-12 w-full" /><Skeleton className="h-64 w-full" /></div>;
    }

    return (
        <Accordion type="single" collapsible value={activeAccordion} onValueChange={setActiveAccordion}>
            <AccordionItem value="site"><AccordionTrigger><div className="flex items-center gap-2 text-lg"><Settings /> Site & Navigation</div></AccordionTrigger>
            <AccordionContent className="p-1 space-y-6">
                <Card><CardHeader><CardTitle>General Settings</CardTitle></CardHeader>
                <CardContent>
                    <Form {...generalSettingsForm}>
                        <form onSubmit={generalSettingsForm.handleSubmit(async (values) => {
                            await handleFormSubmit(firebaseService.updateSiteConfig, values, generalSettingsForm);
                        })} className="space-y-4">
                            <FormField control={generalSettingsForm.control} name="conferenceDate" render={({ field }) => (<FormItem><FormLabel>Countdown Date</FormLabel><FormControl><Input {...field} /></FormControl><p className="text-xs text-muted-foreground">Format: YYYY-MM-DDTHH:mm:ss</p></FormItem>)} />
                            <FormField control={generalSettingsForm.control} name="mapEmbedUrl" render={({ field }) => (<FormItem><FormLabel>Google Maps Embed URL</FormLabel><FormControl><Input {...field} /></FormControl></FormItem>)} />
                            <FormField control={generalSettingsForm.control} name="footerText" render={({ field }) => (<FormItem><FormLabel>Footer Text</FormLabel><FormControl><Textarea {...field} /></FormControl></FormItem>)} />
                            <Button type="submit">Save General</Button>
                        </form>
                    </Form>
                </CardContent></Card>
                
                <Card><CardHeader><CardTitle>Social Media Links</CardTitle></CardHeader>
                <CardContent>
                    <Form {...socialLinksForm}>
                        <form onSubmit={socialLinksForm.handleSubmit(async (values) => {
                            await handleFormSubmit(firebaseService.updateSiteConfig, values, socialLinksForm);
                            const siteConfig = await firebaseService.getSiteConfig();
                            setData((p: any) => ({...p, siteConfig}));

                        })} className="space-y-4">
                            {socialLinkFields.map((field, index) => (
                                <div key={field.id} className="flex items-end gap-2 p-2 border rounded-md">
                                    <FormField
                                        control={socialLinksForm.control}
                                        name={`socialLinks.${index}.platform`}
                                        render={({ field }) => (
                                            <FormItem>
                                                <FormLabel>Platform</FormLabel>
                                                <FormControl><Input {...field} readOnly className="font-semibold bg-muted" /></FormControl>
                                            </FormItem>
                                        )}
                                    />
                                    <FormField
                                        control={socialLinksForm.control}
                                        name={`socialLinks.${index}.url`}
                                        render={({ field }) => (
                                            <FormItem className="flex-grow">
                                                <FormLabel>URL</FormLabel>
                                                <FormControl><Input {...field} placeholder="https://..." /></FormControl>
                                            </FormItem>
                                        )}
                                    />
                                    <Button type="button" variant="destructive" size="icon" onClick={() => removeSocialLink(index)}><Trash2 className="h-4 w-4"/></Button>
                                </div>
                            ))}
                            <Button type="submit">Save Social Links</Button>
                        </form>
                    </Form>
                    <AddSocialLinkForm
                        onAdd={appendSocialLink}
                        existingPlatforms={socialLinkFields.map(f => f.platform)}
                    />
                </CardContent></Card>
                
                <Card><CardHeader><CardTitle>Navigation Visibility</CardTitle></CardHeader>
                <CardContent>
                    <Form {...navVisibilityForm}>
                        <form onSubmit={navVisibilityForm.handleSubmit(async (values) => {
                             await handleFormSubmit(firebaseService.updateSiteConfig, values, navVisibilityForm);
                        })} className="space-y-2">
                            {navLinksForAdmin.map((link) => (
                                <FormField key={link.href} control={navVisibilityForm.control} name={`navVisibility.${link.href}` as const} render={({ field }) => (
                                    <FormItem className="flex flex-row items-center justify-between rounded-lg border p-3">
                                        <FormLabel>{link.label}</FormLabel>
                                        <FormControl><Switch checked={field.value} onCheckedChange={field.onChange} /></FormControl>
                                    </FormItem>
                                )} />
                            ))}
                            <Button type="submit" className="w-full">Save Navigation</Button>
                        </form>
                    </Form>
                </CardContent></Card>
            </AccordionContent></AccordionItem>
            <AccordionItem value="import-export"><AccordionTrigger><div className="flex items-center gap-2 text-lg"><Download /> Import / Export</div></AccordionTrigger>
            <AccordionContent className="p-1"><Card><CardContent className="pt-6 grid md:grid-cols-2 gap-6">
                <div className="space-y-2 p-4 border rounded-lg">
                    <h3 className="font-semibold flex items-center gap-2"><Library/> Committees</h3>
                    <Button onClick={() => handleExport(data.committees, 'committees.csv')} className="w-full">Export to CSV</Button>
                    <div className="border-t pt-2 mt-2"><h4 className="font-semibold mb-2">Import</h4>
                        <p className="text-xs text-muted-foreground mb-2">CSV must have columns: name, chairName, chairBio, chairImageUrl, topics (use \n for multiple), backgroundGuideUrl.</p>
                        <div className="flex gap-2"><Input id="committeesImportFile" type="file" accept=".csv" onChange={handleFileChange(setCommitteeImportFile)}/>
                        <Button onClick={() => handleImport(committeeImportFile, firebaseService.importCommittees, 'committees')} disabled={!committeeImportFile || isImporting}><Upload/></Button></div>
                    </div>
                </div>
                <div className="space-y-2 p-4 border rounded-lg">
                    <h3 className="font-semibold flex items-center gap-2"><Globe/> Countries</h3>
                    <Button onClick={() => handleExport(data.countries, 'countries.csv')} className="w-full">Export to CSV</Button>
                    <div className="border-t pt-2 mt-2"><h4 className="font-semibold mb-2">Import</h4>
                        <p className="text-xs text-muted-foreground mb-2">CSV must have columns: name, committee, status (Available or Assigned).</p>
                        <div className="flex gap-2"><Input id="countriesImportFile" type="file" accept=".csv" onChange={handleFileChange(setCountryImportFile)}/>
                        <Button onClick={() => handleImport(countryImportFile, firebaseService.importCountries, 'countries')} disabled={!countryImportFile || isImporting}><Upload/></Button></div>
                    </div>
                </div>
            </CardContent></Card></AccordionContent></AccordionItem>
        </Accordion>
    );
}
