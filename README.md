# Photo Gallery Designer

A modern, interactive web application for creating custom photo gallery layouts. Upload your photos and arrange them freely on a canvas with intuitive drag-and-drop functionality.

## ✨ Features

- **📸 Photo Library**: Upload multiple images to build your personal photo library
- **🎨 Drag & Drop**: Drag photos from the sidebar directly to your desired canvas position
- **📏 Configurable Sizing**: Adjust all photo sizes simultaneously with a slider (50px - 600px)
- **🖱️ Intuitive Interface**: Click to add photos at random positions or drag for precise placement
- **📱 Responsive Design**: Clean, modern UI that works across different screen sizes
- **⚡ Real-time Updates**: Instant visual feedback as you design your gallery

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

1. **Upload Photos**: Click the file input to select and upload multiple images
2. **Browse Library**: View all uploaded photos in the left sidebar
3. **Add to Canvas**: 
   - Click any library item to add it at a random position
   - Drag any library item to place it exactly where you want
4. **Arrange Photos**: Drag photos around the canvas to create your perfect layout
5. **Resize Photos**: Use the size slider to adjust all photos simultaneously

## 🛠️ Built With

- **React 19** - Modern React with hooks
- **TypeScript** - Type-safe development
- **Custom Drag & Drop** - React 18 compatible drag implementation
- **CSS-in-JS** - Inline styling for component encapsulation

## 📁 Project Structure

```
src/
├── components/
│   └── PhotoCanvas.tsx    # Main gallery component
├── App.tsx               # Root application component
└── index.tsx            # Application entry point
```

## 🎨 Technical Highlights

- **React 18 Compatible**: Custom drag implementation without deprecated APIs
- **Memory Efficient**: Proper event cleanup and optimized re-renders
- **Type Safe**: Full TypeScript support throughout
- **Responsive Layout**: Flexbox-based layout that adapts to screen sizes
- **Separate Scrolling**: Independent scroll areas for library and canvas

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
