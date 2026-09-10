import React from 'react';
import { StoreProvider, useStore } from './context/StoreContext';
import { Header } from './components/Header';
import { HeroBanner } from './components/HeroBanner';
import { ProductGrid } from './components/ProductGrid';
import { AdminDashboard } from './components/AdminDashboard';
import { ProductModal } from './components/ProductModal';
import { CartDrawer } from './components/CartDrawer';
import { SideNavDrawer } from './components/SideNavDrawer';
import { CustomerAccountModal } from './components/CustomerAccountModal';
import { MobileBottomNav } from './components/MobileBottomNav';
import { Footer } from './components/Footer';
import { MessageCircle, ArrowUp } from 'lucide-react';

const MainLayout: React.FC = () => {
  const { currentView, toastMessage, businessPhone } = useStore();

  const scrollToTop = () => {
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  return (
    <div className="min-h-screen w-full flex flex-col bg-neutral-50 text-neutral-900 selection:bg-amber-500 selection:text-white relative">
      
      {/* Real-time Toast Notifications (Active on both Store and Admin) */}
      {toastMessage && (
        <div 
          className="fixed top-4 right-4 z-50 max-w-sm bg-neutral-950 text-white px-4 py-3 rounded-2xl shadow-2xl border border-neutral-800 flex items-center gap-2.5 animate-in slide-in-from-top-4 duration-300"
          id="real-time-toast-notification"
        >
          <div className="w-2 h-2 rounded-full bg-emerald-400 shrink-0" />
          <p className="text-xs font-semibold leading-tight">{toastMessage}</p>
        </div>
      )}

      {/* SEPARATED VIEWS */}
      {currentView === 'store' ? (
        /* CUSTOMER STOREFRONT */
        <>
          <Header />
          <main className="flex-1 w-full">
            <HeroBanner />
            <ProductGrid />
          </main>

          {/* Floating WhatsApp Quick Action Button (Visible on both Mobile & Desktop) */}
          <div className="fixed bottom-20 md:bottom-6 right-3.5 md:right-6 z-30 flex flex-col items-end gap-2 transform-gpu">
            <button
              onClick={scrollToTop}
              className="hidden md:flex w-10 h-10 rounded-full bg-white text-neutral-700 shadow-md border border-neutral-200 items-center justify-center hover:bg-neutral-100 transition-colors cursor-pointer"
              title="Back to top"
              id="scroll-to-top-btn"
            >
              <ArrowUp className="w-4 h-4" />
            </button>

            <a
              href={`https://wa.me/91${businessPhone}?text=${encodeURIComponent('Hello Leovra Enterprises! I have an inquiry about your products.')}`}
              target="_blank"
              rel="noopener noreferrer"
              className="group flex items-center gap-2 px-3 py-2 sm:px-3.5 sm:py-2.5 rounded-full bg-emerald-600 hover:bg-emerald-700 text-white shadow-xl border border-emerald-500/40 transition-all duration-300 hover:scale-105 active:scale-95 cursor-pointer"
              id="floating-whatsapp-btn"
              title="Direct WhatsApp Support"
            >
              <div className="relative flex items-center justify-center">
                <MessageCircle className="w-4 h-4 sm:w-5 sm:h-5 fill-white" />
                <span className="absolute -top-1 -right-1 w-2 h-2 rounded-full bg-emerald-300" />
              </div>
              <span className="text-xs font-bold whitespace-nowrap">
                WhatsApp
              </span>
            </a>
          </div>

          <ProductModal />
          <CartDrawer />
          <CustomerAccountModal />
          <SideNavDrawer />
          <MobileBottomNav />
          <Footer />
        </>
      ) : (
        /* DEDICATED ADMIN INVENTORY PORTAL */
        <main className="flex-1 bg-neutral-100/70 min-h-screen">
          <AdminDashboard />
        </main>
      )}
    </div>
  );
};

export default function App() {
  return (
    <StoreProvider>
      <MainLayout />
    </StoreProvider>
  );
}
