# Manual Comp Allocations

## Overview
This page provides a responsive UI for manually allocating comps (EasyDine, Club Dollars, eComps, etc.) against a check subtotal.

All interactions are **client-side only** and use **static/mock values** during development.

The user can:
- Enter amounts using a numeric pad dialog
- Tap eComp cards to apply/remove comps
- Auto-allocate using **Smart Allocate**
- Reset all selections with **Reset**

The UI automatically:
- Calculates totals
- Validates inputs
- Displays helpful error/validation messages

---

## Features

### 1. Responsive POS-Style UI
- Layout matches the provided mock/design.
- Screen is responsive across typical POS resolutions.
- eComps list is **horizontally scrollable**.

### 2. Numeric Pad Dialog
- Every amount field opens a **numeric pad** modal.
- Supports:
  - Digits (0–9)
  - Decimal values up to **two decimal places**
- Returns the entered value to the corresponding field.
- Prevents invalid numeric format.

### 3. Comp Cards (EasyDine, Club Dollars, eComps)
Each comp item shows:
- Label / Name
- Balance / Amount
- Expiration (if any)
- Bottom label:
  - Default: **"Tap to apply"**
  - After applying: **"Applied"**

When a comp is applied:
- The card shows a **Selected / Applied** flag at the top.
- The bottom label changes to **Applied**.
- Applied amount becomes editable via numeric pad.

### 4. Smart Allocate
- Button: **Smart Allocate**
- Behavior:
  - Automatically selects comp items.
  - Assigns amounts such that:
    - **Total applied comps ≤ comp-eligible total**
    - **Each applied amount ≤ item balance**
  - Selection logic can be simple or randomized (for development), as long as it respects the comp-eligible total.

### 5. Reset
- Button: **Reset**
- Clears:
  - All applied amounts
  - All selections
  - All flags/labels
- Resets totals to initial state.

### 6. Live Calculations
- **Charged to Comps**  
  `= sum of all applied comp amounts`

- **Remaining After Comps**  
  `= Check Subtotal − Charged to Comps`


