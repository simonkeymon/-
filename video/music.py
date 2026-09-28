"""Synthesize the soundtrack: ambient A-minor pad + arpeggio, layered by section, whooshes at sheet changes."""
import numpy as np
from scipy.signal import lfilter, butter, fftconvolve
SR = 44100; DUR = 181.0; N = int(SR * DUR)
t = np.arange(N) / SR
BEAT = 60 / 96
BOUNDS = [9, 23, 38, 52, 66, 81, 95, 110, 124, 139, 154, 169]
rng = np.random.default_rng(7)
midi = lambda m: 440 * 2 ** ((m - 69) / 12)

def env_pts(pts):  # piecewise-linear automation
    xs, ys = zip(*pts); return np.interp(t, xs, ys)

def lp(x, fc, order=2):
    b, a = butter(order, fc / (SR / 2)); return lfilter(b, a, x)

CH = {  # root, pad voicing
 'Am': (45, [57, 60, 64, 71]), 'F': (41, [53, 57, 60, 64]), 'C': (48, [55, 60, 64, 67]),
 'G': (43, [55, 59, 62, 69]), 'Dm': (38, [50, 57, 60, 65]), 'E': (40, [52, 56, 59, 64])}
LOOP = ['Am', 'F', 'C', 'G']
CHORD_LEN = 5.0
def chord_at(sec):
    if 52 <= sec < 66: return ['Am', 'Dm'][int((sec - 52) // 7) % 2]
    if sec >= 174: return 'Am'
    return LOOP[int(sec // CHORD_LEN) % 4]

out_pad = np.zeros(N); out_arp = np.zeros(N); out_bass = np.zeros(N); out_drum = np.zeros(N); out_fx = np.zeros(N)

# ---- pad: per chord segment, detuned additive saws with crossfades
segs = []; s = 0.0
while s < DUR:
    c = chord_at(s + 0.01); e = s
    while e < DUR and chord_at(e + 0.01) == c: e += 0.5
    segs.append((s, e, c)); s = e
for (s0, s1, c) in segs:
    a = max(0, int((s0 - 1.2) * SR)); b = min(N, int((s1 + 1.8) * SR)); tt = t[a:b]
    seg = np.zeros(b - a)
    for m in CH[c][1]:
        f = midi(m)
        for det in (-0.12, 0.0, 0.11):
            ff = f * 2 ** (det / 12); ph = rng.uniform(0, 2 * np.pi)
            for h in range(1, 6): seg += np.sin(2 * np.pi * ff * h * tt + ph * h) / h ** 1.6
    fade = np.clip((tt - (s0 - 1.2)) / 1.8, 0, 1) * np.clip(((s1 + 1.8) - tt) / 1.8, 0, 1)
    out_pad[a:b] += seg * fade
out_pad = lp(out_pad, 1400) * env_pts([(0, 0), (4, .7), (9, .8), (52, .8), (53, .55), (66, .55), (67, .8), (169, .8), (175, .9), (181, 0)])
out_pad *= 1 + 0.08 * np.sin(2 * np.pi * 0.11 * t)  # slow movement

# ---- pluck helper
def pluck(buf, start, f, amp, dec=0.35, bright=0.5):
    a = int(start * SR); L = int(min(1.6, dec * 5) * SR); b = min(N, a + L)
    if a >= N: return
    tt = np.arange(b - a) / SR
    v = (np.sin(2 * np.pi * f * tt) + bright * np.sin(4 * np.pi * f * tt) * np.exp(-tt / (dec * .4)) + .2 * np.sin(6 * np.pi * f * tt) * np.exp(-tt / (dec * .25)))
    buf[a:b] += amp * v * np.exp(-tt / dec) * np.clip(tt / 0.004, 0, 1)

# ---- arpeggio: 8th notes, pattern over chord tones
arp_gain = lambda x: np.interp(x, [0, 9, 10, 52, 52.5, 66, 67, 95, 169, 172, 176], [0, 0, .55, .55, 0, 0, .6, .7, .7, .35, 0])
k = 0; x = 9.0
PAT = [0, 1, 2, 3, 2, 1, 3, 2]
while x < 176:
    g = arp_gain(x)
    if g > 0.01:
        c = chord_at(x); notes = CH[c][1]
        m = notes[PAT[k % 8]] + 12 + (12 if (k % 16) in (6, 14) and x > 95 else 0)
        pluck(out_arp, x, midi(m), g * (1.0 if k % 2 == 0 else .7), dec=0.32)
    x += BEAT / 2; k += 1
# winter: sparse ice bells
for i, x in enumerate(np.arange(53, 65.5, 1.9)):
    pluck(out_arp, x, midi([76, 79, 83, 81, 76, 72, 74][i % 7] + 12), .28, dec=1.1, bright=.1)
# ending: slow held arpeggio into final chord
for i, m in enumerate([69, 72, 76, 81, 76, 84]):
    pluck(out_arp, 174 + i * 0.55, midi(m), .5, dec=1.4, bright=.2)

# ---- bass: half notes from 95s
x = 95.0
while x < 169:
    f = midi(CH[chord_at(x)][0]); a = int(x * SR); L = int(BEAT * 2 * SR); tt = np.arange(L) / SR
    v = np.tanh(1.8 * (np.sin(2 * np.pi * f * tt) + .3 * np.sin(4 * np.pi * f * tt))) * np.exp(-tt / 1.2) * np.clip(tt / .01, 0, 1)
    out_bass[a:a + L] += .55 * v[:max(0, min(L, N - a))]
    x += BEAT * 2

# ---- drums: soft kick on beats (95-169), hats on offbeats (110-169); lighter kick 67-95
def kick(at, amp):
    a = int(at * SR); L = int(.3 * SR); tt = np.arange(L) / SR
    f = 45 + 80 * np.exp(-tt / .03); ph = 2 * np.pi * np.cumsum(f) / SR
    out_drum[a:a + L] += amp * np.sin(ph) * np.exp(-tt / .12)
def hat(at, amp):
    a = int(at * SR); L = int(.05 * SR); nz = rng.standard_normal(L)
    nz = nz - lfilter([1], [1, -0.6], nz)
    out_drum[a:a + L] += amp * nz * np.exp(-np.arange(L) / SR / .012)
x = 67.0
while x < 169:
    if x >= 95 or int(round((x - 67) / BEAT)) % 2 == 0: kick(x, .75 if x >= 95 else .45)
    if x >= 110: hat(x + BEAT / 2, .12)
    x += BEAT

# ---- whooshes + tick at each sheet change; riser into the first sheet
for B in BOUNDS:
    a = int((B - 1.0) * SR); L = int(2.0 * SR); tt = np.arange(L) / SR
    nz = rng.standard_normal(L)
    env = np.where(tt < 1.0, (tt / 1.0) ** 2, np.exp(-(tt - 1.0) / .25))
    bb, aa = butter(2, [600 / (SR / 2), 5000 / (SR / 2)], btype='band')
    out_fx[a:a + L] += .35 * lfilter(bb, aa, nz) * env
    ta = int(B * SR); tl = int(.06 * SR); tq = np.arange(tl) / SR
    out_fx[ta:ta + tl] += .25 * np.sin(2 * np.pi * 1800 * tq) * np.exp(-tq / .012)
a = int(4 * SR); L = int(5 * SR); tt = np.arange(L) / SR
out_fx[a:a + L] += .25 * lfilter(*butter(2, 3000 / (SR / 2)), rng.standard_normal(L)) * (tt / 5) ** 3

# ---- reverb + mix
ir_t = np.arange(int(2.8 * SR)) / SR
ir = rng.standard_normal(len(ir_t)) * np.exp(-ir_t / .7); ir = lp(ir, 5000); ir /= np.sqrt((ir ** 2).sum())
def norm(x): return x / (np.abs(x).max() + 1e-9)
dry = .42 * norm(out_pad) + .30 * norm(out_arp) + .30 * norm(out_bass) + .34 * norm(out_drum) + .22 * norm(out_fx)
wet_src = .42 * norm(out_pad) + .30 * norm(out_arp) + .1 * norm(out_fx)
wetL = fftconvolve(wet_src, ir)[:N]; wetR = fftconvolve(wet_src, np.roll(ir, 331))[:N]
L = dry + .35 * wetL; R = dry + .35 * wetR
# gentle stereo width on arp
L += .05 * np.roll(norm(out_arp), 300); R += .05 * np.roll(norm(out_arp), -300)
st = np.stack([L, R], 1)
st = np.tanh(1.2 * st / np.abs(st).max()) ; st *= 0.89 / np.abs(st).max()
fade = np.clip((DUR - t) / 1.5, 0, 1)[:, None]; st *= fade
from scipy.io import wavfile
wavfile.write('music.wav', SR, (st * 32767).astype(np.int16))
print('ok', st.shape, float(np.abs(st).max()))
