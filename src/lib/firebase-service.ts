import { collection, doc, getDoc, getDocs, setDoc, addDoc, serverTimestamp, query, where, orderBy, deleteDoc, updateDoc, writeBatch } from 'firebase/firestore';
import { db } from './firebase';
import type { Theme, HomePageContent, Post, Country, Committee, SiteConfig, AboutPageContent } from './types';
import { format } from 'date-fns';

const CONFIG_COLLECTION = 'config';
const POSTS_COLLECTION = 'posts';
const COUNTRIES_COLLECTION = 'countries';
const COMMITTEES_COLLECTION = 'committees';
const THEME_DOC_ID = 'theme';
const HOME_PAGE_CONTENT_DOC_ID = 'homePage';
const ABOUT_PAGE_CONTENT_DOC_ID = 'aboutPage';
const SITE_CONFIG_DOC_ID = 'siteConfig';

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

export const defaultSiteConfig: SiteConfig = {
    socialLinks: {
        twitter: "#",
        instagram: "#",
        facebook: "#",
    },
    footerText: "This is a fictional event created for demonstration purposes.",
    navVisibility: {
        '/about': true,
        '/committees': true,
        '/news': true,
        '/sg-notes': true,
        '/registration': true,
        '/schedule': true,
        '/secretariat': true,
        '/documents': true,
    },
};

const defaultAboutPageContent: AboutPageContent = {
  title: "About HARMUN",
  subtitle: "Discover the history, mission, and spirit of the Harvard Model United Nations conference.",
  imageUrl: "https://placehold.co/600x400.png",
  whatIsTitle: "What is Model UN?",
  whatIsPara1: "Model United Nations is an academic simulation of the United Nations where students play the role of delegates from different countries and attempt to solve real world issues with the policies and perspectives of their assigned country.",
  whatIsPara2: "Participants learn about diplomacy, international relations, and the United Nations. Delegates are placed in committees and assigned countries, research topics, and formulate positions to debate with their peers, staying true to the actual position of the country they represent.",
  storyTitle: "The Story of HARMUN",
  storyPara1: "Harvard Model United Nations (HARMUN) was founded in 1953, only a few years after the creation of the United Nations itself. It was conceived as a platform to educate the next generation of leaders about the complexities of international affairs and the importance of diplomacy. From its humble beginnings, HARMUN has grown into one of the largest, oldest, and most prestigious conferences of its kind in the world.",
  storyPara2: "Each year, HARMUN brings together over 3,000 high school students from across the globe to our campus in Cambridge. Our mission is to provide a dynamic and engaging educational experience that promotes a deeper understanding of the world, fosters a spirit of collaboration, and inspires a commitment to global citizenship. The conference is entirely run by Harvard undergraduates who are passionate about international relations and dedicated to creating a memorable and impactful experience for every delegate.",
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

// --- About Page Content Management ---
export async function getAboutPageContent(): Promise<AboutPageContent> {
  try {
    const docRef = doc(db, CONFIG_COLLECTION, ABOUT_PAGE_CONTENT_DOC_ID);
    const docSnap = await getDoc(docRef);
    return docSnap.exists() ? (docSnap.data() as AboutPageContent) : defaultAboutPageContent;
  } catch (error) {
    console.error("Error fetching about page content, returning default:", error);
    return defaultAboutPageContent;
  }
}

export async function updateAboutPageContent(content: AboutPageContent): Promise<void> {
  const docRef = doc(db, CONFIG_COLLECTION, ABOUT_PAGE_CONTENT_DOC_ID);
  await setDoc(docRef, content, { merge: true });
}

// --- Site Config Management ---
export async function getSiteConfig(): Promise<SiteConfig> {
  try {
    const docRef = doc(db, CONFIG_COLLECTION, SITE_CONFIG_DOC_ID);
    const docSnap = await getDoc(docRef);
    if (docSnap.exists()) {
      const dbConfig = docSnap.data();
      // Deep merge to ensure defaults are kept for missing properties
      return {
        ...defaultSiteConfig,
        ...dbConfig,
        socialLinks: {
          ...defaultSiteConfig.socialLinks,
          ...(dbConfig.socialLinks || {}),
        },
        navVisibility: {
          ...defaultSiteConfig.navVisibility,
          ...(dbConfig.navVisibility || {}),
        },
      };
    }
    return defaultSiteConfig;
  } catch (error) {
    console.error("Error fetching site config, returning default:", error);
    return defaultSiteConfig;
  }
}

export async function updateSiteConfig(config: Partial<SiteConfig>): Promise<void> {
  const docRef = doc(db, CONFIG_COLLECTION, SITE_CONFIG_DOC_ID);
  await setDoc(docRef, config, { merge: true });
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

// --- Country Matrix Management ---
export async function addCountry(country: Omit<Country, 'id'>): Promise<string> {
  const docRef = await addDoc(collection(db, COUNTRIES_COLLECTION), country);
  return docRef.id;
}

export async function getCountries(): Promise<Country[]> {
    const q = query(collection(db, COUNTRIES_COLLECTION), orderBy('committee'), orderBy('name'));
    const querySnapshot = await getDocs(q);
    return querySnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as Country));
}

export async function updateCountryStatus(id: string, status: 'Available' | 'Assigned'): Promise<void> {
    const docRef = doc(db, COUNTRIES_COLLECTION, id);
    await updateDoc(docRef, { status });
}

export async function deleteCountry(id: string): Promise<void> {
    const docRef = doc(db, COUNTRIES_COLLECTION, id);
    await deleteDoc(docRef);
}

// --- Committee Management ---
export async function addCommittee(committee: Omit<Committee, 'id'>): Promise<string> {
  const docRef = await addDoc(collection(db, COMMITTEES_COLLECTION), committee);
  return docRef.id;
}

export async function getCommittees(): Promise<Committee[]> {
    const q = query(collection(db, COMMITTEES_COLLECTION), orderBy('name'));
    const querySnapshot = await getDocs(q);
    return querySnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as Committee));
}

export async function deleteCommittee(id: string): Promise<void> {
    const docRef = doc(db, COMMITTEES_COLLECTION, id);
    await deleteDoc(docRef);
}

// --- Import/Export Management ---

// Helper function to clear a collection
async function clearCollection(collectionPath: string) {
    const collectionRef = collection(db, collectionPath);
    const q = query(collectionRef);
    const querySnapshot = await getDocs(q);
    
    if (querySnapshot.empty) {
        return;
    }

    const batch = writeBatch(db);
    querySnapshot.docs.forEach((docSnapshot) => {
        batch.delete(docSnapshot.ref);
    });
    await batch.commit();
}

export async function importCommittees(committees: Omit<Committee, 'id'>[]): Promise<void> {
    if (!Array.isArray(committees)) {
        throw new Error("Invalid import data. It must be an array of committees.");
    }
    await clearCollection(COMMITTEES_COLLECTION);
    const batch = writeBatch(db);
    committees.forEach(committeeData => {
        const newDocRef = doc(collection(db, COMMITTEES_COLLECTION));
        batch.set(newDocRef, committeeData);
    });
    await batch.commit();
}

export async function importCountries(countries: Omit<Country, 'id'>[]): Promise<void> {
    if (!Array.isArray(countries)) {
        throw new Error("Invalid import data. It must be an array of countries.");
    }
    await clearCollection(COUNTRIES_COLLECTION);
    const batch = writeBatch(db);
    countries.forEach(countryData => {
        const newDocRef = doc(collection(db, COUNTRIES_COLLECTION));
        batch.set(newDocRef, countryData);
    });
    await batch.commit();
}
