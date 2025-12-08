export interface Title {
  id: string;
  title: string;
  type: 'movie' | 'series';
  thumbnail: string;
  banner?: string;
  year: number;
  rating: number;
  duration?: string;
  seasons?: number;
  genres: string[];
  synopsis: string;
  videoUrl?: string;
}

export interface Channel {
  id: string;
  name: string;
  logo: string;
  category: string;
}

export interface Program {
  id: string;
  channelId: string;
  title: string;
  time: string;
  duration: string;
}

export interface CommunityRequest {
  id: string;
  title: string;
  requestedBy: string;
  votes: number;
  status: 'pending' | 'approved' | 'rejected';
  date: string;
}

export interface Profile {
  id: string;
  name: string;
  avatar: string;
}

export const mockProfiles: Profile[] = [
  { id: '1', name: 'Juan', avatar: '👨' },
  { id: '2', name: 'María', avatar: '👩' },
  { id: '3', name: 'Pedro', avatar: '👦' },
  { id: '4', name: 'Ana', avatar: '👧' },
];

// 50 unique movie poster images from Unsplash
const MOVIE_IMAGES = [
  'https://images.unsplash.com/photo-1506905925346-21bda4d32df4',
  'https://images.unsplash.com/photo-1514306191717-452ec28c7814',
  'https://images.unsplash.com/photo-1526392060635-9d6019884377',
  'https://images.unsplash.com/photo-1489599849927-2ee91cede3ba',
  'https://images.unsplash.com/photo-1502680390469-be75c86b636f',
  'https://images.unsplash.com/photo-1516298773066-c48f8e9bd92b',
  'https://images.unsplash.com/photo-1536440136628-849c177e76a1',
  'https://images.unsplash.com/photo-1440404653325-ab127d49abc1',
  'https://images.unsplash.com/photo-1485846234645-a62644f84728',
  'https://images.unsplash.com/photo-1478720568477-152d9b164e26',
  'https://images.unsplash.com/photo-1517604931442-7e0c8ed2963c',
  'https://images.unsplash.com/photo-1594909122845-11baa439b7bf',
  'https://images.unsplash.com/photo-1535016120720-40c646be5580',
  'https://images.unsplash.com/photo-1574267432553-4b4628081c31',
  'https://images.unsplash.com/photo-1524712245354-2c4e5e7121c0',
  'https://images.unsplash.com/photo-1598899134739-24c46f58b8c0',
  'https://images.unsplash.com/photo-1595769816263-9b910be24d5f',
  'https://images.unsplash.com/photo-1626814026160-2237a95fc5a0',
  'https://images.unsplash.com/photo-1616530940355-351fabd9524b',
  'https://images.unsplash.com/photo-1585951237318-9ea5e175b891',
  'https://images.unsplash.com/photo-1560169897-fc0cdbdfa4d5',
  'https://images.unsplash.com/photo-1509347528160-9a9e33742cdb',
  'https://images.unsplash.com/photo-1542204165-65bf26472b9b',
  'https://images.unsplash.com/photo-1533928298208-27ff66555d8d',
  'https://images.unsplash.com/photo-1518676590629-3dcbd9c5a5c9',
  'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d',
  'https://images.unsplash.com/photo-1492691527719-9d1e07e534b4',
  'https://images.unsplash.com/photo-1518929458119-e5bf444c30f4',
  'https://images.unsplash.com/photo-1534447677768-be436bb09401',
  'https://images.unsplash.com/photo-1501854140801-50d01698950b',
  'https://images.unsplash.com/photo-1470071459604-3b5ec3a7fe05',
  'https://images.unsplash.com/photo-1469474968028-56623f02e42e',
  'https://images.unsplash.com/photo-1447752875215-b2761acb3c5d',
  'https://images.unsplash.com/photo-1433086966358-54859d0ed716',
  'https://images.unsplash.com/photo-1465146344425-f00d5f5c8f07',
  'https://images.unsplash.com/photo-1482938289607-e9573fc25ebb',
  'https://images.unsplash.com/photo-1509316975850-ff9c5deb0cd9',
  'https://images.unsplash.com/photo-1513836279014-a89f7a76ae86',
  'https://images.unsplash.com/photo-1518495973542-4542c06a5843',
  'https://images.unsplash.com/photo-1426604966848-d7adac402bff',
  'https://images.unsplash.com/photo-1500534314209-a25ddb2bd429',
  'https://images.unsplash.com/photo-1475924156734-496f6cac6ec1',
  'https://images.unsplash.com/photo-1470252649378-9c29740c9fa8',
  'https://images.unsplash.com/photo-1507525428034-b723cf961d3e',
  'https://images.unsplash.com/photo-1519046904884-53103b34b206',
  'https://images.unsplash.com/photo-1505142468610-359e7d316be0',
  'https://images.unsplash.com/photo-1559827260-dc66d52bef19',
  'https://images.unsplash.com/photo-1544551763-46a013bb70d5',
  'https://images.unsplash.com/photo-1518837695005-2083093ee35b',
  'https://images.unsplash.com/photo-1583244685026-d8519b5e3d21',
];

// 50 unique movie titles
const MOVIE_TITLES = [
  'El Secreto de la Montaña', 'Lima Nocturna', 'Amor en Cusco', 'La Herencia',
  'Surfistas del Pacífico', 'Misterios de la Selva', 'El Último Guerrero', 'Ciudad de Sombras',
  'Corazón Andino', 'Furia Salvaje', 'El Código Inca', 'Noches de Fuego',
  'La Conspiración', 'Viaje al Infinito', 'Destino Fatal', 'El Cazador',
  'Amanecer Rojo', 'La Fortaleza', 'Secretos Oscuros', 'El Elegido',
  'Tormenta de Arena', 'El Pacto', 'Más Allá del Horizonte', 'La Última Misión',
  'Eclipse Total', 'El Vengador', 'Camino de Sangre', 'La Profecía',
  'Frontera Perdida', 'El Despertar', 'Bajo la Luna', 'El Silencio',
  'Cazadores de Sueños', 'La Rebelión', 'Tierra Salvaje', 'El Protector',
  'Vuelo Nocturno', 'La Sombra del Pasado', 'Código Negro', 'El Rescate',
  'Mar de Fuego', 'La Traición', 'Operación Trueno', 'El Último Vuelo',
  'Sangre y Honor', 'La Venganza', 'Cielos Rojos', 'El Detective',
  'Misión Imposible', 'La Huida'
];

const GENRES_SET = [
  ['Drama', 'Aventura'], ['Thriller', 'Crimen'], ['Romance', 'Comedia'], ['Drama', 'Familia'],
  ['Deportes', 'Drama'], ['Aventura', 'Misterio'], ['Acción', 'Thriller'], ['Ciencia Ficción', 'Aventura'],
  ['Drama', 'Romance'], ['Acción', 'Drama'], ['Misterio', 'Thriller'], ['Comedia', 'Romance'],
  ['Thriller', 'Suspenso'], ['Ciencia Ficción', 'Acción'], ['Drama', 'Thriller'], ['Acción', 'Aventura'],
  ['Drama', 'Histórico'], ['Acción', 'Ciencia Ficción'], ['Thriller', 'Misterio'], ['Drama', 'Suspenso'],
  ['Aventura', 'Acción'], ['Misterio', 'Drama'], ['Ciencia Ficción', 'Drama'], ['Acción', 'Misterio'],
  ['Thriller', 'Drama'], ['Acción', 'Revenge'], ['Crimen', 'Drama'], ['Misterio', 'Sobrenatural'],
  ['Aventura', 'Drama'], ['Drama', 'Psicológico'], ['Terror', 'Suspenso'], ['Comedia', 'Aventura'],
  ['Romance', 'Drama'], ['Fantasía', 'Aventura'], ['Acción', 'Comedia'], ['Drama', 'Bélico'],
  ['Thriller', 'Acción'], ['Ciencia Ficción', 'Terror'], ['Aventura', 'Fantasía'], ['Drama', 'Musical'],
  ['Acción', 'Espías'], ['Comedia', 'Familiar'], ['Terror', 'Misterio'], ['Romance', 'Fantasía'],
  ['Thriller', 'Político'], ['Drama', 'Deportes'], ['Acción', 'Artes Marciales'], ['Comedia', 'Negra'],
  ['Aventura', 'Histórico'], ['Ciencia Ficción', 'Distopía']
];

// Seeded random for consistent but varied results
function seededRandom(seed: number): number {
  const x = Math.sin(seed * 9999) * 10000;
  return x - Math.floor(x);
}

// Generate unique movies for a category
export function generateMovies(count: number, categorySeed: string): Title[] {
  const baseSeed = categorySeed.split('').reduce((acc, char) => acc + char.charCodeAt(0), 0);
  const movies: Title[] = [];
  const usedIndices = new Set<number>();
  
  for (let i = 0; i < count; i++) {
    // Get unique image index
    let imageIndex = Math.floor(seededRandom(baseSeed + i * 7) * MOVIE_IMAGES.length);
    while (usedIndices.has(imageIndex) && usedIndices.size < MOVIE_IMAGES.length) {
      imageIndex = (imageIndex + 1) % MOVIE_IMAGES.length;
    }
    usedIndices.add(imageIndex);
    
    // Get title index with variation
    const titleIndex = Math.floor(seededRandom(baseSeed + i * 13) * MOVIE_TITLES.length);
    const genreIndex = Math.floor(seededRandom(baseSeed + i * 17) * GENRES_SET.length);
    
    const isSeries = seededRandom(baseSeed + i * 23) > 0.7;
    const year = 2020 + Math.floor(seededRandom(baseSeed + i * 29) * 5);
    const rating = Number((6.5 + seededRandom(baseSeed + i * 31) * 3).toFixed(1));
    
    movies.push({
      id: `${categorySeed}-${i}-${imageIndex}`,
      title: MOVIE_TITLES[titleIndex],
      type: isSeries ? 'series' : 'movie',
      thumbnail: MOVIE_IMAGES[imageIndex],
      banner: MOVIE_IMAGES[imageIndex],
      year,
      rating,
      duration: isSeries ? undefined : `${1 + Math.floor(seededRandom(baseSeed + i * 37) * 2)}h ${Math.floor(seededRandom(baseSeed + i * 41) * 50)}min`,
      seasons: isSeries ? 1 + Math.floor(seededRandom(baseSeed + i * 43) * 5) : undefined,
      genres: GENRES_SET[genreIndex],
      synopsis: `Una emocionante producción de ${year} que te llevará a vivir una experiencia única llena de ${GENRES_SET[genreIndex][0].toLowerCase()} y ${GENRES_SET[genreIndex][1].toLowerCase()}.`,
    });
  }
  
  return movies;
}

// Pre-generated category arrays with unique content
export const trendingMovies = generateMovies(30, 'trending');
export const recommendedMovies = generateMovies(30, 'recommended');
export const actionMovies = generateMovies(30, 'action');
export const dramaMovies = generateMovies(30, 'drama');
export const comedyMovies = generateMovies(30, 'comedy');

// Original mockTitles for compatibility
export const mockTitles: Title[] = generateMovies(30, 'general');

export const mockChannels: Channel[] = [
  { id: '1', name: 'Canal 1', logo: '📺', category: 'General' },
  { id: '2', name: 'Deportes TV', logo: '⚽', category: 'Deportes' },
  { id: '3', name: 'Películas 24/7', logo: '🎬', category: 'Entretenimiento' },
  { id: '4', name: 'Noticias Perú', logo: '📰', category: 'Noticias' },
  { id: '5', name: 'Kids Channel', logo: '🎨', category: 'Infantil' },
];

export const mockPrograms: Program[] = [
  { id: '1', channelId: '1', title: 'Noticias de la Mañana', time: '08:00', duration: '1h' },
  { id: '2', channelId: '1', title: 'Telenovela del Día', time: '14:00', duration: '1h' },
  { id: '3', channelId: '2', title: 'Fútbol Peruano', time: '15:00', duration: '2h' },
  { id: '4', channelId: '3', title: 'Estreno: Acción Total', time: '21:00', duration: '2h' },
  { id: '5', channelId: '4', title: 'Edición Central', time: '20:00', duration: '1h' },
];

export const mockCommunityRequests: CommunityRequest[] = [
  { id: '1', title: 'Breaking Bad', requestedBy: 'Carlos M.', votes: 245, status: 'pending', date: '2024-01-15' },
  { id: '2', title: 'Game of Thrones', requestedBy: 'Ana P.', votes: 189, status: 'approved', date: '2024-01-10' },
  { id: '3', title: 'The Crown', requestedBy: 'Luis R.', votes: 156, status: 'pending', date: '2024-01-20' },
  { id: '4', title: 'Narcos', requestedBy: 'María G.', votes: 98, status: 'pending', date: '2024-01-25' },
];

export const mockStats = {
  totalUsers: 45678,
  activeSubscriptions: 38901,
  totalContent: 1234,
  communityRequests: 156,
  avgSLA: 92.5,
  monthlyRevenue: 'S/ 1,234,567',
};

export const mockInvoices = [
  { id: '1', date: '2024-01-01', amount: 'S/ 29.90', status: 'Pagado' },
  { id: '2', date: '2023-12-01', amount: 'S/ 29.90', status: 'Pagado' },
  { id: '3', date: '2023-11-01', amount: 'S/ 29.90', status: 'Pagado' },
];

export interface Plan {
  id: string;
  name: string;
  price: string;
  features: string[];
  devices: number;
  quality: string;
}

export const mockPlans: Plan[] = [
  {
    id: 'basic',
    name: 'Básico',
    price: 'S/ 19.90',
    features: [
      'Catálogo completo',
      'Calidad HD (720p)',
      '1 dispositivo simultáneo',
      'Descargas limitadas',
    ],
    devices: 1,
    quality: 'HD',
  },
  {
    id: 'standard',
    name: 'Estándar',
    price: 'S/ 24.90',
    features: [
      'Catálogo completo',
      'Calidad Full HD (1080p)',
      '2 dispositivos simultáneos',
      'Descargas ilimitadas',
    ],
    devices: 2,
    quality: 'Full HD',
  },
  {
    id: 'premium',
    name: 'Premium',
    price: 'S/ 29.90',
    features: [
      'Catálogo completo',
      'Calidad 4K Ultra HD',
      '4 dispositivos simultáneos',
      'Descargas ilimitadas',
      'Audio espacial',
    ],
    devices: 4,
    quality: '4K',
  },
];

export const mockEPGDays = [
  { date: '2024-01-15', day: 'Lunes' },
  { date: '2024-01-16', day: 'Martes' },
  { date: '2024-01-17', day: 'Miércoles' },
  { date: '2024-01-18', day: 'Jueves' },
  { date: '2024-01-19', day: 'Viernes' },
  { date: '2024-01-20', day: 'Sábado' },
  { date: '2024-01-21', day: 'Domingo' },
];

export const mockUsers = [
  { id: '1', name: 'Juan Pérez', email: 'juan@example.com', plan: 'Premium', status: 'Activo', date: '2023-05-12' },
  { id: '2', name: 'María García', email: 'maria@example.com', plan: 'Estándar', status: 'Activo', date: '2023-06-20' },
  { id: '3', name: 'Carlos López', email: 'carlos@example.com', plan: 'Básico', status: 'Inactivo', date: '2023-03-15' },
  { id: '4', name: 'Ana Rodríguez', email: 'ana@example.com', plan: 'Premium', status: 'Activo', date: '2023-08-01' },
  { id: '5', name: 'Pedro Martínez', email: 'pedro@example.com', plan: 'Estándar', status: 'Activo', date: '2023-09-10' },
];