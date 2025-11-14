import React, { createContext, useContext, useEffect, useState } from 'react';
import { Helmet } from 'react-helmet-async';

interface SEOSettings {
  page_type: string;
  entity_id?: number;
  meta_title: string;
  meta_description: string;
  meta_keywords: string;
  og_title: string;
  og_description: string;
  og_image: string;
  canonical_url: string;
  structured_data: any;
  breadcrumbs: any[];
}

interface SEOContextType {
  seoData: SEOSettings | null;
  loading: boolean;
  error: string | null;
  updateSEOData: (data: Partial<SEOSettings>) => void;
  loadSEOData: (pageType: string, entityId?: number) => Promise<void>;
  generateStructuredData: (pageType: string, entityId: number, data: any) => Promise<void>;
  validateMetaTags: (title: string, description: string, keywords: string) => Promise<any>;
}

const SEOContext = createContext<SEOContextType | undefined>(undefined);

export const useSEO = () => {
  const context = useContext(SEOContext);
  if (context === undefined) {
    throw new Error('useSEO must be used within a SEOProvider');
  }
  return context;
};

interface SEOProviderProps {
  children: React.ReactNode;
  defaultTitle?: string;
  defaultDescription?: string;
  defaultImage?: string;
}

export const SEOProvider: React.FC<SEOProviderProps> = ({
  children,
  defaultTitle = 'Gürbüz Oyuncak - Kaliteli Oyuncaklar',
  defaultDescription = 'Gürbüz Oyuncak olarak en kaliteli ve güvenli oyuncakları sizlere sunuyoruz. Çocuğunuz için en uygun oyuncakları keşfedin.',
  defaultImage = '/images/og-default.jpg'
}) => {
  const [seoData, setSeoData] = useState<SEOSettings | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [defaultMeta] = useState({
    title: defaultTitle,
    description: defaultDescription,
    image: defaultImage
  });

  const loadSEOData = async (pageType: string, entityId?: number) => {
    setLoading(true);
    setError(null);

    try {
      const response = await fetch(`${import.meta.env.VITE_SUPABASE_URL}/functions/v1/seo-optimizer?action=get`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${import.meta.env.VITE_SUPABASE_ANON_KEY}`
        },
        body: JSON.stringify({ page_type: pageType, entity_id: entityId })
      });

      if (!response.ok) {
        throw new Error('SEO data yüklenemedi');
      }

      const result = await response.json();
      setSeoData(result.seo_data);

      // Set default meta tags if no custom SEO data
      if (!result.seo_data || result.generated) {
        setSeoData({
          page_type: pageType,
          entity_id: entityId,
          meta_title: defaultMeta.title,
          meta_description: defaultMeta.description,
          meta_keywords: 'oyuncak, çocuk, bebek, hediye',
          og_title: defaultMeta.title,
          og_description: defaultMeta.description,
          og_image: defaultMeta.image,
          canonical_url: window.location.href,
          structured_data: {},
          breadcrumbs: []
        });
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'SEO data yüklenirken hata oluştu');
      // Set default data on error
      setSeoData({
        page_type: pageType,
        entity_id: entityId,
        meta_title: defaultMeta.title,
        meta_description: defaultMeta.description,
        meta_keywords: 'oyuncak, çocuk, bebek, hediye',
        og_title: defaultMeta.title,
        og_description: defaultMeta.description,
        og_image: defaultMeta.image,
        canonical_url: window.location.href,
        structured_data: {},
        breadcrumbs: []
      });
    } finally {
      setLoading(false);
    }
  };

  const updateSEOData = (data: Partial<SEOSettings>) => {
    if (seoData) {
      setSeoData({ ...seoData, ...data });
    }
  };

  const generateStructuredData = async (pageType: string, entityId: number, data: any) => {
    try {
      const response = await fetch(`${import.meta.env.VITE_SUPABASE_URL}/functions/v1/seo-optimizer?action=generate-structured-data`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${import.meta.env.VITE_SUPABASE_ANON_KEY}`
        },
        body: JSON.stringify({ page_type: pageType, entity_id: entityId, data })
      });

      if (!response.ok) {
        throw new Error('Structured data oluşturulamadı');
      }

      const result = await response.json();
      
      if (seoData) {
        setSeoData({
          ...seoData,
          structured_data: result.structured_data,
          breadcrumbs: result.breadcrumbs
        });
      }
    } catch (err) {
      console.error('Structured data generation error:', err);
    }
  };

  const validateMetaTags = async (title: string, description: string, keywords: string) => {
    try {
      const response = await fetch(`${import.meta.env.VITE_SUPABASE_URL}/functions/v1/seo-optimizer?action=validate-meta`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${import.meta.env.VITE_SUPABASE_ANON_KEY}`
        },
        body: JSON.stringify({ title, description, keywords })
      });

      if (!response.ok) {
        throw new Error('Meta tag validation failed');
      }

      return await response.json();
    } catch (err) {
      console.error('Meta tag validation error:', err);
      return null;
    }
  };

  const value = {
    seoData,
    loading,
    error,
    updateSEOData,
    loadSEOData,
    generateStructuredData,
    validateMetaTags
  };

  return (
    <SEOContext.Provider value={value}>
      {children}
      {seoData && (
        <Helmet>
          {/* Basic Meta Tags */}
          <title>{seoData.meta_title}</title>
          <meta name="description" content={seoData.meta_description} />
          <meta name="keywords" content={seoData.meta_keywords} />
          <link rel="canonical" href={seoData.canonical_url} />
          <meta name="robots" content="index, follow" />
          <meta name="viewport" content="width=device-width, initial-scale=1.0" />
          <meta name="language" content="Turkish" />
          <meta name="revisit-after" content="7 days" />
          <meta name="author" content="Gürbüz Oyuncak" />
          
          {/* Open Graph Tags */}
          <meta property="og:type" content="website" />
          <meta property="og:title" content={seoData.og_title || seoData.meta_title} />
          <meta property="og:description" content={seoData.og_description || seoData.meta_description} />
          <meta property="og:image" content={seoData.og_image} />
          <meta property="og:url" content={seoData.canonical_url} />
          <meta property="og:site_name" content="Gürbüz Oyuncak" />
          <meta property="og:locale" content="tr_TR" />
          
          {/* Twitter Card Tags */}
          <meta name="twitter:card" content="summary_large_image" />
          <meta name="twitter:title" content={seoData.og_title || seoData.meta_title} />
          <meta name="twitter:description" content={seoData.og_description || seoData.meta_description} />
          <meta name="twitter:image" content={seoData.og_image} />
          <meta name="twitter:site" content="@gurbuzoyuncak" />
          
          {/* Structured Data */}
          {seoData.structured_data && (
            <script type="application/ld+json">
              {JSON.stringify(seoData.structured_data)}
            </script>
          )}
          
          {/* Breadcrumb Structured Data */}
          {seoData.breadcrumbs && seoData.breadcrumbs.length > 0 && (
            <script type="application/ld+json">
              {JSON.stringify({
                "@context": "https://schema.org",
                "@type": "BreadcrumbList",
                "itemListElement": seoData.breadcrumbs
              })}
            </script>
          )}
          
          {/* Performance and Security Headers */}
          <meta httpEquiv="X-Content-Type-Options" content="nosniff" />
          <meta httpEquiv="X-Frame-Options" content="DENY" />
          <meta httpEquiv="X-XSS-Protection" content="1; mode=block" />
          <meta name="referrer" content="strict-origin-when-cross-origin" />
        </Helmet>
      )}
    </SEOContext.Provider>
  );
};