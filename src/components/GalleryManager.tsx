import React, { useState, useEffect } from 'react';
import { Gallery, GalleryListItem } from '../types/Gallery';
import IndexedDBStorage from '../utils/indexedDBStorage';

interface GalleryManagerProps {
  onGallerySelect: (gallery: Gallery) => void;
}

const GalleryManager: React.FC<GalleryManagerProps> = ({ onGallerySelect }) => {
  const [galleries, setGalleries] = useState<GalleryListItem[]>([]);
  const [isCreating, setIsCreating] = useState(false);
  const [newGalleryName, setNewGalleryName] = useState('');
  const [newGalleryDescription, setNewGalleryDescription] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [storageInfo, setStorageInfo] = useState({ used: 0, available: 0, cacheEntries: 0, galleries: 0 });

  useEffect(() => {
    loadGalleries();
  }, []);

  const loadGalleries = async () => {
    try {
      const [galleryList, storage] = await Promise.all([
        IndexedDBStorage.getAllGalleries(),
        IndexedDBStorage.getStorageUsage()
      ]);
      setGalleries(galleryList.sort((a, b) => b.updatedAt.getTime() - a.updatedAt.getTime()));
      setStorageInfo(storage);
    } catch (error) {
      console.error('Error loading galleries:', error);
      setGalleries([]);
    }
  };

  const handleCreateGallery = async () => {
    if (!newGalleryName.trim()) return;
    
    setIsLoading(true);
    try {
      const now = new Date();
      const newGallery: Gallery = {
        id: `gallery-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
        name: newGalleryName.trim(),
        description: newGalleryDescription?.trim(),
        createdAt: now,
        updatedAt: now,
        photos: [],
        imageLibrary: [],
        settings: {
          imageSize: 300
        },
        metadata: {
          photoCount: 0,
          libraryCount: 0
        }
      };
      
      await IndexedDBStorage.saveGallery(newGallery);
      onGallerySelect(newGallery);
    } catch (error) {
      console.error('Error creating gallery:', error);
      alert('Failed to create gallery. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  const handleLoadGallery = async (galleryId: string) => {
    setIsLoading(true);
    try {
      const gallery = await IndexedDBStorage.getGallery(galleryId);
      if (gallery) {
        onGallerySelect(gallery);
      } else {
        alert('Gallery not found!');
      }
    } catch (error) {
      console.error('Error loading gallery:', error);
      alert('Failed to load gallery. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  const handleDeleteGallery = async (galleryId: string, galleryName: string) => {
    if (window.confirm(`Are you sure you want to delete "${galleryName}"? This action cannot be undone.`)) {
      try {
        await IndexedDBStorage.deleteGallery(galleryId);
        await loadGalleries();
      } catch (error) {
        console.error('Error deleting gallery:', error);
        alert('Failed to delete gallery. Please try again.');
      }
    }
  };

  const handleClearCache = async () => {
    if (window.confirm('This will clear all cached images to free up storage space. Your galleries will not be affected, but images may need to be reprocessed. Continue?')) {
      try {
        const clearedCount = await IndexedDBStorage.clearAllCache();
        alert(`Cache cleared successfully! ${clearedCount} cached images removed and storage space has been freed up.`);
      } catch (error) {
        console.error('Error clearing cache:', error);
        alert('Failed to clear cache. Please try again.');
      }
    }
  };

  const formatDate = (date: Date) => {
    return date.toLocaleDateString() + ' ' + date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
  };

  return (
    <div style={{
      display: 'flex',
      flexDirection: 'column',
      height: '100vh',
      backgroundColor: '#f8f9fa'
    }}>
      {/* Header */}
      <div style={{
        padding: '30px',
        backgroundColor: '#fff',
        borderBottom: '1px solid #dee2e6',
        textAlign: 'center'
      }}>
        <h1 style={{
          margin: '0 0 10px 0',
          fontSize: '32px',
          fontWeight: 'bold',
          color: '#212529'
        }}>
          📸 Photo Gallery Designer
        </h1>
        <p style={{
          margin: '0',
          fontSize: '16px',
          color: '#6c757d'
        }}>
          Create and manage your photo gallery collections
        </p>
      </div>

      {/* Main Content */}
      <div style={{
        flex: 1,
        padding: '40px',
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        maxWidth: '1200px',
        margin: '0 auto',
        width: '100%'
      }}>
        {/* Create New Gallery Section */}
        <div style={{
          backgroundColor: '#fff',
          borderRadius: '12px',
          padding: '30px',
          marginBottom: '40px',
          width: '100%',
          maxWidth: '600px',
          boxShadow: '0 4px 6px rgba(0, 0, 0, 0.1)',
          border: '1px solid #dee2e6'
        }}>
          <h2 style={{
            margin: '0 0 20px 0',
            fontSize: '24px',
            fontWeight: 'bold',
            color: '#212529',
            textAlign: 'center'
          }}>
            ✨ Create New Gallery
          </h2>
          
          {!isCreating ? (
            <button
              onClick={() => setIsCreating(true)}
              disabled={isLoading}
              style={{
                width: '100%',
                padding: '15px',
                backgroundColor: '#007bff',
                color: 'white',
                border: 'none',
                borderRadius: '8px',
                fontSize: '16px',
                fontWeight: '500',
                cursor: isLoading ? 'not-allowed' : 'pointer',
                opacity: isLoading ? 0.6 : 1,
                transition: 'all 0.2s ease'
              }}
              onMouseEnter={(e) => {
                if (!isLoading) {
                  e.currentTarget.style.backgroundColor = '#0056b3';
                }
              }}
              onMouseLeave={(e) => {
                if (!isLoading) {
                  e.currentTarget.style.backgroundColor = '#007bff';
                }
              }}
            >
              {isLoading ? 'Creating...' : '+ Create New Gallery'}
            </button>
          ) : (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '15px' }}>
              <input
                type="text"
                placeholder="Gallery name (required)"
                value={newGalleryName}
                onChange={(e) => setNewGalleryName(e.target.value)}
                style={{
                  padding: '12px',
                  border: '1px solid #ced4da',
                  borderRadius: '6px',
                  fontSize: '16px',
                  outline: 'none'
                }}
                onFocus={(e) => {
                  e.currentTarget.style.borderColor = '#007bff';
                }}
                onBlur={(e) => {
                  e.currentTarget.style.borderColor = '#ced4da';
                }}
                autoFocus
              />
              <textarea
                placeholder="Description (optional)"
                value={newGalleryDescription}
                onChange={(e) => setNewGalleryDescription(e.target.value)}
                rows={3}
                style={{
                  padding: '12px',
                  border: '1px solid #ced4da',
                  borderRadius: '6px',
                  fontSize: '16px',
                  outline: 'none',
                  resize: 'vertical',
                  minHeight: '80px'
                }}
                onFocus={(e) => {
                  e.currentTarget.style.borderColor = '#007bff';
                }}
                onBlur={(e) => {
                  e.currentTarget.style.borderColor = '#ced4da';
                }}
              />
              <div style={{ display: 'flex', gap: '10px' }}>
                <button
                  onClick={handleCreateGallery}
                  disabled={!newGalleryName.trim() || isLoading}
                  style={{
                    flex: 1,
                    padding: '12px',
                    backgroundColor: '#28a745',
                    color: 'white',
                    border: 'none',
                    borderRadius: '6px',
                    fontSize: '16px',
                    fontWeight: '500',
                    cursor: (!newGalleryName.trim() || isLoading) ? 'not-allowed' : 'pointer',
                    opacity: (!newGalleryName.trim() || isLoading) ? 0.6 : 1
                  }}
                >
                  {isLoading ? 'Creating...' : 'Create Gallery'}
                </button>
                <button
                  onClick={() => {
                    setIsCreating(false);
                    setNewGalleryName('');
                    setNewGalleryDescription('');
                  }}
                  disabled={isLoading}
                  style={{
                    flex: 1,
                    padding: '12px',
                    backgroundColor: '#6c757d',
                    color: 'white',
                    border: 'none',
                    borderRadius: '6px',
                    fontSize: '16px',
                    fontWeight: '500',
                    cursor: isLoading ? 'not-allowed' : 'pointer',
                    opacity: isLoading ? 0.6 : 1
                  }}
                >
                  Cancel
                </button>
              </div>
            </div>
          )}
        </div>

        {/* Existing Galleries Section */}
        {galleries.length > 0 && (
          <div style={{
            width: '100%',
            maxWidth: '1000px'
          }}>
            <h2 style={{
              margin: '0 0 20px 0',
              fontSize: '24px',
              fontWeight: 'bold',
              color: '#212529',
              textAlign: 'center'
            }}>
              📁 Your Galleries ({galleries.length})
            </h2>
            
            <div style={{
              display: 'grid',
              gridTemplateColumns: 'repeat(auto-fill, minmax(300px, 1fr))',
              gap: '20px'
            }}>
              {galleries.map((gallery) => (
                <div
                  key={gallery.id}
                  style={{
                    backgroundColor: '#fff',
                    borderRadius: '12px',
                    padding: '20px',
                    boxShadow: '0 2px 4px rgba(0, 0, 0, 0.1)',
                    border: '1px solid #dee2e6',
                    transition: 'all 0.2s ease',
                    cursor: 'pointer'
                  }}
                  onMouseEnter={(e) => {
                    e.currentTarget.style.transform = 'translateY(-2px)';
                    e.currentTarget.style.boxShadow = '0 4px 8px rgba(0, 0, 0, 0.15)';
                  }}
                  onMouseLeave={(e) => {
                    e.currentTarget.style.transform = 'translateY(0)';
                    e.currentTarget.style.boxShadow = '0 2px 4px rgba(0, 0, 0, 0.1)';
                  }}
                >
                  {/* Gallery Preview */}
                  <div style={{
                    width: '100%',
                    height: '120px',
                    backgroundColor: '#f8f9fa',
                    borderRadius: '8px',
                    marginBottom: '15px',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    overflow: 'hidden'
                  }}>
                    {gallery.metadata.previewThumbnail ? (
                      <img
                        src={gallery.metadata.previewThumbnail}
                        alt={`${gallery.name} preview`}
                        style={{
                          maxWidth: '100%',
                          maxHeight: '100%',
                          objectFit: 'cover',
                          borderRadius: '4px'
                        }}
                      />
                    ) : (
                      <div style={{
                        fontSize: '48px',
                        color: '#6c757d'
                      }}>
                        📷
                      </div>
                    )}
                  </div>

                  {/* Gallery Info */}
                  <h3 style={{
                    margin: '0 0 8px 0',
                    fontSize: '18px',
                    fontWeight: 'bold',
                    color: '#212529',
                    overflow: 'hidden',
                    textOverflow: 'ellipsis',
                    whiteSpace: 'nowrap'
                  }}>
                    {gallery.name}
                  </h3>
                  
                  {gallery.description && (
                    <p style={{
                      margin: '0 0 12px 0',
                      fontSize: '14px',
                      color: '#6c757d',
                      display: '-webkit-box',
                      WebkitLineClamp: 2,
                      WebkitBoxOrient: 'vertical',
                      overflow: 'hidden'
                    }}>
                      {gallery.description}
                    </p>
                  )}

                  <div style={{
                    display: 'flex',
                    justifyContent: 'space-between',
                    alignItems: 'center',
                    marginBottom: '15px',
                    fontSize: '12px',
                    color: '#6c757d'
                  }}>
                    <span>
                      {gallery.metadata.photoCount} photos • {gallery.metadata.libraryCount} in library
                    </span>
                    <span>
                      {formatDate(gallery.updatedAt)}
                    </span>
                  </div>

                  {/* Action Buttons */}
                  <div style={{ display: 'flex', gap: '8px' }}>
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        handleLoadGallery(gallery.id);
                      }}
                      disabled={isLoading}
                      style={{
                        flex: 1,
                        padding: '8px 12px',
                        backgroundColor: '#007bff',
                        color: 'white',
                        border: 'none',
                        borderRadius: '6px',
                        fontSize: '14px',
                        fontWeight: '500',
                        cursor: isLoading ? 'not-allowed' : 'pointer',
                        opacity: isLoading ? 0.6 : 1
                      }}
                    >
                      {isLoading ? 'Loading...' : 'Open'}
                    </button>
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        handleDeleteGallery(gallery.id, gallery.name);
                      }}
                      disabled={isLoading}
                      style={{
                        padding: '8px 12px',
                        backgroundColor: '#dc3545',
                        color: 'white',
                        border: 'none',
                        borderRadius: '6px',
                        fontSize: '14px',
                        fontWeight: '500',
                        cursor: isLoading ? 'not-allowed' : 'pointer',
                        opacity: isLoading ? 0.6 : 1
                      }}
                    >
                      Delete
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Empty State */}
        {galleries.length === 0 && !isCreating && (
          <div style={{
            textAlign: 'center',
            padding: '60px 20px',
            color: '#6c757d'
          }}>
            <div style={{ fontSize: '64px', marginBottom: '20px' }}>📸</div>
            <h3 style={{ margin: '0 0 10px 0', fontSize: '24px', color: '#495057' }}>
              No galleries yet
            </h3>
            <p style={{ margin: '0', fontSize: '16px' }}>
              Create your first gallery to get started!
            </p>
          </div>
        )}

        {/* Storage Info */}
        <div style={{
          padding: '15px',
          backgroundColor: '#f8f9fa',
          borderRadius: '8px',
          fontSize: '12px',
          color: '#6c757d',
          textAlign: 'center',
          display: 'flex',
          flexDirection: 'column',
          gap: '10px'
        }}>
          <div>
            Storage: {(storageInfo.used / (1024 * 1024)).toFixed(1)} MB used of {(storageInfo.available / (1024 * 1024)).toFixed(0)} MB available
          </div>
          <div>
            {storageInfo.galleries} galleries • {storageInfo.cacheEntries} cached images
          </div>
          <button
            onClick={handleClearCache}
            style={{
              padding: '6px 12px',
              backgroundColor: '#dc3545',
              color: 'white',
              border: 'none',
              borderRadius: '4px',
              fontSize: '11px',
              cursor: 'pointer',
              alignSelf: 'center',
              transition: 'all 0.2s ease'
            }}
            onMouseEnter={(e) => {
              e.currentTarget.style.backgroundColor = '#c82333';
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.backgroundColor = '#dc3545';
            }}
          >
            🗑️ Clear Image Cache
          </button>
        </div>
      </div>
    </div>
  );
};

export default GalleryManager;
