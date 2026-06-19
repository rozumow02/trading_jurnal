--
-- PostgreSQL database dump
--

\restrict 2bxGMIQmJe6yZDygD4o8QuIqGBCKiDkl7tsLw49MoRnxoLllFTaxcJYnBo9CHkl

-- Dumped from database version 17.6
-- Dumped by pg_dump version 18.1 (Ubuntu 18.1-1.pgdg24.04+2)

SET statement_timeout = 0;
SET lock_timeout = 0;
SET idle_in_transaction_session_timeout = 0;
SET transaction_timeout = 0;
SET client_encoding = 'UTF8';
SET standard_conforming_strings = on;
SELECT pg_catalog.set_config('search_path', '', false);
SET check_function_bodies = false;
SET xmloption = content;
SET client_min_messages = warning;
SET row_security = off;

--
-- Name: public; Type: SCHEMA; Schema: -; Owner: -
--

CREATE SCHEMA public;


--
-- Name: SCHEMA public; Type: COMMENT; Schema: -; Owner: -
--

COMMENT ON SCHEMA public IS 'standard public schema';


SET default_tablespace = '';

SET default_table_access_method = heap;

--
-- Name: benchmarks; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.benchmarks (
    id uuid DEFAULT gen_random_uuid() NOT NULL,
    symbol character varying(50) NOT NULL,
    date date NOT NULL,
    close numeric NOT NULL,
    created_at timestamp with time zone DEFAULT timezone('utc'::text, now()) NOT NULL
);


--
-- Name: mt5_api_keys; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.mt5_api_keys (
    id uuid DEFAULT gen_random_uuid() NOT NULL,
    user_id uuid NOT NULL,
    api_key text DEFAULT (gen_random_uuid())::text NOT NULL,
    label text DEFAULT 'MT5 Account'::text NOT NULL,
    last_used timestamp with time zone,
    created_at timestamp with time zone DEFAULT now() NOT NULL,
    default_account_id uuid
);


--
-- Name: prop_accounts; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.prop_accounts (
    id uuid DEFAULT gen_random_uuid() NOT NULL,
    firm_name character varying(100) NOT NULL,
    account_size numeric NOT NULL,
    status character varying(50) DEFAULT 'Phase 1'::character varying NOT NULL,
    profit_target_pct numeric DEFAULT 8.0,
    daily_dd_pct numeric DEFAULT 5.0,
    max_dd_pct numeric DEFAULT 10.0,
    total_payouts numeric DEFAULT 0,
    created_at timestamp with time zone DEFAULT timezone('utc'::text, now()) NOT NULL,
    user_id uuid,
    account_type text DEFAULT 'prop'::text
);


--
-- Name: trades; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.trades (
    id bigint NOT NULL,
    trade_type integer DEFAULT 1 NOT NULL,
    symbol text NOT NULL,
    direction text NOT NULL,
    quantity numeric NOT NULL,
    entry_date date NOT NULL,
    exit_date date,
    buy_price numeric NOT NULL,
    sell_price numeric,
    trade_link text,
    trade_image text,
    tags text[] DEFAULT '{}'::text[],
    trade_setup_notes text,
    ml_notes text,
    is_pending boolean DEFAULT false,
    pnl_amount numeric,
    pnl_percentage numeric,
    current_price numeric,
    created_at timestamp with time zone DEFAULT now(),
    updated_at timestamp with time zone DEFAULT now(),
    account_id uuid,
    user_id uuid,
    mt5_ticket bigint,
    mt5_imported_at timestamp with time zone,
    fee numeric DEFAULT 0 NOT NULL,
    CONSTRAINT trades_direction_check CHECK ((direction = ANY (ARRAY['long'::text, 'short'::text])))
);


--
-- Name: trades_id_seq; Type: SEQUENCE; Schema: public; Owner: -
--

CREATE SEQUENCE public.trades_id_seq
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


--
-- Name: trades_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: -
--

ALTER SEQUENCE public.trades_id_seq OWNED BY public.trades.id;


--
-- Name: trades id; Type: DEFAULT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.trades ALTER COLUMN id SET DEFAULT nextval('public.trades_id_seq'::regclass);


--
-- Name: benchmarks benchmarks_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.benchmarks
    ADD CONSTRAINT benchmarks_pkey PRIMARY KEY (id);


--
-- Name: mt5_api_keys mt5_api_keys_api_key_key; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.mt5_api_keys
    ADD CONSTRAINT mt5_api_keys_api_key_key UNIQUE (api_key);


--
-- Name: mt5_api_keys mt5_api_keys_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.mt5_api_keys
    ADD CONSTRAINT mt5_api_keys_pkey PRIMARY KEY (id);


--
-- Name: prop_accounts prop_accounts_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.prop_accounts
    ADD CONSTRAINT prop_accounts_pkey PRIMARY KEY (id);


--
-- Name: trades trades_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.trades
    ADD CONSTRAINT trades_pkey PRIMARY KEY (id);


--
-- Name: trades_mt5_ticket_user; Type: INDEX; Schema: public; Owner: -
--

CREATE UNIQUE INDEX trades_mt5_ticket_user ON public.trades USING btree (user_id, mt5_ticket);


--
-- Name: mt5_api_keys mt5_api_keys_default_account_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.mt5_api_keys
    ADD CONSTRAINT mt5_api_keys_default_account_id_fkey FOREIGN KEY (default_account_id) REFERENCES public.prop_accounts(id) ON DELETE SET NULL;


--
-- Name: mt5_api_keys mt5_api_keys_user_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.mt5_api_keys
    ADD CONSTRAINT mt5_api_keys_user_id_fkey FOREIGN KEY (user_id) REFERENCES auth.users(id) ON DELETE CASCADE;


--
-- Name: prop_accounts prop_accounts_user_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.prop_accounts
    ADD CONSTRAINT prop_accounts_user_id_fkey FOREIGN KEY (user_id) REFERENCES auth.users(id) ON DELETE CASCADE;


--
-- Name: trades trades_account_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.trades
    ADD CONSTRAINT trades_account_id_fkey FOREIGN KEY (account_id) REFERENCES public.prop_accounts(id) ON DELETE SET NULL;


--
-- Name: trades trades_user_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.trades
    ADD CONSTRAINT trades_user_id_fkey FOREIGN KEY (user_id) REFERENCES auth.users(id) ON DELETE CASCADE;


--
-- Name: prop_accounts Enable all access for all users; Type: POLICY; Schema: public; Owner: -
--

CREATE POLICY "Enable all access for all users" ON public.prop_accounts USING (true) WITH CHECK (true);


--
-- Name: benchmarks Enable read access for all users; Type: POLICY; Schema: public; Owner: -
--

CREATE POLICY "Enable read access for all users" ON public.benchmarks FOR SELECT USING (true);


--
-- Name: trades Users can only delete their own trades; Type: POLICY; Schema: public; Owner: -
--

CREATE POLICY "Users can only delete their own trades" ON public.trades FOR DELETE USING ((auth.uid() = user_id));


--
-- Name: trades Users can only insert their own trades; Type: POLICY; Schema: public; Owner: -
--

CREATE POLICY "Users can only insert their own trades" ON public.trades FOR INSERT WITH CHECK ((auth.uid() = user_id));


--
-- Name: prop_accounts Users can only see their own accounts; Type: POLICY; Schema: public; Owner: -
--

CREATE POLICY "Users can only see their own accounts" ON public.prop_accounts FOR SELECT USING ((auth.uid() = user_id));


--
-- Name: trades Users can only see their own trades; Type: POLICY; Schema: public; Owner: -
--

CREATE POLICY "Users can only see their own trades" ON public.trades FOR SELECT USING ((auth.uid() = user_id));


--
-- Name: trades Users can only update their own trades; Type: POLICY; Schema: public; Owner: -
--

CREATE POLICY "Users can only update their own trades" ON public.trades FOR UPDATE USING ((auth.uid() = user_id));


--
-- Name: prop_accounts Users delete own accounts; Type: POLICY; Schema: public; Owner: -
--

CREATE POLICY "Users delete own accounts" ON public.prop_accounts FOR DELETE USING ((auth.uid() = user_id));


--
-- Name: trades Users delete own trades; Type: POLICY; Schema: public; Owner: -
--

CREATE POLICY "Users delete own trades" ON public.trades FOR DELETE USING ((auth.uid() = user_id));


--
-- Name: prop_accounts Users insert own accounts; Type: POLICY; Schema: public; Owner: -
--

CREATE POLICY "Users insert own accounts" ON public.prop_accounts FOR INSERT WITH CHECK ((auth.uid() = user_id));


--
-- Name: trades Users insert own trades; Type: POLICY; Schema: public; Owner: -
--

CREATE POLICY "Users insert own trades" ON public.trades FOR INSERT WITH CHECK ((auth.uid() = user_id));


--
-- Name: prop_accounts Users see own accounts; Type: POLICY; Schema: public; Owner: -
--

CREATE POLICY "Users see own accounts" ON public.prop_accounts FOR SELECT USING ((auth.uid() = user_id));


--
-- Name: trades Users see own trades; Type: POLICY; Schema: public; Owner: -
--

CREATE POLICY "Users see own trades" ON public.trades FOR SELECT USING ((auth.uid() = user_id));


--
-- Name: prop_accounts Users update own accounts; Type: POLICY; Schema: public; Owner: -
--

CREATE POLICY "Users update own accounts" ON public.prop_accounts FOR UPDATE USING ((auth.uid() = user_id));


--
-- Name: trades Users update own trades; Type: POLICY; Schema: public; Owner: -
--

CREATE POLICY "Users update own trades" ON public.trades FOR UPDATE USING ((auth.uid() = user_id));


--
-- Name: trades allow all; Type: POLICY; Schema: public; Owner: -
--

CREATE POLICY "allow all" ON public.trades USING (true) WITH CHECK (true);


--
-- Name: benchmarks; Type: ROW SECURITY; Schema: public; Owner: -
--

ALTER TABLE public.benchmarks ENABLE ROW LEVEL SECURITY;

--
-- Name: mt5_api_keys; Type: ROW SECURITY; Schema: public; Owner: -
--

ALTER TABLE public.mt5_api_keys ENABLE ROW LEVEL SECURITY;

--
-- Name: mt5_api_keys owner delete; Type: POLICY; Schema: public; Owner: -
--

CREATE POLICY "owner delete" ON public.mt5_api_keys FOR DELETE USING ((auth.uid() = user_id));


--
-- Name: mt5_api_keys owner insert; Type: POLICY; Schema: public; Owner: -
--

CREATE POLICY "owner insert" ON public.mt5_api_keys FOR INSERT WITH CHECK ((auth.uid() = user_id));


--
-- Name: mt5_api_keys owner select; Type: POLICY; Schema: public; Owner: -
--

CREATE POLICY "owner select" ON public.mt5_api_keys FOR SELECT USING ((auth.uid() = user_id));


--
-- Name: mt5_api_keys owner update; Type: POLICY; Schema: public; Owner: -
--

CREATE POLICY "owner update" ON public.mt5_api_keys FOR UPDATE USING ((auth.uid() = user_id)) WITH CHECK ((auth.uid() = user_id));


--
-- Name: prop_accounts; Type: ROW SECURITY; Schema: public; Owner: -
--

ALTER TABLE public.prop_accounts ENABLE ROW LEVEL SECURITY;

--
-- Name: trades; Type: ROW SECURITY; Schema: public; Owner: -
--

ALTER TABLE public.trades ENABLE ROW LEVEL SECURITY;

--
-- PostgreSQL database dump complete
--

\unrestrict 2bxGMIQmJe6yZDygD4o8QuIqGBCKiDkl7tsLw49MoRnxoLllFTaxcJYnBo9CHkl

