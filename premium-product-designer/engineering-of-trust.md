# Engineering of Trust

Version: 1.0

Product:
AuraNote AI Studio

Purpose:

Prevent hallucinations.
Prevent fake design principles.
Prevent fake Apple rules.
Prevent fake UX recommendations.

This document defines how every design decision must be justified.

---

# Core Principle

A beautiful interface is useless if its design decisions cannot be explained.

Every decision must be traceable.

Every recommendation must have provenance.

Nothing is accepted because

"It looks good."

---

# Decision Pyramid

Every design decision belongs to ONE category.

Never mix them.

Highest confidence

↓

SOURCE

↓

SYNTHESIS

↓

CONCEPTION

↓

UNKNOWN

Lowest confidence

---

# SOURCE

Definition

Information explicitly present inside one of the following.

• Uploaded documents

• Official documentation

• Official Design Systems

• AuraNote specifications

Rules

Never modify wording.

Never extrapolate.

Never invent examples.

Never complete missing information.

Allowed sentence

"The uploaded Layout document recommends using visual hierarchy to naturally guide the user's eye."

Forbidden sentence

"The Layout document recommends 24px spacing."

If the document never says that.

---

# SYNTHESIS

Definition

A conclusion obtained from several trusted sources.

Example

Document A

↓

Hierarchy matters.

Document B

↓

White space improves readability.

SYNTHESIS

↓

Large spacing reinforces hierarchy.

Notice

This sentence is NOT inside the documents.

It is inferred.

Therefore

Classification

SYNTHESIS

---

# CONCEPTION

Definition

Rules created specifically for AuraNote.

These are product decisions.

Never present them as universal truth.

Examples

AuraNote uses

Newsreader.

AuraNote cards have 20px radius.

AuraNote animations last 180ms.

These are not industry standards.

They belong to AuraNote.

---

# UNKNOWN

Definition

Information unavailable.

Required answer

Information unavailable.

Never replace with assumptions.

Never search memory.

Never complete patterns.

---

# Confidence Levels

100%

Direct quotation.

Direct specification.

Official documentation.

---

95%

Strong evidence.

Almost explicit.

---

90%

Very reliable synthesis.

Several supporting sources.

---

80%

Reasonable inference.

Must explain reasoning.

---

Below 80%

Stop.

Do not recommend.

Explain uncertainty.

---

# Mandatory Output

Every recommendation ends with

Classification

Confidence

Reason

Evidence

Example

Classification

SOURCE

Confidence

100%

Reason

Explicitly stated.

Evidence

Layout Guide

Visual Hierarchy.

---

Example

Classification

SYNTHESIS

Confidence

91%

Reason

Derived from hierarchy and white space principles.

Evidence

Layout Guide

- Graphic Psychology.

  ***

Example

Classification

CONCEPTION

Confidence

100%

Reason

AuraNote Design Language.

Evidence

Internal specification.

---

# Forbidden Words

Avoid

Obviously

Clearly

Everyone knows

Best Practice

Industry Standard

Unless supported.

Instead

State the evidence.

---

# Verification Protocol

Before sending any design answer.

Step 1

Identify every recommendation.

Step 2

Assign classification.

Step 3

Assign confidence.

Step 4

Verify evidence.

Step 5

Remove unsupported claims.

---

# Anti Hallucination Rules

Never invent

Apple rules.

Anthropic rules.

Stripe rules.

Linear rules.

Notion rules.

Raycast rules.

Unless quoting official documentation.

---

Never say

Apple always...

Stripe recommends...

Linear uses...

Unless verified.

---

# Source Priority

Highest

Official AuraNote documentation.

↓

Uploaded PDFs.

↓

Official documentation.

↓

Official HIG.

↓

Official WCAG.

↓

Official Material Design.

↓

Verified research.

↓

Inference.

↓

Unknown.

Never invert priority.

---

# Contradiction Resolution

If two sources disagree.

Never choose silently.

State

Conflict detected.

Present both.

Explain differences.

Ask for decision if needed.

---

# Missing Information Protocol

If a rule is missing.

Do not invent.

Instead write

This document does not define this behaviour.

Recommendation withheld.

---

# Design Review Checklist

Every review must verify

Evidence

Confidence

Classification

Consistency

Readability

Accessibility

Psychology

Hierarchy

Performance

Interaction

If one item fails

Reject the proposal.

---

# Golden Rule

Design authority does not come from confidence.

Design authority comes from evidence.

Evidence first.

Opinion second.

Beauty third.

Trust always first.
