export interface CountyData {
  name: string;
  towns: TownData[];
  center: [number, number];
}

export interface TownData {
  name: string;
  estates: string[];
  center: [number, number];
}

export const KENYA_COUNTIES: CountyData[] = [
  {
    name: "Nairobi",
    center: [-1.2921, 36.8219],
    towns: [
      { name: "Westlands", estates: ["Parklands", "Highridge", "Kangemi", "Mountain View", "Karura", "Kitisuru"], center: [-1.2676, 36.8036] },
      { name: "Kilimani", estates: ["Kileleshwa", "Adams Arcade", "Kawangware", "Valley Arcade", "Woodlands"], center: [-1.2910, 36.7891] },
      { name: "Langata", estates: ["Karen", "South C", "South B", "Nyayo Estate", "Hardy", "Mugumo-ini"], center: [-1.3580, 36.7453] },
      { name: "Embakasi", estates: ["Umoja", "Kayole", "Donholm", "Fedha", "Pipeline", "Utawala", "Ruai"], center: [-1.3091, 36.9003] },
      { name: "Kasarani", estates: ["Roysambu", "Githurai", "Mwiki", "Lucky Summer", "Clay City", "Thika Road Mall area"], center: [-1.2204, 36.8972] },
      { name: "Dagoretti", estates: ["Rongai", "Riruta", "Waithaka", "Satellite", "Mutu-ini"], center: [-1.3216, 36.7230] },
      { name: "Starehe", estates: ["CBD", "Eastleigh", "Pangani", "Ngara", "Ziwani", "Gikomba"], center: [-1.2832, 36.8357] },
      { name: "Makadara", estates: ["Maringo", "Hamza", "Harambee", "Makongeni", "Viwandani"], center: [-1.3029, 36.8631] },
      { name: "Mathare", estates: ["Mabatini", "Hospital", "Mlango Kubwa", "Huruma"], center: [-1.2627, 36.8574] },
      { name: "Ruaraka", estates: ["Baba Dogo", "Utalii", "Mathare North", "Lucky Summer"], center: [-1.2458, 36.8755] },
    ],
  },
  {
    name: "Mombasa",
    center: [-4.0435, 39.6682],
    towns: [
      { name: "Mombasa Island", estates: ["Old Town", "Tudor", "Ganjoni", "Mji wa Kale", "Majengo"], center: [-4.0632, 39.6651] },
      { name: "Nyali", estates: ["Nyali Estate", "Frere Town", "Ziwa la Ng'ombe", "Ratna Square area"], center: [-4.0206, 39.7091] },
      { name: "Kisauni", estates: ["Bamburi", "Mkomani", "Kiembeni", "Shanzu", "Mtopanga"], center: [-3.9803, 39.7257] },
      { name: "Changamwe", estates: ["Port Reitz", "Kipevu", "Chaani", "Airport area"], center: [-4.0389, 39.6156] },
      { name: "Likoni", estates: ["Shelly Beach", "Mtongwe", "Bofu", "Timbwani"], center: [-4.0948, 39.6590] },
      { name: "Mvita", estates: ["CBD", "Mwembe Tayari", "Marikiti", "Buxton"], center: [-4.0655, 39.6680] },
    ],
  },
  {
    name: "Kisumu",
    center: [-0.0917, 34.7679],
    towns: [
      { name: "Kisumu Central", estates: ["Milimani", "Kisumu CBD", "Kondele", "Nyalenda", "Manyatta"], center: [-0.1022, 34.7617] },
      { name: "Kisumu East", estates: ["Kajulu", "Kolwa Central", "Manyatta B", "Nyalenda A"], center: [-0.0751, 34.8013] },
      { name: "Kisumu West", estates: ["Kibos", "Kopul", "Tieno", "West Seme"], center: [-0.0949, 34.7143] },
      { name: "Nyando", estates: ["Muhoroni", "Chemelil", "Masogo", "Fort Ternan"], center: [-0.1613, 35.0040] },
      { name: "Muhoroni", estates: ["Muhoroni Town", "Chemosit", "Fort Ternan"], center: [-0.1496, 35.1963] },
    ],
  },
  {
    name: "Nakuru",
    center: [-0.3031, 36.0800],
    towns: [
      { name: "Nakuru Town", estates: ["Milimani", "Flamingo", "Section 58", "Bondeni", "Kaptembwa", "Rhoda"], center: [-0.2887, 36.0667] },
      { name: "Naivasha", estates: ["Naivasha Town", "Hell's Gate area", "Kongoni", "Maai Mahiu"], center: [-0.7167, 36.4333] },
      { name: "Gilgil", estates: ["Gilgil Town", "Elementaita"], center: [-0.4920, 36.3127] },
      { name: "Molo", estates: ["Molo Town", "Elburgon", "Olenguruone"], center: [-0.2472, 35.7375] },
      { name: "Subukia", estates: ["Subukia Town", "Waseges"], center: [-0.1427, 36.2289] },
    ],
  },
  {
    name: "Eldoret",
    center: [0.5143, 35.2698],
    towns: [
      { name: "Eldoret Town", estates: ["Langas", "Huruma", "Kimumu", "Elgon View", "Pioneer", "Kapsoya", "Annex"], center: [0.5143, 35.2698] },
      { name: "Turbo", estates: ["Turbo Town", "Matunda"], center: [0.6304, 35.0453] },
      { name: "Ziwa", estates: ["Ziwa area"], center: [0.5800, 35.3200] },
    ],
  },
  {
    name: "Kiambu",
    center: [-1.0310, 36.8313],
    towns: [
      { name: "Thika", estates: ["Stadium", "Gatuanyaga", "Township", "Makongeni", "Kiandutu"], center: [-1.0332, 37.0693] },
      { name: "Ruiru", estates: ["Ruiru Town", "Kamiti", "Kirigiti", "Blue Valley"], center: [-1.1460, 36.9611] },
      { name: "Kikuyu", estates: ["Kikuyu Town", "Rironi", "Kinoo", "Ondiri"], center: [-1.2462, 36.6618] },
      { name: "Limuru", estates: ["Limuru Town", "Tigoni", "Ndeiya", "Ngecha"], center: [-1.1124, 36.6422] },
      { name: "Kiambu Town", estates: ["Kiambu CBD", "Ndumberi", "Riabai"], center: [-1.0310, 36.8313] },
      { name: "Gatundu", estates: ["Gatundu Town", "Mang'u"], center: [-0.9958, 36.9948] },
    ],
  },
  {
    name: "Machakos",
    center: [-1.5177, 37.2634],
    towns: [
      { name: "Machakos Town", estates: ["Machakos CBD", "Mua", "Mumbuni", "Kalama"], center: [-1.5177, 37.2634] },
      { name: "Athi River", estates: ["Athi River Town", "EPZ area", "Syokimau", "Mlolongo"], center: [-1.4553, 36.9779] },
      { name: "Kangundo", estates: ["Kangundo Town", "Tala", "Matungulu"], center: [-1.2453, 37.1471] },
      { name: "Mwala", estates: ["Mwala Town", "Masii"], center: [-1.4210, 37.3945] },
    ],
  },
  {
    name: "Kajiado",
    center: [-1.8522, 36.7819],
    towns: [
      { name: "Kajiado Town", estates: ["Kajiado CBD", "Isinya"], center: [-1.8522, 36.7819] },
      { name: "Ngong", estates: ["Ngong Town", "Matasia", "Kibiko", "Ewuaso Kedong"], center: [-1.3617, 36.6606] },
      { name: "Kitengela", estates: ["Kitengela Town", "Acacia area", "Pipeline", "Milimani"], center: [-1.4748, 36.9600] },
      { name: "Ongata Rongai", estates: ["Rongai Town", "Purko", "Kandisi", "Maasai Lodge area"], center: [-1.3937, 36.7438] },
    ],
  },
  {
    name: "Meru",
    center: [0.0470, 37.6493],
    towns: [
      { name: "Meru Town", estates: ["Meru CBD", "Makutano", "Mwangaza", "Gatunga"], center: [0.0470, 37.6493] },
      { name: "Maua", estates: ["Maua Town", "Kangeta"], center: [0.2397, 37.9418] },
      { name: "Nkubu", estates: ["Nkubu Town"], center: [0.0006, 37.6235] },
    ],
  },
  {
    name: "Nyeri",
    center: [-0.4167, 36.9500],
    towns: [
      { name: "Nyeri Town", estates: ["Nyeri CBD", "Ruring'u", "Kamakwa", "Gatitu"], center: [-0.4167, 36.9500] },
      { name: "Karatina", estates: ["Karatina Town", "Gaichanjiru"], center: [-0.4878, 37.1248] },
      { name: "Othaya", estates: ["Othaya Town"], center: [-0.5621, 36.9272] },
    ],
  },
  {
    name: "Muranga",
    center: [-0.7178, 37.1527],
    towns: [
      { name: "Muranga Town", estates: ["Muranga CBD", "Makuyu"], center: [-0.7178, 37.1527] },
      { name: "Thika (Muranga)", estates: ["Kenol", "Makuyu"], center: [-0.8671, 37.2066] },
      { name: "Kangema", estates: ["Kangema Town"], center: [-0.7459, 36.9749] },
    ],
  },
  {
    name: "Kirinyaga",
    center: [-0.5000, 37.2667],
    towns: [
      { name: "Kerugoya", estates: ["Kerugoya Town", "Kutus"], center: [-0.5000, 37.2667] },
      { name: "Sagana", estates: ["Sagana Town", "Kagio"], center: [-0.6753, 37.2025] },
    ],
  },
  {
    name: "Embu",
    center: [-0.5397, 37.4576],
    towns: [
      { name: "Embu Town", estates: ["Embu CBD", "Kirimari", "Kithimu"], center: [-0.5397, 37.4576] },
      { name: "Runyenjes", estates: ["Runyenjes Town"], center: [-0.3741, 37.6119] },
    ],
  },
  {
    name: "Kitui",
    center: [-1.3667, 38.0167],
    towns: [
      { name: "Kitui Town", estates: ["Kitui CBD", "Mulango", "Kyangwithya"], center: [-1.3667, 38.0167] },
      { name: "Mwingi", estates: ["Mwingi Town"], center: [-0.9333, 38.0667] },
    ],
  },
  {
    name: "Makueni",
    center: [-1.8015, 37.6235],
    towns: [
      { name: "Wote", estates: ["Wote Town"], center: [-1.7886, 37.6378] },
      { name: "Mtito Andei", estates: ["Mtito Andei Town"], center: [-2.6834, 38.1720] },
      { name: "Sultan Hamud", estates: ["Sultan Hamud Town"], center: [-2.0499, 37.6937] },
    ],
  },
  {
    name: "Nyandarua",
    center: [-0.1818, 36.5203],
    towns: [
      { name: "Ol Kalou", estates: ["Ol Kalou Town", "Engineer"], center: [-0.2668, 36.3785] },
      { name: "Nyahururu", estates: ["Nyahururu Town", "Thomson's Falls area"], center: [0.0278, 36.3645] },
    ],
  },
  {
    name: "Laikipia",
    center: [0.3606, 36.7819],
    towns: [
      { name: "Nanyuki", estates: ["Nanyuki Town", "Equator area", "Lewa"], center: [0.0082, 37.0740] },
      { name: "Rumuruti", estates: ["Rumuruti Town"], center: [0.2733, 36.5364] },
    ],
  },
  {
    name: "Samburu",
    center: [1.2041, 36.9988],
    towns: [
      { name: "Maralal", estates: ["Maralal Town"], center: [1.0992, 36.6983] },
      { name: "Baragoi", estates: ["Baragoi Town"], center: [1.7789, 36.7896] },
    ],
  },
  {
    name: "Trans Nzoia",
    center: [1.0569, 34.9559],
    towns: [
      { name: "Kitale", estates: ["Kitale CBD", "Milimani", "Pioneer", "Matisi"], center: [1.0152, 35.0062] },
      { name: "Kiminini", estates: ["Kiminini Town"], center: [1.0294, 34.8574] },
    ],
  },
  {
    name: "West Pokot",
    center: [1.7573, 35.2298],
    towns: [
      { name: "Kapenguria", estates: ["Kapenguria Town"], center: [1.2389, 35.1118] },
      { name: "Lodwar (Turkana side)", estates: ["Lodwar Town"], center: [3.1195, 35.5965] },
    ],
  },
  {
    name: "Turkana",
    center: [3.1195, 35.5965],
    towns: [
      { name: "Lodwar", estates: ["Lodwar Town", "Kakuma area"], center: [3.1195, 35.5965] },
      { name: "Kakuma", estates: ["Kakuma Town"], center: [3.7145, 34.8562] },
    ],
  },
  {
    name: "Baringo",
    center: [0.5467, 35.9917],
    towns: [
      { name: "Kabarnet", estates: ["Kabarnet Town"], center: [0.4921, 35.7408] },
      { name: "Eldama Ravine", estates: ["Eldama Ravine Town"], center: [0.0469, 35.7184] },
    ],
  },
  {
    name: "Elgeyo Marakwet",
    center: [0.8091, 35.4778],
    towns: [
      { name: "Iten", estates: ["Iten Town", "Tambach"], center: [0.6722, 35.5065] },
      { name: "Chepkorio", estates: ["Chepkorio"], center: [0.8200, 35.5200] },
    ],
  },
  {
    name: "Nandi",
    center: [0.1832, 35.1068],
    towns: [
      { name: "Kapsabet", estates: ["Kapsabet Town", "Chepterit"], center: [0.2019, 35.0978] },
      { name: "Nandi Hills", estates: ["Nandi Hills Town"], center: [0.1080, 35.1812] },
    ],
  },
  {
    name: "Uasin Gishu",
    center: [0.5143, 35.2698],
    towns: [
      { name: "Eldoret", estates: ["Langas", "Huruma", "Kimumu", "Elgon View", "Pioneer", "Kapsoya", "Annex", "Huruma"], center: [0.5143, 35.2698] },
      { name: "Turbo", estates: ["Turbo Town"], center: [0.6304, 35.0453] },
      { name: "Burnt Forest", estates: ["Burnt Forest Town"], center: [0.6534, 35.4176] },
    ],
  },
  {
    name: "Kakamega",
    center: [0.2827, 34.7519],
    towns: [
      { name: "Kakamega Town", estates: ["Kakamega CBD", "Lurambi", "Milimani", "Amalemba"], center: [0.2827, 34.7519] },
      { name: "Mumias", estates: ["Mumias Town"], center: [0.3350, 34.4850] },
      { name: "Butere", estates: ["Butere Town"], center: [0.2139, 34.4946] },
    ],
  },
  {
    name: "Vihiga",
    center: [0.0766, 34.7240],
    towns: [
      { name: "Vihiga Town", estates: ["Vihiga CBD", "Luanda"], center: [0.0766, 34.7240] },
      { name: "Mbale", estates: ["Mbale Town"], center: [0.0472, 34.6992] },
    ],
  },
  {
    name: "Bungoma",
    center: [0.5635, 34.5606],
    towns: [
      { name: "Bungoma Town", estates: ["Bungoma CBD", "Milimani", "Musikoma"], center: [0.5635, 34.5606] },
      { name: "Webuye", estates: ["Webuye Town", "Misikhu"], center: [0.6091, 34.7756] },
      { name: "Kimilili", estates: ["Kimilili Town"], center: [0.7895, 34.7227] },
    ],
  },
  {
    name: "Busia",
    center: [0.4601, 34.1116],
    towns: [
      { name: "Busia Town", estates: ["Busia CBD", "Malaba"], center: [0.4601, 34.1116] },
      { name: "Port Victoria", estates: ["Port Victoria Town"], center: [0.0894, 34.1097] },
    ],
  },
  {
    name: "Siaya",
    center: [-0.0617, 34.2880],
    towns: [
      { name: "Siaya Town", estates: ["Siaya CBD", "Ngiya"], center: [-0.0617, 34.2880] },
      { name: "Bondo", estates: ["Bondo Town", "Usenge"], center: [-0.3310, 34.2703] },
      { name: "Ugunja", estates: ["Ugunja Town"], center: [-0.1568, 34.3138] },
    ],
  },
  {
    name: "Homa Bay",
    center: [-0.5227, 34.4571],
    towns: [
      { name: "Homa Bay Town", estates: ["Homa Bay CBD", "Arujo", "Lwanda"], center: [-0.5227, 34.4571] },
      { name: "Oyugis", estates: ["Oyugis Town"], center: [-0.7195, 34.7203] },
      { name: "Mbita", estates: ["Mbita Town", "Rusinga Island"], center: [-0.4183, 34.2042] },
    ],
  },
  {
    name: "Migori",
    center: [-1.0634, 34.4730],
    towns: [
      { name: "Migori Town", estates: ["Migori CBD", "Rongo"], center: [-1.0634, 34.4730] },
      { name: "Awendo", estates: ["Awendo Town"], center: [-0.9934, 34.6022] },
      { name: "Isebania", estates: ["Isebania Town"], center: [-1.5034, 34.4022] },
    ],
  },
  {
    name: "Kisii",
    center: [-0.6817, 34.7667],
    towns: [
      { name: "Kisii Town", estates: ["Kisii CBD", "Mwembe", "Daraja Mbili", "Milimani"], center: [-0.6817, 34.7667] },
      { name: "Ogembo", estates: ["Ogembo Town"], center: [-0.7934, 34.6892] },
      { name: "Suneka", estates: ["Suneka Town"], center: [-0.7124, 34.7948] },
    ],
  },
  {
    name: "Nyamira",
    center: [-0.5670, 34.9347],
    towns: [
      { name: "Nyamira Town", estates: ["Nyamira CBD"], center: [-0.5670, 34.9347] },
      { name: "Keroka", estates: ["Keroka Town"], center: [-0.7117, 34.9534] },
    ],
  },
  {
    name: "Narok",
    center: [-1.0818, 35.8718],
    towns: [
      { name: "Narok Town", estates: ["Narok CBD", "Olpusimoru"], center: [-1.0818, 35.8718] },
      { name: "Kilgoris", estates: ["Kilgoris Town"], center: [-1.0034, 34.8892] },
    ],
  },
  {
    name: "Bomet",
    center: [-0.7853, 35.3410],
    towns: [
      { name: "Bomet Town", estates: ["Bomet CBD"], center: [-0.7853, 35.3410] },
      { name: "Sotik", estates: ["Sotik Town", "Kaplong"], center: [-0.6752, 35.1225] },
    ],
  },
  {
    name: "Kericho",
    center: [-0.3671, 35.2863],
    towns: [
      { name: "Kericho Town", estates: ["Kericho CBD", "Kericho SGR area", "Milimani"], center: [-0.3671, 35.2863] },
      { name: "Litein", estates: ["Litein Town"], center: [-0.6151, 35.1169] },
    ],
  },
  {
    name: "Kwale",
    center: [-4.1734, 39.4524],
    towns: [
      { name: "Kwale Town", estates: ["Kwale CBD"], center: [-4.1734, 39.4524] },
      { name: "Ukunda", estates: ["Ukunda Town", "Diani Beach area", "Galu", "Msambweni"], center: [-4.2785, 39.5716] },
      { name: "Lungalunga", estates: ["Lungalunga Town"], center: [-4.5515, 39.1090] },
    ],
  },
  {
    name: "Kilifi",
    center: [-3.6305, 39.8499],
    towns: [
      { name: "Kilifi Town", estates: ["Kilifi CBD", "Bofa", "Mnarani"], center: [-3.6305, 39.8499] },
      { name: "Malindi", estates: ["Malindi CBD", "Shella", "Sabaki", "Silversands"], center: [-3.2175, 40.1169] },
      { name: "Watamu", estates: ["Watamu Town", "Gede"], center: [-3.3535, 39.9921] },
      { name: "Kaloleni", estates: ["Kaloleni Town"], center: [-3.8035, 39.6521] },
    ],
  },
  {
    name: "Tana River",
    center: [-1.6667, 39.9167],
    towns: [
      { name: "Hola", estates: ["Hola Town"], center: [-1.5017, 40.0295] },
      { name: "Garsen", estates: ["Garsen Town"], center: [-2.2683, 40.1018] },
    ],
  },
  {
    name: "Lamu",
    center: [-2.2694, 40.9024],
    towns: [
      { name: "Lamu Town", estates: ["Lamu Old Town", "Shela", "Matondoni"], center: [-2.2694, 40.9024] },
      { name: "Mpeketoni", estates: ["Mpeketoni Town"], center: [-2.0167, 40.8333] },
      { name: "Mokowe", estates: ["Mokowe Town"], center: [-2.2333, 40.8500] },
    ],
  },
  {
    name: "Taita Taveta",
    center: [-3.4167, 38.4333],
    towns: [
      { name: "Voi", estates: ["Voi Town", "Maungu"], center: [-3.3965, 38.5562] },
      { name: "Wundanyi", estates: ["Wundanyi Town"], center: [-3.3985, 38.3566] },
    ],
  },
  {
    name: "Garissa",
    center: [-0.4532, 39.6461],
    towns: [
      { name: "Garissa Town", estates: ["Garissa CBD", "Iftin", "Medina"], center: [-0.4532, 39.6461] },
      { name: "Dadaab", estates: ["Dadaab Town"], center: [0.0618, 40.3109] },
    ],
  },
  {
    name: "Wajir",
    center: [1.7471, 40.0573],
    towns: [
      { name: "Wajir Town", estates: ["Wajir CBD"], center: [1.7471, 40.0573] },
      { name: "Habaswein", estates: ["Habaswein Town"], center: [1.0122, 39.4786] },
    ],
  },
  {
    name: "Mandera",
    center: [3.9366, 41.8670],
    towns: [
      { name: "Mandera Town", estates: ["Mandera CBD"], center: [3.9366, 41.8670] },
      { name: "Takaba", estates: ["Takaba Town"], center: [3.3954, 40.8742] },
    ],
  },
  {
    name: "Marsabit",
    center: [2.3284, 37.9899],
    towns: [
      { name: "Marsabit Town", estates: ["Marsabit CBD"], center: [2.3284, 37.9899] },
      { name: "Moyale", estates: ["Moyale Town"], center: [3.5235, 39.0568] },
    ],
  },
  {
    name: "Isiolo",
    center: [0.3540, 37.5820],
    towns: [
      { name: "Isiolo Town", estates: ["Isiolo CBD", "Bula Pesa", "Wabera"], center: [0.3540, 37.5820] },
      { name: "Merti", estates: ["Merti Town"], center: [1.0833, 38.4500] },
    ],
  },
  {
    name: "Tharaka Nithi",
    center: [-0.2954, 37.8857],
    towns: [
      { name: "Chuka", estates: ["Chuka Town", "Karurine"], center: [-0.3330, 37.6488] },
      { name: "Marimanti", estates: ["Marimanti Town"], center: [0.1013, 38.0527] },
    ],
  },
  {
    name: "Murang'a",
    center: [-0.7178, 37.1527],
    towns: [
      { name: "Murang'a Town", estates: ["Murang'a CBD"], center: [-0.7178, 37.1527] },
      { name: "Kenol", estates: ["Kenol Town"], center: [-0.9057, 37.2022] },
      { name: "Maragua", estates: ["Maragua Town"], center: [-0.8334, 37.1363] },
    ],
  },
];

export function getCountyNames(): string[] {
  return KENYA_COUNTIES.map((c) => c.name).sort();
}

export function getTownsForCounty(countyName: string): TownData[] {
  return KENYA_COUNTIES.find((c) => c.name === countyName)?.towns || [];
}

export function getEstatesForTown(countyName: string, townName: string): string[] {
  const county = KENYA_COUNTIES.find((c) => c.name === countyName);
  return county?.towns.find((t) => t.name === townName)?.estates || [];
}

export function getCountyCenter(countyName: string): [number, number] {
  return KENYA_COUNTIES.find((c) => c.name === countyName)?.center || [-1.286389, 36.817223];
}

export function getTownCenter(countyName: string, townName: string): [number, number] {
  const county = KENYA_COUNTIES.find((c) => c.name === countyName);
  return county?.towns.find((t) => t.name === townName)?.center || getCountyCenter(countyName);
}
