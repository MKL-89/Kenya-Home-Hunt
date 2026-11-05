// County photos from Wikimedia Commons (free licences; credit shown on each tile).
// Chosen by hand from candidates on each county's Wikipedia article.
export interface CountyPhoto {
  url: string;
  credit: string;
  license: string;
  /** Wikimedia Commons file page with the full licence and author details */
  source: string;
}

export const COUNTY_PHOTOS: Record<string, CountyPhoto> = {
  "Baringo": {
    "url": "https://thumb.wikimedia.org/wikipedia/commons/thumb/5/56/Kirandich_Dam%2C_Kabarnet_Town%2C_Kenya.jpg/960px-Kirandich_Dam%2C_Kabarnet_Town%2C_Kenya.jpg",
    "credit": "Jessekekule",
    "license": "CC BY-SA 4.0",
    "source": "https://commons.wikimedia.org/wiki/File:Kirandich_Dam,_Kabarnet_Town,_Kenya.jpg"
  },
  "Bomet": {
    "url": "https://thumb.wikimedia.org/wikipedia/commons/thumb/5/50/Bomet-Tea.jpg/960px-Bomet-Tea.jpg",
    "credit": "Kipkorir Cheruiyot",
    "license": "CC BY-SA 4.0",
    "source": "https://commons.wikimedia.org/wiki/File:Bomet-Tea.jpg"
  },
  "Bungoma": {
    "url": "https://thumb.wikimedia.org/wikipedia/commons/thumb/7/7f/Church_street.jpg/960px-Church_street.jpg",
    "credit": "Leo Hempstone",
    "license": "CC0",
    "source": "https://commons.wikimedia.org/wiki/File:Church_street.jpg"
  },
  "Busia": {
    "url": "https://thumb.wikimedia.org/wikipedia/commons/thumb/4/4f/Busia_2018_08.jpg/960px-Busia_2018_08.jpg",
    "credit": "LutzBruno",
    "license": "CC BY-SA 4.0",
    "source": "https://commons.wikimedia.org/wiki/File:Busia_2018_08.jpg"
  },
  "Elgeyo Marakwet": {
    "url": "https://thumb.wikimedia.org/wikipedia/commons/thumb/9/99/Elgeyo_marakwet_valley.jpg/960px-Elgeyo_marakwet_valley.jpg",
    "credit": "Pngobiro",
    "license": "CC BY-SA 3.0",
    "source": "https://commons.wikimedia.org/wiki/File:Elgeyo_marakwet_valley.jpg"
  },
  "Embu": {
    "url": "https://thumb.wikimedia.org/wikipedia/commons/thumb/3/32/Runyenjes_Law_Court_Building.jpg/960px-Runyenjes_Law_Court_Building.jpg",
    "credit": "Kwachified",
    "license": "CC BY-SA 4.0",
    "source": "https://commons.wikimedia.org/wiki/File:Runyenjes_Law_Court_Building.jpg"
  },
  "Garissa": {
    "url": "https://thumb.wikimedia.org/wikipedia/commons/thumb/0/04/Garissa%2C_Kenya_-_panoramio_%284%29.jpg/960px-Garissa%2C_Kenya_-_panoramio_%284%29.jpg",
    "credit": "Adam H T Geelle",
    "license": "CC BY 3.0",
    "source": "https://commons.wikimedia.org/wiki/File:Garissa,_Kenya_-_panoramio_(4).jpg"
  },
  "Homa Bay": {
    "url": "https://thumb.wikimedia.org/wikipedia/commons/thumb/9/99/HomaBay.jpg/960px-HomaBay.jpg",
    "credit": "Valerius Tygart",
    "license": "CC BY-SA 3.0",
    "source": "https://commons.wikimedia.org/wiki/File:HomaBay.jpg"
  },
  "Isiolo": {
    "url": "https://thumb.wikimedia.org/wikipedia/commons/thumb/4/48/Isiolo-_Marsabit_Highway.jpg/960px-Isiolo-_Marsabit_Highway.jpg",
    "credit": "Ephymbaya",
    "license": "CC BY-SA 4.0",
    "source": "https://commons.wikimedia.org/wiki/File:Isiolo-_Marsabit_Highway.jpg"
  },
  "Kajiado": {
    "url": "https://thumb.wikimedia.org/wikipedia/commons/thumb/d/d5/A104_Kenya_at_Kajiado.jpg/960px-A104_Kenya_at_Kajiado.jpg",
    "credit": "Guillaume Baviere from Helsingborg, Sw…",
    "license": "CC BY 2.0",
    "source": "https://commons.wikimedia.org/wiki/File:A104_Kenya_at_Kajiado.jpg"
  },
  "Kakamega": {
    "url": "https://thumb.wikimedia.org/wikipedia/commons/thumb/e/e6/CryingStone.jpg/960px-CryingStone.jpg",
    "credit": "KilaKabila",
    "license": "CC BY-SA 3.0",
    "source": "https://commons.wikimedia.org/wiki/File:CryingStone.jpg"
  },
  "Kericho": {
    "url": "https://thumb.wikimedia.org/wikipedia/commons/thumb/d/d8/Kenya-Tealand-Near-Kericho-2012.JPG/960px-Kenya-Tealand-Near-Kericho-2012.JPG",
    "credit": "Bjørn Christian Tørrissen",
    "license": "CC BY-SA 3.0",
    "source": "https://commons.wikimedia.org/wiki/File:Kenya-Tealand-Near-Kericho-2012.JPG"
  },
  "Kiambu": {
    "url": "https://thumb.wikimedia.org/wikipedia/commons/thumb/1/15/Thika_Road_super_highway.jpeg/960px-Thika_Road_super_highway.jpeg",
    "credit": "Xelawafs",
    "license": "CC BY-SA 3.0",
    "source": "https://commons.wikimedia.org/wiki/File:Thika_Road_super_highway.jpeg"
  },
  "Kilifi": {
    "url": "https://thumb.wikimedia.org/wikipedia/commons/thumb/1/1f/Malindi_town_view.jpg/960px-Malindi_town_view.jpg",
    "credit": "Mtl1969",
    "license": "Public domain",
    "source": "https://commons.wikimedia.org/wiki/File:Malindi_town_view.jpg"
  },
  "Kirinyaga": {
    "url": "https://thumb.wikimedia.org/wikipedia/commons/thumb/7/7d/Mwea%2CKenya.jpg/960px-Mwea%2CKenya.jpg",
    "credit": "Dj.ndrizy",
    "license": "CC BY-SA 4.0",
    "source": "https://commons.wikimedia.org/wiki/File:Mwea,Kenya.jpg"
  },
  "Kisii": {
    "url": "https://upload.wikimedia.org/wikipedia/commons/f/f7/Kisii_Golf_course.jpg",
    "credit": "Engdamian",
    "license": "CC BY-SA 3.0",
    "source": "https://commons.wikimedia.org/wiki/File:Kisii_Golf_course.jpg"
  },
  "Kisumu": {
    "url": "https://thumb.wikimedia.org/wikipedia/commons/thumb/6/69/Kisumu_shore.jpg/960px-Kisumu_shore.jpg",
    "credit": "Victor O'",
    "license": "CC BY-SA 2.0",
    "source": "https://commons.wikimedia.org/wiki/File:Kisumu_shore.jpg"
  },
  "Kitui": {
    "url": "https://thumb.wikimedia.org/wikipedia/commons/thumb/2/2f/Yellow_sunset_at_Tsavo_East_National_Park.jpg/960px-Yellow_sunset_at_Tsavo_East_National_Park.jpg",
    "credit": "Bkmiles",
    "license": "CC BY-SA 3.0",
    "source": "https://commons.wikimedia.org/wiki/File:Yellow_sunset_at_Tsavo_East_National_Park.jpg"
  },
  "Kwale": {
    "url": "https://thumb.wikimedia.org/wikipedia/commons/thumb/5/5b/Diani_Beach_Kenya.jpg/960px-Diani_Beach_Kenya.jpg",
    "credit": "Bkmiles",
    "license": "CC BY-SA 3.0",
    "source": "https://commons.wikimedia.org/wiki/File:Diani_Beach_Kenya.jpg"
  },
  "Laikipia": {
    "url": "https://thumb.wikimedia.org/wikipedia/commons/thumb/c/c1/Majengo_Nanyuki.jpg/960px-Majengo_Nanyuki.jpg",
    "credit": "ChriKo",
    "license": "CC BY-SA 3.0",
    "source": "https://commons.wikimedia.org/wiki/File:Majengo_Nanyuki.jpg"
  },
  "Lamu": {
    "url": "https://thumb.wikimedia.org/wikipedia/commons/thumb/4/49/Lamu%2C_Lamu_Island%2C_Kenya.jpg/960px-Lamu%2C_Lamu_Island%2C_Kenya.jpg",
    "credit": "Erik (HASH) Hersman from Orlando",
    "license": "CC BY 2.0",
    "source": "https://commons.wikimedia.org/wiki/File:Lamu,_Lamu_Island,_Kenya.jpg"
  },
  "Machakos": {
    "url": "https://thumb.wikimedia.org/wikipedia/commons/thumb/f/fe/Section_of_Machakos_People%27s_Park.jpg/960px-Section_of_Machakos_People%27s_Park.jpg",
    "credit": "Nairobi123",
    "license": "CC BY-SA 4.0",
    "source": "https://commons.wikimedia.org/wiki/File:Section_of_Machakos_People%27s_Park.jpg"
  },
  "Makueni": {
    "url": "https://thumb.wikimedia.org/wikipedia/commons/thumb/c/cb/Wote%2C_Kenya.jpg/960px-Wote%2C_Kenya.jpg",
    "credit": "Giovanni Cerretani",
    "license": "CC BY-SA 4.0",
    "source": "https://commons.wikimedia.org/wiki/File:Wote,_Kenya.jpg"
  },
  "Mandera": {
    "url": "https://upload.wikimedia.org/wikipedia/commons/c/c4/Degmada_mandheera_---Mandheera_waa_magaalo_ku_taalo_dalka_Kenya-magaalada_waxee_xuduud_la_leedahay_Soomaaliya_iyo_itoobiya-magaalada_waxee_ka_midtahay_gobolka_Waqooyi_bari%2C_waa_meesha_ee_soomaalida_ku_badantah_2013-06-28_05-14.jpg",
    "credit": "Binukaaf",
    "license": "CC BY-SA 3.0",
    "source": "https://commons.wikimedia.org/wiki/File:Degmada_mandheera_---Mandheera_waa_magaalo_ku_taalo_dalka_Kenya-magaalada_waxee_xuduud_la_leedahay_Soomaaliya_iyo_itoobiya-magaalada_waxee_ka_midtahay_gobolka_Waqooyi_bari,_waa_meesha_ee_soomaalida_ku_badantah_2013-06-28_05-14.jpg"
  },
  "Marsabit": {
    "url": "https://thumb.wikimedia.org/wikipedia/commons/thumb/f/f1/Marsabit-Moyale_Rd.jpg/960px-Marsabit-Moyale_Rd.jpg",
    "credit": "Lindsey Nicholson",
    "license": "CC BY 2.0",
    "source": "https://commons.wikimedia.org/wiki/File:Marsabit-Moyale_Rd.jpg"
  },
  "Meru": {
    "url": "https://thumb.wikimedia.org/wikipedia/commons/thumb/d/d3/Meru_National_Park%2C_Kenya_-_31624292046.jpg/960px-Meru_National_Park%2C_Kenya_-_31624292046.jpg",
    "credit": "Nina R",
    "license": "CC BY 2.0",
    "source": "https://commons.wikimedia.org/wiki/File:Meru_National_Park,_Kenya_-_31624292046.jpg"
  },
  "Migori": {
    "url": "https://thumb.wikimedia.org/wikipedia/commons/thumb/f/f5/Panorama_of_Migori_town.jpg/960px-Panorama_of_Migori_town.jpg",
    "credit": "Ckodero",
    "license": "CC BY-SA 4.0",
    "source": "https://commons.wikimedia.org/wiki/File:Panorama_of_Migori_town.jpg"
  },
  "Mombasa": {
    "url": "https://thumb.wikimedia.org/wikipedia/commons/thumb/c/c6/Hoping_for_custom_%285232086317%29.jpg/960px-Hoping_for_custom_%285232086317%29.jpg",
    "credit": "McKay Savage from London, UK",
    "license": "CC BY 2.0",
    "source": "https://commons.wikimedia.org/wiki/File:Hoping_for_custom_(5232086317).jpg"
  },
  "Murang'a": {
    "url": "https://thumb.wikimedia.org/wikipedia/commons/thumb/c/c9/Kenya09-Murang%27a-contesto-COSV.jpg/960px-Kenya09-Murang%27a-contesto-COSV.jpg",
    "credit": "COSV",
    "license": "CC BY-SA 3.0",
    "source": "https://commons.wikimedia.org/wiki/File:Kenya09-Murang%27a-contesto-COSV.jpg"
  },
  "Nairobi": {
    "url": "https://thumb.wikimedia.org/wikipedia/commons/thumb/a/a6/A_view_of_Nairobi_from_the_Kenyatta_International_Conference_Centre.jpg/960px-A_view_of_Nairobi_from_the_Kenyatta_International_Conference_Centre.jpg",
    "credit": "Bobokine",
    "license": "CC BY-SA 3.0",
    "source": "https://commons.wikimedia.org/wiki/File:A_view_of_Nairobi_from_the_Kenyatta_International_Conference_Centre.jpg"
  },
  "Nakuru": {
    "url": "https://thumb.wikimedia.org/wikipedia/commons/thumb/e/ee/Flamingos%2C_Lake_Nakuru.jpg/960px-Flamingos%2C_Lake_Nakuru.jpg",
    "credit": "Paul Mannix",
    "license": "CC BY-SA 2.0",
    "source": "https://commons.wikimedia.org/wiki/File:Flamingos,_Lake_Nakuru.jpg"
  },
  "Nandi": {
    "url": "https://thumb.wikimedia.org/wikipedia/commons/thumb/e/e0/Mogobich_Valley%2C_Nandi_Hills.jpg/960px-Mogobich_Valley%2C_Nandi_Hills.jpg",
    "credit": "Eren Gatiat",
    "license": "CC BY-SA 4.0",
    "source": "https://commons.wikimedia.org/wiki/File:Mogobich_Valley,_Nandi_Hills.jpg"
  },
  "Narok": {
    "url": "https://thumb.wikimedia.org/wikipedia/commons/thumb/4/41/Hot_Air_Balloon_Safari_in_Maasai_Mara.jpg/960px-Hot_Air_Balloon_Safari_in_Maasai_Mara.jpg",
    "credit": "Wajahatmr",
    "license": "CC BY-SA 3.0",
    "source": "https://commons.wikimedia.org/wiki/File:Hot_Air_Balloon_Safari_in_Maasai_Mara.jpg"
  },
  "Nyamira": {
    "url": "https://upload.wikimedia.org/wikipedia/commons/1/1e/Nyamira%2C_Kenya_-_panoramio.jpg",
    "credit": "Banja-Frans Mulder",
    "license": "CC BY 3.0",
    "source": "https://commons.wikimedia.org/wiki/File:Nyamira,_Kenya_-_panoramio.jpg"
  },
  "Nyandarua": {
    "url": "https://thumb.wikimedia.org/wikipedia/commons/thumb/6/6a/Aberdare_Ranges.jpg/960px-Aberdare_Ranges.jpg",
    "credit": "Raidarmax",
    "license": "CC BY-SA 3.0",
    "source": "https://commons.wikimedia.org/wiki/File:Aberdare_Ranges.jpg"
  },
  "Nyeri": {
    "url": "https://thumb.wikimedia.org/wikipedia/commons/thumb/7/7c/Mount_Kenya.jpg/960px-Mount_Kenya.jpg",
    "credit": "No machine-readable author provided. H…",
    "license": "CC BY 2.5",
    "source": "https://commons.wikimedia.org/wiki/File:Mount_Kenya.jpg"
  },
  "Samburu": {
    "url": "https://thumb.wikimedia.org/wikipedia/commons/thumb/8/8f/Mt._Ololokwe_Samburu.jpg/960px-Mt._Ololokwe_Samburu.jpg",
    "credit": "Antony Trivet",
    "license": "CC BY-SA 4.0",
    "source": "https://commons.wikimedia.org/wiki/File:Mt._Ololokwe_Samburu.jpg"
  },
  "Siaya": {
    "url": "https://thumb.wikimedia.org/wikipedia/commons/thumb/f/f1/Siaya_City_Center.JPG/960px-Siaya_City_Center.JPG",
    "credit": "Christian Dubois",
    "license": "Public domain",
    "source": "https://commons.wikimedia.org/wiki/File:Siaya_City_Center.JPG"
  },
  "Taita Taveta": {
    "url": "https://thumb.wikimedia.org/wikipedia/commons/thumb/6/6d/Aerial_view_of_Voi_town_CBD_towards_the_west.jpg/960px-Aerial_view_of_Voi_town_CBD_towards_the_west.jpg",
    "credit": "TTC dude",
    "license": "CC BY-SA 4.0",
    "source": "https://commons.wikimedia.org/wiki/File:Aerial_view_of_Voi_town_CBD_towards_the_west.jpg"
  },
  "Tana River": {
    "url": "https://thumb.wikimedia.org/wikipedia/commons/thumb/0/0d/DM-SD-01-06042.jpg/960px-DM-SD-01-06042.jpg",
    "credit": "SGT R.A. WARD",
    "license": "Public domain",
    "source": "https://commons.wikimedia.org/wiki/File:DM-SD-01-06042.jpg"
  },
  "Tharaka Nithi": {
    "url": "https://thumb.wikimedia.org/wikipedia/commons/thumb/8/8f/Chuka_University_Students_Center.jpg/960px-Chuka_University_Students_Center.jpg",
    "credit": "Kstewart24",
    "license": "CC BY-SA 4.0",
    "source": "https://commons.wikimedia.org/wiki/File:Chuka_University_Students_Center.jpg"
  },
  "Trans Nzoia": {
    "url": "https://thumb.wikimedia.org/wikipedia/commons/thumb/4/4b/DSC00670_Kitale_Airport_building_2019.jpg/960px-DSC00670_Kitale_Airport_building_2019.jpg",
    "credit": "Leovdvxxx",
    "license": "CC BY-SA 4.0",
    "source": "https://commons.wikimedia.org/wiki/File:DSC00670_Kitale_Airport_building_2019.jpg"
  },
  "Turkana": {
    "url": "https://thumb.wikimedia.org/wikipedia/commons/thumb/8/84/Lake_turkana.jpg/960px-Lake_turkana.jpg",
    "credit": "AdamPG",
    "license": "CC BY-SA 3.0",
    "source": "https://commons.wikimedia.org/wiki/File:Lake_turkana.jpg"
  },
  "Uasin Gishu": {
    "url": "https://thumb.wikimedia.org/wikipedia/commons/thumb/a/ac/Skyline_of_Eldoret_Facing_West_from_Mups_Plaza.jpg/960px-Skyline_of_Eldoret_Facing_West_from_Mups_Plaza.jpg",
    "credit": "Shadychiri",
    "license": "CC BY-SA 4.0",
    "source": "https://commons.wikimedia.org/wiki/File:Skyline_of_Eldoret_Facing_West_from_Mups_Plaza.jpg"
  },
  "Vihiga": {
    "url": "https://thumb.wikimedia.org/wikipedia/commons/thumb/b/bb/Drive_through_Mbale_town_IMG_0600_Drive_through_Mbale_town.jpg/960px-Drive_through_Mbale_town_IMG_0600_Drive_through_Mbale_town.jpg",
    "credit": "Babigumira Peter Ahabwe",
    "license": "CC BY-SA 4.0",
    "source": "https://commons.wikimedia.org/wiki/File:Drive_through_Mbale_town_IMG_0600_Drive_through_Mbale_town.jpg"
  },
  "Wajir": {
    "url": "https://thumb.wikimedia.org/wikipedia/commons/thumb/3/3b/Wajir_from_air.JPG/960px-Wajir_from_air.JPG",
    "credit": "Alex Maisuradze",
    "license": "CC BY-SA 3.0",
    "source": "https://commons.wikimedia.org/wiki/File:Wajir_from_air.JPG"
  },
  "West Pokot": {
    "url": "https://thumb.wikimedia.org/wikipedia/commons/thumb/1/16/Kapenguria_Bible_College.jpg/960px-Kapenguria_Bible_College.jpg",
    "credit": "Thecowey",
    "license": "CC BY-SA 4.0",
    "source": "https://commons.wikimedia.org/wiki/File:Kapenguria_Bible_College.jpg"
  }
};
