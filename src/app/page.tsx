import Header from '@/components/layout/header';
import HeroSection from '@/components/sections/hero-section';
import Footer from '@/components/layout/footer';
import RoomsSection from '@/components/sections/rooms-section';
import SpaSection from '@/components/sections/spa-section';
import RestaurantSection from '@/components/sections/restaurant-section';
import EventsSection from '@/components/sections/events-section';
import GradualBlur from '@/components/ui/gradual-blur';

export default function Home() {
  return (
    <div className="flex flex-col min-h-screen">
      <Header />
      <div className="relative flex-grow">
        <main className="flex-grow">
          <HeroSection />
          <RoomsSection />
          <SpaSection />
          <RestaurantSection />
          <EventsSection />
        </main>
        <GradualBlur
          target="parent"
          position="top"
          height="8rem"
          strength={2}
          divCount={5}
          curve="bezier"
          exponential={false}
          opacity={1}
        />
        <GradualBlur
          target="parent"
          position="bottom"
          height="8rem"
          strength={2}
          divCount={5}
          curve="bezier"
          exponential={false}
          opacity={1}
        />
      </div>
      <Footer />
    </div>
  );
}
