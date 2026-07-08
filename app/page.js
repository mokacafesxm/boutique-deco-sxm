"use client";

import { useState, useEffect } from "react";
import Image from "next/image";
import {
  Armchair, BedDouble, Lightbulb, TreePine,
  Image as ImageIcon, Instagram, Mail, ShoppingBag,
} from "lucide-react";

const CATEGORY_GROUPS = [
  { label: "Mobilier LED", icon: Lightbulb, keys: ["Table LED", "Siège LED", "Cube LED", "Colonne LED"] },
  { label: "Déco LED", icon: Lightbulb, keys: ["Déco LED", "Bar LED", "Pot LED"] },
  { label: "Salon & Extérieur", icon: Armchair, keys: ["Salon extérieur", "Table extérieure", "Table basse extérieure", "Transат extérieur"] },
  { label: "Jardin & Déco", icon: TreePine, keys: ["Chaise extérieure", "Pot extérieur"] },
];

function formatPrice(value) {
  return new Intl.NumberFormat("fr-FR", {
    style: "currency", currency: "EUR", maximumFractionDigits: 0,
  }).format(value);
}

export default function Home() {
  const [products, setProducts] = useState([]);
  const [activeGroup, setActiveGroup] = useState("Tous");
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch("/api/products")
      .then((r) => r.json())
      .then((data) => {
        setProducts(data.filter((p) => p.disponible));
        setLoading(false);
      });
  }, []);

  const filtered = activeGroup === "Tous"
    ? products
    : products.filter((p) =>
        CATEGORY_GROUPS.find((g) => g.label === activeGroup)?.keys.includes(p.categorie)
      );

  return (
    <main className="mx-auto max-w-6xl">
      {/* Nav */}
      <nav className="flex items-center justify-between gap-4 border-b border-stone-200 px-6 py-4">
        <Image src="/logo.jpg" alt="Maison SXM" width={1254} height={496} priority className="h-16 w-auto" />
        <div className="hidden gap-6 text-sm text-stone-600 sm:flex">
          <a href="#catalogue" className="hover:text-stone-900">Catalogue</a>
          <a href="#apropos" className="hover:text-stone-900">À propos</a>
          <a href="#contact" className="hover:text-stone-900">Contact</a>
        </div>
        <div className="flex items-center gap-4">
          <div className="flex overflow-hidden rounded-md border border-stone-200 text-xs">
            <button className="bg-stone-100 px-2 py-1 font-medium">FR</button>
            <button className="px-2 py-1 text-stone-500">EN</button>
          </div>
          <button aria-label="Voir le panier" className="relative">
            <ShoppingBag size={20} />
          </button>
        </div>
      </nav>

      {/* Hero */}
      <section className="bg-stone-50 px-6 py-16 text-center">
        <p className="mb-3 text-xs tracking-widest text-stone-500">NOUVELLE COLLECTION</p>
        <h1 className="mx-auto mb-3 max-w-md text-2xl font-medium">Mobilier et décoration, esprit Caraïbes</h1>
        <p className="mx-auto mb-6 max-w-sm text-sm leading-relaxed text-stone-600">
          Pièces sélectionnées pour la maison, livrées à Saint-Martin et dans les îles
        </p>
        <a href="#catalogue" className="inline-block rounded-md bg-stone-900 px-6 py-2.5 text-sm font-medium text-white">
          Voir la collection
        </a>
      </section>

      {/* Filtres catégories */}
      <section id="catalogue" className="px-6 pt-8 pb-4 flex flex-wrap gap-2">
        {["Tous", ...CATEGORY_GROUPS.map((g) => g.label)].map((label) => (
          <button
            key={label}
            onClick={() => setActiveGroup(label)}
            className={`text-xs px-4 py-2 rounded-full border transition-colors ${
              activeGroup === label
                ? "bg-stone-900 text-white border-stone-900"
                : "border-stone-200 text-stone-600 hover:border-stone-400"
            }`}
          >
            {label}
          </button>
        ))}
      </section>

      {/* Grille produits */}
      <section className="grid grid-cols-2 gap-4 px-6 pb-16 sm:grid-cols-3 lg:grid-cols-4">
        {loading
          ? Array.from({ length: 8 }).map((_, i) => (
              <div key={i} className="animate-pulse">
                <div className="aspect-square rounded-md bg-stone-100 mb-2" />
                <div className="h-3 bg-stone-100 rounded w-3/4 mb-1" />
                <div className="h-3 bg-stone-100 rounded w-1/3" />
              </div>
            ))
          : filtered.map((p) => (
              <div key={p.id} className="group cursor-pointer">
                <div className="mb-2 flex aspect-square items-center justify-center rounded-md bg-stone-100 overflow-hidden">
                  {p.images && p.images.length > 0 ? (
                    <img src={p.images[0]} alt={p.nom} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300" />
                  ) : (
                    <ImageIcon size={22} className="text-stone-300" />
                  )}
                </div>
                <p className="text-sm font-medium">{p.nom}</p>
                {p.dimensions && <p className="text-xs text-stone-400 mb-0.5">{p.dimensions}</p>}
                <p className="text-sm text-stone-600">{formatPrice(p.prix)}</p>
              </div>
            ))}
      </section>

      {/* Footer */}
      <footer id="contact" className="flex items-center justify-between border-t border-stone-200 px-6 py-4 text-xs text-stone-500">
        <span>© 2026 Maison SXM</span>
        <div className="flex gap-4">
          <Instagram size={16} />
          <Mail size={16} />
        </div>
      </footer>
    </main>
  );
}
