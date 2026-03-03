export type RegionRecipe = {
    title: string;
    description: string;
    flag: string;
    chatQuery: string;
};

export type GlobeRegion = {
    id: string;
    name: string;
    lat: number;
    lng: number;
    recipes: RegionRecipe[];
    color: string;
};

// Colors by broad geographic area
const COLORS = {
    eastAsia: '#f97316',
    southeastAsia: '#f59e0b',
    southAsia: '#eab308',
    middleEast: '#84cc16',
    africa: '#22c55e',
    europe: '#3b82f6',
    mediterranean: '#6366f1',
    americas: '#ec4899',
    southAmerica: '#f43f5e',
};

export const GLOBE_REGIONS: GlobeRegion[] = [
    {
        id: 'japan',
        name: 'Japan',
        lat: 36.2,
        lng: 138.25,
        color: COLORS.eastAsia,
        recipes: [
            {
                title: 'Tonkotsu Ramen',
                description: 'Rich pork bone broth with noodles',
                flag: '\u{1F1EF}\u{1F1F5}',
                chatQuery: 'tonkotsu ramen from scratch',
            },
            {
                title: 'Chicken Katsu Curry',
                description: 'Crispy cutlet with Japanese curry',
                flag: '\u{1F1EF}\u{1F1F5}',
                chatQuery: 'Japanese chicken katsu curry',
            },
            {
                title: 'Okonomiyaki',
                description: 'Savory cabbage pancake',
                flag: '\u{1F1EF}\u{1F1F5}',
                chatQuery: 'okonomiyaki Japanese pancake',
            },
        ],
    },
    {
        id: 'korea',
        name: 'South Korea',
        lat: 35.91,
        lng: 127.77,
        color: COLORS.eastAsia,
        recipes: [
            {
                title: 'Bibimbap',
                description: 'Mixed rice with vegetables and egg',
                flag: '\u{1F1F0}\u{1F1F7}',
                chatQuery: 'Korean bibimbap',
            },
            {
                title: 'Kimchi Jjigae',
                description: 'Spicy kimchi stew with pork',
                flag: '\u{1F1F0}\u{1F1F7}',
                chatQuery: 'kimchi jjigae stew',
            },
            {
                title: 'Tteokbokki',
                description: 'Spicy rice cakes in gochujang sauce',
                flag: '\u{1F1F0}\u{1F1F7}',
                chatQuery: 'tteokbokki spicy rice cakes',
            },
        ],
    },
    {
        id: 'china',
        name: 'China',
        lat: 35.86,
        lng: 104.2,
        color: COLORS.eastAsia,
        recipes: [
            {
                title: 'Mapo Tofu',
                description: 'Spicy Sichuan tofu with pork',
                flag: '\u{1F1E8}\u{1F1F3}',
                chatQuery: 'Sichuan mapo tofu',
            },
            {
                title: 'Kung Pao Chicken',
                description: 'Stir-fried chicken with peanuts and chili',
                flag: '\u{1F1E8}\u{1F1F3}',
                chatQuery: 'kung pao chicken',
            },
            {
                title: 'Xiaolongbao',
                description: 'Shanghai soup dumplings',
                flag: '\u{1F1E8}\u{1F1F3}',
                chatQuery: 'xiaolongbao soup dumplings',
            },
        ],
    },
    {
        id: 'thailand',
        name: 'Thailand',
        lat: 15.87,
        lng: 100.99,
        color: COLORS.southeastAsia,
        recipes: [
            {
                title: 'Pad Thai',
                description: 'Stir-fried rice noodles with tamarind',
                flag: '\u{1F1F9}\u{1F1ED}',
                chatQuery: 'authentic pad thai',
            },
            {
                title: 'Green Curry',
                description: 'Coconut curry with Thai basil',
                flag: '\u{1F1F9}\u{1F1ED}',
                chatQuery: 'Thai green curry',
            },
            {
                title: 'Tom Yum Soup',
                description: 'Hot and sour shrimp soup',
                flag: '\u{1F1F9}\u{1F1ED}',
                chatQuery: 'tom yum goong soup',
            },
        ],
    },
    {
        id: 'vietnam',
        name: 'Vietnam',
        lat: 14.06,
        lng: 108.28,
        color: COLORS.southeastAsia,
        recipes: [
            {
                title: 'Pho Bo',
                description: 'Beef noodle soup with herbs',
                flag: '\u{1F1FB}\u{1F1F3}',
                chatQuery: 'Vietnamese pho bo',
            },
            {
                title: 'Banh Mi',
                description: 'Crispy baguette sandwich',
                flag: '\u{1F1FB}\u{1F1F3}',
                chatQuery: 'Vietnamese banh mi sandwich',
            },
            {
                title: 'Bun Cha',
                description: 'Grilled pork with vermicelli',
                flag: '\u{1F1FB}\u{1F1F3}',
                chatQuery: 'bun cha Hanoi style',
            },
        ],
    },
    {
        id: 'indonesia',
        name: 'Indonesia',
        lat: -0.79,
        lng: 113.92,
        color: COLORS.southeastAsia,
        recipes: [
            {
                title: 'Nasi Goreng',
                description: 'Indonesian fried rice with sweet soy',
                flag: '\u{1F1EE}\u{1F1E9}',
                chatQuery: 'nasi goreng Indonesian fried rice',
            },
            {
                title: 'Rendang',
                description: 'Slow-cooked spiced coconut beef',
                flag: '\u{1F1EE}\u{1F1E9}',
                chatQuery: 'beef rendang',
            },
            {
                title: 'Satay',
                description: 'Grilled skewers with peanut sauce',
                flag: '\u{1F1EE}\u{1F1E9}',
                chatQuery: 'chicken satay with peanut sauce',
            },
        ],
    },
    {
        id: 'india',
        name: 'India',
        lat: 20.59,
        lng: 78.96,
        color: COLORS.southAsia,
        recipes: [
            {
                title: 'Butter Chicken',
                description: 'Creamy tomato curry with tender chicken',
                flag: '\u{1F1EE}\u{1F1F3}',
                chatQuery: 'butter chicken murgh makhani',
            },
            {
                title: 'Biryani',
                description: 'Fragrant layered rice with spices',
                flag: '\u{1F1EE}\u{1F1F3}',
                chatQuery: 'chicken biryani',
            },
            {
                title: 'Palak Paneer',
                description: 'Spinach curry with cheese cubes',
                flag: '\u{1F1EE}\u{1F1F3}',
                chatQuery: 'palak paneer',
            },
        ],
    },
    {
        id: 'italy',
        name: 'Italy',
        lat: 41.87,
        lng: 12.57,
        color: COLORS.mediterranean,
        recipes: [
            {
                title: 'Cacio e Pepe',
                description: 'Pasta with pecorino and black pepper',
                flag: '\u{1F1EE}\u{1F1F9}',
                chatQuery: 'cacio e pepe pasta',
            },
            {
                title: 'Osso Buco',
                description: 'Braised veal shanks Milanese',
                flag: '\u{1F1EE}\u{1F1F9}',
                chatQuery: 'osso buco alla milanese',
            },
            {
                title: 'Tiramisu',
                description: 'Coffee-soaked mascarpone dessert',
                flag: '\u{1F1EE}\u{1F1F9}',
                chatQuery: 'classic tiramisu',
            },
        ],
    },
    {
        id: 'france',
        name: 'France',
        lat: 46.23,
        lng: 2.21,
        color: COLORS.europe,
        recipes: [
            {
                title: 'Coq au Vin',
                description: 'Chicken braised in red wine',
                flag: '\u{1F1EB}\u{1F1F7}',
                chatQuery: 'coq au vin',
            },
            {
                title: 'Ratatouille',
                description: 'Provencal vegetable stew',
                flag: '\u{1F1EB}\u{1F1F7}',
                chatQuery: 'ratatouille',
            },
            {
                title: 'Croissants',
                description: 'Buttery laminated pastry',
                flag: '\u{1F1EB}\u{1F1F7}',
                chatQuery: 'homemade croissants from scratch',
            },
        ],
    },
    {
        id: 'spain',
        name: 'Spain',
        lat: 40.46,
        lng: -3.75,
        color: COLORS.mediterranean,
        recipes: [
            {
                title: 'Paella',
                description: 'Saffron rice with seafood',
                flag: '\u{1F1EA}\u{1F1F8}',
                chatQuery: 'seafood paella',
            },
            {
                title: 'Patatas Bravas',
                description: 'Crispy potatoes with spicy sauce',
                flag: '\u{1F1EA}\u{1F1F8}',
                chatQuery: 'patatas bravas',
            },
            {
                title: 'Gazpacho',
                description: 'Cold tomato soup',
                flag: '\u{1F1EA}\u{1F1F8}',
                chatQuery: 'gazpacho soup',
            },
        ],
    },
    {
        id: 'greece',
        name: 'Greece',
        lat: 39.07,
        lng: 21.82,
        color: COLORS.mediterranean,
        recipes: [
            {
                title: 'Moussaka',
                description: 'Layered eggplant and meat casserole',
                flag: '\u{1F1EC}\u{1F1F7}',
                chatQuery: 'Greek moussaka',
            },
            {
                title: 'Souvlaki',
                description: 'Grilled meat skewers with tzatziki',
                flag: '\u{1F1EC}\u{1F1F7}',
                chatQuery: 'chicken souvlaki with tzatziki',
            },
            {
                title: 'Spanakopita',
                description: 'Spinach and feta phyllo pie',
                flag: '\u{1F1EC}\u{1F1F7}',
                chatQuery: 'spanakopita',
            },
        ],
    },
    {
        id: 'turkey',
        name: 'Turkey',
        lat: 38.96,
        lng: 35.24,
        color: COLORS.middleEast,
        recipes: [
            {
                title: 'Iskender Kebab',
                description: 'Sliced doner over bread with tomato sauce',
                flag: '\u{1F1F9}\u{1F1F7}',
                chatQuery: 'iskender kebab',
            },
            {
                title: 'Lahmacun',
                description: 'Thin crispy Turkish flatbread with spiced meat',
                flag: '\u{1F1F9}\u{1F1F7}',
                chatQuery: 'lahmacun Turkish pizza',
            },
            {
                title: 'Baklava',
                description: 'Layered phyllo pastry with nuts and syrup',
                flag: '\u{1F1F9}\u{1F1F7}',
                chatQuery: 'Turkish baklava',
            },
        ],
    },
    {
        id: 'lebanon',
        name: 'Lebanon',
        lat: 33.85,
        lng: 35.86,
        color: COLORS.middleEast,
        recipes: [
            {
                title: 'Shawarma',
                description: 'Spiced rotisserie meat wraps',
                flag: '\u{1F1F1}\u{1F1E7}',
                chatQuery: 'chicken shawarma',
            },
            {
                title: 'Kibbeh',
                description: 'Bulgur and meat croquettes',
                flag: '\u{1F1F1}\u{1F1E7}',
                chatQuery: 'Lebanese kibbeh',
            },
            {
                title: 'Fattoush',
                description: 'Crispy pita bread salad',
                flag: '\u{1F1F1}\u{1F1E7}',
                chatQuery: 'fattoush salad',
            },
        ],
    },
    {
        id: 'morocco',
        name: 'Morocco',
        lat: 31.79,
        lng: -7.09,
        color: COLORS.africa,
        recipes: [
            {
                title: 'Chicken Tagine',
                description: 'Slow-cooked stew with preserved lemon',
                flag: '\u{1F1F2}\u{1F1E6}',
                chatQuery: 'Moroccan chicken tagine',
            },
            {
                title: 'Couscous Royal',
                description: 'Steamed semolina with vegetables and meat',
                flag: '\u{1F1F2}\u{1F1E6}',
                chatQuery: 'Moroccan couscous royal',
            },
            {
                title: 'Harira',
                description: 'Hearty tomato and lentil soup',
                flag: '\u{1F1F2}\u{1F1E6}',
                chatQuery: 'harira soup',
            },
        ],
    },
    {
        id: 'ethiopia',
        name: 'Ethiopia',
        lat: 9.15,
        lng: 40.49,
        color: COLORS.africa,
        recipes: [
            {
                title: 'Doro Wat',
                description: 'Spicy chicken stew with berbere',
                flag: '\u{1F1EA}\u{1F1F9}',
                chatQuery: 'Ethiopian doro wat',
            },
            {
                title: 'Misir Wat',
                description: 'Red lentil stew with injera',
                flag: '\u{1F1EA}\u{1F1F9}',
                chatQuery: 'misir wat Ethiopian lentils',
            },
            {
                title: 'Kitfo',
                description: 'Seasoned minced raw beef',
                flag: '\u{1F1EA}\u{1F1F9}',
                chatQuery: 'Ethiopian kitfo',
            },
        ],
    },
    {
        id: 'nigeria',
        name: 'Nigeria',
        lat: 9.08,
        lng: 8.68,
        color: COLORS.africa,
        recipes: [
            {
                title: 'Jollof Rice',
                description: 'Tomato-based one-pot rice',
                flag: '\u{1F1F3}\u{1F1EC}',
                chatQuery: 'Nigerian jollof rice',
            },
            {
                title: 'Egusi Soup',
                description: 'Melon seed soup with greens',
                flag: '\u{1F1F3}\u{1F1EC}',
                chatQuery: 'egusi soup',
            },
            {
                title: 'Suya',
                description: 'Spicy grilled meat skewers',
                flag: '\u{1F1F3}\u{1F1EC}',
                chatQuery: 'Nigerian suya',
            },
        ],
    },
    {
        id: 'mexico',
        name: 'Mexico',
        lat: 23.63,
        lng: -102.55,
        color: COLORS.americas,
        recipes: [
            {
                title: 'Tacos al Pastor',
                description: 'Spit-roasted pork tacos with pineapple',
                flag: '\u{1F1F2}\u{1F1FD}',
                chatQuery: 'tacos al pastor',
            },
            {
                title: 'Mole Poblano',
                description: 'Rich chocolate chili sauce with chicken',
                flag: '\u{1F1F2}\u{1F1FD}',
                chatQuery: 'mole poblano',
            },
            {
                title: 'Elote',
                description: 'Mexican street corn with mayo and cheese',
                flag: '\u{1F1F2}\u{1F1FD}',
                chatQuery: 'elote Mexican street corn',
            },
        ],
    },
    {
        id: 'peru',
        name: 'Peru',
        lat: -9.19,
        lng: -75.02,
        color: COLORS.southAmerica,
        recipes: [
            {
                title: 'Ceviche',
                description: 'Citrus-cured fresh fish',
                flag: '\u{1F1F5}\u{1F1EA}',
                chatQuery: 'Peruvian ceviche',
            },
            {
                title: 'Lomo Saltado',
                description: 'Stir-fried beef with fries',
                flag: '\u{1F1F5}\u{1F1EA}',
                chatQuery: 'lomo saltado',
            },
            {
                title: 'Aji de Gallina',
                description: 'Creamy chicken chili stew',
                flag: '\u{1F1F5}\u{1F1EA}',
                chatQuery: 'aji de gallina',
            },
        ],
    },
    {
        id: 'brazil',
        name: 'Brazil',
        lat: -14.24,
        lng: -51.93,
        color: COLORS.southAmerica,
        recipes: [
            {
                title: 'Feijoada',
                description: 'Black bean stew with pork',
                flag: '\u{1F1E7}\u{1F1F7}',
                chatQuery: 'Brazilian feijoada',
            },
            {
                title: 'Picanha',
                description: 'Grilled top sirloin cap',
                flag: '\u{1F1E7}\u{1F1F7}',
                chatQuery: 'Brazilian picanha',
            },
            {
                title: 'Pao de Queijo',
                description: 'Cheesy tapioca bread rolls',
                flag: '\u{1F1E7}\u{1F1F7}',
                chatQuery: 'pao de queijo cheese bread',
            },
        ],
    },
    {
        id: 'argentina',
        name: 'Argentina',
        lat: -38.42,
        lng: -63.62,
        color: COLORS.southAmerica,
        recipes: [
            {
                title: 'Empanadas',
                description: 'Baked pastry pockets with beef',
                flag: '\u{1F1E6}\u{1F1F7}',
                chatQuery: 'Argentine beef empanadas',
            },
            {
                title: 'Asado',
                description: 'Slow-grilled meats and chorizo',
                flag: '\u{1F1E6}\u{1F1F7}',
                chatQuery: 'Argentine asado',
            },
            {
                title: 'Dulce de Leche Churros',
                description: 'Fried dough with caramel filling',
                flag: '\u{1F1E6}\u{1F1F7}',
                chatQuery: 'churros with dulce de leche',
            },
        ],
    },
];
