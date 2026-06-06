import { getSupabase } from '../../../lib/supabase';
import PortfolioGallery from '@/components/PortfolioGallery';

export const metadata = {
  title: 'Portfolio — Our Work',
  description: 'See what TheBrandFriend has built. Real projects, real results. Strategy, Design, Development, Marketing — delivered in days, not months.',
  openGraph: {
    title: 'Portfolio — TheBrandFriend',
    description: 'Real projects. Real results. See our work.',
  },
};

// Revalidate every 60 seconds so CRM changes show up quickly
export const revalidate = 60;

async function getPortfolioItems() {
  try {
    const supabase = getSupabase();
    const { data, error } = await supabase
      .from('portfolio_items')
      .select('*')
      .eq('is_visible', true)
      .order('is_featured', { ascending: false })
      .order('display_order', { ascending: true })
      .order('created_at', { ascending: false });

    if (error) {
      console.error('[Portfolio] Supabase error:', error.message);
      return [];
    }

    return data || [];
  } catch (err) {
    console.error('[Portfolio] Failed to fetch:', err.message);
    return [];
  }
}

export default async function PortfolioPage() {
  const items = await getPortfolioItems();

  return <PortfolioGallery items={items} />;
}
