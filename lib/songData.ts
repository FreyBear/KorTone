import type { Song } from '@/lib/types';
import sangerLibrary from '../data/sanger-library.json';

// Use imported song library as fallback, cast to Song[] since JSON loses type info
export const fallbackSongs: Song[] = sangerLibrary.songs as Song[];
