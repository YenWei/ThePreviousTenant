#!/usr/bin/env python3
"""Build the six restrained cinematic GIFs from approved scene art."""

from pathlib import Path
from PIL import Image, ImageDraw, ImageEnhance, ImageFilter

ROOT = Path(__file__).resolve().parent
SCENES = ROOT / "assets/scenes"
SIZE = (960, 540)
COUNT = 14


def cover(im, zoom=1):
    s=max(SIZE[0]/im.width,SIZE[1]/im.height)*zoom
    r=im.resize((round(im.width*s),round(im.height*s)),Image.Resampling.LANCZOS)
    x=(r.width-SIZE[0])//2; y=(r.height-SIZE[1])//2
    return r.crop((x,y,x+SIZE[0],y+SIZE[1])).convert("RGBA")


def pulse(i, centre=.58, width=.24): return max(0,1-abs(i/(COUNT-1)-centre)/width)


def grade(im, p, dark=.92):
    im=ImageEnhance.Brightness(im).enhance(dark+p*.15)
    return ImageEnhance.Contrast(im).enhance(1.04+p*.08)


def glow(im, p, xy, color=(215,231,210), radius=120):
    layer=Image.new("RGBA",SIZE); d=ImageDraw.Draw(layer)
    d.ellipse((xy[0]-radius,xy[1]-radius,xy[0]+radius,xy[1]+radius),fill=(*color,round(58*p)))
    return Image.alpha_composite(im,layer.filter(ImageFilter.GaussianBlur(30)))


def shadow(im,p,box):
    layer=Image.new("RGBA",SIZE); d=ImageDraw.Draw(layer)
    d.ellipse(box,fill=(0,3,6,round(175*p)))
    return Image.alpha_composite(im,layer.filter(ImageFilter.GaussianBlur(18)))


def save(name, frames):
    frames=[f.convert("P",palette=Image.Palette.ADAPTIVE,colors=128) for f in frames]
    durations=[210]*COUNT; durations[0]=600; durations[-1]=800
    frames[0].save(SCENES/name,save_all=True,append_images=frames[1:],duration=durations,loop=0,optimize=True,disposal=2)


def blend_sequence(a,b,mode="reveal"):
    out=[]
    for i in range(COUNT):
        t=i/(COUNT-1); p=pulse(i)
        amount=min(1,max(0,(t-.12)/.58)) if mode=="reveal" else min(1,max(0,(t-.05)/.45))
        im=Image.blend(cover(a,1+.015*t),cover(b,1+.015*t),amount)
        out.append(grade(im,p,.93 if mode=="reveal" else .82))
    return out


def main():
    entrance=Image.open(SCENES/"house-entrance.png").convert("RGB")
    ghost=Image.open(SCENES/"house-entrance-ghost-keyframe.png").convert("RGB")
    sealed=Image.open(SCENES/"house-entrance-sealed-keyframe.png").convert("RGB")
    exorcist=Image.open(SCENES/"house-entrance-exorcist-keyframe.png").convert("RGB")
    room=Image.open(SCENES/"rented-room.png").convert("RGB")
    village=Image.open(SCENES/"village-cat-departed.png").convert("RGB")

    save("cinematic-bell-reveal.gif",blend_sequence(entrance,ghost,"reveal"))
    released=blend_sequence(entrance,ghost,"released")
    save("cinematic-key-girl.gif",[shadow(f,pulse(i),(535,50,825,600)) for i,f in enumerate(released)])

    frames=[]
    for i in range(COUNT):
        t=i/(COUNT-1); p=pulse(i); im=grade(cover(room,1+.018*t),p,.78)
        # Door seam and an entering floor shadow.
        layer=Image.new("RGBA",SIZE); d=ImageDraw.Draw(layer)
        d.polygon([(595,120),(635,120),(690,540),(520,540)],fill=(0,0,2,round(145*p)))
        d.line((600,105,600,385),fill=(205,220,202,round(80*p)),width=3)
        frames.append(Image.alpha_composite(im,layer.filter(ImageFilter.GaussianBlur(9))))
    save("cinematic-rest-night.gif",frames)

    frames=[]
    for i in range(COUNT):
        t=i/(COUNT-1); p=pulse(i); im=grade(cover(village,1+.014*t),p,.84)
        im=shadow(im,p,(390,110,590,600)); frames.append(glow(im,p,(520,350),radius=90))
    save("cinematic-chief-bargain.gif",frames)

    save("cinematic-door-sealed.gif",blend_sequence(entrance,sealed,"reveal"))

    save("cinematic-hidden-ritual.gif",blend_sequence(entrance,exorcist,"reveal"))

    # Hidden ending is a multi-shot sequence: awakening, confrontation, binding, release.
    save("cinematic-hidden-confrontation.gif",blend_sequence(entrance,ghost,"reveal"))
    binding=blend_sequence(ghost,sealed,"reveal")
    save("cinematic-hidden-binding.gif",[shadow(f,1-pulse(i)*.72,(555,35,815,610)) for i,f in enumerate(binding)])
    release=[]
    for i in range(COUNT):
        t=i/(COUNT-1); p=pulse(i,.42,.36); im=grade(cover(sealed,1-.01*t),p,.93)
        release.append(glow(im,p,(660,290),color=(235,230,202),radius=240))
    save("cinematic-hidden-release.gif",release)

    for p in sorted(SCENES.glob("cinematic-*.gif")): print(p.name,p.stat().st_size)


if __name__=="__main__": main()
