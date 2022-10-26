import { BrowserRouter, Route, Routes } from "react-router-dom";
import Footer from "./components/Footer";
import Header from "./components/Header";
import Home from "./pages/Home";
import Upload from "./pages/Upload";

function App() {
  return (
    <BrowserRouter>
      <div className="App">
        <Header></Header>
        <Routes>
          <Route path="/" element={Home()} />
          {/* <Route path="/help" element={Help} /> */}
          <Route path="/upload" element={Upload()} />
          {/* <Route path="/claim" element={Claim} /> */}
          {/* <Route path="/delete" element={Delete} /> */}
          {/* <Route path="/:project/:version?/:location?" element={Docs} />  */}
        </Routes>
        <Footer></Footer>
      </div>
    </BrowserRouter>
  );
}

export default App;
