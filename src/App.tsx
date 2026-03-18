import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import { ThemeProvider } from "./contexts/ThemeContext";
import { SearchProvider } from "./contexts/SearchContext";
import { Landing } from "./pages/Landing";
import { Dashboard } from "./pages/Dashboard";
import { NewSearch } from "./pages/NewSearch";
import { Busquedas } from "./pages/Busquedas";
import { SearchPipeline } from "./pages/SearchPipeline";
import { CandidateDetail } from "./pages/CandidateDetail";
import { Terna } from "./pages/Terna";
import { Interviews } from "./pages/Interviews";
import { Analytics } from "./pages/Analytics";

export default function App() {
  return (
    <BrowserRouter>
      <ThemeProvider>
      <SearchProvider>
      <Routes>
        <Route path="/" element={<Landing />} />
        <Route path="/dashboard" element={<Dashboard />} />
        <Route path="/nueva-busqueda" element={<NewSearch />} />
        <Route path="/busquedas" element={<Busquedas />} />
        <Route path="/busquedas/:id" element={<SearchPipeline />} />
        <Route path="/busquedas/:id/terna" element={<Terna />} />
        <Route path="/candidato/:id" element={<CandidateDetail />} />
        <Route path="/entrevistas" element={<Interviews />} />
        <Route path="/analytics" element={<Analytics />} />
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
      </SearchProvider>
      </ThemeProvider>
    </BrowserRouter>
  );
}
