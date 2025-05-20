import { BrowserRouter, Routes, Route } from "react-router-dom";
import React from 'react';
import Chat from './chat/Chat';
import Dashboard from './dashboard/Dashboard';

const App: React.FC = () => {
  return (
    <div>
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<Chat />}/>
        <Route path="/metrics" element={<Dashboard />}/>
      </Routes>
    </BrowserRouter>
    </div>
  );
};

export default App;
