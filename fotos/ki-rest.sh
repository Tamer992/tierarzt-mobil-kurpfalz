#!/bin/bash
G=/home/tamer/work/Tierarzt-Mobil-Entwurf/scripts/ki-bild.sh
STIL="professional editorial photograph, shot on medium format camera, natural color, soft single warm light source, deep soft shadows, dark background, calm premium mood, high detail, no text, no people faces"
cd /home/tamer/work/Tierarzt-Mobil-Entwurf/fotos/ki-test
run(){ $G "$@" || { sleep 20; $G "$@"; }; }
run hausbesuch-a.webp 1440 816 51 "a dark compact car without logos parked in the driveway of a modern German house at night, headlights on, warm light glowing from the front door and windows, light rain on the ground, $STIL" &
run hausbesuch-b.webp 1440 816 53 "view from inside a dark hallway towards an open front door at night, warm light spilling onto the doorstep, a black leather doctor bag standing just inside, $STIL" & wait
run durchfall-a.webp 1200 1200 61 "a small cat lying curled up and tired on a soft blanket next to a ceramic water bowl, evening lamp light, gentle and quiet, $STIL" &
run schmerz-a.webp 1200 1200 63 "close-up of a gentle human hand resting on the fur of a lying dog, only hand and fur visible, warm lamp light, tender, $STIL" & wait
run biss-a.webp 1200 1200 71 "close-up of a dog paw with a fresh clean white bandage resting on a wooden floor, warm evening lamp light, $STIL" &
run ohren-a.webp 1200 1200 73 "close-up of a soft floppy dog ear and a veterinary otoscope lying next to it on a blanket, warm lamp light, $STIL" & wait
run augen-a.webp 1200 1200 81 "extreme close-up of a calm cat eye with amber iris, reflection of a warm lamp in the eye, dark background, macro photograph, $STIL" &
run blase-a.webp 1200 1200 83 "a cat sitting on a windowsill at blue hour next to a glass of water, warm lamp light from inside the room, $STIL" & wait
run infusion-a.webp 1200 1200 91 "a clear veterinary infusion bag hanging from a coat hook in a cozy living room, thin tube leading down, a cat resting on a blanket below, warm lamp light, $STIL" &
run lahm-a.webp 1200 1200 93 "low angle close-up of a dog's front paws standing on a wooden parquet floor, warm backlight from a lamp, $STIL" & wait
run ratgeber-warn-a.webp 1440 816 101 "a telephone lying on a dark wooden table next to a dog leash, warm lamp light, night, quiet tension, $STIL" &
run ratgeber-gift-a.webp 1440 816 103 "a bar of dark chocolate, grapes and a few onions on a dark kitchen counter, a dog's nose entering the frame from the side, warm evening light, $STIL" & wait
run ratgeber-schmerz-a.webp 1440 816 105 "an old cat lying withdrawn under a chair in a dim room, eyes half closed, warm lamp light in the background, $STIL"
echo FERTIG
