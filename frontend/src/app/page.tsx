// frontend/src/app/page.tsx
import { HomePage } from '@/views/home';
import { API_BASE_URL } from '@/shared/config';
import type { Concert } from '@/entities/concert';

async function getFeaturedConcerts(): Promise<Concert[]> {
  try {
    const res = await fetch(`${API_BASE_URL}/api/v1/concerts?limit=3`, {
      next: { revalidate: 60 }, // Revalidate every minute
    });
    
    if (!res.ok) {
      return [];
    }
    
    const data = await res.json();
    return data.data.data || [];
  } catch (error) {
    console.error('Failed to fetch initial concerts:', error);
    return [];
  }
}

export default async function Page() {
  const initialConcerts = await getFeaturedConcerts();
  return <HomePage initialConcerts={initialConcerts} />;
}
