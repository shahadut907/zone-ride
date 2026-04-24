export const AREAS = [
  'Uttara Sector 7',
  'Uttara Sector 10',
  'Mirpur 10',
  'Banani',
  'Dhanmondi',
  'Gulshan 1',
  'Gulshan 2',
  'Mohakhali',
  'Farmgate',
  'Motijheel',
  'Shahbag',
  'Tejgaon',
  'Bashundhara',
  'Khilgaon',
  'Malibagh',
] as const;

export type AreaName = (typeof AREAS)[number];
