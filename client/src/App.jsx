import React from 'react'
import Sidebar from './components/Sidebar'
import { Routes, Route } from 'react-router-dom'
import Chatbox from './components/Chatbox'
import Login from './pages/login'
import Loading from './pages/Loading'
import { useAppContext } from './context/AppContext'

const App = () => {
  const { user, isGuest, loading } = useAppContext()

  // Show loading screen while checking authentication state
  if (loading) {
    return <Loading />
  }

  return (
    <>
      <div className='min-h-screen bg-black text-white'>
        {user || isGuest ? (
          <div className='flex flex-col md:flex-row h-screen w-full overflow-hidden'>
            <Sidebar />
            <div className='flex-1 overflow-auto w-full'>
              <Routes>
                <Route path="/" element={<Chatbox />} />
                <Route path="/login" element={<Login />} />
                <Route path="/loading" element={<Loading />} />
              </Routes>
            </div>
          </div>
        ) : (
          <Login />
        )}
      </div>
    </>
  )
}

export default App