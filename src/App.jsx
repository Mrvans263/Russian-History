// App.js
import React from 'react';
import { LanguageProvider } from '../contexts/languageContext';
import MainRouter from '../components/MainRouter';
import './App.css';

function App() {
  return (
    <LanguageProvider>
      <div className="App">
        <MainRouter />
      </div>
    </LanguageProvider>
  );
}

export default App;