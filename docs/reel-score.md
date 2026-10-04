# The homepage reel's score

`assets/video/phaora-reel-720.mp4` and `-1080.mp4` carry the score inside the file. The page only
mutes and unmutes it, and iPhones ignore a page's volume setting, so the level is set here, in the
mix.

**Level.** −22.1 LUFS integrated. David, 2026-10-04: "too loud, lower it to 50%". The old score
was −16.1 LUFS, so this is 6 dB down, half as loud.

**What you hear.**

| Time | Picture | Sound |
|---|---|---|
| 0–13.5 s | The six jobs | "Dreaming Big", a warm piano track at 136 bpm, from 16.73 s into the track. |
| 12.3–14.9 s | Into the Ö | The track's last bars, lowpassed and echoed, ringing over the handover. |
| 12.9 s–end | The Ö, the wordmark, the end card | The reel's original outro, unchanged, faded in over 0.6 s. |

**Why it hands over cleanly.** David: "make it a sound track that transitions easily to the outro".
The outro sits in B minor (main notes E, D, B, C♯, F♯). "Dreaming Big" is in D major, the relative
key, so every outro note belongs to it. The track starts at 16.73 s so that one of its 8-bar phrases
ends exactly at 13.5 s, on the outro's first hit, and the last chord before it is A major. The first
live take, "Digital Clouds", was in C minor, a semitone off, which is why it clashed.

The original's first 13 seconds were a low drone, 20–600 Hz, which David called "straight out of a
horror movie". The music replaces only that part. "Ending outro stays the same."

Not these: three earlier takes went out the same day and were rejected. The first was birdsong with
a breeze. The second was sound effects with silence between. The third was "Digital Clouds".

**Source.** Mixkit stock music 31, "Dreaming Big", under the Mixkit Stock Music Free License. The
outro is the reel's own audio, taken from the file as it was at commit f625eb3.

**Rebuilding it.** Take the track from 16.73 s and set it to −17 LUFS. Fade it in over 0.5 s and out
over 12.5–13.6 s. Add the tail: the same track from 12.3 to 14.9 s, lowpassed at 1.4 kHz, with
`aecho=0.8:0.7:110|230:0.35|0.22`. Add the original audio from 12.9 s. Then bring the whole mix to −22 LUFS and
replace the audio in both files with `-map 0:v -map 1:a -c:v copy -c:a aac -b:a 128k`. The picture
is not re-encoded.
