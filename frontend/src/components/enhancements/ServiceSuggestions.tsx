import { useState, useEffect } from 'react';
import { Lightbulb, Loader2, DollarSign, TrendingUp } from 'lucide-react';
import { fetchServiceCatalog } from '@/lib/api';

interface ServiceItem {
  id: string;
  name: string;
  description: string;
  price_range: string;
  difficulty: string;
}

export default function ServiceSuggestions() {
  const [catalog, setCatalog] = useState<ServiceItem[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchServiceCatalog()
      .then((data) => setCatalog(data))
      .catch(() => {
        // Fallback catalog
        setCatalog([
          { id: 'website_redesign', name: 'Website Redesign', description: 'Modern, responsive website design', price_range: '$1,500 - $10,000', difficulty: 'medium' },
          { id: 'seo_optimization', name: 'SEO Optimization', description: 'Search engine optimization to rank higher', price_range: '$500 - $3,000/mo', difficulty: 'medium' },
          { id: 'social_media_management', name: 'Social Media Management', description: 'Content creation and posting across platforms', price_range: '$300 - $2,000/mo', difficulty: 'easy' },
          { id: 'gbp_optimization', name: 'GBP Optimization', description: 'Google Business Profile setup and optimization', price_range: '$200 - $800', difficulty: 'easy' },
          { id: 'email_marketing', name: 'Email Marketing', description: 'Email campaigns and automation', price_range: '$300 - $1,500/mo', difficulty: 'easy' },
          { id: 'review_management', name: 'Review Management', description: 'Online reputation and review management', price_range: '$200 - $1,000/mo', difficulty: 'easy' },
          { id: 'content_creation', name: 'Content Creation', description: 'Blog posts, articles, and copy', price_range: '$500 - $3,000/mo', difficulty: 'medium' },
          { id: 'lead_generation', name: 'Lead Generation', description: 'Targeted lead generation campaigns', price_range: '$1,000 - $5,000/mo', difficulty: 'hard' },
          { id: 'ppc_advertising', name: 'PPC Advertising', description: 'Google Ads and social media ads', price_range: '$500 - $5,000/mo', difficulty: 'medium' },
          { id: 'brand_identity', name: 'Brand Identity', description: 'Logo, branding, and visual identity', price_range: '$1,000 - $5,000', difficulty: 'medium' },
          { id: 'video_marketing', name: 'Video Marketing', description: 'Video production and marketing', price_range: '$1,000 - $10,000', difficulty: 'hard' },
          { id: 'chatbot_setup', name: 'Chatbot Setup', description: 'AI chatbot for customer support', price_range: '$500 - $3,000', difficulty: 'medium' },
        ]);
      })
      .finally(() => setLoading(false));
  }, []);

  const difficultyColor = (d: string) => {
    if (d === 'easy') return 'text-emerald-400 bg-emerald-400/10 border-emerald-400/20';
    if (d === 'medium') return 'text-amber-400 bg-amber-400/10 border-amber-400/20';
    return 'text-red-400 bg-red-400/10 border-red-400/20';
  };

  return (
    <div className="flex-1 overflow-y-auto p-6 space-y-6">
      <div className="flex items-center gap-3">
        <div className="p-2.5 rounded-xl bg-amber-500/10 border border-amber-500/20">
          <Lightbulb className="w-6 h-6 text-amber-400" />
        </div>
        <div>
          <h2 className="text-xl font-bold text-text-primary">Service Suggestions</h2>
          <p className="text-sm text-text-muted">12 services you can pitch to your leads with pricing</p>
        </div>
      </div>

      <div className="bg-bg-card rounded-xl border border-border p-4">
        <p className="text-xs text-text-muted">
          <Lightbulb className="w-3 h-3 inline mr-1 text-amber-400" />
          Use these service suggestions when reaching out to leads. Each service includes recommended pricing and difficulty level.
          SnapLeads automatically suggests the best services for each lead based on their data.
        </p>
      </div>

      {loading ? (
        <div className="flex items-center justify-center py-20">
          <Loader2 className="w-6 h-6 animate-spin text-accent" />
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {catalog.map((service) => (
            <div key={service.id} className="bg-bg-card rounded-xl border border-border p-5 space-y-3 hover:border-accent/30 transition-colors">
              <div className="flex items-start justify-between">
                <h3 className="text-sm font-semibold text-text-primary">{service.name}</h3>
                <span className={`px-2 py-0.5 rounded-full text-[10px] font-medium border ${difficultyColor(service.difficulty)}`}>
                  {service.difficulty}
                </span>
              </div>
              <p className="text-xs text-text-muted leading-relaxed">{service.description}</p>
              <div className="flex items-center gap-2 pt-1">
                <DollarSign className="w-3.5 h-3.5 text-emerald-400" />
                <span className="text-xs font-medium text-emerald-400">{service.price_range}</span>
              </div>
              <div className="flex items-center gap-2">
                <TrendingUp className="w-3.5 h-3.5 text-accent" />
                <span className="text-xs text-text-muted">High demand service</span>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
