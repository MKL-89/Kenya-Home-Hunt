// Build the list of towns per county from GeoNames (CC BY 4.0) plus a hand list of
// well-known towns whose coordinates are looked up in GeoNames.
// usage: node build-towns.mjs <geonames dir> <out .ts file>
import { readFileSync, writeFileSync } from "node:fs";
import path from "node:path";

const [dir, out] = process.argv.slice(2);

const APP_COUNTIES = ["Baringo","Bomet","Bungoma","Busia","Elgeyo Marakwet","Embu","Garissa","Homa Bay","Isiolo","Kajiado","Kakamega","Kericho","Kiambu","Kilifi","Kirinyaga","Kisii","Kisumu","Kitui","Kwale","Laikipia","Lamu","Machakos","Makueni","Mandera","Marsabit","Meru","Migori","Mombasa","Murang'a","Nairobi","Nakuru","Nandi","Narok","Nyamira","Nyandarua","Nyeri","Samburu","Siaya","Taita Taveta","Tana River","Tharaka Nithi","Trans Nzoia","Turkana","Uasin Gishu","Vihiga","Wajir","West Pokot"];

// Well-known towns, trading centres and college towns, by county
const EXTRA = {
  "Baringo": ["Kabarnet","Eldama Ravine","Marigat","Mogotio","Kabartonjo","Chemolingot","Timboroa"],
  "Bomet": ["Bomet","Sotik","Longisa","Mulot","Ndanai","Silibwet","Sigor","Chebunyo"],
  "Bungoma": ["Bungoma","Webuye","Kimilili","Chwele","Malakisi","Sirisia","Kapsokwony","Tongaren","Naitiri","Bumula"],
  "Busia": ["Busia","Malaba","Nambale","Port Victoria","Funyula","Butula","Amagoro","Sio Port","Bumala"],
  "Elgeyo Marakwet": ["Iten","Kapsowar","Chepkorio","Tambach","Chesoi","Kamwosor","Kapcherop","Chebiemit","Arror"],
  "Embu": ["Embu","Runyenjes","Siakago","Kiritiri","Ishiara","Manyatta","Kianjokoma","Karurumo"],
  "Garissa": ["Garissa","Dadaab","Masalani","Modogashe","Hulugho","Ijara","Bura","Balambala","Liboi"],
  "Homa Bay": ["Homa Bay","Kendu Bay","Mbita","Oyugis","Ndhiwa","Rangwe","Kosele","Magunga","Sindo"],
  "Isiolo": ["Isiolo","Garbatulla","Merti","Kinna","Oldonyiro","Kulamawe"],
  "Kajiado": ["Kajiado","Kitengela","Ongata Rongai","Ngong","Kiserian","Isinya","Namanga","Loitokitok","Bissil","Ilbisil","Mashuuru","Magadi"],
  "Kakamega": ["Kakamega","Mumias","Malava","Lugari","Butere","Shinyalu","Khayega","Matunda","Navakholo","Lumakanda","Turbo","Khwisero","Shianda"],
  "Kericho": ["Kericho","Litein","Londiani","Kipkelion","Kabianga","Sosiot","Fort Ternan","Chepseon","Brooke"],
  "Kiambu": ["Kiambu","Thika","Ruiru","Juja","Kikuyu","Limuru","Githunguri","Kiambaa","Karuri","Gatundu","Kimende","Lari","Banana Hill","Kahawa","Githurai","Wangige","Kabete","Tigoni"],
  "Kilifi": ["Kilifi","Malindi","Watamu","Mtwapa","Mariakani","Kaloleni","Rabai","Mazeras","Gede","Marafa","Vipingo","Takaungu"],
  "Kirinyaga": ["Kerugoya","Kutus","Kagio","Sagana","Wanguru","Kagumo","Baricho","Kianyaga","Kimbimbi"],
  "Kisii": ["Kisii","Ogembo","Suneka","Keumbu","Masimba","Nyamache","Marani","Kenyenya","Nyacheki","Itierio","Mosocho"],
  "Kisumu": ["Kisumu","Maseno","Ahero","Kombewa","Muhoroni","Awasi","Kondele","Chemelil","Katito","Pap Onditi","Holo","Sondu"],
  "Kitui": ["Kitui","Mwingi","Mutomo","Kwa Vonza","Kabati","Mutitu","Ikutha","Kyuso","Migwani","Zombe","Mutonguni","Nuu","Tseikuru"],
  "Kwale": ["Kwale","Ukunda","Diani Beach","Msambweni","Lunga Lunga","Kinango","Shimba Hills","Shimoni","Matuga","Tiwi","Kombani","Samburu"],
  "Laikipia": ["Nanyuki","Nyahururu","Rumuruti","Doldol","Kinamba","Sipili","Wiyumiririe","Lamuria","Ol Moran"],
  "Lamu": ["Lamu","Mpeketoni","Witu","Faza","Hindi","Mokowe","Kiunga","Shela","Mkunumbi"],
  "Machakos": ["Machakos","Athi River","Mlolongo","Syokimau","Kangundo","Tala","Matuu","Masii","Kathiani","Mwala","Kithimani","Mitaboni","Joska","Masinga","Wamunyu","Kyumbi"],
  "Makueni": ["Wote","Mtito Andei","Emali","Sultan Hamud","Kibwezi","Makindu","Kikima","Nunguni","Kasikeu","Mbumbuni","Tawa","Kambu","Salama","Kalamba"],
  "Mandera": ["Mandera","El Wak","Rhamu","Takaba","Banissa","Lafey"],
  "Marsabit": ["Marsabit","Moyale","Laisamis","North Horr","Loiyangalani","Sololo","Kalacha","Maikona"],
  "Meru": ["Meru","Maua","Nkubu","Timau","Mitunguu","Kianjai","Laare","Mikinduri","Githongo","Kanyakine","Kariene","Kibirichia","Igoji"],
  "Migori": ["Migori","Rongo","Awendo","Isebania","Uriri","Kehancha","Muhoroni","Ntimaru","Sori","Macalder"],
  "Mombasa": ["Mombasa","Likoni","Nyali","Bamburi","Changamwe","Kisauni","Shanzu","Mikindani","Mtongwe","Port Reitz","Mshomoroni","Jomvu","Tudor","Kongowea","Bombolulu"],
  "Murang'a": ["Murang'a","Kangema","Kandara","Kenol","Makuyu","Maragua","Kiriaini","Kigumo","Kangari","Saba Saba","Sabasaba","Gatura","Kahuro","Kiharu"],
  "Nairobi": [],
  "Nakuru": ["Nakuru","Naivasha","Gilgil","Molo","Njoro","Elburgon","Subukia","Bahati","Mau Narok","Salgaa","Lanet","Kabarak","Rongai","Mai Mahiu","Olenguruone","Keringet","Kuresoi","Dundori"],
  "Nandi": ["Kapsabet","Nandi Hills","Mosoriot","Kabiyet","Kobujoi","Lessos","Kaiboi","Chepterit","Baraton","Kipkaren","Serem","Kaptumo"],
  "Narok": ["Narok","Kilgoris","Ololulunga","Nairegia Enkare","Suswa","Ntulele","Mai Mahiu","Lolgorian","Ewaso Ngiro","Sogoo","Aitong"],
  "Nyamira": ["Nyamira","Keroka","Nyansiongo","Ekerenyo","Manga","Magwagwa","Kebirigo","Nyaramba"],
  "Nyandarua": ["Ol Kalou","Engineer","Njabini","Ndaragwa","Ol Joro Orok","Mirangine","Kinangop","Miharati","Kasuku"],
  "Nyeri": ["Nyeri","Karatina","Othaya","Mukurweini","Naro Moru","Chaka","Kiganjo","Endarasha","Mweiga","Kamakwa","Ruring'u","Kiamariga"],
  "Samburu": ["Maralal","Baragoi","Archers Post","Wamba","Kisima","Suguta Marmar","South Horr"],
  "Siaya": ["Siaya","Bondo","Ugunja","Usenge","Yala","Ukwala","Sega","Aram","Madiany","Akala","Ndori"],
  "Taita Taveta": ["Voi","Wundanyi","Taveta","Mwatate","Maungu","Bura","Mghange","Kasigau"],
  "Tana River": ["Hola","Garsen","Bura","Madogo","Kipini","Ngao","Tarasaa"],
  "Tharaka Nithi": ["Chuka","Chogoria","Marimanti","Kathwana","Gatunga","Kibugua","Kaanwa","Mukothima"],
  "Trans Nzoia": ["Kitale","Kiminini","Endebess","Saboti","Kwanza","Sibanga","Moi's Bridge","Maili Saba","Kachibora"],
  "Turkana": ["Lodwar","Kakuma","Lokichoggio","Lokichar","Kalokol","Lokitaung","Kainuk","Lorugum"],
  "Uasin Gishu": ["Eldoret","Burnt Forest","Turbo","Moi's Bridge","Kesses","Ziwa","Matunda","Soy","Kapseret","Cheptiret","Kaptagat","Plateau","Moiben"],
  "Vihiga": ["Mbale","Vihiga","Luanda","Chavakali","Majengo","Hamisi","Serem","Kaimosi","Sabatia","Emuhaya","Gisambai"],
  "Wajir": ["Wajir","Habaswein","Griftu","Bute","Eldas","Tarbaj","Buna","Diif"],
  "West Pokot": ["Kapenguria","Makutano","Chepareria","Ortum","Sigor","Alale","Kacheliba","Lomut","Kongelai"],
};

// Well-known places missing from GeoNames (or spelled differently there): approximate town centres
const MANUAL = {
  "Kajiado": [["Namanga", -2.545, 36.787]],
  "Machakos": [["Syokimau", -1.358, 36.935]],
  "Nakuru": [["Kabarak", -0.166, 35.966], ["Mai Mahiu", -1.006, 36.586], ["Salgaa", -0.212, 35.83]],
  "Mombasa": [["Nyali", -4.034, 39.705], ["Bombolulu", -4.018, 39.692], ["Mtongwe", -4.087, 39.63], ["Port Reitz", -4.03, 39.612], ["Mikindani", -4.018, 39.62]],
  "Isiolo": [["Garbatulla", 0.533, 38.517]],
  "Kisumu": [["Kondele", -0.09, 34.77]],
  "Narok": [["Suswa", -1.152, 36.355], ["Ololulunga", -1.02, 35.66], ["Lolgorian", -1.233, 34.817]],
  "Garissa": [["Masalani", -1.7, 40.13], ["Modogashe", 0.733, 39.183]],
  "Marsabit": [["Sololo", 3.55, 38.65]],
  "Mandera": [["Rhamu", 3.933, 41.217]],
  "Bungoma": [["Bumula", 0.567, 34.433]],
  "Uasin Gishu": [["Kapseret", 0.47, 35.23], ["Cheptiret", 0.43, 35.39], ["Ziwa", 0.58, 35.32]],
};

const norm = (s) => s.toLowerCase().replace(/county/g, "").replace(/elegeyo/g, "elgeyo").replace(/[^a-z]/g, "");
const cleanName = (s) => s.replace(/[‘’`]/g, "'");
const key = (s) => cleanName(s).toLowerCase().replace(/[^a-z]/g, "");

// admin1 code -> app county
const codeToCounty = {};
for (const line of readFileSync(path.join(dir, "admin1.txt"), "utf8").split("\n")) {
  const [code, name] = line.split("\t");
  if (!code?.startsWith("KE.")) continue;
  const county = APP_COUNTIES.find((c) => norm(c) === norm(name));
  if (!county) throw new Error("No app county for " + name);
  codeToCounty[code.slice(3)] = county;
}

// Index populated places by county
const places = {}; // county -> [{name, lat, lng, pop, alt:Set}]
for (const line of readFileSync(path.join(dir, "KE.txt"), "utf8").split("\n")) {
  const f = line.split("\t");
  if (f[6] !== "P") continue;
  const county = codeToCounty[f[10]];
  if (!county) continue;
  const alt = new Set([key(f[1]), key(f[2]), ...(f[3] ? f[3].split(",").map(key) : [])]);
  (places[county] ||= []).push({ name: cleanName(f[1]), lat: +f[4], lng: +f[5], pop: +f[14] || 0, code: f[7], alt });
}

const allPlaces = Object.values(places).flat();
const result = {};
const missing = [];
for (const county of APP_COUNTIES) {
  const list = places[county] || [];
  const towns = new Map(); // key -> {name, center, pop}
  const add = (name, p) => {
    const k = key(name);
    if (towns.has(k)) return;
    // skip near-duplicates (same spot, different spelling)
    for (const t of towns.values()) {
      if (Math.abs(t.center[0] - p.lat) < 0.005 && Math.abs(t.center[1] - p.lng) < 0.005) return;
    }
    towns.set(k, { name, center: [+p.lat.toFixed(4), +p.lng.toFixed(4)], pop: p.pop });
  };
  // 1. hand list, coordinates from GeoNames (prefer exact name, then alternate names; biggest first)
  for (const name of EXTRA[county] || []) {
    const k = key(name);
    const hits = list.filter((p) => key(p.name) === k).concat(list.filter((p) => key(p.name) !== k && p.alt.has(k)));
    hits.sort((a, b) => b.pop - a.pop);
    if (hits[0]) { add(name, hits[0]); continue; }
    // Not filed under this county in GeoNames: accept a nationwide match only if it lies
    // within ~70 km of this county's main town (first hand-listed town that was found).
    const anchor = list.find((p) => key(p.name) === key((EXTRA[county] || [])[0] || "")) || list.sort((a, b) => b.pop - a.pop)[0];
    const near = allPlaces
      .filter((p) => (key(p.name) === k || p.alt.has(k)) && anchor &&
        Math.hypot(p.lat - anchor.lat, p.lng - anchor.lng) < 0.65)
      .sort((a, b) => b.pop - a.pop);
    if (near[0]) add(name, near[0]); else missing.push(`${county}: ${name}`);
  }
  // 2. every GeoNames town with a population figure, or that is a county seat
  for (const p of list.filter((p) => p.pop > 0 || p.code.startsWith("PPLA")).sort((a, b) => b.pop - a.pop)) {
    add(p.name, p);
  }
  for (const [name, lat, lng] of MANUAL[county] || []) {
    const i = missing.indexOf(`${county}: ${name}`);
    if (i >= 0) missing.splice(i, 1);
    add(name, { lat, lng, pop: 0 });
  }
  result[county] = [...towns.values()].map(({ name, center }) => ({ name, center }));
}

const header = `// Generated from GeoNames (https://www.geonames.org, CC BY 4.0) plus a hand-picked
// list of well-known towns. Regenerate rather than editing by hand.
// Towns per county, merged with the hand-curated towns/estates in kenya-locations.ts.
`;
const body = `export const EXTRA_TOWNS: Record<string, { name: string; center: [number, number] }[]> = ${JSON.stringify(result, null, 2)
  .replace(/\[\n\s+(-?[\d.]+),\n\s+(-?[\d.]+)\n\s+\]/g, "[$1, $2]")};\n`;
writeFileSync(out, header + body);

const counts = Object.entries(result).map(([c, t]) => [c, t.length]).sort((a, b) => a[1] - b[1]);
console.log("total towns:", counts.reduce((s, [, n]) => s + n, 0));
console.log("fewest:", counts.slice(0, 8).map(([c, n]) => `${c}=${n}`).join(", "));
console.log("not found in GeoNames (" + missing.length + "):", missing.join("; "));
