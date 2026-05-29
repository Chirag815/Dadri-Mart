import React from "react";

export default function Footer() {
  return (
    <footer className="mt-12 py-6 border-t border-gray-900 text-center text-xs text-gray-500 space-y-1 shrink-0">
      <p>© {new Date().getFullYear()} Kartly Grocery Logistics Inc.</p>
      <p className="text-[10px] text-gray-600 font-semibold uppercase tracking-wider">
        Engineered with MongoDB, Express, React 19 & Tailwind CSS v4
      </p>
    </footer>
  );
}
