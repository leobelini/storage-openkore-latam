import { Routes, Route } from "react-router";

import Home from "./pages/home"
import System from "./pages/system";
import SystemProvider from "./pages/system/context";

function App() {

  return (
    <SystemProvider>
      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="system"  >
          <Route index element={<System />} />
        </Route>
      </Routes>
    </SystemProvider>
  )
}

export default App
