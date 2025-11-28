import { Helmet } from 'react-helmet-async';

const SEO = ({
  title = "MaxiMarket - Marketplace N°1 en Afrique de l'Ouest",
  description = "MaxiMarket, la plateforme marketplace leader en Afrique de l'Ouest. Achetez, vendez et louez immobilier, automobiles, services au Bénin, Sénégal, Togo, Côte d'Ivoire.",
  keywords = "marketplace afrique ouest, immobilier bénin, voiture sénégal, services togo, annonces côte ivoire",
  image = "https://maxiimarket.com/og-image.png",
  url = "https://maxiimarket.com",
  type = "website",
  author = "MaxiMarket",
  publishedTime,
  modifiedTime,
  canonical
}) => {
  const fullTitle = title.includes('MaxiMarket') ? title : `${title} | MaxiMarket`;
  const canonicalUrl = canonical || url;

  return (
    <Helmet>
      {/* Basic Meta Tags */}
      <title>{fullTitle}</title>
      <meta name="description" content={description} />
      <meta name="keywords" content={keywords} />
      <meta name="author" content={author} />
      <link rel="canonical" href={canonicalUrl} />

      {/* Open Graph */}
      <meta property="og:type" content={type} />
      <meta property="og:title" content={fullTitle} />
      <meta property="og:description" content={description} />
      <meta property="og:image" content={image} />
      <meta property="og:url" content={url} />
      <meta property="og:site_name" content="MaxiMarket" />
      <meta property="og:locale" content="fr_FR" />
      
      {publishedTime && <meta property="article:published_time" content={publishedTime} />}
      {modifiedTime && <meta property="article:modified_time" content={modifiedTime} />}

      {/* Twitter Card */}
      <meta name="twitter:card" content="summary_large_image" />
      <meta name="twitter:title" content={fullTitle} />
      <meta name="twitter:description" content={description} />
      <meta name="twitter:image" content={image} />
      <meta name="twitter:url" content={url} />

      {/* Additional SEO */}
      <meta name="robots" content="index, follow, max-image-preview:large" />
    </Helmet>
  );
};

export default SEO;
