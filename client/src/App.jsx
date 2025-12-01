import React from 'react'
import Sidebar from './components/Sidebar'
import { Routes, Route, Navigate, useLocation } from 'react-router-dom'
import Chatbox from './components/Chatbox'
import Login from './pages/login'
import Loading from './pages/Loading'
import { useAppContext } from './context/AppContext'

// Error Boundary Component
class ErrorBoundary extends React.Component {
  constructor(props) {
    super(props);
    this.state = { hasError: false, error: null };
  }

  static getDerivedStateFromError(error) {
    return { hasError: true, error };
  }

  componentDidCatch(error, errorInfo) {
    console.error('Error caught by boundary:', error, errorInfo);
  }

  render() {
    if (this.state.hasError) {
      return (
        <div className="min-h-screen bg-black text-white flex items-center justify-center p-4">
          <div className="text-center max-w-md">
            <div className="text-6xl mb-4">⚠️</div>
            <h1 className="text-2xl font-bold text-red-400 mb-2">Something went wrong</h1>
            <p className="text-gray-400 mb-4">
              {this.state.error?.message || 'An unexpected error occurred'}
            </p>
            <button
              onClick={() => window.location.reload()}
              className="px-4 py-2 bg-red-500 hover:bg-red-600 rounded-lg transition-colors"
            >
              Reload Page
            </button>
          </div>
        </div>
      );
    }

    return this.props.children;
  }
}

// Main App Component
const AppContent = () => {
  const { user, loading } = useAppContext();
  const location = useLocation();

  // Show loading screen while checking authentication state
  if (loading) {
    return <Loading />;
  }

  return (
    <div className='min-h-screen bg-black text-white'>
      {user ? (
        <div className='flex flex-col md:flex-row h-screen w-full overflow-hidden'>
          <Sidebar />
          <div className='flex-1 overflow-auto w-full'>
            <Routes>
              <Route path="/" element={<Chatbox />} />
              <Route path="/login" element={<Navigate to="/" replace />} />
              <Route path="/loading" element={<Loading />} />
              <Route path="*" element={<Navigate to="/" replace />} />
            </Routes>
          </div>
        </div>
      ) : (
        <Routes>
          <Route path="/login" element={<Login />} />
          <Route path="*" element={<Navigate to="/login" replace state={{ from: location }} />} />
        </Routes>
      )}
    </div>
  );
};

// Main App Component with Error Boundary
const App = () => {
  return (
    <ErrorBoundary>
      <AppContent />
    </ErrorBoundary>
  );
};

export default App;