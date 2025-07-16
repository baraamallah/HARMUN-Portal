
"use client";

import React from "react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";

import DashboardTab from './components/dashboard-tab';
import PagesTab from './components/pages-tab';
import ConferenceTab from './components/conference-tab';
import SettingsTab from './components/settings-tab';
import SecurityTab from './components/security-tab';

export default function AdminPage() {
  return (
    <div className="space-y-8">
        <div className="text-left">
            <h1 className="text-3xl font-bold font-headline">Admin Dashboard</h1>
            <p className="text-muted-foreground">Manage your conference website content and settings here.</p>
        </div>

        <Tabs defaultValue="dashboard" className="w-full">
            <TabsList className="grid w-full grid-cols-2 sm:grid-cols-3 lg:grid-cols-5">
                <TabsTrigger value="dashboard">Dashboard</TabsTrigger>
                <TabsTrigger value="pages">Pages</TabsTrigger>
                <TabsTrigger value="conference">Conference</TabsTrigger>
                <TabsTrigger value="settings">Settings</TabsTrigger>
                <TabsTrigger value="security">Security</TabsTrigger>
            </TabsList>
            
            <TabsContent value="dashboard" className="mt-6">
              <DashboardTab />
            </TabsContent>

            <TabsContent value="pages" className="mt-6">
              <PagesTab />
            </TabsContent>

            <TabsContent value="conference" className="mt-6">
              <ConferenceTab />
            </TabsContent>

            <TabsContent value="settings" className="mt-6">
              <SettingsTab />
            </TabsContent>
            
            <TabsContent value="security" className="mt-6">
              <SecurityTab toast={() => {}}/>
            </TabsContent>
        </Tabs>
    </div>
  );
}

    
