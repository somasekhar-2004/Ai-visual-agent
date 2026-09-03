import { registerRootComponent } from 'expo';

import App from './App';
import ArMainApp from './ar-poc/ArMainApp';

// AR tracking migration (see ar-poc/): set EXPO_PUBLIC_AR_POC=1 to launch the AR-camera version
// of the main app instead of the real one - App.tsx and everything it does is completely
// untouched either way. Unset (the default), this line has zero effect - it's exactly the
// one-line registerRootComponent(App) call this file always had.
//
// This flag has now moved on to Phase B (ArMainApp: ViroReact AR camera + the real ask/analyze/
// speak flow). Phase A's original hello-world toolchain smoke test (ArPocApp/ArPocScene - plane
// detection + tap-to-place a sphere, nothing else) is kept in ar-poc/ for reference but is no
// longer wired up here now that it's served its purpose of proving the toolchain works.
const Root = process.env.EXPO_PUBLIC_AR_POC === '1' ? ArMainApp : App;

// registerRootComponent calls AppRegistry.registerComponent('main', () => App);
// It also ensures that whether you load the app in Expo Go or in a native build,
// the environment is set up appropriately
registerRootComponent(Root);
