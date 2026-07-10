import { createRoot } from "react-dom/client";
import App from "./App";
import "./index.css";
import { initGA4 } from "@/lib/analytics";

// Initialise GA4 as early as possible (before React renders)
initGA4();

createRoot(document.getElementById("root")!).render(<App />);
