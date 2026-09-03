import { registerRootComponent } from 'expo';

import App from './App';
import ArPocApp from './ar-poc/ArPocApp';

// Phase A ViroReact toolchain validation (see ar-poc/): set EXPO_PUBLIC_AR_POC=1 to launch the
// isolated AR test screen instead of the real app - the real app (App.tsx, everything it does)
// is completely untouched either way. Unset (the default), this line has zero effect - it's
// exactly the one-line registerRootComponent(App) call this file always had.
const Root = process.env.EXPO_PUBLIC_AR_POC === '1' ? ArPocApp : App;

// registerRootComponent calls AppRegistry.registerComponent('main', () => App);
// It also ensures that whether you load the app in Expo Go or in a native build,
// the environment is set up appropriately
registerRootComponent(Root);
