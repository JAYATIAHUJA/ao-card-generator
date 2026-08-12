# Smooth 3D book/page opening animation research

## Current implementation

`src/app/page.tsx` uses Motion for React with a `rotateY` page turn, edge-aligned transform origins, `backface-visibility: hidden`, and two nested perspective values (`1200px` and `1600px`). On flip, three tracks overlap:

- the book wrapper grows from `min(78vw, 440px)` to `min(90vw, 640px)`;
- the left leaf grows from width `0` to `50%`, then rotates from `-180deg` to `0deg` after a `0.9s` delay;
- the right cover immediately rotates from `0deg` to `-180deg`.

This creates the right visual ingredients, but changing page width during the turn makes the sheet non-rigid, while separate perspective contexts can make the two halves feel less like one object.

## Findings and recommendations

### 1. Model the spine as a fixed hinge

`transform-origin` is the point around which transforms are applied; its default is the center. A left-to-right leaf should therefore rotate around `left center`, while a leaf attached from the opposite side should use `right center`. Keep the leaf at its final dimensions before rotation so that the hinge remains stationary. A third `transform-origin` value can offset the origin on the z-axis if a cover needs to rotate around a spine with visible thickness. [MDN: `transform-origin`](https://developer.mozilla.org/en-US/docs/Web/CSS/Reference/Properties/transform-origin)

For this implementation, avoid using width growth to reveal the left page. Give both halves stable half-book geometry and reveal them through rotation, clipping outside the 3D scene, or an earlier layout phase that finishes before the page turn.

### 2. Use one scene, one book, then rigid leaves

Recommended hierarchy:

```text
scene: perspective + perspective-origin
└── book: transform-style: preserve-3d
    ├── left leaf: fixed size, right-edge hinge
    │   ├── front face
    │   └── back face
    └── right leaf/cover: fixed size, left-edge hinge
        ├── front face
        └── back face
```

Put `perspective` on the common scene ancestor so both leaves share a camera and vanishing point. The property defines viewer distance; larger values make depth subtler, while smaller values exaggerate it. `perspective-origin` moves the vanishing point and can be kept near the book center/spine for a balanced opening. [MDN: `perspective`](https://developer.mozilla.org/en-US/docs/Web/CSS/Reference/Properties/perspective), [MDN: `perspective-origin`](https://developer.mozilla.org/en-US/docs/Web/CSS/Reference/Properties/perspective-origin)

The current `1200px`–`1600px` range is a reasonable subtle starting range, but use one value for the shared scene and tune it after the geometry is stable.

### 3. Preserve depth through every non-leaf ancestor

`transform-style: preserve-3d` keeps children positioned in 3D instead of flattening them into the parent plane. It is not inherited, so every non-leaf element between the perspective scene and transformed faces must opt in. [MDN: `transform-style`](https://developer.mozilla.org/en-US/docs/Web/CSS/Reference/Properties/transform-style)

Some grouping properties force flattening even when `preserve-3d` is declared, including `opacity < 1`, non-`none` filters, and most non-visible overflow values. Keep fades, blur, masks, and clipping on wrappers outside the preserved 3D subtree, or finish those effects before the turn begins. This matters here because the passport enters via opacity and the page animation may follow soon after. [MDN: grouping properties that flatten 3D descendants](https://developer.mozilla.org/en-US/docs/Web/CSS/Reference/Properties/transform-style#description)

For physical thickness, offset faces slightly with `translateZ` and keep those faces inside a preserved 3D leaf. Even a very small separation can prevent front/back z-fighting; this is an implementation inference from MDN's preserved-3D face examples. [MDN: `transform-style` example](https://developer.mozilla.org/en-US/docs/Web/CSS/Reference/Properties/transform-style#examples)

### 4. Treat front and back as separate faces

`backface-visibility: hidden` makes a face disappear when turned away. For a real two-sided page, place two absolute faces in the same leaf: the front at its normal orientation and the back rotated `180deg` around Y, with backface visibility hidden on both. This prevents mirrored front content from showing through and allows the reverse side to have distinct artwork. [MDN: `backface-visibility`](https://developer.mozilla.org/en-US/docs/Web/CSS/Reference/Properties/backface-visibility)

Apply the property to the actual faces, not only the rotating leaf container. Keep shadows on a separate face or pseudo-element when possible so their visibility can follow the intended side.

### 5. Sequence by visual phases, not coupled state delays

Motion supports per-value transitions, keyframes with segment-specific easing, and `times` for keyframe placement. Its timeline sequences play segments serially by default and support precise overlap via `at`. For a multi-part book opening, a timeline or `useAnimate` sequence is easier to reason about than delays distributed across independent components. [Motion: React transitions](https://motion.dev/docs/react-transitions), [Motion: `animate()` timeline sequences](https://motion.dev/docs/animate#timeline-sequences), [Motion: `useAnimate`](https://motion.dev/docs/react-use-animate)

Suggested visual sequence:

1. Settle the entering book and any width/layout change.
2. Start the cover/page turn around the fixed spine.
3. Slightly overlap the receiving leaf's final settle with the last 20–30% of the turn.
4. Fade or sharpen page content only after its face is mostly toward the viewer.

If the book should open in one continuous gesture, use rotation keyframes such as closed → near edge-on → open, with `times` biased so the edge-on portion passes quickly. Coordinate shadow opacity/position as a separate track instead of relying on one static box shadow.

### 6. Use easing that conveys inertia without visible bounce

Motion accepts named easings, cubic-bezier arrays, JavaScript easing functions, and different easings between keyframe segments. Tween transitions use duration plus easing; springs can instead use damping, stiffness, mass, or duration/bounce. [Motion: transition types and easing](https://motion.dev/docs/react-transitions#transition-settings), [Motion: easing functions](https://motion.dev/docs/easing-functions)

The current `[0.16, 1, 0.3, 1]` is a strong ease-out: responsive at the start and slow at the end. It suits the book's entrance, but using it for the entire page rotation can make the page launch too quickly and spend too long settling. For the turn itself, prefer either:

- a restrained ease-in-out cubic Bézier so the page gathers momentum, passes edge-on briskly, then decelerates; or
- keyframes with a short ease-in before edge-on and ease-out afterward.

Avoid overshooting Y values in the cubic Bézier for a rigid cover unless a deliberate rebound is desired; MDN notes that ordinates outside `0–1` can overshoot the output. If using a Motion spring, keep `bounce` near zero and tune `visualDuration` for coordination with the other tracks. These curve choices are recommendations inferred from the documented easing behavior, not prescribed values. [MDN: `cubic-bezier()`](https://developer.mozilla.org/en-US/docs/Web/CSS/Reference/Values/easing-function/cubic-bezier), [Motion: spring `visualDuration` and `bounce`](https://motion.dev/docs/react-transitions#spring)

## Highest-impact changes to test later

1. Stabilize both page widths before any `rotateY` animation.
2. Replace nested cameras with one shared perspective scene.
3. Add `preserve-3d` through the book/leaf hierarchy and keep flattening effects outside it.
4. Give each rotating leaf separate front/back faces with hidden backfaces.
5. Move the opening choreography into one Motion sequence with an intentional overlap and segmented easing.
