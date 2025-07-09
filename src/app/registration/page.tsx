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
import type { Country } from "@/lib/types";
import { getCountries } from "@/lib/firebase-service";
import { Skeleton } from "@/components/ui/skeleton";

const formSchema = z.object({
  fullName: z.string().min(2, { message: "Full name must be at least 2 characters." }),
  email: z.string().email({ message: "Please enter a valid email address." }),
  school: z.string().min(3, { message: "School name is required." }),
  committee1: z.string({ required_error: "Please select a committee preference." }),
  committee2: z.string({ required_error: "Please select a committee preference." }),
  committee3: z.string({ required_error: "Please select a committee preference." }),
});

const committees = ['Security Council (SC)', 'World Health Organization (WHO)', 'Human Rights Council (HRC)', 'United Nations Environment Programme (UNEP)'];

export default function RegistrationPage() {
  const { toast } = useToast();
  const [countries, setCountries] = useState<Country[]>([]);
  const [loadingMatrix, setLoadingMatrix] = useState(true);

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      fullName: "",
      email: "",
      school: "",
    },
  });

  useEffect(() => {
    async function fetchCountries() {
        try {
            const fetchedCountries = await getCountries();
            setCountries(fetchedCountries);
        } catch (error) {
            console.error("Failed to fetch countries:", error);
            toast({
                title: "Error",
                description: "Could not load the country matrix.",
                variant: "destructive",
            });
        } finally {
            setLoadingMatrix(false);
        }
    }
    fetchCountries();
  }, [toast]);

  function onSubmit(values: z.infer<typeof formSchema>) {
    console.log(values);
    toast({
      title: "Registration Submitted!",
      description: "Thank you for registering. A confirmation has been sent to your email.",
    });
    form.reset();
  }

  return (
    <div className="container mx-auto px-4 py-12 md:py-20">
      <div className="text-center mb-12">
        <h1 className="text-4xl md:text-5xl font-bold font-headline text-primary">Delegate Registration</h1>
        <p className="mt-4 text-lg text-muted-foreground max-w-2xl mx-auto">
          Complete the form below to register for HARMUN 2025. Fields marked with an asterisk (*) are required.
        </p>
      </div>
      <div className="grid lg:grid-cols-5 gap-12">
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
                          <SelectContent>{committees.map(c => <SelectItem key={c} value={c}>{c}</SelectItem>)}</SelectContent>
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
                          <SelectContent>{committees.map(c => <SelectItem key={c} value={c}>{c}</SelectItem>)}</SelectContent>
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
                          <SelectContent>{committees.map(c => <SelectItem key={c} value={c}>{c}</SelectItem>)}</SelectContent>
                        </Select>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  <Button type="submit" size="lg" className="w-full bg-accent text-accent-foreground hover:bg-accent/90">Submit Registration</Button>
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
                                {loadingMatrix ? (
                                    Array.from({ length: 10 }).map((_, i) => (
                                        <TableRow key={i}>
                                            <TableCell><Skeleton className="h-5 w-24" /></TableCell>
                                            <TableCell><Skeleton className="h-5 w-32" /></TableCell>
                                            <TableCell><Skeleton className="h-5 w-16" /></TableCell>
                                        </TableRow>
                                    ))
                                ) : countries.length > 0 ? (
                                    countries.map((country) => (
                                        <TableRow key={country.id}>
                                            <TableCell className="font-medium">{country.name}</TableCell>
                                            <TableCell>{country.committee}</TableCell>
                                            <TableCell className={country.status === 'Available' ? 'text-green-600' : 'text-red-600'}>{country.status}</TableCell>
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
