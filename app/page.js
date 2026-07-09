"use client";

import { useState, useEffect } from "react";
import Image from "next/image";
import {
  Armchair, Zap, Sparkles,
  Image as ImageIcon, Instagram, Mail, ShoppingBag,
} from "lucide-react";

const CATEGORY_GROUPS = [
  { label: "Mobilier LED", icon: Zap, keys: ["Table LED", "Siège LED", "Cube LED", "Colonne LED"] },
  { label: "Déco LED", icon: Sparkles, keys: ["Déco LED", "Bar LED", "Pot LED"] },
  { label: "Salon & Extérieur", icon: Armchair, keys: ["Salon extérieur", "Table extérieure", "Table basse extérieure", "Transат extérieur", "Chaise extérieure", "Pot extérieur"] },
];

const BANNER_DEFAULTS = {
  banner_kicker: "NOUVELLE COLLECTION",
  banner_title: "Mobilier et décoration, esprit Caraïbes",
  banner_subtitle: "Pièces sélectionnées pour la maison, livrées à Saint-Martin et dans les îles",
  banner_cta: "Voir la collection",
  banner_image: "",
};

function formatPrice(value) {
  return new Intl.NumberFormat("fr-FR", {
    style: "currency", currency: "EUR", maximumFractionDigits: 0,
  }).format(value);
}

export default function Home() {
  const [products, setProducts] = useState([]);
  const [activeGroup, setActiveGroup] = useState("Mobilier LED");
  const [loading, setLoading] = useState(true);
  const [banner, setBanner] = useState(BANNER_DEFAULTS);

  useEffect(() => {
    fetch("/api/products")
      .then((r) => r.json())
      .then((data) => {
        setProducts(data.filter((p) => p.disponible));
        setLoading(false);
      });
  }, []);

  useEffect(() => {
    fetch("/api/settings")
      .then((r) => r.json())
      .then((data) => setBanner({ ...BANNER_DEFAULTS, ...data }))
      .catch(() => {});
  }, []);

  const filtered = products.filter((p) =>
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
      <section
        className="relative bg-stone-50 px-6 py-16 text-center"
        style={banner.banner_image ? {
          backgroundImage: `url(${banner.banner_image})`,
          backgroundSize: "cover",
          backgroundPosition: "center",
        } : undefined}
      >
        {banner.banner_image && <div className="absolute inset-0 bg-black/40" />}
        <div className="relative">
          <p className={`mb-3 text-xs tracking-widest ${banner.banner_image ? "text-white/80" : "text-stone-500"}`}>
            {banner.banner_kicker}
          </p>
          <h1 className={`mx-auto mb-3 max-w-md text-2xl font-medium ${banner.banner_image ? "text-white" : ""}`}>
            {banner.banner_title}
          </h1>
          <p className={`mx-auto mb-6 max-w-sm text-sm leading-relaxed ${banner.banner_image ? "text-white/90" : "text-stone-600"}`}>
            {banner.banner_subtitle}
          </p>
          <a href="#catalogue" className="inline-block rounded-md bg-stone-900 px-6 py-2.5 text-sm font-medium text-white">
            {banner.banner_cta}
          </a>
        </div>
      </section>

      {/* Filtres catégories */}
      <section id="catalogue" className="flex justify-center gap-8 px-6 pt-10 pb-6 sm:gap-14">
        {CATEGORY_GROUPS.map((g) => {
          const Icon = g.icon;
          const active = activeGroup === g.label;
          return (
            <button
              key={g.label}
              onClick={() => setActiveGroup(g.label)}
              className="group flex flex-col items-center gap-2"
            >
              <span
                className={`flex h-16 w-16 items-center justify-center rounded-full transition-colors ${
                  active
                    ? "bg-stone-900 text-white"
                    : "bg-stone-100 text-stone-600 group-hover:bg-stone-200"
                }`}
              >
                <Icon size={32} strokeWidth={1.5} />
              </span>
              <span className={`text-xs ${active ? "font-medium text-stone-900" : "text-stone-500"}`}>
                {g.label}
              </span>
            </button>
          );
        })}
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
              <a key={p.id} href={`/products/${p.id}`} className="group cursor-pointer">
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
              </a>
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
