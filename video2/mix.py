"""Duck the music under the narration and write the final soundtrack."""
import numpy as np, soundfile as sf
from scipy.signal import lfilter
music = np.load('music.npy'); voice, sr = sf.read('voice.wav', dtype='float32')
n = min(len(music), len(voice)); music = music[:n]; voice = voice[:n]
env = np.abs(voice); a = np.exp(-1 / (0.25 * sr)); env = lfilter([1 - a], [1, -a], env)
env = np.minimum(1, env / (np.percentile(env[env > 1e-4], 90) + 1e-9))
duck = 1 - 0.55 * lfilter([1 - np.exp(-1 / (0.15 * sr))], [1, -np.exp(-1 / (0.15 * sr))], env)
mix = 0.42 * music * duck[:, None] + 0.95 * voice[:, None]
mix *= 0.93 / np.abs(mix).max()
sf.write('soundtrack.wav', mix, sr, subtype='PCM_16'); print('ok', n / sr)
