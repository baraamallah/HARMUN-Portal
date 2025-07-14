
import { collection, doc, getDoc, getDocs, setDoc, addDoc, serverTimestamp, query, where, orderBy, deleteDoc, updateDoc, writeBatch, documentId, runTransaction } from 'firebase/firestore';
import { db } from './firebase';
import type { HomePageContent, Post, Country, Committee, SiteConfig, AboutPageContent, SecretariatMember, ScheduleDay, ScheduleEvent, RegistrationPageContent, DocumentsPageContent, DownloadableDocument, ConferenceHighlight, GalleryPageContent, GalleryItem } from './types';
import { format } from 'date-fns';


// Collection & Document Names
const CONFIG_COLLECTION = 'config';
const POSTS_COLLECTION = 'posts';
const COUNTRIES_COLLECTION = 'countries';
const COMMITTEES_COLLECTION = 'committees';
const SECRETARIAT_COLLECTION = 'secretariat';
const SCHEDULE_DAYS_COLLECTION = 'scheduleDays';
const SCHEDULE_EVENTS_COLLECTION = 'scheduleEvents';
const HIGHLIGHTS_COLLECTION = 'highlights';
const DOCUMENTS_COLLECTION = 'documents';
const GALLERY_COLLECTION = 'galleryItems';

const HOME_PAGE_CONTENT_DOC_ID = 'homePage';
const ABOUT_PAGE_CONTENT_DOC_ID = 'aboutPage';
const SITE_CONFIG_DOC_ID = 'siteConfig';
const REGISTRATION_PAGE_CONTENT_DOC_ID = 'registrationPage';
const DOCUMENTS_PAGE_CONTENT_DOC_ID = 'documentsPage';
const GALLERY_PAGE_CONTENT_DOC_ID = 'galleryPage';


// --- Default Data ---
// This function initializes the database with default content if it's empty.
export async function initializeDefaultData() {
    const defaultData = {
        [CONFIG_COLLECTION]: {
            [HOME_PAGE_CONTENT_DOC_ID]: {
                heroTitle: "HARMUN 2025 Portal",
                heroSubtitle: "Engage in diplomacy, foster international cooperation, and shape the future. Welcome, delegates!",
                heroImageUrl: "https://placehold.co/1920x1080.png",
            },
            [ABOUT_PAGE_CONTENT_DOC_ID]: {
                title: "About HARMUN",
                subtitle: "Discover the history, mission, and spirit of the Harvard Model United Nations conference.",
                imageUrl: "https://placehold.co/600x400.png",
                whatIsTitle: "What is Model UN?",
                whatIsPara1: "Model United Nations is an academic simulation of the United Nations where students play the role of delegates from different countries and attempt to solve real world issues with the policies and perspectives of their assigned country.",
                whatIsPara2: "Participants learn about diplomacy, international relations, and the United Nations. Delegates are placed in committees and assigned countries, research topics, and formulate positions to debate with their peers, staying true to the actual position of the country they represent.",
                storyTitle: "The Story of HARMUN",
                storyPara1: "Harvard Model United Nations (HARMUN) was founded in 1953, only a few years after the creation of the United Nations itself. It was conceived as a platform to educate the next generation of leaders about the complexities of international affairs and the importance of diplomacy. From its humble beginnings, HARMUN has grown into one of the largest, oldest, and most prestigious conferences of its kind in the world.",
                storyPara2: "Each year, HARMUN brings together over 3,000 high school students from across the globe to our campus in Cambridge. Our mission is to provide a dynamic and engaging educational experience that promotes a deeper understanding of the world, fosters a spirit of collaboration, and inspires a commitment to global citizenship. The conference is entirely run by Harvard undergraduates who are passionate about international relations and dedicated to creating a memorable and impactful experience for every delegate.",
            },
            [SITE_CONFIG_DOC_ID]: {
                conferenceDate: '2025-01-30T09:00:00',
                socialLinks: [
                    { platform: 'Twitter', url: '#' },
                    { platform: 'Instagram', url: '#' },
                    { platform: 'Facebook', url: '#' },
                ],
                footerText: "This is a fictional event created for demonstration purposes.",
                mapEmbedUrl: "https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d2925.733553224765!2d-71.1194179234839!3d42.37361573426569!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x89e377427d73825b%3A0x5e567c1d7756919a!2sHarvard%20University!5e0!3m2!1sen!2sus!4v1709876543210!5m2!1sen!2sus",
                navVisibility: { '/about': true, '/committees': true, '/news': true, '/sg-notes': true, '/registration': true, '/schedule': true, '/secretariat': true, '/documents': true, '/gallery': true },
            },
            [REGISTRATION_PAGE_CONTENT_DOC_ID]: {
                title: "Delegate Registration",
                subtitle: "Complete the form below to register for HARMUN 2025. Fields marked with an asterisk (*) are required."
            },
            [DOCUMENTS_PAGE_CONTENT_DOC_ID]: {
                title: "Conference Documents",
                subtitle: "Access important resources and other downloadable materials here.",
            },
            [GALLERY_PAGE_CONTENT_DOC_ID]: {
                title: "Conference Gallery",
                subtitle: "A collection of memorable moments from past and present HARMUN conferences.",
            },
        },
        [SECRETARIAT_COLLECTION]: [
            { name: 'James Harrison', role: 'Secretary-General', bio: 'A senior at Harvard studying Government and Economics. This is his fourth and final HARMUN, and he is thrilled to lead an unforgettable conference experience.', imageUrl: 'https://placehold.co/400x400.png', order: 1 },
            { name: 'Chloe Davis', role: 'Director-General', bio: 'A junior concentrating in History & Literature. Chloe oversees all committee operations and is dedicated to ensuring a high level of debate and engagement.', imageUrl: 'https://placehold.co/400x400.png', order: 2 },
        ],
        [HIGHLIGHTS_COLLECTION]: [
            { icon: 'Calendar', title: 'Conference Dates', description: 'January 30 - February 2, 2025', order: 1 },
            { icon: 'MapPin', title: 'Location', description: 'Harvard University, Cambridge, MA', order: 2 },
        ],
        [DOCUMENTS_COLLECTION]: [
            { title: 'Conference Handbook', description: 'The official guide to rules, procedures, and conference etiquette.', url: '#', order: 1 },
            { title: 'Background Guide: Security Council', description: 'Essential reading material for all delegates in the Security Council committee.', url: '#', order: 2 },
        ],
        [SCHEDULE_DAYS_COLLECTION]: [
            { title: 'Day 1: Thursday', date: 'January 30, 2025', order: 1, id: 'day1' },
        ],
        [SCHEDULE_EVENTS_COLLECTION]: [
            { dayId: 'day1', time: '2:00 PM - 5:00 PM', title: 'Delegate Registration', description: 'Pick up your credentials and welcome packet.', location: 'Main Hall', order: 1 },
        ],
        [GALLERY_COLLECTION]: [
            { title: 'Opening Ceremony', imageUrl: 'https://placehold.co/600x400.png', videoUrl: null, type: 'image', display: '16:9', columnSpan: 1, order: 1 },
            { title: 'Debate in Session', imageUrl: 'https://placehold.co/400x600.png', videoUrl: null, type: 'image', display: '2:3', columnSpan: 1, order: 2 },
        ],
    };

    const batch = writeBatch(db);

    for (const [collectionName, docs] of Object.entries(defaultData)) {
        if (collectionName === CONFIG_COLLECTION) {
             for (const [docId, data] of Object.entries(docs)) {
                const docRef = doc(db, collectionName, docId);
                const docSnap = await getDoc(docRef);
                if (!docSnap.exists()) {
                    batch.set(docRef, data);
                }
            }
        } else {
            const collectionRef = collection(db, collectionName);
            const snapshot = await getDocs(query(collectionRef));
            if (snapshot.empty && Array.isArray(docs)) {
                docs.forEach(data => {
                    const docId = data.id || undefined;
                    const docRef = docId ? doc(db, collectionName, docId) : doc(collectionRef);
                    const {id, ...rest} = data;
                    batch.set(docRef, rest);
                });
            }
        }
    }
    await batch.commit();
}


// --- Generic Get/Set for Config Documents ---
async function getConfigDoc<T>(docId: string, defaultConfig: T): Promise<T> {
  try {
    await initializeDefaultData(); // Ensure defaults exist
    const docRef = doc(db, CONFIG_COLLECTION, docId);
    const docSnap = await getDoc(docRef);
    if (docSnap.exists()) {
      return { ...defaultConfig, ...docSnap.data() } as T;
    }
    // If it still doesn't exist after init, something is wrong, but return default
    return defaultConfig;
  } catch (error) {
    console.error(`Error fetching ${docId}, returning default:`, error);
    return defaultConfig;
  }
}

async function updateConfigDoc<T>(docId: string, data: Partial<T>): Promise<void> {
    const docRef = doc(db, CONFIG_COLLECTION, docId);
    await setDoc(docRef, data, { merge: true });
}

export async function getDocById(collectionName: string, id: string): Promise<any> {
    const docRef = doc(db, collectionName, id);
    const docSnap = await getDoc(docRef);
    if (docSnap.exists()) {
        const data = docSnap.data();
        return { id: docSnap.id, ...data };
    }
    throw new Error(`Document with id ${id} not found in ${collectionName}`);
}

// --- Specific Content Getters/Setters ---
export const getHomePageContent = () => getConfigDoc<HomePageContent>(HOME_PAGE_CONTENT_DOC_ID, {} as HomePageContent);
export const updateHomePageContent = (content: Partial<HomePageContent>) => updateConfigDoc(HOME_PAGE_CONTENT_DOC_ID, content);

export const getAboutPageContent = () => getConfigDoc<AboutPageContent>(ABOUT_PAGE_CONTENT_DOC_ID, {} as AboutPageContent);
export const updateAboutPageContent = (content: Partial<AboutPageContent>) => updateConfigDoc(ABOUT_PAGE_CONTENT_DOC_ID, content);

export const getRegistrationPageContent = () => getConfigDoc<RegistrationPageContent>(REGISTRATION_PAGE_CONTENT_DOC_ID, {} as RegistrationPageContent);
export const updateRegistrationPageContent = (content: Partial<RegistrationPageContent>) => updateConfigDoc(REGISTRATION_PAGE_CONTENT_DOC_ID, content);

export const getDocumentsPageContent = () => getConfigDoc<DocumentsPageContent>(DOCUMENTS_PAGE_CONTENT_DOC_ID, {} as DocumentsPageContent);
export const updateDocumentsPageContent = (content: Partial<DocumentsPageContent>) => updateConfigDoc(DOCUMENTS_PAGE_CONTENT_DOC_ID, content);

export const getGalleryPageContent = () => getConfigDoc<GalleryPageContent>(GALLERY_PAGE_CONTENT_DOC_ID, {} as GalleryPageContent);
export const updateGalleryPageContent = (content: Partial<GalleryPageContent>) => updateConfigDoc(GALLERY_PAGE_CONTENT_DOC_ID, content);

export const getSiteConfig = () => getConfigDoc<SiteConfig>(SITE_CONFIG_DOC_ID, { socialLinks: [] } as SiteConfig);
export const updateSiteConfig = (config: Partial<SiteConfig>) => updateConfigDoc(SITE_CONFIG_DOC_ID, config);


// --- Generic Collection CRUD ---
async function getCollection<T>(collectionName: string, orderByField: string = 'order'): Promise<T[]> {
    await initializeDefaultData();
    const q = query(collection(db, collectionName), orderBy(orderByField));
    const querySnapshot = await getDocs(q);
    const results = querySnapshot.docs.map(doc => {
        const data = doc.data();
        return { id: doc.id, ...data } as T;
    });
    return results;
}

async function addCollectionDoc<T extends {order?: number}>(collectionName: string, data: Omit<T, 'id'>): Promise<string> {
    const collRef = collection(db, collectionName);
    // If order is not provided, calculate the next order number
    if (data.order === undefined || data.order === null) {
        const snapshot = await getDocs(query(collRef, orderBy('order', 'desc')));
        const lastOrder = snapshot.docs.length > 0 ? (snapshot.docs[0].data().order || 0) : 0;
        data.order = lastOrder + 1;
    }
    const docRef = await addDoc(collRef, data);
    return docRef.id;
}

async function updateCollectionDoc<T>(collectionName: string, id: string, data: Partial<T>): Promise<void> {
    const docRef = doc(db, collectionName, id);
    await updateDoc(docRef, data);
}

async function deleteCollectionDoc(collectionName: string, id: string): Promise<void> {
    const docRef = doc(db, collectionName, id);
    await deleteDoc(docRef);
}

// --- Specific Collection Functions ---
export const getSecretariat = () => getCollection<SecretariatMember>(SECRETARIAT_COLLECTION);
export const addSecretariatMember = (member: Omit<SecretariatMember, 'id' | 'order'>) => addCollectionDoc<SecretariatMember>(SECRETARIAT_COLLECTION, member);
export const updateSecretariatMember = (id: string, member: Omit<SecretariatMember, 'id' | 'order'>) => updateCollectionDoc<SecretariatMember>(SECRETARIAT_COLLECTION, id, member);
export const deleteSecretariatMember = (id: string) => deleteCollectionDoc(SECRETARIAT_COLLECTION, id);

export const getHighlights = () => getCollection<ConferenceHighlight>(HIGHLIGHTS_COLLECTION);
export const addHighlight = (highlight: Omit<ConferenceHighlight, 'id'>) => addCollectionDoc<ConferenceHighlight>(HIGHLIGHTS_COLLECTION, highlight);
export const updateHighlight = (id: string, highlight: Partial<ConferenceHighlight>) => updateCollectionDoc<ConferenceHighlight>(HIGHLIGHTS_COLLECTION, id, highlight);
export const deleteHighlight = (id: string) => deleteCollectionDoc(HIGHLIGHTS_COLLECTION, id);

export const getDownloadableDocuments = () => getCollection<DownloadableDocument>(DOCUMENTS_COLLECTION);
export const addDownloadableDocument = (item: Omit<DownloadableDocument, 'id'>) => addCollectionDoc<DownloadableDocument>(DOCUMENTS_COLLECTION, item);
export const updateDownloadableDocument = (id: string, item: Partial<DownloadableDocument>) => updateCollectionDoc<DownloadableDocument>(DOCUMENTS_COLLECTION, id, item);
export const deleteDownloadableDocument = (id: string) => deleteCollectionDoc(DOCUMENTS_COLLECTION, id);


// --- Gallery ---
function processGalleryItemDataForSave(data: any) {
    const { url, type, columnSpan, ...rest } = data;
    const processedData: any = { ...rest, type, columnSpan: parseInt(columnSpan, 10) };
    if (type === 'image') {
        processedData.imageUrl = url;
        processedData.videoUrl = null;
    } else {
        processedData.imageUrl = null;
        processedData.videoUrl = url;
    }
    delete processedData.url; // remove temp 'url' field
    return processedData;
}

export const getGalleryItems = () => getCollection<GalleryItem>(GALLERY_COLLECTION);
export const addGalleryItem = (item: any) => addCollectionDoc<GalleryItem>(GALLERY_COLLECTION, processGalleryItemDataForSave(item));
export const updateGalleryItem = (id: string, item: any) => updateCollectionDoc<GalleryItem>(GALLERY_COLLECTION, id, processGalleryItemDataForSave(item));
export const deleteGalleryItem = (id: string) => deleteCollectionDoc(GALLERY_COLLECTION, id);
export const updateGalleryItemsOrder = async (items: GalleryItem[]) => {
    const batch = writeBatch(db);
    items.forEach((item, index) => {
        const docRef = doc(db, GALLERY_COLLECTION, item.id);
        batch.update(docRef, { order: index });
    });
    await batch.commit();
};


// --- Schedule (Special Handling) ---
export async function getSchedule(): Promise<ScheduleDay[]> {
    await initializeDefaultData();
    const days = await getCollection<Omit<ScheduleDay, 'events'>>(SCHEDULE_DAYS_COLLECTION, 'order');
    const events = await getCollection<ScheduleEvent>(SCHEDULE_EVENTS_COLLECTION, 'order');
    return days.map(day => ({
        ...day,
        events: events.filter(event => event.dayId === day.id)
    }));
}
export const addScheduleDay = (day: Omit<ScheduleDay, 'id' | 'events'>) => addCollectionDoc<ScheduleDay>(SCHEDULE_DAYS_COLLECTION, day);
export const updateScheduleDay = (id: string, day: Partial<ScheduleDay>) => updateCollectionDoc<ScheduleDay>(SCHEDULE_DAYS_COLLECTION, id, day);
async function deleteScheduleDay(id: string): Promise<void> {
    await runTransaction(db, async (transaction) => {
        const dayRef = doc(db, SCHEDULE_DAYS_COLLECTION, id);
        transaction.delete(dayRef);
        const eventsQuery = query(collection(db, SCHEDULE_EVENTS_COLLECTION), where('dayId', '==', id));
        const eventsSnapshot = await getDocs(eventsQuery);
        eventsSnapshot.forEach(eventDoc => transaction.delete(eventDoc.ref));
    });
}
export const addScheduleEvent = (event: Omit<ScheduleEvent, 'id'>) => addCollectionDoc<ScheduleEvent>(SCHEDULE_EVENTS_COLLECTION, event);
export const updateScheduleEvent = (id: string, event: Partial<ScheduleEvent>) => updateCollectionDoc<ScheduleEvent>(SCHEDULE_EVENTS_COLLECTION, id, event);
export const deleteScheduleEvent = (id: string) => deleteCollectionDoc(SCHEDULE_EVENTS_COLLECTION, id);


// --- Posts (Existing) ---
export async function addPost(post: Omit<Post, 'id' | 'createdAt'>): Promise<string> {
  const docRef = await addDoc(collection(db, POSTS_COLLECTION), { ...post, createdAt: serverTimestamp() });
  return docRef.id;
}
export async function getAllPosts(): Promise<Post[]> {
  const q = query(collection(db, POSTS_COLLECTION), orderBy('createdAt', 'desc'));
  const querySnapshot = await getDocs(q);
  return querySnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as Post));
}
export async function getPosts(type: 'sg-note' | 'news'): Promise<Post[]> {
  return (await getAllPosts()).filter(post => post.type === type);
}
export const deletePost = (id: string) => deleteCollectionDoc(POSTS_COLLECTION, id);

export function formatTimestamp(timestamp: any, dateFormat: string = 'PPP'): string {
    if (!timestamp) return "";
    if (timestamp && typeof timestamp.toDate === 'function') {
        return format(timestamp.toDate(), dateFormat);
    }
    try {
      return format(new Date(timestamp), dateFormat);
    } catch(e) {
      return "Invalid Date";
    }
}

// --- Country Matrix (Existing) ---
export const addCountry = (country: Omit<Country, 'id'>) => addDoc(collection(db, COUNTRIES_COLLECTION), country).then(ref => ref.id);
export async function getCountries(): Promise<Country[]> {
    const q = query(collection(db, COUNTRIES_COLLECTION), orderBy('committee'), orderBy('name'));
    const querySnapshot = await getDocs(q);
    return querySnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as Country));
}
export const updateCountryStatus = (id: string, data: { status: 'Available' | 'Assigned' }) => updateDoc(doc(db, COUNTRIES_COLLECTION, id), data);
export const deleteCountry = (id: string) => deleteDoc(doc(db, COUNTRIES_COLLECTION, id));

// --- Committees (Existing) ---
export const addCommittee = (committee: Omit<Committee, 'id'>) => {
    return addDoc(collection(db, COMMITTEES_COLLECTION), committee).then(ref => ref.id);
}
export async function getCommittees(): Promise<Committee[]> {
    const q = query(collection(db, COMMITTEES_COLLECTION), orderBy('name'));
    const querySnapshot = await getDocs(q);
    const committees = querySnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() as Omit<Committee, 'id'> }));
    return committees;
}
export const deleteCommittee = (id: string) => deleteDoc(doc(db, COMMITTEES_COLLECTION, id));

// --- Import/Export Management ---
async function importData<T>(collectionName: string, data: any[], transform?: (row: any) => Omit<T, 'id'>): Promise<void> {
    if (!Array.isArray(data)) {
        throw new Error("Invalid import data. It must be an array.");
    }
    await clearCollection(collectionName);
    const batch = writeBatch(db);
    data.forEach(row => {
        const item = transform ? transform(row) : row;
        const newDocRef = doc(collection(db, collectionName));
        batch.set(newDocRef, item);
    });
    await batch.commit();
}

const committeeTransformer = (row: any): Omit<Committee, 'id'> => ({
    name: row.name || '',
    chair: {
        name: row.chairName || '',
        bio: row.chairBio || '',
        imageUrl: row.chairImageUrl || ''
    },
    topics: (row.topics || '').split('\\n').join('\n').split('\n').filter(Boolean),
    backgroundGuideUrl: row.backgroundGuideUrl || ''
});

const secretariatTransformer = (row: any): Omit<SecretariatMember, 'id'> => ({
    name: row.name || '',
    role: row.role || '',
    bio: row.bio || '',
    imageUrl: row.imageUrl || '',
    order: parseInt(row.order, 10) || 0,
});

const countryTransformer = (row: any): Omit<Country, 'id'> => ({
    name: row.name || '',
    committee: row.committee || '',
    status: (row.status === 'Assigned' ? 'Assigned' : 'Available') as 'Available' | 'Assigned',
});

const galleryTransformer = (row: any): Omit<GalleryItem, 'id'> => {
    const type = row.type === 'video' ? 'video' : 'image';
    const url = row.url || '';
    return {
        title: row.title || '',
        type,
        display: row.display || '4:3',
        columnSpan: parseInt(row.columnSpan, 10) === 2 ? 2 : 1,
        imageUrl: type === 'image' ? url : null,
        videoUrl: type === 'video' ? url : null,
        order: parseInt(row.order, 10) || 0,
    }
};

export const importCommittees = (data: any[]) => importData<Committee>(COMMITTEES_COLLECTION, data, committeeTransformer);
export const importCountries = (data: any[]) => importData<Country>(COUNTRIES_COLLECTION, data, countryTransformer);
export const importSecretariat = (data: any[]) => importData<SecretariatMember>(SECRETARIAT_COLLECTION, data, secretariatTransformer);
export const importGallery = (data: any[]) => importData<GalleryItem>(GALLERY_COLLECTION, data, galleryTransformer);

async function clearCollection(collectionPath: string) {
    const collectionRef = collection(db, collectionPath);
    const q = query(collectionRef);
    const querySnapshot = await getDocs(q);
    if (querySnapshot.empty) return;
    const batch = writeBatch(db);
    querySnapshot.docs.forEach(docSnapshot => batch.delete(docSnapshot.ref));
    await batch.commit();
}
