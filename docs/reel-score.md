# The homepage reel's score

`assets/video/phaora-reel-720.mp4` and `-1080.mp4` carry the score inside the file. The page only
mutes and unmutes it, and iPhones ignore a page's volume setting, so the level is set here, in the
mix.

**Level.** −22.1 LUFS integrated, true peak −1.9 dBFS. David, 2026-10-04: "too loud, lower it to 50%".
The old score was −16.1 LUFS, so this is 6 dB down, half as loud.

**What you hear.** David asked for "something more logical" than the old drone, which was a low bed from
20 to 600 Hz for the whole 24 seconds. The new score is the places in the shots:

| Time | Picture | Sound |
|---|---|---|
| 0.4–23.9 s | Throughout | Morning birdsong, low cut at 300 Hz |
| 0.3–13.5 s | The six jobs | A light breeze through trees, low cut at 220 Hz so it never rumbles |
| 0.7 s | The first scan | A soft swoosh |
| 3.45–5.6 s | Outdoor fireplace | Fire crackle |
| 5.45–7.6 s | Patio and fire pit | Fire crackle, a second take |
| 7.8 s | Granite cobble | A chisel on stone |
| 9.45–11.5 s | The substrate (excavator, trench) | Machinery on site |
| 13.4 s | The Ö | A synthesised chime, E5 with bell partials, about 5 s ring |
| 22.5–23.9 s | End card | Fade out |

**Sources.** Mixkit sound effects, free for commercial use with no credit required: 2472 Morning
birds, 2427 Breeze through the trees, 2632 Whoosh wind sweep, 1330 Campfire crackles, 1329 Campfire
burning crackles, 3195 Writing on a stone, 800 Construction place and bulldozer ambiance. The chime
is generated (ffmpeg `aevalsrc`), not sampled.

**Rebuilding it.** Mix the sources with the times above, set the level to −22 LUFS, then replace the
audio in both files with `-map 0:v -map 1:a -c:v copy -c:a aac -b:a 128k`. The picture is not
re-encoded.
