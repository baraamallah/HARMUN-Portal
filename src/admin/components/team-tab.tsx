
"use client";

import React, { useState, useEffect } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";

import { Button } from "@/components/ui/button";
import { Form, FormControl, FormDescription, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import * as firebaseService from "@/lib/firebase-service";
import type * as T from "@/lib/types";
import { useToast } from "@/hooks/use-toast";
import { Skeleton } from "@/components/ui/skeleton";
import { convertGoogleDriveLink } from "@/lib/utils";

const secretariatMemberSchema = z.object({
  name: z.string().min(2, "Name is required."),
  role: z.string().min(2, "Role is required."),
  imageUrl: z.string().url("Must be a valid URL.").or(z.literal("")),
  bio: z.string(),
});

function SecretariatMemberForm({ member, onSave, onDelete }: { member: T.SecretariatMember; onSave: (id: string, data: Omit<T.SecretariatMember, 'id' | 'order'>, form: any) => void; onDelete: (id: string) => void }) {
    const form = useForm<z.infer<typeof secretariatMemberSchema>>({
        resolver: zodResolver(secretariatMemberSchema),
        defaultValues: member,
    });
    React.useEffect(() => { form.reset(member); }, [member, form]);
    
    const handleUrlChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const converted = convertGoogleDriveLink(e.target.value);
        form.setValue('imageUrl', converted);
    };
    
    return (
        <Form {...form}>
            <form onSubmit={form.handleSubmit((data) => onSave(member.id, data, form))} className="flex flex-wrap gap-2 items-start p-2 border rounded-md mb-2">
                <FormField control={form.control} name="name" render={({ field }) => <FormItem><FormLabel>Name</FormLabel><FormControl><Input {...field} /></FormControl><FormMessage /></FormItem>} />
                <FormField control={form.control} name="role" render={({ field }) => <FormItem><FormLabel>Role</FormLabel><FormControl><Input {...field} /></FormControl><FormMessage /></FormItem>} />
                <FormField control={form.control} name="imageUrl" render={({ field }) => <FormItem><FormLabel>Image URL</FormLabel><FormControl><Input {...field} onChange={handleUrlChange} /></FormControl><FormMessage /></FormItem>} />
                <FormField control={form.control} name="bio" render={({ field }) => <FormItem className="flex-grow w-full lg:w-auto"><FormLabel>Bio</FormLabel><FormControl><Textarea {...field} rows={1} /></FormControl><FormMessage /></FormItem>} />
                <div className="flex gap-1 pt-6"><Button type="submit" size="sm">Save</Button><Button size="sm" variant="destructive" type="button" onClick={() => onDelete(member.id)}>Delete</Button></div>
            </form>
        </Form>
    );
}


function AddSecretariatMemberForm({ onAdd }: { onAdd: (data: any, form: any) => Promise<void> }) {
    const form = useForm({ resolver: zodResolver(secretariatMemberSchema), defaultValues: { name: '', role: '', imageUrl: '', bio: '' } });
    
    const handleUrlChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const converted = convertGoogleDriveLink(e.target.value);
        form.setValue('imageUrl', converted);
    };
    
    return <Form {...form}><form onSubmit={form.handleSubmit((d) => onAdd(d, form))} className="flex flex-wrap gap-2 items-end p-2 border-t mt-4">
        <FormField control={form.control} name="name" render={({ field }) => <FormItem><FormLabel>Name</FormLabel><FormControl><Input {...field} /></FormControl><FormMessage /></FormItem>} />
        <FormField control={form.control} name="role" render={({ field }) => <FormItem><FormLabel>Role</FormLabel><FormControl><Input {...field} /></FormControl><FormMessage /></FormItem>} />
        <FormField control={form.control} name="imageUrl" render={({ field }) => <FormItem><FormLabel>Image URL</FormLabel><FormControl><Input {...field} onChange={handleUrlChange} /></FormControl><FormDescription>Provide a direct image link.</FormDescription><FormMessage /></FormItem>} />
        <FormField control={form.control} name="bio" render={({ field }) => <FormItem className="flex-grow w-full"><FormLabel>Bio</FormLabel><FormControl><Textarea {...field} rows={1} /></FormControl><FormMessage /></FormItem>} />
        <Button type="submit" size="sm">Add Member</Button>
    </form></Form>;
}

export default function TeamTab() {
    const { toast } = useToast();
    const [loading, setLoading] = useState(true);
    const [secretariat, setSecretariat] = useState<T.SecretariatMember[]>([]);
    
    useEffect(() => {
        const fetchData = async () => {
            setLoading(true);
            try {
                const members = await firebaseService.getSecretariat();
                setSecretariat(members);
            } catch (error) {
                console.error("Failed to fetch secretariat data:", error);
                toast({ title: "Error", description: `Could not load team members.`, variant: "destructive" });
            } finally {
                setLoading(false);
            }
        };
        fetchData();
    }, [toast]);
    
    const handleUpdateItem = async (updateFunction: Function, id: string, data: any, stateKey: string, message: string, form: any) => {
        try {
            const payload = { ...data };
            await updateFunction(id, payload);
            setSecretariat(prev => prev.map(item => item.id === id ? { ...item, ...payload } : item));
            toast({ title: "Success!", description: message });
        } catch (error) {
            toast({ title: "Error", description: `Could not save item. ${error instanceof Error ? error.message : ''}`, variant: "destructive" });
        }
    };
    
    const handleDeleteItem = async (deleteFunction: Function, id: string, stateKey: string, message: string) => {
        if (!confirm('Are you sure you want to delete this item?')) return;
        try {
            await deleteFunction(id);
            setSecretariat(prev => prev.filter(item => item.id !== id));
            toast({ title: "Success!", description: message });
        } catch (error) {
            toast({ title: "Error", description: `Could not delete item. ${error instanceof Error ? error.message : ''}`, variant: "destructive" });
        }
    };
    
    const handleAddItem = async (addFunction: Function, data: any, stateKey: string, message: string, form: any) => {
        try {
            const payload = { ...data };
            const newId = await addFunction(payload);
            const newItem = await firebaseService.getDocById(stateKey as string, newId);
            setSecretariat(prev => [...prev, newItem].sort((a,b) => (a.order || 0) - (b.order || 0)));
            toast({ title: "Success!", description: message });
            if (form) form.reset();
        } catch (error) {
            toast({ title: "Error", description: `Could not add item. ${error instanceof Error ? error.message : ''}`, variant: "destructive" });
        }
    };
    
    if (loading) {
        return <div className="space-y-4"><Skeleton className="h-24 w-full" /><Skeleton className="h-24 w-full" /><Skeleton className="h-24 w-full" /></div>;
    }

    return (
        <Card>
            <CardHeader><CardTitle>Secretariat Members</CardTitle></CardHeader>
            <CardContent>
                {secretariat?.map((member: T.SecretariatMember) => (
                    <SecretariatMemberForm
                        key={member.id}
                        member={member}
                        onSave={(id, saveData, form) => handleUpdateItem(firebaseService.updateSecretariatMember, id, saveData, "secretariat", "Member updated.", form)}
                        onDelete={(id) => handleDeleteItem(firebaseService.deleteSecretariatMember, id, "secretariat", "Member deleted.")}
                    />
                ))}
                <AddSecretariatMemberForm onAdd={(addData, form) => handleAddItem(firebaseService.addSecretariatMember, addData, "secretariat", "Member added!", form)} />
            </CardContent>
        </Card>
    );
}
