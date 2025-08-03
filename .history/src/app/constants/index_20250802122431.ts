/*

IMPORTANT: `src/constants` should contain only one file `index.ts` that acts as a centralized constants export hub and duplicates validator. Its content should solely consist of barrel exports:

```typescript
// <begin of file>
export * from '@/platform/constants';
export * from '@/shell/constants';
// ... other barrel exports
export * from '@/apps/jpk/constants';
// <end of file>
```
*/