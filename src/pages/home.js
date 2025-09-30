// import L from "leaflet";
// import "leaflet/dist/leaflet.css";
// import { apiGetStories } from "../api/story.js";

// // perbaiki ikon marker saat dibundle Vite
// import iconRetinaUrl from "leaflet/dist/images/marker-icon-2x.png";
// import iconUrl from "leaflet/dist/images/marker-icon.png";
// import shadowUrl from "leaflet/dist/images/marker-shadow.png";
// delete L.Icon.Default.prototype._getIconUrl;
// L.Icon.Default.mergeOptions({ iconRetinaUrl, iconUrl, shadowUrl });

// export default {
//   async render() {
//     return `
//       <section class="card" aria-labelledby="home-title">
//         <h1 id="home-title">Beranda</h1>
//         <div id="map" style="height:360px; border-radius:12px; margin-bottom:12px" aria-label="Peta cerita"></div>
//         <ul id="storyList" style="list-style:none; padding:0; margin:0"></ul>
//         <p id="homeMsg" role="status" style="margin-top:8px"></p>
//       </section>
//     `;
//   },

//   async afterRender() {
//     const mapEl = document.getElementById("map");
//     const listEl = document.getElementById("storyList");
//     const msgEl = document.getElementById("homeMsg");

//     msgEl.textContent = "Memuat cerita...";
//     try {
//       const data = await apiGetStories({
//         page: 1,
//         size: 30,
//         withLocation: true,
//       });
//       const items = data.listStory || [];

//       const map = L.map(mapEl).setView([-2.5, 118], 4);
//       L.tileLayer("https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png", {
//         maxZoom: 19,
//         attribution: "&copy; OpenStreetMap",
//       }).addTo(map);

//       const markers = [];
//       listEl.innerHTML = items
//         .map(
//           (s, i) => `
//         <li class="card" style="margin:8px 0; cursor:pointer" data-idx="${i}" tabindex="0" aria-label="Cerita ${
//             s.name
//           }">
//           <div style="display:flex;gap:12px;align-items:flex-start">
//             <img src="${s.photoUrl}" alt="Gambar cerita oleh ${
//             s.name
//           }" style="width:88px;height:88px;object-fit:cover;border-radius:10px"/>
//             <div>
//               <div><b>${s.name}</b> • <small>${new Date(
//             s.createdAt
//           ).toLocaleString()}</small></div>
//               <div>${s.description || ""}</div>
//               ${
//                 s.lat != null && s.lon != null
//                   ? `<small>(${s.lat}, ${s.lon})</small>`
//                   : ""
//               }
//             </div>
//           </div>
//         </li>
//       `
//         )
//         .join("");

//       items.forEach((s, i) => {
//         if (s.lat != null && s.lon != null) {
//           const m = L.marker([s.lat, s.lon]).addTo(map).bindPopup(`
//             <b>${s.name}</b><br/>${s.description || ""}<br/>
//             <img src="${
//               s.photoUrl
//             }" alt="" style="width:120px;height:80px;object-fit:cover;margin-top:6px;border-radius:6px"/>
//           `);
//           markers[i] = m;
//         }
//       });

//       listEl.querySelectorAll("li").forEach((li) => {
//         li.addEventListener("click", () => {
//           const i = +li.dataset.idx;
//           const mk = markers[i];
//           if (mk) {
//             map.setView(mk.getLatLng(), 12, { animate: true });
//             mk.openPopup();
//             li.style.outline = "2px solid #0ea5e9";
//             setTimeout(() => (li.style.outline = ""), 800);
//           }
//         });
//         li.addEventListener("keydown", (e) => {
//           if (e.key === "Enter") li.click();
//         });
//       });

//       msgEl.textContent = items.length ? "" : "Belum ada cerita.";
//     } catch (err) {
//       msgEl.textContent = err.message || "Gagal memuat data.";
//     }
//   },
// };

// src/pages/home.js
// src/pages/home.js
import { apiGetStories } from "../api/story.js";

// Leaflet
import L from "leaflet";
import "leaflet/dist/leaflet.css";
// Perbaiki ikon saat dibundle Vite
import iconRetinaUrl from "leaflet/dist/images/marker-icon-2x.png";
import iconUrl from "leaflet/dist/images/marker-icon.png";
import shadowUrl from "leaflet/dist/images/marker-shadow.png";
delete L.Icon.Default.prototype._getIconUrl;
L.Icon.Default.mergeOptions({ iconRetinaUrl, iconUrl, shadowUrl });

// IndexedDB utils (pakai path yang sudah kamu gunakan)
import {
  addFavorite,
  getFavoritesSorted,
  deleteFavorite,
} from "../scripts/utils/db.js";

export default {
  async render() {
    return `
      <section class="card" aria-labelledby="home-title">
        <h1 id="home-title" style="margin:0 0 12px 0;">Beranda</h1>

        <!-- MAP -->
        <div class="card" style="padding:12px; margin-bottom:16px;">
          <div id="map" style="height:360px; border-radius:12px; overflow:hidden;"></div>
        </div>

        <!-- LIST + FAVORIT -->
        <div style="display:grid; gap:16px;">
          <div class="card" style="padding:12px;">
            <div style="display:flex;align-items:center;justify-content:space-between;gap:12px;">
              <h2 style="margin:0;">Daftar dari API</h2>
              <small id="api-count" aria-live="polite"></small>
            </div>
            <ul id="storyList"
                aria-live="polite"
                style="display:grid; gap:12px; padding:0; list-style:none; margin-top:12px;"></ul>
            <div id="api-empty"
                 style="display:none; margin-top:8px; padding:10px; border:1px dashed #ddd; border-radius:12px;">
              Tidak ada data. Coba tambah story dulu.
            </div>
          </div>

          <aside class="card" style="padding:12px;">
            <div style="display:flex;align-items:center;justify-content:space-between;gap:12px;">
              <h2 style="margin:0;">Favorit (IndexedDB)</h2>
              <small id="fav-count" aria-live="polite"></small>
            </div>
            <div id="fav-empty"
                 role="status"
                 style="display:none; margin-top:8px; padding:10px; border:1px dashed #ddd; border-radius:12px;">
              Belum ada favorit. Klik <b>Simpan</b> pada item di atas.
            </div>
            <ul id="fav-list"
                aria-live="polite"
                style="display:grid; gap:8px; padding:0; list-style:none; margin-top:12px;"></ul>
          </aside>
        </div>
      </section>
    `;
  },

  async afterRender() {
    const mapEl = document.getElementById("map");
    const listEl = document.getElementById("storyList");
    const apiEmptyEl = document.getElementById("api-empty");
    const apiCountEl = document.getElementById("api-count");

    const favListEl = document.getElementById("fav-list");
    const favEmptyEl = document.getElementById("fav-empty");
    const favCountEl = document.getElementById("fav-count");

    // --- Inisialisasi peta
    const map = L.map(mapEl, { zoomControl: true });
    map.setView([-2.6, 118.0], 5);
    L.tileLayer("https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png", {
      attribution: "&copy; OpenStreetMap",
      maxZoom: 19,
    }).addTo(map);
    mapEl.style.pointerEvents = "auto";

    // Map <id> → marker
    const markersById = new Map();
    const leafletMarkers = [];

    // --- Panel Favorit (READ dari IDB)
    async function renderFavorites() {
      const items = await getFavoritesSorted();
      favListEl.innerHTML = items
        .map(
          (it) => `
        <li class="card" style="padding:10px; display:grid; gap:6px;">
          <div style="display:flex; gap:10px; align-items:flex-start;">
            ${
              it.photoUrl
                ? `<img src="${it.photoUrl}" alt="${it.name}" style="width:56px;height:56px;object-fit:cover;border-radius:10px;">`
                : ""
            }
            <div style="flex:1;">
              <div style="font-weight:600;">${it.name || "-"}</div>
              <div style="font-size:.9rem; opacity:.8;">${
                it.description || "-"
              }</div>
              ${
                it.lat != null && it.lon != null
                  ? `<small>(${it.lat}, ${it.lon})</small>`
                  : ""
              }
            </div>
          </div>
          <div style="display:flex; gap:8px; justify-content:flex-end;">
            <button class="btn btn-danger" data-delete="${it.id}">Hapus</button>
          </div>
        </li>
      `
        )
        .join("");

      favEmptyEl.style.display = items.length ? "none" : "block";
      favCountEl.textContent = items.length ? `${items.length} tersimpan` : "";

      // Sinkron status tombol "Simpan" pada daftar API
      const saved = new Set(items.map((x) => String(x.id)));
      listEl.querySelectorAll("[data-save]").forEach((btn) => {
        const id = btn.getAttribute("data-save");
        if (saved.has(String(id))) {
          btn.textContent = "Tersimpan ✓";
          btn.disabled = true;
        } else {
          btn.textContent = "Simpan";
          btn.disabled = false;
        }
      });
    }

    // --- Ambil data API
    let stories = [];
    try {
      const res = await apiGetStories();
      const arr = Array.isArray(res)
        ? res
        : Array.isArray(res?.listStory)
        ? res.listStory
        : Array.isArray(res?.data)
        ? res.data
        : [];
      stories = arr;
    } catch (err) {
      console.error("[API] Gagal memuat:", err);
      stories = [];
    }

    apiCountEl.textContent = stories.length ? `${stories.length} item` : "";
    apiEmptyEl.style.display = stories.length ? "none" : "block";

    // --- Tambah marker di peta + index by id
    for (const s of stories) {
      const id = s.id;
      const lat = parseFloat(s.lat ?? s.latitude);
      const lon = parseFloat(s.lon ?? s.longitude);
      if (Number.isFinite(lat) && Number.isFinite(lon)) {
        const m = L.marker([lat, lon]).addTo(map);
        m.bindPopup(
          `<b>${s.name ?? s.author ?? "-"}</b><br>${
            s.description ?? s.desc ?? "-"
          }`
        );
        leafletMarkers.push(m);
        if (id != null) markersById.set(String(id), m);
      }
    }
    if (leafletMarkers.length) {
      const group = L.featureGroup(leafletMarkers);
      map.fitBounds(group.getBounds().pad(0.2));
    }

    // --- Render daftar API (dengan tombol Simpan & atribut data-*)
    listEl.innerHTML = stories
      .map((s) => {
        const title = s.name ?? s.author ?? "-";
        const desc = s.description ?? s.desc ?? "-";
        const img = s.photoUrl ?? s.photo ?? "";
        const lat = s.lat ?? s.latitude ?? "";
        const lon = s.lon ?? s.longitude ?? "";
        return `
        <li class="card"
            style="padding:12px; display:grid; gap:8px; cursor:pointer;"
            data-id="${s.id}"
            data-lat="${lat}"
            data-lon="${lon}">
          <div style="display:flex; gap:12px; align-items:flex-start;">
            ${
              img
                ? `<img src="${img}" alt="${title}" style="width:72px;height:72px;object-fit:cover;border-radius:12px;">`
                : ""
            }
            <div style="flex:1;">
              <h3 style="margin:0 0 6px 0;">${title}</h3>
              <p style="margin:0;">${desc}</p>
            </div>
          </div>
          <div style="display:flex; gap:8px; justify-content:flex-end;">
            <button class="btn" type="button" data-save="${
              s.id
            }">Simpan</button>
          </div>
        </li>
      `;
      })
      .join("");

    // --- Delegasi klik LIST:
    //  - Klik tombol [Simpan] => CREATE ke IndexedDB
    //  - Klik area item lainnya => fokus ke marker di peta
    listEl.addEventListener("click", async (e) => {
      const saveBtn = e.target.closest("[data-save]");
      if (saveBtn) {
        const id = saveBtn.getAttribute("data-save");
        const s = stories.find((x) => String(x.id) === String(id));
        const li = saveBtn.closest("li");
        const story = s || {
          id,
          name: li.querySelector("h3")?.textContent?.trim() || "-",
          description: li.querySelector("p")?.textContent?.trim() || "-",
          photoUrl: li.querySelector("img")?.getAttribute("src") || "",
          lat: li.getAttribute("data-lat") || null,
          lon: li.getAttribute("data-lon") || null,
        };
        try {
          await addFavorite(story);
          await renderFavorites();
        } catch (err) {
          console.error("[IDB] addFavorite error:", err);
          alert("Gagal menyimpan ke favorit.");
        }
        return;
      }

      // Kalau bukan klik tombol -> fokus ke marker
      const li = e.target.closest("li[data-id]");
      if (!li) return;
      const id = li.getAttribute("data-id");
      const marker = markersById.get(String(id));
      if (marker) {
        const ll = marker.getLatLng();
        map.flyTo(ll, Math.max(map.getZoom(), 12), { duration: 0.7 });
        marker.openPopup();
      }
    });

    // --- Hapus di panel Favorit (DELETE)
    favListEl.addEventListener("click", async (e) => {
      const btn = e.target.closest("[data-delete]");
      if (!btn) return;
      try {
        await deleteFavorite(btn.getAttribute("data-delete"));
        await renderFavorites();
      } catch (err) {
        console.error("[IDB] deleteFavorite error:", err);
        alert("Gagal menghapus favorit.");
      }
    });

    // Render awal panel Favorit
    await renderFavorites();
  },
};
