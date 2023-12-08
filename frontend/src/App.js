import * as React from "react"
// import { Component } from "react"
import "./App.css"
import { BrowserRouter, Routes, Route } from "react-router-dom"
// import "bootstrap/dist/css/bootstrap.min.css"
import { Home } from "./Overview/Home"
import { Name } from "./Name"
import FileUploadComponent from "./Components/FileUploadComponent"
// import { TrendingReport } from "./bfxTrendingReport"

function App() {
    return (
        <BrowserRouter>
            <Routes>
                <Route path="/home" exact element={<Home />} />
                <Route path="/" exact element={<FileUploadComponent />} />
            </Routes>
        </BrowserRouter>
    )
}

export default App
