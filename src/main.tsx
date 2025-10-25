import React from "react";
import ReactDOM from "react-dom/client";
import App from "./App";
import Overlay from "./components/Overlay";
import { AppProvider, ThemeProvider, useApp } from "./contexts";
import "./global.css";
import { getCurrentWindow } from "@tauri-apps/api/window";
import { PromptToast } from "./components"; // Import the Toast component

const currentWindow = getCurrentWindow();
const windowLabel = currentWindow.label;

const Root = () => {
  const { toast } = useApp(); // Get the toast state from the context

  return (
    <>
      <App />
      <PromptToast message={toast.message} show={toast.show} />
    </>
  );
};

// Render different components based on window label
if (windowLabel === "capture-overlay") {
  // Render overlay without providers
  ReactDOM.createRoot(document.getElementById("root") as HTMLElement).render(
    <React.StrictMode>
      <Overlay />
    </React.StrictMode>
  );
} else {
  ReactDOM.createRoot(document.getElementById("root") as HTMLElement).render(
    <React.StrictMode>
      <ThemeProvider>
        <AppProvider>
          <Root />
        </AppProvider>
      </ThemeProvider>
    </React.StrictMode>
  );
}
