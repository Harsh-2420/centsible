// import logo from './logo.svg';
// import './App.css';

// function App() {
//   return (
//     <div className="App">
//       <header className="App-header">
//         <img src={logo} className="App-logo" alt="logo" />
//         <p>
//           Edit <code>src/App.js</code> and save to reload.
//         </p>
//         <a
//           className="App-link"
//           href="https://reactjs.org"
//           target="_blank"
//           rel="noopener noreferrer"
//         >
//           Learn React
//         </a>
//       </header>
//     </div>
//   );
// }

// export default App;

import * as React from "react"
// import { Component } from "react"
import "./App.css"
import { BrowserRouter, Routes, Route } from "react-router-dom"
// import "bootstrap/dist/css/bootstrap.min.css"
import { Home } from "./Overview/Home"
import { Name } from "./Name"
// import { TrendingReport } from "./bfxTrendingReport"

function App() {
    return (
        <BrowserRouter>
            <Routes>
                <Route path="/" exact element={<Home />} />
                {/* <Route path="/trending_report" element={<TrendingReport />} /> */}
            </Routes>
        </BrowserRouter>
    )
}

export default App
