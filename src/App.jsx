// App.js
import React from 'react';
import { LanguageProvider } from '../contexts/LanguageContext';
import { AuthProvider } from '../contexts/AuthContext'; // ← ADD THIS IMPORT
import MainRouter from '../components/MainRouter';
import './App.css';

function App() {
  return (
    <LanguageProvider>
      <AuthProvider>  {/* ← ADD THIS WRAPPER */}
        <div className="App">
          <MainRouter />
        </div>
      </AuthProvider>
    </LanguageProvider>
  );
}

export default App;