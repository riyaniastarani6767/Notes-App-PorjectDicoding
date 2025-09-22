// export default function AboutPage() {
//   const el = document.createElement("section");
//   el.className = "card";
//   el.innerHTML = `<h1>Tentang</h1><p>StoryMap – SPA + Leaflet + Story API.</p>`;
//   return el;
// }

export default {
  async render() {
    return `
      <div class="card">
        <h2>Tentang</h2>
        <p>StoryMap adalah contoh aplikasi SPA sederhana dengan routing hash.</p>
      </div>
    `;
  },
  async afterRender() {},
};
