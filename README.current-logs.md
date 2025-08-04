client:495 [vite] connecting...
CentralizedLogger.ts:437 [2025-08-03T18:40:23.327Z] [INFO] ℹ️ 📝 CentralizedLogger initialized +0ms - unknown {level: 'info', maxLogs: 1000, consoleOutput: true, performanceTracking: true}
CentralizedLogger.ts:437 [2025-08-03T18:40:23.328Z] [INFO] ℹ️ 💾 StorageService initialized +1ms - <src/platform/storage/StorageService.ts:6> {storageType: 'localStorage', cacheEnabled: true, defaultTTL: 300000}
CentralizedLogger.ts:437 [2025-08-03T18:40:23.329Z] [INFO] ℹ️ 🌐 ApiService initialized +2ms - <src/platform/api/ApiService.ts:8> {baseUrl: 'http://localhost:7071/api', cacheEnabled: true, defaultTimeout: 10000}
CentralizedLogger.ts:437 [2025-08-03T18:40:23.329Z] [INFO] ℹ️ 🏠 LocalStorageManager initialized for tourist tax app +2ms - <src/platform/storage/LocalStorageManager.ts:6>
CentralizedLogger.ts:437 [2025-08-03T18:40:23.330Z] [INFO] ℹ️ Event schema registered: platform:language:changed +3ms - <src/platform/EventBus.ts:148>
CentralizedLogger.ts:437 [2025-08-03T18:40:23.331Z] [INFO] ℹ️ Event schema registered: platform:payment:initiated +4ms - <src/platform/EventBus.ts:148>
CentralizedLogger.ts:437 [2025-08-03T18:40:23.331Z] [INFO] ℹ️ Event schema registered: platform:payment:completed +4ms - <src/platform/EventBus.ts:148>
CentralizedLogger.ts:437 [2025-08-03T18:40:23.331Z] [INFO] ℹ️ Event schema registered: platform:payment:failed +4ms - <src/platform/EventBus.ts:148>
CentralizedLogger.ts:437 [2025-08-03T18:40:23.331Z] [INFO] ℹ️ Event schema registered: platform:reservation:loaded +4ms - <src/platform/EventBus.ts:148>
CentralizedLogger.ts:437 [2025-08-03T18:40:23.331Z] [INFO] ℹ️ Event schema registered: platform:storage:updated +4ms - <src/platform/EventBus.ts:148>
CentralizedLogger.ts:437 [2025-08-03T18:40:23.331Z] [INFO] ℹ️ Default event validation schemas initialized with constants +4ms - <src/platform/EventBus.ts:412>
CentralizedLogger.ts:437 [2025-08-03T18:40:23.331Z] [INFO] ℹ️ 📡 EventBus initialized with validation +4ms - <src/platform/EventBus.ts:35>
CentralizedLogger.ts:437 [2025-08-03T18:40:23.339Z] [INFO] ℹ️ 🗄️ BlobStorageService initialized for browser environment +12ms - <src/platform/storage/BlobStorageService.ts:15> {accountName: 'devstoreaccount1', containerName: 'reservations', serviceUrl: 'http://127.0.0.1:10000/devstoreaccount1', endpoint: 'Azure Storage Emulator'}
CentralizedLogger.ts:437 [2025-08-03T18:40:23.343Z] [INFO] ℹ️ 🚀 Initializing MockupApiService +16ms - <src/platform/api/MockupApiService.ts:17>
CentralizedLogger.ts:437 [2025-08-03T18:40:23.343Z] [INFO] ℹ️ 💳 ImojePaymentService initialized +16ms - <src/platform/api/ImojePaymentService.ts:16> {clientId: 'sv8y4qy6ao8q6ajfc5cv', shopId: 'fbe05411-7d56-44c1-9f16-1c989fea328d', sandboxUrl: 'https://sandbox.imoje.pl', environment: 'sandbox'}
config.ts:53 i18next: languageChanged pl
config.ts:53 i18next: initialized {debug: true, initAsync: true, ns: Array(5), defaultNS: 'common', fallbackLng: Array(1), …}
react-dom_client.js?v=92cb67a1:18004 Download the React DevTools for a better development experience: https://react.dev/link/react-devtools
CentralizedLogger.ts:437 [2025-08-03T18:40:23.368Z] [INFO] ℹ️ 🚀 Tourist Tax React application starting +41ms - <src/shell/main.tsx:18>
CentralizedLogger.ts:437 [2025-08-03T18:40:23.371Z] [INFO] ℹ️ ✅ Tourist Tax React application rendered +44ms - <src/shell/main.tsx:35>
CentralizedLogger.ts:437 [2025-08-03T18:40:23.410Z] [INFO] ℹ️ 🏗️ Initializing Service Context (Layer 1) +83ms - <src/shell/context/ServiceContext.tsx:30>
CentralizedLogger.ts:437 [2025-08-03T18:40:23.411Z] [INFO] ℹ️ ✅ Service Context initialized with platform services +84ms - <src/shell/context/ServiceContext.tsx:37>
CentralizedLogger.ts:437 [2025-08-03T18:40:23.447Z] [INFO] ℹ️ 🌐 HelpPage language updated +120ms - <src/shell/components/HelpPage.tsx:26> {currentLanguage: 'en'}
LanguageContext.tsx:76 i18next: languageChanged pl
CentralizedLogger.ts:437 [2025-08-03T18:40:23.449Z] [INFO] ℹ️ 🚀 Tourist Tax App component initializing +122ms - <src/shell/App.tsx:130>
CentralizedLogger.ts:437 [2025-08-03T18:40:23.451Z] [INFO] ℹ️ 🌐 HelpPage language updated +124ms - <src/shell/components/HelpPage.tsx:26> {currentLanguage: 'en'}
LanguageContext.tsx:76 i18next: languageChanged pl
CentralizedLogger.ts:437 [2025-08-03T18:40:23.452Z] [INFO] ℹ️ 🚀 Tourist Tax App component initializing +125ms - <src/shell/App.tsx:130>
CentralizedLogger.ts:437 [2025-08-03T18:40:23.458Z] [INFO] ℹ️ 🌐 LanguageSwitcher language changed +131ms - <src/shell/components/navbar/LanguageSwitcher.tsx:34> {from: 'en', to: 'pl', availableLanguages: Array(4), hasContext: true}
CentralizedLogger.ts:437 [2025-08-03T18:40:23.467Z] [INFO] ℹ️ 🌐 HelpPage language updated +140ms - <src/shell/components/HelpPage.tsx:26> {currentLanguage: 'pl'}
BlobStorageService.ts:125


           PUT http://127.0.0.1:10000/devstoreaccount1/reservations?restype=container 403 (Server failed to authenticate the request. Make sure the value of the Authorization header is formed correctly including the signature.)
makeRequest @ @azure_storage-blob.js?v=92cb67a1:1253
sendRequest @ @azure_storage-blob.js?v=92cb67a1:1238
sendRequest @ @azure_storage-blob.js?v=92cb67a1:7257
(anonymous) @ @azure_storage-blob.js?v=92cb67a1:823
sendRequest @ @azure_storage-blob.js?v=92cb67a1:1444
(anonymous) @ @azure_storage-blob.js?v=92cb67a1:821
sendRequest @ @azure_storage-blob.js?v=92cb67a1:4176
await in sendRequest
(anonymous) @ @azure_storage-blob.js?v=92cb67a1:821
sendRequest @ @azure_storage-blob.js?v=92cb67a1:7543
(anonymous) @ @azure_storage-blob.js?v=92cb67a1:821
sendRequest @ @azure_storage-blob.js?v=92cb67a1:2026
sendRequest @ @azure_storage-blob.js?v=92cb67a1:4074
(anonymous) @ @azure_storage-blob.js?v=92cb67a1:821
sendRequest @ @azure_storage-blob.js?v=92cb67a1:4787
(anonymous) @ @azure_storage-blob.js?v=92cb67a1:821
sendRequest @ @azure_storage-blob.js?v=92cb67a1:7439
(anonymous) @ @azure_storage-blob.js?v=92cb67a1:821
sendRequest @ @azure_storage-blob.js?v=92cb67a1:7638
(anonymous) @ @azure_storage-blob.js?v=92cb67a1:821
sendRequest @ @azure_storage-blob.js?v=92cb67a1:4118
(anonymous) @ @azure_storage-blob.js?v=92cb67a1:821
sendRequest @ @azure_storage-blob.js?v=92cb67a1:4036
await in sendRequest
(anonymous) @ @azure_storage-blob.js?v=92cb67a1:821
sendRequest @ @azure_storage-blob.js?v=92cb67a1:1828
(anonymous) @ @azure_storage-blob.js?v=92cb67a1:821
sendRequest @ @azure_storage-blob.js?v=92cb67a1:4290
(anonymous) @ @azure_storage-blob.js?v=92cb67a1:821
sendRequest @ @azure_storage-blob.js?v=92cb67a1:5000
(anonymous) @ @azure_storage-blob.js?v=92cb67a1:821
sendRequest @ @azure_storage-blob.js?v=92cb67a1:824
sendRequest @ @azure_storage-blob.js?v=92cb67a1:5361
sendOperationRequest @ @azure_storage-blob.js?v=92cb67a1:5420
sendOperationRequest @ @azure_storage-blob.js?v=92cb67a1:5865
sendOperationRequest @ @azure_storage-blob.js?v=92cb67a1:21210
create @ @azure_storage-blob.js?v=92cb67a1:18385
(anonymous) @ @azure_storage-blob.js?v=92cb67a1:27030
(anonymous) @ @azure_storage-blob.js?v=92cb67a1:2474
withContext @ @azure_storage-blob.js?v=92cb67a1:2438
withContext @ @azure_storage-blob.js?v=92cb67a1:2485
withSpan @ @azure_storage-blob.js?v=92cb67a1:2474
create @ @azure_storage-blob.js?v=92cb67a1:27029
(anonymous) @ @azure_storage-blob.js?v=92cb67a1:27045
(anonymous) @ @azure_storage-blob.js?v=92cb67a1:2474
withContext @ @azure_storage-blob.js?v=92cb67a1:2438
withContext @ @azure_storage-blob.js?v=92cb67a1:2485
withSpan @ @azure_storage-blob.js?v=92cb67a1:2474
createIfNotExists @ @azure_storage-blob.js?v=92cb67a1:27042
initializeContainer @ BlobStorageService.ts:125
BlobStorageService @ BlobStorageService.ts:75
(anonymous) @ BlobStorageService.ts:336
client:618 [vite] connected.
CentralizedLogger.ts:434 [2025-08-03T18:40:23.487Z] [ERROR] ❌ ❌ Failed to initialize container +160ms - <src/platform/storage/BlobStorageService.ts:70> {error: RestError: Server failed to authenticate the request. Make sure the value of the Authorization head…, containerName: 'reservations'}
_logToConsole @ CentralizedLogger.ts:434
error @ CentralizedLogger.ts:171
initializeContainer @ BlobStorageService.ts:135
await in initializeContainer
BlobStorageService @ BlobStorageService.ts:75
(anonymous) @ BlobStorageService.ts:336
CentralizedLogger.ts:430 [2025-08-03T18:40:23.488Z] [WARN] ⚠️ ⚠️ Azure Storage Emulator (Azurite) appears to be unavailable. Some features may not work. +161ms - <src/platform/storage/BlobStorageService.ts:75>
_logToConsole @ CentralizedLogger.ts:430
warn @ CentralizedLogger.ts:160
initializeContainer @ BlobStorageService.ts:142
await in initializeContainer
BlobStorageService @ BlobStorageService.ts:75
(anonymous) @ BlobStorageService.ts:336
CentralizedLogger.ts:437 [2025-08-03T18:40:23.488Z] [INFO] ℹ️ 💡 To start Azurite: npm run azurite or make storage-start +161ms - <src/platform/storage/BlobStorageService.ts:76>
CentralizedLogger.ts:430 [2025-08-03T18:40:23.489Z] [WARN] ⚠️ ⚠️ Blob storage not available, returning default stats +162ms - <src/platform/storage/BlobStorageService.ts:214>
_logToConsole @ CentralizedLogger.ts:430
warn @ CentralizedLogger.ts:160
getStorageStats @ BlobStorageService.ts:306
await in getStorageStats
getSeedingStats @ DataSeedingService.ts:211
initialize @ MockupApiService.ts:57
MockupApiService @ MockupApiService.ts:46
(anonymous) @ MockupApiService.ts:383
CentralizedLogger.ts:437 [2025-08-03T18:40:23.494Z] [INFO] ℹ️ 🛠️ DevUtils available globally as window.DevUtils +167ms - <src/utils/DevUtils.ts:159> {methods: Array(7)}
CentralizedLogger.ts:437 [2025-08-03T18:40:23.495Z] [INFO] ℹ️ 🚀 Setting up development environment +168ms - <src/utils/DevUtils.ts:121>
CentralizedLogger.ts:437 [2025-08-03T18:40:23.495Z] [INFO] ℹ️ 🔍 Testing API health +168ms - <src/utils/DevUtils.ts:32>
CentralizedLogger.ts:430 [2025-08-03T18:40:23.496Z] [WARN] ⚠️ ⚠️ Blob storage not available, returning default stats +169ms - <src/platform/storage/BlobStorageService.ts:214>
_logToConsole @ CentralizedLogger.ts:430
warn @ CentralizedLogger.ts:160
getStorageStats @ BlobStorageService.ts:306
await in getStorageStats
getSeedingStats @ DataSeedingService.ts:211
healthCheck @ MockupApiService.ts:329
testApiHealth @ DevUtils.ts:52
setupDevelopment @ DevUtils.ts:165
(anonymous) @ App.tsx:35
Promise.then
(anonymous) @ App.tsx:33
BlobStorageService.ts:253


           GET http://127.0.0.1:10000/devstoreaccount1/reservations?comp=list&prefix=reservations%2F&restype=container&_=1754246423490 403 (Server failed to authenticate the request. Make sure the value of the Authorization header is formed correctly including the signature.)
makeRequest @ @azure_storage-blob.js?v=92cb67a1:1253
sendRequest @ @azure_storage-blob.js?v=92cb67a1:1238
sendRequest @ @azure_storage-blob.js?v=92cb67a1:7257
(anonymous) @ @azure_storage-blob.js?v=92cb67a1:823
sendRequest @ @azure_storage-blob.js?v=92cb67a1:1444
(anonymous) @ @azure_storage-blob.js?v=92cb67a1:821
sendRequest @ @azure_storage-blob.js?v=92cb67a1:4176
await in sendRequest
(anonymous) @ @azure_storage-blob.js?v=92cb67a1:821
sendRequest @ @azure_storage-blob.js?v=92cb67a1:7543
(anonymous) @ @azure_storage-blob.js?v=92cb67a1:821
sendRequest @ @azure_storage-blob.js?v=92cb67a1:2026
sendRequest @ @azure_storage-blob.js?v=92cb67a1:4074
(anonymous) @ @azure_storage-blob.js?v=92cb67a1:821
sendRequest @ @azure_storage-blob.js?v=92cb67a1:4787
(anonymous) @ @azure_storage-blob.js?v=92cb67a1:821
sendRequest @ @azure_storage-blob.js?v=92cb67a1:7439
(anonymous) @ @azure_storage-blob.js?v=92cb67a1:821
sendRequest @ @azure_storage-blob.js?v=92cb67a1:7638
(anonymous) @ @azure_storage-blob.js?v=92cb67a1:821
sendRequest @ @azure_storage-blob.js?v=92cb67a1:4118
(anonymous) @ @azure_storage-blob.js?v=92cb67a1:821
sendRequest @ @azure_storage-blob.js?v=92cb67a1:4036
await in sendRequest
(anonymous) @ @azure_storage-blob.js?v=92cb67a1:821
sendRequest @ @azure_storage-blob.js?v=92cb67a1:1828
(anonymous) @ @azure_storage-blob.js?v=92cb67a1:821
sendRequest @ @azure_storage-blob.js?v=92cb67a1:4290
(anonymous) @ @azure_storage-blob.js?v=92cb67a1:821
sendRequest @ @azure_storage-blob.js?v=92cb67a1:5000
(anonymous) @ @azure_storage-blob.js?v=92cb67a1:821
sendRequest @ @azure_storage-blob.js?v=92cb67a1:824
sendRequest @ @azure_storage-blob.js?v=92cb67a1:5361
sendOperationRequest @ @azure_storage-blob.js?v=92cb67a1:5420
sendOperationRequest @ @azure_storage-blob.js?v=92cb67a1:5865
sendOperationRequest @ @azure_storage-blob.js?v=92cb67a1:21210
listBlobFlatSegment @ @azure_storage-blob.js?v=92cb67a1:18511
(anonymous) @ @azure_storage-blob.js?v=92cb67a1:27415
(anonymous) @ @azure_storage-blob.js?v=92cb67a1:2474
withContext @ @azure_storage-blob.js?v=92cb67a1:2438
withContext @ @azure_storage-blob.js?v=92cb67a1:2485
withSpan @ @azure_storage-blob.js?v=92cb67a1:2474
listBlobFlatSegment @ @azure_storage-blob.js?v=92cb67a1:27414
listSegments @ @azure_storage-blob.js?v=92cb67a1:27508
listItems @ @azure_storage-blob.js?v=92cb67a1:27521
next @ @azure_storage-blob.js?v=92cb67a1:27639
listReservations @ BlobStorageService.ts:253
getSeedingStats @ DataSeedingService.ts:212
await in getSeedingStats
initialize @ MockupApiService.ts:57
MockupApiService @ MockupApiService.ts:46
(anonymous) @ MockupApiService.ts:383
BlobStorageService.ts:253


           GET http://127.0.0.1:10000/devstoreaccount1/reservations?comp=list&prefix=reservations%2F&restype=container&_=1754246423497 403 (Server failed to authenticate the request. Make sure the value of the Authorization header is formed correctly including the signature.)
makeRequest @ @azure_storage-blob.js?v=92cb67a1:1253
sendRequest @ @azure_storage-blob.js?v=92cb67a1:1238
sendRequest @ @azure_storage-blob.js?v=92cb67a1:7257
(anonymous) @ @azure_storage-blob.js?v=92cb67a1:823
sendRequest @ @azure_storage-blob.js?v=92cb67a1:1444
(anonymous) @ @azure_storage-blob.js?v=92cb67a1:821
sendRequest @ @azure_storage-blob.js?v=92cb67a1:4176
await in sendRequest
(anonymous) @ @azure_storage-blob.js?v=92cb67a1:821
sendRequest @ @azure_storage-blob.js?v=92cb67a1:7543
(anonymous) @ @azure_storage-blob.js?v=92cb67a1:821
sendRequest @ @azure_storage-blob.js?v=92cb67a1:2026
sendRequest @ @azure_storage-blob.js?v=92cb67a1:4074
(anonymous) @ @azure_storage-blob.js?v=92cb67a1:821
sendRequest @ @azure_storage-blob.js?v=92cb67a1:4787
(anonymous) @ @azure_storage-blob.js?v=92cb67a1:821
sendRequest @ @azure_storage-blob.js?v=92cb67a1:7439
(anonymous) @ @azure_storage-blob.js?v=92cb67a1:821
sendRequest @ @azure_storage-blob.js?v=92cb67a1:7638
(anonymous) @ @azure_storage-blob.js?v=92cb67a1:821
sendRequest @ @azure_storage-blob.js?v=92cb67a1:4118
(anonymous) @ @azure_storage-blob.js?v=92cb67a1:821
sendRequest @ @azure_storage-blob.js?v=92cb67a1:4036
await in sendRequest
(anonymous) @ @azure_storage-blob.js?v=92cb67a1:821
sendRequest @ @azure_storage-blob.js?v=92cb67a1:1828
(anonymous) @ @azure_storage-blob.js?v=92cb67a1:821
sendRequest @ @azure_storage-blob.js?v=92cb67a1:4290
(anonymous) @ @azure_storage-blob.js?v=92cb67a1:821
sendRequest @ @azure_storage-blob.js?v=92cb67a1:5000
(anonymous) @ @azure_storage-blob.js?v=92cb67a1:821
sendRequest @ @azure_storage-blob.js?v=92cb67a1:824
sendRequest @ @azure_storage-blob.js?v=92cb67a1:5361
sendOperationRequest @ @azure_storage-blob.js?v=92cb67a1:5420
sendOperationRequest @ @azure_storage-blob.js?v=92cb67a1:5865
sendOperationRequest @ @azure_storage-blob.js?v=92cb67a1:21210
listBlobFlatSegment @ @azure_storage-blob.js?v=92cb67a1:18511
(anonymous) @ @azure_storage-blob.js?v=92cb67a1:27415
(anonymous) @ @azure_storage-blob.js?v=92cb67a1:2474
withContext @ @azure_storage-blob.js?v=92cb67a1:2438
withContext @ @azure_storage-blob.js?v=92cb67a1:2485
withSpan @ @azure_storage-blob.js?v=92cb67a1:2474
listBlobFlatSegment @ @azure_storage-blob.js?v=92cb67a1:27414
listSegments @ @azure_storage-blob.js?v=92cb67a1:27508
listItems @ @azure_storage-blob.js?v=92cb67a1:27521
next @ @azure_storage-blob.js?v=92cb67a1:27639
listReservations @ BlobStorageService.ts:253
getSeedingStats @ DataSeedingService.ts:212
await in getSeedingStats
healthCheck @ MockupApiService.ts:329
testApiHealth @ DevUtils.ts:52
setupDevelopment @ DevUtils.ts:165
(anonymous) @ App.tsx:35
Promise.then
(anonymous) @ App.tsx:33
utils.js:1 Could not establish connection. Receiving end does not exist. ahmkjjgdligadogjedmnogbpbcpofeeo {}
utils.js:1 Could not establish connection. Receiving end does not exist. jaekigmcljkkalnicnjoafgfjoefkpeg {}
CentralizedLogger.ts:434 [2025-08-03T18:40:23.778Z] [ERROR] ❌ ❌ Failed to list reservations +451ms - <src/platform/storage/BlobStorageService.ts:182> {error: RestError: Server failed to authenticate the request. Make sure the value of the Authorization head…}
_logToConsole @ CentralizedLogger.ts:434
error @ CentralizedLogger.ts:171
listReservations @ BlobStorageService.ts:269
await in listReservations
getSeedingStats @ DataSeedingService.ts:212
await in getSeedingStats
initialize @ MockupApiService.ts:57
MockupApiService @ MockupApiService.ts:46
(anonymous) @ MockupApiService.ts:383
CentralizedLogger.ts:437 [2025-08-03T18:40:23.778Z] [INFO] ℹ️ 🌱 No reservations found, seeding initial data +451ms - <src/platform/api/MockupApiService.ts:24>
CentralizedLogger.ts:437 [2025-08-03T18:40:23.779Z] [INFO] ℹ️ 🌱 Starting data seeding process +452ms - <src/platform/storage/DataSeedingService.ts:82> {count: 15}
CentralizedLogger.ts:430 [2025-08-03T18:40:23.780Z] [WARN] ⚠️ ⚠️ Blob storage not available, cannot store reservation +453ms - <src/platform/storage/BlobStorageService.ts:96> {reservationId: 'test-pending-001'}
_logToConsole @ CentralizedLogger.ts:430
warn @ CentralizedLogger.ts:160
storeReservation @ BlobStorageService.ts:165
await in storeReservation
seedReservations @ DataSeedingService.ts:151
initialize @ MockupApiService.ts:66
await in initialize
MockupApiService @ MockupApiService.ts:46
(anonymous) @ MockupApiService.ts:383
CentralizedLogger.ts:430 [2025-08-03T18:40:23.780Z] [WARN] ⚠️ ⚠️ Blob storage not available, cannot store reservation +453ms - <src/platform/storage/BlobStorageService.ts:96> {reservationId: 'test-paid-001'}
_logToConsole @ CentralizedLogger.ts:430
warn @ CentralizedLogger.ts:160
storeReservation @ BlobStorageService.ts:165
await in storeReservation
seedReservations @ DataSeedingService.ts:151
await in seedReservations
initialize @ MockupApiService.ts:66
await in initialize
MockupApiService @ MockupApiService.ts:46
(anonymous) @ MockupApiService.ts:383
CentralizedLogger.ts:430 [2025-08-03T18:40:23.781Z] [WARN] ⚠️ ⚠️ Blob storage not available, cannot store reservation +454ms - <src/platform/storage/BlobStorageService.ts:96> {reservationId: 'test-failed-001'}
_logToConsole @ CentralizedLogger.ts:430
warn @ CentralizedLogger.ts:160
storeReservation @ BlobStorageService.ts:165
await in storeReservation
seedReservations @ DataSeedingService.ts:151
await in seedReservations
initialize @ MockupApiService.ts:66
await in initialize
MockupApiService @ MockupApiService.ts:46
(anonymous) @ MockupApiService.ts:383
CentralizedLogger.ts:430 [2025-08-03T18:40:23.781Z] [WARN] ⚠️ ⚠️ Blob storage not available, cannot store reservation +454ms - <src/platform/storage/BlobStorageService.ts:96> {reservationId: '88e94ae1-5901-4687-bbe1-c172669d58e3'}
_logToConsole @ CentralizedLogger.ts:430
warn @ CentralizedLogger.ts:160
storeReservation @ BlobStorageService.ts:165
await in storeReservation
seedReservations @ DataSeedingService.ts:151
await in seedReservations
initialize @ MockupApiService.ts:66
await in initialize
MockupApiService @ MockupApiService.ts:46
(anonymous) @ MockupApiService.ts:383
CentralizedLogger.ts:430 [2025-08-03T18:40:23.781Z] [WARN] ⚠️ ⚠️ Blob storage not available, cannot store reservation +454ms - <src/platform/storage/BlobStorageService.ts:96> {reservationId: 'cea738c8-a266-4688-9994-c0144ef46dc8'}
_logToConsole @ CentralizedLogger.ts:430
warn @ CentralizedLogger.ts:160
storeReservation @ BlobStorageService.ts:165
await in storeReservation
seedReservations @ DataSeedingService.ts:151
await in seedReservations
initialize @ MockupApiService.ts:66
await in initialize
MockupApiService @ MockupApiService.ts:46
(anonymous) @ MockupApiService.ts:383
CentralizedLogger.ts:430 [2025-08-03T18:40:23.782Z] [WARN] ⚠️ ⚠️ Blob storage not available, cannot store reservation +455ms - <src/platform/storage/BlobStorageService.ts:96> {reservationId: '84433969-ed0d-4ee2-bb62-606d16a5f06c'}
_logToConsole @ CentralizedLogger.ts:430
warn @ CentralizedLogger.ts:160
storeReservation @ BlobStorageService.ts:165
await in storeReservation
seedReservations @ DataSeedingService.ts:151
await in seedReservations
initialize @ MockupApiService.ts:66
await in initialize
MockupApiService @ MockupApiService.ts:46
(anonymous) @ MockupApiService.ts:383
CentralizedLogger.ts:430 [2025-08-03T18:40:23.782Z] [WARN] ⚠️ ⚠️ Blob storage not available, cannot store reservation +455ms - <src/platform/storage/BlobStorageService.ts:96> {reservationId: '8222f2e9-9e59-437b-9fc3-c27ad9f2c39a'}
_logToConsole @ CentralizedLogger.ts:430
warn @ CentralizedLogger.ts:160
storeReservation @ BlobStorageService.ts:165
await in storeReservation
seedReservations @ DataSeedingService.ts:151
await in seedReservations
initialize @ MockupApiService.ts:66
await in initialize
MockupApiService @ MockupApiService.ts:46
(anonymous) @ MockupApiService.ts:383
CentralizedLogger.ts:430 [2025-08-03T18:40:23.782Z] [WARN] ⚠️ ⚠️ Blob storage not available, cannot store reservation +455ms - <src/platform/storage/BlobStorageService.ts:96> {reservationId: 'c20c7c0e-c1e9-4166-aaaa-d18c8d0ce0dc'}
_logToConsole @ CentralizedLogger.ts:430
warn @ CentralizedLogger.ts:160
storeReservation @ BlobStorageService.ts:165
await in storeReservation
seedReservations @ DataSeedingService.ts:151
await in seedReservations
initialize @ MockupApiService.ts:66
await in initialize
MockupApiService @ MockupApiService.ts:46
(anonymous) @ MockupApiService.ts:383
CentralizedLogger.ts:430 [2025-08-03T18:40:23.783Z] [WARN] ⚠️ ⚠️ Blob storage not available, cannot store reservation +456ms - <src/platform/storage/BlobStorageService.ts:96> {reservationId: 'bbfc4a2c-12ff-41fe-b7f7-f0d63c9d7e7c'}
_logToConsole @ CentralizedLogger.ts:430
warn @ CentralizedLogger.ts:160
storeReservation @ BlobStorageService.ts:165
await in storeReservation
seedReservations @ DataSeedingService.ts:151
await in seedReservations
initialize @ MockupApiService.ts:66
await in initialize
MockupApiService @ MockupApiService.ts:46
(anonymous) @ MockupApiService.ts:383
CentralizedLogger.ts:430 [2025-08-03T18:40:23.783Z] [WARN] ⚠️ ⚠️ Blob storage not available, cannot store reservation +456ms - <src/platform/storage/BlobStorageService.ts:96> {reservationId: '55a7bf5a-1804-40c1-9fac-0c17478b0a26'}
_logToConsole @ CentralizedLogger.ts:430
warn @ CentralizedLogger.ts:160
storeReservation @ BlobStorageService.ts:165
await in storeReservation
seedReservations @ DataSeedingService.ts:151
await in seedReservations
initialize @ MockupApiService.ts:66
await in initialize
MockupApiService @ MockupApiService.ts:46
(anonymous) @ MockupApiService.ts:383
CentralizedLogger.ts:430 [2025-08-03T18:40:23.783Z] [WARN] ⚠️ ⚠️ Blob storage not available, cannot store reservation +456ms - <src/platform/storage/BlobStorageService.ts:96> {reservationId: '20b82371-a116-496b-9113-001c49605f02'}
_logToConsole @ CentralizedLogger.ts:430
warn @ CentralizedLogger.ts:160
storeReservation @ BlobStorageService.ts:165
await in storeReservation
seedReservations @ DataSeedingService.ts:151
await in seedReservations
initialize @ MockupApiService.ts:66
await in initialize
MockupApiService @ MockupApiService.ts:46
(anonymous) @ MockupApiService.ts:383
CentralizedLogger.ts:430 [2025-08-03T18:40:23.784Z] [WARN] ⚠️ ⚠️ Blob storage not available, cannot store reservation +457ms - <src/platform/storage/BlobStorageService.ts:96> {reservationId: '8ad21ed3-1ff4-468d-b09e-1a982aa0384e'}
_logToConsole @ CentralizedLogger.ts:430
warn @ CentralizedLogger.ts:160
storeReservation @ BlobStorageService.ts:165
await in storeReservation
seedReservations @ DataSeedingService.ts:151
await in seedReservations
initialize @ MockupApiService.ts:66
await in initialize
MockupApiService @ MockupApiService.ts:46
(anonymous) @ MockupApiService.ts:383
CentralizedLogger.ts:430 [2025-08-03T18:40:23.784Z] [WARN] ⚠️ ⚠️ Blob storage not available, cannot store reservation +457ms - <src/platform/storage/BlobStorageService.ts:96> {reservationId: '81615d4b-ae9f-4acc-92e3-6979d75e57e6'}
_logToConsole @ CentralizedLogger.ts:430
warn @ CentralizedLogger.ts:160
storeReservation @ BlobStorageService.ts:165
await in storeReservation
seedReservations @ DataSeedingService.ts:151
await in seedReservations
initialize @ MockupApiService.ts:66
await in initialize
MockupApiService @ MockupApiService.ts:46
(anonymous) @ MockupApiService.ts:383
CentralizedLogger.ts:430 [2025-08-03T18:40:23.785Z] [WARN] ⚠️ ⚠️ Blob storage not available, cannot store reservation +458ms - <src/platform/storage/BlobStorageService.ts:96> {reservationId: '86edda74-be3c-4c83-a09b-9460a8f60db1'}
_logToConsole @ CentralizedLogger.ts:430
warn @ CentralizedLogger.ts:160
storeReservation @ BlobStorageService.ts:165
await in storeReservation
seedReservations @ DataSeedingService.ts:151
await in seedReservations
initialize @ MockupApiService.ts:66
await in initialize
MockupApiService @ MockupApiService.ts:46
(anonymous) @ MockupApiService.ts:383
CentralizedLogger.ts:430 [2025-08-03T18:40:23.785Z] [WARN] ⚠️ ⚠️ Blob storage not available, cannot store reservation +458ms - <src/platform/storage/BlobStorageService.ts:96> {reservationId: '000eddc4-d052-417e-9601-1846d5754c2e'}
_logToConsole @ CentralizedLogger.ts:430
warn @ CentralizedLogger.ts:160
storeReservation @ BlobStorageService.ts:165
await in storeReservation
seedReservations @ DataSeedingService.ts:151
await in seedReservations
initialize @ MockupApiService.ts:66
await in initialize
MockupApiService @ MockupApiService.ts:46
(anonymous) @ MockupApiService.ts:383
CentralizedLogger.ts:437 [2025-08-03T18:40:23.785Z] [INFO] ℹ️ ✅ Data seeding completed +458ms - <src/platform/storage/DataSeedingService.ts:124> {totalReservations: 15, successfullyStored: 0, failed: 15}
CentralizedLogger.ts:437 [2025-08-03T18:40:23.786Z] [INFO] ℹ️ 📋 Sample reservation IDs for testing +459ms - <src/platform/storage/DataSeedingService.ts:130> {sampleIds: Array(3)}
CentralizedLogger.ts:437 [2025-08-03T18:40:23.786Z] [INFO] ℹ️ ✅ MockupApiService initialized +459ms - <src/platform/api/MockupApiService.ts:28> {reservationCount: 0, storageConnected: true}
CentralizedLogger.ts:434 [2025-08-03T18:40:23.787Z] [ERROR] ❌ ❌ Failed to list reservations +460ms - <src/platform/storage/BlobStorageService.ts:182> {error: RestError: Server failed to authenticate the request. Make sure the value of the Authorization head…}
_logToConsole @ CentralizedLogger.ts:434
error @ CentralizedLogger.ts:171
listReservations @ BlobStorageService.ts:269
await in listReservations
getSeedingStats @ DataSeedingService.ts:212
await in getSeedingStats
healthCheck @ MockupApiService.ts:329
testApiHealth @ DevUtils.ts:52
setupDevelopment @ DevUtils.ts:165
(anonymous) @ App.tsx:35
Promise.then
(anonymous) @ App.tsx:33
CentralizedLogger.ts:437 [2025-08-03T18:40:23.787Z] [INFO] ℹ️ ✅ API health check passed +460ms - <src/utils/DevUtils.ts:35> {status: 'healthy', storage: true, timestamp: '2025-08-03T18:40:23.787Z'}
CentralizedLogger.ts:437 [2025-08-03T18:40:23.788Z] [INFO] ℹ️ 🌱 Seeding test data for development +461ms - <src/utils/DevUtils.ts:10> {count: 15}
CentralizedLogger.ts:437 [2025-08-03T18:40:23.788Z] [INFO] ℹ️ 🧹 Clearing existing reservations +461ms - <src/platform/storage/DataSeedingService.ts:141>
utils.js:1 Could not establish connection. Receiving end does not exist. noogafoofpebimajpfpamcfhoaifemoa {}
utils.js:1 No suspender extension installed
BlobStorageService.ts:253


           GET http://127.0.0.1:10000/devstoreaccount1/reservations?comp=list&prefix=reservations%2F&restype=container&_=1754246423790 403 (Server failed to authenticate the request. Make sure the value of the Authorization header is formed correctly including the signature.)
makeRequest @ @azure_storage-blob.js?v=92cb67a1:1253
sendRequest @ @azure_storage-blob.js?v=92cb67a1:1238
sendRequest @ @azure_storage-blob.js?v=92cb67a1:7257
(anonymous) @ @azure_storage-blob.js?v=92cb67a1:823
sendRequest @ @azure_storage-blob.js?v=92cb67a1:1444
(anonymous) @ @azure_storage-blob.js?v=92cb67a1:821
sendRequest @ @azure_storage-blob.js?v=92cb67a1:4176
await in sendRequest
(anonymous) @ @azure_storage-blob.js?v=92cb67a1:821
sendRequest @ @azure_storage-blob.js?v=92cb67a1:7543
(anonymous) @ @azure_storage-blob.js?v=92cb67a1:821
sendRequest @ @azure_storage-blob.js?v=92cb67a1:2026
sendRequest @ @azure_storage-blob.js?v=92cb67a1:4074
(anonymous) @ @azure_storage-blob.js?v=92cb67a1:821
sendRequest @ @azure_storage-blob.js?v=92cb67a1:4787
(anonymous) @ @azure_storage-blob.js?v=92cb67a1:821
sendRequest @ @azure_storage-blob.js?v=92cb67a1:7439
(anonymous) @ @azure_storage-blob.js?v=92cb67a1:821
sendRequest @ @azure_storage-blob.js?v=92cb67a1:7638
(anonymous) @ @azure_storage-blob.js?v=92cb67a1:821
sendRequest @ @azure_storage-blob.js?v=92cb67a1:4118
(anonymous) @ @azure_storage-blob.js?v=92cb67a1:821
sendRequest @ @azure_storage-blob.js?v=92cb67a1:4036
await in sendRequest
(anonymous) @ @azure_storage-blob.js?v=92cb67a1:821
sendRequest @ @azure_storage-blob.js?v=92cb67a1:1828
(anonymous) @ @azure_storage-blob.js?v=92cb67a1:821
sendRequest @ @azure_storage-blob.js?v=92cb67a1:4290
(anonymous) @ @azure_storage-blob.js?v=92cb67a1:821
sendRequest @ @azure_storage-blob.js?v=92cb67a1:5000
(anonymous) @ @azure_storage-blob.js?v=92cb67a1:821
sendRequest @ @azure_storage-blob.js?v=92cb67a1:824
sendRequest @ @azure_storage-blob.js?v=92cb67a1:5361
sendOperationRequest @ @azure_storage-blob.js?v=92cb67a1:5420
sendOperationRequest @ @azure_storage-blob.js?v=92cb67a1:5865
sendOperationRequest @ @azure_storage-blob.js?v=92cb67a1:21210
listBlobFlatSegment @ @azure_storage-blob.js?v=92cb67a1:18511
(anonymous) @ @azure_storage-blob.js?v=92cb67a1:27415
(anonymous) @ @azure_storage-blob.js?v=92cb67a1:2474
withContext @ @azure_storage-blob.js?v=92cb67a1:2438
withContext @ @azure_storage-blob.js?v=92cb67a1:2485
withSpan @ @azure_storage-blob.js?v=92cb67a1:2474
listBlobFlatSegment @ @azure_storage-blob.js?v=92cb67a1:27414
listSegments @ @azure_storage-blob.js?v=92cb67a1:27508
listItems @ @azure_storage-blob.js?v=92cb67a1:27521
next @ @azure_storage-blob.js?v=92cb67a1:27639
listReservations @ BlobStorageService.ts:253
clearReservations @ DataSeedingService.ts:180
reseed @ DataSeedingService.ts:235
seedTestData @ DevUtils.ts:24
setupDevelopment @ DevUtils.ts:168
await in setupDevelopment
(anonymous) @ App.tsx:35
Promise.then
(anonymous) @ App.tsx:33
CentralizedLogger.ts:434 [2025-08-03T18:40:23.814Z] [ERROR] ❌ ❌ Failed to list reservations +487ms - <src/platform/storage/BlobStorageService.ts:182> {error: RestError: Server failed to authenticate the request. Make sure the value of the Authorization head…}
_logToConsole @ CentralizedLogger.ts:434
error @ CentralizedLogger.ts:171
listReservations @ BlobStorageService.ts:269
await in listReservations
clearReservations @ DataSeedingService.ts:180
reseed @ DataSeedingService.ts:235
seedTestData @ DevUtils.ts:24
setupDevelopment @ DevUtils.ts:168
await in setupDevelopment
(anonymous) @ App.tsx:35
Promise.then
(anonymous) @ App.tsx:33
CentralizedLogger.ts:437 [2025-08-03T18:40:23.814Z] [INFO] ℹ️ ✅ Reservations cleared +487ms - <src/platform/storage/DataSeedingService.ts:150> {totalFound: 0, deleted: 0}
CentralizedLogger.ts:437 [2025-08-03T18:40:23.815Z] [INFO] ℹ️ 🌱 Starting data seeding process +488ms - <src/platform/storage/DataSeedingService.ts:82> {count: 15}
CentralizedLogger.ts:430 [2025-08-03T18:40:23.815Z] [WARN] ⚠️ ⚠️ Blob storage not available, cannot store reservation +488ms - <src/platform/storage/BlobStorageService.ts:96> {reservationId: 'test-pending-001'}
_logToConsole @ CentralizedLogger.ts:430
warn @ CentralizedLogger.ts:160
storeReservation @ BlobStorageService.ts:165
await in storeReservation
seedReservations @ DataSeedingService.ts:151
reseed @ DataSeedingService.ts:236
await in reseed
seedTestData @ DevUtils.ts:24
setupDevelopment @ DevUtils.ts:168
await in setupDevelopment
(anonymous) @ App.tsx:35
Promise.then
(anonymous) @ App.tsx:33
CentralizedLogger.ts:430 [2025-08-03T18:40:23.816Z] [WARN] ⚠️ ⚠️ Blob storage not available, cannot store reservation +489ms - <src/platform/storage/BlobStorageService.ts:96> {reservationId: 'test-paid-001'}
_logToConsole @ CentralizedLogger.ts:430
warn @ CentralizedLogger.ts:160
storeReservation @ BlobStorageService.ts:165
await in storeReservation
seedReservations @ DataSeedingService.ts:151
await in seedReservations
reseed @ DataSeedingService.ts:236
await in reseed
seedTestData @ DevUtils.ts:24
setupDevelopment @ DevUtils.ts:168
await in setupDevelopment
(anonymous) @ App.tsx:35
Promise.then
(anonymous) @ App.tsx:33
CentralizedLogger.ts:430 [2025-08-03T18:40:23.817Z] [WARN] ⚠️ ⚠️ Blob storage not available, cannot store reservation +490ms - <src/platform/storage/BlobStorageService.ts:96> {reservationId: 'test-failed-001'}
_logToConsole @ CentralizedLogger.ts:430
warn @ CentralizedLogger.ts:160
storeReservation @ BlobStorageService.ts:165
await in storeReservation
seedReservations @ DataSeedingService.ts:151
await in seedReservations
reseed @ DataSeedingService.ts:236
await in reseed
seedTestData @ DevUtils.ts:24
setupDevelopment @ DevUtils.ts:168
await in setupDevelopment
(anonymous) @ App.tsx:35
Promise.then
(anonymous) @ App.tsx:33
CentralizedLogger.ts:430 [2025-08-03T18:40:23.817Z] [WARN] ⚠️ ⚠️ Blob storage not available, cannot store reservation +490ms - <src/platform/storage/BlobStorageService.ts:96> {reservationId: '79aca72f-827e-427f-a017-ca463f0c8387'}
_logToConsole @ CentralizedLogger.ts:430
warn @ CentralizedLogger.ts:160
storeReservation @ BlobStorageService.ts:165
await in storeReservation
seedReservations @ DataSeedingService.ts:151
await in seedReservations
reseed @ DataSeedingService.ts:236
await in reseed
seedTestData @ DevUtils.ts:24
setupDevelopment @ DevUtils.ts:168
await in setupDevelopment
(anonymous) @ App.tsx:35
Promise.then
(anonymous) @ App.tsx:33
CentralizedLogger.ts:430 [2025-08-03T18:40:23.818Z] [WARN] ⚠️ ⚠️ Blob storage not available, cannot store reservation +491ms - <src/platform/storage/BlobStorageService.ts:96> {reservationId: 'ff7bd0fa-f54a-4ba2-b3dc-c13a3ad3e526'}
_logToConsole @ CentralizedLogger.ts:430
warn @ CentralizedLogger.ts:160
storeReservation @ BlobStorageService.ts:165
await in storeReservation
seedReservations @ DataSeedingService.ts:151
await in seedReservations
reseed @ DataSeedingService.ts:236
await in reseed
seedTestData @ DevUtils.ts:24
setupDevelopment @ DevUtils.ts:168
await in setupDevelopment
(anonymous) @ App.tsx:35
Promise.then
(anonymous) @ App.tsx:33
CentralizedLogger.ts:430 [2025-08-03T18:40:23.818Z] [WARN] ⚠️ ⚠️ Blob storage not available, cannot store reservation +491ms - <src/platform/storage/BlobStorageService.ts:96> {reservationId: '79aac349-8d1b-4b17-8514-1fb044a9958b'}
_logToConsole @ CentralizedLogger.ts:430
warn @ CentralizedLogger.ts:160
storeReservation @ BlobStorageService.ts:165
await in storeReservation
seedReservations @ DataSeedingService.ts:151
await in seedReservations
reseed @ DataSeedingService.ts:236
await in reseed
seedTestData @ DevUtils.ts:24
setupDevelopment @ DevUtils.ts:168
await in setupDevelopment
(anonymous) @ App.tsx:35
Promise.then
(anonymous) @ App.tsx:33
CentralizedLogger.ts:430 [2025-08-03T18:40:23.818Z] [WARN] ⚠️ ⚠️ Blob storage not available, cannot store reservation +491ms - <src/platform/storage/BlobStorageService.ts:96> {reservationId: 'aeaf112e-7a34-4521-9bc9-aa3509f1f891'}
_logToConsole @ CentralizedLogger.ts:430
warn @ CentralizedLogger.ts:160
storeReservation @ BlobStorageService.ts:165
await in storeReservation
seedReservations @ DataSeedingService.ts:151
await in seedReservations
reseed @ DataSeedingService.ts:236
await in reseed
seedTestData @ DevUtils.ts:24
setupDevelopment @ DevUtils.ts:168
await in setupDevelopment
(anonymous) @ App.tsx:35
Promise.then
(anonymous) @ App.tsx:33
CentralizedLogger.ts:430 [2025-08-03T18:40:23.819Z] [WARN] ⚠️ ⚠️ Blob storage not available, cannot store reservation +492ms - <src/platform/storage/BlobStorageService.ts:96> {reservationId: 'e670dd8c-fe88-4605-9700-c41071564e8a'}
_logToConsole @ CentralizedLogger.ts:430
warn @ CentralizedLogger.ts:160
storeReservation @ BlobStorageService.ts:165
await in storeReservation
seedReservations @ DataSeedingService.ts:151
await in seedReservations
reseed @ DataSeedingService.ts:236
await in reseed
seedTestData @ DevUtils.ts:24
setupDevelopment @ DevUtils.ts:168
await in setupDevelopment
(anonymous) @ App.tsx:35
Promise.then
(anonymous) @ App.tsx:33
CentralizedLogger.ts:430 [2025-08-03T18:40:23.819Z] [WARN] ⚠️ ⚠️ Blob storage not available, cannot store reservation +492ms - <src/platform/storage/BlobStorageService.ts:96> {reservationId: 'db0e7bc6-9912-483a-afc8-288e67d2c281'}
_logToConsole @ CentralizedLogger.ts:430
warn @ CentralizedLogger.ts:160
storeReservation @ BlobStorageService.ts:165
await in storeReservation
seedReservations @ DataSeedingService.ts:151
await in seedReservations
reseed @ DataSeedingService.ts:236
await in reseed
seedTestData @ DevUtils.ts:24
setupDevelopment @ DevUtils.ts:168
await in setupDevelopment
(anonymous) @ App.tsx:35
Promise.then
(anonymous) @ App.tsx:33
CentralizedLogger.ts:430 [2025-08-03T18:40:23.820Z] [WARN] ⚠️ ⚠️ Blob storage not available, cannot store reservation +493ms - <src/platform/storage/BlobStorageService.ts:96> {reservationId: '19255e38-d035-45a0-8cf0-9d0b1ff96ec6'}
_logToConsole @ CentralizedLogger.ts:430
warn @ CentralizedLogger.ts:160
storeReservation @ BlobStorageService.ts:165
await in storeReservation
seedReservations @ DataSeedingService.ts:151
await in seedReservations
reseed @ DataSeedingService.ts:236
await in reseed
seedTestData @ DevUtils.ts:24
setupDevelopment @ DevUtils.ts:168
await in setupDevelopment
(anonymous) @ App.tsx:35
Promise.then
(anonymous) @ App.tsx:33
CentralizedLogger.ts:430 [2025-08-03T18:40:23.820Z] [WARN] ⚠️ ⚠️ Blob storage not available, cannot store reservation +493ms - <src/platform/storage/BlobStorageService.ts:96> {reservationId: '64889da3-9b7c-417d-b97a-323dcf228fb3'}
_logToConsole @ CentralizedLogger.ts:430
warn @ CentralizedLogger.ts:160
storeReservation @ BlobStorageService.ts:165
await in storeReservation
seedReservations @ DataSeedingService.ts:151
await in seedReservations
reseed @ DataSeedingService.ts:236
await in reseed
seedTestData @ DevUtils.ts:24
setupDevelopment @ DevUtils.ts:168
await in setupDevelopment
(anonymous) @ App.tsx:35
Promise.then
(anonymous) @ App.tsx:33
CentralizedLogger.ts:430 [2025-08-03T18:40:23.821Z] [WARN] ⚠️ ⚠️ Blob storage not available, cannot store reservation +494ms - <src/platform/storage/BlobStorageService.ts:96> {reservationId: '2e5fc8fe-e11b-4a37-8469-9b038d3f4fad'}
_logToConsole @ CentralizedLogger.ts:430
warn @ CentralizedLogger.ts:160
storeReservation @ BlobStorageService.ts:165
await in storeReservation
seedReservations @ DataSeedingService.ts:151
await in seedReservations
reseed @ DataSeedingService.ts:236
await in reseed
seedTestData @ DevUtils.ts:24
setupDevelopment @ DevUtils.ts:168
await in setupDevelopment
(anonymous) @ App.tsx:35
Promise.then
(anonymous) @ App.tsx:33
CentralizedLogger.ts:430 [2025-08-03T18:40:23.821Z] [WARN] ⚠️ ⚠️ Blob storage not available, cannot store reservation +494ms - <src/platform/storage/BlobStorageService.ts:96> {reservationId: 'b3e2a8f4-c66a-459e-a5b3-cefcace17a3a'}
_logToConsole @ CentralizedLogger.ts:430
warn @ CentralizedLogger.ts:160
storeReservation @ BlobStorageService.ts:165
await in storeReservation
seedReservations @ DataSeedingService.ts:151
await in seedReservations
reseed @ DataSeedingService.ts:236
await in reseed
seedTestData @ DevUtils.ts:24
setupDevelopment @ DevUtils.ts:168
await in setupDevelopment
(anonymous) @ App.tsx:35
Promise.then
(anonymous) @ App.tsx:33
CentralizedLogger.ts:430 [2025-08-03T18:40:23.821Z] [WARN] ⚠️ ⚠️ Blob storage not available, cannot store reservation +494ms - <src/platform/storage/BlobStorageService.ts:96> {reservationId: '17628137-8c2a-4802-ae30-784d3e39e9e3'}
_logToConsole @ CentralizedLogger.ts:430
warn @ CentralizedLogger.ts:160
storeReservation @ BlobStorageService.ts:165
await in storeReservation
seedReservations @ DataSeedingService.ts:151
await in seedReservations
reseed @ DataSeedingService.ts:236
await in reseed
seedTestData @ DevUtils.ts:24
setupDevelopment @ DevUtils.ts:168
await in setupDevelopment
(anonymous) @ App.tsx:35
Promise.then
(anonymous) @ App.tsx:33
CentralizedLogger.ts:430 [2025-08-03T18:40:23.822Z] [WARN] ⚠️ ⚠️ Blob storage not available, cannot store reservation +495ms - <src/platform/storage/BlobStorageService.ts:96> {reservationId: '5677e82c-d4cf-4689-9b16-32de05ea021a'}
_logToConsole @ CentralizedLogger.ts:430
warn @ CentralizedLogger.ts:160
storeReservation @ BlobStorageService.ts:165
await in storeReservation
seedReservations @ DataSeedingService.ts:151
await in seedReservations
reseed @ DataSeedingService.ts:236
await in reseed
seedTestData @ DevUtils.ts:24
setupDevelopment @ DevUtils.ts:168
await in setupDevelopment
(anonymous) @ App.tsx:35
Promise.then
(anonymous) @ App.tsx:33
CentralizedLogger.ts:437 [2025-08-03T18:40:23.822Z] [INFO] ℹ️ ✅ Data seeding completed +495ms - <src/platform/storage/DataSeedingService.ts:124> {totalReservations: 15, successfullyStored: 0, failed: 15}
CentralizedLogger.ts:437 [2025-08-03T18:40:23.823Z] [INFO] ℹ️ 📋 Sample reservation IDs for testing +496ms - <src/platform/storage/DataSeedingService.ts:130> {sampleIds: Array(3)}
CentralizedLogger.ts:430 [2025-08-03T18:40:23.823Z] [WARN] ⚠️ ⚠️ Blob storage not available, returning default stats +496ms - <src/platform/storage/BlobStorageService.ts:214>
_logToConsole @ CentralizedLogger.ts:430
warn @ CentralizedLogger.ts:160
getStorageStats @ BlobStorageService.ts:306
await in getStorageStats
getSeedingStats @ DataSeedingService.ts:211
seedTestData @ DevUtils.ts:26
await in seedTestData
setupDevelopment @ DevUtils.ts:168
await in setupDevelopment
(anonymous) @ App.tsx:35
Promise.then
(anonymous) @ App.tsx:33
BlobStorageService.ts:253


           GET http://127.0.0.1:10000/devstoreaccount1/reservations?comp=list&prefix=reservations%2F&restype=container&_=1754246423824 403 (Server failed to authenticate the request. Make sure the value of the Authorization header is formed correctly including the signature.)
makeRequest @ @azure_storage-blob.js?v=92cb67a1:1253
sendRequest @ @azure_storage-blob.js?v=92cb67a1:1238
sendRequest @ @azure_storage-blob.js?v=92cb67a1:7257
(anonymous) @ @azure_storage-blob.js?v=92cb67a1:823
sendRequest @ @azure_storage-blob.js?v=92cb67a1:1444
(anonymous) @ @azure_storage-blob.js?v=92cb67a1:821
sendRequest @ @azure_storage-blob.js?v=92cb67a1:4176
await in sendRequest
(anonymous) @ @azure_storage-blob.js?v=92cb67a1:821
sendRequest @ @azure_storage-blob.js?v=92cb67a1:7543
(anonymous) @ @azure_storage-blob.js?v=92cb67a1:821
sendRequest @ @azure_storage-blob.js?v=92cb67a1:2026
sendRequest @ @azure_storage-blob.js?v=92cb67a1:4074
(anonymous) @ @azure_storage-blob.js?v=92cb67a1:821
sendRequest @ @azure_storage-blob.js?v=92cb67a1:4787
(anonymous) @ @azure_storage-blob.js?v=92cb67a1:821
sendRequest @ @azure_storage-blob.js?v=92cb67a1:7439
(anonymous) @ @azure_storage-blob.js?v=92cb67a1:821
sendRequest @ @azure_storage-blob.js?v=92cb67a1:7638
(anonymous) @ @azure_storage-blob.js?v=92cb67a1:821
sendRequest @ @azure_storage-blob.js?v=92cb67a1:4118
(anonymous) @ @azure_storage-blob.js?v=92cb67a1:821
sendRequest @ @azure_storage-blob.js?v=92cb67a1:4036
await in sendRequest
(anonymous) @ @azure_storage-blob.js?v=92cb67a1:821
sendRequest @ @azure_storage-blob.js?v=92cb67a1:1828
(anonymous) @ @azure_storage-blob.js?v=92cb67a1:821
sendRequest @ @azure_storage-blob.js?v=92cb67a1:4290
(anonymous) @ @azure_storage-blob.js?v=92cb67a1:821
sendRequest @ @azure_storage-blob.js?v=92cb67a1:5000
(anonymous) @ @azure_storage-blob.js?v=92cb67a1:821
sendRequest @ @azure_storage-blob.js?v=92cb67a1:824
sendRequest @ @azure_storage-blob.js?v=92cb67a1:5361
sendOperationRequest @ @azure_storage-blob.js?v=92cb67a1:5420
sendOperationRequest @ @azure_storage-blob.js?v=92cb67a1:5865
sendOperationRequest @ @azure_storage-blob.js?v=92cb67a1:21210
listBlobFlatSegment @ @azure_storage-blob.js?v=92cb67a1:18511
(anonymous) @ @azure_storage-blob.js?v=92cb67a1:27415
(anonymous) @ @azure_storage-blob.js?v=92cb67a1:2474
withContext @ @azure_storage-blob.js?v=92cb67a1:2438
withContext @ @azure_storage-blob.js?v=92cb67a1:2485
withSpan @ @azure_storage-blob.js?v=92cb67a1:2474
listBlobFlatSegment @ @azure_storage-blob.js?v=92cb67a1:27414
listSegments @ @azure_storage-blob.js?v=92cb67a1:27508
listItems @ @azure_storage-blob.js?v=92cb67a1:27521
next @ @azure_storage-blob.js?v=92cb67a1:27639
listReservations @ BlobStorageService.ts:253
getSeedingStats @ DataSeedingService.ts:212
await in getSeedingStats
seedTestData @ DevUtils.ts:26
await in seedTestData
setupDevelopment @ DevUtils.ts:168
await in setupDevelopment
(anonymous) @ App.tsx:35
Promise.then
(anonymous) @ App.tsx:33
CentralizedLogger.ts:434 [2025-08-03T18:40:23.843Z] [ERROR] ❌ ❌ Failed to list reservations +516ms - <src/platform/storage/BlobStorageService.ts:182> {error: RestError: Server failed to authenticate the request. Make sure the value of the Authorization head…}
_logToConsole @ CentralizedLogger.ts:434
error @ CentralizedLogger.ts:171
listReservations @ BlobStorageService.ts:269
await in listReservations
getSeedingStats @ DataSeedingService.ts:212
await in getSeedingStats
seedTestData @ DevUtils.ts:26
await in seedTestData
setupDevelopment @ DevUtils.ts:168
await in setupDevelopment
(anonymous) @ App.tsx:35
Promise.then
(anonymous) @ App.tsx:33
CentralizedLogger.ts:437 [2025-08-03T18:40:23.844Z] [INFO] ℹ️ ✅ Test data seeded successfully +517ms - <src/utils/DevUtils.ts:13> {storageConnected: true, containerExists: false, reservationCount: 0, sampleReservations: Array(0)}
CentralizedLogger.ts:430 [2025-08-03T18:40:23.844Z] [WARN] ⚠️ ⚠️ Blob storage not available, returning default stats +517ms - <src/platform/storage/BlobStorageService.ts:214>
_logToConsole @ CentralizedLogger.ts:430
warn @ CentralizedLogger.ts:160
getStorageStats @ BlobStorageService.ts:306
await in getStorageStats
getSeedingStats @ DataSeedingService.ts:211
testReservationLoading @ DevUtils.ts:75
setupDevelopment @ DevUtils.ts:171
await in setupDevelopment
(anonymous) @ App.tsx:35
Promise.then
(anonymous) @ App.tsx:33
BlobStorageService.ts:253


           GET http://127.0.0.1:10000/devstoreaccount1/reservations?comp=list&prefix=reservations%2F&restype=container&_=1754246423845 403 (Server failed to authenticate the request. Make sure the value of the Authorization header is formed correctly including the signature.)
makeRequest @ @azure_storage-blob.js?v=92cb67a1:1253
sendRequest @ @azure_storage-blob.js?v=92cb67a1:1238
sendRequest @ @azure_storage-blob.js?v=92cb67a1:7257
(anonymous) @ @azure_storage-blob.js?v=92cb67a1:823
sendRequest @ @azure_storage-blob.js?v=92cb67a1:1444
(anonymous) @ @azure_storage-blob.js?v=92cb67a1:821
sendRequest @ @azure_storage-blob.js?v=92cb67a1:4176
await in sendRequest
(anonymous) @ @azure_storage-blob.js?v=92cb67a1:821
sendRequest @ @azure_storage-blob.js?v=92cb67a1:7543
(anonymous) @ @azure_storage-blob.js?v=92cb67a1:821
sendRequest @ @azure_storage-blob.js?v=92cb67a1:2026
sendRequest @ @azure_storage-blob.js?v=92cb67a1:4074
(anonymous) @ @azure_storage-blob.js?v=92cb67a1:821
sendRequest @ @azure_storage-blob.js?v=92cb67a1:4787
(anonymous) @ @azure_storage-blob.js?v=92cb67a1:821
sendRequest @ @azure_storage-blob.js?v=92cb67a1:7439
(anonymous) @ @azure_storage-blob.js?v=92cb67a1:821
sendRequest @ @azure_storage-blob.js?v=92cb67a1:7638
(anonymous) @ @azure_storage-blob.js?v=92cb67a1:821
sendRequest @ @azure_storage-blob.js?v=92cb67a1:4118
(anonymous) @ @azure_storage-blob.js?v=92cb67a1:821
sendRequest @ @azure_storage-blob.js?v=92cb67a1:4036
await in sendRequest
(anonymous) @ @azure_storage-blob.js?v=92cb67a1:821
sendRequest @ @azure_storage-blob.js?v=92cb67a1:1828
(anonymous) @ @azure_storage-blob.js?v=92cb67a1:821
sendRequest @ @azure_storage-blob.js?v=92cb67a1:4290
(anonymous) @ @azure_storage-blob.js?v=92cb67a1:821
sendRequest @ @azure_storage-blob.js?v=92cb67a1:5000
(anonymous) @ @azure_storage-blob.js?v=92cb67a1:821
sendRequest @ @azure_storage-blob.js?v=92cb67a1:824
sendRequest @ @azure_storage-blob.js?v=92cb67a1:5361
sendOperationRequest @ @azure_storage-blob.js?v=92cb67a1:5420
sendOperationRequest @ @azure_storage-blob.js?v=92cb67a1:5865
sendOperationRequest @ @azure_storage-blob.js?v=92cb67a1:21210
listBlobFlatSegment @ @azure_storage-blob.js?v=92cb67a1:18511
(anonymous) @ @azure_storage-blob.js?v=92cb67a1:27415
(anonymous) @ @azure_storage-blob.js?v=92cb67a1:2474
withContext @ @azure_storage-blob.js?v=92cb67a1:2438
withContext @ @azure_storage-blob.js?v=92cb67a1:2485
withSpan @ @azure_storage-blob.js?v=92cb67a1:2474
listBlobFlatSegment @ @azure_storage-blob.js?v=92cb67a1:27414
listSegments @ @azure_storage-blob.js?v=92cb67a1:27508
listItems @ @azure_storage-blob.js?v=92cb67a1:27521
next @ @azure_storage-blob.js?v=92cb67a1:27639
listReservations @ BlobStorageService.ts:253
getSeedingStats @ DataSeedingService.ts:212
await in getSeedingStats
testReservationLoading @ DevUtils.ts:75
setupDevelopment @ DevUtils.ts:171
await in setupDevelopment
(anonymous) @ App.tsx:35
Promise.then
(anonymous) @ App.tsx:33
CentralizedLogger.ts:434 [2025-08-03T18:40:23.858Z] [ERROR] ❌ ❌ Failed to list reservations +531ms - <src/platform/storage/BlobStorageService.ts:182> {error: RestError: Server failed to authenticate the request. Make sure the value of the Authorization head…}
_logToConsole @ CentralizedLogger.ts:434
error @ CentralizedLogger.ts:171
listReservations @ BlobStorageService.ts:269
await in listReservations
getSeedingStats @ DataSeedingService.ts:212
await in getSeedingStats
testReservationLoading @ DevUtils.ts:75
setupDevelopment @ DevUtils.ts:171
await in setupDevelopment
(anonymous) @ App.tsx:35
Promise.then
(anonymous) @ App.tsx:33
CentralizedLogger.ts:434 [2025-08-03T18:40:23.859Z] [ERROR] ❌ ❌ Reservation loading test failed +532ms - <src/utils/DevUtils.ts:69> {error: Error: No reservations available for testing
    at DevUtils.testReservationLoading (http://localho…}
_logToConsole @ CentralizedLogger.ts:434
error @ CentralizedLogger.ts:171
testReservationLoading @ DevUtils.ts:97
await in testReservationLoading
setupDevelopment @ DevUtils.ts:171
await in setupDevelopment
(anonymous) @ App.tsx:35
Promise.then
(anonymous) @ App.tsx:33
CentralizedLogger.ts:434 [2025-08-03T18:40:23.859Z] [ERROR] ❌ ❌ Development setup failed +532ms - <src/utils/DevUtils.ts:127> {error: Error: No reservations available for testing
    at DevUtils.testReservationLoading (http://localho…}
_logToConsole @ CentralizedLogger.ts:434
error @ CentralizedLogger.ts:171
setupDevelopment @ DevUtils.ts:176
await in setupDevelopment
(anonymous) @ App.tsx:35
Promise.then
(anonymous) @ App.tsx:33
CentralizedLogger.ts:434 [2025-08-03T18:40:23.860Z] [ERROR] ❌ ❌ Failed to setup development environment +533ms - <src/shell/App.tsx:38> {error: Error: No reservations available for testing
    at DevUtils.testReservationLoading (http://localho…}
_logToConsole @ CentralizedLogger.ts:434
error @ CentralizedLogger.ts:171
(anonymous) @ App.tsx:36
Promise.catch
(anonymous) @ App.tsx:35
Promise.then
(anonymous) @ App.tsx:33
 [vite] server connection lost. Polling for restart...
  GET http://localhost:3040/ net::ERR_CONNECTION_REFUSED
ping @ client:736
waitForSuccessfulPing @ client:749
(anonymous) @ client:561
  GET http://localhost:3040/ net::ERR_CONNECTION_REFUSED
ping @ client:736
waitForSuccessfulPing @ client:755
await in waitForSuccessfulPing
(anonymous) @ client:561
