export function createMap(
  containerId,
  { center = [-2.5, 118], zoom = 5 } = {}
) {
  const map = L.map(containerId).setView(center, zoom);

  const osm = L.tileLayer(
    "https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png",
    {
      attribution: "&copy; OpenStreetMap",
    }
  );
  const toner = L.tileLayer(
    "https://stamen-tiles.a.ssl.fastly.net/toner/{z}/{x}/{y}.png",
    {
      attribution: "&copy; Stamen",
    }
  );
  const esri = L.tileLayer(
    "https://server.arcgisonline.com/ArcGIS/rest/services/World_Imagery/MapServer/tile/{z}/{y}/{x}",
    {
      attribution: "&copy; Esri",
    }
  );

  osm.addTo(map);
  L.control
    .layers({
      OpenStreetMap: osm,
      "Stamen Toner": toner,
      "Esri Satellite": esri,
    })
    .addTo(map);
  return { map };
}

export function addMarker(map, { lat, lon, title, description, imageUrl }) {
  const m = L.marker([lat, lon]).addTo(map);
  const html = `
<article>
${imageUrl ? `<img src="${imageUrl}" alt="${title}" width="160"/>` : ""}
<h3 style="margin:.4rem 0">${title}</h3>
<p style="margin:0">${description ?? ""}</p>
</article>`;
  m.bindPopup(html);
  return m;
}
