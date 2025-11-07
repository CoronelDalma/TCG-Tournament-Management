import './App.css'
import { BrowserRouter } from 'react-router-dom'
import { AuthProvider } from './context/Auth/AuthProvider'
import { Header } from './components/Header/Header'
import { AppRoutes } from './components/AppRoutes/AppRoutes'
import { Footer } from './components/Footer/Footer'


function App() {
  return (
    <>
      <BrowserRouter>
        <AuthProvider>
          <div className=''>
            <Header />
            <AppRoutes />
            <Footer />
          </div>
        </AuthProvider>
      </BrowserRouter>
    </>
  )
}

export default App
