import React, { useState, useEffect } from 'react';
import './App.css';
import PhotoCanvas from './components/PhotoCanvas';
import GalleryManager from './components/GalleryManager';
import { Gallery } from './types/Gallery';
import IndexedDBStorage from './utils/indexedDBStorage';

function App() {
  const [currentGallery, setCurrentGallery] = useState<Gallery | null>(null);

  useEffect(() => {
    // Initialize IndexedDB and migrate from localStorage if needed
    const initStorage = async () => {
      try {
        await IndexedDBStorage.migrateFromLocalStorage();
      } catch (error) {
        console.error('Error initializing storage:', error);
      }
    };
    initStorage();
  }, []);

  const handleGallerySelect = (gallery: Gallery) => {
    setCurrentGallery(gallery);
  };

  const handleBackToGalleries = () => {
    setCurrentGallery(null);
  };

  return (
    <div className="App">
      {currentGallery ? (
        <PhotoCanvas 
          gallery={currentGallery}
          onBackToGalleries={handleBackToGalleries}
        />
      ) : (
        <GalleryManager onGallerySelect={handleGallerySelect} />
      )}
    </div>
  );
}

export default App;
