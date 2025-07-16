
"use client";

import React from "react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { LayoutDashboard, FileText, Settings, ShieldCheck, Library, GalleryHorizontal } from "lucide-react";

import DashboardTab from './components/dashboard-tab';
import PagesTab from './components/pages-tab';
import ConferenceTab from './components/conference-tab';
import GalleryTab from "./components/gallery-tab";
import SettingsTab from './components/settings-tab';
import SecurityTab from './components/security-tab';
import { useToast } from "@/hooks/use-toast";

export default function AdminPage() {
  const { toast } = useToast();
  return (
    <div className="space-y-8">
        <div className="text-left">
            <h1 className="text-3xl font-bold font-headline">Admin Dashboard</h1>
            <p className="text-muted-foreground">Manage your conference website content and settings here.</p>
        </div>

        <Tabs defaultValue="dashboard" className="w-full" orientation="vertical">
            <TabsList className="grid h-full grid-cols-1 w-full md:w-48 lg:w-56 p-2">
                <TabsTrigger value="dashboard" className="justify-start gap-2"><LayoutDashboard/> Dashboard</TabsTrigger>
                <TabsTrigger value="pages" className="justify-start gap-2"><FileText/> Pages</TabsTrigger>
                <TabsTrigger value="conference" className="justify-start gap-2"><Library/> Conference</TabsTrigger>
                <TabsTrigger value="gallery" className="justify-start gap-2"><GalleryHorizontal/> Gallery</TabsTrigger>
                <TabsTrigger value="settings" className="justify-start gap-2"><Settings/> Settings</TabsTrigger>
                <TabsTrigger value="security" className="justify-start gap-2"><ShieldCheck/> Security</TabsTrigger>
            </TabsList>
            
            <TabsContent value="dashboard" className="mt-0 ml-4">
              <DashboardTab />
            </TabsContent>

            <TabsContent value="pages" className="mt-0 ml-4">
              <PagesTab />
            </TabsContent>

            <TabsContent value="conference" className="mt-0 ml-4">
              <ConferenceTab />
            </TabsContent>

             <TabsContent value="gallery" className="mt-0 ml-4">
              <GalleryTab />
            </TabsContent>

            <TabsContent value="settings" className="mt-0 ml-4">
              <SettingsTab />
            </TabsContent>
            
            <TabsContent value="security" className="mt-0 ml-4">
              <SecurityTab toast={toast}/>
            </TabsContent>
        </Tabs>
    </div>
  );
}
