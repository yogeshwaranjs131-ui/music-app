# Music Streaming App (MERN Stack)

A fully functional music streaming application built with the MERN stack (MongoDB, Express, React, Node.js). This application allows users to stream music, manage playlists, like songs, and interact through comments.

## 🚀 Features

-   **User Authentication**: Secure Login and Registration using JWT.
-   **Music Streaming**: High-quality audio playback with a persistent player bar.
-   **Player Controls**: Play, Pause, Next, Previous, Shuffle, Repeat, and Volume control.
-   **Playlist Management**: Create custom playlists and add/remove songs.
-   **Liked Songs**: Mark songs as favorites and view them in a dedicated "Liked Songs" playlist.
-   **Search**: Real-time search for songs by title, artist, or movie.
-   **Comments**: Users can comment on specific songs.
-   **Admin Upload**: Dedicated interface for admins to upload songs and cover images.
-   **Responsive UI**: Built with Tailwind CSS for a seamless experience across devices.

## 🛠️ Tech Stack

-   **Frontend**: React.js, Vite, Tailwind CSS, React Router, Axios, React Icons.
-   **Backend**: Node.js, Express.js.
-   **Database**: MongoDB (Mongoose).
-   **Authentication**: JSON Web Tokens (JWT).
-   **File Handling**: Multer (for audio and image uploads).

## 📂 Project Structure

```
Music app/
├── music-app-backend/     # Server-side code
│   ├── models/            # Database schemas (User, Song, Playlist, Comment)
│   ├── routes/            # API routes
│   ├── uploads/           # Stored media files
│   └── server.js          # Server entry point
└── music-app-frontend/    # Client-side code
    ├── src/
    │   ├── components/    # Reusable UI components (Player, Sidebar, etc.)
    │   ├── pages/         # Application pages (Home, Login, AdminUpload, etc.)
    │   └── api.js         # API configuration
    └── ...
```

## ⚙️ Installation & Setup

Follow these steps to get the project running on your local machine.

### 1. Prerequisites
-   Node.js installed.
-   MongoDB installed and running locally (or use a MongoDB Atlas URI).

### 2. Backend Setup

1.  Navigate to the backend folder:
    ```bash
    cd music-app-backend
    ```
2.  Install dependencies:
    ```bash
    npm install
    ```
3.  Start the server:
    ```bash
    node server.js
    ```
    The backend will run on `http://localhost:5000`.

### 3. Frontend Setup

1.  Open a new terminal and navigate to the frontend folder:
    ```bash
    cd music-app-frontend
    ```
2.  Install dependencies:
    ```bash
    npm install
    ```
3.  Start the React app:
    ```bash
    npm run dev
    ```
    The frontend will typically run on `http://localhost:5173`.

## 🔑 Usage

1.  **Register/Login**: Create an account to start using the app.
2.  **Upload Songs**: Use the **Upload** link in the sidebar (or go to `/admin/upload`) to add music. You need to provide a title, audio file, and optional cover image.
3.  **Play Music**: Click on any song card to start playing.
4.  **Create Playlists**: Click the **+** icon in the sidebar to create a new playlist, then add songs to it using the **+** button on song cards.