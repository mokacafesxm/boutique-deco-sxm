-- 1. Créer la table produits
create table if not exists products (
  id uuid default gen_random_uuid() primary key,
  created_at timestamp with time zone default now(),
  nom text not null,
  nom_en text default '',
  description text default '',
  prix numeric not null default 0,
  reference text default '',
  categorie text not null,
  dimensions text default '',
  quantite integer default 0,
  image_url text default '',
  disponible boolean default true
);

-- 2. Désactiver RLS pour simplifier (à sécuriser plus tard si besoin)
alter table products disable row level security;

-- 3. Créer le bucket de stockage images
insert into storage.buckets (id, name, public)
values ('product-images', 'product-images', true)
on conflict (id) do nothing;

-- 4. Politique de stockage : accès public en lecture, écriture via service key
create policy "Public read" on storage.objects
  for select using (bucket_id = 'product-images');

create policy "Admin insert" on storage.objects
  for insert with check (bucket_id = 'product-images');

create policy "Admin update" on storage.objects
  for update using (bucket_id = 'product-images');

create policy "Admin delete" on storage.objects
  for delete using (bucket_id = 'product-images');

-- 5. Insérer les 43 produits de l'inventaire
insert into products (nom, prix, reference, categorie, dimensions, quantite, disponible) values
('LED Flower Table', 290, 'EFBT 010', 'Table LED', '78 x 95 x 71 cm', 1, true),
('Table LED ronde', 260, 'EFBT 740 A', 'Table LED', '65 x 61 x 64 cm', 4, true),
('Table LED basse', 240, 'EFBT 740 B', 'Table LED', '63 x 63 x 40 cm', 2, true),
('LED Flower Table grand format', 370, 'EFBT 033', 'Table LED', '100 x 73 x 77.5 cm', 1, true),
('Table LED ronde', 160, 'EFBT 686', 'Table LED', 'Ø68 x H41 cm', 0, true),
('Colonne carrée LED', 140, 'EFBT 451', 'Colonne LED', '30 x 30 x 115 cm', 2, true),
('Table LED basse', 240, 'EFBT 254', 'Table LED', '63 x 40 cm', 2, true),
('Cube LED siège ou table (S)', 75, 'EFIC 002 A', 'Cube LED', '30 x 30 x 30 cm', 4, true),
('Cube LED siège ou table (M)', 90, 'EFIC 002 B', 'Cube LED', '40 x 40 x 40 cm', 4, true),
('Siège rond LED', 140, 'EFCS 586', 'Siège LED', '65 x 50 cm', 0, true),
('LED Lounge Chair', 220, 'EFCS 019', 'Siège LED', '61 x 61 x 81 cm', 0, true),
('Siège LED', 150, 'EFCS 565', 'Siège LED', '56 x 56 x 63 cm', 2, true),
('LED Lounge Chair', 220, 'EFCS 527', 'Siège LED', '52 x 72 x 80 cm', 16, true),
('Siège LED', 160, 'EFCS 686', 'Siège LED', '40 x 73 cm', 4, true),
('Siège LED', 165, 'EFCS 505', 'Siège LED', '50 x 56 x 80 cm', 0, true),
('Boule LED', 65, 'EFB 005', 'Déco LED', '40 x 40 x 40 cm', 4, true),
('Déco arbre de Noël LED (L)', 105, 'EFL 033 A', 'Déco LED', '50 x 15 x 84 cm', 2, true),
('Déco arbre de Noël LED (S)', 80, 'EFL 033 B', 'Déco LED', '29 x 16 x 42 cm', 2, true),
('Étagère ou seau à bières LED', 110, 'EFIB 05', 'Bar LED', '40 x 40 x 40 cm', 5, true),
('Seau à bouteille LED (XL)', 180, 'EFIB 006 A', 'Bar LED', 'Ø38 x 115 cm', 4, true),
('Seau à bouteille LED (L)', 160, 'EFIB 006 B', 'Bar LED', 'Ø38 x 80 cm', 3, true),
('Seau à bouteille LED (M)', 140, 'EFIB 006 C', 'Bar LED', 'Ø50 x 75 cm', 3, true),
('Seau à champagne LED', 75, 'EFIB 003 F', 'Bar LED', '29 x 30 cm', 0, true),
('Seau à bouteille LED (S)', 105, 'EFIB 0901', 'Bar LED', 'Ø40 x 26 cm', 2, true),
('Cache-pot conique LED', 160, 'EFFP 020', 'Pot LED', '40 x 92 cm', 0, true),
('Cache-pot LED (S)', 100, 'EFFP 019 A', 'Pot LED', '30 x 30 x 60 cm', 0, true),
('Cache-pot LED (M)', 220, 'EFFP 019 B', 'Pot LED', '40 x 40 x 65 cm', 2, true),
('Module canapé gauche 2 places', 650, '1456-03', 'Salon extérieur', '', 1, true),
('Module canapé droit 2 places', 650, '1456-03', 'Salon extérieur', '', 1, true),
('Single sofa', 300, '1456-03', 'Salon extérieur', '', 3, true),
('Coffee table', 430, '1456-03', 'Table basse extérieure', '', 4, true),
('Ensemble canapé L + table basse', 1915, '1456-5', 'Salon extérieur', '', 1, true),
('Chaise longue + table basse', 435, 'LS 6001', 'Salon extérieur', '', 1, true),
('Canapés + table basse', 2060, 'BS 815', 'Salon extérieur', '', 3, true),
('Sunbed', 1215, '1736', 'Transат extérieur', '', 1, true),
('Table 10 places', 695, 'LS80007B', 'Table extérieure', '', 1, true),
('Chaise pour table 10 places', 60, 'LS80007B', 'Chaise extérieure', '', 20, true),
('Ensemble table ronde + 4 chaises', 1255, '8006', 'Table extérieure', '', 1, true),
('Pot PVC (XL)', 70, 'YF-20/1230 A', 'Pot extérieur', '', 1, true),
('Pot PVC (L)', 50, 'YF-20/1230 B', 'Pot extérieur', '', 1, true),
('Pot PVC (M)', 35, 'YF-20/1230 C', 'Pot extérieur', '', 1, true),
('Pot PVC (S)', 25, 'YF-20/1230 D', 'Pot extérieur', '', 1, true),
('Coffee Table', 120, 'YB 010151', 'Table basse extérieure', '', 4, true);
