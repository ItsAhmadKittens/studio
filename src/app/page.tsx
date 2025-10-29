import FigmaTranslator from '@/components/figma-translator';

export default function Home() {
  return (
    <div className="container mx-auto p-4 md:p-8">
      <header className="text-center mb-8">
        <h1 className="font-headline text-4xl font-bold tracking-tight lg:text-5xl">
          Figma Translator
        </h1>
        <p className="text-muted-foreground mt-2">
          Select frames, choose a language, and let AI do the work.
        </p>
      </header>
      <main>
        <FigmaTranslator />
      </main>
    </div>
  );
}
