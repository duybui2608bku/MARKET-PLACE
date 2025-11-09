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
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
      <AdminSidebar />

      {/* Main content area with left margin for sidebar - will adjust dynamically via CSS */}
      <main className="transition-all duration-300" style={{ marginLeft: "16rem", padding: "2rem" }}>
        <div className="max-w-7xl mx-auto">
          {children}
        </div>
      </main>
    </div>
  );
}

