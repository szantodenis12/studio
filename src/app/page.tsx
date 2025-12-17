import Header from '@/components/layout/header';
import HeroSection from '@/components/sections/hero-section';
import Footer from '@/components/layout/footer';
import RoomsSection from '@/components/sections/rooms-section';
import SpaSection from '@/components/sections/spa-section';
import RestaurantSection from '@/components/sections/restaurant-section';
import EventsSection from '@/components/sections/events-section';

export default function Home() {
  return (
    <div className="flex flex-col min-h-screen">
      <Header />
      <main className="flex-grow">
        <HeroSection />
        <RoomsSection />
        <SpaSection />
        <RestaurantSection />
        <EventsSection />
      </main>
      <Footer />
    </div>
  );
}
