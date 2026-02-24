export const GA_ID = process.env.NEXT_PUBLIC_GA_ID || 'G-S5X3C2J8LV';

// log the pageview with the given URL
export const pageview = (url: string) => {
  if (typeof window !== 'undefined' && (window as any).gtag) {
    (window as any).gtag('config', GA_ID, {
      page_path: url,
    });
  }
};

// log specific events happening.
export const event = ({
  action,
  category,
  label,
  value,
}: {
  action: string;
  category: string;
  label: string;
  value?: string | number;
}) => {
  if (typeof window !== 'undefined' && (window as any).gtag) {
    (window as any).gtag('event', action, {
      event_category: category,
      event_label: label,
      value,
    });
  }
};
