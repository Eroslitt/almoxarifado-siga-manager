import { BrowserRouter, Routes, Route } from "react-router-dom";

// Minimal app to test if React works
function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/*" element={<div className="min-h-screen flex items-center justify-center bg-gray-100"><h1 className="text-2xl">App Loading Test</h1></div>} />
      </Routes>
    </BrowserRouter>
  );
}

export default App;
