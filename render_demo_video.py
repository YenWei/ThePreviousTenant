#!/usr/bin/env python3
"""Render the spoiler demo video from approved game art and audio."""

from pathlib import Path
from PIL import Image, ImageDraw, ImageFont
from moviepy import AudioFileClip, CompositeAudioClip, ImageClip, VideoFileClip, concatenate_videoclips, vfx

ROOT = Path(__file__).resolve().parent
OUT = ROOT / "demo-video.mp4"
TMP = ROOT / ".video-frames"
TMP.mkdir(exist_ok=True)
W, H = 1280, 720

FONT = "/System/Library/Fonts/Supplemental/Arial.ttf"
BOLD = "/System/Library/Fonts/Supplemental/Arial Bold.ttf"


def fit(image):
    image=image.convert("RGB")
    s=max(W/image.width,H/image.height)
    r=image.resize((round(image.width*s),round(image.height*s)),Image.Resampling.LANCZOS)
    return r.crop(((r.width-W)//2,(r.height-H)//2,(r.width+W)//2,(r.height+H)//2))


def still(source, duration, title="", subtitle="", speaker=""):
    im=fit(Image.open(ROOT/source))
    if title or subtitle:
        overlay=Image.new("RGBA",(W,H)); d=ImageDraw.Draw(overlay)
        d.rectangle((0,H-178,W,H),fill=(7,9,9,225))
        if speaker: d.text((58,H-148),speaker.upper(),font=ImageFont.truetype(BOLD,21),fill=(204,172,103))
        if title: d.text((58,50),title,font=ImageFont.truetype(BOLD,38),fill=(239,235,220),stroke_width=2,stroke_fill=(0,0,0))
        if subtitle: d.multiline_text((58,H-108),subtitle,font=ImageFont.truetype(FONT,29),fill=(239,235,220),spacing=8)
        im=Image.alpha_composite(im.convert("RGBA"),overlay).convert("RGB")
    path=TMP/f"frame-{len(list(TMP.glob('frame-*'))):03}.jpg"; im.save(path,quality=94)
    return ImageClip(str(path)).with_duration(duration)


def voiced_still(source, audio, title, subtitle, speaker):
    voice=AudioFileClip(str(ROOT/audio))
    return still(source,voice.duration+.75,title,subtitle,speaker).with_audio(voice.with_start(.25))


def title_card(heading, body, duration=3):
    im=Image.new("RGB",(W,H),(10,13,13)); d=ImageDraw.Draw(im)
    d.text((80,230),heading,font=ImageFont.truetype(BOLD,52),fill=(225,203,151))
    d.multiline_text((82,315),body,font=ImageFont.truetype(FONT,29),fill=(207,205,195),spacing=13)
    path=TMP/f"frame-{len(list(TMP.glob('frame-*'))):03}.jpg";im.save(path,quality=94)
    return ImageClip(str(path)).with_duration(duration)


def gif(source, duration, subtitle, speaker, audio=None):
    voice=AudioFileClip(str(ROOT/audio)) if audio else None
    duration=max(duration,(voice.duration+.9) if voice else duration)
    raw=VideoFileClip(str(ROOT/source),audio=False).resized((W,H))
    clip=raw.with_effects([vfx.Loop(duration=duration)])
    # Static subtitle bar composited into a transparent PIL overlay.
    bar=Image.new("RGBA",(W,H));d=ImageDraw.Draw(bar);d.rectangle((0,H-170,W,H),fill=(7,9,9,225))
    d.text((58,H-142),speaker.upper(),font=ImageFont.truetype(BOLD,21),fill=(204,172,103))
    d.multiline_text((58,H-102),subtitle,font=ImageFont.truetype(FONT,28),fill=(239,235,220),spacing=7)
    path=TMP/f"bar-{len(list(TMP.glob('bar-*'))):03}.png";bar.save(path)
    from moviepy import CompositeVideoClip
    clip=CompositeVideoClip([clip,ImageClip(str(path)).with_duration(duration)])
    if voice:
        clip=clip.with_audio(CompositeAudioClip([voice.with_start(.45)]))
    return clip


clips=[
 title_card("THE PREVIOUS TENANT","A compact browser mystery built around authored voice,\nstateful clues, and one live generated performance."),
 voiced_still("assets/scenes/village-cat-blocking.png","audio/chief/arrival-1.mp3","A village expecting a new tenant","Ah—you must be the new tenant. Your room is ready. The house is just up the path.","Chief"),
 voiced_still("assets/scenes/house-entrance.png","audio/kid/house-1.mp3","","If you hear walking after dark, don't answer the door.","Kid"),
 gif("assets/scenes/cinematic-bell-reveal.gif",4.4,"So the bell still remembers me.","Ghost","audio/ghost/bell-exposed.mp3"),
 title_card("SPOILER: HIDDEN ENDING","Most dialogue is pre-generated. One exorcist line is written\nfrom game state at runtime, then voiced through ElevenLabs."),
 gif("assets/scenes/cinematic-hidden-ritual.gif",6,"At last. I was beginning to think no one would notice the bell.","Exorcist","audio/exorcist/reveal.mp3"),
 gif("assets/scenes/cinematic-hidden-ritual.gif",6.2,"The bell has answered; your haunting ends here, neatly and without further ceremony.","Exorcist · generated live","audio/runtime/hidden-ending-1786532520103.mp3"),
 gif("assets/scenes/cinematic-hidden-confrontation.gif",6.5,"You… you again. Even death could not teach you to leave me buried.","Ghost","audio/ghost/hidden-confrontation.mp3"),
 gif("assets/scenes/cinematic-hidden-binding.gif",6.2,"No—no, NO! You cannot bind me to their silence again!","Ghost","audio/ghost/hidden-sealed.mp3"),
 gif("assets/scenes/cinematic-hidden-release.gif",5.5,"It's quiet. I don't think I've ever heard it this quiet.","Kid","audio/kid/hidden-ending.mp3"),
 title_card("THE PREVIOUS TENANT","Pregenerated narrative audio for reliability.\nOne bounded LLM → ElevenLabs path for meaningful variation.\n\nSource and local setup: GitHub"),
]

video=concatenate_videoclips(clips,method="compose")
video.write_videofile(str(OUT),fps=24,codec="libx264",audio_codec="aac",preset="medium",bitrate="4500k",threads=4)
print(OUT)
