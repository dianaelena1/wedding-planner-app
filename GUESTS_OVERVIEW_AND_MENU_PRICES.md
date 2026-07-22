# Guests overview & menu prices

## New guest experience
- Default view: grouped overview by `groupName`.
- Collapsible category cards with people, confirmations, accommodation and seating summaries.
- Search and filters work in both overview and detailed edit mode.
- Click a guest name to see quick details; switch to detailed mode for editing.

## Menu estimates
- Adult / standard menu: 130 EUR per person.
- Child under 5: free.
- Child 5–8: 13 EUR + VAT.
- Child 8–12: 38 EUR + VAT (25 EUR food + 13 EUR open bar).
- Child 13–17: estimated as a standard menu, 130 EUR.
- Existing children without an age group remain compatible and are temporarily estimated at 38 EUR until the age groups are completed.

## Firestore fields added (optional and backwards compatible)
- `childrenUnder5`
- `children5To8`
- `children8To12`
- `children13To17`

The existing `children` total is preserved and automatically updated when age groups are edited.
