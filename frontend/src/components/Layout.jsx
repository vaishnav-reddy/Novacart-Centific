import Sidebar from './Sidebar'
import Navbar from './Navbar'
import AlertBanner from './AlertBanner'
import ToastContainer from './Toast'

export default function Layout({ children }) {
  return (
    <div className="flex min-h-screen bg-background">
      <Sidebar />
      <div className="flex-1 ml-60">
        <Navbar />
        <AlertBanner />
        <main className="pt-14">
          {children}
        </main>
      </div>
      <ToastContainer />
    </div>
  )
}
