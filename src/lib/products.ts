export interface CoffeeProduct {
  id: string;
  name: string;
  title: string;
  subtitle: string;
  price: number; // in UAH
  originalPrice?: number; // in UAH
  amountKopecks: number; // in kopecks for PayMock
  weight: string;
  roast: string;
  blend: string;
  image: string;
  accentColor: string;
  buttonBg: string;
  description: string;
  flavorNotes: string[];
}

export const PRODUCTS: Record<string, CoffeeProduct> = {
  'kava-and-go-classic': {
    id: 'kava-and-go-classic',
    name: 'KAVA & GO CLASSIC',
    title: 'Kava & Go Classic 100% Arabica',
    subtitle: '100% Арабіка • Середнє обсмаження • Знижка 15%',
    price: 275,
    originalPrice: 320,
    amountKopecks: 27500,
    weight: '250 г',
    roast: 'Medium',
    blend: '100% Арабіка',
    image: '/images/1st-image.png',
    accentColor: '#8A4B29',
    buttonBg: '#8A4B29',
    description: 'Добірні зерна 100% арабіки дбайливого середнього обсмажування. Глибокий оксамитовий смак з нотами шоколаду та ніжним карамельним посмаком.',
    flavorNotes: ['Шоколад', 'Карамель', 'Горіховий посмак']
  },
  'kava-and-go-hazelnut': {
    id: 'kava-and-go-hazelnut',
    name: 'KAVA & GO HAZELNUT',
    title: 'Kava & Go Hazelnut Arabica',
    subtitle: 'Натуральний фундук • Середнє обсмаження • Знижка 15%',
    price: 290,
    originalPrice: 340,
    amountKopecks: 29000,
    weight: '250 г',
    roast: 'Medium',
    blend: 'Арабіка з фундуком',
    image: '/images/2nd-image.png',
    accentColor: '#4B6144',
    buttonBg: '#4B6144',
    description: 'Вишукана арабіка з багатим теплим ароматом смаженого фундука. Ідеальний вибір для неспішного ранку або заряджаючої кава-паузи.',
    flavorNotes: ['Смажений фундук', 'Прянощі', 'Вершковий баланс']
  }
};
