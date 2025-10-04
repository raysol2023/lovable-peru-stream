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

export const mockTitles: Title[] = [
  {
    id: '1',
    title: 'El Secreto de la Montaña',
    type: 'movie',
    thumbnail: 'https://images.unsplash.com/photo-1506905925346-21bda4d32df4',
    banner: 'https://images.unsplash.com/photo-1506905925346-21bda4d32df4',
    year: 2024,
    rating: 8.5,
    duration: '2h 15min',
    genres: ['Drama', 'Aventura'],
    synopsis: 'Una emocionante historia sobre un grupo de exploradores que descubren un misterio ancestral en los Andes peruanos.',
  },
  {
    id: '2',
    title: 'Lima Nocturna',
    type: 'series',
    thumbnail: 'https://images.unsplash.com/photo-1514306191717-452ec28c7814',
    banner: 'https://images.unsplash.com/photo-1514306191717-452ec28c7814',
    year: 2023,
    rating: 9.2,
    seasons: 2,
    genres: ['Thriller', 'Crimen'],
    synopsis: 'Un detective de la policía de Lima investiga una serie de crímenes que amenazan con destruir la ciudad.',
  },
  {
    id: '3',
    title: 'Amor en Cusco',
    type: 'movie',
    thumbnail: 'https://images.unsplash.com/photo-1526392060635-9d6019884377',
    banner: 'https://images.unsplash.com/photo-1526392060635-9d6019884377',
    year: 2024,
    rating: 7.8,
    duration: '1h 50min',
    genres: ['Romance', 'Comedia'],
    synopsis: 'Dos turistas de mundos completamente diferentes se enamoran durante un viaje mágico a Machu Picchu.',
  },
  {
    id: '4',
    title: 'La Herencia',
    type: 'series',
    thumbnail: 'https://images.unsplash.com/photo-1489599849927-2ee91cede3ba',
    banner: 'https://images.unsplash.com/photo-1489599849927-2ee91cede3ba',
    year: 2023,
    rating: 8.9,
    seasons: 3,
    genres: ['Drama', 'Familia'],
    synopsis: 'Una familia peruana lucha por mantener unido su legado mientras enfrentan secretos del pasado.',
  },
  {
    id: '5',
    title: 'Surfistas del Pacífico',
    type: 'movie',
    thumbnail: 'https://images.unsplash.com/photo-1502680390469-be75c86b636f',
    banner: 'https://images.unsplash.com/photo-1502680390469-be75c86b636f',
    year: 2024,
    rating: 7.5,
    duration: '1h 40min',
    genres: ['Deportes', 'Drama'],
    synopsis: 'Jóvenes surfistas de la costa peruana compiten por convertirse en los mejores del continente.',
  },
  {
    id: '6',
    title: 'Misterios de la Selva',
    type: 'series',
    thumbnail: 'https://images.unsplash.com/photo-1516298773066-c48f8e9bd92b',
    banner: 'https://images.unsplash.com/photo-1516298773066-c48f8e9bd92b',
    year: 2024,
    rating: 8.3,
    seasons: 1,
    genres: ['Aventura', 'Misterio'],
    synopsis: 'Un equipo de científicos descubre especies desconocidas y fenómenos inexplicables en la Amazonía peruana.',
  },
];

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
