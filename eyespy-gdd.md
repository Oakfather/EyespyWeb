# Hidden Image Reveal Game — Technical Design Document

## Overview

A 2D browser-based game where the player moves a revealing shape (e.g., flashlight cone) via mouse/touch to unmask hidden images beneath an obscuring layer. Finding all hidden images in a scene completes the level. Includes a built-in scene editor with seamless edit/test toggling.

---

## Core Concepts

| Term | Definition |
|---|---|
| **Project** | Top-level container holding a catalogue of images and a collection of scenes |
| **Catalogue** | The project's library of user-uploaded images available for use in scenes |
| **Scene** | A playable level: one background image + a set of hidden image entries |
| **Hidden Image Entry** | A reference to a catalogue image + placement constraints (allowed regions, scale range). Actual position is randomized each play session |
| **Reveal Shape** | The viewport through which the player sees hidden content. Follows cursor/touch. Default: circular spotlight with soft edge falloff |
| **Obscuring Layer** | Full-screen layer that hides the scene. Composed of a **tint color** (default: black) at configurable opacity, plus an optional **foreground image** (e.g., fog texture, vignette). Punctured by the reveal shape |

---

## Golden Flow (UX Walkthrough)

### App Launch → Project

```
1. App opens
2. Check IndexedDB for existing project
   → No project found: create a default empty project, persist it, continue
   → Project found: load it (metadata + catalogue thumbnails only)
3. Show project home screen with list of scenes
   → Scenes exist: show scene cards (thumbnail, name). Tap to open in editor
   → No scenes: show an empty reticle with "+" to create a new scene
```

### Scene Editor Layout

```
┌─────────────────────────────────────────────────────────┐
│  [← Back]              Scene Name               [▶ Play]│
├────────────┬──────────────────────────┬─────────────────┤
│            │                          │ ┌─────────────┐ │
│  CATALOGUE │                          │ │  Background  │ │
│            │                          │ │  (drop slot) │ │
│ ┌────────┐ │                          │ └─────────────┘ │
│ │ + Add  │ │                          │                 │
│ │ Images │ │      SCENE PREVIEW       │ Foreground Tint │
│ └────────┘ │        (canvas)          │ [color picker]  │
│            │                          │ ┌─────────────┐ │
│ 📁 Folder  │                          │ │  Foreground  │ │
│   img1.png │                          │ │  Image (opt) │ │
│   img2.png │                          │ └─────────────┘ │
│ 📁 Folder  │                          │                 │
│   img3.png │                          │ Hidden Images:  │
│            │                          │  [img1] [×]     │
│            │                          │  [img2] [×]     │
│            │                          │  [+ add from    │
│            │                          │   catalogue]    │
├────────────┴──────────────────────────┴─────────────────┤
│  status bar                                             │
└─────────────────────────────────────────────────────────┘
```

**Left panel — Catalogue:**
- Shows all project images as thumbnails, organized in folders
- "+" reticle at top opens file/folder picker
- Selecting files or folders copies them into the project's virtual directory structure in IndexedDB
- Folder hierarchy in the picker is preserved as catalogue folder organization
- Drag images from catalogue → scene preview or → right panel slots

**Right panel — Scene Settings:**
- **Background slot** (top): drop zone for background image. Drag from catalogue, or click to upload directly (adds to catalogue + sets as background)
- **Foreground tint**: color picker for the obscuring layer color (default: black). Opacity slider
- **Foreground image** (optional): overlay image on the obscuring layer (e.g., a vignette texture, fog pattern). Same drop/upload behavior as background
- **Hidden images list**: images that will be randomly placed each play session. Add from catalogue via button or drag-drop. Remove with ×. Each entry expandable for scale range / allowed region constraints

**Top bar:**
- Back arrow → return to project home / scene list
- Scene name (editable inline)
- Play button → switches to play mode with current scene

### Play Mode

```
┌─────────────────────────────────────────────────┐
│                                          [⚙ Menu]│
│                                                  │
│          (obscured scene — revealed by           │
│           moving reveal shape)                   │
│                                                  │
│                    ◯ ← reveal shape              │
│                                                  │
│                                                  │
│  Found: 3/7                                      │
└─────────────────────────────────────────────────┘

Settings menu (⚙):
  - [✏ Edit Mode] → return to editor
  - Reveal shape size slider
  - Sound on/off
  - Restart scene
```

---

## Game Loop

```
1. Load scene → preload all images (loading screen with progress bar) → render background → place hidden images randomly → draw obscuring layer
2. Player moves reveal shape (mouse/touch) → obscuring layer is punctured at shape position
3. When reveal shape overlaps a hidden image sufficiently (≥ configurable % visible):
   a. Image is "found" — visual/audio feedback
   b. Image added to found collection, counter updates
   c. Image remains visible (no longer hidden)
4. All images found → level complete → show summary → next scene or replay
```

---

## Architecture

### Tech Stack

- **Runtime**: Browser (HTML5 Canvas 2D or WebGL via PixiJS/Phaser)
- **State management**: Lightweight store (Zustand, or framework-agnostic signals)
- **Persistence**: IndexedDB for local projects (images stored as blobs), optional cloud sync later
- **Build**: Vite + TypeScript

### Module Breakdown

```
src/
├── core/
│   ├── Game.ts              # Main game loop, update/render cycle
│   ├── Scene.ts             # Scene data model and loader
│   ├── RevealRenderer.ts    # Composites obscuring layer + reveal shape mask
│   ├── HiddenImage.ts       # Hidden image entity: hit detection, found state
│   └── InputHandler.ts      # Unified mouse/touch input → reveal shape position
├── editor/
│   ├── EditorController.ts  # Editor state, tool selection, scene manipulation
│   ├── SceneEditor.ts       # Place/move/resize/delete hidden image entries
│   ├── CataloguePanel.ts    # Upload, browse, delete images in project catalogue
│   ├── PropertyPanel.ts     # Edit properties of selected image entry (scale range, region)
│   └── TestToggle.ts        # Instant switch between edit ↔ test mode
├── storage/
│   ├── ProjectStore.ts      # CRUD for projects, scenes, catalogue (IndexedDB)
│   ├── ImageStore.ts        # Blob storage and thumbnail generation
│   ├── ImageCache.ts        # LRU cache for full-res decoded images, lazy load from IndexedDB
│   └── PackageManager.ts    # Export/import scenes as .eyespy.zip packages
├── ui/
│   ├── HUD.ts               # In-game: found counter, timer, hint button
│   ├── MenuScreen.ts        # Project/scene selection
│   └── LevelComplete.ts     # Win screen, stats, next/replay
└── main.ts                  # Entry point, mode router (menu / editor / play)
```

---

## Rendering Pipeline (Play Mode)

```
Layer stack (bottom to top):
1. Background image (scene.backgroundImage)
2. Hidden images (rendered at randomized positions, normal blend)
3. Obscuring layer:
   a. Tint fill (scene.foregroundTint color + opacity)
   b. Foreground image if set (scene.foregroundImageId) — composited on top of tint
4. Reveal mask (subtract/destination-out composite on entire obscuring layer)
5. HUD overlay (found count, UI elements — not masked)
```

**Implementation approach — Canvas 2D compositing:**
- Render layers 1–2 to an offscreen canvas (the "scene canvas")
- Render the obscuring layer to a second offscreen canvas:
  - Fill with `foregroundTint` color at `foregroundTintOpacity`
  - If `foregroundImageId` is set, draw it on top (stretched to scene bounds, normal blend)
- Punch the reveal shape out of the obscuring canvas using `globalCompositeOperation: 'destination-out'`
- Draw scene canvas, then obscuring canvas on top, then HUD to the display canvas

**Reveal shape** is drawn as a radial gradient (opaque center → transparent edge) for soft falloff. Shape type is pluggable (circle, cone, rectangle, custom SVG path).

---

## Hidden Image Placement & Detection

### Randomized Placement (per play session)

```
For each hidden image entry in scene:
  1. Read constraints: { allowedRegion: Rect | null, scaleRange: [min, max] }
  2. Pick random scale within scaleRange
  3. Pick random position within allowedRegion (default: full scene bounds)
  4. Check no overlap with already-placed images (with padding)
  5. Retry up to N times; warn in editor if placement is over-constrained
```

### Found Detection

```
Each frame while reveal shape is active:
  For each unfound hidden image:
    - Compute intersection area between reveal shape bounds and image bounds
    - If intersection / imageArea ≥ REVEAL_THRESHOLD (default 0.5):
        → Mark as found (with brief delay to prevent instant-sweep finding)
```

Optional: pixel-level detection for non-rectangular images using alpha channel sampling.

---

## Scene Editor

### Editor Features

| Feature | Description |
|---|---|
| **Catalogue panel (left)** | Thumbnail grid organized in folders mirroring upload structure. "+" reticle to add images or folders (copies into project, preserves folder hierarchy). Thumbnails only — no full-res loading while browsing |
| **Background slot (right)** | Drop zone for background image. Drag from catalogue or click to upload new (adds to catalogue automatically). Stretched/fit/tile options |
| **Foreground tint (right)** | Color picker + opacity slider for the obscuring layer fill color. Default: black, 100% |
| **Foreground image (right)** | Optional texture for the obscuring layer (fog, vignette, etc). Same drag/upload behavior as background slot |
| **Hidden images list (right)** | List of images to randomly place each play. Add from catalogue via drag or "+". Remove with ×. Each entry expandable for scale range / allowed region constraints |
| **Scene preview (center)** | Canvas showing background + hidden images at their constraint regions. Placeholder silhouettes while images load |
| **Play button (top bar)** | Switches to play mode with current scene. Play mode settings menu allows return to editor |

### Edit ↔ Test Mode Switching

```
EditorState {
  scene: Scene              // live-edited scene data
  selectedEntry: string?    // currently selected hidden image entry ID
  tool: 'select' | 'move' | 'region' | 'delete'
  isDirty: boolean
}

On toggle to Test:
  1. Snapshot current EditorState
  2. Initialize Game with scene (randomizes placements)
  3. Render play mode in same canvas

On toggle to Edit:
  1. Destroy play session
  2. Restore EditorState snapshot
  3. Render editor mode in same canvas
```

---

## Data Models

```typescript
interface Project {
  id: string
  name: string
  catalogue: CatalogueFolder        // root folder containing all images
  scenes: Scene[]
}

interface CatalogueFolder {
  id: string
  name: string                       // folder name (root name = project name)
  children: (CatalogueFolder | CatalogueImage)[]
}

interface CatalogueImage {
  id: string
  name: string
  blobKey: string           // IndexedDB blob reference
  folderPath: string        // virtual path, e.g. "animals/cats" — mirrors upload folder structure
  width: number
  height: number
  thumbnailDataUrl: string
}

interface Scene {
  id: string
  name: string
  backgroundImageId: string | null
  foregroundTint: string             // CSS color, default "#000000"
  foregroundTintOpacity: number      // 0-1, default 1.0
  foregroundImageId: string | null   // optional catalogue image for obscuring layer texture
  hiddenEntries: HiddenImageEntry[]
  revealShape: RevealShapeConfig
  revealThreshold: number   // 0-1, default 0.5
}

interface HiddenImageEntry {
  id: string
  catalogueImageId: string
  scaleRange: [number, number]  // e.g., [0.8, 1.2]
  allowedRegion: Rect | null    // null = anywhere in scene
  rotation: number              // degrees, for editor preview only — also randomizable
}

interface RevealShapeConfig {
  type: 'circle' | 'cone' | 'rect' | 'custom'
  size: number                  // radius or equivalent
  falloff: number               // soft edge amount 0-1
  customPath?: string           // SVG path data if type='custom'
}

interface Rect {
  x: number; y: number; width: number; height: number
}
```

---

## Input Handling

```
InputHandler:
  - Listens: mousemove, touchmove, mousedown, touchstart
  - Normalizes to: { x, y, isActive }
  - In play mode: updates reveal shape position
  - In editor mode: routes to editor tool (select, drag, region draw)
  - Touch: single touch = reveal/interact, pinch = zoom (editor only)
```

---

## Image Loading Strategy

All full-resolution images are lazy-loaded on demand. Only lightweight metadata and thumbnails are held in memory by default.

### Two-Tier Storage

| Tier | What's stored | Where | Loaded when |
|---|---|---|---|
| **Metadata + thumbnail** | `CatalogueImage` object with `thumbnailDataUrl` (small base64 string, ~2–5 KB) | In-memory with project | Always — on project open |
| **Full-resolution blob** | Original uploaded image as `Blob` | IndexedDB (keyed by `blobKey`) | On demand — when image is needed for rendering |

### ImageCache (LRU)

`ImageCache` manages decoded full-res images in memory with an LRU eviction policy.

```typescript
class ImageCache {
  private cache: Map<string, HTMLImageElement>  // blobKey → decoded image
  private maxEntries: number                    // default: 50 images
  private maxBytes: number                      // default: 100 MB estimated

  async get(blobKey: string): Promise<HTMLImageElement>
  // Cache hit → return immediately
  // Cache miss → read blob from IndexedDB → createImageBitmap or
  //   URL.createObjectURL → decode → insert into cache → evict LRU if over limit

  preload(blobKeys: string[]): Promise<void>
  // Batch load, used on scene open and test-mode toggle

  evict(blobKey: string): void
  release(): void                               // flush entire cache (scene/project switch)
}
```

### Loading Behavior by Context

**Catalogue panel (editor)**
- Shows `thumbnailDataUrl` only — never loads full-res for browsing
- Full-res loaded only when user drags an image onto the scene canvas

**Scene editor canvas**
- On scene open: `preload()` the background image + all hidden entry images referenced by the scene
- Images load asynchronously; render placeholder silhouettes until decoded
- When user adds a new hidden entry from catalogue: single `get()` call triggers lazy load

**Play mode**
- On scene load (before gameplay starts): `preload()` all scene images behind a loading screen
- Gameplay cannot begin until all images are decoded — avoids pop-in during play
- Loading progress bar driven by preload promise count

**Scene/project switch**
- `release()` flushes the cache entirely
- Thumbnails remain in memory (they're part of the project metadata, negligible size)

### Memory Estimation

To enforce `maxBytes`, estimate per-image memory as `width × height × 4` bytes (RGBA). This is tracked on insert and decremented on evict. The 100 MB default allows roughly:
- 25 images at 1024×1024, or
- 6 images at 2048×2048, or
- ~100 images at 512×512

The limit is configurable and can be tuned down for mobile via `navigator.deviceMemory` when available.

---

## Scene Packaging & Sharing

### Package Format (`.eyespy.zip`)

A scene package is a self-contained zip file that bundles everything needed to play a scene. No external dependencies — any recipient can import and play it immediately.

```
my-scene.eyespy.zip
├── manifest.json            # Package metadata + scene definition
└── images/
    ├── bg_dark-room.png     # Background image
    ├── hidden_key.png       # Hidden image files
    ├── hidden_flashlight.png
    └── ...
```

### manifest.json Structure

```typescript
interface PackageManifest {
  formatVersion: 1
  exportedAt: string                 // ISO 8601 timestamp
  generator: string                  // "eyespy-editor/0.1.0"
  scene: {
    name: string
    revealShape: RevealShapeConfig
    revealThreshold: number
    backgroundImage: string          // relative path: "images/bg_dark-room.png"
    hiddenEntries: PackagedHiddenEntry[]
  }
}

interface PackagedHiddenEntry {
  id: string
  imageFile: string                  // relative path: "images/hidden_key.png"
  scaleRange: [number, number]
  allowedRegion: Rect | null
  rotation: number
}
```

Key differences from the in-editor `Scene` model: catalogue image IDs are replaced with direct file paths into the zip. This makes the package portable — no catalogue lookup needed on import.

### Export Flow

```
1. User clicks "Export Scene" in editor
2. Collect the scene definition
3. Resolve all referenced catalogueImageIds → read blobs from IndexedDB
4. Deduplicate images (same catalogue image used in multiple entries → one file)
5. Build manifest.json with relative image paths
6. Create zip archive in memory (using JSZip or fflate)
7. Trigger browser download: "{scene-name}.eyespy.zip"
```

### Import Flow

```
1. User selects "Import Scene" → file picker filtered to .eyespy.zip
2. Read and parse zip in memory
3. Validate manifest.json against expected schema + formatVersion
4. For each image file in zip:
   a. Check if an identical image exists in current project catalogue (hash comparison)
   b. If not, add to catalogue as new entry (store blob in IndexedDB)
5. Create new Scene in current project, mapping image paths → catalogue IDs
6. Open imported scene in editor
```

### Size & Validation Guardrails

- Max package size: 50 MB (enforced on both export and import)
- Max single image: 10 MB
- Accepted image types in zip: PNG, JPG, WebP (validated by magic bytes, not extension)
- manifest.json schema validation on import — reject with clear error on version mismatch or missing fields
- Image dimensions capped at 4096×4096 to prevent memory issues on mobile

---

## Key Implementation Notes

- **Canvas size**: Fit to viewport, maintain aspect ratio of background image. Hidden image coordinates are stored as ratios (0–1) relative to scene dimensions for resolution independence.
- **Performance**: Only re-render reveal region delta each frame (dirty-rect optimization). Hidden image hit tests use AABB first, then optional pixel check. Full-res images are lazy-loaded via `ImageCache` with LRU eviction — see Image Loading Strategy section.
- **Image uploads**: Validate type (PNG/JPG/WebP/SVG) and size limits. Generate thumbnail on upload (stored as small base64 `thumbnailDataUrl`). Store full-res blob in IndexedDB — never held in memory unless actively used in a scene.
- **Save**: Auto-save editor changes to IndexedDB on debounced interval. Scene sharing via `.eyespy.zip` packages (see Scene Packaging & Sharing section).
- **Zip library**: Use [fflate](https://github.com/101arrowz/fflate) (3 KB gzipped, no dependencies, streaming support) for in-browser zip creation and extraction. Avoid JSZip — larger bundle and slower.
- **Accessibility**: Reveal shape size adjustable. Optional audio cues when near hidden images (hot/cold). High-contrast mode for obscuring layer.
