import L from "leaflet";
import "leaflet/dist/leaflet.css";
import { apiAddStory } from "../api/story.js";

// perbaikan ikon marker saat bundle Vite
import iconRetinaUrl from "leaflet/dist/images/marker-icon-2x.png";
import iconUrl from "leaflet/dist/images/marker-icon.png";
import shadowUrl from "leaflet/dist/images/marker-shadow.png";
delete L.Icon.Default.prototype._getIconUrl;
L.Icon.Default.mergeOptions({ iconRetinaUrl, iconUrl, shadowUrl });

export default {
  async render() {
    return `
      <section class="card" aria-labelledby="add-title">
        <h1 id="add-title">Tambah Data</h1>

        <div id="pickMap"
             style="height:300px; border-radius:12px; margin-bottom:12px"
             aria-label="Pilih lokasi pada peta"></div>

        <form id="addForm" novalidate>
          <div class="form-group">
            <label for="description">Deskripsi</label>
            <textarea id="description" name="description" rows="3" required aria-required="true"></textarea>
          </div>

          <div style="display:grid; grid-template-columns:1fr 1fr; gap:8px">
            <div class="form-group">
              <label for="lat">Latitude</label>
              <input id="lat" name="lat" type="number" step="any" required aria-required="true" />
            </div>
            <div class="form-group">
              <label for="lon">Longitude</label>
              <input id="lon" name="lon" type="number" step="any" required aria-required="true" />
            </div>
          </div>

          <!-- ====== Bagian Foto: File Upload ATAU Kamera ====== -->
          <fieldset style="margin-top:12px">
            <legend>Foto</legend>

            <!-- Pilihan 1: Upload file biasa -->
            <div class="form-group">
              <label for="photo">Unggah file</label>
              <input id="photo" name="photo" type="file" accept="image/*" />
            </div>

            <!-- Divider kecil -->
            <div aria-hidden="true" style="height:1px;background:#e5e7eb;margin:10px 0;"></div>

            <!-- Pilihan 2: Pakai kamera langsung (Media Stream API) -->
            <div class="form-group" aria-live="polite">
              <button id="btnOpenCam" type="button" class="btn-outline" aria-controls="camRegion">Gunakan Kamera</button>
              <button id="btnCloseCam" type="button" class="btn-outline" style="display:none">Tutup Kamera</button>

              <div id="camRegion" style="margin-top:10px; display:none">
                <video id="videoPreview" autoplay playsinline style="width:100%; max-height:280px; border-radius:12px; background:#000" aria-label="Pratinjau kamera"></video>
                <div style="margin-top:8px; display:flex; gap:8px; flex-wrap:wrap">
                  <button id="btnShot" type="button" class="btn">Ambil Foto</button>
                  <span id="camMsg" role="status" style="align-self:center"></span>
                </div>
                <!-- Canvas untuk menangkap frame (disembunyikan) -->
                <canvas id="shotCanvas" style="display:none"></canvas>
                <!-- Preview hasil jepretan -->
                <div id="shotPreviewWrap" style="margin-top:8px; display:none">
                  <img id="shotPreview" alt="Hasil jepretan kamera" style="max-width:100%; border-radius:12px"/>
                </div>
              </div>
            </div>
          </fieldset>
          <!-- ====== end foto ====== -->

          <div style="margin-top:12px">
            <button class="btn" type="submit">Kirim</button>
          </div>
          <p id="addMsg" role="alert" style="margin-top:8px"></p>
        </form>
      </section>
    `;
  },

  async afterRender() {
    // ---------- Map picking ----------
    const mapEl = document.getElementById("pickMap");
    const form = document.getElementById("addForm");
    const msg = document.getElementById("addMsg");

    const map = L.map(mapEl).setView([-2.5, 118], 4);
    L.tileLayer("https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png", {
      maxZoom: 19,
      attribution: "&copy; OpenStreetMap",
    }).addTo(map);

    let pin = null;
    const latEl = form.querySelector("#lat");
    const lonEl = form.querySelector("#lon");

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

    // ---------- Camera (Media Stream API) ----------
    const btnOpenCam = document.getElementById("btnOpenCam");
    const btnCloseCam = document.getElementById("btnCloseCam");
    const camRegion = document.getElementById("camRegion");
    const video = document.getElementById("videoPreview");
    const btnShot = document.getElementById("btnShot");
    const canvas = document.getElementById("shotCanvas");
    const camMsg = document.getElementById("camMsg");
    const shotPreviewWrap = document.getElementById("shotPreviewWrap");
    const shotPreview = document.getElementById("shotPreview");

    let mediaStream = null; // stream aktif
    let capturedBlob = null; // hasil foto
    const stopStream = () => {
      if (mediaStream) {
        mediaStream.getTracks().forEach((t) => t.stop());
        mediaStream = null;
      }
    };

    const closeCameraUI = () => {
      stopStream();
      camRegion.style.display = "none";
      btnCloseCam.style.display = "none";
      btnOpenCam.style.display = "";
      camMsg.textContent = "";
    };

    btnOpenCam?.addEventListener("click", async () => {
      try {
        mediaStream = await navigator.mediaDevices.getUserMedia({
          video: { facingMode: { ideal: "environment" } },
          audio: false,
        });
        video.srcObject = mediaStream;

        camRegion.style.display = "";
        btnCloseCam.style.display = "";
        btnOpenCam.style.display = "none";
        camMsg.textContent = "Kamera aktif.";

        capturedBlob = null;
        shotPreviewWrap.style.display = "none";
        shotPreview.src = "";
      } catch (err) {
        camMsg.textContent = "Gagal mengakses kamera: " + (err.message || err);
      }
    });

    btnCloseCam?.addEventListener("click", () => {
      closeCameraUI();
    });

    btnShot?.addEventListener("click", async () => {
      if (!mediaStream) {
        camMsg.textContent = "Kamera belum aktif.";
        return;
      }
      const track = mediaStream.getVideoTracks?.()[0];
      const settings = track?.getSettings?.() || {};
      const w = settings.width || video.videoWidth || 640;
      const h = settings.height || video.videoHeight || 480;

      canvas.width = w;
      canvas.height = h;
      const ctx = canvas.getContext("2d");
      ctx.drawImage(video, 0, 0, w, h);

      canvas.toBlob(
        (blob) => {
          if (!blob) {
            camMsg.textContent = "Gagal mengambil foto.";
            return;
          }
          capturedBlob = blob;
          // tampilkan preview
          const url = URL.createObjectURL(blob);
          shotPreview.src = url;
          shotPreviewWrap.style.display = "";
          camMsg.textContent = "Foto diambil.";
          // matikan kamera setelah jepret
          stopStream();
          btnCloseCam.style.display = "none";
          btnOpenCam.style.display = "";
        },
        "image/jpeg",
        0.92
      );
    });

    // Matikan stream kalau user pindah halaman
    window.addEventListener("hashchange", stopStream);

    window.addEventListener("beforeunload", stopStream);

    // ---------- Submit ----------
    form?.addEventListener("submit", async (e) => {
      e.preventDefault();
      msg.style.color = "#111827";
      msg.textContent = "Mengirim...";

      const fd = new FormData(form);
      const description = fd.get("description")?.toString().trim();
      const lat = parseFloat(fd.get("lat"));
      const lon = parseFloat(fd.get("lon"));

      let photoFile = fd.get("photo");
      if (capturedBlob) {
        photoFile = new File([capturedBlob], "camera-shot.jpg", {
          type: "image/jpeg",
        });
      }

      if (
        !description ||
        !photoFile ||
        Number.isNaN(lat) ||
        Number.isNaN(lon)
      ) {
        msg.style.color = "#dc2626";
        msg.textContent =
          "Lengkapi deskripsi, lokasi peta, dan foto (unggah file atau ambil dari kamera).";
        return;
      }

      try {
        await apiAddStory({ photoFile, description, lat, lon });
        msg.style.color = "#16a34a";
        msg.textContent = "Berhasil menambah cerita.";
      } catch (err) {
        msg.style.color = "#dc2626";
        msg.textContent = err.message || "Gagal menambah cerita.";
      } finally {
        stopStream();
        // balik ke beranda saat sukses
        if (msg.style.color === "rgb(22, 163, 74)") {
          setTimeout(() => (window.location.hash = "#/"), 600);
        }
      }
    });
  },
};
