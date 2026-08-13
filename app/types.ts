/**
 * Landing-page feature card props (used by app/page.tsx).
 */
export interface FeatureCardProps {
    page: string;
    icon: React.ReactNode;
    title: string;
    description: string;
    hover_bg: string;
    hover_border: string;
}