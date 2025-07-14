
"use client";

import React from "react";
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
import { convertGoogleDriveLink } from "@/lib/utils";
import { Wand2 } from "lucide-react";

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

    const handleConvertUrl = () => {
        const url = form.getValues("imageUrl");
        form.setValue("imageUrl", convertGoogleDriveLink(url), { shouldValidate: true });
    }
    
    return (
        <Form {...form}>
            <form onSubmit={form.handleSubmit((data) => onSave(member.id, data, form))} className="flex flex-wrap lg:flex-nowrap gap-2 items-start p-2 border rounded-md mb-2">
                <FormField control={form.control} name="name" render={({ field }) => <FormItem><FormLabel>Name</FormLabel><FormControl><Input {...field} /></FormControl><FormMessage /></FormItem>} />
                <FormField control={form.control} name="role" render={({ field }) => <FormItem><FormLabel>Role</FormLabel><FormControl><Input {...field} /></FormControl><FormMessage /></FormItem>} />
                <FormField control={form.control} name="imageUrl" render={({ field }) => <FormItem><FormLabel>Image URL</FormLabel><div className="flex gap-2"><FormControl><Input {...field} /></FormControl><Button type="button" variant="outline" size="icon" onClick={handleConvertUrl}><Wand2 className="h-4 w-4"/></Button></div><FormMessage /></FormItem>} />
                <FormField control={form.control} name="bio" render={({ field }) => <FormItem className="flex-grow w-full lg:w-auto"><FormLabel>Bio</FormLabel><FormControl><Textarea {...field} rows={1} /></FormControl><FormMessage /></FormItem>} />
                <div className="flex gap-1 pt-6"><Button type="submit" size="sm">Save</Button><Button size="sm" variant="destructive" type="button" onClick={() => onDelete(member.id)}>Delete</Button></div>
            </form>
        </Form>
    );
}


function AddSecretariatMemberForm({ onAdd }: { onAdd: (data: any, form: any) => Promise<void> }) {
    const form = useForm({ resolver: zodResolver(secretariatMemberSchema), defaultValues: { name: '', role: '', imageUrl: '', bio: '' } });

    const handleConvertUrl = () => {
        const url = form.getValues("imageUrl");
        form.setValue("imageUrl", convertGoogleDriveLink(url), { shouldValidate: true });
    }
    
    return <Form {...form}><form onSubmit={form.handleSubmit((d) => onAdd(d, form))} className="flex flex-wrap lg:flex-nowrap gap-2 items-end p-2 border-t mt-4">
        <FormField control={form.control} name="name" render={({ field }) => <FormItem><FormLabel>Name</FormLabel><FormControl><Input {...field} /></FormControl><FormMessage /></FormItem>} />
        <FormField control={form.control} name="role" render={({ field }) => <FormItem><FormLabel>Role</FormLabel><FormControl><Input {...field} /></FormControl><FormMessage /></FormItem>} />
        <FormField control={form.control} name="imageUrl" render={({ field }) => <FormItem><FormLabel>Image URL</FormLabel><div className="flex gap-2"><FormControl><Input {...field} /></FormControl><Button type="button" variant="outline" size="icon" onClick={handleConvertUrl}><Wand2 className="h-4 w-4"/></Button></div><FormDescription>Use a standard image URL or a Google Drive "share" link.</FormDescription><FormMessage /></FormItem>} />
        <FormField control={form.control} name="bio" render={({ field }) => <FormItem className="flex-grow w-full lg:w-auto"><FormLabel>Bio</FormLabel><FormControl><Textarea {...field} rows={1} /></FormControl><FormMessage /></FormItem>} />
        <Button type="submit" size="sm">Add Member</Button>
    </form></Form>;
}

export default function TeamTab({ data, handleAddItem, handleUpdateItem, handleDeleteItem }: any) {
    return (
        <Card>
            <CardHeader><CardTitle>Secretariat Members</CardTitle></CardHeader>
            <CardContent>
                {data.secretariat?.map((member: T.SecretariatMember) => (
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
