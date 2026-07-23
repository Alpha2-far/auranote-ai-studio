# components.md

Version: 1.0

Classification:
CONCEPTION

Confidence:
100%

Reason:
AuraNote Design Language.

Purpose

Define every reusable component.

Components are contracts.

Never redesign a component locally.

Improve the system.

Then propagate.

---

# Component Philosophy

Components are not UI elements.

Components are promises.

Every Button

must always behave

the same.

Every Input

must always behave

the same.

Consistency creates trust.

---

# Universal Rules

Every component must satisfy

Purpose

↓

Accessibility

↓

Clarity

↓

Consistency

↓

Performance

↓

Beauty

Beauty is always last.

---

# Component Anatomy

Every component defines

Purpose

States

Variants

Spacing

Sizing

Accessibility

Motion

Interaction

Keyboard behavior

Error behavior

Loading behavior

Disabled behavior

Review checklist

No exceptions.

---

# BUTTON

Purpose

Trigger a primary action.

Never decoration.

---

Variants

Primary

Secondary

Ghost

Danger

Link

Never invent additional variants.

---

States

Default

Hover

Pressed

Focused

Disabled

Loading

Success (optional)

Error (optional)

---

Rules

Only one Primary Button
per viewport.

Secondary actions

must never visually compete.

Danger Buttons

must always appear destructive.

---

Minimum Size

Height

44px

Minimum touch target

44×44

Accessibility first.

---

Padding

Horizontal

16

Vertical

10

---

Loading

Keep width fixed.

Replace label with spinner.

Never resize.

---

Disabled

Reduced emphasis.

Never invisible.

---

BUTTON REVIEW

Can users identify the primary action instantly?

Does the button communicate importance?

Can keyboard users activate it?

Can touch users hit it easily?

---

# INPUT

Purpose

Collect information.

Never confuse.

---

States

Default

Hover

Focus

Typing

Filled

Error

Success

Disabled

Readonly

Loading

---

Rules

Every Input

requires

Label

Placeholder (optional)

Help text (optional)

Error text (when necessary)

---

Labels

Always visible.

Never placeholder-only forms.

---

Errors

Specific.

Helpful.

Actionable.

Never blame users.

---

Focus

Always visible.

Never remove focus ring.

---

INPUT REVIEW

Can users recover from mistakes?

Is required information obvious?

Can forms be completed using keyboard only?

---

# CARD

Purpose

Group related information.

Cards are containers.

Not decoration.

---

Padding

24

---

Maximum nesting

One level.

Cards inside cards

are discouraged.

---

Card Review

Does the card group a single concept?

Can the border be removed?

Can the card become whitespace instead?

---

# MODAL

Purpose

Interrupt only when necessary.

---

Allowed

Critical confirmation.

Complex workflows.

Focused editing.

---

Forbidden

Marketing.

Tips.

News.

Feature announcements.

---

Rules

One modal only.

Never modal over modal.

Escape closes.

Focus trapped.

---

# SIDEBAR

Purpose

Persistent navigation.

Never temporary content.

---

Rules

Stable.

Predictable.

Never reorganize automatically.

---

# DROPDOWN

Purpose

Select.

Never navigate.

If navigation is needed

use a menu.

---

# TOAST

Purpose

Temporary feedback.

---

Duration

4 seconds

Maximum.

Never require reading paragraphs.

---

Allowed

Success.

Saved.

Copied.

Completed.

---

Forbidden

Critical errors.

Legal notices.

Long instructions.

---

# DIALOG

Purpose

Ask for confirmation.

Not information.

---

Good

Delete project?

Bad

Welcome!

---

# SEARCH

Purpose

Reduce navigation effort.

---

Rules

Search should tolerate mistakes.

Support partial matches.

Support keyboard.

---

# COMMAND PALETTE

Purpose

Power users.

Everything executable

should eventually become searchable.

---

Shortcut

⌘K

or

Ctrl+K

---

# EMPTY STATE

Must answer

What happened?

Why?

What now?

Never

"No data."

---

# TABLE

Purpose

Comparison.

Never decoration.

---

Rules

Sortable.

Readable.

Keyboard accessible.

---

# TABS

Maximum

7

If more

use navigation.

---

# ACCORDION

Hide

secondary information.

Never primary workflows.

---

# BADGE

Purpose

Status.

Never decoration.

---

# TOOLTIP

Explain.

Never surprise.

---

# PROGRESS

Always communicate

Current state.

Remaining effort.

Never fake progress.

---

# AI MESSAGE

Purpose

Explain AI reasoning.

Never overwhelm.

Use progressive disclosure.

---

# REVIEW QUESTIONS

Can this component
replace another one?

Does this duplicate
an existing component?

Does it solve
exactly one problem?

Is it predictable?

Can beginners understand it?

Can experts use it quickly?

Would removing decoration
improve it?

---

# COMPONENT LIFECYCLE

Every component must include

Purpose

↓

Design

↓

Accessibility

↓

Implementation

↓

Testing

↓

Documentation

↓

Versioning

↓

Deprecation

No component is complete
without documentation.

---

# FINAL PRINCIPLE

Components are not pixels.

Components are product behavior.

Users trust products

because components

never surprise them.
