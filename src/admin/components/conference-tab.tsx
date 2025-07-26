
"use client";

import React, { useState, useEffect, useCallback } from "react";
import { useForm } from "react-hook-form";
import * as z from "zod";
import { useToast } from "@/hooks/use-toast";

import { Button } from "@/components/ui/button";
import { Form, FormControl, FormField, FormItem, FormLabel } from "@/components/ui/form";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { PlusCircle, Trash2, CalendarDays, Globe, Library } from "lucide-react";
import * as firebaseService from "@/lib/firebase-service";
import type * as T from "@/lib/types";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Switch } from "@/components/ui/switch";
import { Skeleton } from "@/components/ui/skeleton";
import { Separator } from "@/components/ui/separator";

const scheduleEventSchema = z.object({
    time: z.string().min(1, "Time is required."),
    title: z.string().min(3, "Title is required."),
    location: z.string(),
    description: z.string().optional(),
});

function ScheduleEventForm({ day, event, onSave, onDelete }: { day: T.ScheduleDay; event: T.ScheduleEvent; onSave: (id: string, data: z.infer<typeof scheduleEventSchema>) => void; onDelete: (id: string) => void }) {
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
                <div className="flex gap-1 pt-6"><Button type="submit" size="sm">Save</Button><Button size="sm" variant="destructive" type="button" onClick={() => onDelete(event.id)}><Trash2 className="h-4 w-4"/></Button></div>
            </form>
        </Form>
    );
}

function AddScheduleDayForm({ onAdd }: { onAdd: (data: any, form: any) => Promise<void> }) {
    const form = useForm({ defaultValues: { title: '', date: '' } });
    return <Form {...form}><form onSubmit={form.handleSubmit(async (d) => { await onAdd(d, form); })} className="flex flex-col md:flex-row gap-2 items-end p-4 border rounded-lg">
        <FormField control={form.control} name="title" render={({ field }) => <FormItem className="flex-grow w-full"><FormLabel>Day Title</FormLabel><FormControl><Input {...field} /></FormControl></FormItem>} />
        <FormField control={form.control} name="date" render={({ field }) => <FormItem className="flex-grow w-full"><FormLabel>Date</FormLabel><FormControl><Input type="date" {...field} /></FormControl></FormItem>} />
        <Button type="submit" className="w-full md:w-auto"><PlusCircle className="mr-2"/>Add Day</Button>
    </form></Form>;
}

function AddScheduleEventForm({ dayId, onAdd }: { dayId: string; onAdd: (data: any, form: any) => Promise<void> }) {
    const form = useForm<z.infer<typeof scheduleEventSchema>>({
        defaultValues: { time: '', title: '', location: '', description: '' }
    });
    return <Form {...form}><form onSubmit={form.handleSubmit(async (d) => { await onAdd({ ...d, dayId }, form); })} className="space-y-4 p-4 border-t mt-4">
        <h4 className="font-semibold text-center">Add New Event</h4>
        <div className="grid sm:grid-cols-2 gap-4">
            <FormField control={form.control} name="time" render={({ field }) => <FormItem><FormLabel>Time</FormLabel><FormControl><Input placeholder="e.g. 9:00 AM" {...field} /></FormControl></FormItem>} />
            <FormField control={form.control} name="title" render={({ field }) => <FormItem><FormLabel>Title</FormLabel><FormControl><Input {...field} /></FormControl></FormItem>} />
        </div>
        <FormField control={form.control} name="location" render={({ field }) => <FormItem><FormLabel>Location</FormLabel><FormControl><Input {...field} /></FormControl></FormItem>} />
        <Button type="submit" className="w-full"><PlusCircle className="mr-2"/>Add Event</Button>
    </form></Form>;
}

function AddCountryForm({ committees, onAdd }: { committees: T.Committee[]; onAdd: (data: any, form: any) => Promise<void> }) {
    const form = useForm({ defaultValues: { name: '', committee: '' } });
    return <Form {...form}><form onSubmit={form.handleSubmit(async (d) => { await onAdd({ ...d, status: 'Available' }, form); })} className="flex flex-col md:flex-row items-end gap-2 mb-4 p-4 border rounded-lg">
        <FormField control={form.control} name="name" render={({ field }) => <FormItem className="flex-grow w-full"><FormLabel>Country Name</FormLabel><FormControl><Input {...field} /></FormControl></FormItem>} />
        <FormField control={form.control} name="committee" render={({ field }) => <FormItem className="flex-grow w-full"><FormLabel>Committee</FormLabel><Select onValueChange={field.onChange} value={field.value}><FormControl><SelectTrigger><SelectValue placeholder="Select..." /></SelectTrigger></FormControl><SelectContent>{committees?.map((c: T.Committee) => <SelectItem key={c.id} value={c.name}>{c.name}</SelectItem>)}</SelectContent></Select></FormItem>} />
        <Button type="submit" className="w-full md:w-auto"><PlusCircle className="mr-2 h-4 w-4" /> Add Country</Button>
    </form></Form>;
}

function AddCommitteeForm({ onAdd }: { onAdd: (data: any, form: any) => Promise<void> }) {
    const form = useForm({ defaultValues: { name: '', chairName: '', chairBio: '', chairImageUrl: '', topics: '', backgroundGuideUrl: '' } });
    
    return <Form {...form}><form onSubmit={form.handleSubmit((d) => onAdd(d, form))} className="space-y-4">
        <div className="grid md:grid-cols-2 gap-4">
            <FormField control={form.control} name="name" render={({ field }) => ( <FormItem><FormLabel>Committee Name</FormLabel><FormControl><Input {...field} /></FormControl></FormItem> )} />
            <FormField control={form.control} name="chairName" render={({ field }) => ( <FormItem><FormLabel>Chair Name</FormLabel><FormControl><Input {...field} /></FormControl></FormItem> )} />
        </div>
         <FormField control={form.control} name="chairImageUrl" render={({ field }) => ( <FormItem><FormLabel>Chair Image URL</FormLabel><FormControl><Input {...field} /></FormControl><p className="text-xs text-muted-foreground">Provide a direct image link.</p></FormItem> )} />
        <FormField control={form.control} name="chairBio" render={({ field }) => ( <FormItem><FormLabel>Chair Bio</FormLabel><FormControl><Textarea {...field} rows={3} /></FormControl></FormItem> )} />
        <FormField control={form.control} name="topics" render={({ field }) => ( <FormItem><FormLabel>Topics (one per line)</FormLabel><FormControl><Textarea {...field} rows={3}/></FormControl></FormItem> )} />
        <FormField control={form.control} name="backgroundGuideUrl" render={({ field }) => ( <FormItem><FormLabel>Background Guide URL</FormLabel><FormControl><Input {...field} /></FormControl></FormItem> )} />
        <Button type="submit"><PlusCircle className="mr-2" />Add Committee</Button>
    </form></Form>;
}

const SectionCard: React.FC<{
  title: string;
  description: string;
  icon: React.ElementType;
  children: React.ReactNode;
}> = ({ title, description, icon: Icon, children }) => (
    <Card className="animate-fade-in-up">
        <CardHeader>
            <div className="flex items-start gap-4">
                 <Icon className="h-8 w-8 text-muted-foreground" />
                 <div>
                    <CardTitle>{title}</CardTitle>
                    <CardDescription>{description}</CardDescription>
                 </div>
            </div>
        </CardHeader>
        <CardContent>{children}</CardContent>
    </Card>
);

export default function ConferenceTab() {
    const { toast } = useToast();
    const [loading, setLoading] = useState(true);
    const [data, setData] = useState<{ committees: T.Committee[], countries: T.Country[], schedule: T.ScheduleDay[] }>({
      committees: [],
      countries: [],
      schedule: []
    });

    const loadData = useCallback(async () => {
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
        return <div className="space-y-4"><Skeleton className="h-64 w-full" /><Skeleton className="h-64 w-full" /><Skeleton className="h-64 w-full" /></div>;
    }
    
    return (
        <div className="space-y-6">
             <SectionCard title="Committees" description="Manage committees, chairs, and topics." icon={Library}>
                <div className="grid md:grid-cols-5 gap-8">
                     <div className="md:col-span-2">
                        <h4 className="font-semibold mb-4 text-center">Add New Committee</h4>
                        <AddCommitteeForm onAdd={(values, form) => handleAction(firebaseService.addCommittee(values), "Committee Added!", form)}/>
                    </div>
                     <div className="md:col-span-3">
                         <h4 className="font-semibold mb-4 text-center">Existing Committees</h4>
                        <div className="border rounded-md max-h-96 overflow-y-auto">
                            <Table><TableHeader><TableRow><TableHead>Committee</TableHead><TableHead>Chair</TableHead><TableHead className="text-right">Actions</TableHead></TableRow></TableHeader>
                            <TableBody>
                                {data.committees?.map((c: T.Committee) => (
                                    <TableRow key={c.id}>
                                        <TableCell>{c.name}</TableCell><TableCell>{c.chair.name}</TableCell>
                                        <TableCell className="text-right">
                                            <Button variant="ghost" size="icon" onClick={() => handleDeleteItem(firebaseService.deleteCommittee, c.id, "committee")}>
                                                <Trash2 className="h-4 w-4 text-destructive" />
                                            </Button>
                                        </TableCell>
                                    </TableRow>
                                ))}
                            </TableBody></Table>
                        </div>
                    </div>
                </div>
            </SectionCard>

            <SectionCard title="Country Matrix" description="Manage country assignments for each committee." icon={Globe}>
                <AddCountryForm committees={data.committees} onAdd={(values, form) => handleAction(firebaseService.addCountry(values), "Country Added!", form)} />
                <div className="border rounded-md max-h-[30rem] overflow-y-auto">
                    <Table><TableHeader><TableRow><TableHead>Country</TableHead><TableHead>Committee</TableHead><TableHead>Status</TableHead><TableHead className="text-right">Actions</TableHead></TableRow></TableHeader>
                    <TableBody>
                        {data.countries?.map((country: T.Country) => (
                            <TableRow key={country.id}>
                                <TableCell>{country.name}</TableCell><TableCell>{country.committee}</TableCell>
                                <TableCell><Badge variant={country.status === 'Available' ? 'secondary' : 'default'}>{country.status}</Badge></TableCell>
                                <TableCell className="text-right flex items-center justify-end gap-2">
                                    <Switch title={`Mark as ${country.status === 'Available' ? 'Assigned' : 'Available'}`} checked={country.status === 'Assigned'} onCheckedChange={() => {
                                        const newStatus = country.status === 'Available' ? 'Assigned' : 'Available';
                                        handleAction(firebaseService.updateCountryStatus(country.id, { status: newStatus }), "Country status updated.");
                                    }} />
                                    <Button variant="ghost" size="icon" onClick={() => handleDeleteItem(firebaseService.deleteCountry, country.id, "country")}> <Trash2 className="h-4 w-4 text-destructive" /></Button>
                                </TableCell>
                            </TableRow>
                        ))}
                    </TableBody></Table>
                </div>
            </SectionCard>

            <SectionCard title="Conference Schedule" description="Manage the event schedule for each day of the conference." icon={CalendarDays}>
                <div className="grid md:grid-cols-2 gap-8">
                    <div className="space-y-4">
                        {data.schedule?.map((day: T.ScheduleDay) => (
                            <Card key={day.id} className="w-full">
                                <CardHeader>
                                    <div className="flex justify-between items-start">
                                        <div>
                                            <CardTitle>{day.title} - {day.date}</CardTitle>
                                        </div>
                                        <Button variant="ghost" size="icon" onClick={() => handleDeleteItem(firebaseService.deleteScheduleDay, day.id, 'day')}><Trash2 className="text-destructive h-4 w-4"/></Button>
                                    </div>
                                </CardHeader>
                                <CardContent>
                                    {day.events.length > 0 ? day.events.map((event: T.ScheduleEvent) => (
                                        <ScheduleEventForm
                                            key={event.id} day={day} event={event}
                                            onSave={(id, saveData) => handleAction(firebaseService.updateScheduleEvent(id, saveData), "Event updated.")}
                                            onDelete={(id) => handleDeleteItem(firebaseService.deleteScheduleEvent, id, "event")}
                                        />
                                    )) : <p className="text-sm text-muted-foreground text-center py-4">No events for this day.</p>}
                                    <AddScheduleEventForm dayId={day.id} onAdd={(eventData, form) => handleAction(firebaseService.addScheduleEvent(eventData), "Event added.", form)} />
                                </CardContent>
                            </Card>
                        ))}
                    </div>
                     <div>
                        <h4 className="font-semibold mb-4 text-center">Add New Day</h4>
                        <AddScheduleDayForm onAdd={(dayData, form) => handleAction(firebaseService.addScheduleDay(dayData), "Day Added!", form)} />
                     </div>
                </div>
            </SectionCard>
        </div>
    );
}
