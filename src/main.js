// // src/main.js
// import { initRouter } from "./routes/router.js"; // ✅ path yang benar
// initRouter();

// // src/main.js
// import "./styles/main.css"; // biar CSS pasti termuat
// import { initRouter } from "./routes/router.js";
// initRouter();

import "./styles/main.css";
import { render } from "./routers/router.js";

window.addEventListener("load", render);
