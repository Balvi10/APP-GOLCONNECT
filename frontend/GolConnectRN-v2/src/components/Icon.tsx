import React from 'react';
import type { StyleProp, TextStyle } from 'react-native';
import { MaterialIcons } from '@expo/vector-icons';


const OVERRIDES: Record<string, string> = {
  trophy: 'emoji-events',
  exercise: 'fitness-center',
  footprint: 'directions-run',
  search_insights: 'search',
  sports_and_outdoors: 'sports',
  query_stats: 'query-stats',
  person_search: 'person-search',
  account_balance_wallet: 'account-balance-wallet',
  alternate_email: 'alternate-email',
  monitor_weight: 'monitor-weight',
  workspace_premium: 'workspace-premium',
  rocket_launch: 'rocket-launch',
  add_a_photo: 'add-a-photo',
  exit_to_app: 'exit-to-app',
  dynamic_feed: 'dynamic-feed',
  assignment_turned_in: 'assignment-turned-in',
  search_off: 'search-off',
  keyboard_arrow_down: 'keyboard-arrow-down',
  arrow_forward_ios: 'arrow-forward-ios',
  arrow_back_ios: 'arrow-back-ios',
  open_in_new: 'open-in-new',
  format_quote: 'format-quote',
  event_available: 'event-available',
  calendar_today: 'calendar-today',
  calendar_month: 'calendar-month',
  arrow_outward: 'arrow-outward',
  upload_file: 'upload-file',
  cloud_upload: 'cloud-upload',
  content_copy: 'content-copy',
  verified_user: 'verified-user',
  visibility_off: 'visibility-off',
  filter_list: 'filter-list',
  edit_note: 'edit-note',
  chevron_right: 'chevron-right',
  expand_more: 'expand-more',
  photo_camera: 'photo-camera',
  check_circle: 'check-circle',
  location_on: 'location-on',
  play_circle: 'play-circle',
  play_arrow: 'play-arrow',
  trending_up: 'trending-up',
  account_circle: 'account-circle',
  arrow_back: 'arrow-back',
  sports_soccer: 'sports-soccer',
  emoji_events: 'emoji-events',
};

const FALLBACK = 'circle';

function resolveName(name?: string): React.ComponentProps<typeof MaterialIcons>['name'] {
  if (!name) return FALLBACK as any;
  const mapped = OVERRIDES[name] || name.replace(/_/g, '-');
  // glyphMap contiene todos los nombres válidos del set.
  const glyphMap = (MaterialIcons as any).glyphMap;
  if (glyphMap && glyphMap[mapped] !== undefined) {
    return mapped as any;
  }
  return FALLBACK as any;
}

export interface IconProps {
  name?: string;
  size?: number;
  color?: string;
  style?: StyleProp<TextStyle>;
}

export default function Icon({ name, size = 24, color = '#e2e2e2', style }: IconProps) {
  return <MaterialIcons name={resolveName(name)} size={size} color={color} style={style} />;
}
