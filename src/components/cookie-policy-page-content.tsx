export default function CookiePolicyPageContent() {
  return (
    <main className="max-w-3xl mx-auto px-4 py-12">
      <h1 className="text-3xl font-bold mb-6">Politica de Cookie-uri</h1>

      <p className="mb-4">
        Acest site folosește cookie-uri pentru a vă oferi o experiență de navigare mai bună.
        Prin continuarea utilizării site-ului, sunteți de acord cu utilizarea cookie-urilor
        conform prezentei politici.
      </p>

      <h2 className="text-xl font-semibold mt-8 mb-3">Ce sunt cookie-urile?</h2>
      <p className="mb-4">
        Cookie-urile sunt fișiere text de mici dimensiuni stocate pe dispozitivul dvs. atunci
        când vizitați un site web. Ele permit site-ului să vă recunoască la vizitele ulterioare
        și să rețină preferințele dvs.
      </p>

      <h2 className="text-xl font-semibold mt-8 mb-3">Tipuri de cookie-uri utilizate</h2>

      <h3 className="text-lg font-medium mt-4 mb-2">Cookie-uri esențiale</h3>
      <p className="mb-4">
        Aceste cookie-uri sunt necesare pentru funcționarea corectă a site-ului și nu pot fi
        dezactivate. De obicei, sunt setate ca răspuns la acțiunile dvs. (ex: autentificare,
        completarea unui formular).
      </p>

      <h3 className="text-lg font-medium mt-4 mb-2">Cookie-uri analitice</h3>
      <p className="mb-4">
        Ne ajută să înțelegem cum interacționați cu site-ul, ce pagini sunt vizitate cel mai
        frecvent și dacă apar erori. Toate informațiile sunt colectate în mod anonim.
      </p>

      <h3 className="text-lg font-medium mt-4 mb-2">Cookie-uri de preferințe</h3>
      <p className="mb-4">
        Permit site-ului să rețină informații precum limba preferată sau regiunea în care vă
        aflați, oferindu-vă o experiență mai personalizată.
      </p>

      <h2 className="text-xl font-semibold mt-8 mb-3">Cum puteți controla cookie-urile?</h2>
      <p className="mb-4">
        Puteți seta browserul să refuze toate sau unele cookie-uri, sau să vă alerteze când
        site-urile setează sau accesează cookie-uri. Dacă dezactivați sau refuzați cookie-urile,
        rețineți că unele părți ale acestui site pot deveni inaccesibile sau pot funcționa
        incorect.
      </p>
      <p className="mb-4">
        Pentru mai multe informații despre gestionarea cookie-urilor, vizitați pagina de ajutor
        a browserului dvs.
      </p>

      <h2 className="text-xl font-semibold mt-8 mb-3">Contact</h2>
      <p className="mb-4">
        Dacă aveți întrebări despre politica noastră de cookie-uri, ne puteți contacta la
        adresa de e-mail disponibilă pe pagina de contact.
      </p>

      <p className="text-sm text-gray-500 mt-10">
        Ultima actualizare: {new Date().getFullYear()}
      </p>
    </main>
  );
}
