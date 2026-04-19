import React, { createContext, useContext, useState, ReactNode } from 'react';

type Language = 'en' | 'km';

interface LanguageContextType {
  language: Language;
  setLanguage: (lang: Language) => void;
  t: (key: string) => string;
}

const translations: Record<Language, Record<string, string>> = {
  en: {
    'nav.home': 'Home',
    'nav.device': 'Device',
    'nav.gaming_pc': 'Gaming PC',
    'nav.accessories': 'Accessories',
    'nav.blog': 'Blog',
    'nav.contact': 'Contact',
    'hero.promo': 'New Arrival • 20% OFF',
    'hero.title': 'Level Up Your Gaming Experience',
    'hero.subtitle': 'Your one-stop shop for controllers, accessories, and performance gear in Phnom Penh.',
    'hero.shop_now': 'SHOP NOW',
    'hero.view_offers': 'VIEW OFFERS',
    'hero.hardware': 'Premium Hardware',
    'grid.featured': 'Featured Gear',
    'grid.featured_sub': 'Our handpicked selection of top-performing gaming peripherals.',
    'grid.accessories': 'Gaming Accessories',
    'grid.accessories_sub': 'Upgrade your setup with our latest controllers and tools.',
    'grid.view_all': 'View All Products',
    'blog.title': 'Reviews & News',
    'blog.published': 'Published',
    'blog.days_ago': 'days ago',
    'blog.recently': 'Recently',
    'cta.title': 'Ready to upgrade your battle station?',
    'cta.subtitle': 'Visit us in Phnom Penh or order online. We provide expert advice for all your technical needs and gaming ambitions.',
    'cta.visit': 'Visit Store',
    'cta.telegram': 'Chat on Telegram',
    'footer.performance': 'PERFORMANCE GAMING',
    'search.placeholder': 'Search products...',
    'cart.title': 'Shopping Cart',
  },
  km: {
    'nav.home': 'ទំព័រដើម',
    'nav.device': 'ឧបករណ៍',
    'nav.gaming_pc': 'កុំព្យូទ័រហ្គេម',
    'nav.accessories': 'គ្រឿងបន្លាស់',
    'nav.blog': 'ប្លុក',
    'nav.contact': 'ទំនាក់ទំនង',
    'hero.promo': 'មកដល់ថ្មី • បញ្ចុះតម្លៃ ២០%',
    'hero.title': 'បង្កើនបទពិសោធន៍លេងហ្គេមរបស់អ្នក',
    'hero.subtitle': 'ហាងលក់ឧបករណ៍បញ្ជា គ្រឿងបន្លាស់ និងឧបករណ៍ដែលមានប្រសិទ្ធភាពខ្ពស់របស់អ្នកនៅភ្នំពេញ។',
    'hero.shop_now': 'ទិញឥឡូវនេះ',
    'hero.view_offers': 'មើលការផ្តល់ជូន',
    'hero.hardware': 'គ្រឿងរឹងកម្រិតខ្ពស់',
    'grid.featured': 'គ្រឿងបរិក្ខារលេចធ្លោ',
    'grid.featured_sub': 'ជម្រើសដែលត្រូវបានជ្រើសរើសយ៉ាងសម្រិតសម្រាំងនូវគ្រឿងបន្លាស់ហ្គេមដែលមានប្រសិទ្ធភាពខ្ពស់បំផុត។',
    'grid.accessories': 'គ្រឿងបន្លាស់ហ្គេម',
    'grid.accessories_sub': 'ធ្វើឱ្យការរៀបចំរបស់អ្នកកាន់តែប្រសើរឡើងជាមួយនឹងឧបករណ៍បញ្ជា និងឧបករណ៍ចុងក្រោយបំផុតរបស់យើង។',
    'grid.view_all': 'មើលផលិតផលទាំងអស់',
    'blog.title': 'ការពិនិត្យឡើងវិញ និងព័ត៌មាន',
    'blog.published': 'ចេញផ្សាយ',
    'blog.days_ago': 'ថ្ងៃមុន',
    'blog.recently': 'ថ្មីៗនេះ',
    'cta.title': 'រួចរាល់ក្នុងការតម្លើងកន្លែងលេងហ្គេមរបស់អ្នកហើយឬនៅ?',
    'cta.subtitle': 'អញ្ជើញមកកាន់ហាងរបស់យើងនៅភ្នំពេញ ឬកម្ម៉ង់តាមអ៊ីនធឺណិត។ យើងផ្តល់ដំបូន្មានអ្នកជំនាញសម្រាប់រាល់តម្រូវការបច្ចេកទេសរបស់អ្នក។',
    'cta.visit': 'មកកាន់ហាង',
    'cta.telegram': 'ជជែកតាមតេឡេក្រាម',
    'footer.performance': 'ការលេងហ្គេមប្រកបដោយប្រសិទ្ធភាព',
    'search.placeholder': 'ស្វែងរកផលិតផល...',
    'cart.title': 'រទេះទិញទំនិញ',
  }
};

const LanguageContext = createContext<LanguageContextType | undefined>(undefined);

export const LanguageProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [language, setLanguage] = useState<Language>('km');

  const t = (key: string) => {
    return translations[language][key] || key;
  };

  return (
    <LanguageContext.Provider value={{ language, setLanguage, t }}>
      {children}
    </LanguageContext.Provider>
  );
};

export const useLanguage = () => {
  const context = useContext(LanguageContext);
  if (context === undefined) {
    throw new Error('useLanguage must be used within a LanguageProvider');
  }
  return context;
};
