-- ============================================================
-- Portfolio René Descartes — Persistance des messages
-- Supabase Postgres. Exécuter via : psql "$DATABASE_URL" -f db/init.sql
-- Ou dans l'éditeur SQL de Supabase.
-- Réversible : DROP ORDER (sessions, admin, messages) à la fin.
-- ============================================================

-- --- Table messages (formulaire de contact public) ---
CREATE TABLE IF NOT EXISTS public.messages (
  id          BIGSERIAL PRIMARY KEY,
  nom         TEXT        NOT NULL,
  email       TEXT        NOT NULL,
  sujet       TEXT        DEFAULT 'Nouveau projet',
  message     TEXT        NOT NULL,
  statut      TEXT        NOT NULL DEFAULT 'nouveau'
             CHECK (statut IN ('nouveau','lu','repondu','archive')),
  favori      BOOLEAN     NOT NULL DEFAULT false,
  lu_a        TIMESTAMPTZ,
  repondu_a   TIMESTAMPTZ,
  source      TEXT        NOT NULL DEFAULT 'portfolio',
  ip          TEXT,
  cree_le     TIMESTAMPTZ NOT NULL DEFAULT now(),
  maj_le      TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- --- Table admin (identifiants de connexion à la boîte) ---
CREATE TABLE IF NOT EXISTS public.admin (
  id          BIGSERIAL PRIMARY KEY,
  email       TEXT        NOT NULL UNIQUE,
  mot_de_passe TEXT       NOT NULL,
  nom         TEXT,
  cree_le     TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- --- Table sessions (tokens JWT révoqués / actifs) ---
CREATE TABLE IF NOT EXISTS public.sessions (
  id          BIGSERIAL PRIMARY KEY,
  admin_id    BIGINT      REFERENCES public.admin(id) ON DELETE CASCADE,
  jti         TEXT        NOT NULL UNIQUE,
  expire_le   TIMESTAMPTZ NOT NULL,
  cree_le     TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Index utiles
CREATE INDEX IF NOT EXISTS idx_messages_statut  ON public.messages (statut);
CREATE INDEX IF NOT EXISTS idx_messages_favori  ON public.messages (favori);
CREATE INDEX IF NOT EXISTS idx_messages_cree_le ON public.messages (cree_le DESC);
CREATE INDEX IF NOT EXISTS idx_sessions_admin   ON public.sessions (admin_id);
CREATE INDEX IF NOT EXISTS idx_sessions_jti     ON public.sessions (jti);

-- Trigger : mise à jour de maj_le à chaque UPDATE
CREATE OR REPLACE FUNCTION public.touch_maj_le()
RETURNS TRIGGER AS $$
BEGIN
  NEW.maj_le = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS trg_messages_maj ON public.messages;
CREATE TRIGGER trg_messages_maj
  BEFORE UPDATE ON public.messages
  FOR EACH ROW EXECUTE FUNCTION public.touch_maj_le();

-- ============================================================
-- ROLLBACK (si besoin de revenir en arrière)
--   DROP TRIGGER IF EXISTS trg_messages_maj ON public.messages;
--   DROP TABLE IF EXISTS public.sessions;
--   DROP TABLE IF EXISTS public.admin;
--   DROP TABLE IF EXISTS public.messages;
--   DROP FUNCTION IF EXISTS public.touch_maj_le();
-- ============================================================