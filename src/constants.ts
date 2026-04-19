import { Product, BlogPost } from './types';

export const BUSINESS_DETAILS = {
  name: 'Bong Tech Store',
  location: 'Phnom Penh, Cambodia',
  facebook: 'https://www.facebook.com/bongtechstore',
  telegram: 'https://t.me/bongtechstore',
  phone: ['070 697 169', '070 555882'],
  website: 'www.bongtech.cc',
  logo: 'https://scontent.fpnh5-5.fna.fbcdn.net/v/t39.30808-6/501750660_122112868688871933_1028924135060599282_n.jpg?_nc_cat=111&ccb=1-7&_nc_sid=1d70fc&_nc_ohc=8y83nQMGTzMQ7kNvwHJpRCZ&_nc_oc=AdqD0vLI0mutK7Miskp61Hnhf276WelZ0yvi_R8XQlTgQmFuxFiDpWhSfQ3L5rpwX28&_nc_zt=23&_nc_ht=scontent.fpnh5-5.fna&_nc_gid=OMhkKSSjZ2U0XfYDq7eaSw&_nc_ss=7a3a8&oh=00_Af2t7qQjaUkF4VZ5cvFrZN1SLweeVAWLZDepjFFzgvIivg&oe=69EA9AA2',
  description: 'Bongtech store is your one-stop shop for all your gaming needs. We offer a wide range of controllers, accessories, and more. Shop now!',
};

export const PRODUCTS: Product[] = [
  {
    id: 'iine-mini-retro',
    name: 'IINE Mini Retro Wireless Controller',
    category: 'Product',
    price: '$15.00',
    colors: ['Blue', 'Black', 'Purple'],
    image: 'https://m.media-amazon.com/images/I/71hpLsW34SL._AC_UF1000,1000_QL80_.jpg',
    isFeatured: true,
    isNew: true,
    specs: {
      'Compatible Devices': 'Android, IOS, Nintendo Switch, Windows',
      'Controller Type': 'Gamepad',
      'Additional Features': 'Wireless',
      'Button Quantity': '12',
      'Hardware Platform': 'Smartphone',
      'Power Source': 'Battery Powered',
      'Software Name': 'IINE',
    },
    description: 'Compact and nostalgic wireless controller designed for multi-platform gaming.',
  },
  {
    id: 'iine-retro-pocket',
    name: 'IINE Retro Pocket Game Controller',
    category: 'Product',
    price: '$30.00',
    colors: ['White Blue'],
    image: 'https://m.media-amazon.com/images/I/61pWnL+uysL._AC_UF1000,1000_QL80_.jpg',
    isFeatured: true,
    specs: {
      'Compatible Devices': 'Android, IOS, Nintendo Switch, Windows',
      'Controller Type': 'Gamepad',
      'Additional Features': 'Wireless',
      'Button Quantity': '16',
      'Hardware Platform': 'Smartphone',
      'Power Source': 'Battery Powered',
      'Software Name': 'IINE',
    },
    description: 'Nostalgic pocket-sized controller with enhanced button layout for precision gaming.',
  },
  {
    id: 'iine-mini-retro-ananke-2',
    name: 'IINE MINI Retro Ananke 2',
    category: 'Product',
    price: '$18.00',
    colors: ['Black', 'White'],
    image: 'https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcRxNJcJRVSTlDMbTi4x03c8k6VNXpYecBqfqQ&s',
    isNew: true,
    specs: {
      'Compatible Devices': 'Android, IOS, Nintendo Switch, Windows',
      'Controller Type': 'Gamepad',
      'Additional Features': 'Wireless',
      'Button Quantity': '12',
      'Hardware Platform': 'Multi-platform',
      'Power Source': 'Battery Powered',
    },
    description: 'Compact retro-style controller with specialized Ananke 2 design for versatile compatibility across platforms.',
  },
];

export const BLOG_POSTS: BlogPost[] = [
  {
    id: '1',
    title: 'Top 5 Controllers for Mobile Gaming in 2024',
    excerpt: 'Mobile gaming has come a long way. Discover the best controllers that will elevate your experience on Android and iOS.',
    date: 'April 15, 2024',
    image: 'https://picsum.photos/seed/gaming-blog-1/800/400',
    author: 'Bong Tech Team',
    category: 'Reviews',
  },
  {
    id: '2',
    title: 'How to Build Your First Gaming PC: A Step-by-Step Guide',
    excerpt: 'Building a PC can be daunting. We break down everything you need to know from picking parts to the first boot.',
    date: 'April 10, 2024',
    image: 'https://picsum.photos/seed/gaming-blog-2/800/400',
    author: 'Tech Specialist',
    category: 'Guides',
  },
];
