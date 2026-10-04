import { useState } from "react";
import Auth from "./components/Auth";
import Dashboard from "./components/Dashboard";

export default function App() {
  const [authenticated, setAuthenticated] = useState(
    Boolean(localStorage.getItem("access_token")),
  );

  if (!authenticated) {
    return <Auth onLogin={() => setAuthenticated(true)} />;
  }

  return <Dashboard onLogout={() => setAuthenticated(false)} />;
}
