// src/app/(public)/layout.tsx
import { Header } from '@/components/public/header';
import { Footer } from '@/components/public/footer';
import { Navigation } from '@/components/public/navigation';

export default function PublicLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="min-h-screen flex flex-col bg-gray-50">
      <Header />
      <Navigation />
      <main className="flex-grow container mx-auto px-4 py-8 sm:px-6 lg:px-8">
        {children}
      </main>
      <Footer />
    </div>
  );
}