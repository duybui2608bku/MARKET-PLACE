"use client";

import { ReactNode, useEffect } from "react";
import AdminSidebar from "@/components/admin/AdminSidebar";

interface AdminLayoutClientProps {
  children: ReactNode;
}

export default function AdminLayoutClient({ children }: AdminLayoutClientProps) {
  // Hide the main site header and footer when in admin
  useEffect(() => {
    // Hide header and footer from parent layout
    const header = document.querySelector("header");
    const footer = document.querySelector("footer");
    
    if (header) header.style.display = "none";
    if (footer) footer.style.display = "none";

    // Also remove the padding-top from main element added by parent layout
    const mainElement = document.querySelector("body > div > main");
    if (mainElement) {
      (mainElement as HTMLElement).style.paddingTop = "0";
    }

    // Cleanup on unmount
    return () => {
      if (header) header.style.display = "";
      if (footer) footer.style.display = "";
      if (mainElement) {
        (mainElement as HTMLElement).style.paddingTop = "";
      }
    };
  }, []);

  return (
    <div className="min-h-screen bg-gradient-to-br from-accent/20 via-white to-secondary/10 dark:from-gray-900 dark:via-gray-900 dark:to-gray-800">
      <AdminSidebar />

      {/* Main content area with left margin for sidebar */}
      <main 
        className="transition-all duration-300 min-h-screen" 
        style={{ marginLeft: "18rem", padding: "2rem 2.5rem" }}
      >
        <div className="max-w-[1400px] mx-auto">
          {/* Decorative background elements */}
          <div className="fixed top-0 right-0 w-96 h-96 bg-primary/5 rounded-full blur-3xl -z-10" />
          <div className="fixed bottom-0 left-1/2 w-96 h-96 bg-secondary/10 rounded-full blur-3xl -z-10" />
          
          {children}
        </div>
      </main>
    </div>
  );
}

