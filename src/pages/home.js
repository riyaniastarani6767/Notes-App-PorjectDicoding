import L from "leaflet";
import "leaflet/dist/leaflet.css";
import { apiGetStories } from "../api/story.js";

// perbaiki ikon marker saat dibundle Vite
import iconRetinaUrl from "leaflet/dist/images/marker-icon-2x.png";
import iconUrl from "leaflet/dist/images/marker-icon.png";
import shadowUrl from "leaflet/dist/images/marker-shadow.png";
delete L.Icon.Default.prototype._getIconUrl;
L.Icon.Default.mergeOptions({ iconRetinaUrl, iconUrl, shadowUrl });

export default {
  async render() {
    return `
      <section class="card" aria-labelledby="home-title">
        <h1 id="home-title">Beranda</h1>
        <div id="map" style="height:360px; border-radius:12px; margin-bottom:12px" aria-label="Peta cerita"></div>
        <ul id="storyList" style="list-style:none; padding:0; margin:0"></ul>
        <p id="homeMsg" role="status" style="margin-top:8px"></p>
      </section>
    `;
  },

  async afterRender() {
    const mapEl = document.getElementById("map");
    const listEl = document.getElementById("storyList");
    const msgEl = document.getElementById("homeMsg");

    msgEl.textContent = "Memuat cerita...";
    try {
      const data = await apiGetStories({
        page: 1,
        size: 30,
        withLocation: true,
      });
      const items = data.listStory || [];

      const map = L.map(mapEl).setView([-2.5, 118], 4);
      L.tileLayer("https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png", {
        maxZoom: 19,
        attribution: "&copy; OpenStreetMap",
      }).addTo(map);

      const markers = [];
      listEl.innerHTML = items
        .map(
          (s, i) => `
        <li class="card" style="margin:8px 0; cursor:pointer" data-idx="${i}" tabindex="0" aria-label="Cerita ${
            s.name
          }">
          <div style="display:flex;gap:12px;align-items:flex-start">
            <img src="${s.photoUrl}" alt="Gambar cerita oleh ${
            s.name
          }" style="width:88px;height:88px;object-fit:cover;border-radius:10px"/>
            <div>
              <div><b>${s.name}</b> • <small>${new Date(
            s.createdAt
          ).toLocaleString()}</small></div>
              <div>${s.description || ""}</div>
              ${
                s.lat != null && s.lon != null
                  ? `<small>(${s.lat}, ${s.lon})</small>`
                  : ""
              }
            </div>
          </div>
        </li>
      `
        )
        .join("");

      items.forEach((s, i) => {
        if (s.lat != null && s.lon != null) {
          const m = L.marker([s.lat, s.lon]).addTo(map).bindPopup(`
            <b>${s.name}</b><br/>${s.description || ""}<br/>
            <img src="${
              s.photoUrl
            }" alt="" style="width:120px;height:80px;object-fit:cover;margin-top:6px;border-radius:6px"/>
          `);
          markers[i] = m;
        }
      });

      listEl.querySelectorAll("li").forEach((li) => {
        li.addEventListener("click", () => {
          const i = +li.dataset.idx;
          const mk = markers[i];
          if (mk) {
            map.setView(mk.getLatLng(), 12, { animate: true });
            mk.openPopup();
            li.style.outline = "2px solid #0ea5e9";
            setTimeout(() => (li.style.outline = ""), 800);
          }
        });
        li.addEventListener("keydown", (e) => {
          if (e.key === "Enter") li.click();
        });
      });

      msgEl.textContent = items.length ? "" : "Belum ada cerita.";
    } catch (err) {
      msgEl.textContent = err.message || "Gagal memuat data.";
    }
  },
};
