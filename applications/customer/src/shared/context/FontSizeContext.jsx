import React, {
  createContext,
  useContext,
  useState,
  useEffect,
  useCallback,
  useSyncExternalStore,
} from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { rem } from 'nativewind';
import { StyleSheet } from 'react-native';

const STORAGE_KEY = '@customer_font_size_setting';

export const FONT_SIZE_OPTIONS = {
  small: {
    key: 'small',
    label: 'Small',
    description: 'Compact text, fits more content on screen',
    previewSize: 13,
    rem: 12.5,
    scale: 0.88,
  },
  medium: {
    key: 'medium',
    label: 'Medium',
    description: 'Default text size for PharmaDali',
    previewSize: 15,
    rem: 14,
    scale: 1.0,
    isDefault: true,
  },
  large: {
    key: 'large',
    label: 'Large',
    description: 'Larger text, easier to read',
    previewSize: 17,
    rem: 15.5,
    scale: 1.14,
  },
};

// Global reactive store for instant font scale updates across all mounted components
let currentFontSizeKey = 'medium';
let currentFontScale = 1.0;
const scaleListeners = new Set();

export const fontScaleStore = {
  getSnapshot: () => currentFontScale,
  getSizeKey: () => currentFontSizeKey,
  subscribe: (listener) => {
    scaleListeners.add(listener);
    return () => scaleListeners.delete(listener);
  },
  setScale: (sizeKey, scale) => {
    currentFontSizeKey = sizeKey;
    currentFontScale = scale;
    scaleListeners.forEach((listener) => {
      try {
        listener();
      } catch (err) {
        console.warn('[fontScaleStore] Listener error:', err);
      }
    });
  },
};

// Detect if a text component is rendering an icon glyph so we do not scale it
function isIconText(flatStyle, props) {
  if (props?.isIcon) return true;
  const fam = flatStyle?.fontFamily;
  if (fam && typeof fam === 'string') {
    const lower = fam.toLowerCase();
    if (
      lower.includes('ionicon') ||
      lower.includes('material') ||
      lower.includes('fontawesome') ||
      lower.includes('feather') ||
      lower.includes('octicon') ||
      lower.includes('antdesign') ||
      lower.includes('entypo') ||
      lower.includes('evilicon') ||
      lower.includes('foundation') ||
      lower.includes('zocial') ||
      lower.includes('simpleline') ||
      lower.includes('fontisto')
    ) {
      return true;
    }
  }
  return false;
}

// Compute scaled font size and line height while keeping layout constraints intact
function getScaledStyle(style, scale, props) {
  if (scale === 1.0 || !style) return style;

  const flat = StyleSheet.flatten(style);
  if (!flat) return style;

  if (isIconText(flat, props)) {
    return style;
  }

  const originalFontSize = flat.fontSize;
  const baseSize = typeof originalFontSize === 'number' ? originalFontSize : 14;
  const scaledFontSize = Math.round(baseSize * scale);

  const newStyle = { ...flat, fontSize: scaledFontSize };

  if (typeof flat.lineHeight === 'number') {
    newStyle.lineHeight = Math.round(flat.lineHeight * scale);
  }

  return newStyle;
}

const FontSizeContext = createContext({
  fontSize: 'medium',
  scale: 1.0,
  remValue: 14,
  setFontSize: async () => {},
  scaleFontSize: (baseSize) => baseSize,
  options: FONT_SIZE_OPTIONS,
});

export function FontSizeProvider({ children }) {
  const [fontSize, setFontSizeState] = useState('medium');
  const [isReady, setIsReady] = useState(false);

  // Apply rem value safely
  const applyRem = useCallback((targetRem) => {
    try {
      if (rem && typeof rem.set === 'function') {
        rem.set(targetRem);
      }
    } catch (err) {
      console.warn('[FontSizeProvider] Failed to update rem:', err);
    }
  }, []);

  // Load saved font size on mount
  useEffect(() => {
    let isMounted = true;

    async function loadSavedFontSize() {
      try {
        const saved = await AsyncStorage.getItem(STORAGE_KEY);
        if (saved && FONT_SIZE_OPTIONS[saved]) {
          if (isMounted) {
            setFontSizeState(saved);
            fontScaleStore.setScale(saved, FONT_SIZE_OPTIONS[saved].scale);
            applyRem(FONT_SIZE_OPTIONS[saved].rem);
          }
        } else {
          // Default is medium
          fontScaleStore.setScale('medium', FONT_SIZE_OPTIONS.medium.scale);
          applyRem(FONT_SIZE_OPTIONS.medium.rem);
        }
      } catch (err) {
        console.warn('[FontSizeProvider] Error loading font size:', err);
      } finally {
        if (isMounted) {
          setIsReady(true);
        }
      }
    }

    loadSavedFontSize();

    return () => {
      isMounted = false;
    };
  }, [applyRem]);

  const setFontSize = useCallback(
    async (newSize) => {
      if (!FONT_SIZE_OPTIONS[newSize]) return;

      setFontSizeState(newSize);
      fontScaleStore.setScale(newSize, FONT_SIZE_OPTIONS[newSize].scale);
      applyRem(FONT_SIZE_OPTIONS[newSize].rem);

      try {
        await AsyncStorage.setItem(STORAGE_KEY, newSize);
      } catch (err) {
        console.warn('[FontSizeProvider] Error saving font size:', err);
      }
    },
    [applyRem]
  );

  const currentOption = FONT_SIZE_OPTIONS[fontSize] || FONT_SIZE_OPTIONS.medium;
  const scale = currentOption.scale;
  const remValue = currentOption.rem;

  const scaleFontSize = useCallback(
    (baseSize) => {
      return Math.round(baseSize * scale);
    },
    [scale]
  );

  globalThis.__setFontSize = setFontSize;
  globalThis.__currentFontSize = fontSize;
  globalThis.__currentFontScale = scale;

  return (
    <FontSizeContext.Provider
      value={{
        fontSize,
        scale,
        remValue,
        setFontSize,
        scaleFontSize,
        options: FONT_SIZE_OPTIONS,
        isReady,
      }}
    >
      {children}
    </FontSizeContext.Provider>
  );
}

export function useFontSize() {
  const context = useContext(FontSizeContext);
  if (!context) {
    throw new Error('useFontSize must be used within a FontSizeProvider');
  }
  return context;
}

export default FontSizeContext;
