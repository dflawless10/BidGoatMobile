import React, {useEffect, useRef} from 'react';
import {Animated, Text, View, StyleSheet, ViewStyle} from 'react-native';
import GoatConfetti from '../components/GoatConfetti';
import type {MascotMood} from '@/types/goatmoods';
import {TextStyle} from 'react-native';


export interface MascotOverlayProps {
  mood: MascotMood,
  message: string,
  position?: 'top' | 'bottom' | 'center',
  visible?: boolean,
  MascotMood?: MascotMood
}

const MascotOverlay: React.FC<MascotOverlayProps> = ({
                                                       mood,
                                                       message,
                                                       position = 'bottom',
                                                       visible = true,
                                                       MascotMood
                                                     }) => {
  const fadeAnim = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    Animated.timing(fadeAnim, {
      toValue: visible ? 1 : 0,
      duration: visible ? 600 : 300,
      useNativeDriver: true,
    }).start();
  }, [visible]);

  const positionStyle: Partial<ViewStyle> = {
    ...(position === 'top' && {top: 24}),
    ...(position === 'bottom' && {bottom: 24}),
    ...(position === 'center' && {justifyContent: 'center' as ViewStyle['justifyContent']}),
  };


  const moodStyles: Record<string, TextStyle> = {
    Happy: {color: '#ff69b4'},
    Mystic: {color: '#6a0dad', fontStyle: 'italic'},
    Shimmer: {color: '#00ced1', fontWeight: 'bold'},
    // Add others as needed
  };


  const renderMascot = () => {
    switch (mood) {
      case 'Celebrate':
        return <GoatConfetti/>;
      default:

    }

  };

  return (
    <Animated.View style={[styles.overlay, positionStyle, {opacity: fadeAnim}]}>
      {renderMascot()}
    </Animated.View>
  );
};


const styles = StyleSheet.create({
  overlay: {
    position: 'absolute',
    left: 24,
    right: 24,
    padding: 12,
    backgroundColor: '#f0f8ff',
    borderRadius: 8,
    elevation: 4,
    alignItems: 'center',
  },
  mascot: {
    fontSize: 16,
    textAlign: 'center',
  },
});

export default MascotOverlay;

