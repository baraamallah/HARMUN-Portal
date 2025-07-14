
"use client";

import React, { useState } from "react";
import { useForm } from "react-hook-form";
import * as z from "zod";

import { Button } from "@/components/ui/button";
import { Form, FormControl, FormField, FormItem, FormLabel } from "@/components/ui/form";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion";
import { PlusCircle, Trash2, CalendarDays, Globe, Library } from "lucide-react";
import * as firebaseService from "@/lib/firebase-service";
import type * as T from "@/lib/types";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Switch } from "@/components/ui/switch";
import { useToast } from "@/hooks/use-toast";
import { Skeleton } from "@/components/ui/skeleton";

const scheduleEventSchema = z.object({
    time: z.string().min(1, "Time is required."),
    title: z.string().min(3, "Title is required."),
    location: z.string(),
    description: z.string().optional(),
});

function ScheduleEventForm({ event, onSave, onDelete }: { event: T.ScheduleEvent; onSave: (id: string, data: z.infer<typeof scheduleEventSchema>) => void; onDelete: (id: string) => void }) {
    const form = useForm<z.infer<typeof scheduleEventSchema>>({
        defaultValues: event,
    });
    React.useEffect(() => { form.reset(event); }, [event, form]);

    return (
        <Form {...form}>
            <form onSubmit={form.handleSubmit((data) => onSave(event.id, data))} className="flex flex-wrap gap-2 items-start p-2 border rounded-md mb-2">
                <FormField control={form.control} name="time" render={({ field }) => <FormItem><FormLabel>Time</FormLabel><FormControl><Input {...field} /></FormControl></FormItem>} />
                <FormField control={form.control} name="title" render={({ field }) => <FormItem className="flex-grow"><FormLabel>Title</FormLabel><FormControl><Input {...field} /></FormControl></FormItem>} />
                <FormField control={form.control} name="location" render={({ field }) => <FormItem><FormLabel>Location</FormLabel><FormControl><Input {...field} /></FormControl></FormItem>} />
                <div className="flex gap-1 pt-6"><Button type="submit" size="sm">Save</Button><Button size="sm" variant="destructive" type="button" onClick={() => onDelete(event.id)}>Delete</Button></div>
            </form>
        </Form>
    );
}

function AddScheduleDayForm({ onAdd }: { onAdd: (data: any) => Promise<void> }) {
    const form = useForm({ defaultValues: { title: '', date: '' } });
    return <Form {...form}><form onSubmit={form.handleSubmit(async (d) => { await onAdd(d); form.reset(); })} className="flex flex-col md:flex-row gap-2 items-end">
        <FormField control={form.control} name="title" render={({ field }) => <FormItem className="flex-grow w-full"><FormLabel>Day Title</FormLabel><FormControl><Input {...field} /></FormControl></FormItem>} />
        <FormField control={form.control} name="date" render={({ field }) => <FormItem className="flex-grow w-full"><FormLabel>Date</FormLabel><FormControl><Input {...field} /></FormControl></FormItem>} />
        <Button type="submit" size="sm" className="w-full md:w-auto">Add Day</Button>
    </form></Form>;
}

function AddScheduleEventForm({ dayId, onAdd }: { dayId: string; onAdd: (data: any) => Promise<void> }) {
    const form = useForm<z.infer<typeof scheduleEventSchema>>({
        defaultValues: { time: '', title: '', location: '', description: '' }
    });
    return <Form {...form}><form onSubmit={form.handleSubmit(async (d) => { await onAdd({ ...d, dayId }); form.reset(); })} className="flex flex-wrap gap-2 items-end p-2 border-t mt-4">
        <FormField control={form.control} name="time" render={({ field }) => <FormItem><FormLabel>Time</FormLabel><FormControl><Input placeholder="e.g. 9:00 AM" {...field} /></FormControl></FormItem>} />
        <FormField control={form.control} name="title" render={({ field }) => <FormItem className="flex-grow"><FormLabel>Title</FormLabel><FormControl><Input {...field} /></FormControl></FormItem>} />
        <FormField control={form.control} name="location" render={({ field }) => <FormItem><FormLabel>Location</FormLabel><FormControl><Input {...field} /></FormControl></FormItem>} />
        <Button type="submit" size="sm">Add Event</Button>
    </form></Form>;
}

function AddCountryForm({ committees, onAdd }: { committees: T.Committee[]; onAdd: (data: any) => Promise<void> }) {
    const form = useForm({ defaultValues: { name: '', committee: '' } });
    return <Form {...form}><form onSubmit={form.handleSubmit(async (d) => { await onAdd({ ...d, status: 'Available' }); form.reset(); })} className="flex flex-col md:flex-row items-end gap-2 mb-4">
        <FormField control={form.control} name="name" render={({ field }) => <FormItem className="flex-grow w-full"><FormLabel>Country Name</FormLabel><FormControl><Input {...field} /></FormControl></FormItem>} />
        <FormField control={form.control} name="committee" render={({ field }) => <FormItem className="flex-grow w-full"><FormLabel>Committee</FormLabel><Select onValueChange={field.onChange} value={field.value}><FormControl><SelectTrigger><SelectValue placeholder="Select..." /></SelectTrigger></FormControl><SelectContent>{committees?.map((c: T.Committee) => <SelectItem key={c.id} value={c.name}>{c.name}</SelectItem>)}</SelectContent></Select></FormItem>} />
        <Button type="submit" className="w-full md:w-auto"><PlusCircle className="mr-2 h-4 w-4" /> Add</Button>
    </form></Form>;
}

function AddCommitteeForm({ onAdd }: { onAdd: (data: any) => Promise<void> }) {
    const form = useForm({ defaultValues: { name: '', chairName: '', chairBio: '', chairImageUrl: '', topics: '', backgroundGuideUrl: '' } });
    
    return <Form {...form}><form onSubmit={form.handleSubmit(async (d) => { await onAdd(d); form.reset(); })} className="space-y-4">
        <div className="grid md:grid-cols-2 gap-4">
            <FormField control={form.control} name="name" render={({ field }) => ( <FormItem><FormLabel>Committee Name</FormLabel><FormControl><Input {...field} /></FormControl></FormItem> )} />
            <FormField control={form.control} name="chairName" render={({ field }) => ( <FormItem><FormLabel>Chair Name</FormLabel><FormControl><Input {...field} /></FormControl></FormItem> )} />
        </div>
         <FormField control={form.control} name="chairImageUrl" render={({ field }) => ( <FormItem><FormLabel>Chair Image URL</FormLabel><FormControl><Input {...field} /></FormControl><p className="text-xs text-muted-foreground">Provide a direct image link or Google Drive share link.</p></FormItem> )} />
        <FormField control={form.control} name="chairBio" render={({ field }) => ( <FormItem><FormLabel>Chair Bio</FormLabel><FormControl><Textarea {...field} rows={3} /></FormControl></FormItem> )} />
        <FormField control={form.control} name="topics" render={({ field }) => ( <FormItem><FormLabel>Topics (one per line)</FormLabel><FormControl><Textarea {...field} rows={3}/></FormControl></FormItem> )} />
        <FormField control={form.control} name="backgroundGuideUrl" render={({ field }) => ( <FormItem><FormLabel>Background Guide URL</FormLabel><FormControl><Input {...field} /></FormControl></FormItem> )} />
        <Button type="submit"><PlusCircle className="mr-2" />Add Committee</Button>
    </form></Form>;
}


export default function ConferenceTab() {
    const { toast } = useToast();
    const [loading, setLoading] = useState(true);
    const [data, setData] = useState<{ committees: T.Committee[], countries: T.Country[], schedule: T.ScheduleDay[] }>({
      committees: [],
      countries: [],
      schedule: []
    });
    const [activeAccordion, setActiveAccordion] = useState<string | undefined>();

    React.useEffect(() => {
        const fetchData = async () => {
            setLoading(true);
            try {
                const [committees, countries, schedule] = await Promise.all([
                    firebaseService.getCommittees(),
                    firebaseService.getCountries(),
                    firebaseService.getSchedule()
                ]);
                setData({ committees, countries, schedule });
            } catch (error) {
                console.error("Failed to fetch conference data:", error);
                toast({ title: "Error", description: `Could not load conference data.`, variant: "destructive" });
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
            
            setData(prev => ({
                ...prev,
                [stateKey]: [...(prev[stateKey] as any[]), newItem],
            }));

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
            setData(prev => ({
                ...prev,
                [stateKey]: (prev[stateKey] as any[]).filter((item: {id: string}) => item.id !== id),
            }));
            toast({ title: "Success!", description: message });
        } catch (error) {
            toast({ title: "Error", description: `Could not delete item. ${error instanceof Error ? error.message : ''}`, variant: "destructive" });
        }
    };

    if (loading) {
        return <div className="space-y-4"><Skeleton className="h-12 w-full" /><Skeleton className="h-64 w-full" /><Skeleton className="h-64 w-full" /></div>;
    }
    
    return (
        <Accordion type="single" collapsible value={activeAccordion} onValueChange={setActiveAccordion}>
            <AccordionItem value="committees"><AccordionTrigger><div className="flex items-center gap-2 text-lg"><Library /> Committees</div></AccordionTrigger>
            <AccordionContent className="p-1 space-y-6">
                <Card><CardHeader><CardTitle>Add New Committee</CardTitle></CardHeader>
                <CardContent>
                    <AddCommitteeForm onAdd={async(values) => {
                        const payload = {
                            name: values.name,
                            chair: { 
                                name: values.chairName, 
                                bio: values.chairBio || "", 
                                imageUrl: values.chairImageUrl || ""
                            },
                            topics: (values.topics || "").split('\n').filter(Boolean), 
                            backgroundGuideUrl: values.backgroundGuideUrl || "",
                        };
                        await handleAddItem(
                            firebaseService.addCommittee,
                            payload,
                            "committees",
                            "Committee Added!"
                        );
                    }}/>
                </CardContent></Card>
                <Card><CardHeader><CardTitle>Existing Committees</CardTitle></CardHeader>
                <CardContent>
                    <div className="border rounded-md max-h-96 overflow-y-auto">
                        <Table><TableHeader><TableRow><TableHead>Committee</TableHead><TableHead>Chair</TableHead><TableHead className="text-right">Actions</TableHead></TableRow></TableHeader>
                        <TableBody>
                            {data.committees?.map((c: T.Committee) => (
                                <TableRow key={c.id}>
                                    <TableCell>{c.name}</TableCell><TableCell>{c.chair.name}</TableCell>
                                    <TableCell className="text-right">
                                        <Button variant="ghost" size="icon" onClick={() => handleDeleteItem(firebaseService.deleteCommittee, c.id, "committees", "Committee deleted.")}>
                                            <Trash2 className="h-4 w-4 text-destructive" />
                                        </Button>
                                    </TableCell>
                                </TableRow>
                            ))}
                        </TableBody></Table>
                    </div>
                </CardContent></Card>
            </AccordionContent></AccordionItem>
            <AccordionItem value="countries"><AccordionTrigger><div className="flex items-center gap-2 text-lg"><Globe /> Country Matrix</div></AccordionTrigger>
            <AccordionContent className="p-1"><Card><CardContent className="pt-6">
                <AddCountryForm committees={data.committees} onAdd={(values) => handleAddItem(firebaseService.addCountry, values, "countries", "Country Added!")} />
                <div className="border rounded-md max-h-96 overflow-y-auto">
                    <Table><TableHeader><TableRow><TableHead>Country</TableHead><TableHead>Committee</TableHead><TableHead>Status</TableHead><TableHead className="text-right">Actions</TableHead></TableRow></TableHeader>
                    <TableBody>
                        {data.countries?.map((country: T.Country) => (
                            <TableRow key={country.id}>
                                <TableCell>{country.name}</TableCell><TableCell>{country.committee}</TableCell>
                                <TableCell><Badge variant={country.status === 'Available' ? 'secondary' : 'default'}>{country.status}</Badge></TableCell>
                                <TableCell className="text-right flex items-center justify-end gap-2">
                                    <Switch checked={country.status === 'Assigned'} onCheckedChange={async () => { 
                                        const newStatus = country.status === 'Available' ? 'Assigned' : 'Available'; 
                                        await firebaseService.updateCountryStatus(country.id, { status: newStatus });
                                        setData(prev => ({...prev, countries: prev.countries.map(c => c.id === country.id ? {...c, status: newStatus} : c)}));
                                        toast({title: "Country status updated."});
                                    }} />
                                    <Button variant="ghost" size="icon" onClick={() => handleDeleteItem(firebaseService.deleteCountry, country.id, "countries", "Country deleted.")}> <Trash2 className="h-4 w-4 text-destructive" /></Button>
                                </TableCell>
                            </TableRow>
                        ))}
                    </TableBody></Table>
                </div>
            </CardContent></Card></AccordionContent></AccordionItem>
            <AccordionItem value="schedule"><AccordionTrigger><div className="flex items-center gap-2 text-lg"><CalendarDays /> Schedule</div></AccordionTrigger>
            <AccordionContent className="p-1 space-y-4">
            {data.schedule?.map((day: T.ScheduleDay) => (
                <Card key={day.id}><CardHeader><CardTitle>{day.title} - {day.date}</CardTitle></CardHeader>
                <CardContent>
                {day.events.map((event: T.ScheduleEvent) => (
                    <ScheduleEventForm
                        key={event.id}
                        event={event}
                        onSave={async (id: string, saveData: any) => {
                            await firebaseService.updateScheduleEvent(id, { ...event, ...saveData });
                            setData((prev: any) => ({ ...prev, schedule: prev.schedule.map((d: T.ScheduleDay) => d.id === day.id ? {...d, events: d.events.map(e => e.id === id ? {...e, ...saveData} : e)} : d)}));
                            toast({title: "Event updated."});
                        }}
                        onDelete={async (id: string) => {
                            if(!confirm('Are you sure?')) return;
                            await firebaseService.deleteScheduleEvent(id);
                            setData((prev: any) => ({ ...prev, schedule: prev.schedule.map((d: T.ScheduleDay) => d.id === day.id ? {...d, events: d.events.filter(e => e.id !== id)} : d)}));
                            toast({title: "Event deleted."});
                        }}
                    />
                ))}
                <AddScheduleEventForm dayId={day.id} onAdd={async(eventData: any) => { 
                        const newId = await firebaseService.addScheduleEvent(eventData);
                        const newEvent = await firebaseService.getDocById('scheduleEvents', newId);
                        setData((p: any) => ({...p, schedule: p.schedule.map((d: T.ScheduleDay) => d.id === eventData.dayId ? {...d, events: [...d.events, newEvent]} : d)}));
                }}/>
                </CardContent></Card>
            ))}
            <Card><CardHeader><CardTitle>Add New Day</CardTitle></CardHeader>
            <CardContent>
                <AddScheduleDayForm onAdd={async(dayData: any) => { 
                    const newId = await firebaseService.addScheduleDay(dayData);
                    const newDay = await firebaseService.getDocById('scheduleDays', newId);
                    setData((p: any) => ({...p, schedule: [...p.schedule, {...newDay, events: []}]}));
                }} />
            </CardContent>
            </Card>
            </AccordionContent></AccordionItem>
        </Accordion>
    );
}
