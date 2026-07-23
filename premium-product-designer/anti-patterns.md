# anti-patterns.md

Version: 1.0

Classification:
CONCEPTION

Confidence:
100%

Purpose

Define every forbidden design decision.

This document has higher priority than component rules.

If a component follows its specification
but violates an anti-pattern,

the component must be redesigned.

---

# Philosophy

Good design is not only knowing what to build.

It is knowing what must never exist.

Every anti-pattern increases

friction

confusion

cognitive load

maintenance cost

or mistrust.

---

# ABSOLUTE RULE

When a conflict exists

between

adding

or

removing

Always prefer removing.

---

# VISUAL NOISE

Forbidden

Unnecessary gradients

Decorative icons

Random illustrations

Background patterns

Animated backgrounds

Glassmorphism without purpose

Multiple shadows

Multiple border styles

Decorative textures

Reason

They increase attention cost.

---

# COLOR ABUSE

Forbidden

Rainbow dashboards

More than one accent color

Random badge colors

Different success greens

Different danger reds

Gradient buttons

Colored cards without meaning

Reason

Color loses semantic meaning.

---

# TYPOGRAPHY ABUSE

Forbidden

More than two font families

More than three body sizes

Random capitalization

Centered long paragraphs

Bold paragraphs

Tiny body text

Decorative typography

Reason

Reading becomes work.

---

# SPACING ABUSE

Forbidden

Random spacing

Padding inside padding

Nested cards

Crowded layouts

Unequal gutters

Tiny margins

Reason

Relationships become ambiguous.

---

# BUTTON ABUSE

Forbidden

Multiple Primary buttons

Five button variants

Buttons that look like links

Links that look like buttons

Tiny buttons

Huge CTA collections

Reason

Decision paralysis.

---

# ICON ABUSE

Forbidden

Icons without meaning

Mixed icon styles

Emoji as interface

Outlined and filled icons together

Random icon sizes

Decorative icons

Reason

Recognition decreases.

---

# MOTION ABUSE

Forbidden

Bounce

Elastic

Long animations

Rotations

Animated gradients

Background movement

Floating particles

Continuous animation

Parallax

Reason

Motion becomes distraction.

---

# DASHBOARD ABUSE

Forbidden

Twenty charts

Dozens of KPIs

Unexplained numbers

Decorative statistics

Colorful widgets

Everything above the fold

Reason

Users cannot prioritize.

---

# FORM ABUSE

Forbidden

Placeholder-only labels

Required fields without indication

Multiple columns on mobile

Ten fields before value

Unexpected validation

Reason

Users abandon forms.

---

# MODAL ABUSE

Forbidden

Modal inside modal

Marketing popups

Newsletter popup

Cookie popup over onboarding

Forced rating dialogs

Reason

Interruptions destroy flow.

---

# NAVIGATION ABUSE

Forbidden

Changing navigation order

Hidden primary actions

Nested menus

Hamburger menu on desktop without reason

Navigation that changes every page

Reason

Users lose orientation.

---

# AI ABUSE

Forbidden

AI everywhere

Forced AI

Automatic rewriting

Auto-generated text replacing user work

AI interrupting writing

Reason

Users lose control.

AI should assist.

Never dominate.

---

# EMPTY STATE ABUSE

Forbidden

"No data."

"No results."

"Error."

Without explanation.

Every empty state must teach.

---

# ERROR MESSAGE ABUSE

Forbidden

Unknown Error

Unexpected Error

Something went wrong

Error Code 501

Without explanation.

Every error must help recovery.

---

# SETTINGS ABUSE

Forbidden

Technical language

Developer terminology

Random grouping

Infinite scroll settings

No search

Reason

Configuration becomes exploration.

---

# LOADING ABUSE

Forbidden

Infinite spinner

No feedback

Jumping layout

Content disappearing

Blocking everything

Reason

Users lose confidence.

---

# MOBILE ABUSE

Forbidden

Tiny touch targets

Horizontal scrolling

Desktop layout scaled down

Hover-only interactions

Hidden navigation

Reason

Interaction becomes difficult.

---

# ACCESSIBILITY ABUSE

Forbidden

Color-only communication

Low contrast

Keyboard traps

Invisible focus

Tiny text

Reason

Exclusion.

---

# PERFORMANCE ABUSE

Forbidden

Heavy animations

Large images

Nested effects

Expensive shadows

Large component trees

Reason

Visual quality never justifies slowness.

---

# DESIGN DEBT

Treat as bugs

Duplicate components

Duplicate colors

Duplicate spacing

Duplicate typography

Duplicate motion

Duplicate shadows

Duplicate borders

Never ignore inconsistency.

---

# REVIEW QUESTIONS

Ask

Can something disappear?

Can two components become one?

Can one color disappear?

Can one animation disappear?

Can one click disappear?

Can one word disappear?

If YES

Remove it.

---

# GOLDEN RULE

Every unnecessary element

steals attention

from something important.

The highest quality interface

is the one

that has the fewest unnecessary decisions.
