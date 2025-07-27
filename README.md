# Photo Gallery Designer

A professional-grade web application for creating custom photo gallery layouts with advanced image optimization and export capabilities. Upload your photos and arrange them freely on a canvas with intuitive drag-and-drop functionality.

## ✨ Features

### 🖼️ Image Management
- **📸 Smart Photo Library**: Upload multiple images with automatic optimization and thumbnail generation
- **🚀 Image Optimization**: Automatic downsizing to 2048px max while maintaining aspect ratio
- **💾 Intelligent Caching**: Browser-based caching with 7-day expiry for faster subsequent loads
- **🔍 Thumbnail Previews**: High-quality 200px thumbnails for improved library performance
- **📊 Size Information**: Visual display of original and processed image dimensions

### 🎨 Canvas Design
- **🎯 Drag & Drop**: Drag photos from the sidebar directly to your desired canvas position
- **📏 Configurable Sizing**: Adjust all photo sizes simultaneously with a slider (50px - 600px)
- **🖱️ Intuitive Interface**: Click to add photos at random positions or drag for precise placement
- **🎯 Photo Selection**: Click any photo to select it with visual feedback (blue border)
- **🗑️ Photo Removal**: Multiple ways to remove photos from canvas
  - Hover over photos to reveal delete button
  - Select photo and press Delete/Backspace key
  - Right-click context menu (coming soon)
- **⌨️ Keyboard Shortcuts**: Delete/Backspace to remove, Escape to deselect
- **⚡ Real-time Updates**: Instant visual feedback as you design your gallery
- **📱 Responsive Design**: Clean, modern UI that works across different screen sizes

### 📤 Export Options
- **🖼️ JPG Export**: High-quality JPEG export of your gallery layout
- **📄 PDF Export**: Professional PDF generation with automatic orientation detection
- **🎯 Smart Scaling**: Automatic scaling to fit standard page sizes while maintaining quality
- **📝 Filename Display**: Photo names are preserved and displayed in exports

## 🚀 Getting Started

### Prerequisites
- Node.js (v14 or higher)
- npm or yarn

### Installation

1. Clone the repository:
```bash
git clone <your-repo-url>
cd photo-gallery-designer
```

2. Install dependencies:
```bash
npm install
```

3. Start the development server:
```bash
npm start
```

4. Open [http://localhost:3000](http://localhost:3000) to view it in your browser.

## 🎯 How to Use

1. **Upload Photos**: 
   - Click the file input to select and upload multiple images
   - Watch the processing indicator as images are optimized and cached
   - See the "Optimized" indicator in the library header when processing is complete

2. **Browse Library**: 
   - View all uploaded photos with high-quality thumbnails in the left sidebar
   - See original and processed dimensions for each image
   - Notice faster loading times for previously uploaded images (cached)

3. **Add to Canvas**: 
   - Click any library item to add it at a random position
   - Drag any library item to place it exactly where you want
   - Thumbnails are used during drag operations for smooth performance

4. **Arrange Photos**: Drag photos around the canvas to create your perfect layout

5. **Select and Remove Photos**:
   - Click any photo to select it (blue border appears)
   - Hover over photos to see the red delete button (×)
   - Press Delete or Backspace key to remove selected photo
   - Press Escape to deselect current photo
   - Confirmation dialog prevents accidental deletions

6. **Customize Size**: Use the size slider to adjust all photos simultaneously (50px - 600px)

7. **Export Your Gallery**:
   - Click "Export as JPG" for a high-quality JPEG image
   - Click "Export as PDF" for a professional PDF document
   - Both exports include photo filenames and maintain quality

## 🔧 Built With

- **React 19** - Modern React with hooks and concurrent features
- **TypeScript** - Type-safe development with full interface support
- **html2canvas** - High-quality canvas rendering for JPG exports
- **jsPDF** - Professional PDF generation with auto-scaling
- **Custom Drag & Drop** - React 18 compatible drag implementation
- **Canvas API** - Image processing and optimization
- **localStorage** - Intelligent caching system
- **CSS-in-JS** - Inline styling with dynamic animations

## 📁 Project Structure

```
src/
├── components/
│   └── PhotoCanvas.tsx    # Main gallery component
├── App.tsx               # Root application component
└── index.tsx            # Application entry point
```

## 🎨 Technical Highlights

### Performance Optimizations
- **Image Processing**: Canvas-based resizing with high-quality smoothing (90% JPEG compression)
- **Smart Caching**: localStorage-based caching with automatic expiry and cleanup
- **Thumbnail Generation**: 200px thumbnails for library view performance
- **Parallel Processing**: Multiple images processed simultaneously using Promise.all
- **Memory Efficient**: Proper event cleanup and optimized re-renders

### User Experience
- **Processing Indicators**: Visual feedback with spinner animations during image upload
- **Dimension Display**: Shows original → processed image sizes
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
