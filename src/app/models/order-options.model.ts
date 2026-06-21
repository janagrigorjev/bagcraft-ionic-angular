export interface PriceOption {
  id: string;
  label: string;
  price: number;
}

export const BAG_MODELS: PriceOption[] = [

  { id: 'classic', label: 'Klasična torbica', price: 5000 },
  { id: 'evening', label: 'Elegantna večernja torbica', price: 6000 },
  { id: 'heart', label: 'Torbica u obliku srca', price: 7000 }
];

export const MATERIALS: PriceOption[] = [
  { id: 'glassBeads', label: 'Staklene perle', price: 900 },
  { id: 'acrylicBeads', label: 'Akrilne perle', price: 500 },
  { id: 'crystals', label: 'Kristali / cirkoni', price: 1200 },
  { id: 'satinRibbon', label: 'Satenska traka', price: 800 },
  { id: 'pearls', label: 'Biseri', price: 700 }
];

export const SIZES: PriceOption[] = [
  { id: 'small', label: 'Mala', price: 0 },
  { id: 'medium', label: 'Srednja', price: 500 },
  { id: 'large', label: 'Velika', price: 900 }
];

export const HANDLES: PriceOption[] = [
  { id: 'beadHandle', label: 'Ručka od perli', price: 400 },
  { id: 'chain', label: 'Metalni lanac', price: 700 },
  { id: 'longStrap', label: 'Dugi kaiš', price: 600 },
  { id: 'pearlHandle', label: 'Ručka od bisera', price: 400 }
];

export const ADDONS: PriceOption[] = [
  { id: 'rhinestones', label: 'Dodatni cirkoni', price: 700 },
  { id: 'pearls', label: 'Biseri', price: 500 },
  { id: 'bow', label: 'Mašna', price: 400 },
  { id: 'customName', label: 'Personalizovani natpis', price: 300 },
  { id: 'heartCharm', label: 'Privezak srce', price: 350 }
];

export const COLORS = ['Bela', 'Crna', 'Srebrna', 'Zlatna', 'Roze', 'Svetlo plava', 'Svetlo ljubičasta', 'Roze', 'Crvena', 'Tamno plava', 'Narandžasta', 'Po izboru'];

export const STATUS_LABELS: Record<string, string> = {
  sent: 'Poslata',
  accepted: 'Prihvaćena',
  inProgress: 'U izradi',
  ready: 'Spremna',
  finished: 'Završena',
  cancelled: 'Otkazana'
};
