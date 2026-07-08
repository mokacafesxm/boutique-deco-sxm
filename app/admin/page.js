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
  dimensions: "", quantite: 0, image_url: "", disponible: true,
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
    const file = e.target.files[0];
    if (!file) return;
    setUploading(true);
    const ext = file.name.split(".").pop();
    const filename = `${Date.now()}.${ext}`;
    const { data, error } = await supabase.storage
      .from("product-images")
      .upload(filename, file, { upsert: true });
    if (!error) {
      const { data: urlData } = supabase.storage
        .from("product-images")
        .getPublicUrl(filename);
      setForm((f) => ({ ...f, image_url: urlData.publicUrl }));
    }
    setUploading(false);
  }

  function startEdit(p) {
    setForm({ ...p, prix: String(p.prix) });
    setEditId(p.id);
    setShowForm(true);
    window.scrollTo({ top: 0, behavior: "smooth" });
  }

  function startAdd() {
    setForm(EMPTY);
    setEditId(null);
    setShowForm(true);
  }

  const filtered = products.filter((p) => {
    const matchCat = catFilter === "Tous" || p.categorie === catFilter;
    const matchSearch =
      p.nom.toLowerCase().includes(search.toLowerCase()) ||
      p.reference.toLowerCase().includes(search.toLowerCase());
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
          <button
            onClick={login}
            className="w-full bg-stone-900 text-white rounded-lg py-2.5 text-sm font-medium"
          >
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
          <a href="/" target="_blank" className="text-xs text-stone-500 hover:text-stone-900">
            Voir le site →
          </a>
          <button
            onClick={startAdd}
            className="bg-stone-900 text-white text-sm px-4 py-2 rounded-lg font-medium"
          >
            + Ajouter un produit
          </button>
        </div>
      </header>

      <div className="max-w-6xl mx-auto px-6 py-8">

        {/* Formulaire ajout/édition */}
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
              <div className="sm:col-span-2">
                <label className="text-xs text-stone-500 block mb-2">Image produit</label>
                <div className="flex items-center gap-4">
                  {form.image_url && (
                    <img src={form.image_url} alt="" className="w-16 h-16 object-cover rounded-lg border border-stone-200" />
                  )}
                  <label className="cursor-pointer bg-stone-100 hover:bg-stone-200 text-stone-700 text-sm px-4 py-2 rounded-lg">
                    {uploading ? "Upload..." : "Choisir une image"}
                    <input type="file" accept="image/*" className="hidden" onChange={handleImageUpload} />
                  </label>
                  {form.image_url && (
                    <button onClick={() => setForm(f => ({ ...f, image_url: "" }))} className="text-xs text-red-400 hover:text-red-600">Supprimer</button>
                  )}
                </div>
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

        {/* Filtres */}
        <div className="flex flex-wrap items-center gap-3 mb-6">
          <input
            value={search}
            onChange={e => setSearch(e.target.value)}
            placeholder="Rechercher un produit..."
            className="border border-stone-200 rounded-lg px-4 py-2 text-sm outline-none focus:border-stone-400 w-64 bg-white"
          />
          <select value={catFilter} onChange={e => setCatFilter(e.target.value)}
            className="border border-stone-200 rounded-lg px-3 py-2 text-sm bg-white outline-none">
            <option>Tous</option>
            {CATEGORIES.map(c => <option key={c}>{c}</option>)}
          </select>
          <span className="text-xs text-stone-500 ml-auto">{filtered.length} produit{filtered.length > 1 ? 's' : ''}</span>
        </div>

        {/* Table produits */}
        {loading ? (
          <p className="text-stone-500 text-sm">Chargement...</p>
        ) : (
          <div className="bg-white rounded-xl border border-stone-200 overflow-hidden">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-stone-100 bg-stone-50">
                  <th className="text-left px-4 py-3 text-xs font-medium text-stone-500">Photo</th>
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
                      {p.image_url ? (
                        <img src={p.image_url} alt="" className="w-10 h-10 object-cover rounded-md" />
                      ) : (
                        <div className="w-10 h-10 bg-stone-100 rounded-md flex items-center justify-center">
                          <span className="text-stone-300 text-xs">–</span>
                        </div>
                      )}
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
                          <button onClick={() => setDeleteId(p.id)} className="text-xs text-stone-300 hover:text-red-400 px-2 py-1">
                            Supprimer
                          </button>
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
