"use client";

import {
  Armchair,
  BedDouble,
  Lightbulb,
  TreePine,
  Image as ImageIcon,
  Instagram,
  Mail,
  ShoppingBag,
} from "lucide-react";

const CATEGORIES = [
  { id: "salon", label: "Salon", icon: Armchair },
  { id: "chambre", label: "Chambre", icon: BedDouble },
  { id: "deco", label: "Déco", icon: Lightbulb },
  { id: "exterieur", label: "Extérieur", icon: TreePine },
];

const PRODUCTS = [
  { id: "p1", name: "Fauteuil rotin", price: 189 },
  { id: "p2", name: "Lampe céramique", price: 65 },
  { id: "p3", name: "Table basse teck", price: 320 },
  { id: "p4", name: "Miroir laiton", price: 95 },
  { id: "p5", name: "Coussin tissé", price: 38 },
  { id: "p6", name: "Vase terre cuite", price: 42 },
];

function formatPrice(value) {
  return new Intl.NumberFormat("fr-FR", {
    style: "currency",
    currency: "EUR",
    maximumFractionDigits: 0,
  }).format(value);
}

export default function Home() {
  return (
    <main className="mx-auto max-w-6xl">
      <nav className="flex items-center justify-between gap-4 border-b border-stone-200 px-6 py-4">
        <span className="text-base font-medium tracking-wide">Maison SXM</span>

        <div className="hidden gap-6 text-sm text-stone-600 sm:flex">
          <a href="#catalogue" className="hover:text-stone-900">
            Catalogue
          </a>
          <a href="#apropos" className="hover:text-stone-900">
            À propos
          </a>
          <a href="#contact" className="hover:text-stone-900">
            Contact
          </a>
        </div>

        <div className="flex items-center gap-4">
          <div className="flex overflow-hidden rounded-md border border-stone-200 text-xs">
            <button className="bg-stone-100 px-2 py-1 font-medium">FR</button>
            <button className="px-2 py-1 text-stone-500">EN</button>
          </div>
          <button aria-label="Voir le panier" className="relative">
            <ShoppingBag size={20} />
            <span className="absolute -right-2 -top-2 flex h-4 w-4 items-center justify-center rounded-full bg-stone-900 text-[10px] font-medium text-white">
              2
            </span>
          </button>
        </div>
      </nav>

      <section className="bg-sand px-6 py-16 text-center">
        <p className="mb-3 text-xs tracking-widest text-stone-500">
          NOUVELLE COLLECTION
        </p>
        <h1 className="mx-auto mb-3 max-w-md text-2xl font-medium">
          Mobilier et décoration, esprit Caraïbes
        </h1>
        <p className="mx-auto mb-6 max-w-sm text-sm leading-relaxed text-stone-600">
          Pièces sélectionnées pour la maison, livrées à Saint-Martin et dans
          les îles
        </p>
        <button className="rounded-md bg-stone-900 px-6 py-2.5 text-sm font-medium text-white">
          Voir la collection
        </button>
      </section>

      <section
        id="catalogue"
        className="grid grid-cols-4 gap-2 px-6 py-8 sm:gap-4"
      >
        {CATEGORIES.map(({ id, label, icon: Icon }) => (
          <div key={id} className="text-center">
            <div className="mx-auto mb-2 flex h-10 w-10 items-center justify-center rounded-full bg-stone-100">
              <Icon size={18} className="text-stone-600" />
            </div>
            <span className="text-xs text-stone-600">{label}</span>
          </div>
        ))}
      </section>

      <section className="grid grid-cols-2 gap-4 px-6 pb-12 sm:grid-cols-3">
        {PRODUCTS.map((product) => (
          <div key={product.id}>
            <div className="mb-2 flex aspect-square items-center justify-center rounded-md bg-stone-100">
              <ImageIcon size={22} className="text-stone-400" />
            </div>
            <p className="text-sm font-medium">{product.name}</p>
            <p className="text-sm text-stone-600">{formatPrice(product.price)}</p>
          </div>
        ))}
      </section>

      <footer
        id="contact"
        className="flex items-center justify-between border-t border-stone-200 px-6 py-4 text-xs text-stone-500"
      >
        <span>© 2026 Maison SXM</span>
        <div className="flex gap-4">
          <Instagram size={16} />
          <Mail size={16} />
        </div>
      </footer>
    </main>
  );
}
