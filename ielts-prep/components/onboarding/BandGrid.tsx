import React from 'react';
import { View } from 'react-native';

import { Chip } from '@/components/ui';

const BANDS = [4, 4.5, 5, 5.5, 6, 6.5, 7, 7.5, 8, 8.5, 9];

export function BandGrid({ value, onChange }: { value: number | null; onChange: (band: number) => void }) {
  return (
    <View style={{ flexDirection: 'row', flexWrap: 'wrap', gap: 8 }}>
      {BANDS.map((band) => (
        <Chip key={band} label={band.toFixed(1)} selected={value === band} onPress={() => onChange(band)} />
      ))}
    </View>
  );
}
