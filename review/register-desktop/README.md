# The register on a computer (branch claude/register-desktop)

Not live. Nothing deployed.

## What changed
| Step | Phone (480 px and below) | Computer (above 900 px, landscape) |
|---|---|---|
| The doors | unchanged | the night's doors still at its own proportions, the words beside it, snow over the whole screen; the doors open and the camera goes in as on the phone |
| The row | unchanged | full-screen 16:9 cut of the 8K row render (`masters8k/row_full_*_3549x7680.png`, rows 2304 to 4762): the stage edge, the floor words, the row |
| A seat's page | unchanged | a paper panel from the side away from the seat |
| The card | unchanged | the card held up at 1.65x in the middle of the dark |
| Thank you | unchanged | same, set larger |

## Checks
- Phone: 390x844, 360x640, 480x900 and 768x1024 compared with the live page, pixel for pixel, with the doors held closed, opening and in, and every later step: identical.
- Form: posted at 390, 1440 and 1920 with the CRM call mocked: `POST crm.phaora.com/api/public/waitlist`, body `{email, name, list: "chapter-1", website}`, the same as live. Nothing real was sent.

## Missing landscape frames
- **b1, the doors in the snow, wide.** Only 256x144 exists (`story/stills/b1_the-doors-in-the-snow_256x144.png`). The 8K wide master (7680x4320, command in `story/stills/8k/README.md`) was never committed. When it exists, the door-leaf cut lines (x 222/334/446 | 456/566/678, y 666 to 1034 on the tall still) must be re-measured on it.
- No other step needs a picture: the card and the thank-you are paper and type.
