-- Auto-generert import av sanger fra CSV
-- Generert: 2026-04-28T22:22:19.425Z

INSERT INTO public.songs (title, voices, sequence, pitches, key_signature, tempo_bpm)
VALUES (
  'Akademisk bordvers',
  'Unison',
  ARRAY['C'],
  '{"S":"C","A":"C","T":"C","B":"C"}'::jsonb,
  'F-dur',
  180
);

INSERT INTO public.songs (title, voices, sequence, pitches, key_signature, tempo_bpm)
VALUES (
  'Helan',
  'SATB',
  ARRAY['A','F','A','F'],
  '{"S":"A","A":"F","T":"A","B":"F"}'::jsonb,
  'F-dur',
  135
);

INSERT INTO public.songs (title, voices, sequence, pitches, key_signature, tempo_bpm)
VALUES (
  'Helan går',
  'TTBB',
  ARRAY['A','A','A','A'],
  '{"T":"A","B":"A"}'::jsonb,
  'F-dur',
  120
);

INSERT INTO public.songs (title, voices, sequence, pitches, key_signature, tempo_bpm)
VALUES (
  'Halvan',
  'SATB',
  ARRAY['Eb'],
  '{"S":"Eb","A":"Eb","T":"Eb","B":"Eb"}'::jsonb,
  'Eb-dur',
  100
);

INSERT INTO public.songs (title, voices, sequence, pitches, key_signature, tempo_bpm)
VALUES (
  'Tersen',
  'TTBB',
  ARRAY['D','D','D','D'],
  '{"T":"D","B":"D"}'::jsonb,
  'Bb-dur',
  100
);

INSERT INTO public.songs (title, voices, sequence, pitches, key_signature, tempo_bpm)
VALUES (
  'Finsk snapsvise',
  'TTBB',
  ARRAY['G','G','G','G'],
  '{"T":"G","B":"G"}'::jsonb,
  'c-moll',
  60
);

INSERT INTO public.songs (title, voices, sequence, pitches, key_signature, tempo_bpm)
VALUES (
  'Kvarten',
  'TTBB',
  ARRAY['C'],
  '{"T":"C","B":"C"}'::jsonb,
  'C-dur',
  120
);

