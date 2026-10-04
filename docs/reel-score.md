# The homepage reel's score

`assets/video/phaora-reel-720.mp4` and `-1080.mp4` carry the score inside the file. The page only
mutes and unmutes it, and iPhones ignore a page's volume setting, so the level is set here, in the
mix.

**Level.** −22.1 LUFS integrated. David, 2026-10-04: "too loud, lower it to 50%". The old score
was −16.1 LUFS, so this is 6 dB down, half as loud.

**What you hear.**

| Time | Picture | Sound |
|---|---|---|
| 0–13.6 s | The six jobs | "Digital Clouds", a light electronic track, from its start. It fades out over 12.7–13.6 s. |
| 13.2 s–end | The Ö, the wordmark, the end card | The reel's original outro, unchanged, faded in over 0.2 s so its first hit at 13.5 s lands whole. |

The original's first 13 seconds were a low drone, 20–600 Hz, which David called "straight out of a
horror movie". The music replaces only that part. "Ending outro stays the same."

Not this: two earlier takes went out the same day and were rejected. The first was birdsong with a
breeze. The second was sound effects (fire, stone, machinery) with silence between.

**Source.** Mixkit stock music 175, "Digital Clouds", under the Mixkit Stock Music Free License. The
outro is the reel's own audio, taken from the file as it was at commit f625eb3.

**Rebuilding it.** Take the track from 0 s, set it to −17 LUFS, and fade it in over 0.25 s and out
over 12.7–13.6 s. Add the original audio from 13.2 s. Then bring the whole mix to −22 LUFS and
replace the audio in both files with `-map 0:v -map 1:a -c:v copy -c:a aac -b:a 128k`. The picture
is not re-encoded.
