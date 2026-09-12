// https://docs.expo.dev/guides/using-eslint/
const { defineConfig } = require('eslint/config');
const expoConfig = require('eslint-config-expo/flat');

module.exports = defineConfig([
  expoConfig,
  {
    ignores: ['dist/*', 'node_modules/*', '.expo/*', 'backend/*'],
  },
  {
    rules: {
      // These are experimental React *Compiler* rules shipped in
      // eslint-plugin-react-hooks v6. The React Compiler is NOT enabled in this
      // project, and both rules are incompatible with idiomatic React Native
      // patterns used here: the Animated API (`useRef(new Animated.Value())` read
      // during render for interpolations), react-native-gesture-handler callbacks
      // that read refs, and a timer-driven unboxing state machine. They are turned
      // off deliberately; all correctness-oriented react-hooks rules stay on.
      'react-hooks/refs': 'off',
      'react-hooks/preserve-manual-memoization': 'off',
    },
  },
]);
