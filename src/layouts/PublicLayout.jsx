import { Outlet } from 'react-router-dom'
import { AnnouncementBanner } from '@/components/public/AnnouncementBanner'
import { Navbar } from '@/components/public/Navbar'
import { CinematicFooter } from '@/components/public/CinematicFooter'

export default function PublicLayout() {
  return (
    // Dark backdrop so the cinematic footer shows through cleanly
    <div className="relative bg-[#0c0b0a]">
      {/*
        The "page card" wrapper holds the banner, sticky navbar and content.
        Keeping the sticky navbar inside this TALL wrapper preserves sticky
        behaviour, while z-10 keeps the whole card above the fixed footer.
      */}
      <div className="relative z-10">
        <AnnouncementBanner />
        <Navbar />
        {/* Content card lifts away on scroll to reveal the footer beneath */}
        <main className="relative z-10 min-h-screen overflow-hidden rounded-b-[2.5rem] bg-background shadow-[0_40px_80px_-24px_rgba(0,0,0,0.55)]">
          <Outlet />
        </main>
      </div>

      <CinematicFooter />
    </div>
  )
}
