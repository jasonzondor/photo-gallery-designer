// Gallery type definitions
export interface GalleryPhoto {
  id: string;
  url: string;
  name: string;
  x: number;
  y: number;
  thumbnailUrl?: string;
  originalSize?: { width: number; height: number };
  processedSize?: { width: number; height: number };
}

export interface GalleryImage {
  id: string;
  url: string;
  name: string;
  thumbnailUrl?: string;
  originalSize?: { width: number; height: number };
  processedSize?: { width: number; height: number };
}

export interface Gallery {
  id: string;
  name: string;
  description?: string;
  createdAt: Date;
  updatedAt: Date;
  photos: GalleryPhoto[];
  imageLibrary: GalleryImage[];
  settings: {
    imageSize: number;
    canvasBackground?: string;
  };
  metadata: {
    photoCount: number;
    libraryCount: number;
    previewThumbnail?: string; // Base64 thumbnail of the gallery
  };
}

export interface GalleryListItem {
  id: string;
  name: string;
  description?: string;
  createdAt: Date;
  updatedAt: Date;
  metadata: {
    photoCount: number;
    libraryCount: number;
    previewThumbnail?: string;
  };
}
