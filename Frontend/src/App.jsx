import React, { useContext } from 'react'
import LandingPage from './pages/LandingPage/LandingPage'
import { Route, Routes } from 'react-router-dom'
import { SignedIn, SignedOut } from '@clerk/clerk-react'
import Dashboard from './pages/Dashboard/Dashboard'
import { StoreContext } from './Context/StoreContext'

const App = () => {

  const { url } = useContext(StoreContext)

  return (
    <div>
      <Routes>

        <Route path='/' element={<LandingPage />} />

        <Route path='/dashboard' element={
          <SignedIn>
            <Dashboard />
          </SignedIn>
        } />
      </Routes>
    </div>
  )
}

export default App