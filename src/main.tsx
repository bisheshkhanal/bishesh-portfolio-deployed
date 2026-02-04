import ReactDOM from "react-dom/client";

import "./index.css";
import App from "./app/App";

const container = document.getElementById("root");

if (!container) throw new Error('Root container "#root" not found');

ReactDOM.createRoot(container).render(<App />);
