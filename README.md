# PIXIALBUM - Event Photo Gallery Platform

A modern, full-featured event photography platform built with React that enables photographers to showcase their work and allows viewers to browse, like, and download event photos with an optimized, memory-efficient virtualized gallery.

## 🌟 Features

### For Photographers
- **Dashboard Management**: Comprehensive dashboard to manage multiple events with pagination and search
- **Event Creation & Management**: Create and manage events with detailed information (name, date, type, venue)
- **Photo Upload**: Bulk upload and organize photos for each event with progress indicators
- **Viewer Management**: Add viewers to specific events with secure authentication
- **User Profile**: Customizable profile with photo upload capability
- **Contact System**: Built-in contact form for client communication
- **Event Analytics**: View event summaries, statistics, and viewer lists

### For Viewers
- **Event Browsing**: Browse all available events with detailed information and beautiful cards
- **Virtualized Photo Gallery**: 
  - Memory-efficient masonry layout using `react-virtualized`
  - Handles 500+ images without performance degradation
  - Infinite scroll with automatic pagination
  - Smooth transitions and animations
  - Responsive grid that adapts to screen sizes
- **Like System**: 
  - Like/unlike photos with persistent localStorage
  - View liked photos separately with toggle
  - Offline access to liked photos
- **Image Viewer**:
  - Full-screen image viewing (desktop and mobile)
  - Swipe navigation on mobile devices
  - Download individual photos in high quality
  - Zoom and pan capabilities
- **Responsive Design**: Optimized for all devices (desktop, tablet, mobile)

## 🛠️ Technical Stack

- **Frontend**: React 19.1.0
- **Routing**: React Router DOM 7.6.2
- **Virtualization**: react-virtualized 9.22.6 (for memory-efficient galleries)
- **Icons**: Font Awesome (via CDN)
- **Styling**: Custom CSS with CSS Variables
- **State Management**: React Hooks (useState, useEffect, useRef, useCallback)
- **API Communication**: Fetch API with JWT authentication
- **Image Optimization**: Lazy loading, preloading, and Intersection Observer API

## 📦 Installation & Setup

### Prerequisites
- Node.js (v14 or higher)
- npm (v6 or higher) or yarn
- Git

### 1. Clone the Repository
```bash
git clone https://github.com/ItsMeShivansh/PIXIALBUM_frontend.git
cd PIXIALBUM_frontend
```

### 2. Install Dependencies
```bash
npm install
```

### 3. Configure Environment Variables
Create a `.env` file in the root directory:
```bash
cp .env.example .env
```

Edit `.env` and set your backend API URL:
```env
REACT_APP_API_BASE_URL=http://your-backend-server.com/api
REACT_APP_ENV=development
```

### 4. Update API Configuration (Optional)
If you need to modify the API base URL in code, edit `src/utils/api.js`:
```javascript
const BASE_URL = process.env.REACT_APP_API_BASE_URL || 'http://localhost:8080/api';
```

### 5. Start Development Server
```bash
npm start
```
The app will open at [http://localhost:3000](http://localhost:3000)

## 🚀 Deployment

### Build for Production
```bash
npm run build
```
This creates an optimized production build in the `build/` folder.

### Deploy to Various Platforms

#### **Netlify**
1. Install Netlify CLI:
   ```bash
   npm install -g netlify-cli
   ```

2. Build and deploy:
   ```bash
   npm run build
   netlify deploy --prod --dir=build
   ```

3. Or connect your GitHub repository on [Netlify](https://netlify.com) for automatic deployments.

#### **Vercel**
1. Install Vercel CLI:
   ```bash
   npm install -g vercel
   ```

2. Deploy:
   ```bash
   vercel --prod
   ```

3. Or import your GitHub repository on [Vercel](https://vercel.com).

#### **GitHub Pages**
1. Install gh-pages:
   ```bash
   npm install --save-dev gh-pages
   ```

2. Add to `package.json`:
   ```json
   {
     "homepage": "https://ItsMeShivansh.github.io/PIXIALBUM_frontend",
     "scripts": {
       "predeploy": "npm run build",
       "deploy": "gh-pages -d build"
     }
   }
   ```

3. Deploy:
   ```bash
   npm run deploy
   ```

#### **AWS S3 + CloudFront**
1. Build the app:
   ```bash
   npm run build
   ```

2. Upload `build/` folder to S3 bucket

3. Configure CloudFront distribution

4. Update DNS records

#### **Docker**
Create a `Dockerfile`:
```dockerfile
FROM node:18-alpine as build
WORKDIR /app
COPY package*.json ./
RUN npm ci
COPY . .
RUN npm run build

FROM nginx:alpine
COPY --from=build /app/build /usr/share/nginx/html
EXPOSE 80
CMD ["nginx", "-g", "daemon off;"]
```

Build and run:
```bash
docker build -t pixialbum-frontend .
docker run -p 80:80 pixialbum-frontend
```

## 📖 Usage Guide

### For Photographers

#### 1. **Sign Up / Sign In**
- Go to the home page
- Select "Photographer" role
- Sign up with username, company name, email, and password
- Or sign in if you already have an account

#### 2. **Create an Event**
- Click "Add Event" button on the dashboard
- Fill in event details:
  - Event Name
  - Event Date
  - Event Type (Wedding, Birthday, Corporate, etc.)
  - Venue Name
- Save the event

#### 3. **Upload Photos**
- Click on an event card to open event details
- Click "Add Photos" button
- Select multiple images from your device
- Wait for upload to complete
- Photos will appear in the event gallery

#### 4. **Add Viewers**
- Open event details
- Click "Add Viewer" button
- Enter viewer details:
  - Name
  - Email
  - Password
- Viewer can now access this specific event

#### 5. **Manage Profile**
- Click the menu icon (☰) in the top-right
- Select "Profile"
- Update your information
- Upload profile photo

### For Viewers

#### 1. **Sign In**
- Go to the home page
- Select "Viewer" role
- Enter credentials provided by the photographer
- Sign in

#### 2. **Browse Events**
- View all events you have access to
- Click on an event card to open the gallery

#### 3. **View Photos**
- Scroll through the virtualized masonry gallery
- Gallery loads more images automatically as you scroll
- Click on any photo to view it in full-screen

#### 4. **Like Photos**
- Click the heart icon on any photo to like it
- Liked photos are saved locally
- Click the heart icon in the header to view only liked photos

#### 5. **Download Photos**
- Click the download icon on any photo
- Or open full-screen view and click download
- High-quality version will be downloaded

#### 6. **Full-Screen Viewer**
- Click any image to open full-screen viewer
- Use arrow keys or swipe (mobile) to navigate
- Zoom in/out using pinch gestures (mobile)
- Press ESC or click X to close

## 🚀 Available Scripts

### `npm start`
Runs the app in development mode at [http://localhost:3000](http://localhost:3000).
The page reloads on changes.

### `npm test`
Launches the test runner in interactive watch mode.

### `npm run build`
Builds the app for production to the `build` folder.
Optimizes the build for best performance with minified code and hashed filenames.

### `npm run eject`
**Note: This is a one-way operation!**
Ejects the Create React App configuration for full control over webpack, Babel, ESLint, etc.

## 📂 Project Structure

```
PIXIALBUM_frontend/
├── public/
│   ├── index.html              # Main HTML template
│   ├── manifest.json           # PWA manifest
│   ├── logo.png                # App logo
│   └── robots.txt              # Search engine crawler rules
├── src/
│   ├── Components/
│   │   ├── Login/              # Viewer login component
│   │   ├── PhotographerLogin/  # Photographer authentication
│   │   ├── RoleSelect/         # Role selection screen
│   │   ├── PhotographerDashboard/
│   │   │   ├── AddEventModal.js
│   │   │   ├── ContactUs.js
│   │   │   ├── EventCard.js    # Individual event management
│   │   │   ├── EventList.js
│   │   │   ├── MoreMenu.js
│   │   │   ├── PhotographerDashboard.js
│   │   │   └── Profile.js
│   │   └── ViewerDashboard/
│   │       ├── Gallery.js      # Virtualized masonry gallery
│   │       ├── ImageViewer.js  # Desktop image viewer
│   │       ├── MobileImageViewer.js
│   │       └── ViewerDashboard.js
│   ├── assets/                 # Images and static assets
│   ├── constants/
│   │   └── index.js            # App constants (USER_ROLES, etc.)
│   ├── hooks/
│   │   └── useAuth.js          # Custom authentication hook
│   ├── utils/
│   │   ├── api.js              # API service layer
│   │   └── validators.js       # Input validation utilities
│   ├── App.js                  # Main app with routing
│   ├── App.css                 # App-level styles
│   ├── index.js                # React entry point
│   ├── index.css               # Base styles
│   └── root.css                # Global styles and CSS variables
├── .env.example                # Environment variables template
├── .gitignore                  # Git ignore rules
├── package.json                # Project dependencies and scripts
├── package-lock.json           # Locked dependency versions
├── LICENSE                     # MIT License
└── README.md                   # This file
```

## 🔑 Key Features Explained

### Virtualized Gallery
The gallery uses `react-virtualized`'s Masonry component to render only visible images, keeping memory usage low:
- **Cell Measurement**: Dynamically measures image heights for proper layout
- **Infinite Scroll**: Automatically loads more images as you scroll
- **Preloading**: Images are preloaded before rendering to prevent layout shifts
- **Cache Management**: Smart cache clearing ensures correct positioning when appending images

### Authentication System
- JWT-based authentication with secure cookie storage
- Role-based access control (Photographer vs Viewer)
- Persistent sessions with localStorage
- Automatic logout on 401/403 responses

### Image Management
- Bulk upload with progress tracking
- Multiple image formats supported
- High-quality download URLs
- Lazy loading for optimal performance
- Like/unlike with localStorage persistence

## 🎨 Styling

The app uses a modern dark theme with:
- CSS Variables for consistent theming
- Responsive design with mobile-first approach
- Smooth animations and transitions
- LED-style glowing borders and shadows
- Custom loading spinners

## 🔒 Security

- JWT authentication tokens stored in httpOnly cookies
- Password validation (minimum 8 characters, special chars)
- Email validation
- CORS configuration
- Secure API endpoints
- Input sanitization

## 📱 Browser Support

- Chrome (latest)
- Firefox (latest)
- Safari (latest)
- Edge (latest)
- Mobile browsers (iOS Safari, Chrome Mobile)

## 🐛 Known Issues & Beta Notice

This is a **beta version** of the app. Known limitations:
- Font loading may fail on some Android devices (fallback to system fonts)
- Large galleries (1000+ images) may require additional optimization
- Some older browsers may not support all features

## 🔧 Troubleshooting

### Port Already in Use
If port 3000 is busy:
```bash
PORT=3001 npm start
```

### API Connection Issues
- Verify backend server is running
- Check `.env` file has correct `REACT_APP_API_BASE_URL`
- Check browser console for CORS errors
- Ensure backend allows requests from `http://localhost:3000`

### Build Fails
```bash
# Clear cache and reinstall
rm -rf node_modules package-lock.json
npm install
npm run build
```

### Images Not Loading
- Check network tab in browser DevTools
- Verify image URLs are correct
- Check CORS policy on image server
- Ensure backend is serving images correctly

## 🤝 Contributing

Contributions are welcome! Please follow these steps:

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/AmazingFeature`)
3. Commit your changes (`git commit -m 'Add some AmazingFeature'`)
4. Push to the branch (`git push origin feature/AmazingFeature`)
5. Open a Pull Request

## 📄 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## 👤 Author

**Shivansh**
- GitHub: [@ItsMeShivansh](https://github.com/ItsMeShivansh)
- Repository: [PIXIALBUM_frontend](https://github.com/ItsMeShivansh/PIXIALBUM_frontend)

## 📞 Support

For support or inquiries:
- Open an issue on [GitHub](https://github.com/ItsMeShivansh/PIXIALBUM_frontend/issues)
- Email: shivansh.santoki07@gmail.com

## 🙏 Acknowledgments

- [Create React App](https://github.com/facebook/create-react-app) for the initial setup
- [react-virtualized](https://github.com/bvaughn/react-virtualized) for efficient gallery rendering
- [Font Awesome](https://fontawesome.com/) for icons
- All contributors and testers

---

**Built with ❤️ by Shivansh**
