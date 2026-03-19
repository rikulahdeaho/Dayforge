import MaterialIcons from '@expo/vector-icons/MaterialIcons';
import { SymbolView as ExpoSymbolView } from 'expo-symbols';
import { ComponentProps } from 'react';
import { Platform } from 'react-native';

type SymbolViewProps = {
  name: string;
  size?: number;
  tintColor?: string;
} & Omit<ComponentProps<typeof MaterialIcons>, 'name' | 'size' | 'color'>;

const materialIconNameMap: Record<string, string> = {
  account_circle: 'account-circle',
  auto_awesome: 'auto-awesome',
  calendar_month: 'calendar-month',
  chevron_right: 'chevron-right',
  dark_mode: 'dark-mode',
  fitness_center: 'fitness-center',
  ios_download: 'file-download',
  ios_share: 'ios-share',
  local_fire_department: 'local-fire-department',
  menu_book: 'menu-book',
  open_in_new: 'open-in-new',
  self_improvement: 'self-improvement',
  task_alt: 'task-alt',
  track_changes: 'track-changes',
  water_drop: 'water-drop',
};

function resolveMaterialIconName(name: string) {
  return materialIconNameMap[name] ?? name.replace(/_/g, '-');
}

export function SymbolView({ name, size = 16, tintColor, style, ...rest }: SymbolViewProps) {
  if (Platform.OS === 'ios') {
    return <ExpoSymbolView name={name as any} size={size} tintColor={tintColor} style={style as any} />;
  }

  return (
    <MaterialIcons
      name={resolveMaterialIconName(name) as any}
      size={size}
      color={tintColor}
      style={style}
      {...rest}
    />
  );
}