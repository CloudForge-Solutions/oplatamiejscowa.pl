client:495 [vite] connecting...
client:618 [vite] connected.
CentralizedLogger.ts:437 [2025-08-02T16:55:18.070Z] [INFO] ℹ️ 📝 CentralizedLogger initialized +0ms - unknown {level: 'info', maxLogs: 1000, consoleOutput: true, performanceTracking: true}
CentralizedLogger.ts:437 [2025-08-02T16:55:18.071Z] [INFO] ℹ️ 💾 StorageService initialized +1ms - <src/platform/storage/StorageService.ts:6> {storageType: 'localStorage', cacheEnabled: true, defaultTTL: 300000}
CentralizedLogger.ts:437 [2025-08-02T16:55:18.072Z] [INFO] ℹ️ 🌐 ApiService initialized +2ms - <src/platform/api/ApiService.ts:8> {baseUrl: 'http://localhost:7071/api', cacheEnabled: true, defaultTimeout: 10000}
CentralizedLogger.ts:437 [2025-08-02T16:55:18.072Z] [INFO] ℹ️ 🏠 LocalStorageManager initialized for tourist tax app +2ms - <src/platform/storage/LocalStorageManager.ts:6>
config.ts:53 i18next: languageChanged en
config.ts:53 i18next: initialized {debug: true, initAsync: true, ns: Array(5), defaultNS: 'common', fallbackLng: Array(1), …}
react-dom_client.js?v=db3e61b5:17995 Download the React DevTools for a better development experience: https://react.dev/link/react-devtools
CentralizedLogger.ts:437 [2025-08-02T16:55:18.097Z] [INFO] ℹ️ 🚀 Tourist Tax React application starting +27ms - <src/shell/main.tsx:18>
CentralizedLogger.ts:437 [2025-08-02T16:55:18.100Z] [INFO] ℹ️ ✅ Tourist Tax React application rendered +30ms - <src/shell/main.tsx:35>
CentralizedLogger.ts:437 [2025-08-02T16:55:18.133Z] [INFO] ℹ️ 🏗️ Initializing Service Context (Layer 1) +63ms - <src/shell/context/ServiceContext.tsx:26>
CentralizedLogger.ts:437 [2025-08-02T16:55:18.133Z] [INFO] ℹ️ ✅ Service Context initialized with platform services +63ms - <src/shell/context/ServiceContext.tsx:32>
CentralizedLogger.ts:437 [2025-08-02T16:55:18.134Z] [INFO] ℹ️ 🏗️ Initializing Service Context (Layer 1) +64ms - <src/shell/context/ServiceContext.tsx:26>
CentralizedLogger.ts:437 [2025-08-02T16:55:18.134Z] [INFO] ℹ️ ✅ Service Context initialized with platform services +64ms - <src/shell/context/ServiceContext.tsx:32>
LanguageContext.tsx:62 i18next: languageChanged en
CentralizedLogger.ts:437 [2025-08-02T16:55:18.175Z] [INFO] ℹ️ 🚀 Tourist Tax App component initializing +105ms - <src/shell/App.tsx:138>
LanguageContext.tsx:62 i18next: languageChanged en
CentralizedLogger.ts:437 [2025-08-02T16:55:18.178Z] [INFO] ℹ️ 🚀 Tourist Tax App component initializing +109ms - <src/shell/App.tsx:138>
utils.js:1 Could not establish connection. Receiving end does not exist. ahmkjjgdligadogjedmnogbpbcpofeeo {}
utils.js:1 Could not establish connection. Receiving end does not exist. jaekigmcljkkalnicnjoafgfjoefkpeg {}
utils.js:1 Could not establish connection. Receiving end does not exist. noogafoofpebimajpfpamcfhoaifemoa {}
utils.js:1 No suspender extension installed
App.tsx:40 TypeError: formatCurrency is not a function
    at PaymentPage (PaymentPage.tsx:164:22)
    at Object.react_stack_bottom_frame (react-dom_client.js?v=db3e61b5:17424:20)
    at renderWithHooks (react-dom_client.js?v=db3e61b5:4206:24)
    at updateFunctionComponent (react-dom_client.js?v=db3e61b5:6619:21)
    at beginWork (react-dom_client.js?v=db3e61b5:7654:20)
    at runWithFiberInDEV (react-dom_client.js?v=db3e61b5:1485:72)
    at performUnitOfWork (react-dom_client.js?v=db3e61b5:10868:98)
    at workLoopSync (react-dom_client.js?v=db3e61b5:10728:43)
    at renderRootSync (react-dom_client.js?v=db3e61b5:10711:13)
    at performWorkOnRoot (react-dom_client.js?v=db3e61b5:10359:46)

The above error occurred in the <PaymentPage> component.

React will try to recreate this component tree from scratch using the error boundary you provided, ErrorBoundary.

defaultOnCaughtError @ react-dom_client.js?v=db3e61b5:6264
logCaughtError @ react-dom_client.js?v=db3e61b5:6296
runWithFiberInDEV @ react-dom_client.js?v=db3e61b5:1485
inst.componentDidCatch.update.callback @ react-dom_client.js?v=db3e61b5:6341
callCallback @ react-dom_client.js?v=db3e61b5:4097
commitCallbacks @ react-dom_client.js?v=db3e61b5:4109
runWithFiberInDEV @ react-dom_client.js?v=db3e61b5:1485
commitClassCallbacks @ react-dom_client.js?v=db3e61b5:8543
commitLayoutEffectOnFiber @ react-dom_client.js?v=db3e61b5:9011
recursivelyTraverseLayoutEffects @ react-dom_client.js?v=db3e61b5:9682
commitLayoutEffectOnFiber @ react-dom_client.js?v=db3e61b5:8956
recursivelyTraverseLayoutEffects @ react-dom_client.js?v=db3e61b5:9682
commitLayoutEffectOnFiber @ react-dom_client.js?v=db3e61b5:9096
recursivelyTraverseLayoutEffects @ react-dom_client.js?v=db3e61b5:9682
commitLayoutEffectOnFiber @ react-dom_client.js?v=db3e61b5:9016
flushLayoutEffects @ react-dom_client.js?v=db3e61b5:11174
commitRoot @ react-dom_client.js?v=db3e61b5:11080
commitRootWhenReady @ react-dom_client.js?v=db3e61b5:10512
performWorkOnRoot @ react-dom_client.js?v=db3e61b5:10457
performWorkOnRootViaSchedulerTask @ react-dom_client.js?v=db3e61b5:11623
performWorkUntilDeadline @ react-dom_client.js?v=db3e61b5:36
<...>
exports.jsxDEV @ react_jsx-dev-runtime.js?v=db3e61b5:250
AppRoutes @ App.tsx:40
react_stack_bottom_frame @ react-dom_client.js?v=db3e61b5:17424
renderWithHooksAgain @ react-dom_client.js?v=db3e61b5:4281
renderWithHooks @ react-dom_client.js?v=db3e61b5:4217
updateFunctionComponent @ react-dom_client.js?v=db3e61b5:6619
beginWork @ react-dom_client.js?v=db3e61b5:7654
runWithFiberInDEV @ react-dom_client.js?v=db3e61b5:1485
performUnitOfWork @ react-dom_client.js?v=db3e61b5:10868
workLoopConcurrentByScheduler @ react-dom_client.js?v=db3e61b5:10864
renderRootConcurrent @ react-dom_client.js?v=db3e61b5:10844
performWorkOnRoot @ react-dom_client.js?v=db3e61b5:10330
performWorkOnRootViaSchedulerTask @ react-dom_client.js?v=db3e61b5:11623
performWorkUntilDeadline @ react-dom_client.js?v=db3e61b5:36
<AppRoutes>
exports.jsxDEV @ react_jsx-dev-runtime.js?v=db3e61b5:250
App @ App.tsx:111
react_stack_bottom_frame @ react-dom_client.js?v=db3e61b5:17424
renderWithHooksAgain @ react-dom_client.js?v=db3e61b5:4281
renderWithHooks @ react-dom_client.js?v=db3e61b5:4217
updateFunctionComponent @ react-dom_client.js?v=db3e61b5:6619
beginWork @ react-dom_client.js?v=db3e61b5:7654
runWithFiberInDEV @ react-dom_client.js?v=db3e61b5:1485
performUnitOfWork @ react-dom_client.js?v=db3e61b5:10868
workLoopSync @ react-dom_client.js?v=db3e61b5:10728
renderRootSync @ react-dom_client.js?v=db3e61b5:10711
performWorkOnRoot @ react-dom_client.js?v=db3e61b5:10330
performWorkOnRootViaSchedulerTask @ react-dom_client.js?v=db3e61b5:11623
performWorkUntilDeadline @ react-dom_client.js?v=db3e61b5:36
<App>
exports.jsxDEV @ react_jsx-dev-runtime.js?v=db3e61b5:250
initializeReactApp @ main.tsx:49
(anonymous) @ main.tsx:74
CentralizedLogger.ts:434 [2025-08-02T16:55:18.607Z] [ERROR] ❌ 🚨 React Error Boundary caught an error +537ms - <src/shell/components/ErrorBoundary.tsx:16> {error: 'formatCurrency is not a function', stack: 'TypeError: formatCurrency is not a function\n    at…ite/deps/react-dom_client.js?v=db3e61b5:10359:46)', componentStack: '\n    at PaymentPage (http://localhost:3040/src/app…p (http://localhost:3040/src/shell/App.tsx:137:3)'}
_logToConsole @ CentralizedLogger.ts:434
error @ CentralizedLogger.ts:171
componentDidCatch @ ErrorBoundary.tsx:26
react_stack_bottom_frame @ react-dom_client.js?v=db3e61b5:17462
inst.componentDidCatch.update.callback @ react-dom_client.js?v=db3e61b5:6349
callCallback @ react-dom_client.js?v=db3e61b5:4097
commitCallbacks @ react-dom_client.js?v=db3e61b5:4109
runWithFiberInDEV @ react-dom_client.js?v=db3e61b5:1485
commitClassCallbacks @ react-dom_client.js?v=db3e61b5:8543
commitLayoutEffectOnFiber @ react-dom_client.js?v=db3e61b5:9011
recursivelyTraverseLayoutEffects @ react-dom_client.js?v=db3e61b5:9682
commitLayoutEffectOnFiber @ react-dom_client.js?v=db3e61b5:8956
recursivelyTraverseLayoutEffects @ react-dom_client.js?v=db3e61b5:9682
commitLayoutEffectOnFiber @ react-dom_client.js?v=db3e61b5:9096
recursivelyTraverseLayoutEffects @ react-dom_client.js?v=db3e61b5:9682
commitLayoutEffectOnFiber @ react-dom_client.js?v=db3e61b5:9016
flushLayoutEffects @ react-dom_client.js?v=db3e61b5:11174
commitRoot @ react-dom_client.js?v=db3e61b5:11080
commitRootWhenReady @ react-dom_client.js?v=db3e61b5:10512
performWorkOnRoot @ react-dom_client.js?v=db3e61b5:10457
performWorkOnRootViaSchedulerTask @ react-dom_client.js?v=db3e61b5:11623
performWorkUntilDeadline @ react-dom_client.js?v=db3e61b5:36
<ErrorBoundary>
exports.jsxDEV @ react_jsx-dev-runtime.js?v=db3e61b5:250
App @ App.tsx:91
react_stack_bottom_frame @ react-dom_client.js?v=db3e61b5:17424
renderWithHooksAgain @ react-dom_client.js?v=db3e61b5:4281
renderWithHooks @ react-dom_client.js?v=db3e61b5:4217
updateFunctionComponent @ react-dom_client.js?v=db3e61b5:6619
beginWork @ react-dom_client.js?v=db3e61b5:7654
runWithFiberInDEV @ react-dom_client.js?v=db3e61b5:1485
performUnitOfWork @ react-dom_client.js?v=db3e61b5:10868
workLoopSync @ react-dom_client.js?v=db3e61b5:10728
renderRootSync @ react-dom_client.js?v=db3e61b5:10711
performWorkOnRoot @ react-dom_client.js?v=db3e61b5:10330
performWorkOnRootViaSchedulerTask @ react-dom_client.js?v=db3e61b5:11623
performWorkUntilDeadline @ react-dom_client.js?v=db3e61b5:36
<App>
exports.jsxDEV @ react_jsx-dev-runtime.js?v=db3e61b5:250
initializeReactApp @ main.tsx:49
(anonymous) @ main.tsx:74
