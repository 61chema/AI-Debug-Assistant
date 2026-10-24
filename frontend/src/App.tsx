import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import { AppShell } from "./components/layout/AppShell";
import { HomePage } from "./pages/HomePage";
import { ExplainPage } from "./pages/ExplainPage";
import { DebugPage } from "./pages/DebugPage";
import { AnalyzePage } from "./pages/AnalyzePage";
import { GithubPage } from "./pages/GithubPage";
import { HistoryPage } from "./pages/HistoryPage";

export default function App() {
  return (
    <BrowserRouter>
      <Routes>
        {/* AppShell wraps all pages, provides the sidebar + layout */}
        <Route element={<AppShell />}>
          <Route path="/" element={<HomePage />} />
          <Route path="/explain" element={<ExplainPage />} />
          <Route path="/debug" element={<DebugPage />} />
          <Route path="/analyze" element={<AnalyzePage />} />
          <Route path="/github" element={<GithubPage />} />
          <Route path="/history" element={<HistoryPage />} />
          {/* Redirect any unknown route to home */}
          <Route path="*" element={<Navigate to="/" replace />} />
        </Route>
      </Routes>
    </BrowserRouter>
  );
}
