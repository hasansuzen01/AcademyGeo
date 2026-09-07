import { createElement } from 'react';

import {
  Building2,
  Bus,
  Camera,
  Car,
  Construction,
  Fuel,
  Globe,
  Landmark,
  Languages,
  Milestone,
  MountainSnow,
  Phone,
  Route,
  Signpost,
  Sun,
  TrafficCone,
  TramFront,
  Trees,
  UtilityPole,
  Waypoints,
  type LucideIcon,
} from 'lucide-react';

/**
 * The icons a guide heading can carry.
 *
 * A fixed set rather than any name lucide happens to export: the admin picks
 * from a list instead of guessing at spelling, and the browser is sent twenty
 * icons rather than the whole library.
 */
export const GUIDE_ICONS: Record<string, LucideIcon> = {
  signpost: Signpost,
  'utility-pole': UtilityPole,
  milestone: Milestone,
  'traffic-cone': TrafficCone,
  route: Route,
  waypoints: Waypoints,
  car: Car,
  bus: Bus,
  camera: Camera,
  trees: Trees,
  'mountain-snow': MountainSnow,
  landmark: Landmark,
  building: Building2,
  languages: Languages,
  sun: Sun,
  phone: Phone,
  globe: Globe,
  fuel: Fuel,
  'tram-front': TramFront,
  construction: Construction,
};

export const GUIDE_ICON_NAMES = Object.keys(GUIDE_ICONS);

/**
 * The icon for a heading. The name is stored as text, so one written before
 * an icon was picked, or renamed since, still draws something.
 */
export function guideIcon(name: string): LucideIcon {
  return GUIDE_ICONS[name] ?? GUIDE_ICONS.signpost;
}

/**
 * The icon for a heading, drawn.
 *
 * Written as a wrapper rather than by picking the component out into a
 * capitalised local: choosing a component during a render remounts it on
 * every pass, and the linter is right to say so.
 */
export function GuideIcon({ name, className }: { name: string; className?: string }) {
  return createElement(guideIcon(name), { className, 'aria-hidden': true });
}
