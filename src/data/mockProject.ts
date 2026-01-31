import type { Gebaeude, Stromkreis } from '../types';

export const mockStromkreise: Stromkreis[] = [
  { id: 'sk-1', name: 'SK1 Steckdosen EG', verteilerId: 'HV-EG', devices: [
    { role: 'rcd', deviceId: 'rcd-40a-30ma-2p' },
    { role: 'mcb', deviceId: 'mcb-b16-1p' },
  ]},
  { id: 'sk-2', name: 'SK2 Licht EG', verteilerId: 'HV-EG', devices: [
    { role: 'rcd', deviceId: 'rcd-40a-30ma-2p' },
    { role: 'mcb', deviceId: 'mcb-b10-1p' },
  ]},
  { id: 'sk-3', name: 'SK3 Steckdosen OG', verteilerId: 'HV-EG', devices: [
    { role: 'rcd', deviceId: 'rcd-40a-30ma-2p' },
    { role: 'mcb', deviceId: 'mcb-b16-1p' },
  ]},
  { id: 'sk-4', name: 'SK4 Licht OG', verteilerId: 'HV-EG', devices: [
    { role: 'rcd', deviceId: 'rcd-40a-30ma-2p' },
    { role: 'mcb', deviceId: 'mcb-b10-1p' },
  ]},
  { id: 'sk-5', name: 'SK5 Herd', verteilerId: 'HV-EG', devices: [
    { role: 'rcd', deviceId: 'rcd-40a-30ma-2p' },
    { role: 'mcb', deviceId: 'mcb-c25-3p' },
  ]},
  { id: 'sk-6', name: 'SK6 Waschmaschine', verteilerId: 'HV-EG', devices: [
    { role: 'rcbo', deviceId: 'rcbo-b16-30ma-2p' },
  ]},
  { id: 'sk-7', name: 'SK7 Wallbox', verteilerId: 'HV-EG', devices: [
    { role: 'rcd_type_b', deviceId: 'rcd-b-40a-30ma-2p' },
    { role: 'afdd', deviceId: 'afdd-c16-2p' },
  ]},
  { id: 'sk-8', name: 'SK8 Keller', verteilerId: 'HV-EG', devices: [
    { role: 'rcd', deviceId: 'rcd-40a-30ma-2p' },
    { role: 'mcb', deviceId: 'mcb-b16-1p' },
  ]},
];

export const mockGebaeude: Gebaeude = {
  id: 'g1',
  name: 'Einfamilienhaus Muster',
  stockwerke: [
    {
      id: 'sw-eg',
      name: 'Erdgeschoss',
      raeume: [
        { id: 'r-wohn', name: 'Wohnzimmer' },
        { id: 'r-kueche', name: 'Küche' },
        { id: 'r-flur-eg', name: 'Flur EG' },
        { id: 'r-wc', name: 'Gäste-WC' },
      ],
    },
    {
      id: 'sw-og',
      name: 'Obergeschoss',
      raeume: [
        { id: 'r-schlaf', name: 'Schlafzimmer' },
        { id: 'r-kind1', name: 'Kinderzimmer 1' },
        { id: 'r-kind2', name: 'Kinderzimmer 2' },
        { id: 'r-bad', name: 'Badezimmer' },
        { id: 'r-flur-og', name: 'Flur OG' },
      ],
    },
    {
      id: 'sw-kg',
      name: 'Kellergeschoss',
      raeume: [
        { id: 'r-hwr', name: 'Hauswirtschaftsraum' },
        { id: 'r-keller', name: 'Keller' },
        { id: 'r-technik', name: 'Technikraum' },
      ],
    },
  ],
};
