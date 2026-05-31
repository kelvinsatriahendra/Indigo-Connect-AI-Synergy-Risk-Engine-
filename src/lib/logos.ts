export const getLogoForName = (name: string | undefined | null): string | undefined => {
  if (!name) return undefined;
  const n = name.toLowerCase();
  
  // Startups
  if (n.includes('logee')) return '/startups/logee.jpg';
  if (n.includes('aruna')) return '/startups/aruna.png';
  if (n.includes('verihubs')) return '/startups/verihubs_logo.jpg';
  if (n.includes('privy')) return '/startups/privy.png';
  if (n.includes('pijar')) return '/startups/pijar.webp';
  if (n.includes('klinik')) return '/startups/klinik-pintar.png';
  if (n.includes('xurya')) return '/startups/xurya.png';
  if (n.includes('goers')) return '/startups/goers.png';
  if (n.includes('linkaja')) return '/startups/linkaja.svg';
  if (n.includes('agrolink')) return '/startups/agrolink.png';
  if (n.includes('finaccess')) return '/startups/finaccess.png';
  if (n.includes('edukita')) return '/startups/edukita.png';
  if (n.includes('healthsync')) return '/startups/healthsync.png';
  if (n.includes('greenenergy')) return '/startups/greenenergy.png';
  if (n.includes('tourlocal')) return '/startups/tourlocal.png';
  if (n.includes('paydesa')) return '/startups/paydesa.png';
  if (n.includes('ada medika')) return '/startups/ada-medika.png';
  if (n.includes('agate')) return '/startups/agate.jpeg';
  if (n.includes('angin')) return '/startups/angin.jpeg';
  if (n.includes('dkk')) return '/startups/dkk-consulting.jpeg';
  if (n.includes('mdi')) return '/startups/mdi-ventures.jpeg';
  if (n.includes('zoho')) return '/startups/zoho.jpeg';
  
  // BUs
  if (n.includes('telkomsel')) return '/startups/telkomsel.png';
  if (n.includes('antares')) return '/startups/antares.png';
  if (n.includes('big box')) return '/startups/big-box.png';
  if (n.includes('telkom infra')) return '/startups/telkom-infra.png';
  if (n.includes('padi')) return '/startups/padi-umkm.png';
  if (n.includes('pos indo')) return '/startups/pos-indo.webp';
  
  // Fallbacks
  if (n.includes('telkom') || n.includes('regional')) return '/startups/indigo-red.png';
  
  return undefined;
};
