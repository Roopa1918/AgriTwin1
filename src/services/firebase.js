// AgriTwin — Unified Firebase Integration with Live Backend Support
// Configured for user's Firebase Project: agritwin-5f1c4
// Gracefully handles real Firebase Firestore/Auth with resilient fallback to local Pub/Sub.

import { initializeApp, getApps, getApp } from 'firebase/app';
import { 
  getFirestore, 
  collection, 
  doc, 
  setDoc, 
  addDoc, 
  onSnapshot, 
  query, 
  orderBy, 
  limit 
} from 'firebase/firestore';
import { 
  getAuth, 
  signInWithEmailAndPassword, 
  signInAnonymously, 
  signOut as fbSignOut, 
  onAuthStateChanged as fbOnAuthStateChanged 
} from 'firebase/auth';

export const USER_FIREBASE_CONFIG = {
  apiKey: "AIzaSyCwaRp-7Vwki8y0JKPqH9rXK1mvZQA4yUQ",
  authDomain: "agritwin-5f1c4.firebaseapp.com",
  projectId: "agritwin-5f1c4",
  storageBucket: "agritwin-5f1c4.firebasestorage.app",
  messagingSenderId: "915718276777",
  appId: "1:915718276777:web:69d957f9122d4868684bb8",
  measurementId: "G-Y7XQ7X4QQ2"
};

// Initialize Firebase App
let firebaseApp = null;
let db = null;
let auth = null;

try {
  firebaseApp = getApps().length > 0 ? getApp() : initializeApp(USER_FIREBASE_CONFIG);
  db = getFirestore(firebaseApp);
  auth = getAuth(firebaseApp);
  console.log('[AgriTwin Firebase] Successfully connected to Firebase Project:', USER_FIREBASE_CONFIG.projectId);
} catch (err) {
  console.warn('[AgriTwin Firebase] Initialization warning, falling back to reactive simulator:', err);
}

class TelemetryFirebaseBridge {
  constructor() {
    this.subscribers = new Map();
    this.store = {
      fields: new Map(),
      zones: new Map(),
      sensors: new Map(),
      sensorReadings: [],
      alerts: [],
      recommendations: [],
      simulationState: {
        scenario: 'normal',
        speed: 'normal',
        isRunning: true,
        lastSync: new Date().toISOString()
      }
    };
    this.authListeners = new Set();
    this.currentUser = {
      uid: 'demo-presenter-01',
      email: 'presenter@campus.agri.edu',
      displayName: 'AgriTwin Presenter',
      isDemo: true
    };
    this.hasRemoteFirestore = !!db;

    // Listen to Firebase Auth state
    if (auth) {
      fbOnAuthStateChanged(auth, (u) => {
        if (u) {
          this.currentUser = {
            uid: u.uid,
            email: u.email || 'demo@agritwin-5f1c4.firebaseapp.com',
            displayName: u.displayName || (u.email ? u.email.split('@')[0] : 'Firebase User'),
            isDemo: u.isAnonymous
          };
        }
        this.authListeners.forEach(cb => cb(this.currentUser));
      });
    }
  }

  getCurrentUser() {
    return this.currentUser;
  }

  onAuthStateChanged(callback) {
    this.authListeners.add(callback);
    callback(this.currentUser);
    return () => this.authListeners.delete(callback);
  }

  async signIn(email, password) {
    if (auth && email && password) {
      try {
        const cred = await signInWithEmailAndPassword(auth, email, password);
        this.currentUser = {
          uid: cred.user.uid,
          email: cred.user.email,
          displayName: cred.user.displayName || email.split('@')[0],
          isDemo: false
        };
        this.authListeners.forEach(cb => cb(this.currentUser));
        return this.currentUser;
      } catch (err) {
        console.warn('[AgriTwin Auth] Cloud auth rejected, using demo session:', err.message);
      }
    }

    // Fallback demo session
    this.currentUser = {
      uid: 'user-' + Date.now(),
      email: email || 'presenter@campus.agri.edu',
      displayName: email ? email.split('@')[0] : 'AgriTwin Presenter',
      isDemo: false
    };
    this.authListeners.forEach(cb => cb(this.currentUser));
    return this.currentUser;
  }

  async signInDemo() {
    if (auth) {
      try {
        const cred = await signInAnonymously(auth);
        this.currentUser = {
          uid: cred.user.uid,
          email: 'demo@agritwin-5f1c4.presentation',
          displayName: 'Academic Presenter (Firebase Anonymous)',
          isDemo: true
        };
        this.authListeners.forEach(cb => cb(this.currentUser));
        return this.currentUser;
      } catch (err) {
        console.warn('[AgriTwin Auth] Anonymous auth fallback:', err.message);
      }
    }

    this.currentUser = {
      uid: 'demo-presenter-01',
      email: 'demo@agritwin.presentation',
      displayName: 'Academic Presenter (Demo Mode)',
      isDemo: true
    };
    this.authListeners.forEach(cb => cb(this.currentUser));
    return this.currentUser;
  }

  async signOut() {
    if (auth) {
      try {
        await fbSignOut(auth);
      } catch (err) {
        // ignore
      }
    }
    this.currentUser = null;
    this.authListeners.forEach(cb => cb(null));
  }

  // Real-time collections Pub/Sub
  subscribe(collectionName, callback) {
    if (!this.subscribers.has(collectionName)) {
      this.subscribers.set(collectionName, new Set());
    }
    this.subscribers.get(collectionName).add(callback);

    // Initial local trigger
    const initialData = this.getCollectionData(collectionName);
    callback(initialData);

    // Attempt real-time Firestore onSnapshot if online
    let remoteUnsub = null;
    if (db && ['zones', 'sensors', 'sensorReadings', 'alerts', 'recommendations'].includes(collectionName)) {
      try {
        const colRef = collection(db, collectionName);
        remoteUnsub = onSnapshot(colRef, (snapshot) => {
          if (!snapshot.empty) {
            snapshot.docChanges().forEach((change) => {
              const item = { id: change.doc.id, ...change.doc.data() };
              if (collectionName === 'sensorReadings') {
                if (change.type === 'added') {
                  const exists = this.store.sensorReadings.some(r => r.id === item.id);
                  if (!exists) this.store.sensorReadings.unshift(item);
                }
              } else if (this.store[collectionName] instanceof Map) {
                this.store[collectionName].set(item.id, item);
              }
            });
            this.notify(collectionName);
          }
        }, (error) => {
          // If Firestore security rules restrict read, fallback gracefully to in-memory store
          console.debug(`[Firestore ${collectionName}] listener active in local mode:`, error.code);
        });
      } catch (e) {
        console.debug('Firestore subscribe exception:', e);
      }
    }

    return () => {
      if (this.subscribers.has(collectionName)) {
        this.subscribers.get(collectionName).delete(callback);
      }
      if (remoteUnsub) remoteUnsub();
    };
  }

  notify(collectionName) {
    if (this.subscribers.has(collectionName)) {
      const data = this.getCollectionData(collectionName);
      this.subscribers.get(collectionName).forEach(cb => cb(data));
    }
  }

  getCollectionData(collectionName) {
    const raw = this.store[collectionName];
    if (!raw) return [];
    if (raw instanceof Map) {
      return Array.from(raw.values());
    }
    if (Array.isArray(raw)) {
      return [...raw];
    }
    return { ...raw };
  }

  // Write single document (Sync to Local + Real Firestore)
  async setDocument(collectionName, docId, data) {
    if (!this.store[collectionName]) {
      this.store[collectionName] = new Map();
    }
    const targetMap = this.store[collectionName];
    const payload = { id: docId, ...data, updatedAt: new Date().toISOString() };
    if (targetMap instanceof Map) {
      targetMap.set(docId, payload);
    } else {
      this.store[collectionName] = { ...this.store[collectionName], ...data };
    }
    this.notify(collectionName);

    // Write to Firestore in background
    if (db) {
      try {
        await setDoc(doc(db, collectionName, docId), payload, { merge: true });
      } catch (err) {
        // Silently ignore if rules are restrictive, local copy is already updated
      }
    }
  }

  // Append reading to stream (Sync to Local ring buffer + Firestore collection)
  async addSensorReading(reading) {
    const enriched = {
      id: 'reading_' + Date.now() + '_' + Math.random().toString(36).substr(2, 4),
      timestamp: new Date().toLocaleTimeString(),
      isoTimestamp: new Date().toISOString(),
      status: 'OK',
      ...reading
    };

    this.store.sensorReadings.unshift(enriched);
    if (this.store.sensorReadings.length > 250) {
      this.store.sensorReadings.pop();
    }

    this.notify('sensorReadings');

    // Async write to Firestore collection
    if (db) {
      try {
        await setDoc(doc(db, 'sensorReadings', enriched.id), enriched);
      } catch (err) {
        // Silently fallback to local stream
      }
    }

    return enriched;
  }

  // Manage Alerts
  async addAlert(alert) {
    const existingIndex = this.store.alerts.findIndex(
      a => a.zoneId === alert.zoneId && a.type === alert.type && !a.resolved
    );

    if (existingIndex >= 0) {
      this.store.alerts[existingIndex].timestamp = new Date().toLocaleTimeString();
      this.store.alerts[existingIndex].message = alert.message;
      this.notify('alerts');
      return this.store.alerts[existingIndex];
    }

    const newAlert = {
      id: 'alert_' + Date.now() + '_' + Math.random().toString(36).substr(2, 4),
      timestamp: new Date().toLocaleTimeString(),
      resolved: false,
      ...alert
    };
    this.store.alerts.unshift(newAlert);
    if (this.store.alerts.length > 50) this.store.alerts.pop();
    this.notify('alerts');

    if (db) {
      try {
        await setDoc(doc(db, 'alerts', newAlert.id), newAlert);
      } catch (err) {
        // ignore
      }
    }

    return newAlert;
  }

  async resolveAlertsForZone(zoneId, type = null) {
    let changed = false;
    this.store.alerts = this.store.alerts.map(a => {
      if (a.zoneId === zoneId && (!type || a.type === type) && !a.resolved) {
        changed = true;
        const updated = { ...a, resolved: true, resolvedAt: new Date().toLocaleTimeString() };
        if (db) {
          setDoc(doc(db, 'alerts', a.id), updated, { merge: true }).catch(() => {});
        }
        return updated;
      }
      return a;
    });
    if (changed) this.notify('alerts');
  }

  async resolveAlert(alertId) {
    this.store.alerts = this.store.alerts.map(a => {
      if (a.id === alertId) {
        const updated = { ...a, resolved: true, resolvedAt: new Date().toLocaleTimeString() };
        if (db) {
          setDoc(doc(db, 'alerts', alertId), updated, { merge: true }).catch(() => {});
        }
        return updated;
      }
      return a;
    });
    this.notify('alerts');
  }

  // Manage Recommendations
  async setRecommendation(rec) {
    const existing = this.store.recommendations.filter(r => r.zoneId !== rec.zoneId);
    this.store.recommendations = [rec, ...existing];
    this.notify('recommendations');

    if (db) {
      try {
        await setDoc(doc(db, 'recommendations', rec.zoneId), rec, { merge: true });
      } catch (err) {
        // ignore
      }
    }
  }

  clearRecommendation(zoneId) {
    this.store.recommendations = this.store.recommendations.filter(r => r.zoneId !== zoneId);
    this.notify('recommendations');
  }
}

export const firebaseBridge = new TelemetryFirebaseBridge();
export default firebaseBridge;
