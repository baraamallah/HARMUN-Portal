
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

        <Tabs defaultValue="dashboard" className="w-full flex flex-col md:flex-row md:items-start gap-4" orientation="vertical">
            <TabsList className="flex md:flex-col overflow-x-auto md:overflow-x-visible w-full md:w-48 lg:w-56 p-2 md:h-full shrink-0">
                <TabsTrigger value="dashboard" className="justify-start gap-2 min-h-12 whitespace-nowrap"><LayoutDashboard className="shrink-0"/> <span className="hidden sm:inline">Dashboard</span></TabsTrigger>
                <TabsTrigger value="pages" className="justify-start gap-2 min-h-12 whitespace-nowrap"><FileText className="shrink-0"/> <span className="hidden sm:inline">Pages</span></TabsTrigger>
                <TabsTrigger value="conference" className="justify-start gap-2 min-h-12 whitespace-nowrap"><Library className="shrink-0"/> <span className="hidden sm:inline">Conference</span></TabsTrigger>
                <TabsTrigger value="gallery" className="justify-start gap-2 min-h-12 whitespace-nowrap"><GalleryHorizontal className="shrink-0"/> <span className="hidden sm:inline">Gallery</span></TabsTrigger>
                <TabsTrigger value="settings" className="justify-start gap-2 min-h-12 whitespace-nowrap"><Settings className="shrink-0"/> <span className="hidden sm:inline">Settings</span></TabsTrigger>
                <TabsTrigger value="security" className="justify-start gap-2 min-h-12 whitespace-nowrap"><ShieldCheck className="shrink-0"/> <span className="hidden sm:inline">Security</span></TabsTrigger>
            </TabsList>

            <div className="flex-1 w-full">
              <TabsContent value="dashboard" className="mt-0">
                <DashboardTab />
              </TabsContent>

              <TabsContent value="pages" className="mt-0">
                <PagesTab />
              </TabsContent>

              <TabsContent value="conference" className="mt-0">
                <ConferenceTab />
              </TabsContent>

              <TabsContent value="gallery" className="mt-0">
                <GalleryTab />
              </TabsContent>

              <TabsContent value="settings" className="mt-0">
                <SettingsTab />
              </TabsContent>

              <TabsContent value="security" className="mt-0">
                <SecurityTab toast={toast}/>
              </TabsContent>
            </div>
        </Tabs>
    </div>
  );
}
