import React, { useEffect, useRef } from 'react';
import { View, Animated, StyleSheet } from 'react-native';
import DescriptiveLogo from '@assets/descriptive_logo.svg';

const AnimatedLogo = Animated.createAnimatedComponent(DescriptiveLogo);

/**
 * A reusable animated splash layout that:
 * 1. Scales the logo in from 0.3 → 1
 * 2. Pauses briefly
 * 3. Slides the logo up while fading in the children (form content)
 *
 * @param {object} props
 * @param {React.ReactNode} props.children - The form/content to reveal after the animation
 * @param {number} [props.logoSize=250] - Width & height of the logo
 * @param {number} [props.slideDistance=-220] - How far the logo slides up (negative = up)
 * @param {number} [props.splashDuration=1000] - Duration of the logo scale-in animation
 * @param {number} [props.pauseDuration=2000] - Pause before the logo slides up
 * @param {number} [props.transitionDuration=800] - Duration of the slide/fade transition
 * @param {number} [props.formFadeDelay=400] - Delay before the form starts fading in
 */
export default function AnimatedSplashLayout({
  children,
  logoSize = 250,
  slideDistance = -220,
  splashDuration = 1000,
  pauseDuration = 2000,
  transitionDuration = 800,
  formFadeDelay = 400,
}) {
  const logoScale = useRef(new Animated.Value(0.3)).current;
  const logoPosition = useRef(new Animated.Value(0)).current;
  const formOpacity = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    Animated.sequence([
      Animated.timing(logoScale, {
        toValue: 1,
        duration: splashDuration,
        useNativeDriver: true,
      }),
      Animated.delay(pauseDuration),
      Animated.parallel([
        Animated.timing(logoPosition, {
          toValue: slideDistance,
          duration: transitionDuration,
          useNativeDriver: true,
        }),
        Animated.timing(formOpacity, {
          toValue: 1,
          duration: transitionDuration,
          delay: formFadeDelay,
          useNativeDriver: true,
        }),
      ]),
    ]).start();
  }, []);

  return (
    <View style={styles.container}>
      <Animated.View
        style={[
          styles.logoContainer,
          {
            transform: [
              { scale: logoScale },
              { translateY: logoPosition },
            ],
          },
        ]}
      >
        <AnimatedLogo width={logoSize} height={logoSize} />
      </Animated.View>

      <Animated.View style={[styles.formContainer, { opacity: formOpacity }]}>
        {children}
      </Animated.View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
    justifyContent: 'center',
    alignItems: 'center',
  },
  logoContainer: {
    position: 'absolute',
    alignItems: 'center',
  },
  formContainer: {
    width: '80%',
    marginTop: 100,
  },
});
