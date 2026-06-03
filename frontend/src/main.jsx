import React, { useState } from "react";
import ReactDOM from "react-dom/client";
import App from "./App.jsx";
import Landing from "./Landing.jsx";
import "./index.css";

function Root() {
  const [started, setStarted] = useState(false);
  if (started) return <App />;
  return <Landing onStart={() => setStarted(true)} />;
}

ReactDOM.createRoot(document.getElementById("root")).render(
  <React.StrictMode>
    <Root />
  </React.StrictMode>
);