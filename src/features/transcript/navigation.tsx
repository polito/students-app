import { ScreenGroupType } from '@core/types/navigation';

import { Transcript } from './screens/Transcript';

export type TranscriptStackParamList = {
  Transcript: undefined;
};

export const createTranscriptGroup = <T extends TranscriptStackParamList>({
  Stack,
  t,
}: ScreenGroupType<T>) => {
  return (
    <Stack.Group>
      <Stack.Screen
        name="Transcript"
        component={Transcript}
        options={{
          headerTitle: t('common.transcript'),
        }}
      />
    </Stack.Group>
  );
};
