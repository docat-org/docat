import React from 'react';
import { BrowserRouter, Route, Routes } from 'react-router-dom';
import Footer from './components/Footer';
import Header from './components/Header';

function App() {
  return (
    <div className="App">
      <Header></Header>
      {/* <BrowserRouter>
        <Routes>
          <Route path="/" element={Home} />
          <Route path="/help" element={Help} />
          <Route path="/upload" element={Upload} />
          <Route path="/claim" element={Claim} />
          <Route path="/delete" element={Delete} />
          <Route path="/:project/:version?/:location?" element={Docs} />
        </Routes>
      </BrowserRouter> */}
      {/* <Footer></Footer> */}
    </div>
  );
}

export default App;
