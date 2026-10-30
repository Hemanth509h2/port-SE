// Starting content for the website. After seeding, everything here is edited from the admin portal.
// `img(n)` returns the image object for seed/images/se-NN.jpg.

let n = 0;
const id = (p = 'x') => `${p}${(++n).toString(36)}${Math.random().toString(36).slice(2, 6)}`;

export const IMAGES = [
  ['Polycarbonate dome on a rooftop', 'Rooftop dome'],
  ['Geometric steel skylight seen from below', 'Atrium skylight'],
  ['Curved polycarbonate entrance canopy over a driveway', 'Entrance canopy'],
  ['White polycarbonate barrel-vault enclosure', 'Barrel vault enclosure'],
  ['Polycarbonate enclosure around a rooftop swimming pool', 'Pool enclosure'],
  ['Interior of a vaulted polycarbonate room', 'Vaulted interior'],
  ['Terrace walkway canopy with wash basins', 'Terrace canopy'],
  ['Terrace wash area under a polycarbonate canopy', 'Terrace wash area'],
  ['Long terrace corridor under a curved canopy', 'Terrace corridor'],
  ['Building with roof structure under construction', 'Roof works in progress'],
  ['Pyramid steel roof frame being fabricated on site', 'Pyramid roof frame'],
  ['Polycarbonate skylight roof on steel trusses', 'Truss skylight roof'],
  ['Close-up of a glazed polycarbonate dome', 'Dome glazing detail'],
  ['Pre-engineered steel building frame at sunset', 'PEB frame'],
  ['Octagonal skylight seen from below', 'Octagonal skylight'],
  ['Crane working on a cable-stayed bridge', 'Bridge works'],
  ['Industrial metal roof with turbo ventilators and skylight strips', 'Industrial roofing'],
  ['Commercial building with glass and cladding facade', 'Facade & cladding'],
  ['Rooftop steel pergola framework', 'Rooftop pergola frame'],
  ['White steel canopy frame on an open site', 'Carport canopy frame'],
  ['Polycarbonate dome on a city rooftop', 'City rooftop dome'],
  ['Long covered walkway shed', 'Covered walkway'],
  ['Polycarbonate sheets installed over a garden courtyard', 'Courtyard roof'],
  ['Dome skylight over a multi-storey atrium', 'Atrium dome'],
  ['Heritage-style building with green polycarbonate canopy', 'Heritage canopy'],
  ['Polycarbonate walkway tunnel', 'Walkway tunnel'],
  ['Skylight roof on steel frame seen from below', 'Skylight frame'],
  ['Steel space-frame roof truss', 'Space frame'],
  ['Large polycarbonate roof installation', 'Large-span roofing'],
  ['Entrance canopy frame on white columns', 'Column canopy'],
  ['Wide view of a column-supported canopy frame', 'Column canopy (wide)'],
  ['Arched steel structures on a landscaped site', 'Arched structures'],
  ['Narrow polycarbonate covered passage', 'Covered passage'],
  ['Small polycarbonate greenhouse room', 'Greenhouse'],
];

export function buildContent(img) {
  const global = {
    siteName: 'Sharma Engineering',
    brand: '<b>Sharma</b> Engineering',
    logo: { src: '', alt: 'Sharma Engineering' },
    theme: {
      primary: '#E8590C',
      dark: '#121417',
      light: '#F5F2EC',
      ink: '#16181B',
      muted: '#6B6E73',
      paper: '#FFFFFF',
      headingFont: 'Barlow',
      bodyFont: 'Source Sans 3',
      radius: 4,
    },
    announcement: {
      show: true,
      tag: 'FREE SITE SURVEY',
      title: 'Planning a dome, skylight or canopy?',
      text: 'We will visit your site, take measurements and send you a drawing with the quote.',
      cta: { label: 'Book a site visit', href: '/#contact' },
    },
    nav: {
      links: [
        { id: id('l'), label: 'Home', href: '/' },
        { id: id('l'), label: 'Services', href: '/#services' },
        { id: id('l'), label: 'Applications', href: '/#applications' },
        { id: id('l'), label: 'Projects', href: '/projects' },
        { id: id('l'), label: 'Gallery', href: '/projects#gallery' },
        { id: id('l'), label: 'Contact', href: '/#contact' },
      ],
      cta: { label: 'Get a quote', href: '/#contact' },
    },
    contact: {
      phone: '+91 98765 43210',
      email: 'info@sharmaengineering.in',
      address: 'Hyderabad, Telangana, India',
      hours: 'Mon – Sat · 9:30 am – 6:30 pm',
      whatsapp: '919876543210',
    },
    floatingCta: {
      show: false,
      title: 'Have a project in mind?',
      text: 'Call or WhatsApp us for a quote',
      cta: { label: 'Get a quote', href: '/#contact' },
    },
    footer: {
      about:
        'Sharma Engineering makes and installs polycarbonate roofing, domes, skylights, canopies and pre-engineered steel structures. Based in Hyderabad.',
      cities: 'Working across Telangana and Andhra Pradesh, and other states on request.',
      columns: [
        {
          id: id('c'),
          title: 'Services',
          links: [
            { id: id('l'), label: 'Domes & skylights', href: '/#services' },
            { id: id('l'), label: 'Canopies & car porches', href: '/#services' },
            { id: id('l'), label: 'Walkways & corridors', href: '/#services' },
            { id: id('l'), label: 'PEB & steel structures', href: '/#services' },
            { id: id('l'), label: 'Industrial roofing', href: '/#services' },
          ],
        },
        {
          id: id('c'),
          title: 'Applications',
          links: [
            { id: id('l'), label: 'Atriums', href: '/#applications' },
            { id: id('l'), label: 'Terraces & rooftops', href: '/#applications' },
            { id: id('l'), label: 'Pools & clubhouses', href: '/#applications' },
            { id: id('l'), label: 'Factories & warehouses', href: '/#applications' },
            { id: id('l'), label: 'Greenhouses', href: '/#applications' },
          ],
        },
        {
          id: id('c'),
          title: 'Company',
          links: [
            { id: id('l'), label: 'About us', href: '/#about' },
            { id: id('l'), label: 'Projects', href: '/projects' },
            { id: id('l'), label: 'Gallery', href: '/projects#gallery' },
            { id: id('l'), label: 'Contact', href: '/#contact' },
          ],
        },
      ],
      bottom: '© 2026 Sharma Engineering. All rights reserved.',
    },
  };

  const projects = [
    {
      id: id('p'), image: img(20), fig: '', status: 'COMPLETED',
      category: 'ROOFTOP DOME · HYDERABAD',
      title: 'Rooftop dome, Hyderabad',
      text: 'Segmented polycarbonate dome on curved MS ribs, with a small lantern at the top for ventilation. We did the design, fabrication and fixing.',
      meta: [
        { id: id('m'), k: 'TYPE', v: 'Polycarbonate dome' },
        { id: id('m'), k: 'FRAME', v: 'Curved MS ribs' },
        { id: id('m'), k: 'STATUS', v: 'Completed' },
      ],
    },
    {
      id: id('p'), image: img(8), fig: '', status: 'COMPLETED',
      category: 'COMMERCIAL TERRACE · HYDERABAD',
      title: 'Terrace corridor canopy',
      text: 'One continuous curved canopy over the terrace corridor and wash area. We used tinted sheets so it stays bright underneath without the glare.',
      meta: [
        { id: id('m'), k: 'TYPE', v: 'Curved canopy' },
        { id: id('m'), k: 'SHEET', v: 'Tinted polycarbonate' },
        { id: id('m'), k: 'STATUS', v: 'Completed' },
      ],
    },
    {
      id: id('p'), image: img(30), fig: '', status: 'IN PROGRESS',
      category: 'INSTITUTIONAL · ENTRANCE PLAZA',
      title: 'Campus entrance canopy',
      text: 'Wide-span steel canopy on circular columns, covering the drop-off area at a college campus. Steelwork is done and sheeting is underway.',
      meta: [
        { id: id('m'), k: 'TYPE', v: 'Steel canopy' },
        { id: id('m'), k: 'SUPPORT', v: 'Circular columns' },
        { id: id('m'), k: 'STATUS', v: 'Structure complete' },
      ],
    },
  ];

  const moreProjects = [
    {
      id: id('p'), image: img(23), fig: '', status: 'COMPLETED',
      category: 'RESIDENTIAL · ATRIUM',
      title: 'Atrium dome skylight',
      text: 'Dome skylight with radial ribs over a multi-storey atrium. It lights the stairwell on every floor.',
      meta: [
        { id: id('m'), k: 'TYPE', v: 'Dome skylight' },
        { id: id('m'), k: 'SHAPE', v: 'Octagonal base' },
        { id: id('m'), k: 'STATUS', v: 'Completed' },
      ],
    },
    {
      id: id('p'), image: img(4), fig: '', status: 'COMPLETED',
      category: 'RESIDENTIAL · ROOFTOP POOL',
      title: 'Rooftop pool enclosure',
      text: 'Polycarbonate enclosure with curved eaves around a rooftop pool. It keeps out dust, rain and the afternoon sun, so the pool can be used all year.',
      meta: [
        { id: id('m'), k: 'TYPE', v: 'Pool enclosure' },
        { id: id('m'), k: 'SHEET', v: 'Tinted multiwall' },
        { id: id('m'), k: 'STATUS', v: 'Completed' },
      ],
    },
    {
      id: id('p'), image: img(13), fig: '', status: 'COMPLETED',
      category: 'INDUSTRIAL · PRE-ENGINEERED BUILDING',
      title: 'Pre-engineered steel shed',
      text: 'Portal-frame PEB shed. The frames were made in our workshop, then erected on site ahead of roofing and cladding.',
      meta: [
        { id: id('m'), k: 'TYPE', v: 'PEB structure' },
        { id: id('m'), k: 'FRAME', v: 'Portal frames' },
        { id: id('m'), k: 'STATUS', v: 'Completed' },
      ],
    },
  ];

  const gallery = IMAGES.map((_, i) => ({ id: id('g'), image: img(i), caption: IMAGES[i][1] }));

  const cta = () => ({
    id: id('s'), type: 'cta', floats: [],
    title: 'Have a site in mind?',
    text: 'Send us a photo of the site or a rough sketch and we will get back to you with a design and price.',
    cta: { label: 'Send an enquiry', href: '/#contact' },
    secondary: { label: 'Call us', href: 'tel:+919876543210' },
  });

  const home = {
    title: 'Home',
    seo: {
      title: 'Sharma Engineering | Polycarbonate Domes, Skylights, Canopies & PEB Structures',
      description:
        'Sharma Engineering designs, fabricates and installs polycarbonate roofing, domes, skylights, canopies, walkways and pre-engineered steel structures.',
    },
    sections: [
      {
        id: id('s'), type: 'hero', floats: [],
        image: img(1),
        eyebrowLeft: '',
        eyebrowRight: '',
        kicker: 'Sharma Engineering, Hyderabad',
        title: 'Polycarbonate domes, skylights <span class="accent">and canopies</span>',
        text: 'We also do walkways, pool enclosures and pre-engineered steel sheds. Our own team handles the design, fabrication and installation.',
        cta: { label: 'Get a quote', href: '/#contact' },
        secondary: { label: 'Our services', href: '/#services' },
        stats: [
          { id: id('h'), k: 'WORK', v: 'Design, fabrication & installation' },
          { id: id('h'), k: 'MATERIALS', v: 'Polycarbonate, MS / GI steel, glass' },
          { id: id('h'), k: 'SITE VISIT', v: 'Free survey & estimate' },
          { id: id('h'), k: 'PROJECTS', v: '<b>500+</b>' },
        ],
      },
      {
        id: id('s'), type: 'intro', anchor: 'about', floats: [],
        label: 'About us',
        lead: 'We make polycarbonate roofs, domes, skylights and steel structures.',
        text: 'Jobs range from a single car porch to a full factory shed. On each one we measure the site ourselves, work out the steel sizes, fabricate the frame in our workshop and send our own crew to fix it. We don\'t subcontract the installation.',
        image: img(2),
        caption: 'Curved entrance canopy · driveway',
      },
      {
        id: id('s'), type: 'features', floats: [],
        label: 'Why us',
        title: 'Why people choose us',
        text: 'Each site has its own span, wind load and use, so we design every structure separately.',
        items: [
          { id: id('f'), num: '01', title: 'The right sheet', text: 'Clear, opal or tinted polycarbonate, chosen for how much light and heat you want to let in.' },
          { id: id('f'), num: '02', title: 'Made for our weather', text: 'UV-coated sheets, primed and painted steel and sealed joints, so it holds up through the monsoon and the summer heat.' },
          { id: id('f'), num: '03', title: 'One contact', text: 'The same team does the survey, design, fabrication and installation, so you only deal with us.' },
          { id: id('f'), num: '04', title: 'Any shape', text: 'Domes, vaults, pyramids, cantilevers or a shape you have sketched. We make it to your size and colour.' },
        ],
      },
      {
        id: id('s'), type: 'services', anchor: 'services', floats: [],
        label: 'Services',
        title: 'What we make',
        text: 'Lightweight roofing and steel structures for homes, offices, campuses and factories.',
        items: [
          { id: id('v'), image: img(12), tag: 'DOMES · SKYLIGHTS', title: 'Domes & Skylights', text: 'Polycarbonate domes, pyramid and octagonal skylights for atriums, lobbies and rooftops.', tags: 'Atrium · Rooftop · Lobby' },
          { id: id('v'), image: img(2), tag: 'CANOPIES', title: 'Canopies & Car Porches', text: 'Curved and cantilever canopies for entrances, drop-offs, driveways and parking.', tags: 'Entrance · Parking' },
          { id: id('v'), image: img(25), tag: 'WALKWAYS', title: 'Walkways & Corridors', text: 'Covered passages between buildings that keep people dry and let the light through.', tags: 'Campus · Hospital · Office' },
          { id: id('v'), image: img(13), tag: 'PEB · STEEL', title: 'PEB & Steel Structures', text: 'Pre-engineered buildings, sheds, space frames and trusses fabricated in-house.', tags: 'Factory · Warehouse' },
          { id: id('v'), image: img(4), tag: 'ENCLOSURES', title: 'Pool & Terrace Enclosures', text: 'All-weather enclosures for pools, terraces, gyms and rooftop lounges.', tags: 'Residential · Clubhouse' },
          { id: id('v'), image: img(16), tag: 'INDUSTRIAL', title: 'Industrial Roofing', text: 'Metal roofing with skylight strips and turbo ventilators for factory sheds.', tags: 'Roofing · Ventilation' },
        ],
      },
      {
        id: id('s'), type: 'applications', anchor: 'applications', floats: [],
        label: 'Applications',
        title: 'Where it is used',
        text: 'Homes, apartments, schools, hospitals and factories.',
        items: [
          { id: id('a'), image: img(23), title: 'Atriums & lobbies' },
          { id: id('a'), image: img(6), title: 'Terraces & rooftops' },
          { id: id('a'), image: img(4), title: 'Pools & clubhouses' },
          { id: id('a'), image: img(29), title: 'Entrances & plazas' },
          { id: id('a'), image: img(32), title: 'Walkways & passages' },
          { id: id('a'), image: img(16), title: 'Factories & warehouses' },
          { id: id('a'), image: img(33), title: 'Greenhouses' },
        ],
      },
      {
        id: id('s'), type: 'stats', floats: [],
        label: 'Our record',
        title: 'Our work so far',
        items: [
          { id: id('n'), value: '15+ yrs', text: 'In roofing and steel fabrication' },
          { id: id('n'), value: '500+', text: 'Domes, skylights, canopies and sheds installed' },
          { id: id('n'), value: '300+', text: 'Clients, including homeowners, builders, architects and factories' },
          { id: id('n'), value: 'In-house', text: 'Workshop and installation crew' },
        ],
      },
      {
        id: id('s'), type: 'projects', floats: [],
        label: 'Projects',
        title: 'Recent projects',
        text: 'A few jobs from the last couple of years.',
        items: projects,
        cta: { label: 'View all projects', href: '/projects' },
      },
      {
        id: id('s'), type: 'process', floats: [],
        label: 'How we work',
        title: 'How a job runs',
        items: [
          { id: id('r'), num: '01', title: 'Site survey', text: 'We come to the site, take measurements and ask how you plan to use the space.' },
          { id: id('r'), num: '02', title: 'Design & quote', text: 'You get a drawing, the sheet options and an itemised quote.' },
          { id: id('r'), num: '03', title: 'Fabrication', text: 'We cut, weld and paint the steel in our workshop.' },
          { id: id('r'), num: '04', title: 'Installation', text: 'Our crew fixes the structure, seals it and clears the site before we leave.' },
        ],
      },
      {
        id: id('s'), type: 'gallery', anchor: 'gallery-preview', floats: [],
        label: 'Gallery',
        title: 'Photos from site',
        items: gallery.slice(0, 12),
        cta: { label: 'See all photos', href: '/projects#gallery' },
      },
      cta(),
      {
        id: id('s'), type: 'contact', anchor: 'contact', floats: [],
        label: 'Contact',
        title: 'Contact us',
        text: 'Tell us about your site and what you want built. We usually reply within one working day.',
        formTitle: 'Request a quote',
        services: 'Domes & skylights, Canopies & car porches, Walkways & corridors, PEB & steel structures, Pool & terrace enclosures, Industrial roofing, Other',
        submitLabel: 'Send enquiry',
        successText: 'Thanks, we have your enquiry and will call you back soon.',
      },
    ],
  };

  const projectsPage = {
    title: 'Projects',
    seo: {
      title: 'Projects & Gallery | Sharma Engineering',
      description: 'Selected domes, skylights, canopies, enclosures and steel structures by Sharma Engineering.',
    },
    sections: [
      {
        id: id('s'), type: 'pageHeader', floats: [],
        label: 'PROJECTS',
        title: 'Our projects',
        text: 'Domes, skylights, canopies, walkways, enclosures and steel structures our team has built.',
        image: img(28),
      },
      {
        id: id('s'), type: 'projects', floats: [],
        label: 'Selected work',
        title: 'Selected projects',
        text: '',
        items: [...projects.map((p) => ({ ...p, id: id('p'), meta: p.meta.map((m) => ({ ...m, id: id('m') })) })), ...moreProjects],
        cta: { label: 'Talk to us about your project', href: '/#contact' },
      },
      {
        id: id('s'), type: 'gallery', anchor: 'gallery', floats: [],
        label: 'Gallery',
        title: 'Site photos',
        items: gallery.map((g) => ({ ...g, id: id('g') })),
        cta: { label: '', href: '' },
      },
      cta(),
    ],
  };

  return { global, pages: { home, projects: projectsPage } };
}
