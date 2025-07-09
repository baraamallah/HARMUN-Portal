import { collection, doc, getDoc, getDocs, setDoc, addDoc, serverTimestamp, query, where, orderBy } from 'firebase/firestore';
import { db } from './firebase';
import type { Theme, HomePageContent, Post } from './types';
import { format } from 'date-fns';

const CONFIG_COLLECTION = 'config';
const POSTS_COLLECTION = 'posts';
const THEME_DOC_ID = 'theme';
const HOME_PAGE_CONTENT_DOC_ID = 'homePage';

// Default values
const defaultTheme: Theme = {
  primaryColor: "227 66% 32%",
  backgroundColor: "210 17% 98%",
  accentColor: "47 96% 52%",
};

const defaultHomePageContent: HomePageContent = {
  heroTitle: "HARMUN 2025 Portal",
  heroSubtitle: "Engage in diplomacy, foster international cooperation, and shape the future. Welcome, delegates!",
  heroImageUrl: "https://placehold.co/1920x1080.png",
};

// --- Theme Management ---
export async function getTheme(): Promise<Theme> {
  try {
    const docRef = doc(db, CONFIG_COLLECTION, THEME_DOC_ID);
    const docSnap = await getDoc(docRef);
    return docSnap.exists() ? (docSnap.data() as Theme) : defaultTheme;
  } catch (error) {
    console.error("Error fetching theme, returning default:", error);
    return defaultTheme;
  }
}

export async function updateTheme(theme: Theme): Promise<void> {
  const docRef = doc(db, CONFIG_COLLECTION, THEME_DOC_ID);
  await setDoc(docRef, theme, { merge: true });
}

// --- Home Page Content Management ---
export async function getHomePageContent(): Promise<HomePageContent> {
  try {
    const docRef = doc(db, CONFIG_COLLECTION, HOME_PAGE_CONTENT_DOC_ID);
    const docSnap = await getDoc(docRef);
    return docSnap.exists() ? (docSnap.data() as HomePageContent) : defaultHomePageContent;
  } catch (error) {
    console.error("Error fetching home page content, returning default:", error);
    return defaultHomePageContent;
  }
}

export async function updateHomePageContent(content: HomePageContent): Promise<void> {
  const docRef = doc(db, CONFIG_COLLECTION, HOME_PAGE_CONTENT_DOC_ID);
  await setDoc(docRef, content, { merge: true });
}

// --- Post Management ---
export async function addPost(post: Omit<Post, 'id' | 'createdAt'>): Promise<string> {
  const docRef = await addDoc(collection(db, POSTS_COLLECTION), {
    ...post,
    createdAt: serverTimestamp(),
  });
  return docRef.id;
}

export async function getAllPosts(): Promise<Post[]> {
  const q = query(collection(db, POSTS_COLLECTION), orderBy('createdAt', 'desc'));
  const querySnapshot = await getDocs(q);
  return querySnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as Post));
}

export async function getPosts(type: 'sg-note' | 'news'): Promise<Post[]> {
  const allPosts = await getAllPosts();
  return allPosts.filter(post => post.type === type);
}

export function formatTimestamp(timestamp: any, dateFormat: string = 'PPP'): string {
    if (timestamp && typeof timestamp.toDate === 'function') {
        return format(timestamp.toDate(), dateFormat);
    }
    // Fallback for cases where it might not be a Firestore timestamp
    try {
      const date = new Date(timestamp);
      return format(date, dateFormat);
    } catch(e) {
      return "Invalid Date";
    }
}
