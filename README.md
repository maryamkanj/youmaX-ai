# YoumaX AI

YoumaX AI is a full-stack AI chat application that leverages the power of **Google's Gemini 2.5 Flash** model for intelligent text conversations and **ImageKit** for high-quality AI image generation. Built with the latest web technologies, it offers a seamless, responsive, and secure user experience.

## 🚀 Features

-   **Advanced AI Chat**: Engage in natural, context-aware conversations powered by the Gemini 2.5 Flash model (via OpenAI compatibility layer).
-   **AI Image Generation**: Create stunning images from text prompts using ImageKit's generation capabilities.
-   **Dual Mode Interface**: Seamlessly switch between "Text Mode" and "Image Mode" within the chat interface.
-   **Secure Authentication**: Robust user registration and login system using JWT (JSON Web Tokens) and bcryptjs.
-   **Persistent Chat History**: All your conversations are securely stored in MongoDB, allowing you to revisit past chats.
-   **Responsive Design**: A modern, dark-themed UI built with Tailwind CSS 4 that works perfectly across desktop and mobile devices.
-   **Markdown Support**: Rich text formatting for code blocks, lists, and more within chat messages.
-   **Real-time Feedback**: Loading states and animations for a smooth user interaction.

## 🛠️ Tech Stack

### Frontend (Client)
-   **React 19**: The latest version of the library for web and native user interfaces.
-   **Vite 7**: Next-generation frontend tooling for lightning-fast builds.
-   **Tailwind CSS 4**: A utility-first CSS framework for rapid UI development.
-   **React Router 7**: For dynamic client-side routing.
-   **Axios**: For making HTTP requests to the backend.
-   **React Markdown**: For rendering markdown content in chat messages.

### Backend (Server)
-   **Node.js**: JavaScript runtime environment.
-   **Express 5**: Fast, unopinionated, minimalist web framework for Node.js.
-   **MongoDB & Mongoose 9**: NoSQL database and object modeling for storing user and chat data.
-   **OpenAI SDK**: Used to interact with the Gemini API (compatible endpoint).
-   **ImageKit SDK**: For handling image generation and storage.
-   **JWT & Bcryptjs**: For secure authentication and password hashing.

## 📋 Prerequisites

Before you begin, ensure you have the following installed:
-   **Node.js** (v18 or higher recommended)
-   **MongoDB** (Local instance or Atlas URI)

You will also need API keys for:
-   **Google Gemini API**
-   **ImageKit**

## 🔧 Installation & Setup

1.  **Clone the Repository**
    ```bash
    git clone https://github.com/maryamkanj/youmaX-ai.git
    cd youmaX-ai
    ```

2.  **Setup Backend (Server)**
    ```bash
    cd server
    npm install
    ```
    Create a `.env` file in the `server` directory with the following variables:
    ```env
    PORT=3000
    MONGODB_URL=your_mongodb_connection_string
    JWT_SECRET=your_jwt_secret_key
    GEMINI_API_KEY=your_gemini_api_key
    
    # ImageKit Configuration
    IMAGEKIT_URL_ENDPOINT=your_imagekit_url_endpoint
    IMAGEKIT_PUBLIC_KEY=your_imagekit_public_key
    IMAGEKIT_PRIVATE_KEY=your_imagekit_private_key
    ```

3.  **Setup Frontend (Client)**
    ```bash
    cd ../client
    npm install
    ```
    (Optional) Create a `.env` file in the `client` directory if you have environment-specific configs (e.g., API base URL if not proxying).

## 🏃‍♂️ Running the Project

1.  **Start the Server**
    ```bash
    cd server
    npm run server
    # Runs with nodemon for auto-restart on changes
    ```

2.  **Start the Client**
    Open a new terminal window:
    ```bash
    cd client
    npm run dev
    ```

3.  **Access the App**
    Open your browser and navigate to `http://localhost:5173` (or the port shown in your terminal).

## 📄 License

This project is licensed under the [ISC License](LICENSE).
