-- Auto-generert UPSERT av sanger fra CSV
-- Generert: 2026-04-30T15:12:46.838Z
-- Krever unik constraint paa (title, voices):
-- Kjor en gang: supabase/add-songs-upsert-constraint.sql

INSERT INTO public.songs (title, nickname, voices, sequence, pitches, key_signature, tempo_bpm)
VALUES (
  'Vackra Kvarten',
  NULL,
  'TTBB',
  ARRAY['D','Bb','F','Bb'],
  '{"T1":"D","T2":"Bb","B1":"F","B2":"Bb"}'::jsonb,
  'Bb-dur',
  80
)
ON CONFLICT (title, voices) DO UPDATE
SET
  nickname = EXCLUDED.nickname,
  sequence = EXCLUDED.sequence,
  pitches = EXCLUDED.pitches,
  key_signature = EXCLUDED.key_signature,
  tempo_bpm = EXCLUDED.tempo_bpm,
  updated_at = now();

INSERT INTO public.songs (title, nickname, voices, sequence, pitches, key_signature, tempo_bpm)
VALUES (
  'Kvinten',
  NULL,
  'SATB',
  ARRAY['C','C','C','C'],
  '{"S":"C","A":"C","T":"C","B":"C"}'::jsonb,
  'f-moll',
  70
)
ON CONFLICT (title, voices) DO UPDATE
SET
  nickname = EXCLUDED.nickname,
  sequence = EXCLUDED.sequence,
  pitches = EXCLUDED.pitches,
  key_signature = EXCLUDED.key_signature,
  tempo_bpm = EXCLUDED.tempo_bpm,
  updated_at = now();

INSERT INTO public.songs (title, nickname, voices, sequence, pitches, key_signature, tempo_bpm)
VALUES (
  'Seksten',
  NULL,
  'SATB',
  ARRAY['F'],
  '{"A":"F"}'::jsonb,
  'Bb-dur',
  111
)
ON CONFLICT (title, voices) DO UPDATE
SET
  nickname = EXCLUDED.nickname,
  sequence = EXCLUDED.sequence,
  pitches = EXCLUDED.pitches,
  key_signature = EXCLUDED.key_signature,
  tempo_bpm = EXCLUDED.tempo_bpm,
  updated_at = now();

INSERT INTO public.songs (title, nickname, voices, sequence, pitches, key_signature, tempo_bpm)
VALUES (
  'Slutkör',
  NULL,
  'SATB',
  ARRAY['G','D','B','G'],
  '{"S":"G","A":"D","T":"B","B":"G"}'::jsonb,
  'e-moll',
  66
)
ON CONFLICT (title, voices) DO UPDATE
SET
  nickname = EXCLUDED.nickname,
  sequence = EXCLUDED.sequence,
  pitches = EXCLUDED.pitches,
  key_signature = EXCLUDED.key_signature,
  tempo_bpm = EXCLUDED.tempo_bpm,
  updated_at = now();

INSERT INTO public.songs (title, nickname, voices, sequence, pitches, key_signature, tempo_bpm)
VALUES (
  'Psildesangen',
  NULL,
  'SATB',
  ARRAY['G','D','Bb','G'],
  '{"S":"G","A":"D","T":"Bb","B":"G"}'::jsonb,
  'Bb-dur',
  60
)
ON CONFLICT (title, voices) DO UPDATE
SET
  nickname = EXCLUDED.nickname,
  sequence = EXCLUDED.sequence,
  pitches = EXCLUDED.pitches,
  key_signature = EXCLUDED.key_signature,
  tempo_bpm = EXCLUDED.tempo_bpm,
  updated_at = now();

INSERT INTO public.songs (title, nickname, voices, sequence, pitches, key_signature, tempo_bpm)
VALUES (
  'Aquaviten',
  'Ren som en jomfru og stærk som en bejler',
  'TTBB',
  ARRAY['D','B','G','G'],
  '{"T1":"D","T2":"B","B1":"G","B2":"G"}'::jsonb,
  'G-dur',
  120
)
ON CONFLICT (title, voices) DO UPDATE
SET
  nickname = EXCLUDED.nickname,
  sequence = EXCLUDED.sequence,
  pitches = EXCLUDED.pitches,
  key_signature = EXCLUDED.key_signature,
  tempo_bpm = EXCLUDED.tempo_bpm,
  updated_at = now();

INSERT INTO public.songs (title, nickname, voices, sequence, pitches, key_signature, tempo_bpm)
VALUES (
  'Brudemarsj fra Stavanger',
  'La di dam',
  'SATB',
  ARRAY['D','G'],
  '{"T":"D","B":"G"}'::jsonb,
  'G-dur',
  72
)
ON CONFLICT (title, voices) DO UPDATE
SET
  nickname = EXCLUDED.nickname,
  sequence = EXCLUDED.sequence,
  pitches = EXCLUDED.pitches,
  key_signature = EXCLUDED.key_signature,
  tempo_bpm = EXCLUDED.tempo_bpm,
  updated_at = now();

INSERT INTO public.songs (title, nickname, voices, sequence, pitches, key_signature, tempo_bpm)
VALUES (
  'Champagnegaloppen',
  'Når ditt humør er grått',
  'SATB',
  ARRAY['C','C','C','C'],
  '{"S":"C","A":"C","T":"C","B":"C"}'::jsonb,
  'C-dur',
  136
)
ON CONFLICT (title, voices) DO UPDATE
SET
  nickname = EXCLUDED.nickname,
  sequence = EXCLUDED.sequence,
  pitches = EXCLUDED.pitches,
  key_signature = EXCLUDED.key_signature,
  tempo_bpm = EXCLUDED.tempo_bpm,
  updated_at = now();

INSERT INTO public.songs (title, nickname, voices, sequence, pitches, key_signature, tempo_bpm)
VALUES (
  'Das Königslied',
  'Det var en gång en kung Ein køning ist der wein',
  'TTBB',
  ARRAY['A','A','A','A'],
  '{"T1":"A","T2":"A","B1":"A","B2":"A"}'::jsonb,
  'D-dur',
  120
)
ON CONFLICT (title, voices) DO UPDATE
SET
  nickname = EXCLUDED.nickname,
  sequence = EXCLUDED.sequence,
  pitches = EXCLUDED.pitches,
  key_signature = EXCLUDED.key_signature,
  tempo_bpm = EXCLUDED.tempo_bpm,
  updated_at = now();

INSERT INTO public.songs (title, nickname, voices, sequence, pitches, key_signature, tempo_bpm)
VALUES (
  'En øl i handa',
  'Livet er bra',
  'SATB',
  ARRAY['D','D','D','D'],
  '{"S":"D","A":"D","T":"D","B":"D"}'::jsonb,
  'G-dur',
  120
)
ON CONFLICT (title, voices) DO UPDATE
SET
  nickname = EXCLUDED.nickname,
  sequence = EXCLUDED.sequence,
  pitches = EXCLUDED.pitches,
  key_signature = EXCLUDED.key_signature,
  tempo_bpm = EXCLUDED.tempo_bpm,
  updated_at = now();

INSERT INTO public.songs (title, nickname, voices, sequence, pitches, key_signature, tempo_bpm)
VALUES (
  'Käraste bröder',
  'Kjæraste brøder Fredmans epistel nr. 9',
  'SATB',
  ARRAY['F','F','F','F'],
  '{"S":"F","A":"F","T":"F","B":"F"}'::jsonb,
  'F-dur',
  120
)
ON CONFLICT (title, voices) DO UPDATE
SET
  nickname = EXCLUDED.nickname,
  sequence = EXCLUDED.sequence,
  pitches = EXCLUDED.pitches,
  key_signature = EXCLUDED.key_signature,
  tempo_bpm = EXCLUDED.tempo_bpm,
  updated_at = now();

INSERT INTO public.songs (title, nickname, voices, sequence, pitches, key_signature, tempo_bpm)
VALUES (
  'Nå, ä nu all församlade her...',
  'Forsamlade Fredmans epistel nr. 13',
  'TTBB',
  ARRAY['F','A','A','F'],
  '{"T1":"F","T2":"A","B1":"A","B2":"F"}'::jsonb,
  'F-dur',
  67
)
ON CONFLICT (title, voices) DO UPDATE
SET
  nickname = EXCLUDED.nickname,
  sequence = EXCLUDED.sequence,
  pitches = EXCLUDED.pitches,
  key_signature = EXCLUDED.key_signature,
  tempo_bpm = EXCLUDED.tempo_bpm,
  updated_at = now();

INSERT INTO public.songs (title, nickname, voices, sequence, pitches, key_signature, tempo_bpm)
VALUES (
  'Bort alt vad oro gör',
  '(B.T.) nr. 17:',
  'SATB',
  ARRAY['C','C','C','C'],
  '{"S":"C","A":"C","T":"C","B":"C"}'::jsonb,
  'C-dur',
  88
)
ON CONFLICT (title, voices) DO UPDATE
SET
  nickname = EXCLUDED.nickname,
  sequence = EXCLUDED.sequence,
  pitches = EXCLUDED.pitches,
  key_signature = EXCLUDED.key_signature,
  tempo_bpm = EXCLUDED.tempo_bpm,
  updated_at = now();

INSERT INTO public.songs (title, nickname, voices, sequence, pitches, key_signature, tempo_bpm)
VALUES (
  'Gambrinus-visen',
  'Hva er som manna',
  'TTBB',
  ARRAY['G','G','G','G'],
  '{"T1":"G","T2":"G","B1":"G","B2":"G"}'::jsonb,
  'C-dur',
  130
)
ON CONFLICT (title, voices) DO UPDATE
SET
  nickname = EXCLUDED.nickname,
  sequence = EXCLUDED.sequence,
  pitches = EXCLUDED.pitches,
  key_signature = EXCLUDED.key_signature,
  tempo_bpm = EXCLUDED.tempo_bpm,
  updated_at = now();

INSERT INTO public.songs (title, nickname, voices, sequence, pitches, key_signature, tempo_bpm)
VALUES (
  'Gammelt øl',
  'Det var i gode gamle dager',
  'TTBB',
  ARRAY['A','A','A','A'],
  '{"T1":"A","T2":"A","B1":"A","B2":"A"}'::jsonb,
  'D-dur',
  120
)
ON CONFLICT (title, voices) DO UPDATE
SET
  nickname = EXCLUDED.nickname,
  sequence = EXCLUDED.sequence,
  pitches = EXCLUDED.pitches,
  key_signature = EXCLUDED.key_signature,
  tempo_bpm = EXCLUDED.tempo_bpm,
  updated_at = now();

INSERT INTO public.songs (title, nickname, voices, sequence, pitches, key_signature, tempo_bpm)
VALUES (
  'Gaudeamus Igitur',
  'De Brevitate Vitae',
  'SATB',
  ARRAY['Bb','F','D','Bb'],
  '{"S":"Bb","A":"F","T":"D","B":"Bb"}'::jsonb,
  'Bb-dur',
  80
)
ON CONFLICT (title, voices) DO UPDATE
SET
  nickname = EXCLUDED.nickname,
  sequence = EXCLUDED.sequence,
  pitches = EXCLUDED.pitches,
  key_signature = EXCLUDED.key_signature,
  tempo_bpm = EXCLUDED.tempo_bpm,
  updated_at = now();

INSERT INTO public.songs (title, nickname, voices, sequence, pitches, key_signature, tempo_bpm)
VALUES (
  'Husker du den drammen?',
  NULL,
  'SATB',
  ARRAY['A','E','C#','A'],
  '{"S":"A","A":"E","T":"C#","B":"A"}'::jsonb,
  'A-dur',
  120
)
ON CONFLICT (title, voices) DO UPDATE
SET
  nickname = EXCLUDED.nickname,
  sequence = EXCLUDED.sequence,
  pitches = EXCLUDED.pitches,
  key_signature = EXCLUDED.key_signature,
  tempo_bpm = EXCLUDED.tempo_bpm,
  updated_at = now();

INSERT INTO public.songs (title, nickname, voices, sequence, pitches, key_signature, tempo_bpm)
VALUES (
  'Ja, vi elsker',
  'Nasjonalsangen',
  'SATB',
  ARRAY['G','G','G','G'],
  '{"S":"G","A":"G","T":"G","B":"G"}'::jsonb,
  'C-dur',
  100
)
ON CONFLICT (title, voices) DO UPDATE
SET
  nickname = EXCLUDED.nickname,
  sequence = EXCLUDED.sequence,
  pitches = EXCLUDED.pitches,
  key_signature = EXCLUDED.key_signature,
  tempo_bpm = EXCLUDED.tempo_bpm,
  updated_at = now();

INSERT INTO public.songs (title, nickname, voices, sequence, pitches, key_signature, tempo_bpm)
VALUES (
  'Java Jive',
  NULL,
  'SATB',
  ARRAY['D','G'],
  '{"A":"D","B":"G"}'::jsonb,
  'G-dur',
  108
)
ON CONFLICT (title, voices) DO UPDATE
SET
  nickname = EXCLUDED.nickname,
  sequence = EXCLUDED.sequence,
  pitches = EXCLUDED.pitches,
  key_signature = EXCLUDED.key_signature,
  tempo_bpm = EXCLUDED.tempo_bpm,
  updated_at = now();

INSERT INTO public.songs (title, nickname, voices, sequence, pitches, key_signature, tempo_bpm)
VALUES (
  'Jubileumskantate',
  NULL,
  'TTBB',
  ARRAY['F','F','F','F'],
  '{"T1":"F","T2":"F","B1":"F","B2":"F"}'::jsonb,
  'F-dur',
  80
)
ON CONFLICT (title, voices) DO UPDATE
SET
  nickname = EXCLUDED.nickname,
  sequence = EXCLUDED.sequence,
  pitches = EXCLUDED.pitches,
  key_signature = EXCLUDED.key_signature,
  tempo_bpm = EXCLUDED.tempo_bpm,
  updated_at = now();

INSERT INTO public.songs (title, nickname, voices, sequence, pitches, key_signature, tempo_bpm)
VALUES (
  'Løft ditt glass mot sky',
  NULL,
  'SATB',
  ARRAY['C','G','E','C','C'],
  '{"S1":"C","S2":"G","A":"E","T":"C","B":"C"}'::jsonb,
  'C-dur',
  120
)
ON CONFLICT (title, voices) DO UPDATE
SET
  nickname = EXCLUDED.nickname,
  sequence = EXCLUDED.sequence,
  pitches = EXCLUDED.pitches,
  key_signature = EXCLUDED.key_signature,
  tempo_bpm = EXCLUDED.tempo_bpm,
  updated_at = now();

INSERT INTO public.songs (title, nickname, voices, sequence, pitches, key_signature, tempo_bpm)
VALUES (
  'Låt oss dricka en skål',
  NULL,
  'SATB',
  ARRAY['A','F','C','C','C'],
  '{"S1":"A","S2":"F","A":"C","T":"C","B":"C"}'::jsonb,
  'F-dur',
  80
)
ON CONFLICT (title, voices) DO UPDATE
SET
  nickname = EXCLUDED.nickname,
  sequence = EXCLUDED.sequence,
  pitches = EXCLUDED.pitches,
  key_signature = EXCLUDED.key_signature,
  tempo_bpm = EXCLUDED.tempo_bpm,
  updated_at = now();

INSERT INTO public.songs (title, nickname, voices, sequence, pitches, key_signature, tempo_bpm)
VALUES (
  'Masurka',
  NULL,
  'SATB',
  ARRAY['E','E','B','E'],
  '{"S":"E","A":"E","T":"B","B":"E"}'::jsonb,
  'e-moll',
  126
)
ON CONFLICT (title, voices) DO UPDATE
SET
  nickname = EXCLUDED.nickname,
  sequence = EXCLUDED.sequence,
  pitches = EXCLUDED.pitches,
  key_signature = EXCLUDED.key_signature,
  tempo_bpm = EXCLUDED.tempo_bpm,
  updated_at = now();

INSERT INTO public.songs (title, nickname, voices, sequence, pitches, key_signature, tempo_bpm)
VALUES (
  'Metsämiehen juomalaulu',
  NULL,
  'TTBB',
  ARRAY['A','A','A','A'],
  '{"T1":"A","T2":"A","B1":"A","B2":"A"}'::jsonb,
  'A-dur',
  90
)
ON CONFLICT (title, voices) DO UPDATE
SET
  nickname = EXCLUDED.nickname,
  sequence = EXCLUDED.sequence,
  pitches = EXCLUDED.pitches,
  key_signature = EXCLUDED.key_signature,
  tempo_bpm = EXCLUDED.tempo_bpm,
  updated_at = now();

INSERT INTO public.songs (title, nickname, voices, sequence, pitches, key_signature, tempo_bpm)
VALUES (
  'Naar Fjordene blaaner',
  NULL,
  'SATB',
  ARRAY['Bb','Eb','G','EB'],
  '{"S":"Bb","A":"Eb","T":"G","B":"EB"}'::jsonb,
  'Eb-dur',
  80
)
ON CONFLICT (title, voices) DO UPDATE
SET
  nickname = EXCLUDED.nickname,
  sequence = EXCLUDED.sequence,
  pitches = EXCLUDED.pitches,
  key_signature = EXCLUDED.key_signature,
  tempo_bpm = EXCLUDED.tempo_bpm,
  updated_at = now();

INSERT INTO public.songs (title, nickname, voices, sequence, pitches, key_signature, tempo_bpm)
VALUES (
  'Punschen',
  NULL,
  'SATB',
  ARRAY['A','A','A'],
  '{"S":"A","B1":"A","B2":"A"}'::jsonb,
  'A-dur',
  120
)
ON CONFLICT (title, voices) DO UPDATE
SET
  nickname = EXCLUDED.nickname,
  sequence = EXCLUDED.sequence,
  pitches = EXCLUDED.pitches,
  key_signature = EXCLUDED.key_signature,
  tempo_bpm = EXCLUDED.tempo_bpm,
  updated_at = now();

INSERT INTO public.songs (title, nickname, voices, sequence, pitches, key_signature, tempo_bpm)
VALUES (
  'Rum and Coca-Cola',
  NULL,
  'SATB',
  ARRAY['F'],
  '{"B":"F"}'::jsonb,
  'F-dur',
  170
)
ON CONFLICT (title, voices) DO UPDATE
SET
  nickname = EXCLUDED.nickname,
  sequence = EXCLUDED.sequence,
  pitches = EXCLUDED.pitches,
  key_signature = EXCLUDED.key_signature,
  tempo_bpm = EXCLUDED.tempo_bpm,
  updated_at = now();

INSERT INTO public.songs (title, nickname, voices, sequence, pitches, key_signature, tempo_bpm)
VALUES (
  'Sangerhilsen',
  NULL,
  'TTBB',
  ARRAY['A','A','A','A'],
  '{"T1":"A","T2":"A","B1":"A","B2":"A"}'::jsonb,
  'A-dur',
  126
)
ON CONFLICT (title, voices) DO UPDATE
SET
  nickname = EXCLUDED.nickname,
  sequence = EXCLUDED.sequence,
  pitches = EXCLUDED.pitches,
  key_signature = EXCLUDED.key_signature,
  tempo_bpm = EXCLUDED.tempo_bpm,
  updated_at = now();

INSERT INTO public.songs (title, nickname, voices, sequence, pitches, key_signature, tempo_bpm)
VALUES (
  'Skänklåt',
  NULL,
  'TTBB',
  ARRAY['G','G','G','G'],
  '{"T1":"G","T2":"G","B1":"G","B2":"G"}'::jsonb,
  'c-moll',
  150
)
ON CONFLICT (title, voices) DO UPDATE
SET
  nickname = EXCLUDED.nickname,
  sequence = EXCLUDED.sequence,
  pitches = EXCLUDED.pitches,
  key_signature = EXCLUDED.key_signature,
  tempo_bpm = EXCLUDED.tempo_bpm,
  updated_at = now();

INSERT INTO public.songs (title, nickname, voices, sequence, pitches, key_signature, tempo_bpm)
VALUES (
  'Stormfokken',
  NULL,
  'SATB',
  ARRAY['D','D','D','A'],
  '{"S":"D","A":"D","T":"D","B":"A"}'::jsonb,
  'D-dur',
  120
)
ON CONFLICT (title, voices) DO UPDATE
SET
  nickname = EXCLUDED.nickname,
  sequence = EXCLUDED.sequence,
  pitches = EXCLUDED.pitches,
  key_signature = EXCLUDED.key_signature,
  tempo_bpm = EXCLUDED.tempo_bpm,
  updated_at = now();

INSERT INTO public.songs (title, nickname, voices, sequence, pitches, key_signature, tempo_bpm)
VALUES (
  'Studentsång',
  NULL,
  'SATB',
  ARRAY['E','C','G','C'],
  '{"S":"E","A":"C","T":"G","B":"C"}'::jsonb,
  'C-dur',
  120
)
ON CONFLICT (title, voices) DO UPDATE
SET
  nickname = EXCLUDED.nickname,
  sequence = EXCLUDED.sequence,
  pitches = EXCLUDED.pitches,
  key_signature = EXCLUDED.key_signature,
  tempo_bpm = EXCLUDED.tempo_bpm,
  updated_at = now();

INSERT INTO public.songs (title, nickname, voices, sequence, pitches, key_signature, tempo_bpm)
VALUES (
  'Till Österland',
  NULL,
  'TTBB',
  ARRAY['F#','F#','F#','F#'],
  '{"T1":"F#","T2":"F#","B1":"F#","B2":"F#"}'::jsonb,
  'h-moll',
  80
)
ON CONFLICT (title, voices) DO UPDATE
SET
  nickname = EXCLUDED.nickname,
  sequence = EXCLUDED.sequence,
  pitches = EXCLUDED.pitches,
  key_signature = EXCLUDED.key_signature,
  tempo_bpm = EXCLUDED.tempo_bpm,
  updated_at = now();

INSERT INTO public.songs (title, nickname, voices, sequence, pitches, key_signature, tempo_bpm)
VALUES (
  'Tourdion',
  'By von bjen buvons bien',
  'SATB',
  ARRAY['E','B','G','E'],
  '{"S":"E","A":"B","T":"G","B":"E"}'::jsonb,
  'e-moll',
  120
)
ON CONFLICT (title, voices) DO UPDATE
SET
  nickname = EXCLUDED.nickname,
  sequence = EXCLUDED.sequence,
  pitches = EXCLUDED.pitches,
  key_signature = EXCLUDED.key_signature,
  tempo_bpm = EXCLUDED.tempo_bpm,
  updated_at = now();

INSERT INTO public.songs (title, nickname, voices, sequence, pitches, key_signature, tempo_bpm)
VALUES (
  'Trilo',
  NULL,
  'SATB',
  ARRAY['A','A','D'],
  '{"S":"A","T":"A","B":"D"}'::jsonb,
  'G-dur',
  120
)
ON CONFLICT (title, voices) DO UPDATE
SET
  nickname = EXCLUDED.nickname,
  sequence = EXCLUDED.sequence,
  pitches = EXCLUDED.pitches,
  key_signature = EXCLUDED.key_signature,
  tempo_bpm = EXCLUDED.tempo_bpm,
  updated_at = now();

INSERT INTO public.songs (title, nickname, voices, sequence, pitches, key_signature, tempo_bpm)
VALUES (
  'Vals',
  NULL,
  'TTBB',
  ARRAY['F','F','F','F'],
  '{"T1":"F","T2":"F","B1":"F","B2":"F"}'::jsonb,
  'F-dur',
  60
)
ON CONFLICT (title, voices) DO UPDATE
SET
  nickname = EXCLUDED.nickname,
  sequence = EXCLUDED.sequence,
  pitches = EXCLUDED.pitches,
  key_signature = EXCLUDED.key_signature,
  tempo_bpm = EXCLUDED.tempo_bpm,
  updated_at = now();

INSERT INTO public.songs (title, nickname, voices, sequence, pitches, key_signature, tempo_bpm)
VALUES (
  'Ölvisa',
  'Tuborg Carlsberg',
  'TTBB',
  ARRAY['D','G','C','G'],
  '{"T1":"D","T2":"G","B1":"C","B2":"G"}'::jsonb,
  'G-dur',
  60
)
ON CONFLICT (title, voices) DO UPDATE
SET
  nickname = EXCLUDED.nickname,
  sequence = EXCLUDED.sequence,
  pitches = EXCLUDED.pitches,
  key_signature = EXCLUDED.key_signature,
  tempo_bpm = EXCLUDED.tempo_bpm,
  updated_at = now();

INSERT INTO public.songs (title, nickname, voices, sequence, pitches, key_signature, tempo_bpm)
VALUES (
  'Århus Tappenstreg',
  NULL,
  'SATB',
  ARRAY['Bb','Bb','Bb','Bb'],
  '{"S":"Bb","A":"Bb","T":"Bb","B":"Bb"}'::jsonb,
  'Eb-dur',
  120
)
ON CONFLICT (title, voices) DO UPDATE
SET
  nickname = EXCLUDED.nickname,
  sequence = EXCLUDED.sequence,
  pitches = EXCLUDED.pitches,
  key_signature = EXCLUDED.key_signature,
  tempo_bpm = EXCLUDED.tempo_bpm,
  updated_at = now();

INSERT INTO public.songs (title, nickname, voices, sequence, pitches, key_signature, tempo_bpm)
VALUES (
  'Åsta-valsen',
  NULL,
  'SATB',
  ARRAY['G','B','D','B'],
  '{"S":"G","A":"B","T":"D","B":"B"}'::jsonb,
  'G-dur',
  110
)
ON CONFLICT (title, voices) DO UPDATE
SET
  nickname = EXCLUDED.nickname,
  sequence = EXCLUDED.sequence,
  pitches = EXCLUDED.pitches,
  key_signature = EXCLUDED.key_signature,
  tempo_bpm = EXCLUDED.tempo_bpm,
  updated_at = now();

INSERT INTO public.songs (title, nickname, voices, sequence, pitches, key_signature, tempo_bpm)
VALUES (
  'Bæ, bæ, lille lam',
  NULL,
  'SMA',
  ARRAY['C'],
  '{"S":"C"}'::jsonb,
  'F-dur',
  160
)
ON CONFLICT (title, voices) DO UPDATE
SET
  nickname = EXCLUDED.nickname,
  sequence = EXCLUDED.sequence,
  pitches = EXCLUDED.pitches,
  key_signature = EXCLUDED.key_signature,
  tempo_bpm = EXCLUDED.tempo_bpm,
  updated_at = now();

INSERT INTO public.songs (title, nickname, voices, sequence, pitches, key_signature, tempo_bpm)
VALUES (
  'Drikkevise',
  NULL,
  'SMA',
  ARRAY['G','D','G'],
  '{"S":"G","M":"D","A":"G"}'::jsonb,
  'Bb-dur',
  120
)
ON CONFLICT (title, voices) DO UPDATE
SET
  nickname = EXCLUDED.nickname,
  sequence = EXCLUDED.sequence,
  pitches = EXCLUDED.pitches,
  key_signature = EXCLUDED.key_signature,
  tempo_bpm = EXCLUDED.tempo_bpm,
  updated_at = now();

INSERT INTO public.songs (title, nickname, voices, sequence, pitches, key_signature, tempo_bpm)
VALUES (
  'Eg aktar inkje mykje hine gutan',
  NULL,
  'SMA',
  ARRAY['D','D','D'],
  '{"S":"D","M":"D","A":"D"}'::jsonb,
  'G-dur',
  120
)
ON CONFLICT (title, voices) DO UPDATE
SET
  nickname = EXCLUDED.nickname,
  sequence = EXCLUDED.sequence,
  pitches = EXCLUDED.pitches,
  key_signature = EXCLUDED.key_signature,
  tempo_bpm = EXCLUDED.tempo_bpm,
  updated_at = now();

INSERT INTO public.songs (title, nickname, voices, sequence, pitches, key_signature, tempo_bpm)
VALUES (
  'En blygsam kärleksförklaring',
  NULL,
  'SSAA',
  ARRAY['D','D','D','D'],
  '{"S1":"D","S2":"D","A1":"D","A2":"D"}'::jsonb,
  'F-dur',
  70
)
ON CONFLICT (title, voices) DO UPDATE
SET
  nickname = EXCLUDED.nickname,
  sequence = EXCLUDED.sequence,
  pitches = EXCLUDED.pitches,
  key_signature = EXCLUDED.key_signature,
  tempo_bpm = EXCLUDED.tempo_bpm,
  updated_at = now();

INSERT INTO public.songs (title, nickname, voices, sequence, pitches, key_signature, tempo_bpm)
VALUES (
  'Giftasvisan',
  NULL,
  'SSAA',
  ARRAY['Bb','Bb','Bb','Bb'],
  '{"S1":"Bb","S2":"Bb","A1":"Bb","A2":"Bb"}'::jsonb,
  'Bb-dur',
  80
)
ON CONFLICT (title, voices) DO UPDATE
SET
  nickname = EXCLUDED.nickname,
  sequence = EXCLUDED.sequence,
  pitches = EXCLUDED.pitches,
  key_signature = EXCLUDED.key_signature,
  tempo_bpm = EXCLUDED.tempo_bpm,
  updated_at = now();

INSERT INTO public.songs (title, nickname, voices, sequence, pitches, key_signature, tempo_bpm)
VALUES (
  'Honung',
  NULL,
  'SSAA',
  ARRAY['C','A','C','F'],
  '{"S1":"C","S2":"A","A1":"C","A2":"F"}'::jsonb,
  'F-dur',
  100
)
ON CONFLICT (title, voices) DO UPDATE
SET
  nickname = EXCLUDED.nickname,
  sequence = EXCLUDED.sequence,
  pitches = EXCLUDED.pitches,
  key_signature = EXCLUDED.key_signature,
  tempo_bpm = EXCLUDED.tempo_bpm,
  updated_at = now();

INSERT INTO public.songs (title, nickname, voices, sequence, pitches, key_signature, tempo_bpm)
VALUES (
  'It’s Raining Men',
  NULL,
  'SSAA',
  ARRAY['F','F','F','F'],
  '{"S1":"F","S2":"F","A1":"F","A2":"F"}'::jsonb,
  'A-dur',
  135
)
ON CONFLICT (title, voices) DO UPDATE
SET
  nickname = EXCLUDED.nickname,
  sequence = EXCLUDED.sequence,
  pitches = EXCLUDED.pitches,
  key_signature = EXCLUDED.key_signature,
  tempo_bpm = EXCLUDED.tempo_bpm,
  updated_at = now();

INSERT INTO public.songs (title, nickname, voices, sequence, pitches, key_signature, tempo_bpm)
VALUES (
  'Vem styrde hit din väg?',
  NULL,
  'SSAA',
  ARRAY['A','E','A','A'],
  '{"S1":"A","S2":"E","A1":"A","A2":"A"}'::jsonb,
  'A-dur',
  122
)
ON CONFLICT (title, voices) DO UPDATE
SET
  nickname = EXCLUDED.nickname,
  sequence = EXCLUDED.sequence,
  pitches = EXCLUDED.pitches,
  key_signature = EXCLUDED.key_signature,
  tempo_bpm = EXCLUDED.tempo_bpm,
  updated_at = now();

INSERT INTO public.songs (title, nickname, voices, sequence, pitches, key_signature, tempo_bpm)
VALUES (
  'Harvoin mä ryypyn saan',
  NULL,
  'TTBB',
  ARRAY['A'],
  '{"B2":"A"}'::jsonb,
  'a-moll',
  120
)
ON CONFLICT (title, voices) DO UPDATE
SET
  nickname = EXCLUDED.nickname,
  sequence = EXCLUDED.sequence,
  pitches = EXCLUDED.pitches,
  key_signature = EXCLUDED.key_signature,
  tempo_bpm = EXCLUDED.tempo_bpm,
  updated_at = now();

INSERT INTO public.songs (title, nickname, voices, sequence, pitches, key_signature, tempo_bpm)
VALUES (
  'Hej, dunkom, så länge vi levom',
  NULL,
  'TTBB',
  ARRAY['G','E','C','A'],
  '{"T1":"G","T2":"E","B1":"C","B2":"A"}'::jsonb,
  'a-moll',
  120
)
ON CONFLICT (title, voices) DO UPDATE
SET
  nickname = EXCLUDED.nickname,
  sequence = EXCLUDED.sequence,
  pitches = EXCLUDED.pitches,
  key_signature = EXCLUDED.key_signature,
  tempo_bpm = EXCLUDED.tempo_bpm,
  updated_at = now();

INSERT INTO public.songs (title, nickname, voices, sequence, pitches, key_signature, tempo_bpm)
VALUES (
  'Jag vet en dejlig rosa',
  NULL,
  'TTBB',
  ARRAY['D','B','G','G'],
  '{"T1":"D","T2":"B","B1":"G","B2":"G"}'::jsonb,
  'c-moll',
  120
)
ON CONFLICT (title, voices) DO UPDATE
SET
  nickname = EXCLUDED.nickname,
  sequence = EXCLUDED.sequence,
  pitches = EXCLUDED.pitches,
  key_signature = EXCLUDED.key_signature,
  tempo_bpm = EXCLUDED.tempo_bpm,
  updated_at = now();

INSERT INTO public.songs (title, nickname, voices, sequence, pitches, key_signature, tempo_bpm)
VALUES (
  'Kristallen',
  NULL,
  'TTBB',
  ARRAY['A','A','A','A'],
  '{"T1":"A","T2":"A","B1":"A","B2":"A"}'::jsonb,
  'a-moll',
  120
)
ON CONFLICT (title, voices) DO UPDATE
SET
  nickname = EXCLUDED.nickname,
  sequence = EXCLUDED.sequence,
  pitches = EXCLUDED.pitches,
  key_signature = EXCLUDED.key_signature,
  tempo_bpm = EXCLUDED.tempo_bpm,
  updated_at = now();

INSERT INTO public.songs (title, nickname, voices, sequence, pitches, key_signature, tempo_bpm)
VALUES (
  'Madrigal',
  NULL,
  'TTBB',
  ARRAY['Db','Ab','F','Db'],
  '{"T1":"Db","T2":"Ab","B1":"F","B2":"Db"}'::jsonb,
  'Dd-dur',
  110
)
ON CONFLICT (title, voices) DO UPDATE
SET
  nickname = EXCLUDED.nickname,
  sequence = EXCLUDED.sequence,
  pitches = EXCLUDED.pitches,
  key_signature = EXCLUDED.key_signature,
  tempo_bpm = EXCLUDED.tempo_bpm,
  updated_at = now();

INSERT INTO public.songs (title, nickname, voices, sequence, pitches, key_signature, tempo_bpm)
VALUES (
  'Norges Fjelde',
  NULL,
  'TTBB',
  ARRAY['F#','F#','F#','F#'],
  '{"T1":"F#","T2":"F#","B1":"F#","B2":"F#"}'::jsonb,
  'D-dur',
  58
)
ON CONFLICT (title, voices) DO UPDATE
SET
  nickname = EXCLUDED.nickname,
  sequence = EXCLUDED.sequence,
  pitches = EXCLUDED.pitches,
  key_signature = EXCLUDED.key_signature,
  tempo_bpm = EXCLUDED.tempo_bpm,
  updated_at = now();

INSERT INTO public.songs (title, nickname, voices, sequence, pitches, key_signature, tempo_bpm)
VALUES (
  'Olaf Trygvason',
  NULL,
  'TTBB',
  ARRAY['C','C','C','C'],
  '{"T1":"C","T2":"C","B1":"C","B2":"C"}'::jsonb,
  'f-moll',
  120
)
ON CONFLICT (title, voices) DO UPDATE
SET
  nickname = EXCLUDED.nickname,
  sequence = EXCLUDED.sequence,
  pitches = EXCLUDED.pitches,
  key_signature = EXCLUDED.key_signature,
  tempo_bpm = EXCLUDED.tempo_bpm,
  updated_at = now();

INSERT INTO public.songs (title, nickname, voices, sequence, pitches, key_signature, tempo_bpm)
VALUES (
  'Sit on My Face',
  NULL,
  'TTBB',
  ARRAY['C','C','A','F'],
  '{"T1":"C","T2":"C","B1":"A","B2":"F"}'::jsonb,
  'F-dur',
  120
)
ON CONFLICT (title, voices) DO UPDATE
SET
  nickname = EXCLUDED.nickname,
  sequence = EXCLUDED.sequence,
  pitches = EXCLUDED.pitches,
  key_signature = EXCLUDED.key_signature,
  tempo_bpm = EXCLUDED.tempo_bpm,
  updated_at = now();

