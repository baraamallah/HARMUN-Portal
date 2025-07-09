"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import * as z from "zod";

import { Button } from "@/components/ui/button";
import {
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { useToast } from "@/hooks/use-toast";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Paintbrush, Type } from "lucide-react";

// For now, we are just creating the UI. In a real app, these values would
// come from and be saved to a database like Firestore.

const themeFormSchema = z.object({
  primaryColor: z.string().regex(/^(\d{1,3})\s(\d{1,3})%\s(\d{1,3})%$/, "Must be a valid HSL string (e.g., 227 66% 32%)"),
  backgroundColor: z.string().regex(/^(\d{1,3})\s(\d{1,3})%\s(\d{1,3})%$/, "Must be a valid HSL string (e.g., 210 17% 98%)"),
  accentColor: z.string().regex(/^(\d{1,3})\s(\d{1,3})%\s(\d{1,3})%$/, "Must be a valid HSL string (e.g., 47 96% 52%)"),
});

const contentFormSchema = z.object({
    heroTitle: z.string().min(5, "Title must be at least 5 characters."),
    heroSubtitle: z.string().min(10, "Subtitle must be at least 10 characters."),
});

export default function AdminPage() {
  const { toast } = useToast();

  const themeForm = useForm<z.infer<typeof themeFormSchema>>({
    resolver: zodResolver(themeFormSchema),
    defaultValues: {
      // These default values would be fetched from the database
      primaryColor: "227 66% 32%",
      backgroundColor: "210 17% 98%",
      accentColor: "47 96% 52%",
    },
  });

  const contentForm = useForm<z.infer<typeof contentFormSchema>>({
    resolver: zodResolver(contentFormSchema),
    defaultValues: {
      // These default values would be fetched from the database
      heroTitle: "HARMUN 2025 Portal",
      heroSubtitle: "Engage in diplomacy, foster international cooperation, and shape the future. Welcome, delegates!",
    },
  });

  function onThemeSubmit(values: z.infer<typeof themeFormSchema>) {
    console.log("Theme values:", values);
    // In a real app, you'd save these values to your database
    // and then trigger a refresh or a mechanism to update the CSS variables.
    toast({
      title: "Theme Updated!",
      description: "Color settings have been saved.",
    });
  }

  function onContentSubmit(values: z.infer<typeof contentFormSchema>) {
    console.log("Content values:", values);
    // In a real app, you'd save these values to your database.
    // The home page would then fetch this content to display it.
    toast({
      title: "Content Updated!",
      description: "Home page content has been saved.",
    });
  }

  return (
    <div className="space-y-8">
        <div className="text-left">
            <h1 className="text-3xl font-bold">Admin Dashboard</h1>
            <p className="text-muted-foreground">Manage your conference website content and settings here.</p>
        </div>

        <div className="grid lg:grid-cols-2 gap-8 items-start">
            <Card>
                <CardHeader>
                    <CardTitle className="flex items-center gap-2"><Paintbrush className="w-6 h-6" /> Theme Customization</CardTitle>
                    <CardDescription>
                        Change the look and feel of your website. Enter HSL values without 'hsl()'.
                    </CardDescription>
                </CardHeader>
                <CardContent>
                    <Form {...themeForm}>
                        <form onSubmit={themeForm.handleSubmit(onThemeSubmit)} className="space-y-6">
                            <FormField
                                control={themeForm.control}
                                name="primaryColor"
                                render={({ field }) => (
                                <FormItem>
                                    <FormLabel>Primary Color</FormLabel>
                                    <FormControl><Input placeholder="e.g., 227 66% 32%" {...field} /></FormControl>
                                    <FormDescription>Used for main buttons, links, and highlights.</FormDescription>
                                    <FormMessage />
                                </FormItem>
                                )}
                            />
                            <FormField
                                control={themeForm.control}
                                name="backgroundColor"
                                render={({ field }) => (
                                <FormItem>
                                    <FormLabel>Background Color</FormLabel>
                                    <FormControl><Input placeholder="e.g., 210 17% 98%" {...field} /></FormControl>
                                    <FormDescription>The main background color for most pages.</FormDescription>
                                    <FormMessage />
                                </FormItem>
                                )}
                            />
                             <FormField
                                control={themeForm.control}
                                name="accentColor"
                                render={({ field }) => (
                                <FormItem>
                                    <FormLabel>Accent Color</FormLabel>
                                    <FormControl><Input placeholder="e.g., 47 96% 52%" {...field} /></FormControl>
                                    <FormDescription>Used for call-to-action buttons and special highlights.</FormDescription>
                                    <FormMessage />
                                </FormItem>
                                )}
                            />
                            <Button type="submit" className="w-full">Save Theme</Button>
                        </form>
                    </Form>
                </CardContent>
            </Card>

            <Card>
                <CardHeader>
                    <CardTitle className="flex items-center gap-2"><Type className="w-6 h-6" /> Home Page Content</CardTitle>
                    <CardDescription>
                        Edit the main text on your home page hero section.
                    </CardDescription>
                </CardHeader>
                <CardContent>
                    <Form {...contentForm}>
                        <form onSubmit={contentForm.handleSubmit(onContentSubmit)} className="space-y-6">
                            <FormField
                                control={contentForm.control}
                                name="heroTitle"
                                render={({ field }) => (
                                <FormItem>
                                    <FormLabel>Hero Title</FormLabel>
                                    <FormControl><Input {...field} /></FormControl>
                                    <FormMessage />
                                </FormItem>
                                )}
                            />
                            <FormField
                                control={contentForm.control}
                                name="heroSubtitle"
                                render={({ field }) => (
                                <FormItem>
                                    <FormLabel>Hero Subtitle</FormLabel>
                                    <FormControl><Textarea {...field} rows={4} /></FormControl>
                                    <FormMessage />
                                </FormItem>
                                )}
                            />
                            <Button type="submit" className="w-full">Save Content</Button>
                        </form>
                    </Form>
                </CardContent>
            </Card>
        </div>
    </div>
  );
}
