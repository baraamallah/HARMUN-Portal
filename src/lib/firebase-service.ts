import { doc, getDoc, setDoc } from 'firebase/firestore';
import { db } from './firebase';
import type { Theme, HomePageContent } from './types';

const CONFIG_COLLECTION = 'config';
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
