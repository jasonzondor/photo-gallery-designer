import React, { useState, useRef, useCallback } from 'react';
import html2canvas from 'html2canvas';
import { jsPDF } from 'jspdf';

interface LibraryItemProps {
  image: { id: string; url: string; name: string };
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
          src={image.url}
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
            Click or drag to canvas
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
            src={image.url}
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
  onPositionChange: (id: string, x: number, y: number) => void;
}

const Photo: React.FC<PhotoProps> = ({ id, url, name, x, y, size, onPositionChange }) => {
  const [isDragging, setIsDragging] = useState(false);
  const [dragStart, setDragStart] = useState({ x: 0, y: 0 });
  const [initialPos, setInitialPos] = useState({ x: 0, y: 0 });

  const handleMouseDown = useCallback((e: React.MouseEvent) => {
    setIsDragging(true);
    setDragStart({ x: e.clientX, y: e.clientY });
    setInitialPos({ x, y });
    e.preventDefault();
  }, [x, y]);

  const handleMouseMove = useCallback((e: MouseEvent) => {
    if (!isDragging) return;

    const deltaX = e.clientX - dragStart.x;
    const deltaY = e.clientY - dragStart.y;

    onPositionChange(id, initialPos.x + deltaX, initialPos.y + deltaY);
  }, [isDragging, dragStart, initialPos, id, onPositionChange]);

  const handleMouseUp = useCallback(() => {
    setIsDragging(false);
  }, []);

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
    >
      <img
        src={url}
        alt={`Gallery item ${id}`}
        style={{
          maxWidth: `${size}px`,
          maxHeight: `${size}px`,
          objectFit: 'cover',
          border: '2px solid #ccc',
          borderRadius: '4px',
          pointerEvents: 'none',
          display: 'block',
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
    </div>
  );
};

const PhotoCanvas: React.FC = () => {
  const [photos, setPhotos] = useState<{ id: string; url: string; name: string; x: number; y: number }[]>([]);
  const [imageLibrary, setImageLibrary] = useState<{ id: string; url: string; name: string }[]>([]);
  const [imageSize, setImageSize] = useState<number>(300);
  const canvasRef = useRef<HTMLDivElement>(null);

  const handleImageUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const files = event.target.files;
    if (!files) return;

    Array.from(files).forEach((file) => {
      const reader = new FileReader();
      reader.onload = () => {
        const result = reader.result;
        if (result && typeof result === 'string') {
          const newImage = {
            id: Date.now().toString() + Math.random(),
            url: result,
            name: file.name,
          };
          setImageLibrary((prev) => [...prev, newImage]);
        }
      };
      reader.readAsDataURL(file);
    });
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

  const exportAsJPG = async () => {
    if (!canvasRef.current) return;

    try {
      const canvas = await html2canvas(canvasRef.current, {
        background: '#ffffff',
        scale: 2,
      } as any);

      const link = document.createElement('a');
      link.download = 'gallery-export.jpg';
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
      pdf.save('gallery-export.pdf');
    } catch (error) {
      console.error('Error exporting as PDF:', error);
      alert('Failed to export as PDF. Please try again.');
    }
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', height: '100vh' }}>
      <div style={{ padding: '20px', backgroundColor: '#f5f5f5', display: 'flex', alignItems: 'center', gap: '20px', flexWrap: 'wrap' }}>
        <input
          type="file"
          multiple
          accept="image/*"
          onChange={handleImageUpload}
          style={{ padding: '10px', cursor: 'pointer' }}
        />
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
              onPositionChange={handlePositionChange}
            />
          ))}
        </div>
      </div>
    </div>
  );
};

export default PhotoCanvas;
