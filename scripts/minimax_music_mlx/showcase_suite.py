"""Five-genre 60s showcase blueprints and batch runner for MiniMax-Music3 MLX."""
from __future__ import annotations

import argparse
import json
from pathlib import Path
import sys
import tempfile

SCRIPTS_DIR = Path(__file__).resolve().parents[1]
if str(SCRIPTS_DIR) not in sys.path:
    sys.path.insert(0, str(SCRIPTS_DIR))

from minimax_music_mlx.engine import DEFAULT_CACHE_ROOT, DEFAULT_MODEL_ID, MiniMaxMusicEngine, ensure_mlx_runtime
from minimax_music_mlx.mastering import MASTERING_FILTER_CHAIN, analyze_song_acoustics, master_wav_and_encode_m4a
from minimax_music_mlx.prompt_lint import _parse_lyric_sections, audit_song_blueprint

REPO_ROOT = Path(__file__).resolve().parents[2]
DEFAULT_SHOWCASE_DIR = REPO_ROOT / 'private' / 'minimax-music3'

SHOWCASE_BLUEPRINTS: tuple[dict[str, object], ...] = (
    {
        'slug': 'showcase-pop',
        'order': 1,
        'genreIcon': '🎵',
        'genreBadge': {'zh': '都市流行 · City Pop', 'en': 'City Pop · Synth-Funk'},
        'title': {'zh': '霓虹晚风 · 现代都市流行', 'en': 'Neon Evening Breeze · Urban City Pop'},
        'subtitle': {
            'zh': '112 BPM · A 大调 · 复古铜管合成器与切分电吉他 + 双八度清亮女声钩子',
            'en': '112 BPM · A Major · Brass Synth Hook, Funk Guitar & Octave Female Pop Vocals',
        },
        'motifSummary': {
            'zh': '清脆复古 Brass Synth Hook + Funk 切分电吉他扫弦 + 弹性 Slap Bass（零糊频弦乐）',
            'en': 'Crisp vintage brass-synth hook + funky Nile-style guitar skanks + bouncy slap bass (zero string wash)',
        },
        'bpm': 112,
        'key': 'A major',
        'seed': 19,
        'duration': 75.0,
        'steps': 30,
        'temperature': 1.08,
        'ar_cfg_scale': 1.85,
        'ar_top_k': 65,
        'dit_cfg_scale': 1.95,
        'sectionWeights': {'[intro]': 1.5, '[verse]': 4.8, '[pre-chorus]': 2.2, '[chorus]': 5.8, '[outro]': 2.2},
        'prompt': (
            'Global Metadata\n'
            'Basic Attributes: bpm is 112. key is A, and scale is major. Mandarin Synth-Pop / Urban City Pop.\n'
            'Global Emotional Progression: Opens with a sparkling midnight city groove, gliding through a breezy, syncopated verse into a breathless pre-chorus drop-out before erupting into an infectious, wide-screen neon chorus hook and a shimmering outro fade.\n'
            'Sonics & Production Profile: Crystal-clear modern pop mix with tight side-chained low end, crisp 4–10 kHz presence, punchy gated snare crack, and zero muddy orchestral strings.\n'
            'Vocal Details\n'
            'Vocal Gender & Timbre: Singer A (Female). Bright, agile urban pop soprano with airy articulation and sparkling upper harmonics.\n'
            'Vocal Style: Bouncy, conversational pocket phrasing in the verse; soaring, infectious open-vowel melodic hooks in the chorus.\n'
            'Harmony/Backing Vocals: Intimate single-tracked lead in the verse; lush wide-panned octave doubling, stacked thirds, and playful call-and-response ad-libs in the chorus.\n'
            'Vocal FX: Tight studio compression and subtle slapback in verses; glossy stereo plate reverb and shimmering air shelf on chorus tails.\n'
            'Arrangement\n'
            'Instrument Lifecycle Description (Primary/Secondary Layering):\n'
            'Primary: A crisp, staccato vintage analog brass-synth hook and funky clean electric guitar skank chords establish the signature motif across Intro, Chorus, and Outro, backed by a bouncy slap-and-pop electric bass.\n'
            'Secondary: Warm electric Rhodes chords and sparkling arpeggiated bell synths add harmonic shimmer without cluttering the 250 Hz midrange. No lush cinematic strings.\n'
            'Groove & Foundation Progression: Intro launches with the bright brass-synth riff and four-on-the-floor kick. Verse strips back to tight kick, snappy snare, slap bass, and muted funk guitar chops so the vocal breathes. Pre-Chorus builds with a rising filter sweep until all drums and bass drop out completely on the final bar. Chorus explodes with full brass-synth stabs, disco hi-hat open-close bounce, and wide vocal stacks. Bridge-like turnaround flows directly into a sparkling four-bar Outro stinger.'
        ),
        'lyrics': (
            '[Intro]\n'
            '(Ooh-yeah! City lights!)\n'
            '晚风擦亮，十点半街角\n'
            '\n'
            '[Verse]\n'
            '高架桥下，车灯连成银河\n'
            '耳机切歌，把疲惫全解锁\n'
            '便利店冰汽水，冒着气泡\n'
            '橱窗倒影里，嘴角在上翘\n'
            '不用猜明天，往哪边停靠\n'
            '此刻心跳，踩准这拍号！\n'
            '\n'
            '[Pre-Chorus]\n'
            '倒数三秒，把烦恼关掉——\n'
            '深呼吸，听鼓点停一拍！\n'
            '\n'
            '[Chorus]\n'
            '追着霓虹跑！(Oh-oh~)\n'
            '晚风正逍遥！\n'
            '星光落肩头，烦恼全抛掉！\n'
            '把夜色点亮！(Yeah!)\n'
            '自在去发光——\n'
            '整座不夜城，为我们合唱！(Shining now!)\n'
            '\n'
            '[Outro]\n'
            '追着霓虹跑——(Oh-oh~)\n'
            '晚风里微笑，Goodnight~'
        ),
    },
    {
        'slug': 'showcase-ballad',
        'order': 2,
        'genreIcon': '🎹',
        'genreBadge': {'zh': '深情抒情 · Piano Ballad', 'en': 'Cinematic Piano Ballad'},
        'title': {'zh': '旧站台微光 · 电影感钢琴弦乐抒情', 'en': 'Platform Glow · Cinematic Piano Ballad'},
        'subtitle': {
            'zh': '72 BPM · Eb 大调 · 三角钢琴分解和弦与独奏大提琴 + 贴麦气声真假音转换',
            'en': '72 BPM · Eb Major · Felt Grand Piano, Solo Cello & Intimate Breathy Vocal Climax',
        },
        'motifSummary': {
            'zh': '温暖三角钢琴分解和弦引子 + 独奏大提琴（Solo Cello）深情对话 + 副歌真鼓温暖铺开',
            'en': 'Warm grand piano arpeggio motif + expressive solo cello counter-melody + brushed acoustic drum bloom in chorus',
        },
        'bpm': 72,
        'key': 'Eb major',
        'seed': 29,
        'duration': 75.0,
        'steps': 30,
        'temperature': 1.06,
        'ar_cfg_scale': 1.80,
        'ar_top_k': 55,
        'dit_cfg_scale': 1.90,
        'sectionWeights': {'[intro]': 1.6, '[verse]': 4.8, '[pre-chorus]': 2.3, '[chorus]': 5.8, '[outro]': 2.2},
        'prompt': (
            'Global Metadata\n'
            'Basic Attributes: bpm is 72. key is Eb, and scale is major. Cinematic Mandarin Piano Ballad.\n'
            'Global Emotional Progression: Begins in fragile, late-night solitude with solo felt-piano arpeggios, gradually warming through a tender pre-chorus hush before blooming into a cathartic, heart-wrenching chorus climax and resolving into a quiet, lingering piano-and-cello farewell.\n'
            'Sonics & Production Profile: Warm, audiophile acoustic recording with wide dynamic range, intimate close-mic breath detail, uncluttered 240 Hz low-mids, and lush concert-hall spatial depth in the chorus.\n'
            'Vocal Details\n'
            'Vocal Gender & Timbre: Singer A (Female). Warm, story-driven mezzo-soprano with delicate breathiness and crystal-clear Mandarin diction.\n'
            'Vocal Style: Whisper-close, rubato-inflected phrasing over sparse piano chords in the verse; seamless chest-to-falsetto transitions and sustained emotional long notes in the chorus.\n'
            'Harmony/Backing Vocals: Pure, unadorned solo vocal in the verse; soft, angelic stereo vocal pads and tender octave sighs supporting the chorus peak.\n'
            'Vocal FX: Ultra-clean tube preamp warmth in the verse; long, silky hall reverb and gentle pre-delay opening up during the chorus.\n'
            'Arrangement\n'
            'Instrument Lifecycle Description (Primary/Secondary Layering):\n'
            'Primary: A warm concert grand piano arpeggio motif and a soulful solo cello counter-melody carry the emotional spine from Intro to Outro.\n'
            'Secondary: Warm acoustic bass and soft brushed-to-mallet live drums enter exclusively in the Chorus alongside high chamber strings, keeping the Verse bare and intimate.\n'
            'Groove & Foundation Progression: Intro features delicate solo grand piano arpeggios answered by a sighing cello phrase. Verse strips down to sparse single-note piano voicings with generous silence between phrases. Pre-Chorus introduces a mournful solo cello swell before pausing in a suspended breath on the final beat. Chorus blooms with warm live snare backbeats, deep bass notes, soaring cello-and-violin legato lines, and sustained vocal belts. Bridge-style harmonic sigh resolves gently into a sparse four-bar piano Outro.'
        ),
        'lyrics': (
            '[Intro]\n'
            '(Mmm~ 琴声轻落)\n'
            '\n'
            '[Verse]\n'
            '末班列车，滑过起雾的窗\n'
            '旧围巾上，还留着白茶香\n'
            '路灯把影子，拉得那么长\n'
            '风吹过空站台，替我听清\n'
            '\n'
            '[Pre-Chorus]\n'
            '时间慢下来，呼吸都透明——\n'
            '这一秒安静，等星光回应\n'
            '\n'
            '[Chorus]\n'
            '借一束微光——(Ah~)\n'
            '照亮旧行囊\n'
            '哪怕隔山海——(Ooh~)\n'
            '温暖不散场\n'
            '\n'
            '[Outro]\n'
            '晚安旧站台——(Mmm~)\n'
            '微光在生长'
        ),
    },
    {
        'slug': 'showcase-guofeng',
        'order': 3,
        'genreIcon': '🪈',
        'genreBadge': {'zh': '东方国风 · Guofeng Fusion', 'en': 'Guofeng · Guzheng & Dizi'},
        'title': {'zh': '烟雨姑苏行 · 东方戏腔竹笛新国风', 'en': 'Misty Suzhou · Modern Guofeng Fusion'},
        'subtitle': {
            'zh': '96 BPM · D 羽五声调式 · 古筝泛音轮指与竹笛副旋律 + 副歌婉转戏腔转音',
            'en': '96 BPM · D Pentatonic Minor · Guzheng Harmonics, Dizi Flute & Opera Falsetto Hook',
        },
        'motifSummary': {
            'zh': '清越古筝轮指泛音开场 + 悠扬竹笛（Dizi）五声音阶穿插 + 副歌中国大鼓与现代电子低音融合',
            'en': 'Crystalline Guzheng tremolos & harmonics + soaring Dizi pentatonic motif + Tang drum & modern sub-bass chorus',
        },
        'bpm': 96,
        'key': 'D minor (Pentatonic)',
        'seed': 37,
        'duration': 75.0,
        'steps': 30,
        'temperature': 1.10,
        'ar_cfg_scale': 1.90,
        'ar_top_k': 65,
        'dit_cfg_scale': 2.0,
        'sectionWeights': {'[intro]': 1.6, '[verse]': 4.8, '[pre-chorus]': 2.2, '[chorus]': 5.8, '[outro]': 2.2},
        'prompt': (
            'Global Metadata\n'
            'Basic Attributes: bpm is 96. key is D, and scale is minor. Modern Chinese Guofeng / Guzheng and Dizi Pentatonic Fusion.\n'
            'Global Emotional Progression: Opens like ink wash spreading on silk with crystalline Guzheng harmonics and misty Dizi bamboo flute, flowing through a poetic jianghu verse, pausing on a crisp woodblock breath in the pre-chorus, and surging into a majestic, opera-inflected chorus backed by resonant Chinese Tang drums and modern sub-bass.\n'
            'Sonics & Production Profile: High-definition East-meets-West production with sparkling plucked Guzheng transients, airy bamboo flute breath, deep uncluttered sub-bass, and wide stereo separation.\n'
            'Vocal Details\n'
            'Vocal Gender & Timbre: Singer A (Female). Clear, jade-like Mandarin guofeng vocal with poised classical elegance and expressive Peking-opera-inflected falsetto agility.\n'
            'Vocal Style: Graceful, poetic narrative phrasing in the verse; soaring pentatonic melismas and crystalline opera-inflected falsetto turns on chorus endings.\n'
            'Harmony/Backing Vocals: Delicate solo lead in verses; ethereal fifth-interval harmonies and silk-road vocal echoes framing the chorus hook.\n'
            'Vocal FX: Crisp silk-condenser clarity in verses; spacious canyon delay and shimmering stereo hall tail on high opera-falsetto notes.\n'
            'Arrangement\n'
            'Instrument Lifecycle Description (Primary/Secondary Layering):\n'
            'Primary: Expressive Guzheng finger-rolls and harmonics intertwine with a soaring Dizi bamboo flute pentatonic motif as the unmistakable melodic signature.\n'
            'Secondary: Deep Chinese Tang war drums, crisp woodblock percussion, and a clean modern electronic sub-bass enter cleanly in the Chorus without muddying the midrange.\n'
            'Groove & Foundation Progression: Intro unveils cascading Guzheng harmonics and a lyrical Dizi solo phrase. Verse keeps the texture light with plucked Guzheng arpeggios and subtle fingertip percussion around the vocal. Pre-Chorus builds tension with rapid Guzheng glissandos before cutting to a sudden one-beat silence after a crisp woodblock strike. Chorus erupts with thunderous Tang drum hits, modern sub-bass pulse, soaring Dizi counter-melodies, and radiant opera-falsetto vocal leaps. Bridge-like flute echo glides into a serene Guzheng harmonic Outro.'
        ),
        'lyrics': (
            '[Intro]\n'
            '(筝音落，笛声起~)\n'
            '\n'
            '[Verse]\n'
            '乌篷船摇碎，半江烟雨色\n'
            '青石板长街，灯火映楼阁\n'
            '折一枝寒梅，寄往姑苏城\n'
            '壶中温浊酒，笑谈天下客\n'
            '\n'
            '[Pre-Chorus]\n'
            '拨弦急，风满袖——\n'
            '且停一拍，看明月入怀！\n'
            '\n'
            '[Chorus]\n'
            '一笛破苍茫——(啊~)\n'
            '烟雨入诗行！\n'
            '醉看繁花落——(咿呀~)\n'
            '灯火照归航！\n'
            '乘风踏月去，天地任疏狂！\n'
            '\n'
            '[Outro]\n'
            '一曲姑苏月——(啊~)\n'
            '余音绕长廊'
        ),
    },
    {
        'slug': 'showcase-rap',
        'order': 4,
        'genreIcon': '🎤',
        'genreBadge': {'zh': '硬核说唱 · Hard Boom-Bap', 'en': 'Hard Boom-Bap · Hip-Hop'},
        'title': {'zh': 'Ignite 黄金律动 · 硬核切分说唱', 'en': 'Ignite V2 Pocket · Hard Boom-Bap Rap'},
        'subtitle': {
            'zh': '94 BPM · F# 小调 · SP-1200 硬脆鼓组与闷音铜管 Riff + 预副歌整拍抽空爆发',
            'en': '94 BPM · F# Minor · SP-1200 Drums, Muted Brass Riff & Pre-Chorus Drop-Out Chant',
        },
        'motifSummary': {
            'zh': '复古切分电翼琴与闷音铜管 Riff + SP-1200 硬脆军鼓 + 65Hz 侧链重低音 + 预副歌静默抽空',
            'en': 'Gritty clavinet & muted brass riff + SP-1200 biting snare + 65Hz side-chained sub + 1-bar pre-chorus silence',
        },
        'bpm': 94,
        'key': 'F# minor',
        'seed': 113,
        'duration': 75.0,
        'steps': 30,
        'temperature': 1.12,
        'ar_cfg_scale': 1.90,
        'ar_top_k': 75,
        'dit_cfg_scale': 2.05,
        'sectionWeights': {'[intro]': 1.6, '[verse]': 5.0, '[pre-chorus]': 2.2, '[chorus]': 5.6, '[outro]': 2.0},
        'prompt': (
            'Global Metadata\n'
            'Basic Attributes: bpm is 94. key is F#, and scale is minor. Modern East-Asian Hard Boom-Bap / Arena Hip-Hop.\n'
            'Global Emotional Progression: Opens with turntable scratches and a gritty underground brass-and-clavinet motif, locking into a razor-sharp head-nod pocket during the verse. Tension coils in the pre-chorus before a sudden one-bar complete instrumental drop-out launches an explosive stadium gang-vocal chorus chant and a tight scratch outro.\n'
            'Sonics & Production Profile: Transient-forward hip-hop mix with a tight side-chained 65 Hz sub-bass, clean uncluttered 250 Hz low-mids, biting snare crack on beats 2 and 4, and wide stereo chorus shouts. No lush cinematic strings, no corporate wash.\n'
            'Vocal Details\n'
            'Vocal Gender & Timbre: Singer A (Male). Charismatic gritty baritone with razor-sharp Mandarin consonant attack and chest punch.\n'
            'Vocal Style: Syncopated, bouncy rhythmic rap flow in the verse with deliberate breath pockets; powerful melodic sung-rap hook in the chorus with open-vowel sustain.\n'
            'Harmony/Backing Vocals: Dry centered single-track lead in the verse; wide stereo gang-vocal shouts, octave vocal doubling, and energetic call-and-response ad-libs in the chorus.\n'
            'Vocal FX: Fast FET compression and upfront dry presence in verses; slapback throw delay on rhyme endings and wide arena plate on chorus gang chants.\n'
            'Arrangement\n'
            'Instrument Lifecycle Description (Primary/Secondary Layering):\n'
            'Primary: A staccato muted-brass and gritty funk clavinet riff serves as the signature melodic hook across Intro, Chorus, and Outro.\n'
            'Secondary: A hard-hitting SP-1200 boom-bap drum kit and punchy 808 sub-bass lock tightly together, punctuated by brief DJ scratch turnarounds.\n'
            'Groove & Foundation Progression: Intro drops DJ scratches and the raw brass riff before heavy drums slam in. Verse strips back to kick, biting snare, sub-bass pulse, and sparse clavinet chops so every syllable bounces. Pre-Chorus builds with snare rolls until all drums and bass drop out completely into dead silence on the final bar. Chorus erupts with full brass stabs, double-time hi-hat bounce, heavy sub-bass drops, and stacked gang chants. Bridge-free tight structure punches straight into a four-bar scratch Outro.'
        ),
        'lyrics': (
            '[Intro]\n'
            '(Yo! Check the pulse!)\n'
            '灯光切暗，鼓点上膛 (Uh!)\n'
            '\n'
            '[Verse]\n'
            '八月破局，地基重铸\n'
            '六天一代，极速进化 (Yeah!)\n'
            '告别手把手地死盯代码\n'
            '给它目标，自己破关卡\n'
            '行内改配置，界面多利落\n'
            '一美元跑通，这笔账痛快！\n'
            '\n'
            '[Pre-Chorus]\n'
            '三大支柱，给我立稳！(Hey!)\n'
            '鼓点收住——准备引爆！\n'
            '\n'
            '[Chorus]\n'
            '一句话——全点亮！(Ignite!)\n'
            '稳稳跑，节点上！\n'
            '千军听我号令忙\n'
            'Oh——想法秒启航~\n'
            'Copilot Studio！(Let\'s go!)\n'
            '\n'
            '[Outro]\n'
            '打破旧边框！(Ha!)\n'
            'Build it now——Studio！'
        ),
    },
    {
        'slug': 'showcase-rock',
        'order': 5,
        'genreIcon': '🎸',
        'genreBadge': {'zh': '高燃摇滚 · Arena Rock', 'en': 'Arena / Alternative Rock'},
        'title': {'zh': '逆风破晓 · 高燃体育馆摇滚', 'en': 'Into the Dawn · Mandarin Arena Rock'},
        'subtitle': {
            'zh': '132 BPM · E 小调 · 过载电吉他 Power-Chord Riff + 真鼓滚奏与全场大合唱',
            'en': '132 BPM · E Minor · Overdriven Guitar Riff, Explosive Tom Fills & Stadium Anthem',
        },
        'motifSummary': {
            'zh': '过载失真电吉他标志性 Power-Chord Riff 开道 + 闷音主歌蓄力 + 预副歌军鼓滚奏 + 全场大合唱',
            'en': 'Signature overdriven guitar riff + palm-muted verse chug + snare-roll pre-chorus + stadium (Hey! Hey!) chorus',
        },
        'bpm': 132,
        'key': 'E minor',
        'seed': 77,
        'duration': 75.0,
        'steps': 30,
        'temperature': 1.12,
        'ar_cfg_scale': 1.95,
        'ar_top_k': 70,
        'dit_cfg_scale': 2.05,
        'sectionWeights': {'[intro]': 1.6, '[verse]': 4.8, '[pre-chorus]': 2.2, '[chorus]': 5.8, '[outro]': 2.2},
        'prompt': (
            'Global Metadata\n'
            'Basic Attributes: bpm is 132. key is E, and scale is minor. Mandarin Arena Rock / Modern Alternative Rock.\n'
            'Global Emotional Progression: Explodes out of the gate with an electrifying overdriven guitar riff and thunderous drum fills, pulls back into a coiled, palm-muted verse pulse, climbs through a snare-roll pre-chorus stop, and detonates into a sky-scraping stadium rock chorus chant before a crashing final chord.\n'
            'Sonics & Production Profile: Punchy live-band rock production with crisp Marshall-style guitar bite, tight pick-attack electric bass, uncompressed acoustic snare crack, clean low-mids, and massive wide-panned rhythm guitars in the chorus.\n'
            'Vocal Details\n'
            'Vocal Gender & Timbre: Singer A (Male). Raspy, high-energy rock tenor with gritty emotional edge and powerful upper-register projection.\n'
            'Vocal Style: Controlled, tense rhythmic delivery in the palm-muted verse; explosive, raspy belted rock hooks with soaring sustained notes in the chorus.\n'
            'Harmony/Backing Vocals: Raw single lead vocal in the verse; massive stadium crowd gang shouts and high-harmony doubles on every chorus hook.\n'
            'Vocal FX: Punchy analog console grit and tight slap delay in verses; big arena reverb tail opening up on sustained chorus belts.\n'
            'Arrangement\n'
            'Instrument Lifecycle Description (Primary/Secondary Layering):\n'
            'Primary: A signature overdriven electric guitar power-chord riff and melodic octave lead line drive the Intro, Chorus, and Outro, locked to a driving sixteen-note hi-hat and acoustic rock drum kit.\n'
            'Secondary: Gritty picked P-bass anchors the root notes without bloating 240 Hz; subtle organ grit reinforces the chorus wall of sound.\n'
            'Groove & Foundation Progression: Intro blasts open with the main overdriven guitar riff and explosive tom fills. Verse drops the distortion wall down to tight palm-muted eighth-note guitar chugs, bass pulse, and crisp closed hi-hats. Pre-Chorus builds with open crashes and a thunderous snare drum roll before a sharp one-beat band stop. Chorus unleashes double-tracked wide-panned distortion guitars, crashing cymbals, octave lead guitar hooks, and stadium crowd chants. Bridge-free adrenaline carries straight into a fierce four-bar riff Outro.'
        ),
        'lyrics': (
            '[Intro]\n'
            '(Hey! Hey! 电吉他轰鸣!)\n'
            '\n'
            '[Verse]\n'
            '暴雨砸在，滚烫的柏油路\n'
            '膝盖擦伤，也不肯退一步\n'
            '冷眼嘲笑，当成耳边狂风\n'
            '攥紧拳头，听胸膛在震动\n'
            '黑夜越沉，火种烧得越烈\n'
            '倒计时响，冲破所有边界！\n'
            '\n'
            '[Pre-Chorus]\n'
            '军鼓擂响，把沉默撕开——\n'
            '屏住呼吸，听全场呐喊！\n'
            '\n'
            '[Chorus]\n'
            '逆着风奔跑！(Hey! Hey!)\n'
            '把黑夜燃烧！\n'
            '就算遍体鳞伤，也要冲云霄！\n'
            '向破晓狂啸！(Whoa-oh!)\n'
            '让世界听到——\n'
            '这一刻沸腾，永不弯下腰！\n'
            '\n'
            '[Outro]\n'
            '逆着风奔跑！(Hey! Hey!)\n'
            '破晓已来到！'
        ),
    },
)


def build_showcase_sections(lyrics: str, weight_map: dict[str, float]) -> list[dict[str, object]]:
    parsed, dropped = _parse_lyric_sections(lyrics)
    if dropped:
        raise ValueError(f'Inline tag truncation detected: {dropped}')
    enriched = []
    for sec in parsed:
        key = str(sec['tag']).strip().lower()
        enriched.append({
            'tag': sec['tag'],
            'weight': weight_map.get(key, round(max(1.5, len(sec['lines']) * 0.9), 2)),
            'lines': sec['lines'],
        })
    return enriched


def lint_all_blueprints(blueprints=SHOWCASE_BLUEPRINTS) -> list[dict[str, object]]:
    reports = []
    for bp in blueprints:
        rep = audit_song_blueprint(str(bp['prompt']), str(bp['lyrics']))
        rep['slug'] = bp['slug']
        reports.append(rep)
    return reports


def render_showcase_suite(
    selected_slugs: list[str] | None = None,
    *,
    output_dir: Path = DEFAULT_SHOWCASE_DIR,
    engine_factory=MiniMaxMusicEngine,
) -> list[dict[str, object]]:
    blueprints = [
        bp for bp in SHOWCASE_BLUEPRINTS
        if not selected_slugs or str(bp['slug']) in selected_slugs
    ]
    if not blueprints:
        raise ValueError('No matching showcase blueprints selected')

    # Mandatory Step 0: 0-warning lint gate across every selected song before touching GPU
    for bp in blueprints:
        rep = audit_song_blueprint(str(bp['prompt']), str(bp['lyrics']))
        print(
            f"[lint-gate] {bp['slug']}: ok={rep['ok']} warnings={len(rep['warnings'])} "
            f"verse_avg={rep['verse_avg_syllables']} chorus_avg={rep['chorus_avg_syllables']}",
            flush=True,
        )
        if not rep['ok'] or rep['warnings']:
            raise RuntimeError(f"Blueprint {bp['slug']} failed zero-warning lint gate: {rep['warnings']}")

    if engine_factory is MiniMaxMusicEngine:
        ensure_mlx_runtime()

    output_dir = Path(output_dir).expanduser().resolve()
    output_dir.mkdir(parents=True, exist_ok=True)
    engine = engine_factory(DEFAULT_MODEL_ID, cache_root=DEFAULT_CACHE_ROOT, output_dir=output_dir, lazy_load=True)

    summaries = []
    for idx, bp in enumerate(blueprints, start=1):
        slug = str(bp['slug'])
        sections = build_showcase_sections(str(bp['lyrics']), dict(bp['sectionWeights']))
        lint_rep = audit_song_blueprint(str(bp['prompt']), str(bp['lyrics']))
        print(f"\n=== [{idx}/{len(blueprints)}] Generating {slug} ({bp['bpm']} BPM, {bp['key']}) ===", flush=True)

        with tempfile.TemporaryDirectory(prefix=f'{slug}-raw-') as tmp:
            raw_wav = Path(tmp) / f'{slug}.raw.wav'
            eos_flag = {'ended_by_eos': False}

            def on_progress(evt: dict[str, object]) -> None:
                stage = evt.get('stage')
                if stage == 'ar_done':
                    eos_flag['ended_by_eos'] = bool(evt.get('ended_by_eos', False))
                if stage in ('ar_start', 'ar_done') or (stage == 'ar_progress' and int(evt.get('frames', 0)) % 375 == 0) or (stage == 'dit_chunk' and int(evt.get('chunk', 0)) % 4 == 0):
                    print(f"  [{slug}] {json.dumps(evt, ensure_ascii=False)}", flush=True)

            gen_res = engine.generate(
                {
                    'prompt': bp['prompt'],
                    'lyrics': bp['lyrics'],
                    'duration': bp['duration'],
                    'steps': bp['steps'],
                    'seed': bp['seed'],
                    'temperature': bp['temperature'],
                    'ar_cfg_scale': bp['ar_cfg_scale'],
                    'ar_top_k': bp['ar_top_k'],
                    'dit_cfg_scale': bp['dit_cfg_scale'],
                    'output_path': str(raw_wav),
                    '_progress_cb': on_progress,
                },
                allow_any_output_path=True,
            )
            raw_acoustics = analyze_song_acoustics(raw_wav, sections)
            final_wav = output_dir / f'{slug}.wav'
            final_m4a = output_dir / f'{slug}.m4a'
            master_info = master_wav_and_encode_m4a(raw_wav, final_wav, final_m4a)

        acoustics = analyze_song_acoustics(final_wav, sections)
        meta = {
            'slug': slug,
            'order': bp['order'],
            'isBaseline': False,
            'genreIcon': bp['genreIcon'],
            'genreBadge': bp['genreBadge'],
            'title': bp['title'],
            'subtitle': bp['subtitle'],
            'motifSummary': bp['motifSummary'],
            'bpm': bp['bpm'],
            'key': bp['key'],
            'durationSeconds': acoustics['duration_seconds'],
            'endedByEos': eos_flag['ended_by_eos'],
            'integratedLufs': acoustics['integrated_lufs'],
            'rmsDbfs': acoustics['rms_dbfs'],
            'peakDbfs': acoustics['peak_dbfs'],
            'macroDynamicRangeDb': acoustics['macro_dynamic_range_db'],
            'chorusVsVerseDb': acoustics['chorus_vs_verse_db'],
            'stereoSideMidRatio': acoustics['stereo_side_mid_ratio'],
            'f0MedianHz': acoustics['f0_median_hz'],
            'pitchSpanSemitones': acoustics['pitch_span_semitones'],
            'rawRmsDbfs': raw_acoustics['rms_dbfs'],
            'sampleRate': acoustics['sample_rate'],
            'channels': acoustics['channels'],
            'wavBytes': master_info['wav_bytes'],
            'm4aBytes': master_info['m4a_bytes'],
            'masteringBackend': master_info['mastering_backend'],
            'masteringFilterChain': MASTERING_FILTER_CHAIN,
            'model': DEFAULT_MODEL_ID,
            'hyperparams': {
                'seed': bp['seed'],
                'steps': bp['steps'],
                'maxDurationSeconds': bp['duration'],
                'temperature': bp['temperature'],
                'arCfgScale': bp['ar_cfg_scale'],
                'arTopK': bp['ar_top_k'],
                'ditCfgScale': bp['dit_cfg_scale'],
            },
            'prosodyAudit': {
                'warnings': len(lint_rep['warnings']),
                'verseAvgSyllables': lint_rep['verse_avg_syllables'],
                'chorusAvgSyllables': lint_rep['chorus_avg_syllables'],
            },
            'elapsedSeconds': gen_res['elapsed_seconds'],
            'prompt': bp['prompt'],
            'lyrics': bp['lyrics'],
            'sections': sections,
        }
        (output_dir / f'{slug}.lyrics.txt').write_text(str(bp['lyrics']) + '\n', encoding='utf-8')
        (output_dir / f'{slug}.meta.json').write_text(json.dumps(meta, ensure_ascii=False, indent=2) + '\n', encoding='utf-8')
        print(
            f"[completed] {slug}: duration={acoustics['duration_seconds']}s | LUFS={acoustics['integrated_lufs']} | "
            f"ChorusLift={acoustics['chorus_vs_verse_db']}dB | MacroRange={acoustics['macro_dynamic_range_db']}dB | "
            f"PitchSpan={acoustics['pitch_span_semitones']}st | elapsed={gen_res['elapsed_seconds']}s",
            flush=True,
        )
        summaries.append(meta)
    return summaries


def main(argv: list[str] | None = None) -> int:
    parser = argparse.ArgumentParser(description=__doc__)
    parser.add_argument('--slug', action='append', dest='slugs', help='Render specific showcase slug(s); omit for all 5')
    parser.add_argument('--output-dir', type=Path, default=DEFAULT_SHOWCASE_DIR)
    parser.add_argument('--lint-only', action='store_true', help='Verify zero-warning lint gate for all blueprints')
    args = parser.parse_args(argv)
    if args.lint_only:
        reports = lint_all_blueprints()
        failed = False
        for rep in reports:
            ok = rep['ok'] and len(rep['warnings']) == 0
            failed = failed or (not ok)
            print(
                f"[{'PASS' if ok else 'WARN'}] {rep['slug']}: sections={rep['section_count']} "
                f"lines={rep['lyric_line_count']} verse_avg={rep['verse_avg_syllables']} "
                f"chorus_avg={rep['chorus_avg_syllables']} warnings={len(rep['warnings'])}",
                flush=True,
            )
            for w in rep['warnings']:
                print(f"  - {w['code']}: {w['message']}", file=sys.stderr, flush=True)
        return 2 if failed else 0
    render_showcase_suite(args.slugs, output_dir=args.output_dir)
    return 0


if __name__ == '__main__':
    raise SystemExit(main())
