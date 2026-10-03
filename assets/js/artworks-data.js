/* =========================================
   GALERIE-DATEN (einzige Quelle für Titel, Technik, Maße, Kategorie, Beschreibung)
   Wird nur auf Seiten mit Galerie, Lightbox oder Favoriten geladen
   (Home.html, Bildergalerie.html, Auftrag.html) – immer VOR Home.min.js.
   Konsistenz mit Bildergalerie.html und den Bilddateien prüft `npm run check:gallery`.

   Pflichtfelder: title, technik, masse, kategorie (landschaften|tiere|pflanzen|sonstiges), desc.
   Optional:      status ("verfuegbar" | "reserviert" | "verkauft") – zeigt in der Lightbox
                  die Zeile „Verfügbarkeit“. Ohne status bleibt die Zeile ausgeblendet.
   ========================================= */
const ARTWORKS_METADATA = {
    "DSC_6622a": {
        "title": "Godesburg modern",
        "technik": "Multimediatechnik auf Papier",
        "masse": "40 × 50 cm",
        "kategorie": "landschaften",
        "desc": "Eines meiner Lieblingsmotive ist die Godesburg in Bad Godesberg. Hier habe ich sie in einer modernen, ausdrucksstarken Multimediatechnik dargestellt."
    },
    "DSC_6624a": {
        "title": "Siebengebirge Panorama",
        "technik": "Acryl auf Leinwand",
        "masse": "60 × 70 cm",
        "kategorie": "landschaften",
        "desc": "Auf einer ausgedehnten Wanderung durch das Siebengebirge musste ich diese stimmungsvolle Wald- und Weitblick-Ansicht auf Leinwand festhalten."
    },
    "DSC_6626a": {
        "title": "Bad Godesberg City mit Godesburg",
        "technik": "Öl auf Leinwand",
        "masse": "40 × 50 cm",
        "kategorie": "landschaften",
        "desc": "Diese Ansicht zeigt die historische Godesburg in Bad Godesberg, gesehen vom blühenden Stadtpark aus."
    },
    "DSC_6628a": {
        "title": "Pförtnerhäuschen am Klufterhof Friesdorf",
        "technik": "Öl auf Leinwand",
        "masse": "18 × 24 cm",
        "kategorie": "sonstiges",
        "desc": "Das malerische Pförtnerhäuschen in Bad Godesberg-Friesdorf gehört zum denkmalgeschützten Klufterhof-Ensemble."
    },
    "DSC_6630a": {
        "title": "Friesdorf Annaberger Straße",
        "technik": "Öl auf Leinwand",
        "masse": "30 × 24 cm",
        "kategorie": "landschaften",
        "desc": "Das historische Turmhaus aus dem 12. Jahrhundert und die Annaberger Straße im Herzen von Bad Godesberg-Friesdorf."
    },
    "DSC_6632a": {
        "title": "Der Klufterhof Friesdorf",
        "technik": "Öl auf Leinwand",
        "masse": "30 × 40 cm",
        "kategorie": "landschaften",
        "desc": "Der Klufterhof in Friesdorf ist eines der ältesten und schönsten Fachwerkhäuser der Region aus dem frühen 17. Jahrhundert."
    },
    "DSC_6634a": {
        "title": "Drachenfels am Rhein (Ansicht Nähe Mehlem)",
        "technik": "Öl auf Leinwand",
        "masse": "60 × 70 cm",
        "kategorie": "landschaften",
        "desc": "Bei meinen zahlreichen Spaziergängen entlang der Rheinpromenade kann ich diesen wunderbaren Anblick auf den Drachenfels genießen."
    },
    "DSC_6636a": {
        "title": "Drachenfels am Rhein im Sommer",
        "technik": "Acryl auf Leinwand",
        "masse": "60 × 70 cm",
        "kategorie": "landschaften",
        "desc": "Diesen herrlichen Anblick auf den geschichtsträchtigen Drachenfels kann man von einer sonnigen Bank in Bad Godesberg-Mehlem genießen."
    },
    "DSC_6638a": {
        "title": "Godesburg im Sommerlicht",
        "technik": "Acryl auf Leinwand",
        "masse": "30 × 24 cm",
        "kategorie": "landschaften",
        "desc": "Die Godesburg in Bad Godesberg unter strahlend blauem Sommerhimmel mit lebhaften Grünschattierungen."
    },
    "DSC_6640a": {
        "title": "Gasthaus „Zur Lindenwirtin“ mit Godesburg",
        "technik": "Öl auf Leinwand",
        "masse": "30 × 40 cm",
        "kategorie": "landschaften",
        "desc": "Dieses Werk zeigt eine historische Ansicht des traditionsreichen Gasthauses „Zur Lindenwirtin“ mit der majestätischen Godesburg im Hintergrund."
    },
    "DSC_6642a": {
        "title": "Spazierweg Rheinaue Bonn",
        "technik": "Acryl auf Leinwand",
        "masse": "40 × 50 cm",
        "kategorie": "landschaften",
        "desc": "Ein idyllischer Spazierweg im Bonner Rheinauenpark führt an diesen wunderschönen, knorrigen alten Parkbäumen vorbei."
    },
    "DSC_6644a": {
        "title": "Historische Godesburg Ansicht",
        "technik": "Acryl auf Leinwand",
        "masse": "30 × 40 cm",
        "kategorie": "landschaften",
        "desc": "Vertikale Architekturstudie der Godesburg mit sanft geschwungenen Hangwegen und warmen Steinfarben."
    },
    "DSC_6688a": {
        "title": "Blumenbouquet",
        "technik": "Acryl auf Karton",
        "masse": "30 × 30 cm",
        "kategorie": "pflanzen",
        "desc": "Farbenfrohes, lebensfrohes Blumenbouquet mit kontrastreichen Blütenarrangements in geschichteter Acryltechnik."
    },
    "DSC_6689a": {
        "title": "Kleines Blumenbouquet",
        "technik": "Öl auf Karton",
        "masse": "30 × 30 cm",
        "kategorie": "pflanzen",
        "desc": "Zartes und detailreiches Blumenbouquet in feiner Ölmalerei mit weichen Übergängen und warmen Blütennuancen."
    },
    "DSC_6693a": {
        "title": "Schafe auf Texel",
        "technik": "Öl auf Leinwand",
        "masse": "30 × 40 cm",
        "kategorie": "tiere",
        "desc": "Im Urlaub auf der Nordseeinsel Texel begegneten uns diese neugierigen, liebenswerten Schafe auf den grünen Deichen."
    },
    "DSC_6696a": {
        "title": "Eulen im Kottenforst",
        "technik": "Öl auf Leinwand",
        "masse": "30 × 40 cm",
        "kategorie": "tiere",
        "desc": "Zwei kleine Eulen nebeneinander auf einem Ast im dämmrigen Kottenforst Bad Godesberg vor geheimnisvoll blauem Hintergrund."
    },
    "DSC_6698a": {
        "title": "Blumen modern",
        "technik": "Acryl auf Leinwand",
        "masse": "60 × 70 cm",
        "kategorie": "pflanzen",
        "desc": "Moderne florale Abstraktion mit dynamischen Pinselstrichen und kräftigen Farbflächen auf großzügigem Leinwandformat."
    },
    "DSC_6700a": {
        "title": "Blütenharmonie im Garten",
        "technik": "Acryl auf Leinwand",
        "masse": "50 × 60 cm",
        "kategorie": "pflanzen",
        "desc": "Frische Blütenkomposition voller Leuchtkraft und natürlicher Eleganz."
    },
    "DSC_6702a": {
        "title": "Lustige Hühner",
        "technik": "Acryl auf Leinwand",
        "masse": "30 × 60 cm",
        "kategorie": "tiere",
        "desc": "Eine heitere Reihe bunter Hühner im charmanten Breitwand-Querformat – voller Lebensfreude und Witz."
    },
    "DSC_6703a": {
        "title": "Mohnblumenwiese",
        "technik": "Acryl auf Leinwand",
        "masse": "60 × 70 cm",
        "kategorie": "pflanzen",
        "desc": "Leuchtend rote Sommer-Mohnblumen wiegen sich im Wind auf einer sonnendurchfluteten Wiese."
    },
    "DSC_6705a": {
        "title": "Bunte Tulpenpracht",
        "technik": "Acryl auf Leinwand",
        "masse": "40 × 40 cm",
        "kategorie": "pflanzen",
        "desc": "Farbenfrohe Frühlings-Tulpen in leuchtenden Acrylfarben im quadratischen Format."
    },
    "DSC_6707a": {
        "title": "Heuballen an der französischen Atlantikküste",
        "technik": "Öl auf Leinwand",
        "masse": "40 × 50 cm",
        "kategorie": "landschaften",
        "desc": "Der Duft der frischen Heuballen an der französischen Atlantikküste inspirierte mich zu diesem Bild – man kann die Sommerbrise förmlich spüren."
    },
    "DSC_6710a": {
        "title": "Dünenweg an der französischen Atlantikküste",
        "technik": "Acryl auf Leinwand",
        "masse": "100 × 150 cm",
        "kategorie": "landschaften",
        "desc": "Dünenwege laden zur vollkommenen Entspannung ein. Dieser zauberhafte Pfad führt durch den weichen Dünensand direkt ans Meer."
    },
    "DSC_6711a": {
        "title": "Muschel am Strand",
        "technik": "Acryl auf Leinwand",
        "masse": "40 × 50 cm",
        "kategorie": "sonstiges",
        "desc": "Eine einsame Meeresmuschel im warmen Küstensand mit sanften Licht- und Schattenspielen des Meeres."
    },
    "DSC_6713a": {
        "title": "Leuchtturm auf Texel",
        "technik": "Acryl auf Leinwand",
        "masse": "24 × 30 cm",
        "kategorie": "landschaften",
        "desc": "Zahlreiche Urlaube führten uns nach Texel – der weithin sichtbare rote Leuchtturm im Norden der Insel durfte als Motiv nicht fehlen."
    },
    "DSC_6715a": {
        "title": "Spazierweg Friedhof Dottendorf (I)",
        "technik": "Ölkreide auf Papier, Rahmen aus Birkenholz",
        "masse": "33 × 43 cm",
        "kategorie": "landschaften",
        "desc": "Auf Parkbänken kann man wunderbar entspannen und diese friedliche Lieblingsansicht mit sanfter Ölkreide festhalten."
    },
    "DSC_6717a": {
        "title": "Spazierweg am Blausteinsee Eschweiler",
        "technik": "Ölkreide auf Papier, Rahmen aus Birkenholz",
        "masse": "33 × 43 cm",
        "kategorie": "landschaften",
        "desc": "Ein beliebtes Ausflugsziel in der Natur nahe Aachen: Der friedliche Uferweg am Blausteinsee."
    },
    "DSC_6719a": {
        "title": "Spazierweg Friedhof Dottendorf (II)",
        "technik": "Ölkreide auf Papier, Rahmen aus Birkenholz",
        "masse": "33 × 43 cm",
        "kategorie": "landschaften",
        "desc": "Zarte Birkenbäume und herbstliche Stille in Bonn-Dottendorf – handgerahmt in edlem Birkenholz."
    },
    "DSC_6722a": {
        "title": "Waldweg Kottenforst Bonn",
        "technik": "Acryl auf Leinwand",
        "masse": "30 × 90 cm",
        "kategorie": "landschaften",
        "desc": "Dieser sonnendurchflutete Waldweg im Bonner Kottenforst ist einer meiner absoluten Lieblingswege zu jeder Jahreszeit."
    },
    "DSC_6740a": {
        "title": "Tulpenbouquet in Öl",
        "technik": "Öl auf Leinwand",
        "masse": "40 × 40 cm",
        "kategorie": "pflanzen",
        "desc": "Klassische botanische Ölmalerei mit feinen Farbabstufungen und samtigem Glanz."
    },
    "DSC_6742a": {
        "title": "Balou – Hundeportrait in Öl",
        "technik": "Öl auf Leinwand",
        "masse": "40 × 40 cm",
        "kategorie": "tiere",
        "desc": "Unser Familienhund Balou mit seinem treuen Blick und samtweichem Fell in klassischer Ölmalerei verewigt."
    },
    "DSC_6744a": {
        "title": "Balou – Hundeportrait modern",
        "technik": "Acryl auf Leinwand",
        "masse": "40 × 50 cm",
        "kategorie": "tiere",
        "desc": "Moderne Porträtstudie von Balou mit mutigen Farbkontrasten und ausdrucksstarkem Charakter."
    },
    "DSC_6747a": {
        "title": "Balou – Hundeportrait Acryl",
        "technik": "Acryl auf Leinwand",
        "masse": "40 × 50 cm",
        "kategorie": "tiere",
        "desc": "Fein ausgearbeitetes Acrylportrait von Balou mit lebendigen Lichtreflexen in den Augen."
    },
    "DSC_6749a": {
        "title": "Magnolientraum",
        "technik": "Acryl auf Leinwand",
        "masse": "40 × 50 cm",
        "kategorie": "pflanzen",
        "desc": "So eine traumhafte Ansicht erhält man, wenn man im Frühling von unten in einen blühenden rosa Magnolienbaum schaut."
    },
    "DSC_6751a": {
        "title": "Klassisches Stillleben",
        "technik": "Öl auf Leinwand",
        "masse": "40 × 50 cm",
        "kategorie": "sonstiges",
        "desc": "Meisterhaft ausgeleuchtetes Stillleben in traditioneller Schichtölmalerei mit harmonischer Raumtiefe."
    },
    "DSC_6753a": {
        "title": "Rote Paprikaschote",
        "technik": "Acryl auf Leinwand",
        "masse": "19 × 19 cm",
        "kategorie": "sonstiges",
        "desc": "Frische, glänzende Paprikaschote im modernen Kleinformat mit knackigen Glanzlichtern."
    },
    "DSC_6754a": {
        "title": "Zitronen",
        "technik": "Öl auf Leinwand",
        "masse": "19 × 19 cm",
        "kategorie": "sonstiges",
        "desc": "Sonnengereifte Zitronen mit samtiger Schalenstruktur in leuchtendem Zitronengelb."
    },
    "DSC_6757a": {
        "title": "Der gallische Hahn",
        "technik": "Acryl auf Leinwand",
        "masse": "18 × 24 cm",
        "kategorie": "tiere",
        "desc": "Stolzer gallischer Hahn mit feurigem Kamm und stolzem Blick in lebendigem Farbauftrag."
    },
    "DSC_6759a": {
        "title": "Frische Erdbeeren",
        "technik": "Acryl auf Leinwand",
        "masse": "19 × 19 cm",
        "kategorie": "sonstiges",
        "desc": "Sommerlich frische Erdbeeren im quadratischen Miniatur-Format – zum Anbeißen schön."
    },
    "DSC_6760a": {
        "title": "Erdbeeren auf blauem Teller",
        "technik": "Acryl auf Leinwand",
        "masse": "19 × 19 cm",
        "kategorie": "sonstiges",
        "desc": "Satte rote Erdbeeren im wirkungsvollen Farbkontrast auf einem kobaltblauen Keramikteller."
    },
    "DSC_6763a": {
        "title": "Bunter Hahn",
        "technik": "Acryl auf Leinwand",
        "masse": "18 × 24 cm",
        "kategorie": "tiere",
        "desc": "Lebhaftes Vogelportrait mit schillernden Gefiedertönen und charaktervoller Pose."
    },
    "DSC_6765a": {
        "title": "Rotkehlchen im Winter",
        "technik": "Acryl auf Leinwand",
        "masse": "18 × 24 cm",
        "kategorie": "tiere",
        "desc": "Ein bezauberndes Rotkehlchen auf einem Ast mit feinsten Daunen und leuchtend roter Brust."
    },
    "DSC_6767a": {
        "title": "Parfum Coco Mademoiselle",
        "technik": "Acryl auf Leinwand",
        "masse": "19 × 19 cm",
        "kategorie": "sonstiges",
        "desc": "Elegantes Stillleben des legendären Parfum-Klassikers in pudrigen Rosé- und Goldtönen."
    },
    "DSC_6768a": {
        "title": "Ast mit Zitronen",
        "technik": "Acryl auf Leinwand",
        "masse": "18 × 24 cm",
        "kategorie": "pflanzen",
        "desc": "Mediterraner Ast mit sonnengereiften Zitronen und frischen grünen Blättern vor leuchtend blauem Himmel."
    },
    "DSC_6769a": {
        "title": "Biene auf Hortensie",
        "technik": "Acryl auf Leinwand",
        "masse": "19 × 19 cm",
        "kategorie": "tiere",
        "desc": "Eine fleißige Honigbiene inmitten eines dichten Meeres himmelblauer Hortensienblüten."
    },
    "DSC_6771a": {
        "title": "Biene auf Lavendel",
        "technik": "Acryl auf Leinwand",
        "masse": "19 × 19 cm",
        "kategorie": "tiere",
        "desc": "Mediterrane Sommeridylle: Eine Biene bei der Nektarsuche auf duftendem violettem Lavendel."
    },
    "DSC_6774a": {
        "title": "Stillleben „Le petit déjeuner“",
        "technik": "Acryl auf Leinwand",
        "masse": "19 × 19 cm",
        "kategorie": "sonstiges",
        "desc": "Französisches Frühstück mit frischem Buttercroissant und Kaffee in warmem Morgenlicht."
    },
    "DSC_6775a": {
        "title": "Kühe in der Normandie (I)",
        "technik": "Acryl auf Leinwand",
        "masse": "24 × 30 cm",
        "kategorie": "tiere",
        "desc": "Diese beiden neugierigen Kühe begegneten uns bei einem erholsamen Sommerspaziergang in der Normandie."
    },
    "DSC_6778a": {
        "title": "Kühe in der Normandie (II)",
        "technik": "Acryl auf Leinwand",
        "masse": "24 × 30 cm",
        "kategorie": "tiere",
        "desc": "Typische normannische Weidekühe mit ihrer markanten Fleckung in herrlicher Küstenlandschaft."
    },
    "DSC_6780a": {
        "title": "Burger & Fries Pop-Art",
        "technik": "Acryl auf Leinwand",
        "masse": "24 × 30 cm",
        "kategorie": "sonstiges",
        "desc": "Köstlicher Burger mit knusprigen Pommes Frites als modernes, farbintensives Pop-Art Stillleben."
    },
    "DSC_6782a": {
        "title": "Seerose im Botanischen Garten Bonn",
        "technik": "Öl auf Leinwand",
        "masse": "18 × 24 cm",
        "kategorie": "pflanzen",
        "desc": "Zauberhafte weiße Seerose auf ruhigem Teichwasser im historischen Botanischen Garten Bonn."
    },
    "DSC_6784a": {
        "title": "Gelbe Frühlings-Tulpen",
        "technik": "Öl auf Leinwand",
        "masse": "18 × 24 cm",
        "kategorie": "pflanzen",
        "desc": "Strahlend sonnengelbe Tulpen in zarter Schichtölmalerei mit stimmungsvoller Tiefenwirkung."
    },
    "DSC_6788a": {
        "title": "Aperol Spritz",
        "technik": "Acryl auf Leinwand",
        "masse": "18 × 24 cm",
        "kategorie": "sonstiges",
        "desc": "Erfrischender Aperol Spritz im Weinglas mit Orangenscheibe und klaren Eiswürfeln."
    },
    "DSC_6790a": {
        "title": "Kühles Bier im Glas",
        "technik": "Acryl auf Leinwand",
        "masse": "18 × 24 cm",
        "kategorie": "sonstiges",
        "desc": "Frisch gezapftes, perlendes Bier mit goldgelber Farbe und dichter weißer Schaumkrone."
    },
    "DSC_6793a": {
        "title": "Traumpfad Kottenforst",
        "technik": "Acryl auf Leinwand",
        "masse": "100 × 100 cm",
        "kategorie": "landschaften",
        "desc": "Malerischer Spazierweg im herbstlichen Kottenforst bei Bonn, durchflutet von warmem Sonnenlicht und leuchtenden Blattfarben."
    },
    "DSC_6798a": {
        "title": "Weg auf Island",
        "technik": "Öl auf Karton",
        "masse": "40 × 60 cm",
        "kategorie": "landschaften",
        "desc": "Manche Wege auf Island führen über Holzplanken – ein stimmungsvoller Pfad entlang der dramatischen Steilküste."
    },
    "bild18-eulen": {
        "title": "Zwei Eulen",
        "technik": "Acryl auf Leinwand",
        "masse": "30 × 40 cm",
        "kategorie": "tiere",
        "desc": "Liebevoll handgemaltes Acrylbild mit zwei kleinen Eulen auf einem Ast vor blauem Hintergrund."
    },
    "bild16-godesburg": {
        "title": "Godesburg Stadtansicht",
        "technik": "Acryl auf Leinwand",
        "masse": "40 × 50 cm",
        "kategorie": "landschaften",
        "desc": "Malerische Stadtansicht der historischen Godesburg in Bonn bei abendlicher Dämmerung."
    },
    "bild8-rheinaue": {
        "title": "Rheinaue Bonn",
        "technik": "Acryl auf Leinwand",
        "masse": "40 × 50 cm",
        "kategorie": "landschaften",
        "desc": "Herbstliche Impression des Rheinaue-Sees in Bonn mit spiegelnden Bäumen und stimmungsvollem Licht."
    },
    "bild9-feld": {
        "title": "Feldweg im Sommer",
        "technik": "Acryl auf Leinwand",
        "masse": "40 × 50 cm",
        "kategorie": "landschaften",
        "desc": "Idyllischer sonniger Feldweg im Sommer unter weitem blauem Himmel."
    }
};

/* =========================================
   ENGLISCHE ÜBERSETZUNG DER GALERIE-WERKE
   Enthält nur die zu übersetzenden Felder (title/technik/desc) je Werk-ID.
   Maße, Kategorie und Badge bleiben sprachunabhängig (Zahlen/interne Werte).
   ========================================= */
const ARTWORKS_METADATA_EN = {
    "DSC_6622a": { title: "Godesburg Modern", technik: "Mixed media on paper", desc: "One of my favorite motifs is Godesburg Castle in Bad Godesberg. Here I depicted it in a modern, expressive mixed-media technique." },
    "DSC_6624a": { title: "Siebengebirge Panorama", technik: "Acrylic on canvas", desc: "On an extensive hike through the Siebengebirge hills, I had to capture this atmospheric forest and panoramic view on canvas." },
    "DSC_6626a": { title: "Bad Godesberg City with Godesburg", technik: "Oil on canvas", desc: "This view shows the historic Godesburg Castle in Bad Godesberg, seen from the blooming city park." },
    "DSC_6628a": { title: "Gatehouse at Klufterhof Friesdorf", technik: "Oil on canvas", desc: "The picturesque gatehouse in Bad Godesberg-Friesdorf belongs to the listed Klufterhof ensemble." },
    "DSC_6630a": { title: "Friesdorf Annaberger Straße", technik: "Oil on canvas", desc: "The historic tower house from the 12th century and Annaberger Straße in the heart of Bad Godesberg-Friesdorf." },
    "DSC_6632a": { title: "The Klufterhof Friesdorf", technik: "Oil on canvas", desc: "The Klufterhof in Friesdorf is one of the oldest and most beautiful half-timbered houses in the region, dating from the early 17th century." },
    "DSC_6634a": { title: "Drachenfels on the Rhine (View near Mehlem)", technik: "Oil on canvas", desc: "On my many walks along the Rhine promenade, I get to enjoy this wonderful view of the Drachenfels." },
    "DSC_6636a": { title: "Drachenfels on the Rhine in Summer", technik: "Acrylic on canvas", desc: "This magnificent view of the historic Drachenfels can be enjoyed from a sunny bench in Bad Godesberg-Mehlem." },
    "DSC_6638a": { title: "Godesburg in Summer Light", technik: "Acrylic on canvas", desc: "Godesburg Castle in Bad Godesberg under a radiant blue summer sky with vivid shades of green." },
    "DSC_6640a": { title: '"Zur Lindenwirtin" Inn with Godesburg', technik: "Oil on canvas", desc: 'This work shows a historic view of the traditional "Zur Lindenwirtin" inn with the majestic Godesburg Castle in the background.' },
    "DSC_6642a": { title: "Rheinaue Park Path, Bonn", technik: "Acrylic on canvas", desc: "An idyllic path in Bonn's Rheinaue Park leads past these beautiful, gnarled old park trees." },
    "DSC_6644a": { title: "Historic View of Godesburg", technik: "Acrylic on canvas", desc: "A vertical architectural study of Godesburg Castle with gently curving hillside paths and warm stone tones." },
    "DSC_6688a": { title: "Flower Bouquet", technik: "Acrylic on cardboard", desc: "A colorful, vibrant flower bouquet with high-contrast floral arrangements in layered acrylic technique." },
    "DSC_6689a": { title: "Small Flower Bouquet", technik: "Oil on cardboard", desc: "A delicate, detailed flower bouquet in fine oil painting with soft transitions and warm floral hues." },
    "DSC_6693a": { title: "Sheep on Texel", technik: "Oil on canvas", desc: "While on vacation on the North Sea island of Texel, we encountered these curious, lovable sheep on the green dikes." },
    "DSC_6696a": { title: "Owls in the Kottenforst", technik: "Oil on canvas", desc: "Two small owls side by side on a branch in the dusky Kottenforst forest of Bad Godesberg, set against a mysterious blue background." },
    "DSC_6698a": { title: "Modern Flowers", technik: "Acrylic on canvas", desc: "A modern floral abstraction with dynamic brushstrokes and bold color fields on a generously sized canvas." },
    "DSC_6700a": { title: "Blossom Harmony in the Garden", technik: "Acrylic on canvas", desc: "A fresh floral composition full of radiance and natural elegance." },
    "DSC_6702a": { title: "Funny Chickens", technik: "Acrylic on canvas", desc: "A cheerful row of colorful chickens in a charming wide landscape format – full of joy and wit." },
    "DSC_6703a": { title: "Poppy Meadow", technik: "Acrylic on canvas", desc: "Bright red summer poppies sway in the wind in a sun-drenched meadow." },
    "DSC_6705a": { title: "Colorful Tulip Splendor", technik: "Acrylic on canvas", desc: "Vibrant spring tulips in brilliant acrylic colors in a square format." },
    "DSC_6707a": { title: "Hay Bales on the French Atlantic Coast", technik: "Oil on canvas", desc: "The scent of fresh hay bales on the French Atlantic coast inspired this painting – you can almost feel the summer breeze." },
    "DSC_6710a": { title: "Dune Path on the French Atlantic Coast", technik: "Acrylic on canvas", desc: "Dune paths invite complete relaxation. This enchanting trail leads through soft dune sand straight to the sea." },
    "DSC_6711a": { title: "Seashell on the Beach", technik: "Acrylic on canvas", desc: "A lone seashell in warm coastal sand with gentle plays of light and shadow from the sea." },
    "DSC_6713a": { title: "Lighthouse on Texel", technik: "Acrylic on canvas", desc: "Numerous vacations have taken us to Texel – the red lighthouse, visible from afar in the north of the island, simply had to become a motif." },
    "DSC_6715a": { title: "Cemetery Path, Dottendorf (I)", technik: "Oil pastel on paper, birch wood frame", desc: "Park benches are wonderful places to relax and capture this peaceful favorite view in soft oil pastel." },
    "DSC_6717a": { title: "Path at Lake Blausteinsee, Eschweiler", technik: "Oil pastel on paper, birch wood frame", desc: "A popular nature excursion destination near Aachen: the peaceful shoreline path at Lake Blausteinsee." },
    "DSC_6719a": { title: "Cemetery Path, Dottendorf (II)", technik: "Oil pastel on paper, birch wood frame", desc: "Delicate birch trees and autumnal stillness in Bonn-Dottendorf – hand-framed in fine birch wood." },
    "DSC_6722a": { title: "Forest Path in the Kottenforst, Bonn", technik: "Acrylic on canvas", desc: "This sun-drenched forest path in Bonn's Kottenforst is one of my absolute favorite trails in every season." },
    "DSC_6740a": { title: "Tulip Bouquet in Oil", technik: "Oil on canvas", desc: "A classic botanical oil painting with fine color gradations and a velvety sheen." },
    "DSC_6742a": { title: "Balou – Dog Portrait in Oil", technik: "Oil on canvas", desc: "Our family dog Balou, with his loyal gaze and velvety-soft coat, immortalized in classic oil painting." },
    "DSC_6744a": { title: "Balou – Modern Dog Portrait", technik: "Acrylic on canvas", desc: "A modern portrait study of Balou with bold color contrasts and expressive character." },
    "DSC_6747a": { title: "Balou – Dog Portrait in Acrylic", technik: "Acrylic on canvas", desc: "A finely detailed acrylic portrait of Balou with vivid highlights in the eyes." },
    "DSC_6749a": { title: "Magnolia Dream", technik: "Acrylic on canvas", desc: "This dreamlike view appears when you look up in spring into a blooming pink magnolia tree from below." },
    "DSC_6751a": { title: "Classic Still Life", technik: "Oil on canvas", desc: "A masterfully lit still life in traditional layered oil painting with harmonious depth." },
    "DSC_6753a": { title: "Red Bell Pepper", technik: "Acrylic on canvas", desc: "A fresh, glossy bell pepper in a modern small format with crisp highlights." },
    "DSC_6754a": { title: "Lemons", technik: "Oil on canvas", desc: "Sun-ripened lemons with a velvety peel texture in brilliant lemon yellow." },
    "DSC_6757a": { title: "The Gallic Rooster", technik: "Acrylic on canvas", desc: "A proud Gallic rooster with a fiery comb and proud gaze in vivid brushwork." },
    "DSC_6759a": { title: "Fresh Strawberries", technik: "Acrylic on canvas", desc: "Summer-fresh strawberries in a square miniature format – almost good enough to eat." },
    "DSC_6760a": { title: "Strawberries on a Blue Plate", technik: "Acrylic on canvas", desc: "Rich red strawberries in striking color contrast on a cobalt blue ceramic plate." },
    "DSC_6763a": { title: "Colorful Rooster", technik: "Acrylic on canvas", desc: "A lively bird portrait with shimmering plumage tones and a characterful pose." },
    "DSC_6765a": { title: "Robin in Winter", technik: "Acrylic on canvas", desc: "A charming robin on a branch with the finest down feathers and a brilliant red breast." },
    "DSC_6767a": { title: "Coco Mademoiselle Perfume", technik: "Acrylic on canvas", desc: "An elegant still life of the legendary perfume classic in powdery rosé and gold tones." },
    "DSC_6768a": { title: "Branch with Lemons", technik: "Acrylic on canvas", desc: "A Mediterranean branch with sun-ripened lemons and lush green leaves set against a radiant blue sky." },
    "DSC_6769a": { title: "Bee on Hydrangea", technik: "Acrylic on canvas", desc: "A busy honeybee amid a dense sea of sky-blue hydrangea blossoms." },
    "DSC_6771a": { title: "Bee on Lavender", technik: "Acrylic on canvas", desc: "A Mediterranean summer idyll: a bee foraging for nectar on fragrant purple lavender." },
    "DSC_6774a": { title: 'Still Life "Le Petit Déjeuner"', technik: "Acrylic on canvas", desc: "A French breakfast with a fresh butter croissant and coffee in warm morning light." },
    "DSC_6775a": { title: "Cows in Normandy (I)", technik: "Acrylic on canvas", desc: "These two curious cows crossed our path on a relaxing summer walk in Normandy." },
    "DSC_6778a": { title: "Cows in Normandy (II)", technik: "Acrylic on canvas", desc: "Typical Normandy pasture cows with their distinctive markings in a beautiful coastal landscape." },
    "DSC_6780a": { title: "Burger & Fries Pop Art", technik: "Acrylic on canvas", desc: "A delicious burger with crispy fries as a modern, vividly colored pop-art still life." },
    "DSC_6782a": { title: "Water Lily at Bonn Botanical Garden", technik: "Oil on canvas", desc: "An enchanting white water lily on calm pond water at Bonn's historic Botanical Garden." },
    "DSC_6784a": { title: "Yellow Spring Tulips", technik: "Oil on canvas", desc: "Radiant sun-yellow tulips in delicate layered oil painting with atmospheric depth." },
    "DSC_6788a": { title: "Aperol Spritz", technik: "Acrylic on canvas", desc: "A refreshing Aperol Spritz in a wine glass with an orange slice and clear ice cubes." },
    "DSC_6790a": { title: "Cold Beer in a Glass", technik: "Acrylic on canvas", desc: "Freshly poured, sparkling beer with a golden color and a dense white foam crown." },
    "DSC_6793a": { title: "Dream Trail in the Kottenforst", technik: "Acrylic on canvas", desc: "A picturesque sunlit walking trail through Bonn's Kottenforst forest, bathed in warm golden autumn light and vibrant foliage." },
    "DSC_6798a": { title: "Path in Iceland", technik: "Oil on cardboard", desc: "A scenic trail along Iceland's dramatic coastal cliffs and turquoise waters, capturing the rugged Nordic atmosphere." },
    "bild18-eulen": { title: "Two Little Owls", technik: "Acrylic on canvas", desc: "Lovingly hand-painted acrylic artwork of two little owls perched on a branch against a blue sky." },
    "bild16-godesburg": { title: "Godesburg Cityscape", technik: "Acrylic on canvas", desc: "Atmospheric painting of historic Godesburg fortress in Bonn during evening twilight." },
    "bild8-rheinaue": { title: "Rheinaue Park Bonn", technik: "Acrylic on canvas", desc: "Autumn impression of the scenic Rheinaue lake in Bonn with reflective waters and golden foliage." },
    "bild9-feld": { title: "Summer Field Path", technik: "Acrylic on canvas", desc: "Idyllic sunlit country field path in summer under a bright open sky." }
};
