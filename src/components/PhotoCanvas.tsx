import React, { useState, useRef, useCallback, useEffect } from 'react';
import html2canvas from 'html2canvas';
import jsPDF from 'jspdf';
import { Gallery } from '../types/Gallery';
import IndexedDBStorage, { CachedImage } from '../utils/indexedDBStorage';

// Image processing utilities
const MAX_IMAGE_SIZE = 2048; // Maximum width/height for processed images
const THUMBNAIL_SIZE = 200; // Size for library thumbnails
const CACHE_PREFIX = 'photo-gallery-cache-';

// Canvas-based image resizing function
const resizeImage = (file: File, maxSize: number): Promise<{ dataUrl: string; width: number; height: number }> => {
  return new Promise((resolve, reject) => {
    const img = new Image();
    const canvas = document.createElement('canvas');
    const ctx = canvas.getContext('2d');
    
    if (!ctx) {
      reject(new Error('Could not get canvas context'));
      return;
    }

    img.onload = () => {
      let { width, height } = img;
      
      // Calculate new dimensions while maintaining aspect ratio
      if (width > maxSize || height > maxSize) {
        if (width > height) {
          height = (height * maxSize) / width;
          width = maxSize;
        } else {
          width = (width * maxSize) / height;
          height = maxSize;
        }
      }
      
      canvas.width = width;
      canvas.height = height;
      
      // Use high-quality image rendering
      ctx.imageSmoothingEnabled = true;
      ctx.imageSmoothingQuality = 'high';
      
      ctx.drawImage(img, 0, 0, width, height);
      
      const dataUrl = canvas.toDataURL('image/jpeg', 0.9);
      resolve({ dataUrl, width, height });
    };
    
    img.onerror = () => reject(new Error('Failed to load image'));
    img.src = URL.createObjectURL(file);
  });
};

// Cache management functions
const getCacheKey = (fileName: string, fileSize: number, lastModified: number): string => {
  return `${CACHE_PREFIX}${fileName}-${fileSize}-${lastModified}`;
};

const getCachedImage = async (cacheKey: string): Promise<CachedImage | null> => {
  try {
    return await IndexedDBStorage.getCachedImage(cacheKey);
  } catch (error) {
    console.warn('Error reading from cache:', error);
    return null;
  }
};

const setCachedImage = async (cacheKey: string, cachedImage: CachedImage): Promise<void> => {
  try {
    await IndexedDBStorage.cacheImage(cachedImage);
  } catch (error) {
    console.warn('Error writing to cache:', error);
    // Try to clear old cache and retry
    try {
      await IndexedDBStorage.clearOldCache();
      await IndexedDBStorage.cacheImage(cachedImage);
      console.log('Successfully cached image after clearing old entries');
    } catch (retryError) {
      console.warn('Failed to cache image even after clearing old entries:', retryError);
    }
  }
};

// Process image with caching
const processImage = async (file: File): Promise<CachedImage> => {
  const cacheKey = getCacheKey(file.name, file.size, file.lastModified);
  
  // Check cache first
  const cached = await getCachedImage(cacheKey);
  if (cached) {
    return cached;
  }
  
  // Process the image
  const [processedResult, thumbnailResult] = await Promise.all([
    resizeImage(file, MAX_IMAGE_SIZE),
    resizeImage(file, THUMBNAIL_SIZE)
  ]);
  
  // Get original dimensions first
  const originalImg = new Image();
  const originalDimensions = await new Promise<{ width: number; height: number }>((resolve) => {
    originalImg.onload = () => {
      resolve({ width: originalImg.width, height: originalImg.height });
    };
    originalImg.src = URL.createObjectURL(file);
  });
  
  const cachedImage: CachedImage = {
    id: cacheKey, // Use cache key as ID for consistency
    originalName: file.name,
    processedUrl: processedResult.dataUrl,
    thumbnailUrl: thumbnailResult.dataUrl,
    timestamp: Date.now(),
    fileSize: file.size,
    originalSize: originalDimensions,
    processedSize: { width: processedResult.width, height: processedResult.height }
  };
  
  // Cache the processed image
  await setCachedImage(cacheKey, cachedImage);
  
  return cachedImage;
};

interface LibraryItemProps {
  image: { id: string; url: string; name: string; thumbnailUrl?: string; originalSize?: { width: number; height: number }; processedSize?: { width: number; height: number } };
  onDragToCanvas: (image: { id: string; url: string; name: string }, x: number, y: number) => void;
  onClick: () => void;
}

const LibraryItem: React.FC<LibraryItemProps> = ({ image, onDragToCanvas, onClick }) => {
  const [isDragging, setIsDragging] = useState(false);
  const dragPreviewRef = useRef<HTMLDivElement>(null);

  const handleMouseDown = useCallback((e: React.MouseEvent) => {
    setIsDragging(true);
    e.preventDefault();
  }, []);

  const handleMouseMove = useCallback((e: MouseEvent) => {
    if (!isDragging || !dragPreviewRef.current) return;

    dragPreviewRef.current.style.left = `${e.clientX - 50}px`;
    dragPreviewRef.current.style.top = `${e.clientY - 50}px`;
  }, [isDragging]);

  const handleMouseUp = useCallback((e: MouseEvent) => {
    if (!isDragging) return;

    setIsDragging(false);

    // Check if dropped on canvas area
    const canvasElement = document.querySelector('[data-canvas="true"]') as HTMLElement;
    if (canvasElement) {
      const canvasRect = canvasElement.getBoundingClientRect();
      if (
        e.clientX >= canvasRect.left &&
        e.clientX <= canvasRect.right &&
        e.clientY >= canvasRect.top &&
        e.clientY <= canvasRect.bottom
      ) {
        const relativeX = e.clientX - canvasRect.left;
        const relativeY = e.clientY - canvasRect.top;
        onDragToCanvas(image, relativeX, relativeY);
      }
    }
  }, [isDragging, image, onDragToCanvas]);

  React.useEffect(() => {
    if (isDragging) {
      document.addEventListener('mousemove', handleMouseMove);
      document.addEventListener('mouseup', handleMouseUp);
      return () => {
        document.removeEventListener('mousemove', handleMouseMove);
        document.removeEventListener('mouseup', handleMouseUp);
      };
    }
  }, [isDragging, handleMouseMove, handleMouseUp]);

  return (
    <>
      <div
        style={{
          border: '1px solid #dee2e6',
          borderRadius: '6px',
          padding: '8px',
          backgroundColor: '#fff',
          cursor: isDragging ? 'grabbing' : 'grab',
          transition: 'all 0.2s ease',
          userSelect: 'none',
          display: 'flex',
          alignItems: 'center',
        }}
        onMouseDown={handleMouseDown}
        onClick={!isDragging ? onClick : undefined}
        onMouseEnter={(e) => {
          if (!isDragging) {
            e.currentTarget.style.backgroundColor = '#e9ecef';
            e.currentTarget.style.transform = 'scale(1.02)';
          }
        }}
        onMouseLeave={(e) => {
          if (!isDragging) {
            e.currentTarget.style.backgroundColor = '#fff';
            e.currentTarget.style.transform = 'scale(1)';
          }
        }}
      >
        <img
          src={image.thumbnailUrl || image.url}
          alt={image.name}
          style={{
            width: '60px',
            height: '60px',
            objectFit: 'cover',
            borderRadius: '4px',
            marginRight: '10px',
            pointerEvents: 'none',
            flexShrink: 0,
          }}
        />
        <div style={{
          flex: 1,
          minWidth: 0,
        }}>
          <div style={{
            fontSize: '13px',
            color: '#212529',
            fontWeight: '500',
            textOverflow: 'ellipsis',
            overflow: 'hidden',
            whiteSpace: 'nowrap',
            marginBottom: '2px',
          }}>
            {image.name}
          </div>
          <div style={{
            fontSize: '11px',
            color: '#6c757d',
          }}>
            {image.originalSize ? (
              <div>
                {image.originalSize.width}×{image.originalSize.height}
                {image.processedSize && (
                  image.originalSize.width !== image.processedSize.width || 
                  image.originalSize.height !== image.processedSize.height
                ) && (
                  <span style={{ color: '#28a745', marginLeft: '4px' }}>↓ {image.processedSize.width}×{image.processedSize.height}</span>
                )}
              </div>
            ) : (
              'Click or drag to canvas'
            )}
          </div>
        </div>
      </div>

      {/* Drag Preview */}
      {isDragging && (
        <div
          ref={dragPreviewRef}
          style={{
            position: 'fixed',
            pointerEvents: 'none',
            zIndex: 1000,
            opacity: 0.8,
            transform: 'scale(0.8)',
          }}
        >
          <img
            src={image.thumbnailUrl || image.url}
            alt={image.name}
            style={{
              width: '100px',
              height: '100px',
              objectFit: 'cover',
              borderRadius: '4px',
              border: '2px solid #007bff',
            }}
          />
        </div>
      )}
    </>
  );
};

interface PhotoProps {
  id: string;
  url: string;
  name: string;
  x: number;
  y: number;
  size: number;
  isSelected: boolean;
  onPositionChange: (id: string, x: number, y: number) => void;
  onSelect: (id: string) => void;
  onDelete: (id: string) => void;
}

const Photo: React.FC<PhotoProps> = ({ id, url, name, x, y, size, isSelected, onPositionChange, onSelect, onDelete }) => {
  const [isDragging, setIsDragging] = useState(false);
  const [isHovered, setIsHovered] = useState(false);
  const [dragStart, setDragStart] = useState({ x: 0, y: 0 });
  const [initialPos, setInitialPos] = useState({ x: 0, y: 0 });

  const handleMouseDown = useCallback((e: React.MouseEvent) => {
    // Select the photo when clicked
    onSelect(id);
    
    setIsDragging(true);
    setDragStart({ x: e.clientX, y: e.clientY });
    setInitialPos({ x, y });
    e.preventDefault();
  }, [x, y, id, onSelect]);

  const handleMouseMove = useCallback((e: MouseEvent) => {
    if (!isDragging) return;

    const deltaX = e.clientX - dragStart.x;
    const deltaY = e.clientY - dragStart.y;

    onPositionChange(id, initialPos.x + deltaX, initialPos.y + deltaY);
  }, [isDragging, dragStart, initialPos, id, onPositionChange]);

  const handleMouseUp = useCallback(() => {
    setIsDragging(false);
  }, []);

  const handleDeleteClick = useCallback((e: React.MouseEvent) => {
    e.stopPropagation();
    e.preventDefault();
    onDelete(id);
  }, [id, onDelete]);

  React.useEffect(() => {
    if (isDragging) {
      document.addEventListener('mousemove', handleMouseMove);
      document.addEventListener('mouseup', handleMouseUp);
      return () => {
        document.removeEventListener('mousemove', handleMouseMove);
        document.removeEventListener('mouseup', handleMouseUp);
      };
    }
  }, [isDragging, handleMouseMove, handleMouseUp]);

  return (
    <div
      style={{
        position: 'absolute',
        left: x,
        top: y,
        cursor: isDragging ? 'grabbing' : 'grab',
        userSelect: 'none',
      }}
      onMouseDown={handleMouseDown}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
    >
      <img
        src={url}
        alt={`Gallery item ${id}`}
        style={{
          maxWidth: `${size}px`,
          maxHeight: `${size}px`,
          objectFit: 'cover',
          border: `2px solid ${isSelected ? '#007bff' : (isHovered ? '#6c757d' : '#ccc')}`,
          borderRadius: '4px',
          pointerEvents: 'none',
          display: 'block',
          transition: 'border-color 0.2s ease',
        }}
      />
      <div
        style={{
          fontSize: '12px',
          color: '#333',
          backgroundColor: 'rgba(255, 255, 255, 0.9)',
          padding: '2px 6px',
          borderRadius: '3px',
          marginTop: '4px',
          textAlign: 'center',
          maxWidth: `${size}px`,
          overflow: 'hidden',
          textOverflow: 'ellipsis',
          whiteSpace: 'nowrap',
          pointerEvents: 'none',
        }}
      >
        {name}
      </div>
      
      {/* Delete button - shows on hover or selection */}
      {(isHovered || isSelected) && (
        <button
          onClick={handleDeleteClick}
          style={{
            position: 'absolute',
            top: '-8px',
            right: '-8px',
            width: '24px',
            height: '24px',
            borderRadius: '50%',
            border: 'none',
            backgroundColor: '#dc3545',
            color: 'white',
            cursor: 'pointer',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            fontSize: '14px',
            fontWeight: 'bold',
            boxShadow: '0 2px 4px rgba(0,0,0,0.2)',
            zIndex: 10,
            pointerEvents: 'auto',
            transition: 'all 0.2s ease',
          }}
          onMouseEnter={(e) => {
            e.currentTarget.style.backgroundColor = '#c82333';
            e.currentTarget.style.transform = 'scale(1.1)';
          }}
          onMouseLeave={(e) => {
            e.currentTarget.style.backgroundColor = '#dc3545';
            e.currentTarget.style.transform = 'scale(1)';
          }}
          title="Delete photo"
        >
          ×
        </button>
      )}
    </div>
  );
};

interface PhotoCanvasProps {
  gallery: Gallery;
  onBackToGalleries: () => void;
}

const PhotoCanvas: React.FC<PhotoCanvasProps> = ({ gallery, onBackToGalleries }) => {
  const [currentGallery, setCurrentGallery] = useState<Gallery>(gallery);
  const [photos, setPhotos] = useState<{ id: string; url: string; name: string; x: number; y: number }[]>(gallery.photos);
  const [imageLibrary, setImageLibrary] = useState<{ id: string; url: string; name: string; thumbnailUrl?: string; originalSize?: { width: number; height: number }; processedSize?: { width: number; height: number } }[]>(gallery.imageLibrary);
  const [imageSize, setImageSize] = useState<number>(gallery.settings.imageSize);
  const [isProcessing, setIsProcessing] = useState<boolean>(false);
  const [selectedPhotoId, setSelectedPhotoId] = useState<string | null>(null);
  const [hasUnsavedChanges, setHasUnsavedChanges] = useState<boolean>(false);
  const [isSaving, setIsSaving] = useState<boolean>(false);
  const [lastSaved, setLastSaved] = useState<Date | null>(null);
  const canvasRef = useRef<HTMLDivElement>(null);

  // Initialize IndexedDB and migrate data on component mount
  useEffect(() => {
    const initializeStorage = async () => {
      try {
        // Migrate data from localStorage if needed
        await IndexedDBStorage.migrateFromLocalStorage();
        // Clear old cache entries
        await IndexedDBStorage.clearOldCache();
      } catch (error) {
        console.error('Error initializing storage:', error);
      }
    };
    initializeStorage();
  }, []);

  // Save gallery changes
  const saveGallery = useCallback(async (isManual: boolean = false) => {
    if (isSaving) return; // Prevent multiple simultaneous saves
    
    setIsSaving(true);
    
    try {
      const updatedGallery: Gallery = {
        ...currentGallery,
        photos,
        imageLibrary,
        settings: {
          ...currentGallery.settings,
          imageSize
        },
        updatedAt: new Date()
      };
      
      // Update metadata
      updatedGallery.metadata.photoCount = photos.length;
      updatedGallery.metadata.libraryCount = imageLibrary.length;
      
      await IndexedDBStorage.saveGallery(updatedGallery);
      setCurrentGallery(updatedGallery);
      setHasUnsavedChanges(false);
      setLastSaved(new Date());
      
      if (isManual) {
        // Show brief success feedback for manual saves
        setTimeout(() => {
          // Could add a toast notification here in the future
        }, 100);
      }
    } catch (error) {
      console.error('Error saving gallery:', error);
      if (isManual) {
        if (error instanceof Error && error.message.includes('Storage is full')) {
          alert('Storage is full! Please delete some galleries or clear browser data to free up space.');
        } else {
          alert('Failed to save gallery. Please try again.');
        }
      }
    } finally {
      setIsSaving(false);
    }
  }, [currentGallery, photos, imageLibrary, imageSize, isSaving]);

  // Manual save function
  const handleManualSave = useCallback(() => {
    saveGallery(true);
  }, [saveGallery]);

  // Auto-save when data changes (debounced)
  useEffect(() => {
    if (hasUnsavedChanges) {
      const timeoutId = setTimeout(() => {
        saveGallery();
      }, 1000); // Save after 1 second of inactivity
      
      return () => clearTimeout(timeoutId);
    }
  }, [hasUnsavedChanges, saveGallery]);

  // Mark as having unsaved changes when data changes
  useEffect(() => {
    setHasUnsavedChanges(true);
  }, [photos, imageLibrary, imageSize]);

  // Photo deletion handler
  const handlePhotoDelete = useCallback((id: string) => {
    // Show confirmation dialog
    const photo = photos.find(p => p.id === id);
    if (photo && window.confirm(`Are you sure you want to remove "${photo.name}" from the canvas?`)) {
      setPhotos((prev) => prev.filter((photo) => photo.id !== id));
      // Clear selection if deleted photo was selected
      if (selectedPhotoId === id) {
        setSelectedPhotoId(null);
      }
    }
  }, [photos, selectedPhotoId]);

  // Handle keyboard shortcuts
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Delete' || e.key === 'Backspace') {
        if (selectedPhotoId) {
          e.preventDefault();
          handlePhotoDelete(selectedPhotoId);
        }
      }
      if (e.key === 'Escape') {
        setSelectedPhotoId(null);
      }
    };

    document.addEventListener('keydown', handleKeyDown);
    return () => {
      document.removeEventListener('keydown', handleKeyDown);
    };
  }, [selectedPhotoId, handlePhotoDelete]);

  const handleImageUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const files = event.target.files;
    if (!files) return;

    setIsProcessing(true);
    const fileArray = Array.from(files);
    
    try {
      // Process images in parallel
      const processedImages = await Promise.all(
        fileArray.map(async (file) => {
          try {
            const cachedImage = await processImage(file);
            return {
              id: cachedImage.id,
              url: cachedImage.processedUrl,
              name: cachedImage.originalName,
              thumbnailUrl: cachedImage.thumbnailUrl,
              originalSize: cachedImage.originalSize,
              processedSize: cachedImage.processedSize,
            };
          } catch (error) {
            console.error(`Error processing ${file.name}:`, error);
            // Fallback to original file reading for failed processing
            return new Promise<any>((resolve) => {
              const reader = new FileReader();
              reader.onload = () => {
                const result = reader.result;
                if (result && typeof result === 'string') {
                  resolve({
                    id: Date.now().toString() + Math.random(),
                    url: result,
                    name: file.name,
                  });
                }
              };
              reader.readAsDataURL(file);
            });
          }
        })
      );
      
      setImageLibrary((prev) => [...prev, ...processedImages]);
    } catch (error) {
      console.error('Error processing images:', error);
      alert('Some images could not be processed. Please try again.');
    } finally {
      setIsProcessing(false);
      // Reset the input value to allow re-uploading the same files
      event.target.value = '';
    }
  };

  const addPhotoToCanvas = (libraryImage: { id: string; url: string; name: string }, x?: number, y?: number) => {
    const newPhoto = {
      id: Date.now().toString() + Math.random(),
      url: libraryImage.url,
      name: libraryImage.name,
      x: x ?? Math.random() * (canvasRef.current?.clientWidth || 800),
      y: y ?? Math.random() * (canvasRef.current?.clientHeight || 600),
    };
    setPhotos((prev) => [...prev, newPhoto]);
  };

  const handlePositionChange = (id: string, x: number, y: number) => {
    setPhotos((prev) =>
      prev.map((photo) =>
        photo.id === id ? { ...photo, x, y } : photo
      )
    );
  };

  const handlePhotoSelect = (id: string) => {
    setSelectedPhotoId(id);
  };

  const handleCanvasClick = (e: React.MouseEvent) => {
    // Only deselect if clicking on the canvas background (not on a photo)
    if (e.target === e.currentTarget) {
      setSelectedPhotoId(null);
    }
  };

  const exportAsJPG = async () => {
    if (!canvasRef.current) return;

    try {
      const canvas = await html2canvas(canvasRef.current, {
        background: '#ffffff',
        scale: 2,
      } as any);

      const link = document.createElement('a');
      const filename = `${currentGallery.name.replace(/[^a-z0-9]/gi, '_').toLowerCase()}-export.jpg`;
      link.download = filename;
      link.href = canvas.toDataURL('image/jpeg', 0.9);
      link.click();
    } catch (error) {
      console.error('Error exporting as JPG:', error);
      alert('Failed to export as JPG. Please try again.');
    }
  };

  const exportAsPDF = async () => {
    if (!canvasRef.current) return;

    try {
      const canvas = await html2canvas(canvasRef.current, {
        background: '#ffffff',
        scale: 2,
      } as any);

      const imgData = canvas.toDataURL('image/jpeg', 0.9);
      const pdf = new jsPDF({
        orientation: canvas.width > canvas.height ? 'landscape' : 'portrait',
        unit: 'mm',
        format: 'a4',
      });

      const pdfWidth = pdf.internal.pageSize.getWidth();
      const pdfHeight = pdf.internal.pageSize.getHeight();
      const imgWidth = canvas.width;
      const imgHeight = canvas.height;

      const ratio = Math.min(pdfWidth / imgWidth, pdfHeight / imgHeight);
      const imgX = (pdfWidth - imgWidth * ratio) / 2;
      const imgY = (pdfHeight - imgHeight * ratio) / 2;

      pdf.addImage(imgData, 'JPEG', imgX, imgY, imgWidth * ratio, imgHeight * ratio);
      const filename = `${currentGallery.name.replace(/[^a-z0-9]/gi, '_').toLowerCase()}-export.pdf`;
      pdf.save(filename);
    } catch (error) {
      console.error('Error exporting as PDF:', error);
      alert('Failed to export as PDF. Please try again.');
    }
  };

  return (
    <>
      <style>
        {`
          @keyframes spin {
            0% { transform: rotate(0deg); }
            100% { transform: rotate(360deg); }
          }
        `}
      </style>
      <div style={{ display: 'flex', flexDirection: 'column', height: '100vh' }}>
      <div style={{ padding: '20px', backgroundColor: '#f5f5f5', display: 'flex', alignItems: 'center', gap: '20px', flexWrap: 'wrap' }}>
        {/* Back button and gallery info */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '15px' }}>
          <button
            onClick={onBackToGalleries}
            style={{
              padding: '8px 12px',
              backgroundColor: '#6c757d',
              color: 'white',
              border: 'none',
              borderRadius: '6px',
              fontSize: '14px',
              fontWeight: '500',
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              gap: '6px'
            }}
            onMouseEnter={(e) => {
              e.currentTarget.style.backgroundColor = '#545b62';
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.backgroundColor = '#6c757d';
            }}
          >
            ← Back to Galleries
          </button>
          <div style={{ display: 'flex', flexDirection: 'column' }}>
            <h2 style={{ margin: '0', fontSize: '18px', fontWeight: 'bold', color: '#212529' }}>
              {currentGallery.name}
            </h2>
            <div style={{ fontSize: '12px', color: '#6c757d', display: 'flex', alignItems: 'center', gap: '10px' }}>
              <span>{photos.length} photos on canvas</span>
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                <button
                  onClick={handleManualSave}
                  disabled={isSaving || !hasUnsavedChanges}
                  style={{
                    padding: '4px 8px',
                    backgroundColor: hasUnsavedChanges ? '#28a745' : '#e9ecef',
                    color: hasUnsavedChanges ? 'white' : '#6c757d',
                    border: 'none',
                    borderRadius: '3px',
                    cursor: hasUnsavedChanges ? 'pointer' : 'not-allowed',
                    fontSize: '11px',
                    fontWeight: '500',
                    display: 'flex',
                    alignItems: 'center',
                    gap: '4px',
                    opacity: isSaving ? 0.7 : 1,
                    transition: 'all 0.2s ease'
                  }}
                >
                  {isSaving ? '💾 Saving...' : hasUnsavedChanges ? '💾 Save' : '✓ Saved'}
                </button>
                <span style={{ 
                  color: isSaving ? '#ffc107' : hasUnsavedChanges ? '#dc3545' : '#28a745',
                  fontWeight: '500',
                  fontSize: '11px'
                }}>
                  {isSaving ? 'Saving...' : 
                   hasUnsavedChanges ? 'Unsaved changes' :
                   lastSaved ? `Saved ${lastSaved.toLocaleTimeString()}` : 'Auto-save on'}
                </span>
              </div>
            </div>
          </div>
        </div>
        <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
          <input
            type="file"
            multiple
            accept="image/*"
            onChange={handleImageUpload}
            disabled={isProcessing}
            style={{ 
              padding: '10px', 
              cursor: isProcessing ? 'not-allowed' : 'pointer',
              opacity: isProcessing ? 0.6 : 1
            }}
          />
          {isProcessing && (
            <div style={{ 
              display: 'flex', 
              alignItems: 'center', 
              gap: '8px',
              fontSize: '14px',
              color: '#007bff',
              fontWeight: '500'
            }}>
              <div style={{
                width: '16px',
                height: '16px',
                border: '2px solid #007bff',
                borderTop: '2px solid transparent',
                borderRadius: '50%',
                animation: 'spin 1s linear infinite'
              }}></div>
              Processing images...
            </div>
          )}
        </div>
        <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
          <label htmlFor="size-slider" style={{ fontWeight: 'bold', minWidth: '80px' }}>
            Image Size:
          </label>
          <input
            id="size-slider"
            type="range"
            min="50"
            max="600"
            value={imageSize}
            onChange={(e) => setImageSize(Number(e.target.value))}
            style={{ width: '150px' }}
          />
          <span style={{ minWidth: '50px', fontWeight: 'bold' }}>{imageSize}px</span>
        </div>
        
        {/* Status message */}
        <div style={{ 
          fontSize: '12px', 
          color: '#6c757d',
          display: 'flex',
          alignItems: 'center',
          gap: '15px'
        }}>
          {selectedPhotoId ? (
            <span style={{ color: '#007bff', fontWeight: '500' }}>
              Selected: {photos.find(p => p.id === selectedPhotoId)?.name} 
              <span style={{ marginLeft: '8px', color: '#6c757d' }}>(Press Delete to remove, Esc to deselect)</span>
            </span>
          ) : (
            <span>Click a photo to select • Hover for delete button • Drag to move</span>
          )}
        </div>
        
        <div style={{ display: 'flex', gap: '10px', marginLeft: 'auto' }}>
          <button
            onClick={exportAsJPG}
            style={{
              padding: '8px 16px',
              backgroundColor: '#007bff',
              color: 'white',
              border: 'none',
              borderRadius: '4px',
              cursor: 'pointer',
              fontSize: '14px',
              fontWeight: '500',
            }}
            onMouseEnter={(e) => {
              e.currentTarget.style.backgroundColor = '#0056b3';
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.backgroundColor = '#007bff';
            }}
          >
            Export as JPG
          </button>
          <button
            onClick={exportAsPDF}
            style={{
              padding: '8px 16px',
              backgroundColor: '#28a745',
              color: 'white',
              border: 'none',
              borderRadius: '4px',
              cursor: 'pointer',
              fontSize: '14px',
              fontWeight: '500',
            }}
            onMouseEnter={(e) => {
              e.currentTarget.style.backgroundColor = '#1e7e34';
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.backgroundColor = '#28a745';
            }}
          >
            Export as PDF
          </button>
        </div>
      </div>
      <div style={{ display: 'flex', flex: 1, minHeight: 0 }}>
        {/* Sidebar */}
        <div style={{
          width: '280px',
          backgroundColor: '#f8f9fa',
          borderRight: '1px solid #dee2e6',
          display: 'flex',
          flexDirection: 'column',
          height: '100%',
        }}>
          <div style={{ padding: '15px', borderBottom: '1px solid #dee2e6' }}>
            <h3 style={{ margin: '0', fontSize: '16px', fontWeight: 'bold', color: '#212529' }}>Photo Library</h3>
            <p style={{ margin: '5px 0 0 0', fontSize: '12px', color: '#6c757d' }}>
              {imageLibrary.length} {imageLibrary.length === 1 ? 'image' : 'images'}
              {imageLibrary.some(img => img.thumbnailUrl) && (
                <span style={{ marginLeft: '8px', color: '#28a745' }}>• Optimized</span>
              )}
            </p>
          </div>
          <div style={{
            flex: 1,
            overflowY: 'auto',
            padding: '10px 15px',
          }}>
            {imageLibrary.length === 0 ? (
              <div style={{
                textAlign: 'center',
                padding: '40px 20px',
                color: '#6c757d',
                fontSize: '14px',
              }}>
                <div style={{ marginBottom: '10px', fontSize: '24px' }}>📸</div>
                <div>Upload images to see them here</div>
                <div style={{ fontSize: '12px', marginTop: '5px' }}>Click or drag to add to canvas</div>
              </div>
            ) : (
              <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
              {imageLibrary.map((image) => (
                <LibraryItem
                  key={image.id}
                  image={image}
                  onDragToCanvas={addPhotoToCanvas}
                  onClick={() => addPhotoToCanvas(image)}
                />
              ))}
            </div>
            )}
          </div>
        </div>

        {/* Canvas */}
        <div
          ref={canvasRef}
          data-canvas="true"
          style={{
            flex: 1,
            backgroundColor: '#fff',
            position: 'relative',
            overflow: 'auto',
            padding: '20px',
          }}
          onClick={handleCanvasClick}
        >
          {photos.map((photo) => (
            <Photo
              key={photo.id}
              id={photo.id}
              url={photo.url}
              name={photo.name}
              x={photo.x}
              y={photo.y}
              size={imageSize}
              isSelected={selectedPhotoId === photo.id}
              onPositionChange={handlePositionChange}
              onSelect={handlePhotoSelect}
              onDelete={handlePhotoDelete}
            />
          ))}
        </div>
      </div>
      </div>
    </>
  );
};

export default PhotoCanvas;
