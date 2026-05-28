import { motion, AnimatePresence } from 'motion/react';
import React, { useState, useMemo } from 'react';
import { 
  Calendar, 
  User, 
  ArrowRight, 
  Video, 
  FileText, 
  Search, 
  ArrowLeft, 
  Clock, 
  ThumbsUp, 
  Share2, 
  Play, 
  Eye, 
  Compass, 
  Bookmark,
  Sparkles,
  ChevronRight,
  Heart
} from 'lucide-react';
import { useAuthOrder } from '../contexts/AuthOrderContext';
import { useLanguage } from '../contexts/LanguageContext';
import { BlogPost } from '../types';

// Rich, expert content database for pre-seeded articles to give the user a high-end editorial reading feel
const ARTICLE_DETAILS: Record<string, { readTime: string; likes: number; views: number; text: { en: string[]; km: string[] } }> = {
  '3': {
    readTime: '6 min read',
    likes: 124,
    views: 480,
    text: {
      en: [
        "The hand-held console gaming device 'One x Player 2' delivers desktop performance in your hand. Known for its gorgeous 8.4-inch display, computing speeds, and modular control, it has shaken up the mobile PC ecosystem in Cambodia.",
        "## Revolutionary 3-in-1 Design",
        "At the core of the One x Player 2 is its modularity. Drawing inspiration from the versatility of the Nintendo Switch, the console features dual controllers that detach smoothly from the main screen. This lets you play in Handheld mode (as an integrated device), Console mode (sitting back with controllers connected to an adapter while the screen is on a desk kickstand), or Laptop mode by connecting an ultra-thin magnetic keyboard.",
        "## Performance Under the Hood",
        "Fitted with the AMD Ryzen 7 6800U or 7840U processor and Radeon graphics, this machine easily handles modern high-end gaming (AAA titles) like Elden Ring, Cyberpunk 2077, and GTA V at respectable frame rates. Paired with up to 32GB of LPDDR5X RAM, loading screen delays are nearly nonexistent, transforming your daily commute into a high-octane gaming arena.",
        "## Display and Sensory Delight",
        "The display is an eye-opening 8.4-inch IPS touchscreen with 2560 x 1600 resolution (2.5K). Color accuracy is spectacular, with deep blacks and rich neon highlights. Action-packed combat flows smoothly with satisfying audio delivered from the dual Harman-tuned stereo front speakers.",
        "## Why is the price rising in Phnom Penh?",
        "Gamers have noticed pricing shifts on local shelves. Due to global semiconductor adjustments, massive shipping costs, and high demands for portable gaming devices, retail pricing for newly imported units has steadily climbed. Despite the price bump, local enthusiasts agree that the sheer performance capability and multi-purpose office utility offer a value structure that's hard to beat."
      ],
      km: [
        "One x Player 2 គឺជានិមិត្តរូបនៃឧបករណ៍លេងហ្គេម handheld PC កម្រិតកំពូលដែលផ្ដល់នូវថាមពលខ្លាំង និងភាពងាយស្រួលក្នុងការយកតាមខ្លួន។ បំពាក់ដោយបន្ទះឈីប AMD Ryzen ល្បឿនលឿន និងរូបរាងដ៏រឹងមាំ វាបានបង្កការចាប់អារម្មណ៍ខ្លាំងសម្រាប់អ្នកលេងហ្គេមនៅកម្ពុជា។",
        "## ការរចនា 3-in-1 ប្លែកពីគេបំផុត (Modern Modular Layout)",
        "លក្ខណៈពិសេសចម្បងរបស់ One x Player 2 គឺឧបករណ៍បញ្ជា (controllers) ដែលអាចដកចេញបាន ស្រដៀងទៅនឹង Nintendo Switch ដែរ។ ការរចនានេះអនុញ្ញាតឱ្យអ្នកលេងហ្គេមក្នុងរបៀបច្រើនយ៉ាង៖ របៀបលេងផ្ទាល់ដោយដៃ របៀបលេងតម្កល់លើតុ និងរបៀបប្រើប្រាស់ជាកុំព្យូទ័រយួរដៃខ្នាតតូចដោយគ្រាន់តែភ្ជាប់ក្តារចុចម៉ាញេទិកស្តើង។",
        "## កម្លាំងម៉ាស៊ីនលំដាប់កំពូល (Extreme Performance)",
        "បំពាក់ដោយបន្ទះឈីប AMD Ryzen 7 6800U ឬ 7840U និងសហការជាមួយក្រាហ្វិកកាត Radeon វាអាចដំណើរការហ្គេមធំៗលំដាប់ AAA ដូចជា Cyberpunk 2077 ឬ Elden Ring បានយ៉ាងរលូន។ បន្ថែមដោយរ៉េមប្រភេទ LPDDR5X ទំហំធំ ការផ្លាស់ប្ដូរអេក្រង់លេងគឺលឿនរហ័សគ្មានការរអាក់រអួលឡើយ។",
        "## អេក្រង់ធំច្បាស់រកលេខដាក់គ្មាន (Gorgeous Display & Fine Sound)",
        "អេក្រង់ទំហំដ៏ធំរហូតដល់ ៨.៤ អ៊ីញ និងកម្រិតបង្ហាញរូបភាព ២.៥K អេក្រង់នេះផ្ដល់នូវរូបភាពច្បាស់ម៉ត់ និងពណ៌ស្រស់ស្អាតខ្លាំង។ ប្រព័ន្ធសំឡេងដែលត្រូវបាន tinh-tune ដោយ Harman ផ្ដល់នូវកម្រិតសំឡេងបុកបាសពីរោះប្លែក កាន់តែជក់ចិត្តដិតអារម្មណ៍ក្នុងការទស្សនា និងលេងហ្គេម។",
        "## ហេតុអ្វីបានជាឧបករណ៍នេះឡើងថ្លៃគួរឱ្យកត់សម្គាល់?",
        "អតិថិជនបានកត់សម្គាល់ឃើញថាតម្លៃនៅលើធ្នើរហាងភ្នំពេញមានការកើនឡើងបន្តិច។ មូលហេតុធំគឺដោយសារឥទ្ធិពលនៃការផ្គត់ផ្គង់បន្ទះឈីបសកល ការដឹកជញ្ជូន និងតម្រូវការដ៏ច្រើនលើសលប់ពីសំណាក់អ្នកនិយមឧបករណ៍លេងហ្គេម PC ចល័ត។ តែយ៉ាងណាក៏ដោយ កម្លាំងម៉ាស៊ីនដ៏មហិមា និងការប្រើប្រាស់ពហុមុខងារ ធ្វើឱ្យវានៅតែជាជម្រើសវិនិយោគដ៏សមរម្យសម្រាប់ Gaming Station!"
      ]
    }
  },
  '1': {
    readTime: '4 min read',
    likes: 98,
    views: 320,
    text: {
      en: [
        "Mobile gaming in 2024 has advanced into a full alternative for core gamers. With native releases of console games on smartphones, having the wrong controller can cost you victories. Here is our ranking of the top 5 mobile gaming controllers available on the market.",
        "## 1. GameSir G8 Galileo: The Drift-Free Sovereign",
        "Setting a new industrial standard, the G8 Galileo features Hall Effect electromagnetic joysticks that never wear out or drift. With comfortable full-sized grips resembling an Xbox controller, a direct USB-C connection that ensures zero latency, and pass-through phone charging, this is currently the premium choice.",
        "## 2. Backbone One (Gen 2): Best for Software Integration",
        "The gold standard for mobile integration is the Backbone One. In its Gen 2 variation, it adds wider space adapters to accommodate bulky phone protective cases. The Backbone Hub software transforms your mobile screen into a gorgeous digital gaming hub, sorting through multi-platform installations instantly.",
        "## 3. Razer Kishi V2 Pro: Microswitch Precision",
        "Razer steps up tactile satisfaction with microswitch buttons that click like computer mice. The Pro model stands out with integrated tactile haptics that emulate standard controller vibrations, creating intense physical engagement during action sequences.",
        "## 4. IINE Wireless Gamepad: Stylish and Ergonomic",
        "For the player seeking style, customizations, and deep lighting, the IINE Mobile Gamepad is a superb recommendation. Built with beautiful RGB lights and additional program keys on the back, this fits long gaming sessions without hand strain.",
        "## 5. GameSir X2s Typc-C: Compact Retro Value",
        "Offering incredible retro styling and utilizing high-quality Hall Effect components at a lower price point, the X2s is a magnificent entryway. It is easy on pockets and extremely direct for setting up emulator software."
      ],
      km: [
        "ការលេងហ្គេមលើទូរស័ព្ទដៃក្នុងឆ្នាំ ២០២៤ លែងជារបៀបកម្សាន្តធម្មតាៗទៀតហើយ។ ជាមួយនឹងការចេញផ្សាយហ្គេមកម្រិត Console ផ្ទាល់លើស្មាតហ្វូន ការមានឧបករណ៍បញ្ជាត្រឹមត្រូវគឺជាគន្លឹះដើម្បីទទួលបានជ័យជម្នះ។ ខាងក្រោមនេះជាកំពូលឧបករណ៍បញ្ជាទូរស័ព្ទទាំង ៥ ដែលត្រូវតែមាន។",
        "## ១. GameSir G8 Galileo: ស្តេចឧបករណ៍បញ្ជាគ្មានការ drift",
        "បង្កើតស្តង់ដារឧស្សហកម្មថ្មី GameSir G8 ប្រើប្រាស់យ៉យស្ទីកម៉ាញេទិក Hall Effect ដែលធានាថាមិនចេះខូច ឬ Drift ឡើយ។ ជាមួយនឹងដៃកាន់ខ្នាតធំស្រដៀងនឹងដៃហ្គេម Xbox, ការភ្ជាប់តាម USB-C ដោយផ្ទាល់គ្មានភាពយឺតយ៉ាវ និងមានរន្ធសាកថ្មបន្តបន្ទាប់ នេះជាជម្រើសល្អបំផុតនាពេលបច្ចុប្បន្ន។",
        "## ២. Backbone One (Gen 2): កម្មវិធីគ្រប់គ្រងល្អផ្តាច់គេ",
        "ជាជម្រើសស្តង់ដារសម្រាប់ iOS និង Android ។ ជំនាន់ទី ២ នេះបានបន្ថែមអាដាប់ទ័រទំហំធំជាងមុន ងាយស្រួលដាក់ទូរស័ព្ទទាំងស្រោមការពារ។ កម្មវិធី Backbone Hub បំលែងអេក្រង់ទូរស័ព្ទរបស់អ្នកទៅជាផ្ទាំងគ្រប់គ្រងហ្គេមដ៏ស្រស់ស្អាតភ្លាមៗ។",
        "## ៣. Razer Kishi V2 Pro: ភាពហ្មត់ចត់នៃប៊ូតុង Microswitch",
        "Razer នាំមកនូវអារម្មណ៍ចុចដ៏ល្អជាមួយប៊ូតុងប្រភេទ microswitch លឿនដូចចុចកណ្ដុរកុំព្យូទ័រ។ ម៉ូឌែល Pro នេះមានម៉ូទ័រញ័រ tactile ពិសេស ដែលជួយឱ្យអ្នកទទួលបានអារម្មណ៍រំញ័រពិតៗតាមសកម្មភាពក្នុងហ្គេម។",
        "## ៤. IINE Wireless Gamepad: ទាន់សម័យ និងផាសុកភាព",
        "សម្រា់អ្នកលេងដែលចង់បានស្ទីលស្រស់ស្អាត ការកំណត់ភ្លើង RGB និងប៊ូតុងបន្ថែមនៅផ្នែកខាងខ្នង IINE គឺជាជម្រើសដ៏ស័ក្តិសម។ រាងរៅដៃកាន់ ergonomic ជួយកាត់បន្ថយការឈឺចុកចាប់ដៃពេលលេងយូរ។",
        "## ៥. GameSir X2s Type-C: តម្លៃធូររចនាបទបែប Retro",
        "ផ្តល់នូវរចនាបទកម្រិតបុរាណ និងប្រើប្រាស់យ៉យ Hall Effect ក្នុងតម្លៃសមរម្យបំផុត។ វាងាយស្រួលដាក់តាមខ្លួន និងសាមញ្ញក្នុងការកំណត់លេងហ្គេម emulator ផ្សេងៗ!"
      ]
    }
  },
  '2': {
    readTime: '5 min read',
    likes: 156,
    views: 610,
    text: {
      en: [
        "Assembling your own custom gaming desktop PC is an exciting experience. Beyond understanding the internals, you take control of thermal cooling, RGB layouts, and upgrade paths. Let's walk through the essential process of building a PC.",
        "## Phase 1: Planning and Workspace Prep",
        "Layout all your components on a clean, non-conductive surface (like a wooden table). Ensure you have standard screwdrivers (magnetic headers are a lifesaver). Prepare your central processor (CPU), motherboard, memory modules (RAM), solid-state storage (M.2 NVMe SSD), cooling fan, case, power supply (PSU), and graphics card (GPU).",
        "## Phase 2: Installing Core Components First",
        "It is standard practice to load CPU, RAM, and storage on the motherboard before securing it inside the case. Open the motherboard socket bracket, place your CPU matching the alignment symbols, apply high-quality thermal compound, and mount your memory RAM in custom slots (typically slots 2 and 4 for dual-channel speeds).",
        "## Phase 3: Screwing Into Case and Cable Management",
        "Mount the metallic motherboard I/O bracket shield, align the board standoffs in the computer chassis, and tighten the holding screws. Slip the Power Supply into the bottom compartment. Run power lines (CPU, Motherboard, Graphics) cleanly through rear wire pathways to achieve professional, aerodynamic cable hygiene.",
        "## Phase 4: Graphics Card and Power Testing",
        "Place your Graphics Card (GPU) in the top PCI-Express 16x lane, secure it with rear frame screws, and couple the power link cables. Double-check all wire connects. Finally, connect your display output to the GPU port (not the motherboard video sockets), hook your power source, and boot up to enjoy the magical moment of entering your motherboard BIOS setup screen!"
      ],
      km: [
        "ការតម្លើងកុំព្យូរទ័រ (PC) ផ្ទាល់ខ្លួនគឺជាបទពិសោធន៍ដ៏រីករាយ និងចំណេញថវិកា។ ក្រៅពីបានយល់ដឹងពីគ្រឿងបន្លាស់ខាងក្នុង អ្នកក៏អាចគ្រប់គ្រងលើការត្រជាក់ កម្រិតពន្លឺ RGB និងការអាប់គ្រេដទៅថ្ងៃខាងមុខ។ ខាងក្រោមនេះជាមគ្គុទ្ទេសក៍លម្អិតសម្រាប់ការតម្លើង PC លើកដំបូងរបស់អ្នក។",
        "## ជំហានទី ១: រៀបចំគ្រឿងបន្លាស់ និងកន្លែងធ្វើការ",
        "រៀបចំគ្រឿងបន្លាស់ទាំងអស់របស់អ្នកនៅលើផ្ទៃស្អាត មិនចម្លងចរន្តអគ្គិសនី (ដូចជាតុឈើ)។ ប្រមូលផ្តុំ៖ CPU, Motherboard, RAM, M.2 SSD, Power Supply (PSU), Case, CPU Cooler និង Graphics Card (GPU)។ រៀបចំវីសឺវីសក្បាលម៉ាញេទិកដើម្បីងាយស្រួលរឹតវីស។",
        "## ជំហានទី ២: ដំឡើងគ្រឿងស្នូលនៅលើ Motherboard មុន",
        "យកល្អគួរតែដំឡើង CPU, RAM និង M.2 SSD ទៅលើ Motherboard ជាមុនសិន មុននឹងដាក់វាចូលក្នុង Case។ បើកគម្រប CPU Socket, ដាក់ CPU ឱ្យត្រូវគំនូសសញ្ញាប្រយ័ត្នវៀចជើង, លាបកាវកម្ដៅ (thermal paste) រួចដំឡើង RAM ទៅក្នុងរន្ធលេខ ២ និងលេខ ៤ ដើម្បីទទួលបានល្បឿន Dual-Channel។",
        "## ជំហានទី ៣: ភ្ជាប់ទៅកាន់ Case និងរៀបចំខ្សែភ្លើង",
        "ដំឡើង Motherboard ចូលទៅក្នុង Case ឱ្យត្រូវកន្លែងវីស។ រុញ Power Supply ចូលទៅក្នុងប្រឡោះខាងក្រោម។ ចាប់ផ្តើមទាញខ្សែភ្លើងផ្គត់ផ្គង់ (CPU, Mainboard, VGA) តាមច្រកផ្នែកខាងក្រោយ ដើម្បីកាត់បន្ថយភាពស៊ុបទ្រុបខាងក្នុង និងជួយឱ្យខ្យល់ចេញចូលបានល្អ។",
        "## ជំហានទី ៤: បញ្ចូលកាតក្រាហ្វិក និងតេស្តម៉ាស៊ីន",
        "ដាក់កាតក្រាហ្វិក (GPU) ចូលទៅក្នុងរន្ធ PCI-E ខាងលើគេបង្អស់ រួចរឹតវីសជាប់នឹង Case។ ភ្ជាប់ខ្សែភ្លើង GPU ឱ្យសព្វ។ ភ្ជាប់ខ្សែរ៉េអាក់ទ័រ ឬ HDMI ពីអេក្រង់ទៅកាន់រន្ធកាតក្រាហ្វិក (កុំភ្ជាប់នឹងរន្ធ Motherboard) រួចចុចបើកម៉ាស៊ីនជាការស្រេច!"
      ]
    }
  }
};

// Generates readable content paragraphs dynamically to support newly created custom blog posts
const getArticleParagraphs = (post: BlogPost, lang: 'en' | 'km') => {
  if (post.content) {
    const paragraphs = post.content.split('\n').map(p => p.trim()).filter(Boolean);
    const wordCount = post.content.split(/\s+/).filter(Boolean).length;
    const minutes = Math.max(1, Math.ceil(wordCount / 180));
    return {
      paragraphs,
      readTime: `${minutes} min read`,
      likes: 64,
      views: 240
    };
  }

  const custom = ARTICLE_DETAILS[post.id];
  if (custom) {
    return {
      paragraphs: custom.text[lang],
      readTime: custom.readTime,
      likes: custom.likes,
      views: custom.views
    };
  }

  // Fallback procedural engine
  const isKhmer = lang === 'km';
  const welcomeText = isKhmer 
    ? `សូមស្វាគមន៍មកកាន់ការពិនិត្យឡើងវិញលម្អិតអំពី "${post.title}"។ ថ្ងៃនេះយើងនឹងពិភាក្សាអំពីមុខងារសំខាន់ៗ ប្រសិទ្ធភាពការងារ និងបទពិសោធន៍ប្រើប្រាស់ជាក់ស្តែង។`
    : `Welcome to our comprehensive deep-dive into "${post.title}". Today, we take a close look at the key features, raw performance, and overall user experience.`;
  
  const midText = isKhmer 
    ? `រចនាបថ និងគុណភាពសំណង់របស់ផលិតផលនេះពិតជាអស្ចារ្យ។ ${post.excerpt} នេះជាចំណុចពិសេសដែលយើងបានរកឃើញក្នុងអំឡុងពេលតេស្តសាកល្បងយ៉ាងហ្មត់ចត់។`
    : `The design build and physical ergonomics are exceptional. ${post.excerpt} Here are details regarding our intensive analysis and hands-on testing.`;
  
  const closingText = isKhmer 
    ? `សរុបសេចក្តីមក ផលិតផលនេះពិតជាផ្តល់នូវតម្លៃគួរឱ្យចាប់អារម្មណ៍ក្នុងកម្រិតថវិកានេះ។ សម្រាប់ព័ត៌មានបន្ថែម និងការបញ្ជាទិញដោយផ្ទាល់ សូមទាក់ទងមកកាន់ពួកយើងតាមរយៈតេឡេក្រាម ឬមកកាន់ហាង Bong Tech Store!`
    : `In conclusion, this product delivers remarkable performance and value in its price category. For pricing, localized availability, and orders, please connect with us via Telegram or visit Bong Tech Store today!`;

  return {
    paragraphs: [welcomeText, midText, closingText],
    readTime: '3 min read',
    likes: 42,
    views: 156
  };
};

interface BlogSectionProps {
  isSidebar?: boolean;
}

export default function BlogSection({ isSidebar = false }: BlogSectionProps) {
  const { t, language } = useLanguage();
  const { blogPosts, loadingBlog } = useAuthOrder();
  
  // State variables for robust discovery
  const [activeCategory, setActiveCategory] = useState<string>('All');
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [selectedPostId, setSelectedPostId] = useState<string | null>(null);
  const [copied, setCopied] = useState<boolean>(false);

  // Filter labels
  const categoriesList = ['All', 'Reviews', 'Guides', 'YouTube', 'Product'];

  // Match and filter articles based on search query and category filters
  const filteredPosts = useMemo(() => {
    return blogPosts.filter((post) => {
      const matchesCategory = activeCategory === 'All' || post.category.toLowerCase() === activeCategory.toLowerCase();
      const matchesSearch = 
        post.title.toLowerCase().includes(searchQuery.toLowerCase()) || 
        post.excerpt.toLowerCase().includes(searchQuery.toLowerCase()) ||
        post.category.toLowerCase().includes(searchQuery.toLowerCase());
      return matchesCategory && matchesSearch;
    });
  }, [blogPosts, activeCategory, searchQuery]);

  // Featured article (first review or high premium write-up)
  const featuredPost = useMemo(() => {
    return blogPosts[0] || null;
  }, [blogPosts]);

  // Handle article view selection
  const selectedPost = useMemo(() => {
    return blogPosts.find(p => p.id === selectedPostId) || null;
  }, [blogPosts, selectedPostId]);

  // Render Sidebar View (Homepage variant representation)
  if (isSidebar) {
    return (
      <div className="glass-card flex flex-col h-full bg-zinc-950/40 p-5 rounded-2xl border border-white/5 relative overflow-hidden">
        {/* Absolute design aesthetic decoration */}
        <div className="absolute top-0 left-0 w-full h-[2px] bg-gradient-to-r from-brand-primary via-purple-500 to-transparent" />
        
        <div className="flex items-center justify-between mb-5">
          <div className="flex items-center gap-2">
            <Sparkles size={14} className="text-brand-primary animate-pulse" />
            <h2 className="text-xs font-black uppercase tracking-[2px] text-brand-primary">
              {language === 'km' ? 'ការពិនិត្យ និងព័ត៌មាន' : 'Reviews & Articles'}
            </h2>
          </div>
          <span className="text-[10px] text-text-dim px-2 py-0.5 bg-white/5 rounded font-mono font-semibold text-white">
            {blogPosts.length} Live
          </span>
        </div>

        <div className="flex flex-col gap-4">
          {loadingBlog ? (
            <div className="text-xs text-text-dim text-center py-6">Loading articles...</div>
          ) : blogPosts.length === 0 ? (
            <div className="text-xs text-text-dim text-center py-6">No blog articles found.</div>
          ) : (
            blogPosts.slice(0, 3).map((post) => (
              <div 
                key={post.id}
                onClick={() => setSelectedPostId(post.id)}
                className="group cursor-pointer flex gap-3 p-2 rounded-xl border border-transparent hover:border-white/5 hover:bg-white/[0.02] transition-all duration-300"
              >
                <div className="relative w-16 h-16 rounded-lg overflow-hidden border border-white/10 flex-shrink-0 bg-zinc-900">
                  <img 
                    src={post.image} 
                    alt={post.title}
                    referrerPolicy="no-referrer"
                    className="w-full h-full object-cover transform group-hover:scale-105 transition-transform duration-300" 
                  />
                  {post.videoUrl && (
                    <div className="absolute inset-0 bg-black/40 flex items-center justify-center">
                      <Play size={12} className="text-brand-primary fill-brand-primary" />
                    </div>
                  )}
                </div>
                <div className="flex flex-col justify-center min-w-0 flex-grow">
                  <span className="text-[9px] font-black text-brand-primary uppercase tracking-widest">{post.category}</span>
                  <h4 className="text-xs font-bold leading-snug line-clamp-2 text-white group-hover:text-brand-primary transition-colors mt-0.5">
                    {post.title}
                  </h4>
                  <span className="text-[9px] text-text-dim font-mono mt-1">{post.date}</span>
                </div>
              </div>
            ))
          )}
        </div>

        {/* Read more footer link to direct users to full blog section */}
        <a 
          href="/blog" 
          className="mt-4 pt-3 border-t border-white/5 text-[11px] text-brand-primary font-bold hover:text-white transition-all flex items-center justify-center gap-1.5"
        >
          {language === 'km' ? 'អានអត្ថបទទាំងអស់' : 'Read All Articles & Reviews'}
          <ArrowRight size={12} className="transform group-hover:translate-x-1 transition-transform" />
        </a>

        {/* --- PORTAL MODAL DIALOG (FOR SIDEBAR DETAIL LOADING IN PLACE) --- */}
        <AnimatePresence>
          {selectedPost && (
            <div className="fixed inset-0 z-[2000] flex items-center justify-center p-4 bg-zinc-950/80 backdrop-blur-md">
              <motion.div 
                initial={{ opacity: 0, scale: 0.95, y: 15 }}
                animate={{ opacity: 1, scale: 1, y: 0 }}
                exit={{ opacity: 0, scale: 0.95, y: 15 }}
                className="bg-zinc-900 border border-white/10 rounded-2xl w-full max-w-2xl max-h-[85vh] overflow-y-auto shadow-2xl relative"
              >
                {/* Back / Close button */}
                <button 
                  onClick={() => setSelectedPostId(null)}
                  className="absolute top-4 right-4 z-50 bg-black/60 hover:bg-brand-primary p-2 text-white rounded-full transition-all border border-white/10"
                >
                  ✕
                </button>

                {/* Cover Image/Video Banner */}
                {selectedPost.videoUrl ? (
                  <div className="aspect-video w-full relative bg-black">
                    <iframe
                      src={selectedPost.videoUrl}
                      title={selectedPost.title}
                      className="absolute inset-0 w-full h-full"
                      allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                      allowFullScreen
                    ></iframe>
                  </div>
                ) : (
                  <div className="aspect-video w-full relative overflow-hidden">
                    <img 
                      src={selectedPost.image} 
                      alt={selectedPost.title}
                      referrerPolicy="no-referrer"
                      className="w-full h-full object-cover"
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-zinc-900 via-transparent to-transparent" />
                  </div>
                )}

                {/* Article Info */}
                <div className="p-6 md:p-8">
                  <div className="flex flex-wrap items-center gap-2 mb-4">
                    <span className="text-[10px] bg-brand-primary/10 border border-brand-primary/20 text-brand-primary font-black uppercase px-2 py-0.5 rounded tracking-widest">
                      {selectedPost.category}
                    </span>
                    <span className="text-[10px] text-zinc-400 font-mono flex items-center gap-1">
                      <Clock size={10} />
                      {getArticleParagraphs(selectedPost, language).readTime}
                    </span>
                  </div>

                  <h3 className="text-xl md:text-2xl font-black text-white mb-4 leading-snug">
                    {selectedPost.title}
                  </h3>

                  <div className="flex items-center gap-3 pb-6 border-b border-white/5 mb-6 text-xs text-text-dim">
                    <div className="flex items-center gap-1.5 font-semibold text-white">
                      <div className="w-6 h-6 rounded-full bg-brand-primary/20 border border-brand-primary/10 flex items-center justify-center text-[10px] font-bold text-brand-primary">
                        BT
                      </div>
                      {selectedPost.author}
                    </div>
                    <span>•</span>
                    <span className="font-mono">{selectedPost.date}</span>
                  </div>

                  {/* Body paragraphs */}
                  <div className="space-y-4 text-sm md:text-base text-zinc-300 leading-relaxed font-sans">
                    {getArticleParagraphs(selectedPost, language).paragraphs.map((p, index) => {
                      if (p.startsWith('##')) {
                        return (
                          <h4 key={index} className="text-base md:text-lg font-bold text-white pt-4 pb-1 border-b border-white/5">
                            {p.replace('##', '').trim()}
                          </h4>
                        );
                      }
                      return <p key={index} className="whitespace-pre-wrap">{p}</p>;
                    })}
                  </div>

                  <div className="mt-8 pt-6 border-t border-white/5 flex items-center justify-between">
                    <div className="flex items-center gap-4 text-xs text-text-dim">
                      <span className="flex items-center gap-1 hover:text-red-400 transition-colors cursor-pointer">
                        <Heart size={12} className="fill-red-500/10 text-red-500" />
                        {getArticleParagraphs(selectedPost, language).likes}
                      </span>
                      <span className="flex items-center gap-1">
                        <Eye size={12} />
                        {getArticleParagraphs(selectedPost, language).views} Views
                      </span>
                    </div>
                    <button 
                      onClick={() => setSelectedPostId(null)}
                      className="text-xs text-brand-primary font-bold hover:underline"
                    >
                      {language === 'km' ? 'បិទអត្ថបទ' : 'Close Article'}
                    </button>
                  </div>
                </div>
              </motion.div>
            </div>
          )}
        </AnimatePresence>
      </div>
    );
  }

  // =========================================================================
  // MAIN FULL WEB LAYOUT (DEDICATED ARTICLE NEWSROOM INTERFACE ON /blog)
  // =========================================================================
  return (
    <div className="section-container max-w-7xl mx-auto px-4 sm:px-8 py-10">
      <AnimatePresence mode="wait">
        
        {/* VIEW 1: SELECTED FULL-DEPTH EDITORIAL READER VIEW */}
        {selectedPost ? (
          <motion.div
            key="article-read-view"
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -30 }}
            transition={{ duration: 0.4 }}
            className="max-w-4xl mx-auto bg-zinc-950/40 p-6 sm:p-10 rounded-3xl border border-white/5 relative"
          >
            {/* Header navigational tools */}
            <div className="flex items-center justify-between mb-8 pb-4 border-b border-white/5">
              <button
                onClick={() => {
                  setSelectedPostId(null);
                  window.scrollTo({ top: 0, behavior: 'smooth' });
                }}
                className="group flex items-center gap-2 text-xs font-bold uppercase tracking-wider text-text-dim hover:text-brand-primary transition-all"
              >
                <ArrowLeft size={14} className="transform group-hover:-translate-x-1.5 transition-transform" />
                {language === 'km' ? 'ត្រឡប់ទៅព័ត៌មានវិញ' : 'Back to Newsroom'}
              </button>
              
              <div className="flex items-center gap-3 text-text-dim">
                <span className="text-xs font-mono">{getArticleParagraphs(selectedPost, language).readTime}</span>
              </div>
            </div>

            {/* Title Block */}
            <div className="mb-6">
              <div className="flex items-center gap-3 mb-4">
                <span className="text-[10px] bg-brand-primary/10 border border-brand-primary/20 text-brand-primary font-black uppercase px-2.5 py-1 rounded tracking-widest">
                  {selectedPost.category}
                </span>
                <span className="text-[10px] text-zinc-400 font-mono bg-white/5 px-2 py-0.5 rounded flex items-center gap-1">
                  <Clock size={10} />
                  {getArticleParagraphs(selectedPost, language).readTime}
                </span>
              </div>
              
              <h1 className="text-2xl sm:text-4xl font-black text-white mb-6 leading-tight select-text">
                {selectedPost.title}
              </h1>

              {/* Author Badge and metadata */}
              <div className="flex items-center gap-3 py-3 border-y border-white/5 text-xs text-text-dim">
                <div className="flex items-center gap-2 text-white font-semibold">
                  <div className="w-8 h-8 rounded-full bg-brand-primary/20 border border-brand-primary/10 flex items-center justify-center font-bold text-xs text-brand-primary shadow-inner">
                    BT
                  </div>
                  <div>
                    <p className="text-white hover:text-brand-primary transition-colors cursor-pointer">{selectedPost.author}</p>
                    <p className="text-[10px] text-text-dim font-normal">Tech Journalist</p>
                  </div>
                </div>
                <div className="ml-auto flex items-center gap-4 font-mono text-[10px]">
                  <span>{selectedPost.date}</span>
                </div>
              </div>
            </div>

            {/* Media Canvas Block */}
            {selectedPost.videoUrl ? (
              <div className="my-8 rounded-2xl overflow-hidden border border-white/10 aspect-video relative shadow-2xl bg-black">
                <iframe
                  src={selectedPost.videoUrl}
                  title={selectedPost.title}
                  className="absolute inset-0 w-full h-full"
                  allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                  allowFullScreen
                ></iframe>
              </div>
            ) : (
              selectedPost.image && (
                <div className="my-8 rounded-2xl overflow-hidden border border-white/10 relative shadow-2xl">
                  <img 
                    src={selectedPost.image} 
                    alt={selectedPost.title}
                    referrerPolicy="no-referrer"
                    className="w-full h-auto object-cover max-h-[480px]" 
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-zinc-950/60 via-transparent to-transparent" />
                </div>
              )
            )}

            {/* Real Editorial Story Content */}
            <div className="prose prose-invert max-w-none text-zinc-300 leading-relaxed font-sans text-sm sm:text-base space-y-6">
              {getArticleParagraphs(selectedPost, language).paragraphs.map((para, i) => {
                // If heading
                if (para.startsWith('##')) {
                  return (
                    <h2 
                      key={i} 
                      className="text-lg sm:text-2xl font-black text-white pt-6 pb-2 border-b border-white/5 mb-4 tracking-tight flex items-center gap-2"
                    >
                      <span className="w-1 h-6 bg-brand-primary rounded" />
                      {para.replace('##', '').trim()}
                    </h2>
                  );
                }

                return (
                  <p key={i} className="whitespace-pre-wrap select-text antialiased">
                    {para}
                  </p>
                );
              })}
            </div>

            {/* Bottom Interaction Analytics Bar */}
            <div className="mt-12 pt-6 border-t border-white/5 flex flex-wrap items-center justify-between gap-4">
              <div className="flex items-center gap-6 text-xs text-text-dim">
                <button className="flex items-center gap-1.5 bg-white/5 hover:bg-red-500/10 hover:text-red-400 border border-white/5 px-3 py-1.5 rounded-lg transition-all group">
                  <Heart size={14} className="fill-red-500/10 text-red-500 group-hover:scale-110 transition-transform" />
                  <span>{getArticleParagraphs(selectedPost, language).likes} Likes</span>
                </button>
                <div className="flex items-center gap-1.5 bg-white/5 border border-white/5 px-3 py-1.5 rounded-lg">
                  <Eye size={14} />
                  <span>{getArticleParagraphs(selectedPost, language).views} Views</span>
                </div>
              </div>

              <div className="flex items-center gap-2">
                <button 
                  onClick={() => {
                    navigator.clipboard.writeText(window.location.href);
                    setCopied(true);
                    setTimeout(() => setCopied(false), 2000);
                  }}
                  className={`p-2 rounded-lg transition-all border flex items-center gap-1 min-w-[34px] ${
                    copied 
                      ? 'bg-green-500/10 border-green-500/30 text-green-400' 
                      : 'hover:bg-white/10 text-text-dim hover:text-white border-white/5'
                  }`}
                  title="Share Article"
                >
                  <Share2 size={14} />
                  {copied && <span className="text-[10px] font-black uppercase tracking-wider pl-0.5">Link Copied</span>}
                </button>
                <button 
                  onClick={() => {
                    setSelectedPostId(null);
                    window.scrollTo({ top: 0, behavior: 'smooth' });
                  }}
                  className="px-4 py-2 bg-brand-primary hover:bg-brand-primary/80 text-black text-xs font-black rounded-lg transition-all uppercase tracking-widest shadow-lg shadow-brand-primary/15"
                >
                  {language === 'km' ? 'អានអត្ថបទផ្សេងទៀត' : 'Read Other News'}
                </button>
              </div>
            </div>

            {/* Related/Footer Navigation Cards */}
            <div className="mt-16 pt-10 border-t border-zinc-900">
              <h4 className="text-xs font-black text-brand-primary uppercase tracking-[2px] mb-6 flex items-center gap-2">
                <Compass size={12} className="text-brand-primary animate-spin" style={{ animationDuration: '6s' }} />
                {language === 'km' ? 'ការណែនាំសម្រាប់ការអានបន្ត' : 'Recommended For You'}
              </h4>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {blogPosts.filter(p => p.id !== selectedPost.id).slice(0, 2).map((rPost) => (
                  <div
                    key={rPost.id}
                    onClick={() => {
                      setSelectedPostId(rPost.id);
                      window.scrollTo({ top: 0, behavior: 'smooth' });
                    }}
                    className="flex gap-4 p-3 bg-white/[0.01] hover:bg-white/[0.03] border border-white/5 rounded-xl cursor-pointer transition-all duration-300 group"
                  >
                    <img 
                      src={rPost.image} 
                      alt={rPost.title} 
                      referrerPolicy="no-referrer"
                      className="w-16 h-16 object-cover rounded-lg border border-white/10 flex-shrink-0"
                    />
                    <div className="flex flex-col justify-center min-w-0">
                      <span className="text-[9px] text-brand-primary uppercase tracking-widest font-bold">{rPost.category}</span>
                      <h5 className="text-xs font-bold leading-snug line-clamp-2 text-white group-hover:text-brand-primary transition-colors mt-0.5">
                        {rPost.title}
                      </h5>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </motion.div>
        ) : (
          
          /* VIEW 2: MAIN MAGAZINE DISCOVERY HUBS */
          <motion.div
            key="magazine-grid-view"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="flex flex-col gap-10"
          >
            {/* Elegant Header Hero Billboard */}
            <div className="relative rounded-3xl overflow-hidden border border-white/5 p-8 md:p-12 text-center md:text-left bg-zinc-900/10">
              {/* Subtle visual ambient back-glows */}
              <div className="absolute top-1/2 left-1/4 -translate-y-1/2 w-64 h-64 rounded-full bg-brand-primary/5 blur-[120px]" />
              <div className="absolute bottom-0 right-10 w-96 h-96 rounded-full bg-purple-500/5 blur-[140px]" />

              <div className="relative z-10 max-w-2xl">
                <div className="inline-flex items-center gap-2 bg-brand-primary/10 border border-brand-primary/15 text-brand-primary font-black uppercase text-[10px] tracking-widest px-3 py-1 rounded-full mb-6">
                  <Sparkles size={11} className="animate-spin" style={{ animationDuration: '4s' }} />
                  {language === 'km' ? 'មជ្ឈមណ្ឌលព័ត៌មានបច្ចេកវិទ្យា' : 'Tech News & Reviews Hub'}
                </div>
                
                <h1 className="text-3xl sm:text-5xl font-black mb-4 tracking-tight leading-tight text-white uppercase font-sans">
                  {language === 'km' ? 'ប្លុក និងការពិនិត្យ' : 'Bong Tech Press'}
                </h1>
                
                <p className="text-text-dim max-w-lg text-sm sm:text-base leading-relaxed mb-6 font-medium">
                  {language === 'km' 
                    ? 'ស្វែងយល់ពីព័ត៌មានបច្ចេកវិទ្យាចុងក្រោយបំផុត ការពិនិត្យស៊ីជម្រៅលើឧបករណ៍បញ្ជាហ្គេម គ្រឿងបន្លាស់ និងមគ្គុទ្ទេសក៍ដំឡើងកុំព្យូទ័រនៅភ្នំពេញ។'
                    : 'Unveil the inner hardware dynamics. Read authoritative system building recipes, professional wireless input analysis, and Khmer gaming reports.'}
                </p>
              </div>
            </div>

            {/* FEATURED CHRONICLE HIGHLIGHT (High-vibe horizontally styled cover) */}
            {featuredPost && (
              <div className="glass-card bg-zinc-950/20 p-6 sm:p-8 rounded-3xl border border-white/5 overflow-hidden relative group">
                <div className="absolute top-0 right-0 w-[150px] h-[150px] bg-brand-primary/5 rounded-full blur-[60px]" />
                <div className="flex flex-col lg:flex-row gap-8 items-center">
                  
                  {/* Aspect media */}
                  <div 
                    onClick={() => setSelectedPostId(featuredPost.id)}
                    className="w-full lg:w-[45%] aspect-video rounded-2xl overflow-hidden border border-white/10 cursor-pointer relative bg-zinc-900 flex-shrink-0"
                  >
                    <img 
                      src={featuredPost.image} 
                      alt={featuredPost.title}
                      referrerPolicy="no-referrer"
                      className="w-full h-full object-cover transform group-hover:scale-102 transition-transform duration-500" 
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent" />
                    
                    {featuredPost.videoUrl && (
                      <div className="absolute inset-0 flex items-center justify-center">
                        <div className="w-12 h-12 rounded-full bg-black/60 backdrop-blur-sm border border-brand-primary flex items-center justify-center text-brand-primary group-hover:bg-brand-primary group-hover:text-black transition-all">
                          <Play size={18} className="fill-current ml-0.5" />
                        </div>
                      </div>
                    )}
                  </div>

                  {/* Text descriptions */}
                  <div className="flex flex-col flex-grow min-w-0">
                    <div className="flex items-center gap-2 mb-3">
                      <span className="text-[9px] font-black font-mono text-brand-primary uppercase tracking-widest bg-brand-primary/10 px-2 py-0.5 rounded border border-brand-primary/20">
                        {language === 'km' ? 'អត្ថបទពិសេស' : 'Featured Cover Story'}
                      </span>
                      <span className="text-[10px] text-text-dim">•</span>
                      <span className="text-[10px] text-text-dim font-mono">{featuredPost.date}</span>
                    </div>

                    <h2 
                      onClick={() => setSelectedPostId(featuredPost.id)}
                      className="text-xl sm:text-2xl font-black text-white hover:text-brand-primary cursor-pointer transition-colors mb-4 leading-snug line-clamp-2"
                    >
                      {featuredPost.title}
                    </h2>

                    <p className="text-sm text-text-dim leading-relaxed mb-6 line-clamp-3">
                      {featuredPost.excerpt}
                    </p>

                    <div className="flex items-center justify-between pt-4 border-t border-white/5 mt-auto">
                      <div className="flex items-center gap-2 text-xs font-semibold text-white">
                        <div className="w-5 h-5 rounded-full bg-brand-primary text-black font-black flex items-center justify-center text-[9px]">
                          BT
                        </div>
                        {featuredPost.author}
                      </div>

                      <button
                        onClick={() => setSelectedPostId(featuredPost.id)}
                        className="flex items-center gap-1.5 text-xs font-black text-brand-primary uppercase tracking-widest group-hover:text-white transition-colors"
                      >
                        {language === 'km' ? 'អានបន្ថែម' : 'Read Full Release'}
                        <ArrowRight size={12} className="transform group-hover:translate-x-1.5 transition-transform" />
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            )}

            {/* INTERACTIVE NAVIGATION CONTROL PANEL (Sticky bar style) */}
            <div className="flex flex-col sm:flex-row justify-between items-stretch sm:items-center gap-4 border-b border-white/5 pb-5">
              
              {/* Category Sliders */}
              <div className="flex items-center gap-1.5 overflow-x-auto pb-2 sm:pb-0 scrollbar-none">
                {categoriesList.map((cat) => {
                  const isActive = activeCategory.toLowerCase() === cat.toLowerCase();
                  return (
                    <button
                      key={cat}
                      onClick={() => setActiveCategory(cat)}
                      className={`text-xs font-bold uppercase tracking-wider px-3.5 py-1.5 rounded-full border transition-all ${
                        isActive 
                          ? 'bg-brand-primary border-brand-primary text-black font-extrabold shadow-md shadow-brand-primary/10' 
                          : 'bg-white/5 border-white/5 hover:border-white/10 text-text-dim hover:text-white'
                      }`}
                    >
                      {cat}
                    </button>
                  );
                })}
              </div>

              {/* Advanced search widget */}
              <div className="relative max-w-xs w-full sm:w-64">
                <span className="absolute left-3 top-1/2 -translate-y-1/2 text-text-dim">
                  <Search size={12} />
                </span>
                <input
                  type="text"
                  placeholder={language === 'km' ? 'ស្វែងរកអត្ថបទ...' : 'Search articles...'}
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="w-full bg-white/5 hover:bg-white/[0.08] focus:bg-zinc-950 border border-white/5 focus:border-brand-primary/40 rounded-full py-1.5 pl-8 pr-4 text-xs text-white placeholder-text-dim outline-none transition-all"
                />
              </div>
            </div>

            {/* DISCOVERY GRID CATALOG */}
            {loadingBlog ? (
              <div className="text-sm text-text-dim text-center py-20 bg-white/[0.01] rounded-2xl border border-white/5">
                <div className="inline-block w-6 h-6 border-2 border-brand-primary border-t-transparent rounded-full animate-spin mb-3" />
                <p>Retrieving Bong Tech press database...</p>
              </div>
            ) : filteredPosts.length === 0 ? (
              <div className="text-center py-20 bg-white/[0.01] rounded-2xl border border-white/5 text-text-dim">
                <CommsNoteEmpty language={language} />
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 sm:gap-8">
                {filteredPosts.map((post) => (
                  <motion.article
                    layout
                    key={post.id}
                    className="group flex flex-col bg-zinc-950/30 border border-white/5 hover:border-white/10 rounded-2xl overflow-hidden shadow-sm hover:shadow-xl hover:-translate-y-1 transition-all duration-300"
                  >
                    {/* Media Aspect container */}
                    <div 
                      onClick={() => setSelectedPostId(post.id)}
                      className="aspect-video relative overflow-hidden border-b border-white/5 cursor-pointer bg-zinc-900"
                    >
                      <img 
                        src={post.image} 
                        alt={post.title}
                        referrerPolicy="no-referrer"
                        className="w-full h-full object-cover transform group-hover:scale-103 transition-transform duration-500" 
                      />
                      <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-transparent opacity-60" />
                      
                      {/* Media badge trigger */}
                      <span className="absolute top-3 left-3 text-[9px] font-black text-brand-primary uppercase tracking-widest bg-black/70 backdrop-blur-sm border border-brand-primary/30 px-2 py-0.5 rounded">
                        {post.category}
                      </span>

                      {post.videoUrl && (
                        <span className="absolute top-3 right-3 text-[8px] bg-red-600 font-extrabold text-white uppercase tracking-wider px-1.5 py-0.5 rounded flex items-center gap-1">
                          <Video size={8} />
                          Review Video
                        </span>
                      )}
                    </div>

                    {/* Meta descriptions panel */}
                    <div className="p-5 flex flex-col flex-grow">
                      <div className="flex items-center justify-between text-[10px] text-text-dim mb-2.5 font-mono">
                        <span className="flex items-center gap-1 font-semibold text-zinc-300">
                          <User size={10} className="text-brand-primary" />
                          {post.author}
                        </span>
                        <span>{post.date}</span>
                      </div>

                      <h3 
                        onClick={() => setSelectedPostId(post.id)}
                        className="text-sm font-bold leading-snug text-white group-hover:text-brand-primary transition-colors cursor-pointer mb-2.5 line-clamp-2"
                      >
                        {post.title}
                      </h3>

                      <p className="text-xs text-text-dim leading-relaxed mb-4 line-clamp-3">
                        {post.excerpt}
                      </p>

                      <div className="flex items-center justify-between pt-3.5 border-t border-white/5 mt-auto">
                        <span className="text-[10px] text-text-dim font-mono">
                          {getArticleParagraphs(post, language).readTime}
                        </span>

                        <button
                          onClick={() => setSelectedPostId(post.id)}
                          className="flex items-center gap-1 text-[11px] font-black text-brand-primary uppercase tracking-widest group-hover:translate-x-1.5 transition-transform"
                        >
                          {language === 'km' ? 'អានទាំងស្រុង' : 'Full Read'}
                          <ChevronRight size={11} className="text-brand-primary" />
                        </button>
                      </div>
                    </div>
                  </motion.article>
                ))}
              </div>
            )}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

// Subcomponent: Static note for empty search queries
function CommsNoteEmpty({ language }: { language: 'en' | 'km' }) {
  return (
    <div className="flex flex-col items-center p-8 max-w-sm mx-auto">
      <FileText size={24} className="text-text-dim mb-4 opacity-40 animate-bounce" />
      <h4 className="text-sm font-bold text-white mb-1">
        {language === 'km' ? 'រកមិនឃើញអត្ថបទទេ' : 'No articles matched'}
      </h4>
      <p className="text-xs text-text-dim">
        {language === 'km' 
          ? 'សូមព្យាយាមស្វែងរកពាក្យផ្សេងទៀត ឬប្តូរប្រភេទតម្រងរបស់អ្នក។' 
          : 'Please check your spelling, clear search queries, or choose another news category filter.'}
      </p>
    </div>
  );
}

