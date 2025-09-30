// const DB_NAME = "storymap-db";
// const DB_VER = 1;

// function openDB() {
//   return new Promise((res, rej) => {
//     const req = indexedDB.open(DB_NAME, DB_VER);
//     req.onupgradeneeded = () => {
//       const db = req.result;
//       if (!db.objectStoreNames.contains("stories"))
//         db.createObjectStore("stories", { keyPath: "id" });
//       if (!db.objectStoreNames.contains("saved"))
//         db.createObjectStore("saved", { keyPath: "id" });
//       if (!db.objectStoreNames.contains("outbox"))
//         db.createObjectStore("outbox", { keyPath: "id", autoIncrement: true });
//     };
//     req.onsuccess = () => res(req.result);
//     req.onerror = () => rej(req.error);
//   });
// }

// export async function idbPut(store, value) {
//   const db = await openDB();
//   return new Promise((res, rej) => {
//     const tx = db.transaction(store, "readwrite");
//     tx.objectStore(store).put(value);
//     tx.oncomplete = () => res(true);
//     tx.onerror = () => rej(tx.error);
//   });
// }
// export async function idbGetAll(store) {
//   const db = await openDB();
//   return new Promise((res, rej) => {
//     const tx = db.transaction(store, "readonly");
//     const req = tx.objectStore(store).getAll();
//     req.onsuccess = () => res(req.result || []);
//     req.onerror = () => rej(req.error);
//   });
// }
// export async function idbDelete(store, key) {
//   const db = await openDB();
//   return new Promise((res, rej) => {
//     const tx = db.transaction(store, "readwrite");
//     tx.objectStore(store).delete(key);
//     tx.oncomplete = () => res(true);
//     tx.onerror = () => rej(tx.error);
//   });
// }

// // Outbox: simpan request POST saat offline → SW sync akan kirim ulang
// export async function queueOutbox({ url, fetchOptions }) {
//   const db = await openDB();
//   return new Promise((res, rej) => {
//     const tx = db.transaction("outbox", "readwrite");
//     tx.objectStore("outbox").add({ url, fetchOptions });
//     tx.oncomplete = () => res(true);
//     tx.onerror = () => rej(tx.error);
//   });
// }

// src/scripts/utils/db.js
// src/scripts/utils/db.js
// Utility IndexedDB untuk fitur Favorit (Create, Read, Delete)

const DB_NAME = "storymap-db";
const DB_VERSION = 1;
const STORE = "favorites";

function openDB() {
  if (!("indexedDB" in window)) {
    return Promise.reject(new Error("IndexedDB tidak didukung di browser ini"));
  }
  return new Promise((resolve, reject) => {
    const req = indexedDB.open(DB_NAME, DB_VERSION);

    req.onupgradeneeded = () => {
      const db = req.result;
      if (!db.objectStoreNames.contains(STORE)) {
        const os = db.createObjectStore(STORE, { keyPath: "id" });
        os.createIndex("createdAt", "createdAt");
      }
    };

    req.onsuccess = () => resolve(req.result);
    req.onerror = () => reject(req.error);
  });
}

/** CREATE / UPSERT */
export async function addFavorite(story) {
  const doc = {
    id: story.id,
    name: story.name ?? story.author ?? "-",
    description: story.description ?? story.desc ?? "-",
    photoUrl: story.photoUrl ?? story.photo ?? "",
    lat: story.lat ?? story.latitude ?? null,
    lon: story.lon ?? story.longitude ?? null,
    createdAt: Date.now(),
  };
  const db = await openDB();
  return new Promise((resolve, reject) => {
    const tx = db.transaction(STORE, "readwrite");
    tx.objectStore(STORE).put(doc); // upsert by keyPath
    tx.oncomplete = () => resolve(true);
    tx.onerror = () => reject(tx.error);
  });
}

/** READ (terbaru dulu) */
export async function getFavoritesSorted() {
  const db = await openDB();
  return new Promise((resolve, reject) => {
    const tx = db.transaction(STORE, "readonly");
    const idx = tx.objectStore(STORE).index("createdAt");
    const out = [];
    const cur = idx.openCursor(null, "prev");
    cur.onsuccess = (e) => {
      const c = e.target.result;
      if (c) {
        out.push(c.value);
        c.continue();
      } else {
        resolve(out);
      }
    };
    cur.onerror = () => reject(cur.error);
  });
}

/** DELETE */
export async function deleteFavorite(id) {
  const db = await openDB();
  return new Promise((resolve, reject) => {
    const tx = db.transaction(STORE, "readwrite");
    tx.objectStore(STORE).delete(id);
    tx.oncomplete = () => resolve(true);
    tx.onerror = () => reject(tx.error);
  });
}
