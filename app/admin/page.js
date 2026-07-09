"use client";

import { useState, useEffect } from "react";
import { supabase } from "@/lib/supabase";

const CATEGORIES = [
  "Table LED", "Siège LED", "Cube LED", "Colonne LED",
  "Déco LED", "Bar LED", "Pot LED",
  "Salon extérieur", "Table extérieure", "Table basse extérieure",
  "Chaise extérieure", "Transат extérieur", "Pot extérieur",
];

const EMPTY = {
  nom: "", nom_en: "", description: "", prix: "",
  reference: "", categorie: CATEGORIES[0],
  dimensions: "", quantite: 0, images: [], disponible: true,
};

const EMPTY_BANNER = {
  banner_kicker: "NOUVELLE COLLECTION",
  banner_title: "Mobilier et décoration, esprit Caraïbes",
  banner_subtitle: "Pièces sélectionnées pour la maison, livrées à Saint-Martin et dans les îles",
  banner_cta: "Voir la collection",
  banner_image: "",
};

export default function AdminPage() {
  const [authed, setAuthed] = useState(false);
  const [password, setPassword] = useState("");
  const [authError, setAuthError] = useState("");
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(false);
  const [form, setForm] = useState(EMPTY);
  const [editId, setEditId] = useState(null);
  const [showForm, setShowForm] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [search, setSearch] = useState("");
  const [catFilter, setCatFilter] = useState("Tous");
  const [saving, setSaving] = useState(false);
  const [deleteId, setDeleteId] = useState(null);
  const [showBanner, setShowBanner] = useState(false);
  const [banner, setBanner] = useState(EMPTY_BANNER);
  const [savingBanner, setSavingBanner] = useState(false);
  const [uploadingBanner, setUploadingBanner] = useState(false);

  useEffect(() => {
    if (sessionStorage.getItem("admin_ok") === "1") setAuthed(true);
  }, []);

  useEffect(() => {
    if (authed) fetchProducts();
  }, [authed]);

  async function login() {
    setAuthError("");
    const res = await fetch("/api/admin/auth", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ password }),
    });
    if (res.ok) {
      sessionStorage.setItem("admin_ok", "1");
      setAuthed(true);
    } else {
      setAuthError("Mot de passe incorrect");
    }
  }

  async function fetchProducts() {
    setLoading(true);
    const res = await fetch("/api/products");
    const data = await res.json();
    setProducts(data);
    setLoading(false);
  }

  async function handleSave() {
    setSaving(true);
    const payload = { ...form, prix: parseFloat(form.prix) || 0 };
    if (editId) {
      await fetch(`/api/products/${editId}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });
    } else {
      await fetch("/api/products", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });
    }
    setSaving(false);
    setShowForm(false);
    setForm(EMPTY);
    setEditId(null);
    fetchProducts();
  }

  async function handleDelete(id) {
    await fetch(`/api/products/${id}`, { method: "DELETE" });
    setDeleteId(null);
    fetchProducts();
  }

  async function toggleDisponible(product) {
    await fetch(`/api/products/${product.id}`, {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ disponible: !product.disponible }),
    });
    fetchProducts();
  }

  async function handleImageUpload(e) {
    const files = Array.from(e.target.files);
    if (!files.length) return;
    setUploading(true);
    const newUrls = [];
    for (const file of files) {
      const ext = file.name.split(".").pop();
      const filename = `${Date.now()}-${Math.random().toString(36).slice(2)}.${ext}`;
      const { error } = await supabase.storage
        .from("product-images")
        .upload(filename, file, { upsert: true });
      if (!error) {
        const { data: urlData } = supabase.storage
          .from("product-images")
          .getPublicUrl(filename);
        newUrls.push(urlData.publicUrl);
      }
    }
    setForm((f) => ({ ...f, images: [...(f.images || []), ...newUrls] }));
    setUploading(false);
  }

  function removeImage(idx) {
    setForm((f) => ({ ...f, images: f.images.filter((_, i) => i !== idx) }));
  }

  function moveImage(idx, dir) {
    const imgs = [...(form.images || [])];
    const target = idx + dir;
    if (target < 0 || target >= imgs.length) return;
    [imgs[idx], imgs[target]] = [imgs[target], imgs[idx]];
    setForm((f) => ({ ...f, images: imgs }));
  }

  function startEdit(p) {
    setForm({ ...p, prix: String(p.prix), images: p.images || [] });
    setEditId(p.id);
    setShowForm(true);
    window.scrollTo({ top: 0, behavior: "smooth" });
  }

  function startAdd() {
    setForm(EMPTY);
    setEditId(null);
    setShowForm(true);
    setShowBanner(false);
  }

  async function openBanner() {
    const res = await fetch("/api/settings");
    const data = await res.json();
    setBanner({ ...EMPTY_BANNER, ...data });
    setShowBanner(true);
    setShowForm(false);
    window.scrollTo({ top: 0, behavior: "smooth" });
  }

  async function handleBannerImageUpload(e) {
    const file = e.target.files[0];
    if (!file) return;
    setUploadingBanner(true);
    const ext = file.name.split(".").pop();
    const filename = `banner-${Date.now()}-${Math.random().toString(36).slice(2)}.${ext}`;
    const { error } = await supabase.storage
      .from("product-images")
      .upload(filename, file, { upsert: true });
    if (!error) {
      const { data: urlData } = supabase.storage
        .from("product-images")
        .getPublicUrl(filename);
      setBanner((b) => ({ ...b, banner_image: urlData.publicUrl }));
    }
    setUploadingBanner(false);
  }

  async function handleBannerSave() {
    setSavingBanner(true);
    await fetch("/api/settings", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(banner),
    });
    setSavingBanner(false);
    setShowBanner(false);
  }

  const filtered = products.filter((p) => {
    const matchCat = catFilter === "Tous" || p.categorie === catFilter;
    const matchSearch =
      p.nom.toLowerCase().includes(search.toLowerCase()) ||
      (p.reference || "").toLowerCase().includes(search.toLowerCase());
    return matchCat && matchSearch;
  });

  if (!authed) {
    return (
      <div className="min-h-screen bg-stone-50 flex items-center justify-center">
        <div className="bg-white rounded-xl border border-stone-200 p-8 w-full max-w-sm">
          <p className="text-xs tracking-widest text-stone-500 mb-1">MAISON SXM</p>
          <h1 className="text-lg font-medium mb-6">Accès administration</h1>
          <input
            type="password"
            placeholder="Mot de passe"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            onKeyDown={(e) => e.key === "Enter" && login()}
            className="w-full border border-stone-200 rounded-lg px-4 py-2.5 text-sm mb-3 outline-none focus:border-stone-400"
          />
          {authError && <p className="text-red-500 text-xs mb-3">{authError}</p>}
          <button onClick={login} className="w-full bg-stone-900 text-white rounded-lg py-2.5 text-sm font-medium">
            Connexion
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-stone-50">
      <header className="bg-white border-b border-stone-200 px-6 py-4 flex items-center justify-between">
        <div>
          <p className="text-xs tracking-widest text-stone-500">MAISON SXM</p>
          <h1 className="text-base font-medium">Administration</h1>
        </div>
        <div className="flex items-center gap-3">
          <a href="/" target="_blank" className="text-xs text-stone-500 hover:text-stone-900">Voir le site →</a>
          <button onClick={openBanner} className="text-sm px-4 py-2 rounded-lg font-medium border border-stone-200 text-stone-700 hover:border-stone-400">
            Bannière
          </button>
          <button onClick={startAdd} className="bg-stone-900 text-white text-sm px-4 py-2 rounded-lg font-medium">
            + Ajouter un produit
          </button>
        </div>
      </header>

      <div className="max-w-6xl mx-auto px-6 py-8">

        {showForm && (
          <div className="bg-white rounded-xl border border-stone-200 p-6 mb-8">
            <div className="flex items-center justify-between mb-6">
              <h2 className="font-medium">{editId ? "Modifier le produit" : "Nouveau produit"}</h2>
              <button onClick={() => { setShowForm(false); setForm(EMPTY); setEditId(null); }} className="text-stone-400 hover:text-stone-600 text-xl">×</button>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="text-xs text-stone-500 block mb-1">Nom (FR) *</label>
                <input value={form.nom} onChange={e => setForm(f => ({ ...f, nom: e.target.value }))}
                  className="w-full border border-stone-200 rounded-lg px-3 py-2 text-sm outline-none focus:border-stone-400" />
              </div>
              <div>
                <label className="text-xs text-stone-500 block mb-1">Nom (EN)</label>
                <input value={form.nom_en} onChange={e => setForm(f => ({ ...f, nom_en: e.target.value }))}
                  className="w-full border border-stone-200 rounded-lg px-3 py-2 text-sm outline-none focus:border-stone-400" />
              </div>
              <div>
                <label className="text-xs text-stone-500 block mb-1">Prix (€) *</label>
                <input type="number" value={form.prix} onChange={e => setForm(f => ({ ...f, prix: e.target.value }))}
                  className="w-full border border-stone-200 rounded-lg px-3 py-2 text-sm outline-none focus:border-stone-400" />
              </div>
              <div>
                <label className="text-xs text-stone-500 block mb-1">Référence</label>
                <input value={form.reference} onChange={e => setForm(f => ({ ...f, reference: e.target.value }))}
                  className="w-full border border-stone-200 rounded-lg px-3 py-2 text-sm outline-none focus:border-stone-400" />
              </div>
              <div>
                <label className="text-xs text-stone-500 block mb-1">Catégorie *</label>
                <select value={form.categorie} onChange={e => setForm(f => ({ ...f, categorie: e.target.value }))}
                  className="w-full border border-stone-200 rounded-lg px-3 py-2 text-sm outline-none focus:border-stone-400 bg-white">
                  {CATEGORIES.map(c => <option key={c}>{c}</option>)}
                </select>
              </div>
              <div>
                <label className="text-xs text-stone-500 block mb-1">Dimensions</label>
                <input value={form.dimensions} onChange={e => setForm(f => ({ ...f, dimensions: e.target.value }))}
                  className="w-full border border-stone-200 rounded-lg px-3 py-2 text-sm outline-none focus:border-stone-400" />
              </div>
              <div>
                <label className="text-xs text-stone-500 block mb-1">Quantité en stock</label>
                <input type="number" value={form.quantite} onChange={e => setForm(f => ({ ...f, quantite: parseInt(e.target.value) || 0 }))}
                  className="w-full border border-stone-200 rounded-lg px-3 py-2 text-sm outline-none focus:border-stone-400" />
              </div>
              <div className="flex items-center gap-3 pt-5">
                <input type="checkbox" id="dispo" checked={form.disponible} onChange={e => setForm(f => ({ ...f, disponible: e.target.checked }))} className="w-4 h-4" />
                <label htmlFor="dispo" className="text-sm">Disponible sur le site</label>
              </div>
              <div className="sm:col-span-2">
                <label className="text-xs text-stone-500 block mb-1">Description</label>
                <textarea value={form.description} onChange={e => setForm(f => ({ ...f, description: e.target.value }))} rows={3}
                  className="w-full border border-stone-200 rounded-lg px-3 py-2 text-sm outline-none focus:border-stone-400 resize-none" />
              </div>

              {/* Section multi-photos */}
              <div className="sm:col-span-2">
                <label className="text-xs text-stone-500 block mb-2">
                  Photos produit <span className="text-stone-400">({(form.images || []).length} photo{(form.images || []).length > 1 ? 's' : ''} — la première sera l'image principale)</span>
                </label>

                {/* Grille des photos existantes */}
                {(form.images || []).length > 0 && (
                  <div className="flex flex-wrap gap-3 mb-3">
                    {form.images.map((url, idx) => (
                      <div key={url} className="relative group">
                        <img src={url} alt="" className="w-20 h-20 object-cover rounded-lg border border-stone-200" />
                        {idx === 0 && (
                          <span className="absolute top-1 left-1 bg-stone-900 text-white text-[9px] px-1.5 py-0.5 rounded">Principale</span>
                        )}
                        <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity rounded-lg flex items-center justify-center gap-1">
                          {idx > 0 && (
                            <button onClick={() => moveImage(idx, -1)} className="bg-white text-stone-800 text-xs w-6 h-6 rounded flex items-center justify-center hover:bg-stone-100" title="Déplacer à gauche">←</button>
                          )}
                          {idx < form.images.length - 1 && (
                            <button onClick={() => moveImage(idx, 1)} className="bg-white text-stone-800 text-xs w-6 h-6 rounded flex items-center justify-center hover:bg-stone-100" title="Déplacer à droite">→</button>
                          )}
                          <button onClick={() => removeImage(idx)} className="bg-red-500 text-white text-xs w-6 h-6 rounded flex items-center justify-center hover:bg-red-600" title="Supprimer">×</button>
                        </div>
                      </div>
                    ))}
                  </div>
                )}

                <label className="cursor-pointer inline-flex items-center gap-2 bg-stone-100 hover:bg-stone-200 text-stone-700 text-sm px-4 py-2 rounded-lg">
                  {uploading ? "Upload en cours..." : "+ Ajouter des photos"}
                  <input type="file" accept="image/*" multiple className="hidden" onChange={handleImageUpload} disabled={uploading} />
                </label>
                <p className="text-xs text-stone-400 mt-1.5">Tu peux sélectionner plusieurs photos en même temps. Survole une photo pour la réordonner ou la supprimer.</p>
              </div>
            </div>

            <div className="flex gap-3 mt-6 pt-6 border-t border-stone-100">
              <button onClick={handleSave} disabled={saving || !form.nom}
                className="bg-stone-900 text-white text-sm px-6 py-2.5 rounded-lg font-medium disabled:opacity-50">
                {saving ? "Enregistrement..." : editId ? "Enregistrer" : "Créer le produit"}
              </button>
              <button onClick={() => { setShowForm(false); setForm(EMPTY); setEditId(null); }}
                className="text-sm px-6 py-2.5 rounded-lg border border-stone-200 text-stone-600">
                Annuler
              </button>
            </div>
          </div>
        )}

        {showBanner && (
          <div className="bg-white rounded-xl border border-stone-200 p-6 mb-8">
            <div className="flex items-center justify-between mb-6">
              <h2 className="font-medium">Bannière d'accueil</h2>
              <button onClick={() => setShowBanner(false)} className="text-stone-400 hover:text-stone-600 text-xl">×</button>
            </div>

            <div className="grid grid-cols-1 gap-4">
              <div>
                <label className="text-xs text-stone-500 block mb-1">Texte au-dessus du titre</label>
                <input value={banner.banner_kicker} onChange={e => setBanner(b => ({ ...b, banner_kicker: e.target.value }))}
                  className="w-full border border-stone-200 rounded-lg px-3 py-2 text-sm outline-none focus:border-stone-400" />
              </div>
              <div>
                <label className="text-xs text-stone-500 block mb-1">Titre principal</label>
                <input value={banner.banner_title} onChange={e => setBanner(b => ({ ...b, banner_title: e.target.value }))}
                  className="w-full border border-stone-200 rounded-lg px-3 py-2 text-sm outline-none focus:border-stone-400" />
              </div>
              <div>
                <label className="text-xs text-stone-500 block mb-1">Texte descriptif</label>
                <textarea value={banner.banner_subtitle} onChange={e => setBanner(b => ({ ...b, banner_subtitle: e.target.value }))} rows={2}
                  className="w-full border border-stone-200 rounded-lg px-3 py-2 text-sm outline-none focus:border-stone-400 resize-none" />
              </div>
              <div>
                <label className="text-xs text-stone-500 block mb-1">Texte du bouton</label>
                <input value={banner.banner_cta} onChange={e => setBanner(b => ({ ...b, banner_cta: e.target.value }))}
                  className="w-full border border-stone-200 rounded-lg px-3 py-2 text-sm outline-none focus:border-stone-400" />
              </div>

              <div>
                <label className="text-xs text-stone-500 block mb-2">Image de fond (optionnelle)</label>
                {banner.banner_image && (
                  <div className="relative inline-block mb-3">
                    <img src={banner.banner_image} alt="" className="h-28 w-auto rounded-lg border border-stone-200 object-cover" />
                    <button onClick={() => setBanner(b => ({ ...b, banner_image: "" }))}
                      className="absolute top-1 right-1 bg-red-500 text-white text-xs w-6 h-6 rounded flex items-center justify-center hover:bg-red-600" title="Retirer l'image">×</button>
                  </div>
                )}
                <div>
                  <label className="cursor-pointer inline-flex items-center gap-2 bg-stone-100 hover:bg-stone-200 text-stone-700 text-sm px-4 py-2 rounded-lg">
                    {uploadingBanner ? "Upload en cours..." : banner.banner_image ? "Remplacer l'image" : "+ Ajouter une image"}
                    <input type="file" accept="image/*" className="hidden" onChange={handleBannerImageUpload} disabled={uploadingBanner} />
                  </label>
                </div>
              </div>
            </div>

            <div className="flex gap-3 mt-6 pt-6 border-t border-stone-100">
              <button onClick={handleBannerSave} disabled={savingBanner}
                className="bg-stone-900 text-white text-sm px-6 py-2.5 rounded-lg font-medium disabled:opacity-50">
                {savingBanner ? "Enregistrement..." : "Enregistrer la bannière"}
              </button>
              <button onClick={() => setShowBanner(false)}
                className="text-sm px-6 py-2.5 rounded-lg border border-stone-200 text-stone-600">
                Annuler
              </button>
            </div>
          </div>
        )}

        {/* Filtres */}
        <div className="flex flex-wrap items-center gap-3 mb-6">
          <input value={search} onChange={e => setSearch(e.target.value)} placeholder="Rechercher un produit..."
            className="border border-stone-200 rounded-lg px-4 py-2 text-sm outline-none focus:border-stone-400 w-64 bg-white" />
          <select value={catFilter} onChange={e => setCatFilter(e.target.value)}
            className="border border-stone-200 rounded-lg px-3 py-2 text-sm bg-white outline-none">
            <option>Tous</option>
            {CATEGORIES.map(c => <option key={c}>{c}</option>)}
          </select>
          <span className="text-xs text-stone-500 ml-auto">{filtered.length} produit{filtered.length > 1 ? 's' : ''}</span>
        </div>

        {/* Table */}
        {loading ? (
          <p className="text-stone-500 text-sm">Chargement...</p>
        ) : (
          <div className="bg-white rounded-xl border border-stone-200 overflow-hidden">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-stone-100 bg-stone-50">
                  <th className="text-left px-4 py-3 text-xs font-medium text-stone-500">Photos</th>
                  <th className="text-left px-4 py-3 text-xs font-medium text-stone-500">Produit</th>
                  <th className="text-left px-4 py-3 text-xs font-medium text-stone-500">Catégorie</th>
                  <th className="text-left px-4 py-3 text-xs font-medium text-stone-500">Réf.</th>
                  <th className="text-left px-4 py-3 text-xs font-medium text-stone-500">Prix</th>
                  <th className="text-left px-4 py-3 text-xs font-medium text-stone-500">Qté</th>
                  <th className="text-left px-4 py-3 text-xs font-medium text-stone-500">Statut</th>
                  <th className="px-4 py-3"></th>
                </tr>
              </thead>
              <tbody>
                {filtered.map((p, i) => (
                  <tr key={p.id} className={`border-b border-stone-50 hover:bg-stone-50 ${i % 2 === 0 ? '' : 'bg-stone-50/30'}`}>
                    <td className="px-4 py-3">
                      <div className="flex gap-1">
                        {(p.images || []).slice(0, 3).map((url, idx) => (
                          <img key={idx} src={url} alt="" className="w-10 h-10 object-cover rounded-md" />
                        ))}
                        {(!p.images || p.images.length === 0) && (
                          <div className="w-10 h-10 bg-stone-100 rounded-md flex items-center justify-center">
                            <span className="text-stone-300 text-xs">–</span>
                          </div>
                        )}
                        {(p.images || []).length > 3 && (
                          <div className="w-10 h-10 bg-stone-100 rounded-md flex items-center justify-center">
                            <span className="text-xs text-stone-500">+{p.images.length - 3}</span>
                          </div>
                        )}
                      </div>
                    </td>
                    <td className="px-4 py-3 font-medium">{p.nom}</td>
                    <td className="px-4 py-3 text-stone-500">{p.categorie}</td>
                    <td className="px-4 py-3 text-stone-400 font-mono text-xs">{p.reference}</td>
                    <td className="px-4 py-3">{p.prix} €</td>
                    <td className="px-4 py-3 text-stone-500">{p.quantite}</td>
                    <td className="px-4 py-3">
                      <button onClick={() => toggleDisponible(p)}
                        className={`text-xs px-2 py-1 rounded-full font-medium ${p.disponible ? 'bg-green-50 text-green-700' : 'bg-stone-100 text-stone-400'}`}>
                        {p.disponible ? "En ligne" : "Masqué"}
                      </button>
                    </td>
                    <td className="px-4 py-3">
                      <div className="flex items-center gap-2 justify-end">
                        <button onClick={() => startEdit(p)} className="text-xs text-stone-500 hover:text-stone-900 px-2 py-1 rounded border border-stone-200 hover:border-stone-400">
                          Modifier
                        </button>
                        {deleteId === p.id ? (
                          <div className="flex gap-1">
                            <button onClick={() => handleDelete(p.id)} className="text-xs text-red-600 px-2 py-1 rounded border border-red-200 hover:bg-red-50">Confirmer</button>
                            <button onClick={() => setDeleteId(null)} className="text-xs text-stone-400 px-2 py-1">Annuler</button>
                          </div>
                        ) : (
                          <button onClick={() => setDeleteId(p.id)} className="text-xs text-stone-300 hover:text-red-400 px-2 py-1">Supprimer</button>
                        )}
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}
