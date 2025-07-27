class PhotoGallery {
    constructor() {
        this.canvas = document.getElementById('canvas');
        this.ctx = this.canvas.getContext('2d');
        this.photos = [];
        this.selectedPhoto = null;
        this.isDragging = false;
        this.dragOffset = { x: 0, y: 0 };
        
        this.initializeEventListeners();
        this.initializeCanvas();
    }

    initializeCanvas() {
        const container = document.getElementById('canvas-container');
        this.canvas.width = container.clientWidth;
        this.canvas.height = container.clientHeight;
        this.drawCanvas();
    }

    initializeEventListeners() {
        // File upload
        document.getElementById('photo-upload').addEventListener('change', (e) => this.handleFileUpload(e));
        
        // Canvas events
        this.canvas.addEventListener('mousedown', (e) => this.handleMouseDown(e));
        this.canvas.addEventListener('mousemove', (e) => this.handleMouseMove(e));
        this.canvas.addEventListener('mouseup', (e) => this.handleMouseUp(e));
        
        // Window resize
        window.addEventListener('resize', () => this.initializeCanvas());
    }

    handleFileUpload(event) {
        const files = event.target.files;
        for (const file of files) {
            const reader = new FileReader();
            reader.onload = (e) => {
                const photo = {
                    id: Date.now() + Math.random(),
                    src: e.target.result,
                    x: 50,
                    y: 50,
                    width: 100,
                    height: 100
                };
                this.photos.push(photo);
                this.drawCanvas();
            };
            reader.readAsDataURL(file);
        }
    }

    handleMouseDown(event) {
        const rect = this.canvas.getBoundingClientRect();
        const x = event.clientX - rect.left;
        const y = event.clientY - rect.top;

        this.selectedPhoto = this.photos.find(photo => 
            x >= photo.x && x <= photo.x + photo.width &&
            y >= photo.y && y <= photo.y + photo.height
        );

        if (this.selectedPhoto) {
            this.isDragging = true;
            this.dragOffset = {
                x: x - this.selectedPhoto.x,
                y: y - this.selectedPhoto.y
            };
        }
    }

    handleMouseMove(event) {
        if (!this.isDragging || !this.selectedPhoto) return;

        const rect = this.canvas.getBoundingClientRect();
        const x = event.clientX - rect.left - this.dragOffset.x;
        const y = event.clientY - rect.top - this.dragOffset.y;

        this.selectedPhoto.x = x;
        this.selectedPhoto.y = y;
        this.drawCanvas();
    }

    handleMouseUp() {
        this.isDragging = false;
    }

    drawCanvas() {
        this.ctx.clearRect(0, 0, this.canvas.width, this.canvas.height);
        
        this.photos.forEach(photo => {
            const img = new Image();
            img.onload = () => {
                this.ctx.drawImage(img, photo.x, photo.y, photo.width, photo.height);
            };
            img.src = photo.src;
        });
    }
}

// Initialize the gallery when the page loads
document.addEventListener('DOMContentLoaded', () => {
    new PhotoGallery();
});
