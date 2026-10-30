import { uid } from './path';

// Starter content for sections added from the "Add section" panel.
const pic = () => ({ src: '', alt: '' });
const link = (label, href = '/#contact') => ({ label, href });

export const TEMPLATES = {
  hero: () => ({
    eyebrowLeft: 'SHARMA ENGINEERING', eyebrowRight: 'DESIGN · FABRICATION · INSTALLATION',
    kicker: 'Your kicker line', title: 'A bold headline<br><span class="accent">that sells.</span>',
    text: 'One or two sentences explaining what this page is about.', image: pic(),
    cta: link('Get a quote'), secondary: link('Learn more', '/'),
    stats: [{ id: uid('h'), k: 'LABEL', v: 'Value' }, { id: uid('h'), k: 'LABEL', v: 'Value' }],
  }),
  pageHeader: () => ({ label: 'PAGE', title: 'Page title.', text: 'A short introduction to this page.', image: pic() }),
  intro: () => ({ label: 'About', lead: 'A STRONG OPENING STATEMENT ABOUT THE COMPANY.', text: 'Supporting paragraph.', image: pic(), caption: 'Caption' }),
  textImage: () => ({ label: 'Label', title: 'Heading for this block.', text: 'Write your content here. Select text to make it <b>bold</b>, change colour, add links and lists.', image: pic(), cta: link('Contact us'), variant: '' }),
  richText: () => ({ label: 'Label', title: 'Heading', text: 'Write your content here…' }),
  features: () => ({
    label: 'Why us', title: 'Reasons to choose us.', text: '',
    items: [1, 2, 3, 4].map((n) => ({ id: uid('f'), num: `0${n}`, title: 'Feature title', text: 'Short description of this feature.' })),
  }),
  services: () => ({
    label: 'Services', title: 'What we build.', text: '',
    items: [1, 2, 3].map(() => ({ id: uid('v'), image: pic(), tag: 'CATEGORY', title: 'Service name', text: 'Short description.', tags: 'Tag · Tag' })),
  }),
  applications: () => ({
    label: 'Applications', title: 'Where it is used.', text: '',
    items: ['Application one', 'Application two', 'Application three'].map((t) => ({ id: uid('a'), image: pic(), title: t })),
  }),
  stats: () => ({
    label: 'By the numbers', title: 'Numbers that matter.',
    items: [1, 2, 3, 4].map(() => ({ id: uid('n'), value: '100+', text: 'What this number means.' })),
  }),
  projects: () => ({
    label: 'Projects', title: 'Selected work.', text: '', cta: link('', ''),
    items: [1, 2].map(() => ({
      id: uid('p'), image: pic(), fig: '', status: 'COMPLETED', category: 'CATEGORY · CITY', title: 'Project title.', text: 'Project description.',
      meta: [{ id: uid('m'), k: 'TYPE', v: 'Value' }, { id: uid('m'), k: 'AREA', v: 'Value' }, { id: uid('m'), k: 'YEAR', v: '2026' }],
    })),
  }),
  process: () => ({
    label: 'Process', title: 'How we work.',
    items: ['Survey', 'Design', 'Fabrication', 'Installation'].map((t, i) => ({ id: uid('r'), num: `0${i + 1}`, title: t, text: 'Short description.' })),
  }),
  gallery: () => ({ label: 'Gallery', title: 'Photos.', items: [1, 2, 3].map(() => ({ id: uid('g'), image: pic(), caption: '' })), cta: link('', '') }),
  cta: () => ({ title: 'Ready to start?<br>Let’s talk.', text: '', cta: link('Get a quote →'), secondary: link('', '') }),
  contact: () => ({
    label: 'Contact', title: 'Get in touch.', text: '', formTitle: 'Send us a message',
    services: 'Domes & skylights, Canopies, Walkways, PEB & steel structures, Other', submitLabel: 'Send enquiry',
    successText: 'Thank you! We will be in touch shortly.',
  }),
};

export const SECTION_INFO = [
  ['hero', 'Big full-width banner with background photo'],
  ['pageHeader', 'Title + intro + image for inner pages'],
  ['intro', 'Statement, paragraph and tall photo'],
  ['textImage', 'Text with a photo beside it'],
  ['richText', 'Simple heading and text'],
  ['features', 'Four numbered feature cards'],
  ['services', 'Photo cards for services / products'],
  ['applications', 'Hover list with changing photo'],
  ['stats', 'Big numbers on a dark band'],
  ['projects', 'Featured projects with details'],
  ['process', 'Numbered process steps'],
  ['gallery', 'Masonry photo gallery with lightbox'],
  ['cta', 'Dark call-to-action band'],
  ['contact', 'Contact details + enquiry form'],
];

export function makeSection(type) {
  return { id: uid('s'), type, floats: [], ...TEMPLATES[type]() };
}

export const FONTS = [
  'Barlow', 'Source Sans 3', 'IBM Plex Sans', 'Noto Sans', 'Inter', 'Inter Tight', 'Manrope', 'Plus Jakarta Sans', 'DM Sans', 'Poppins', 'Montserrat', 'Outfit', 'Sora',
  'Space Grotesk', 'Archivo', 'Work Sans', 'Roboto', 'Lato', 'Open Sans', 'Playfair Display', 'Merriweather', 'Lora',
];
