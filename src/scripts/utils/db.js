const DB_NAME = "storymap-db";
const DB_VER = 1;

function openDB() {
  return new Promise((res, rej) => {
    const req = indexedDB.open(DB_NAME, DB_VER);
    req.onupgradeneeded = () => {
      const db = req.result;
      if (!db.objectStoreNames.contains("stories"))
        db.createObjectStore("stories", { keyPath: "id" });
      if (!db.objectStoreNames.contains("saved"))
        db.createObjectStore("saved", { keyPath: "id" });
      if (!db.objectStoreNames.contains("outbox"))
        db.createObjectStore("outbox", { keyPath: "id", autoIncrement: true });
    };
    req.onsuccess = () => res(req.result);
    req.onerror = () => rej(req.error);
  });
}

export async function idbPut(store, value) {
  const db = await openDB();
  return new Promise((res, rej) => {
    const tx = db.transaction(store, "readwrite");
    tx.objectStore(store).put(value);
    tx.oncomplete = () => res(true);
    tx.onerror = () => rej(tx.error);
  });
}
export async function idbGetAll(store) {
  const db = await openDB();
  return new Promise((res, rej) => {
    const tx = db.transaction(store, "readonly");
    const req = tx.objectStore(store).getAll();
    req.onsuccess = () => res(req.result || []);
    req.onerror = () => rej(req.error);
  });
}
export async function idbDelete(store, key) {
  const db = await openDB();
  return new Promise((res, rej) => {
    const tx = db.transaction(store, "readwrite");
    tx.objectStore(store).delete(key);
    tx.oncomplete = () => res(true);
    tx.onerror = () => rej(tx.error);
  });
}

// Outbox: simpan request POST saat offline → SW sync akan kirim ulang
export async function queueOutbox({ url, fetchOptions }) {
  const db = await openDB();
  return new Promise((res, rej) => {
    const tx = db.transaction("outbox", "readwrite");
    tx.objectStore("outbox").add({ url, fetchOptions });
    tx.oncomplete = () => res(true);
    tx.onerror = () => rej(tx.error);
  });
}
