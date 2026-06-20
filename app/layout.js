import "./globals.css";

export const metadata = {
  title: "Maison SXM — Mobilier & Décoration",
  description:
    "Mobilier et décoration d'intérieur, esprit Caraïbes — livraison Saint-Martin et alentours.",
};

export default function RootLayout({ children }) {
  return (
    <html lang="fr">
      <body className="bg-white text-stone-900">{children}</body>
    </html>
  );
}
