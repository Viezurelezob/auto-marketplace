export const formatPrice = (price, currency = 'RON') =>
  `${new Intl.NumberFormat('ro-RO').format(price)} ${currency}`;

export const formatMileage = (km) =>
  `${new Intl.NumberFormat('ro-RO').format(km)} km`;

export const formatDate = (dateStr) =>
  new Date(dateStr).toLocaleDateString('ro-RO', {
    day: 'numeric',
    month: 'long',
    year: 'numeric',
  });

export const BRANDS = [
  'Audi', 'BMW', 'Dacia', 'Ford', 'Honda', 'Hyundai', 'Kia',
  'Land Rover', 'Mazda', 'Mercedes-Benz', 'Nissan', 'Opel',
  'Peugeot', 'Porsche', 'Renault', 'Seat', 'Skoda', 'Suzuki',
  'Tesla', 'Toyota', 'Volkswagen', 'Volvo',
];

export const FUEL_TYPES = ['Benzina', 'Diesel', 'Electric', 'Hibrid', 'GPL', 'Hibrid Plug-in'];

export const TRANSMISSIONS = ['Manuala', 'Automata', 'Semi-automata'];

export const BODY_TYPES = ['Berlina', 'Break', 'SUV', 'Crossover', 'Coupe', 'Cabrio', 'Monovolum', 'Pickup', 'Van'];

export const COLORS = ['Alb', 'Negru', 'Gri', 'Argintiu', 'Albastru', 'Roșu', 'Verde', 'Maro', 'Bej', 'Portocaliu', 'Galben'];

export const CURRENT_YEAR = new Date().getFullYear();

export const DRIVE_TYPES = ['Față', 'Spate', '4x4'];

export const EMISSION_STANDARDS = ['Euro 3', 'Euro 4', 'Euro 5', 'Euro 6', 'Euro 6d'];

export const ORIGINS = ['România', 'Germania', 'Franța', 'Italia', 'Spania', 'Belgia', 'Olanda', 'Austria', 'Elveția', 'UK', 'Altele'];

export const DOORS_OPTIONS = [2, 3, 4, 5];
