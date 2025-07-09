"use client";

import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion";
import { Upload, FileText } from "lucide-react";
import { useToast } from "@/hooks/use-toast";

function PaperUploadForm() {
    const { toast } = useToast();

    const handleSubmit = (event: React.FormEvent<HTMLFormElement>) => {
        event.preventDefault();
        const form = event.currentTarget;
        const fileInput = form.elements.namedItem('paperFile') as HTMLInputElement;
        if (fileInput && fileInput.files && fileInput.files.length > 0) {
            toast({
                title: "File Uploaded",
                description: `${fileInput.files[0].name} has been submitted successfully.`,
            });
            form.reset();
        } else {
             toast({
                title: "No File Selected",
                description: "Please select a file to upload.",
                variant: "destructive"
            });
        }
    }

    return (
        <form onSubmit={handleSubmit} className="space-y-4">
            <Input id="paperFile" name="paperFile" type="file" accept=".pdf,.doc,.docx" />
            <Button type="submit" className="w-full">
                <Upload className="mr-2 h-4 w-4" /> Upload Paper
            </Button>
        </form>
    )
}

export default function DocumentsPage() {
  return (
    <div className="container mx-auto px-4 py-12 md:py-20">
      <div className="text-center mb-12">
        <h1 className="text-4xl md:text-5xl font-bold font-headline text-foreground">Conference Documents</h1>
        <p className="mt-4 text-lg text-muted-foreground max-w-2xl mx-auto">
          Access important resources and upload your position papers here.
        </p>
      </div>

      <div className="grid lg:grid-cols-2 gap-12 items-start">
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2"><Upload className="w-6 h-6 text-primary"/> Position Paper Upload</CardTitle>
            <CardDescription>
              Please upload your position papers in PDF or DOCX format. The deadline for submission is January 15, 2025.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <PaperUploadForm />
          </CardContent>
        </Card>
        
        <Card>
            <CardHeader>
                <CardTitle className="flex items-center gap-2"><FileText className="w-6 h-6 text-primary" /> Code of Conduct</CardTitle>
                <CardDescription>All delegates are expected to adhere to the code of conduct throughout the conference.</CardDescription>
            </CardHeader>
            <CardContent>
                <Accordion type="single" collapsible className="w-full">
                    <AccordionItem value="item-1">
                        <AccordionTrigger>Respect and Decorum</AccordionTrigger>
                        <AccordionContent>
                        Delegates must maintain a professional and respectful demeanor at all times. This includes respectful language and behavior towards all participants, staff, and faculty. Personal attacks are strictly prohibited.
                        </AccordionContent>
                    </AccordionItem>
                    <AccordionItem value="item-2">
                        <AccordionTrigger>Plagiarism</AccordionTrigger>
                        <AccordionContent>
                        All work, including position papers and draft resolutions, must be the original work of the delegate. Plagiarism will result in immediate disqualification from awards and may lead to removal from the conference.
                        </AccordionContent>
                    </AccordionItem>
                    <AccordionItem value="item-3">
                        <AccordionTrigger>Punctuality and Attendance</AccordionTrigger>
                        <AccordionContent>
                        Delegates are expected to be present and on time for all mandatory events, including all committee sessions and ceremonies. Absence without prior notification may affect eligibility for awards.
                        </AccordionContent>
                    </AccordionItem>
                     <AccordionItem value="item-4">
                        <AccordionTrigger>Electronic Device Policy</AccordionTrigger>
                        <AccordionContent>
                        Use of electronic devices is permitted for research purposes only during committee sessions. Devices must be silenced and should not be used for social media, games, or other non-conference activities.
                        </AccordionContent>
                    </AccordionItem>
                </Accordion>
            </CardContent>
        </Card>
      </div>
    </div>
  );
}
