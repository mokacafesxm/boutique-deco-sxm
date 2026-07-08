"use client";

import { useState, useEffect } from "react";
import { useParams, useRouter } from "next/navigation";
import Image from "next/image";
import {
  ArrowLeft, ChevronLeft, ChevronRight,
  Image as ImageIcon, ShoppingBag, Mail,
} from "lucide-react";

function formatPrice(value) {
  return new Intl.NumberFormat("fr-FR", {
    style: "currency", currency: "EUR", maximumFractionDigits: 0,
  }).format(value);
}

export default function ProductPage() {
  const { id } = useParams();
  const router = useRouter();
  const [product, setProduct] = useState(null);
  const [loading, setLoading] = useState(true);
  const [notFound, setNotFound] = useState(false);
  const [active, setActive] = useState(0);

  useEffect(() => {
    if (!id) return;
    fetch(`/api/products/${id}`)
      .then((r) => (r.ok ? r.json() : Promise.reject(r.status)))
      .then((data) => {
        if (!data || data.error) {
          setNotFound(true);
        } else {
          setProduct(data);
        }
        setLoading(false);
      })
      .catch(() => {
        setNotFound(true);
        setLoading(false);
      });
  }, [id]);

  const images = product?.images && product.images.length > 0 ? product.images : [];
  const hasImages = images.length > 0;
  const inStock = product && product.quantite > 0;

  const prev = () => setActive((i) => (i - 1 + images.length) % images.length);
  const next = () => setActive((i) => (i + 1) % images.length);

  return (
    <main className="mx-auto max-w-6xl">
      {/* Nav */}
      <nav className="flex items-center justify-between gap-4 border-b border-stone-200 px-6 py-4">
        <a href="/" aria-label="Retour à l'accueil">
          <Image src="/logo.jpg" alt="Maison SXM" width={1254} height={496} priority className="h-16 w-auto" />
        </a>
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

      {/* Retour */}
      <div className="px-6 pt-6">
        <button
          onClick={() => router.push("/")}
          className="inline-flex items-center gap-1.5 text-sm text-stone-500 hover:text-stone-900"
        >
          <ArrowLeft size={16} />
          Retour au catalogue
        </button>
      </div>

      {loading ? (
        <div className="grid gap-8 px-6 py-8 md:grid-cols-2">
          <div className="aspect-square animate-pulse rounded-lg bg-stone-100" />
          <div className="space-y-4">
            <div className="h-6 w-2/3 animate-pulse rounded bg-stone-100" />
            <div className="h-4 w-1/3 animate-pulse rounded bg-stone-100" />
            <div className="h-4 w-full animate-pulse rounded bg-stone-100" />
          </div>
        </div>
      ) : notFound || !product ? (
        <div className="px-6 py-24 text-center">
          <p className="mb-4 text-sm text-stone-600">Ce produit est introuvable.</p>
          <a href="/" className="inline-block rounded-md bg-stone-900 px-6 py-2.5 text-sm font-medium text-white">
            Retour au catalogue
          </a>
        </div>
      ) : (
        <section className="grid gap-8 px-6 py-8 md:grid-cols-2">
          {/* Galerie */}
          <div>
            <div className="relative flex aspect-square items-center justify-center overflow-hidden rounded-lg bg-stone-100">
              {hasImages ? (
                <img
                  src={images[active]}
                  alt={product.nom}
                  className="h-full w-full object-cover"
                />
              ) : (
                <ImageIcon size={40} className="text-stone-300" />
              )}

              {hasImages && images.length > 1 && (
                <>
                  <button
                    onClick={prev}
                    aria-label="Photo précédente"
                    className="absolute left-3 top-1/2 -translate-y-1/2 rounded-full bg-white/80 p-2 text-stone-700 shadow-sm hover:bg-white"
                  >
                    <ChevronLeft size={18} />
                  </button>
                  <button
                    onClick={next}
                    aria-label="Photo suivante"
                    className="absolute right-3 top-1/2 -translate-y-1/2 rounded-full bg-white/80 p-2 text-stone-700 shadow-sm hover:bg-white"
                  >
                    <ChevronRight size={18} />
                  </button>
                </>
              )}
            </div>

            {/* Miniatures */}
            {hasImages && images.length > 1 && (
              <div className="mt-3 flex flex-wrap gap-2">
                {images.map((src, i) => (
                  <button
                    key={i}
                    onClick={() => setActive(i)}
                    aria-label={`Voir la photo ${i + 1}`}
                    className={`h-16 w-16 overflow-hidden rounded-md border transition-colors ${
                      i === active ? "border-stone-900" : "border-stone-200 hover:border-stone-400"
                    }`}
                  >
                    <img src={src} alt="" className="h-full w-full object-cover" />
                  </button>
                ))}
              </div>
            )}
          </div>

          {/* Infos */}
          <div>
            <h1 className="text-2xl font-medium">{product.nom}</h1>
            {product.reference && (
              <p className="mt-1 text-xs tracking-wide text-stone-400">Réf. {product.reference}</p>
            )}

            <p className="mt-4 text-2xl font-medium text-stone-900">{formatPrice(product.prix)}</p>

            {/* Stock */}
            <div className="mt-3 flex items-center gap-2 text-sm">
              <span
                className={`inline-block h-2 w-2 rounded-full ${inStock ? "bg-emerald-500" : "bg-stone-300"}`}
              />
              <span className={inStock ? "text-emerald-700" : "text-stone-500"}>
                {inStock ? "En stock" : "Sur commande"}
              </span>
            </div>

            {product.dimensions && (
              <p className="mt-4 text-sm text-stone-600">
                <span className="text-stone-400">Dimensions : </span>
                {product.dimensions}
              </p>
            )}

            {product.description && (
              <p className="mt-4 text-sm leading-relaxed text-stone-600">{product.description}</p>
            )}

            {/* Actions */}
            <div className="mt-8 flex flex-col gap-3 sm:flex-row">
              <button className="inline-flex items-center justify-center gap-2 rounded-md bg-stone-900 px-6 py-3 text-sm font-medium text-white hover:bg-stone-800">
                <ShoppingBag size={16} />
                Ajouter au panier
              </button>
              <a
                href={`mailto:mokacafe.sxm@gmail.com?subject=${encodeURIComponent(
                  `Demande de devis — ${product.nom}`
                )}`}
                className="inline-flex items-center justify-center gap-2 rounded-md border border-stone-300 px-6 py-3 text-sm font-medium text-stone-700 hover:border-stone-500"
              >
                <Mail size={16} />
                Demander un devis
              </a>
            </div>
          </div>
        </section>
      )}

      {/* Footer */}
      <footer className="flex items-center justify-between border-t border-stone-200 px-6 py-4 text-xs text-stone-500">
        <span>© 2026 Maison SXM</span>
      </footer>
    </main>
  );
}
