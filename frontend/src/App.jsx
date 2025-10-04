import React from "react";
import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import Header from "./components/Header/Header.jsx";
import Home from "./components/Home/Home.jsx";
import GameChat from "./components/GameChat/GameChat.jsx";
import Settings from "./components/Settings/Settings.jsx";
import "./App.css";

export default class App extends React.Component {
  render() {
    return (
      <BrowserRouter>
        <div className="app-shell">
          <Header />
          <main className="app-content">
            <Routes>
              <Route path="/" element={<Home />} />
              <Route path="/gamechat" element={<GameChat />} />
              <Route path="/settings" element={<Settings />} />
              <Route path="*" element={<Navigate to="/" replace />} />
            </Routes>
          </main>
        </div>
      </BrowserRouter>
    );
  }
}
