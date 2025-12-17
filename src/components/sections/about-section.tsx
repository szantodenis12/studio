'use client';

import { AnimatedSection } from './animated-section';
import BlurText from '../ui/blur-text';

export default function AboutSection() {
  return (
    <AnimatedSection id="despre" className="py-20 md:py-32 bg-[#f5f0e4]">
      <div className="container mx-auto px-4 text-center">
        <BlurText
          text="Despre Noi"
          delay={70}
          className="text-4xl md:text-5xl font-headline font-bold mb-6 text-primary justify-center"
        />
        <BlurText
          text="Situat în inima vibrantă a Oradei, Hotel Maxim este mai mult decât un simplu loc de cazare – este o destinație. Am creat un spațiu unde eleganța atemporală se întâlnește cu confortul modern, oferind oaspeților noștri o experiență de neuitat. Fiecare detaliu, de la designul interior rafinat la serviciile personalizate, este gândit pentru a vă depăși așteptările și pentru a transforma fiecare ședere într-o amintire prețioasă."
          delay={30}
          className="text-muted-foreground max-w-3xl mx-auto leading-relaxed justify-center"
        />
      </div>
    </AnimatedSection>
  );
}
