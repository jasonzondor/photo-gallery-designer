# Photo Gallery Designer

A powerful React-based photo gallery designer with professional-grade storage and management capabilities. Create, organize, and export custom photo layouts with advanced features like IndexedDB storage, intelligent caching, and multi-gallery management.

## ✨ Key Features

### 🗄️ Advanced Storage System
- **IndexedDB Storage**: Professional database storage with hundreds of MB capacity (vs 5-10MB localStorage limit)
- **Automatic Migration**: Seamlessly migrates existing data from localStorage to IndexedDB
- **Smart Cache Management**: Intelligent image caching with automatic cleanup and optimization
- **Storage Monitoring**: Real-time storage usage display with detailed statistics
- **Manual Cache Control**: Clear cache button for storage management

### 🖼️ Multiple Gallery Management
- **Unlimited Galleries**: Create and manage multiple photo galleries with custom names and descriptions
- **Professional Gallery Browser**: Grid-based interface with hover effects and metadata display
- **Gallery Previews**: Auto-generated thumbnails from first photo in each gallery
- **Smart Organization**: Sort by creation date, photo count, and last modified
- **Safe Deletion**: Confirmation dialogs prevent accidental gallery loss

### 📸 Intelligent Image Processing
- **High-Quality Optimization**: Automatic resizing to 2048px maximum while preserving aspect ratio
- **Thumbnail Generation**: 200px thumbnails for fast library browsing and drag previews
- **Batch Processing**: Upload and process multiple images simultaneously with progress indicators
- **JPEG Compression**: 90% quality compression for optimal file size vs quality balance
- **Fallback Processing**: Graceful error handling with fallback to original images
- **Canvas-Based Resizing**: High-quality image smoothing and rendering

### 🎨 Interactive Canvas Design
- **Intuitive Drag & Drop**: Smooth photo placement with visual feedback and preview
- **Flexible Positioning**: Click or drag photos from library to canvas with precise control
- **Dynamic Sizing**: Real-time photo resizing with slider control (100px - 800px)
- **Smart Selection**: Click photos to select with blue border highlighting
- **Multiple Removal Methods**: Hover delete button, keyboard shortcuts, or selection-based deletion
- **Professional Layout**: Clean white canvas background for optimal photo presentation

### 💾 Advanced Data Management
- **Auto-Save System**: Intelligent auto-saving with 1-second debounce to prevent data loss
- **Manual Save Control**: Save button with real-time status indicators and timestamps
- **Save Status Display**: Visual feedback showing save progress, last saved time, and unsaved changes
- **Data Persistence**: All galleries and photos persist across browser sessions
- **Metadata Tracking**: Automatic updates to photo counts, creation dates, and modification times
- **Storage Usage Info**: Real-time display of storage usage, gallery count, and cached images

### 🗑️ Smart Photo Management
- **Multi-Method Selection**: Click photos for selection with visual highlighting
- **Hover Delete Button**: Red circular (×) button appears on photo hover with smooth animations
- **Keyboard Shortcuts**: 
  - `Delete` or `Backspace`: Remove selected photo
  - `Escape`: Deselect current photo
- **Confirmation Dialogs**: Prevent accidental photo deletion with named confirmations
- **Status Messages**: Helpful toolbar messages showing selection state and keyboard hints
- **Visual Feedback**: Smooth transitions, hover effects, and selection indicators

### 📤 Professional Export System
- **High-Quality JPG Export**: Export canvas as high-resolution JPEG with gallery name in filename
- **PDF Export**: Generate professional PDF documents with proper scaling and orientation detection
- **Smart Filename Generation**: Files include gallery name and timestamp for easy organization
- **Canvas Rendering**: Uses html2canvas for pixel-perfect layout capture
- **Multiple Format Support**: Choose between image (JPG) and document (PDF) formats
- **Export Buttons**: Prominent blue (JPG) and green (PDF) buttons in toolbar

## 🚀 Getting Started

### Prerequisites
- Node.js (version 16 or higher)
- npm or yarn package manager
- Modern web browser with IndexedDB support

### Installation

1. **Clone the repository**
   ```bash
   git clone <repository-url>
   cd photo-gallery-designer
   ```

2. **Install dependencies**
   ```bash
   npm install
   ```

3. **Start the development server**
   ```bash
   npm start
   ```

4. **Open your browser**
   Navigate to `http://localhost:3000` to start using the application.

## 📖 How to Use

### Getting Started
1. **First Launch**: The app automatically migrates any existing localStorage data to IndexedDB
2. **Gallery Selection**: Start from the professional gallery browser interface
3. **Create Gallery**: Click "+ Create New Gallery" and provide name/description
4. **Start Designing**: You'll be taken directly to the canvas editor

### Managing Photos
1. **Upload Images**: Use the file input to select multiple photos (supports batch upload)
2. **Processing**: Watch the spinner as images are optimized and cached automatically
3. **Library View**: Browse optimized thumbnails in the photo library panel
4. **Add to Canvas**: Click or drag photos from library to canvas for precise placement
5. **Resize Photos**: Use the slider to adjust photo sizes (100px - 800px)
6. **Remove Photos**: Select and press Delete, hover for delete button, or use keyboard shortcuts

### Gallery Management
1. **Browse Galleries**: View all galleries in a professional grid layout with previews
2. **Gallery Info**: See photo counts, creation dates, and last modified times
3. **Load Gallery**: Click any gallery card to open in the editor
4. **Delete Gallery**: Use the delete button with confirmation for safety
5. **Storage Management**: Monitor storage usage and clear cache when needed

### Saving and Exporting
1. **Auto-Save**: Changes save automatically after 1 second of inactivity
2. **Manual Save**: Use the save button for immediate saving with status feedback
3. **Export Options**: Choose JPG for images or PDF for documents
4. **File Naming**: Exports include gallery name and timestamp for organization

## 🛠️ Technical Architecture

### Storage System
- **IndexedDB**: Professional browser database with massive storage capacity
- **Database Schema**: 
  - `galleries` store: Full gallery data with photos and settings
  - `imageCache` store: Processed images with thumbnails and metadata
- **Indexes**: Optimized queries on timestamp, name, and updatedAt fields
- **Migration System**: Automatic data migration from localStorage to IndexedDB

### Core Technologies
- **React 19**: Latest React with concurrent features and hooks
- **TypeScript**: Full type safety with comprehensive interfaces
- **IndexedDB API**: Modern browser database for large-scale data storage
- **Canvas API**: High-quality image processing and rendering
- **File API**: Client-side file handling and processing
- **HTML2Canvas**: Accurate canvas-to-image conversion
- **jsPDF**: Professional PDF generation

### Key Components
- **App**: Main application with IndexedDB initialization and routing
- **GalleryManager**: Professional gallery browser with storage management
- **PhotoCanvas**: Advanced canvas editor with drag-and-drop and auto-save
- **IndexedDBStorage**: Complete database management utility class
- **LibraryItem**: Interactive photo components with drag handling

### Performance Features
- **Asynchronous Operations**: Non-blocking IndexedDB operations
- **Smart Caching**: 7-day cache with automatic cleanup and size tracking
- **Batch Processing**: Parallel image processing for multiple uploads
- **Debounced Auto-Save**: Prevents excessive database writes
- **Memory Management**: Efficient handling of large image collections
- **Progressive Cleanup**: Multi-stage cache cleanup when storage gets full

## 🎯 Advanced Features

### Storage Management
- **Quota Monitoring**: Real-time storage usage with MB display
- **Progressive Cleanup**: Removes old cache automatically
- **Size Monitoring**: Real-time storage usage tracking
- **Manual Cache Control**: User-controlled cache clearing with feedback
- **Migration System**: Seamless upgrade from localStorage to IndexedDB

### Image Processing Pipeline
1. **Upload Validation**: File type and size checking
2. **Parallel Processing**: Simultaneous processing of multiple images
3. **Quality Optimization**: Canvas-based resizing with high-quality smoothing
4. **Thumbnail Generation**: Fast-loading 200px previews
5. **Caching Strategy**: IndexedDB storage with metadata tracking
6. **Error Recovery**: Fallback to original images on processing failure

### User Experience
- **Visual Feedback**: Loading spinners, hover effects, and status messages
- **Keyboard Navigation**: Full keyboard support for power users
- **Responsive Design**: Optimized for desktop and tablet use
- **Error Handling**: Graceful error recovery with user-friendly messages
- **Professional UI**: Modern design with consistent styling and animations

## 🔧 Development

### Available Scripts
- `npm start`: Start development server with hot reload
- `npm run build`: Build optimized production bundle
- `npm test`: Run comprehensive test suite
- `npm run eject`: Eject from Create React App (irreversible)

### Project Structure
```
src/
├── components/              # React components
│   ├── PhotoCanvas.tsx      # Main canvas editor with auto-save
│   └── GalleryManager.tsx   # Gallery browser and management
├── types/                   # TypeScript definitions
│   └── Gallery.ts          # Gallery and photo interfaces
├── utils/                   # Utility classes
│   ├── indexedDBStorage.ts  # IndexedDB management class
│   └── galleryStorage.ts    # Legacy localStorage utilities
└── App.tsx                  # Main app with IndexedDB initialization
```

### Database Schema
```typescript
// Galleries Store
interface Gallery {
  id: string;
  name: string;
  description?: string;
  createdAt: Date;
  updatedAt: Date;
  photos: GalleryPhoto[];
  imageLibrary: GalleryImage[];
  settings: { imageSize: number };
  metadata: { photoCount: number; libraryCount: number; previewThumbnail?: string };
}

// Image Cache Store
interface CachedImage {
  id: string;
  originalName: string;
  processedUrl: string;
  thumbnailUrl: string;
  originalSize: { width: number; height: number };
  processedSize: { width: number; height: number };
  timestamp: number;
  fileSize: number;
}
```

## 📊 Storage Capabilities

### IndexedDB vs localStorage
| Feature | localStorage | IndexedDB |
|---------|-------------|----------|
| **Storage Limit** | 5-10 MB | 100+ MB to GB |
| **Data Types** | Strings only | Objects, Blobs, Arrays |
| **Performance** | Synchronous (blocking) | Asynchronous (non-blocking) |
| **Queries** | Key-value only | Indexed queries |
| **Transactions** | None | ACID transactions |
| **Photo Capacity** | ~10-20 photos | 1000+ photos |

### Storage Optimization
- **Image Compression**: 90% JPEG quality for optimal size/quality balance
- **Thumbnail Caching**: 200px previews for fast browsing
- **Progressive Cleanup**: Removes old cache automatically
- **Size Monitoring**: Real-time storage usage tracking
- **Emergency Optimization**: Reduces data size when storage is full

## 🤝 Contributing

Contributions are welcome! Please feel free to submit a Pull Request. For major changes, please open an issue first to discuss what you would like to change.

### Development Guidelines
- Follow TypeScript best practices
- Maintain IndexedDB transaction integrity
- Add proper error handling for async operations
- Update interfaces when modifying data structures
- Test storage migration scenarios

## 📄 License

This project is licensed under the MIT License - see the LICENSE file for details.

## 🙏 Acknowledgments

- **Create React App**: React development environment
- **html2canvas**: Canvas-to-image conversion
- **jsPDF**: PDF generation library
- **IndexedDB**: Modern browser database API
- **TypeScript**: Type-safe JavaScript development
- **React 19**: Latest React features and concurrent rendering
- **Parallel Processing**: Multiple images processed simultaneously using Promise.all
- **Memory Efficient**: Proper event cleanup and optimized re-renders

### User Experience
- **Processing Indicators**: Visual feedback with spinner animations during image upload
- **Photo Selection**: Visual selection with blue borders and hover effects
- **Interactive Deletion**: Hover-to-reveal delete buttons with confirmation dialogs
- **Keyboard Navigation**: Full keyboard support for selection and deletion
- **Status Messages**: Real-time feedback showing selected photos and available actions
- **Fallback Handling**: Graceful degradation if image processing fails
- **Disabled States**: UI elements disabled during processing to prevent conflicts

### Technical Architecture
- **React 18 Compatible**: Custom drag implementation without deprecated APIs
- **Type Safe**: Full TypeScript support with comprehensive interfaces
- **State Management**: Efficient photo selection and deletion state handling
- **Event System**: Proper event propagation and keyboard listener management
- **Component Architecture**: Modular design with clear separation of concerns
- **Responsive Layout**: Flexbox-based layout that adapts to screen sizes
- **Separate Scrolling**: Independent scroll areas for library and canvas
- **Error Boundaries**: Robust error handling throughout the application

## 🚀 Available Scripts

- `npm start` - Runs the app in development mode
- `npm test` - Launches the test runner
- `npm run build` - Builds the app for production
- `npm run eject` - Ejects from Create React App (one-way operation)

## 📝 License

This project is open source and available under the [MIT License](LICENSE).

## 🤝 Contributing

Contributions, issues, and feature requests are welcome! Feel free to check the issues page.

---

**Enjoy creating beautiful photo galleries! 🎨📸**
