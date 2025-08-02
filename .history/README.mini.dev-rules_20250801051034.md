# Tourist Tax Payment System - Development Rules

## Core Development Principles

**MISSION**: Build a professional-grade tourist tax payment system that rivals mVAT's quality standards. Every component must demonstrate enterprise-level polish, performance, and user experience.

**ARCHITECTURE**: Modular React + TypeScript architecture with professional styling:
- **Apps**: Tourist tax payment application (`src/apps/tourist-tax/`)
- **Platform**: Shared services and utilities (`src/platform/`)
- **Shell**: Application shell, routing, and layout (`src/shell/`)
- **Assets**: Professional styling system (`src/assets/styles/`)

**QUALITY STANDARDS**: Before and after making changes, verify comprehensively each change. Be critical, picky, comprehensive and precise. Avoid antipatterns like god objects or improperly mixing architecture. Keep code DRY, agnostic, and follow Single Responsibility Principle.

**TYPESCRIPT REQUIREMENT**: All files must be TypeScript (.ts/.tsx). No JavaScript files allowed in production code.

**NODE.JS MANAGEMENT**: All npm/node operations MUST use Makefile targets. Never run npm/node commands directly:
```bash
# ✅ CORRECT - Use Makefile
make install    # Install dependencies
make dev        # Start development server
make build      # Build for production
make test       # Run tests

# ❌ FORBIDDEN - Direct npm commands
npm install
npm run dev
npm run build
```

**TARGET PLATFORM**: Desktop-only application optimized for professional business users. Mobile development is explicitly forbidden.

**PRODUCTION READINESS**: Never assume completion before comprehensive user testing and application log analysis.

## Professional UI/UX Standards (mVAT Quality)

**STYLING ARCHITECTURE**: Professional CSS system following mVAT patterns:
- **Variables**: Complete design token system (`src/assets/styles/base/_variables.scss`)
- **Components**: Professional component library (`src/assets/styles/components/`)
- **Layout**: Enterprise-grade layout system (`src/assets/styles/layout/`)
- **Utilities**: Systematic spacing, shadows, typography (`src/assets/styles/utilities/`)

**DESIGN SYSTEM**: All components must follow mVAT's professional standards:
```scss
// ✅ CORRECT - Professional spacing system
.card {
  padding: var(--space-6);
  margin-bottom: var(--space-8);
  box-shadow: var(--shadow-md);
  border-radius: var(--border-radius-lg);
}

// ❌ FORBIDDEN - Magic numbers and inline styles
.card {
  padding: 24px;
  margin-bottom: 32px;
  box-shadow: 0 4px 6px rgba(0,0,0,0.1);
}
```

**COMPONENT QUALITY**: Every component must demonstrate:
- **Professional animations**: Smooth hover effects, micro-interactions
- **Visual hierarchy**: Proper typography, spacing, color usage
- **Accessibility**: ARIA labels, keyboard navigation, screen reader support
- **Responsive design**: Desktop-optimized with proper breakpoints
- **Performance**: Optimized rendering, minimal re-renders

**FLOATING ACTION BUTTON**: Modern UX pattern for primary actions:
- Context-aware menu expansion
- Professional animations with staggered timing
- Mobile-responsive sizing
- Tooltip integration for accessibility

**NAVBAR STANDARDS**: Professional navigation following mVAT patterns:
- Clean white background with subtle shadows
- Gradient logo with proper branding
- Hover effects and active states
- Professional button styling
- Entity switcher for business context

## Development Workflow and Node.js Management

**MAKEFILE-ONLY OPERATIONS**: All npm/node operations MUST use Makefile targets:

```bash
# ✅ DEVELOPMENT WORKFLOW
make setup          # Complete project setup with Node.js version management
make dev            # Start development server (bypasses ESLint temporarily)
make dev-react      # Direct React server (fastest startup)
make dev-strict     # Development with full quality checks (after ESLint fix)

# ✅ BUILD AND DEPLOYMENT
make build          # Production build with optimization
make preview        # Preview production build locally
make serve          # Serve production build

# ✅ QUALITY ASSURANCE
make quality        # Run all quality checks (lint, format, types)
make quality-fix    # Auto-fix quality issues
make test           # Run test suite
make test-watch     # Tests in watch mode

# ✅ MAINTENANCE
make clean          # Clean build artifacts
make clean-all      # Deep clean including node_modules
make audit          # Security audit
make update         # Update dependencies interactively
```

**NODE.JS VERSION MANAGEMENT**: Makefile handles Node.js version automatically:
- Uses NVM to ensure consistent Node.js version (`lts/jod`)
- Automatic version switching for all operations
- No manual node/npm version management required
- Consistent environment across development and CI/CD

**CURRENT TECHNICAL DEBT**:
- ESLint configuration issue with `structuredClone` (Node.js version compatibility)
- Temporary bypass via `make dev` until Node.js update resolves compatibility
- Use `make dev-strict` after Node.js/ESLint configuration is fixed

## Storage and State Management Architecture

**CONSTANTS SYSTEM**: All storage keys and events must reference variables from constants:

```typescript
// ✅ CORRECT - Barrel import from constants
import { STORAGE_KEYS, PAYMENT_EVENTS, CITY_CODES } from '@/constants';

// ❌ FORBIDDEN - Magic strings or direct imports
const key = 'tourist-tax-data'; // Magic string forbidden
import { STORAGE_KEYS } from '@/apps/tourist-tax/constants'; // Direct import forbidden
```

**STORAGE ARCHITECTURE**: City-aware localStorage structure:

```typescript
{
  'global:cities:v1.0.0': [...],              // Available cities list
  'global:currentCity:v1.0.0': cityCode,      // Current selected city
  'global:userPreferences:v1.0.0': {...},     // User preferences
  'city:KRK': {                               // City-specific data
    'tax-config': {...},                      // Tax rates and rules
    'payment-cache': {...},                   // Form data cache
    'gdpr-consents': [...]                    // GDPR consent records
  }
}
```

**LAYERED CONTEXT ARCHITECTURE**:

**Layer 1: Platform Services (Static)**
- Payment services, storage, utilities (`src/platform/`)
- Services: StorageService, ImojePaymentService, TaxCalculationService
- Static foundation layer

**Layer 2: Language Context (Semi-Static)**
- i18next integration with Polish currency/date formatting
- Two-way URL synchronization via use-query-params
- Located: `src/shell/context/LanguageContext.tsx`

**Layer 3: City Context (Dynamic)**
- City state management with automatic tax configuration loading
- Sub-millisecond city switching with smart caching
- Synchronous localStorage access via StorageService
- Located: `src/shell/context/CityContext.tsx`

**PERFORMANCE REQUIREMENTS**:
- Sub-millisecond city switching
- Synchronous localStorage access (no async wrappers)
- Smart caching with TTL for large data
- Single storage system (localStorage + IndexedDB for large data)

## Professional Component Development Standards

**COMPONENT ARCHITECTURE**: Every component must demonstrate enterprise-level quality:

```typescript
// ✅ PROFESSIONAL COMPONENT STRUCTURE
interface ComponentProps {
  // Strict TypeScript interfaces
  data: CityTaxData;
  onAction: (action: PaymentAction) => void;
  className?: string;
}

const ProfessionalComponent: React.FC<ComponentProps> = ({
  data,
  onAction,
  className
}) => {
  // Professional state management
  const { t } = useTranslation(['tourist-tax', 'common']);
  const { currentCity } = useCity();

  // Optimized event handlers
  const handleAction = useCallback((action: PaymentAction) => {
    onAction(action);
  }, [onAction]);

  return (
    <div className={`professional-component ${className || ''}`}>
      {/* Professional JSX with proper accessibility */}
      <Card className="stat-card">
        <Card.Body>
          <div className="stat-icon text-primary">
            <i className="bi bi-graph-up" aria-hidden="true"></i>
          </div>
          <div className="stat-value">{data.amount}</div>
          <div className="stat-title">{t('labels.totalAmount')}</div>
        </Card.Body>
      </Card>
    </div>
  );
};
```

**STYLING REQUIREMENTS**: All components must use professional CSS classes:
- **Card system**: `.card`, `.stat-card`, `.card-payment`, `.card-landlord`
- **Spacing**: `var(--space-1)` through `var(--space-32)` (no magic numbers)
- **Shadows**: `var(--shadow-xs)` through `var(--shadow-2xl)` (8 levels)
- **Animations**: Smooth hover effects, micro-interactions
- **Typography**: Professional font weights and sizes

**ACCESSIBILITY STANDARDS**: Every component must include:
- ARIA labels for screen readers
- Keyboard navigation support
- Focus management
- Color contrast compliance
- Semantic HTML structure

## Performance and Storage Rules

**NO LEGACY FALLBACKS**: Forbidden are any fallbacks to legacy code or data migration during development phase. No absurd timeouts instead of proper fixes. No long timeouts when data is in localStorage/IndexedDB with instant synchronous access.

**STORAGE ACCESS**: localStorage access must use repository pattern via StorageService from `src/platform/storage/` with direct synchronous access. Never wrap localStorage in async services or adapters. Use SINGLE STORAGE + IN-MEMORY CACHING approach for optimal performance.

**CITY SWITCHING**: Must be sub-millisecond with synchronous localStorage access. Avoid async/await in UI event handlers for city switching - use fire-and-forget pattern with error handling.

**LARGE DATA STORAGE**: Large data types (transaction history, receipts, audit logs, payment responses) should be stored in IndexedDB with only metadata in localStorage. Implement smart caching with TTL to eliminate excessive data access patterns.

**SINGLE STORAGE SYSTEM**: NEVER use dual storage systems (localStorage + sessionStorage). Use single localStorage + in-memory caching for optimal performance and data integrity. Use IndexedDB for large data like transaction logs, receipts, payment responses, and API cache.

## Code Quality Rules

**ARCHITECTURE REVIEW**: Before and after making changes, verify comprehensively each change. Be critical, picky, comprehensive and precise. Avoid antipatterns like god objects or improperly mixing architecture. Keep code DRY, agnostic, and follow Single Responsibility Principle.

**LOG ANALYSIS**: Each time logs/code are provided, analyze line by line for warnings, errors, hidden issues, semantic/logic inconsistencies. Be precise, critical, comprehensive, detailed and picky.

**PRODUCTION READINESS**: Never assume completion before seeing comprehensive user-tested application logs.

**LOGGING**: Using `console.log` is forbidden. Use proper logging service.

**CONSTANTS**: All storage keys and events must reference variables from constants, never hardcoded magic strings. Use barrel imports from `src/constants/index.ts`.

**URL SYNCHRONIZATION**: Route, language, and city context must be in two-way sync via use-query-params. City selection and payment step should be URL parameters without conflicting with Bootstrap, React, or Router.

