import Header from '@/components/layout/header';
import HeroSection from '@/components/sections/hero-section';
import Footer from '@/components/layout/footer';

export default function Home() {
  return (
    <div className="flex flex-col min-h-screen">
      <Header />
      <main className="flex-grow">
        <HeroSection />
        <section id="camere" className="py-20 md:py-32">
          <div className="container mx-auto px-4 text-center">
            <h2 className="text-4xl md:text-5xl font-headline font-bold mb-4">Camere & Apartamente</h2>
            <p className="text-muted-foreground max-w-2xl mx-auto">Placeholder for Room Showcase. This section will display the luxurious rooms and suites available at Hotel Maxim, complete with high-resolution images, descriptions, and booking options.</p>
          </div>
        </section>
        <section id="spa" className="py-20 md:py-32 bg-secondary">
          <div className="container mx-auto px-4 text-center">
            <h2 className="text-4xl md:text-5xl font-headline font-bold mb-4">Spa & Wellness</h2>
            <p className="text-muted-foreground max-w-2xl mx-auto">Placeholder for Spa & Wellness. This area will showcase the hotel's state-of-the-art spa facilities, including massage services, fitness room, and swimming pool.</p>
          </div>
        </section>
        <section id="restaurant" className="py-20 md:py-32">
          <div className="container mx-auto px-4 text-center">
            <h2 className="text-4xl md:text-5xl font-headline font-bold mb-4">Restaurant</h2>
            <p className="text-muted-foreground max-w-2xl mx-auto">Placeholder for Dining Experience. Here, visitors will explore the culinary delights offered at Hotel Maxim's restaurant, featuring menus and beautiful photos of the dishes.</p>
          </div>
        </section>
        <section id="conferinte" className="py-20 md:py-32 bg-secondary">
          <div className="container mx-auto px-4 text-center">
            <h2 className="text-4xl md:text-5xl font-headline font-bold mb-4">Conferințe & Evenimente</h2>
            <p className="text-muted-foreground max-w-2xl mx-auto">Placeholder for Conference Hall. This section will provide information about the hotel's conference and event hosting capabilities, detailing the available spaces and services.</p>
          </div>
        </section>
      </main>
      <Footer />
    </div>
  );
}
