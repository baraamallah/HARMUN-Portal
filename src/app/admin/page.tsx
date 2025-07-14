
"use client";

import React, { useEffect, useState, useCallback } from "react";
import { useToast } from "@/hooks/use-toast";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Skeleton } from "@/components/ui/skeleton";
import * as firebaseService from "@/lib/firebase-service";

import DashboardTab from './components/dashboard-tab';
import PagesTab from './components/pages-tab';
import ConferenceTab from './components/conference-tab';
import TeamTab from './components/team-tab';
import GalleryTab from './components/gallery-tab';
import SettingsTab from './components/settings-tab';
import SecurityTab from './components/security-tab';
import { convertGoogleDriveLink } from "@/lib/utils";

type FetchedState = {
    [key: string]: boolean;
};

export default function AdminPage() {
  const { toast } = useToast();
  const [loading, setLoading] = useState(true);
  const [data, setData] = useState<any>({
    homeContent: {}, aboutContent: {}, registrationContent: {}, documentsContent: {}, galleryContent: {}, siteConfig: { socialLinks: [] },
    posts: [], countries: [], committees: [], secretariat: [], schedule: [], highlights: [], codeOfConduct: [], galleryItems: []
  });

  const [fetched, setFetched] = useState<FetchedState>({});

  const loadDataForTab = useCallback(async (tab: string) => {
    if (fetched[tab]) return;

    setLoading(true);
    try {
        let promises: Promise<any>[] = [];
        let keys: string[] = [];

        switch(tab) {
            case 'dashboard':
                promises = [firebaseService.getAllPosts(), firebaseService.getCountries(), firebaseService.getCommittees(), firebaseService.getSecretariat()];
                keys = ['posts', 'countries', 'committees', 'secretariat'];
                break;
            case 'pages':
                promises = [firebaseService.getHomePageContent(), firebaseService.getAboutPageContent(), firebaseService.getRegistrationPageContent(), firebaseService.getDocumentsPageContent(), firebaseService.getHighlights(), firebaseService.getCodeOfConduct()];
                keys = ['homeContent', 'aboutContent', 'registrationContent', 'documentsContent', 'highlights', 'codeOfConduct'];
                break;
            case 'conference':
                promises = [firebaseService.getCommittees(), firebaseService.getCountries(), firebaseService.getSchedule()];
                keys = ['committees', 'countries', 'schedule'];
                break;
            case 'team':
                promises = [firebaseService.getSecretariat()];
                keys = ['secretariat'];
                break;
            case 'gallery':
                promises = [firebaseService.getGalleryPageContent(), firebaseService.getGalleryItems()];
                keys = ['galleryContent', 'galleryItems'];
                break;
            case 'settings':
            case 'security': 
                promises = [firebaseService.getSiteConfig(), firebaseService.getCommittees(), firebaseService.getCountries(), firebaseService.getSecretariat(), firebaseService.getGalleryItems()];
                keys = ['siteConfig', 'committees', 'countries', 'secretariat', 'galleryItems'];
                break;
        }

        if (promises.length > 0) {
            const results = await Promise.all(promises);
            const newData: any = {};
            results.forEach((res, index) => {
                newData[keys[index]] = res;
            });
            setData((prev: any) => ({ ...prev, ...newData }));
        }
        setFetched(prev => ({ ...prev, [tab]: true }));
    } catch (error) {
        console.error(`Failed to fetch data for tab ${tab}:`, error);
        toast({ title: "Error", description: `Could not load data for ${tab}.`, variant: "destructive" });
    } finally {
        setLoading(false);
    }
  }, [fetched, toast]);

  useEffect(() => {
    loadDataForTab('dashboard');
  }, [loadDataForTab]);

  const handleUpdateItem = async <T extends {id: string}>(
    updateFunction: (id: string, data: Partial<T>) => Promise<void>,
    id: string,
    itemData: Partial<T>,
    stateKey: keyof typeof data,
    message: string,
    form?: any
  ) => {
      try {
          const convertedData = { ...itemData };
           if ('imageUrl' in convertedData && typeof convertedData.imageUrl === 'string') {
              (convertedData as any).imageUrl = convertGoogleDriveLink(convertedData.imageUrl);
          }
           if (form) {
             const formValues = { ...form.getValues() };
             Object.keys(formValues).forEach(key => {
                if (key.toLowerCase().includes('imageurl') || (key === 'url' && formValues.type === 'image')) {
                    if (typeof formValues[key] === 'string') {
                        formValues[key] = convertGoogleDriveLink(formValues[key]);
                    }
                }
             });
             form.reset(formValues);
          }

          await updateFunction(id, convertedData);
          setData(prev => ({
              ...prev,
              [stateKey]: prev[stateKey].map((item: T) => item.id === id ? { ...item, ...convertedData } : item),
          }));
          toast({ title: "Success!", description: message });
      } catch (error) {
          toast({ title: "Error", description: `Could not save item. ${error instanceof Error ? error.message : ''}`, variant: "destructive" });
      }
  };

  const handleDeleteItem = async (
      deleteFunction: (id: string) => Promise<void>,
      id: string,
      stateKey: keyof typeof data,
      message: string
  ) => {
      if (!confirm('Are you sure you want to delete this item?')) return;
      try {
          await deleteFunction(id);
          setData(prev => ({
              ...prev,
              [stateKey]: prev[stateKey].filter((item: {id: string}) => item.id !== id),
          }));
          toast({ title: "Success!", description: message });
      } catch (error) {
          toast({ title: "Error", description: `Could not delete item. ${error instanceof Error ? error.message : ''}`, variant: "destructive" });
      }
  };

  const handleAddItem = async <T extends {id: string}>(
      addFunction: (data: any) => Promise<string>,
      addData: any,
      stateKey: keyof typeof data,
      message: string,
      form?: any
  ) => {
      try {
          const convertedData = {...addData};
          if ('imageUrl' in convertedData && typeof convertedData.imageUrl === 'string') {
              convertedData.imageUrl = convertGoogleDriveLink(convertedData.imageUrl);
          }
           if (convertedData.type === 'image' && 'url' in convertedData && typeof convertedData.url === 'string') {
              convertedData.url = convertGoogleDriveLink(convertedData.url);
          }
          const newId = await addFunction(convertedData);
          const newItem = await firebaseService.getDocById(stateKey as string, newId);
          setData(prev => ({
              ...prev,
              [stateKey]: [...(prev[stateKey] || []), newItem],
          }));
          toast({ title: "Success!", description: message });
          if (form) form.reset();
      } catch (error) {
          toast({ title: "Error", description: `Could not add item. ${error instanceof Error ? error.message : ''}`, variant: "destructive" });
      }
  }

  const handleFormSubmit = async (updateFunction: (data: any) => Promise<void>, successMessage: string, data: any, form: any) => {
    try {
        const convertedData = { ...data };
        for (const key in convertedData) {
            if (key.toLowerCase().includes('imageurl') && typeof convertedData[key] === 'string') {
                convertedData[key] = convertGoogleDriveLink(convertedData[key]);
            }
        }
        await updateFunction(convertedData);
        toast({ title: "Success!", description: successMessage });
        form.reset(convertedData);
    } catch (error) {
        toast({ title: "Error", description: `Could not save data. ${error instanceof Error ? error.message : ''}`, variant: "destructive" });
    }
  };
  
  const commonProps = {
    data,
    setData,
    handleAddItem,
    handleUpdateItem,
    handleDeleteItem,
    handleFormSubmit,
    toast,
    setFetched,
    loadDataForTab
  };
    
  const renderLoading = () => <div className="space-y-8 p-8">{Array.from({ length: 4 }).map((_, i) => <Skeleton key={i} className="h-64 w-full" />)}</div>;

  return (
    <div className="space-y-8">
        <div className="text-left">
            <h1 className="text-3xl font-bold font-headline">Admin Dashboard</h1>
            <p className="text-muted-foreground">Manage your conference website content and settings here.</p>
        </div>

        <Tabs defaultValue="dashboard" className="w-full" onValueChange={loadDataForTab}>
            <TabsList className="grid w-full grid-cols-3 lg:grid-cols-7">
                <TabsTrigger value="dashboard">Dashboard</TabsTrigger>
                <TabsTrigger value="pages">Pages</TabsTrigger>
                <TabsTrigger value="conference">Conference</TabsTrigger>
                <TabsTrigger value="team">Team</TabsTrigger>
                <TabsTrigger value="gallery">Gallery</TabsTrigger>
                <TabsTrigger value="settings">Settings</TabsTrigger>
                <TabsTrigger value="security">Security</TabsTrigger>
            </TabsList>
            
            <TabsContent value="dashboard" className="mt-6">
              {loading && !fetched.dashboard ? renderLoading() : <DashboardTab {...commonProps} />}
            </TabsContent>

            <TabsContent value="pages" className="mt-6">
              {loading && !fetched.pages ? renderLoading() : <PagesTab {...commonProps} />}
            </TabsContent>

            <TabsContent value="conference" className="mt-6">
              {loading && !fetched.conference ? renderLoading() : <ConferenceTab {...commonProps} />}
            </TabsContent>

            <TabsContent value="team" className="mt-6">
              {loading && !fetched.team ? renderLoading() : <TeamTab {...commonProps} />}
            </TabsContent>
            
            <TabsContent value="gallery" className="mt-6">
              {loading && !fetched.gallery ? renderLoading() : <GalleryTab {...commonProps} />}
            </TabsContent>

            <TabsContent value="settings" className="mt-6">
              {loading && !fetched.settings ? renderLoading() : <SettingsTab {...commonProps} />}
            </TabsContent>
            
            <TabsContent value="security" className="mt-6">
              {loading && !fetched.security ? renderLoading() : <SecurityTab {...commonProps} />}
            </TabsContent>
        </Tabs>
    </div>
  );
}

    

    