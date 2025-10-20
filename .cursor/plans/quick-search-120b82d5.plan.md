<!-- 120b82d5-6a1a-4973-9bb8-e2957074f6a7 ce1e342c-ce8f-484a-bf9f-48a2cf94598d -->
# Asset Caching System Implementation

## Overview

Implement a robust caching system for default background image and Hugging Face AI model. Download and cache assets in IndexedDB on first visit, track download status in localStorage to prevent re-downloads, and automatically set default background image.

## Implementation Steps

### 1. Create Asset Cache Manager

- **File**: `src/lib/assetCache.ts`
- Separate caching system from existing mediaStorage
- Methods for:
  - Fetching and caching image files
  - Tracking download status in localStorage
  - Checking if asset is already cached
  - Getting cached asset from IndexedDB
- Uses its own IndexedDB database: `mclx-asset-cache`

### 2. Extend Asset Cache for AI Model

- **File**: `src/lib/assetCache.ts`
- Add methods for caching Hugging Face model files
- Track model download status in localStorage
- Check before downloading model in useAIAutocomplete
- Store model cache metadata

### 3. Default Image Auto-Loading

- **File**: `src/app/PageClient.tsx` or new `src/hooks/useDefaultAssets.ts`
- On app initialization, check localStorage for `defaultImageCached`
- If not cached:
  - Fetch `/assets/image1.png`
  - Store in IndexedDB via assetCache
  - Set as default background in settings
  - Mark as cached in localStorage
- If cached: Load from IndexedDB

### 4. Update Settings Store

- **File**: `src/store/settingsStore.ts`
- Integrate default image loading on first visit
- Set `backgroundImage` to cached default image reference
- No user action required

### 5. Update AI Hook for Model Caching

- **File**: `src/hooks/useAIAutocomplete.ts`
- Before downloading model, check if cached in IndexedDB
- If cached: Load from IndexedDB
- If not: Download, cache, mark in localStorage
- Significantly faster subsequent loads

## Technical Details

**Asset Cache Structure**:

```typescript
{
  id: string;           // e.g., "default-bg-image", "hf-model-distilgpt2"
  data: Blob | string;  // Actual file data
  type: string;         // MIME type
  timestamp: number;    // Cache time
}
```

**LocalStorage Keys**:

- `asset-cache-default-image`: "true" when cached
- `asset-cache-hf-model`: "true" when model cached

**Benefits**:

- Permanent cache (no expiration)
- Faster app load on subsequent visits
- No re-downloading of large assets
- Seamless user experience

### To-dos

- [ ] Create assetCache.ts with IndexedDB and localStorage integration
- [ ] Extend asset cache to support Hugging Face model caching
- [ ] Add automatic default image download and caching on first visit
- [ ] Integrate default image caching with settings store
- [ ] Add model caching check in useAIAutocomplete hook