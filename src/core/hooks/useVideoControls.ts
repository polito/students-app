import { useCallback, useEffect, useState } from 'react';
import { OnLoadData } from 'react-native-video';

import { useNavigation } from '@react-navigation/native';

import { displayTabBar } from '../../utils/tab-bar';

export const useVideoControls = () => {
  const navigation = useNavigation();
  const [paused, setPaused] = useState(false);
  const [muted, setMuted] = useState(false);
  const [fullscreen, setFullscreen] = useState(false);
  const [duration, setDuration] = useState(0);
  const [ready, setReady] = useState(false);

  const togglePaused = useCallback(() => {
    setPaused(prev => !prev);
  }, []);

  const toggleMuted = useCallback(() => {
    setMuted(prev => !prev);
  }, []);

  const toggleFullscreen = useCallback(() => {
    setFullscreen(prev => !prev);
  }, []);

  const handleLoad = useCallback((meta: OnLoadData) => {
    setDuration(meta.duration);
  }, []);

  useEffect(() => {
    const navRoot = navigation.getParent();
    return () => displayTabBar(navRoot);
  }, []);

  const onReadyForDisplay = useCallback(() => {
    setReady(true);
  }, []);

  return {
    togglePaused,
    toggleMuted,
    toggleFullscreen,
    handleLoad,
    paused,
    muted,
    fullscreen,
    ready,
    duration,
    onReadyForDisplay,
  };
};
