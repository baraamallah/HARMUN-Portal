import type { Timestamp } from 'firebase/firestore';

export type Committee = {
  name: string;
  chair: {
    name: string;
    bio: string;
    imageUrl: string;
  };
  topics: string[];
  backgroundGuideUrl: string;
};

export type SecretariatMember = {
  name: string;
  role: string;
  bio: string;
  imageUrl: string;
};

export type ScheduleEvent = {
  time: string;
  title: string;
  description: string;
  location: string;
};

export type Country = {
  name: string;
  committee: string;
  status: 'Available' | 'Assigned';
};

export type Theme = {
  primaryColor: string;
  backgroundColor: string;
  accentColor: string;
};

export type HomePageContent = {
  heroTitle: string;
  heroSubtitle: string;
  heroImageUrl: string;
};

export type Post = {
  id: string;
  title: string;
  content: string;
  type: 'sg-note' | 'news';
  createdAt: Timestamp;
};
