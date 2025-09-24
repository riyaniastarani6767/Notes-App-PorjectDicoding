import { apiAddStory } from "../api/story.js";

export default {
  async render() {
    return `
      <section class="card" aria-labelledby="add-title">
        <h2 id="add-title">Tambah Data</h2>
        <div id="pickMap" style="height:300px; border-radius:12px; margin-bottom:12px" aria-label="Pilih lokasi pada peta"></div>

        <form id="addForm" novalidate>
          <label>Deskripsi
            <textarea name="description" rows="3" required aria-required="true"></textarea>
          </label>

          <div style="display:grid; grid-template-columns:1fr 1fr; gap:8px">
            <label>Latitude
              <input name="lat" type="number" step="any" required aria-required="true" />
            </label>
            <label>Longitude
              <input name="lon" type="number" step="any" required aria-required="true" />
            </label>
          </div>

          <label>Foto
            <input name="photo" type="file" accept="image/*" capture="environment" required aria-required="true" />
          </label>

          <div style="margin-top:12px">
            <button class="btn">Kirim</button>
          </div>
          <p id="addMsg" role="alert" style="margin-top:8px"></p>
        </form>
      </section>
    `;
  },
  async afterRender() {
    const mapEl = document.getElementById("pickMap");
    const form = document.getElementById("addForm");
    const msg = document.getElementById("addMsg");

    // Map for picking lat/lon
    const map = L.map(mapEl).setView([-2.5, 118], 4);
    L.tileLayer("https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png", {
      maxZoom: 19,
      attribution: "&copy; OpenStreetMap",
    }).addTo(map);

    let pin = null;
    const latEl = form.lat,
      lonEl = form.lon;

    map.on("click", (e) => {
      const { lat, lng } = e.latlng;
      latEl.value = lat.toFixed(6);
      lonEl.value = lng.toFixed(6);
      if (pin) pin.setLatLng(e.latlng);
      else pin = L.marker(e.latlng, { draggable: true }).addTo(map);
      pin.on("dragend", () => {
        const p = pin.getLatLng();
        latEl.value = p.lat.toFixed(6);
        lonEl.value = p.lng.toFixed(6);
      });
    });

    form?.addEventListener("submit", async (e) => {
      e.preventDefault();
      msg.style.color = "#111827";
      msg.textContent = "Mengirim...";

      const fd = new FormData(form);
      const description = fd.get("description")?.toString().trim();
      const lat = parseFloat(fd.get("lat"));
      const lon = parseFloat(fd.get("lon"));
      const photoFile = fd.get("photo");

      if (
        !description ||
        !photoFile ||
        Number.isNaN(lat) ||
        Number.isNaN(lon)
      ) {
        msg.style.color = "#dc2626";
        msg.textContent = "Lengkapi semua data dan pilih lokasi di peta.";
        return;
      }

      try {
        await apiAddStory({ photoFile, description, lat, lon });
        msg.style.color = "#16a34a";
        msg.textContent = "Berhasil menambah cerita.";
        setTimeout(() => (window.location.hash = "#/"), 600);
      } catch (err) {
        msg.style.color = "#dc2626";
        msg.textContent = err.message || "Gagal menambah cerita.";
      }
    });
  },
};
