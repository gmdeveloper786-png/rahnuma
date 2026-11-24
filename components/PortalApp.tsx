'use client';

import React from 'react';
import { usePathname } from 'next/navigation';
import { AnimatePresence, motion } from 'motion/react';
import { PortalProvider, usePortal } from '@/context/PortalContext';
import Header from '@/components/Header';
import Footer from '@/components/Footer';
import Modals from '@/components/Modals';
import ToastContainer from '@/components/ToastContainer';
import { PortalSkeleton } from '@/components/Skeletons';

function PortalShell({ children }: { children: React.ReactNode }) {
  const { activeView, isHydrated } = usePortal();
  const pathname = usePathname();

  return (
    <div className="flex min-h-screen flex-col bg-[#F8FAFC]">
      <Header />
      <main className="flex-1">
        {!isHydrated ? (
          <PortalSkeleton activeView={activeView} pathname={pathname} />
        ) : (
          <AnimatePresence mode="wait">
            <motion.div
              key={pathname || activeView}
              initial={{ opacity: 0, y: 6 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -4 }}
              transition={{ duration: 0.16, ease: [0.16, 1, 0.3, 1] }}
            >
              {children}
            </motion.div>
          </AnimatePresence>
        )}
      </main>
      <Footer />
      <Modals />
      <ToastContainer />
    </div>
  );
}

export default function PortalApp({ children }: { children: React.ReactNode }) {
  return (
    <PortalProvider>
      <PortalShell>{children}</PortalShell>
    </PortalProvider>
  );
}
