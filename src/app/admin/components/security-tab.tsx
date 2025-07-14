
"use client";

import React from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { useAuth } from "@/context/auth-context";
import { Button } from "@/components/ui/button";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { KeyRound } from "lucide-react";
import * as authService from "@/lib/auth-service";

const changePasswordSchema = z.object({
    currentPassword: z.string().min(6, "Password must be at least 6 characters."),
    newPassword: z.string().min(6, "New password must be at least 6 characters."),
    confirmPassword: z.string()
}).refine(data => data.newPassword === data.confirmPassword, {
    message: "New passwords do not match.",
    path: ["confirmPassword"],
});


export default function SecurityTab({ toast }: any) {
    const { user } = useAuth();
    const changePasswordForm = useForm<z.infer<typeof changePasswordSchema>>({ 
        resolver: zodResolver(changePasswordSchema), 
        defaultValues: {currentPassword: "", newPassword: "", confirmPassword: ""}
    });

    const handleChangePassword = async (values: z.infer<typeof changePasswordSchema>) => {
        if (!user || !user.email) {
            toast({ title: "Error", description: "No user is logged in.", variant: "destructive" });
            return;
        }
        try {
            await authService.reauthenticateAndChangePassword(user.email, values.currentPassword, values.newPassword);
            toast({ title: "Success", description: "Your password has been changed." });
            changePasswordForm.reset();
        } catch (error) {
            toast({ title: "Error Changing Password", description: error instanceof Error ? error.message : "An unknown error occurred.", variant: "destructive" });
        }
    }

    return (
        <Card>
            <CardHeader>
                <CardTitle className="flex items-center gap-2"><KeyRound /> Change Password</CardTitle>
                <CardDescription>Update the password for your admin account.</CardDescription>
            </CardHeader>
            <CardContent>
                <Form {...changePasswordForm}>
                    <form onSubmit={changePasswordForm.handleSubmit(handleChangePassword)} className="space-y-4 max-w-sm">
                        <FormField
                            control={changePasswordForm.control}
                            name="currentPassword"
                            render={({ field }) => (
                                <FormItem>
                                    <FormLabel>Current Password</FormLabel>
                                    <FormControl><Input type="password" {...field} /></FormControl>
                                    <FormMessage />
                                </FormItem>
                            )}
                        />
                        <FormField
                            control={changePasswordForm.control}
                            name="newPassword"
                            render={({ field }) => (
                                <FormItem>
                                    <FormLabel>New Password</FormLabel>
                                    <FormControl><Input type="password" {...field} /></FormControl>
                                    <FormMessage />
                                </FormItem>
                            )}
                        />
                        <FormField
                            control={changePasswordForm.control}
                            name="confirmPassword"
                            render={({ field }) => (
                                <FormItem>
                                    <FormLabel>Confirm New Password</FormLabel>
                                    <FormControl><Input type="password" {...field} /></FormControl>
                                    <FormMessage />
                                </FormItem>
                            )}
                        />
                        <Button type="submit" disabled={changePasswordForm.formState.isSubmitting}>
                            {changePasswordForm.formState.isSubmitting ? "Updating..." : "Update Password"}
                        </Button>
                    </form>
                </Form>
            </CardContent>
        </Card>
    );
}
