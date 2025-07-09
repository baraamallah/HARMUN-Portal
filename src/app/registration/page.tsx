"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import * as z from "zod";
import React, { useEffect, useState } from "react";

import { Button } from "@/components/ui/button";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Input } from "@/components/ui/input";
import { useToast } from "@/hooks/use-toast";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import type { Country, Committee, RegistrationPageContent } from "@/lib/types";
import { getCountries, getCommittees, getRegistrationPageContent } from "@/lib/firebase-service";
import { Skeleton } from "@/components/ui/skeleton";
import { Badge } from "@/components/ui/badge";

const formSchema = z.object({
  fullName: z.string().min(2, { message: "Full name must be at least 2 characters." }),
  email: z.string().email({ message: "Please enter a valid email address." }),
  school: z.string().min(3, { message: "School name is required." }),
  committee1: z.string({ required_error: "Please select a committee preference." }),
  committee2: z.string({ required_error: "Please select a committee preference." }),
  committee3: z.string({ required_error: "Please select a committee preference." }),
});

export default function RegistrationPage() {
  const { toast } = useToast();
  const [content, setContent] = useState<RegistrationPageContent | null>(null);
  const [countries, setCountries] = useState<Country[]>([]);
  const [committees, setCommittees] = useState<Committee[]>([]);
  const [loading, setLoading] = useState(true);

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      fullName: "",
      email: "",
      school: "",
    },
  });

  useEffect(() => {
    async function fetchData() {
        try {
            const [fetchedContent, fetchedCountries, fetchedCommittees] = await Promise.all([
                getRegistrationPageContent(),
                getCountries(),
                getCommittees(),
            ]);
            setContent(fetchedContent);
            setCountries(fetchedCountries);
            setCommittees(fetchedCommittees);
        } catch (error) {
            console.error("Failed to fetch page data:", error);
            toast({
                title: "Error",
                description: "Could not load page data.",
                variant: "destructive",
            });
        } finally {
            setLoading(false);
        }
    }
    fetchData();
  }, [toast]);

  function onSubmit(values: z.infer<typeof formSchema>) {
    console.log(values);
    toast({
      title: "Registration Submitted!",
      description: "Thank you for registering. A confirmation has been sent to your email.",
    });
    form.reset();
  }
  
  if (loading) {
    return (
        <div className="container mx-auto px-4 py-12 md:py-20">
            <div className="text-center mb-12">
                <Skeleton className="h-12 w-3/4 mx-auto" />
                <Skeleton className="h-6 w-1/2 mx-auto mt-4" />
            </div>
            <div className="grid lg:grid-cols-5 gap-12">
                <div className="lg:col-span-3"><Skeleton className="h-[500px] w-full" /></div>
                <div className="lg:col-span-2"><Skeleton className="h-[500px] w-full" /></div>
            </div>
        </div>
    )
  }

  return (
    <div className="container mx-auto px-4 py-12 md:py-20">
      <div className="text-center mb-12 animate-fade-in-up">
        <h1 className="text-4xl md:text-5xl font-bold font-headline text-foreground">{content?.title}</h1>
        <p className="mt-4 text-lg text-muted-foreground max-w-2xl mx-auto">
          {content?.subtitle}
        </p>
      </div>
      <div className="grid lg:grid-cols-5 gap-12 animate-fade-in-up" style={{ animationDelay: '200ms' }}>
        <div className="lg:col-span-3">
          <Card>
            <CardHeader><CardTitle>Registration Form</CardTitle></CardHeader>
            <CardContent>
              <Form {...form}>
                <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-8">
                  <FormField
                    control={form.control}
                    name="fullName"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Full Name *</FormLabel>
                        <FormControl><Input placeholder="John Doe" {...field} /></FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  <FormField
                    control={form.control}
                    name="email"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Email Address *</FormLabel>
                        <FormControl><Input placeholder="delegate@example.com" {...field} /></FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  <FormField
                    control={form.control}
                    name="school"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>School/University *</FormLabel>
                        <FormControl><Input placeholder="International University" {...field} /></FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  <h3 className="text-lg font-semibold pt-4">Committee Preferences *</h3>
                  <FormField
                    control={form.control}
                    name="committee1"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>First Choice</FormLabel>
                        <Select onValueChange={field.onChange} defaultValue={field.value}>
                          <FormControl><SelectTrigger><SelectValue placeholder="Select a committee" /></SelectTrigger></FormControl>
                          <SelectContent>{committees.map(c => <SelectItem key={c.id} value={c.name}>{c.name}</SelectItem>)}</SelectContent>
                        </Select>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                   <FormField
                    control={form.control}
                    name="committee2"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Second Choice</FormLabel>
                        <Select onValueChange={field.onChange} defaultValue={field.value}>
                          <FormControl><SelectTrigger><SelectValue placeholder="Select a committee" /></SelectTrigger></FormControl>
                          <SelectContent>{committees.map(c => <SelectItem key={c.id} value={c.name}>{c.name}</SelectItem>)}</SelectContent>
                        </Select>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                   <FormField
                    control={form.control}
                    name="committee3"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Third Choice</FormLabel>
                        <Select onValueChange={field.onChange} defaultValue={field.value}>
                          <FormControl><SelectTrigger><SelectValue placeholder="Select a committee" /></SelectTrigger></FormControl>
                          <SelectContent>{committees.map(c => <SelectItem key={c.id} value={c.name}>{c.name}</SelectItem>)}</SelectContent>
                        </Select>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  <Button type="submit" size="lg" className="w-full">Submit Registration</Button>
                </form>
              </Form>
            </CardContent>
          </Card>
        </div>
        <div className="lg:col-span-2">
            <Card>
                <CardHeader><CardTitle>Country Matrix</CardTitle></CardHeader>
                <CardContent>
                    <p className="text-muted-foreground mb-4">Check the availability of countries in each committee.</p>
                    <div className="max-h-96 overflow-y-auto">
                        <Table>
                            <TableHeader>
                                <TableRow>
                                    <TableHead>Country</TableHead>
                                    <TableHead>Committee</TableHead>
                                    <TableHead>Status</TableHead>
                                </TableRow>
                            </TableHeader>
                            <TableBody>
                                {countries.length > 0 ? (
                                    countries.map((country) => (
                                        <TableRow key={country.id}>
                                            <TableCell className="font-medium">{country.name}</TableCell>
                                            <TableCell>{country.committee}</TableCell>
                                            <TableCell>
                                                <Badge variant={country.status === 'Available' ? 'secondary' : 'default'}>
                                                    {country.status}
                                                </Badge>
                                            </TableCell>
                                        </TableRow>
                                    ))
                                ) : (
                                    <TableRow>
                                        <TableCell colSpan={3} className="text-center">No countries assigned yet.</TableCell>
                                    </TableRow>
                                )}
                            </TableBody>
                        </Table>
                    </div>
                </CardContent>
            </Card>
        </div>
      </div>
    </div>
  );
}
