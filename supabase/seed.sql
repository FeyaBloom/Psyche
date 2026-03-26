-- Psyche seed data for Supabase
-- Run in Supabase SQL Editor.

begin;

alter table if exists public.content_types
  add column if not exists cover_url text;

alter table if exists public.topics
  add column if not exists cover_url text;

alter table if exists public.sessions
  add column if not exists cover_url text;

insert into public.content_types (id, slug, order_index, cover_url, translations)
values
  (
    '11111111-1111-1111-1111-111111111111',
    'calm',
    1,
    'https://picsum.photos/seed/calm-category/1200/800',
    '{
      "ru": {"title": "Спокойствие", "description": "Снижение тревоги и мягкое расслабление"},
      "en": {"title": "Calm", "description": "Reduce anxiety and settle your mind"},
      "es": {"title": "Calma", "description": "Reduce la ansiedad y relaja la mente"},
      "ca": {"title": "Calma", "description": "Redueix l''ansietat i relaxa la ment"}
    }'::jsonb
  ),
  (
    '22222222-2222-2222-2222-222222222222',
    'focus',
    2,
    'https://picsum.photos/seed/focus-category/1200/800',
    '{
      "ru": {"title": "Фокус", "description": "Концентрация и ясное внимание"},
      "en": {"title": "Focus", "description": "Concentration and clear attention"},
      "es": {"title": "Enfoque", "description": "Concentracion y atencion clara"},
      "ca": {"title": "Focus", "description": "Concentracio i atencio clara"}
    }'::jsonb
  ),
  (
    '33333333-3333-3333-3333-333333333333',
    'sleep',
    3,
    'https://picsum.photos/seed/sleep-category/1200/800',
    '{
      "ru": {"title": "Сон", "description": "Подготовка ко сну и восстановление"},
      "en": {"title": "Sleep", "description": "Wind down and prepare for sleep"},
      "es": {"title": "Sueno", "description": "Desacelera y preparate para dormir"},
      "ca": {"title": "Son", "description": "Baixa el ritme i prepara''t per dormir"}
    }'::jsonb
  )
on conflict (id) do update
set
  slug = excluded.slug,
  order_index = excluded.order_index,
  cover_url = excluded.cover_url,
  translations = excluded.translations;

insert into public.topics (id, content_type_id, slug, order_index, cover_url, translations)
values
  (
    'aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaa1',
    '11111111-1111-1111-1111-111111111111',
    'anti-stress-breathing',
    1,
    'https://picsum.photos/seed/topic-anti-stress/1200/800',
    '{
      "ru": {"title": "Антистресс дыхание", "description": "Короткие дыхательные практики для быстрого успокоения"},
      "en": {"title": "Anti-stress breathing", "description": "Short breathing practices for quick calm"},
      "es": {"title": "Respiracion antiestrés", "description": "Practicas cortas para recuperar la calma"},
      "ca": {"title": "Respiracio antiestrès", "description": "Practiques curtes per recuperar la calma"}
    }'::jsonb
  ),
  (
    'aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaa2',
    '11111111-1111-1111-1111-111111111111',
    'body-relax',
    2,
    'https://picsum.photos/seed/topic-body-relax/1200/800',
    '{
      "ru": {"title": "Расслабление тела", "description": "Снятие напряжения и мягкая перезагрузка"},
      "en": {"title": "Body relaxation", "description": "Release tension and reset gently"},
      "es": {"title": "Relajacion corporal", "description": "Suelta la tension y reinicia suavemente"},
      "ca": {"title": "Relaxacio corporal", "description": "Allibera la tensio i reinicia suaument"}
    }'::jsonb
  ),
  (
    'aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaa3',
    '22222222-2222-2222-2222-222222222222',
    'deep-work',
    3,
    'https://picsum.photos/seed/topic-deep-work/1200/800',
    '{
      "ru": {"title": "Глубокая работа", "description": "Настройка на долгую концентрацию"},
      "en": {"title": "Deep work", "description": "Get into long-form concentration"},
      "es": {"title": "Trabajo profundo", "description": "Entra en concentracion prolongada"},
      "ca": {"title": "Treball profund", "description": "Entra en concentracio prolongada"}
    }'::jsonb
  ),
  (
    'aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaa4',
    '22222222-2222-2222-2222-222222222222',
    'morning-focus',
    4,
    'https://picsum.photos/seed/topic-morning-focus/1200/800',
    '{
      "ru": {"title": "Утренний фокус", "description": "Собранность и энергия в начале дня"},
      "en": {"title": "Morning focus", "description": "Clarity and energy at the start of day"},
      "es": {"title": "Enfoque matutino", "description": "Claridad y energia para empezar el dia"},
      "ca": {"title": "Focus matinal", "description": "Claredat i energia per començar el dia"}
    }'::jsonb
  ),
  (
    'aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaa5',
    '33333333-3333-3333-3333-333333333333',
    'sleep-fast',
    5,
    'https://picsum.photos/seed/topic-sleep-fast/1200/800',
    '{
      "ru": {"title": "Быстро уснуть", "description": "Практики для мягкого засыпания"},
      "en": {"title": "Fall asleep fast", "description": "Gentle practices to drift into sleep"},
      "es": {"title": "Dormir rapido", "description": "Practicas suaves para quedarte dormido"},
      "ca": {"title": "Dormir rapid", "description": "Practiques suaus per adormir-te"}
    }'::jsonb
  ),
  (
    'aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaa6',
    '33333333-3333-3333-3333-333333333333',
    'night-reset',
    6,
    'https://picsum.photos/seed/topic-night-reset/1200/800',
    '{
      "ru": {"title": "Ночной ресет", "description": "Снять умственный шум перед сном"},
      "en": {"title": "Night reset", "description": "Clear mental noise before bedtime"},
      "es": {"title": "Reinicio nocturno", "description": "Limpia el ruido mental antes de dormir"},
      "ca": {"title": "Reinici nocturn", "description": "Neteja el soroll mental abans de dormir"}
    }'::jsonb
  )
on conflict (id) do update
set
  content_type_id = excluded.content_type_id,
  slug = excluded.slug,
  order_index = excluded.order_index,
  cover_url = excluded.cover_url,
  translations = excluded.translations;

insert into public.sessions (id, topic_id, order_index, duration, cover_url, translations)
values
  (
    'bbbbbbbb-bbbb-bbbb-bbbb-bbbbbbbbb001',
    'aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaa1',
    1,
    420,
    'https://picsum.photos/seed/session-001/600/600',
    '{"ru":{"title":"Дыхание 4-6","audio_url":"https://www.soundhelix.com/examples/mp3/SoundHelix-Song-1.mp3"},"en":{"title":"Breathing 4-6","audio_url":"https://www.soundhelix.com/examples/mp3/SoundHelix-Song-1.mp3"},"es":{"title":"Respiracion 4-6","audio_url":"https://www.soundhelix.com/examples/mp3/SoundHelix-Song-1.mp3"},"ca":{"title":"Respiracio 4-6","audio_url":"https://www.soundhelix.com/examples/mp3/SoundHelix-Song-1.mp3"}}'::jsonb
  ),
  (
    'bbbbbbbb-bbbb-bbbb-bbbb-bbbbbbbbb002',
    'aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaa1',
    2,
    600,
    'https://picsum.photos/seed/session-002/600/600',
    '{"ru":{"title":"Сброс тревоги","audio_url":"https://www.soundhelix.com/examples/mp3/SoundHelix-Song-2.mp3"},"en":{"title":"Anxiety reset","audio_url":"https://www.soundhelix.com/examples/mp3/SoundHelix-Song-2.mp3"},"es":{"title":"Reinicio de ansiedad","audio_url":"https://www.soundhelix.com/examples/mp3/SoundHelix-Song-2.mp3"},"ca":{"title":"Reinici d''ansietat","audio_url":"https://www.soundhelix.com/examples/mp3/SoundHelix-Song-2.mp3"}}'::jsonb
  ),
  (
    'bbbbbbbb-bbbb-bbbb-bbbb-bbbbbbbbb003',
    'aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaa2',
    1,
    540,
    'https://picsum.photos/seed/session-003/600/600',
    '{"ru":{"title":"Сканирование тела","audio_url":"https://www.soundhelix.com/examples/mp3/SoundHelix-Song-3.mp3"},"en":{"title":"Body scan","audio_url":"https://www.soundhelix.com/examples/mp3/SoundHelix-Song-3.mp3"},"es":{"title":"Escaneo corporal","audio_url":"https://www.soundhelix.com/examples/mp3/SoundHelix-Song-3.mp3"},"ca":{"title":"Escaneig corporal","audio_url":"https://www.soundhelix.com/examples/mp3/SoundHelix-Song-3.mp3"}}'::jsonb
  ),
  (
    'bbbbbbbb-bbbb-bbbb-bbbb-bbbbbbbbb004',
    'aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaa2',
    2,
    720,
    'https://picsum.photos/seed/session-004/600/600',
    '{"ru":{"title":"Плечи и шея","audio_url":"https://www.soundhelix.com/examples/mp3/SoundHelix-Song-4.mp3"},"en":{"title":"Shoulders and neck","audio_url":"https://www.soundhelix.com/examples/mp3/SoundHelix-Song-4.mp3"},"es":{"title":"Hombros y cuello","audio_url":"https://www.soundhelix.com/examples/mp3/SoundHelix-Song-4.mp3"},"ca":{"title":"Espatlles i coll","audio_url":"https://www.soundhelix.com/examples/mp3/SoundHelix-Song-4.mp3"}}'::jsonb
  ),
  (
    'bbbbbbbb-bbbb-bbbb-bbbb-bbbbbbbbb005',
    'aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaa3',
    1,
    900,
    'https://picsum.photos/seed/session-005/600/600',
    '{"ru":{"title":"Фокус 15 минут","audio_url":"https://www.soundhelix.com/examples/mp3/SoundHelix-Song-5.mp3"},"en":{"title":"15-minute focus","audio_url":"https://www.soundhelix.com/examples/mp3/SoundHelix-Song-5.mp3"},"es":{"title":"Enfoque 15 minutos","audio_url":"https://www.soundhelix.com/examples/mp3/SoundHelix-Song-5.mp3"},"ca":{"title":"Focus 15 minuts","audio_url":"https://www.soundhelix.com/examples/mp3/SoundHelix-Song-5.mp3"}}'::jsonb
  ),
  (
    'bbbbbbbb-bbbb-bbbb-bbbb-bbbbbbbbb006',
    'aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaa3',
    2,
    1200,
    'https://picsum.photos/seed/session-006/600/600',
    '{"ru":{"title":"Антипрокрастинация","audio_url":"https://www.soundhelix.com/examples/mp3/SoundHelix-Song-6.mp3"},"en":{"title":"Anti-procrastination","audio_url":"https://www.soundhelix.com/examples/mp3/SoundHelix-Song-6.mp3"},"es":{"title":"Antiprocrastinacion","audio_url":"https://www.soundhelix.com/examples/mp3/SoundHelix-Song-6.mp3"},"ca":{"title":"Antiprocrastinacio","audio_url":"https://www.soundhelix.com/examples/mp3/SoundHelix-Song-6.mp3"}}'::jsonb
  ),
  (
    'bbbbbbbb-bbbb-bbbb-bbbb-bbbbbbbbb007',
    'aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaa4',
    1,
    480,
    'https://picsum.photos/seed/session-007/600/600',
    '{"ru":{"title":"Утренняя ясность","audio_url":"https://www.soundhelix.com/examples/mp3/SoundHelix-Song-7.mp3"},"en":{"title":"Morning clarity","audio_url":"https://www.soundhelix.com/examples/mp3/SoundHelix-Song-7.mp3"},"es":{"title":"Claridad matutina","audio_url":"https://www.soundhelix.com/examples/mp3/SoundHelix-Song-7.mp3"},"ca":{"title":"Claredat matinal","audio_url":"https://www.soundhelix.com/examples/mp3/SoundHelix-Song-7.mp3"}}'::jsonb
  ),
  (
    'bbbbbbbb-bbbb-bbbb-bbbb-bbbbbbbbb008',
    'aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaa4',
    2,
    660,
    'https://picsum.photos/seed/session-008/600/600',
    '{"ru":{"title":"План на день","audio_url":"https://www.soundhelix.com/examples/mp3/SoundHelix-Song-8.mp3"},"en":{"title":"Plan your day","audio_url":"https://www.soundhelix.com/examples/mp3/SoundHelix-Song-8.mp3"},"es":{"title":"Plan del dia","audio_url":"https://www.soundhelix.com/examples/mp3/SoundHelix-Song-8.mp3"},"ca":{"title":"Pla del dia","audio_url":"https://www.soundhelix.com/examples/mp3/SoundHelix-Song-8.mp3"}}'::jsonb
  ),
  (
    'bbbbbbbb-bbbb-bbbb-bbbb-bbbbbbbbb009',
    'aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaa5',
    1,
    780,
    'https://picsum.photos/seed/session-009/600/600',
    '{"ru":{"title":"Сон за 10 минут","audio_url":"https://www.soundhelix.com/examples/mp3/SoundHelix-Song-9.mp3"},"en":{"title":"Sleep in 10 minutes","audio_url":"https://www.soundhelix.com/examples/mp3/SoundHelix-Song-9.mp3"},"es":{"title":"Dormir en 10 minutos","audio_url":"https://www.soundhelix.com/examples/mp3/SoundHelix-Song-9.mp3"},"ca":{"title":"Dormir en 10 minuts","audio_url":"https://www.soundhelix.com/examples/mp3/SoundHelix-Song-9.mp3"}}'::jsonb
  ),
  (
    'bbbbbbbb-bbbb-bbbb-bbbb-bbbbbbbbb010',
    'aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaa5',
    2,
    1020,
    'https://picsum.photos/seed/session-010/600/600',
    '{"ru":{"title":"Теплая ночь","audio_url":"https://www.soundhelix.com/examples/mp3/SoundHelix-Song-10.mp3"},"en":{"title":"Warm night","audio_url":"https://www.soundhelix.com/examples/mp3/SoundHelix-Song-10.mp3"},"es":{"title":"Noche calida","audio_url":"https://www.soundhelix.com/examples/mp3/SoundHelix-Song-10.mp3"},"ca":{"title":"Nit calida","audio_url":"https://www.soundhelix.com/examples/mp3/SoundHelix-Song-10.mp3"}}'::jsonb
  ),
  (
    'bbbbbbbb-bbbb-bbbb-bbbb-bbbbbbbbb011',
    'aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaa6',
    1,
    840,
    'https://picsum.photos/seed/session-011/600/600',
    '{"ru":{"title":"Отключить мысли","audio_url":"https://www.soundhelix.com/examples/mp3/SoundHelix-Song-11.mp3"},"en":{"title":"Quiet the mind","audio_url":"https://www.soundhelix.com/examples/mp3/SoundHelix-Song-11.mp3"},"es":{"title":"Silenciar la mente","audio_url":"https://www.soundhelix.com/examples/mp3/SoundHelix-Song-11.mp3"},"ca":{"title":"Silenciar la ment","audio_url":"https://www.soundhelix.com/examples/mp3/SoundHelix-Song-11.mp3"}}'::jsonb
  ),
  (
    'bbbbbbbb-bbbb-bbbb-bbbb-bbbbbbbbb012',
    'aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaa6',
    2,
    960,
    'https://picsum.photos/seed/session-012/600/600',
    '{"ru":{"title":"Тихий финал дня","audio_url":"https://www.soundhelix.com/examples/mp3/SoundHelix-Song-12.mp3"},"en":{"title":"Quiet end of day","audio_url":"https://www.soundhelix.com/examples/mp3/SoundHelix-Song-12.mp3"},"es":{"title":"Final tranquilo del dia","audio_url":"https://www.soundhelix.com/examples/mp3/SoundHelix-Song-12.mp3"},"ca":{"title":"Final tranquil del dia","audio_url":"https://www.soundhelix.com/examples/mp3/SoundHelix-Song-12.mp3"}}'::jsonb
  )
on conflict (id) do update
set
  topic_id = excluded.topic_id,
  order_index = excluded.order_index,
  duration = excluded.duration,
  cover_url = excluded.cover_url,
  translations = excluded.translations;

commit;
