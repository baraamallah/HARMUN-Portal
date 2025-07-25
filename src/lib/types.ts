

import type { Timestamp } from 'firebase/firestore';

export type Committee = {
  id: string; // Document ID from Firestore
  name: string;
  chair: {
    name:string;
    bio: string;
    imageUrl: string;
  };
  topics: string[];
  backgroundGuideUrl: string;
};

export type ScheduleDay = {
    id: string;
    title: string;
    date: string;
    order: number;
    events: ScheduleEvent[];
}

export type ScheduleEvent = {
  id: string;
  dayId: string;
  time: string;
  title: string;
  description: string;
  location: string;
  order: number;
};

export type Country = {
  id:string; // Document ID from Firestore
  name: string;
  committee: string;
  status: 'Available' | 'Assigned';
};

export type SocialLink = {
  id?: string;
  platform: string;
  url: string;
};

export type SiteConfig = {
  conferenceDate: string;
  socialLinks: SocialLink[];
  footerText: string;
  sgAvatarUrl: string;
  navVisibility?: Record<string, boolean>;
};

export type HomePageContent = {
  heroTitle: string;
  heroSubtitle: string;
  heroImageUrl: string;
  highlightsTitle: string;
  highlightsSubtitle: string;
};

export type ConferenceHighlight = {
    id: string;
    icon: string;
    title: string;
    description: string;
    order: number;
}

export type AboutPageContent = {
  title: string;
  subtitle: string;
  imageUrl: string;
  whatIsTitle: string;
  whatIsPara1: string;
  whatIsPara2: string;
  storyTitle: string;
  storyImageUrl: string;
  storyPara1: string;
  storyPara2: string;
};

export type RegistrationPageContent = {
    title: string;
    subtitle: string;
};

export type DocumentsPageContent = {
    title: string;
    subtitle: string;
}

export type GalleryPageContent = {
    title: string;
    subtitle: string;
};

export type GalleryItem = {
    id: string;
    title: string;
    description?: string;
    imageUrl: string;
    order: number;
    mediaType: 'image' | 'video';
    aspectRatio: '1:1' | '16:9' | '4:3' | '3:4';
    width: 'single' | 'double';
};

export type DownloadableDocument = {
    id: string;
    title: string;
    description: string;
    url: string;
    order: number;
}

export type Post = {
  id: string;
  title: string;
  content: string;
  type: 'sg-note' | 'news';
  createdAt: Timestamp;
};
