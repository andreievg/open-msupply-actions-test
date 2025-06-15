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
CREATE EXTENSION IF NOT EXISTS tablefunc WITH SCHEMA public;
COMMENT ON EXTENSION tablefunc IS 'functions that manipulate whole tables, including crosstab';
CREATE PROCEDURE public.aggregate_current_mos()
    LANGUAGE plpgsql
    AS $$
BEGIN
		delete from aggregator where dataElement = 'currentMOS';
		insert into aggregator (storeID, itemID, value, dataElement)
		select item_line.store_id, item_line.item_id, sum(item_line.available * item_line.pack_size) / max(aggregator.value), 'currentMOS' from
		item_line join aggregator on aggregator.itemID = item_line.item_id and aggregator.storeID = item_line.store_id and aggregator.dataElement = 'AMC'
		where item_line.available > 0 group by 1, 2 order by item_line.item_id, item_line.store_id;
		
		insert into aggregator (storeID, itemID, value, dataElement)
		select ag.store_id, ag.item_id, value, 'currentMOS' from (
		select item_line.store_id, item_line.item_id, sum(item_line.available * item_line.pack_size) as value from
		item_line  group by 1, 2) as ag
		where ag.value <= 0;
	END
$$;
CREATE PROCEDURE public.aggregate_monthlysoh(IN p_yearmonth text DEFAULT 'YYYYMM'::text, IN is_delete_old_data boolean DEFAULT false, IN months_to_keep integer DEFAULT 12)
    LANGUAGE plpgsql
    AS $$
declare 
    s_yearmonth text;
    date_end date;
begin 
    -- the day FROM and TO 
    IF (length(p_yearmonth) <> 6) THEN 
        RAISE NOTICE 'yearmonth should be the format with YYYYMM :%', p_yearmonth::text;
        RETURN;
    END IF;
    IF (p_yearmonth = 'YYYYMM') THEN 
        -- the day FROM and TO 
        SELECT TO_CHAR(current_date - interval '1 days', 'YYYYMM'), current_date - interval '1 days' INTO s_yearmonth, date_end; 
    ELSE
        s_yearmonth:= p_yearmonth;
        SELECT TO_DATE(CONCAT(p_yearmonth, '01'),'YYYYMMDD') + interval '1 month' + '- 1 day' INTO date_end; 
	END IF;
    RAISE NOTICE 'yearmonth :%', s_yearmonth::text;
    RAISE NOTICE 'end date :%', date_end::text;
    DELETE FROM d_aggregator_monthly_soh WHERE dataelement='monthlyStockOnHand' AND monthyear = s_yearmonth;
    
    IF is_delete_old_data = true THEN
        -- delete the old values
        DELETE FROM d_aggregator_monthly_soh WHERE dataelement='monthlyStockOnHand' AND monthyear NOT IN (SELECT TO_CHAR(mm, 'YYYYMM') FROM generate_series(date_end - CAST(months_to_keep || ' month' AS interval), date_end, '1 month')mm);
    END IF;
    DELETE FROM d_monthly_item_active_store_join WHERE monthyear = s_yearmonth;
    -- item_store_join at the end of month
    INSERT INTO d_monthly_item_active_store_join(item_id, store_ids, monthyear, is_critical) 
    SELECT item_id, ARRAY_TO_JSON(ARRAY_AGG(store_id))::jsonb, s_yearmonth, i.critical_stock
    FROM item_store_join isj JOIN item i ON i.id = isj.item_id 
    WHERE isj.inactive = false 
    GROUP BY item_id, i.critical_stock;
    WITH monthly_rank AS(
        SELECT agg.storeid, agg.itemid, value, fulldate, RANK() OVER(PARTITION BY agg.storeid, agg.itemid ORDER BY fulldate DESC) AS ranking
        FROM aggregator agg 
        WHERE dataelement = 'stockHistory' 
        AND fulldate <= date_end
    )
    INSERT INTO d_aggregator_monthly_soh (storeid, itemid,value, fulldate, dataelement, monthyear)
    SELECT storeid, itemid, COALESCE(mr.value, 0) AS value, COALESCE(fulldate, date_end), 'monthlyStockOnHand', s_yearmonth
    FROM monthly_rank mr
	WHERE ranking = 1;
end
$$;
CREATE PROCEDURE public.aggregate_stock_status()
    LANGUAGE plpgsql
    AS $$
begin
	delete from aggregator where dataelement = 'mos';
    insert into aggregator (storeid, itemid, monthyear, value, fulldate, dataelement)
	select storeid, itemid, yearmonth, stockvalue / value, fulldate, 'mos'
	from (
		select stock.storeid, stock.itemid, concat(extract(year from stock.fulldate), extract(month from stock.fulldate)) as yearmonth, amc.value, date_trunc('month', stock.fulldate) as fulldate, SUM(stock.value) as stockvalue
		from aggregator stock
		 JOIN store on storeID = store.id 
		 LEFT JOIN aggregator amc on stock.itemid=amc.itemID AND stock.storeid = amc.storeid
		WHERE stock.dataElement = 'stockHistory'  AND store.disabled = False AND stock.value > 0
		 AND amc.dataElement = 'AMC'
		 AND amc.value > 0
		GROUP BY 1, 2, 3, 4, 5
	) as a	
	ORDER BY storeid, itemid;
end
$$;
CREATE PROCEDURE public.aggregate_stock_value_history()
    LANGUAGE plpgsql
    AS $$
BEGIN
		delete from aggregator where dataelement = 'stockValueHistory';
		with stock_value_current as 
		-- get the current stock value
		(
			select store_id storeid, item_id itemid, current_date - date_part('day', current_date)::integer + 1 - interval '12 months' fulldate, sum(cost_price * quantity) as value
			from item_line where quantity <> 0
			group by 1,2
		), movements as
		-- get all transition dates for a given store/item combination 
		(
			select storeid, itemid, fulldate, value
			from aggregator
			where dataelement = 'stockValueMovement' and fulldate >  current_date - date_part('day', current_date)::integer + 1 - interval '12 months'
			union
			select storeid, itemid, fulldate, 0
			from stock_value_current
		)
		insert into aggregator (storeID, itemID, fullDate, dataElement, value)
		select m.storeid, m.itemid, m.fulldate, 'stockValueHistory', svc.value-sum(coalesce(m_sum.value,0))
		from movements m
			left join movements m_sum on m.storeid = m_sum.storeid and m.itemid = m_sum.itemid and m_sum.fulldate >m.fulldate
			join stock_value_current svc on m.storeid = svc.storeid and m.itemid = svc.itemid
		group by 1,2,3,4,svc.value
		union
		select storeid, itemid, current_date, 'stockValueHistory', value 
		from stock_value_current;
	END
$$;
CREATE PROCEDURE public.aggregate_stock_value_movement()
    LANGUAGE plpgsql
    AS $$
BEGIN
		delete from aggregator where dataElement = 'stockValueMovement';
		create temporary table temp_movement
		(
			storeid text,
			itemid text,
			fulldate date,
			stockin bigint default 0,
			stockout bigint default 0
		)
		on commit drop;
	
		insert into temp_movement (storeid, itemid, fulldate, stockout)
		select t.store_ID, tl.item_ID, t.confirm_date, sum(tl.quantity * cost_price )
		from trans_line tl
			join transact t on tl.transaction_ID = t.ID
		where t."type" in('ci', 'sc') 
			and t.status in('fn', 'cn')
			and tl.type in('stock_out') -- add 'placeholder' to include placeholder lines
			and t.confirm_date >= (current_date - date_part('day', current_date)::integer + 1 - interval '12 month')
		group by 1,2,3;
	
		insert into temp_movement (storeid, itemid, fulldate, stockin)
		select t.store_ID, tl.item_ID, t.confirm_date, sum(tl.quantity * cost_price )
		from trans_line tl
			join transact t on tl.transaction_ID = t.ID
		where t."type" in ('si') 
			and t.status in('fn', 'cn')
			and tl.type in('stock_in') -- add 'placeholder' to include placeholder lines
			and t.confirm_date >= (current_date - date_part('day', current_date)::integer + 1 - interval '12 month')
		group by 1,2,3;
	
		insert into aggregator(storeID, itemID, fullDate, dataElement, value)
		(
			select storeID, itemID, fullDate, 'stockValueMovement', sum(stockin)-sum(stockout)
			from temp_movement
			group by 1,2,3,4
		);
		drop table temp_movement;
	END
$$;
CREATE PROCEDURE public.aggregate_total_stock()
    LANGUAGE plpgsql
    AS $$
declare
	yearmonth varchar := concat(extract(year from current_date), extract(month from current_date));
begin
	delete from aggregator where dataelement = 'totalStockValue';
	insert into aggregator (storeID, monthyear, value, fullDate, dataElement)
	select item_store_join.store_ID, yearmonth, SUM(item_line.cost_price*item_line.quantity), current_date, 'totalStockValue'
	from item_line
		join item on item_line.item_ID=item.ID
		join item_store_join on item_store_join.item_ID=item_line.item_ID and item_store_join.store_ID=item_line.store_ID
	where item_store_join.inactive=False
		and item_store_join.non_stock=False
		and item.type_of='general'
		and item_line.quantity>0
		and item_line.ID <> ''
	group by 1,2;
end
$$;
CREATE PROCEDURE public.cc_sensor_battery_log()
    LANGUAGE plpgsql
    AS $$
begin 
    -- insert the sensor battery log
    INSERT INTO public.d_daily_sensor_battery_log (sensor_id, name, log_datetime, batterylevel ,is_active, last_temperature_log_datetime)
    SELECT DISTINCT s.id, s.name, DATE_TRUNC('hour', current_timestamp), batterylevel ,is_active, last_temp_datetime 
    FROM (
        SELECT sensor_id AS sensor_id, MAX(CONCAT(TO_CHAR(date,'YYYY-MM-DD'),' ', TO_CHAR(time,'HH24:MI:SS'))::timestamptz) AS last_temp_datetime
        FROM temperature_log tl 
        GROUP BY sensor_id
    ) tl 
    JOIN sensor s ON tl.sensor_id = s.id
    ON CONFLICT ON CONSTRAINT d_daily_sensor_battery_log_pkey 
    DO UPDATE SET batterylevel = EXCLUDED.batterylevel, is_active = EXCLUDED.is_active, last_temperature_log_datetime = EXCLUDED.last_temperature_log_datetime;
end
$$;
CREATE PROCEDURE public.create_materialised_views()
    LANGUAGE plpgsql
    AS $$
begin
	/* ******************************************************* */
	/* ******** VIEW : msupply_usage_this_month ************** */
	/* ******************************************************* */
	
	if exists(select * from pg_matviews where matviewname = 'msupply_usage_this_month') then
	    refresh materialized view public.msupply_usage_this_month;
	else
		CREATE MATERIALIZED VIEW public.msupply_usage_this_month
                TABLESPACE pg_default AS  
		WITH usage_list AS( 
		SELECT 
			a.index,
			a.usage,
			store.id AS store_id,
			store.name AS store_name,
			store.store_mode 
		FROM store,(
			SELECT 1 AS index, 'Days without a transaction entered'::text AS usage
			UNION SELECT 2, 'Supplier invoices not finalised within an appropriate time frame'::text AS usage
			UNION SELECT 3, 'Days since last sync'::text AS usage
			UNION SELECT 4, 'Days since stocktake'::text AS usage
			UNION SELECT 5, 'Days since requisition'::text AS usage
			UNION SELECT 6, 'Pending customer invoices'::text AS usage
			UNION SELECT 7, '% of items out of stock'::text AS usage
			UNION SELECT 8, 'Pending purchase orders'::text AS usage
		)A
		WHERE store_mode IN ('store', 'dispensary')
		), days AS (
			-- counting the days this month so far
			select dd, extract(DOW from dd) dw
			from generate_series(DATE_TRUNC('month', current_date), current_date, '1 day'::interval) dd
		), altrans AS(
			-- count entry transactions
			SELECT 
			1 AS index,  
			store_id, 
			COUNT(distinct entry_date) AS value 
			FROM transact 
			WHERE entry_date >= DATE_TRUNC('month', now()) 
			GROUP BY store_id
		), si_temp AS (
			SELECT store_id, id, 'fn' AS "type", CASE WHEN confirm_date <= entry_date + interval '1 month' THEN 1 ELSE 0 END AS good, CASE WHEN confirm_date > entry_date + interval '1 month' THEN 1 ELSE 0 END AS bad 
			FROM transact 
			WHERE status IN ('cn', 'fn') 
			AND type = 'si'
			AND linked_transaction_id <> '' 
			AND transact.confirm_date >= DATE_TRUNC('month', now()) 
			UNION 
			SELECT store_id, id, 'pending' AS "type",
			CASE WHEN entry_date > current_date - interval '1 month' THEN 1 ELSE 0 END AS good, 
			CASE WHEN entry_date <= current_date - interval '1 month' THEN 1 ELSE 0 END AS bad 
			FROM transact 
			WHERE status NOT IN ('fn', 'cn') 
			AND type = 'si'
			AND linked_transaction_id <> ''
		), si AS(
		-- number of finalised Supplier Invoice within 1 month & pending Supplier Invoice created more than 1 month ago
		SELECT 
			2 AS index, 
			store_id,
			SUM(bad) AS value,
			SUM(good + bad) AS total  
		FROM si_temp 
		GROUP BY store_id 
		), sd AS(
			SELECT 3 AS index, store.id, (current_date - Max(date)) AS value  
			FROM site_log 
			JOIN store ON store.sync_id_remote_site = site_log.site_id AND site_log.event = 'synced_daily' 
			GROUP BY store.id   
		), st AS(
			-- days since last stock take
			SELECT 4 AS index,  store_id, current_date - MAX(stock_take_date) AS value
			FROM stock_take 
			WHERE stock_take_date IS NOT null 
			AND status = 'fn' 
			GROUP BY store_id
			ORDER BY store_id 
		), req AS(
			SELECT 5 AS index,  store_id, current_date - MAX(date_entered) AS value 
			FROM requisition 
			WHERE date_entered IS NOT NULL 
			AND status = 'fn' 
			AND store_id IN (SELECT id FROM store where store_mode IN('dispensary'))
			GROUP BY store_id
			ORDER BY store_id
		), ci AS(
		SELECT 6 AS index,  store_id, COUNT(distinct(id)) AS value 
		FROM transact WHERE type = 'ci' AND status NOT IN ('fn','cn') 
		GROUP BY store_id 
		), items AS(
		SELECT il.store_id, i.item_name AS "item", sum(il.pack_size * il.available) AS "stock"
		FROM item i 
		JOIN  item_line il ON il.item_id = i.id 
		JOIN item_store_join isj ON il.store_id = isj.store_id AND i.id = isj.item_id AND isj.inactive = false
		WHERE il.store_id IN (SELECT id FROM store WHERE store_mode IN ('store', 'dispensary'))
		GROUP BY il.store_id, i.item_name 
		), item_counter AS(
		SELECT store_id, SUM(case when stock > 0 then 1 else 0 end) AS available, SUM(case when stock > 0 then 0 else 1 end) AS out
		FROM items 
		GROUP BY store_id  
		), item_stock AS(
		SELECT 7 AS index,  store_id, (out * 100 / (out + available)) AS value   
		FROM item_counter
		), po AS(
		SELECT 8 AS index,  store_id, count(id) AS value  
		FROM purchase_order WHERE status <> 'fn' 
		AND store_id IN (SELECT id FROM store where store_mode IN('store'))
		GROUP BY store_id 
		), temp AS(
		SELECT *, 0 AS total FROM altrans 
		UNION SELECT * FROM si
		UNION SELECT *, 0 AS total FROM sd
		UNION SELECT *, 0 AS total FROM st 
		UNION SELECT *, 0 AS total FROM req 
		UNION SELECT *, 0 AS total FROM ci 
		UNION SELECT *, 0 AS total FROM item_stock
		UNION SELECT *, 0 AS total FROM po  
		) 
		SELECT 
			usage_list.index, 
			usage_list.store_id, 
			usage_list.store_name, 
			usage_list.store_mode, 
			usage_list.usage, 
			CASE WHEN usage_list.index = 1 THEN ((select count(*) from days) - COALESCE(temp.value, 0)) 
			WHEN usage_list.index = 2 THEN (CASE WHEN total IS NULL THEN NULL ELSE COALESCE(temp.value, 0) END) ELSE temp.value END AS value,
			CASE WHEN usage_list.index = 1 THEN (CASE WHEN (select count(*) from days) - COALESCE(temp.value, 0) = (select count(*) from days) THEN 0 ELSE 1 END) 
			WHEN usage_list.index = 2 THEN (CASE WHEN total IS NULL THEN 2 WHEN COALESCE(value * 100.0 / total,0) < 20 THEN 2 WHEN COALESCE(value * 100.0 / total,0)  < 50 THEN 1 ELSE 0 END)
			WHEN usage_list.index = 3 THEN (CASE WHEN value > 10 THEN 0 WHEN value > 5 THEN 1 ELSE 2 END) 
			WHEN usage_list.index = 4 THEN (CASE WHEN value > 50 THEN 0 WHEN value > 30 THEN 1 ELSE 2 END) 
			WHEN usage_list.index = 5 THEN CASE WHEN store_mode = 'dispensary' THEN (CASE WHEN value > 50 THEN 0 WHEN value > 30 THEN 1 ELSE 2 END) ELSE null END 
			WHEN usage_list.index = 6 THEN (CASE WHEN value > 20 THEN 0 WHEN value > 5 THEN 1 ELSE 2 END)
			WHEN usage_list.index = 7 THEN (CASE WHEN  value < 5 THEN 3 WHEN value < 10 THEN 2 WHEN value < 20 THEN 1 ELSE 0 END)
			WHEN usage_list.index = 8 THEN CASE WHEN store_mode = 'store' THEN (CASE WHEN value > 20 THEN 0 WHEN value > 5 THEN 1 ELSE 2 END) ELSE null END 
			ELSE 0 END AS score
		FROM usage_list 
		LEFT JOIN temp ON usage_list.index = temp.index AND usage_list.store_id = temp.store_id
	    with data;
	end if;
end
$$;
CREATE PROCEDURE public.custom_aggregations()
    LANGUAGE plpgsql
    AS $$
begin
  perform setval('aggregator_id_seq', (select 1+max(id) from aggregator));
  call aggregate_total_stock();
  call aggregate_stock_status();
  call aggregate_current_mos();
  call aggregate_stock_value_movement();
  call aggregate_stock_value_history();
  CALL public.aggregate_monthlysoh();
  CALL public.dtac_msupply_usage_stats();
  IF (TO_CHAR(current_date - interval '1 days', 'DD')::int < 10) THEN 
  	-- in case of the sync delay, call the previous month
    CALL public.aggregate_monthlysoh(TO_CHAR(current_date - interval '1 month', 'YYYYMM'));
	-- in case of the sync delay, call the previous month except 6. purchase order (we can not get when it's finalised)
	CALL public.dtac_msupply_usage_stats(true, TO_CHAR(current_date - interval '1 month', 'YYYYMM'), ARRAY['1','2','3','4','5','7']);
  END IF;
end
$$;
CREATE PROCEDURE public.dtac_msupply_usage_stats(IN is_past_month boolean DEFAULT false, IN p_yearmonth text DEFAULT 'YYYYMM'::text, IN arr_indicators text[] DEFAULT ARRAY['All'::text])
    LANGUAGE plpgsql
    AS $$
declare 
	s_yearmonth text;
	s_yearmonth_iasj text;
    date_begin date;
    date_end date;
    i_index integer;
begin 
    -- the day FROM and TO 
    IF (is_past_month = true) AND (length(p_yearmonth) <> 6) THEN 
        RAISE NOTICE 'yearmonth should be the format with YYYYMM :%', p_yearmonth::text;
        RETURN;
    END IF;
    IF (LOWER(arr_indicators[1])='all') THEN
		arr_indicators=array['1', '2', '3', '4','5','6','7'];
	END IF;
    IF ((is_past_month = false) OR (p_yearmonth = 'YYYYMM')) THEN 
        -- current data
        SELECT TO_CHAR(current_date - interval '1 days', 'YYYYMM'),  DATE_TRUNC('month', current_date - interval '1 days'),  current_date - interval '1 days' INTO s_yearmonth, date_begin, date_end;
        s_yearmonth_iasj:=s_yearmonth;
    ELSE
        -- past data
        s_yearmonth:= p_yearmonth;
        SELECT TO_DATE(CONCAT(p_yearmonth, '01'),'YYYYMMDD'),  TO_DATE(CONCAT(p_yearmonth, '01'),'YYYYMMDD') + interval '1 month' + '- 1 day' INTO date_begin, date_end; 
    	-- get the minimum month if the d_monthly_item_active_store_join does not have the data (if the old month, no d_monthly_item_active_store_join)
        SELECT MIN(monthyear) FROM d_monthly_item_active_store_join disj WHERE monthyear >= p_yearmonth INTO s_yearmonth_iasj;
	END IF;
    RAISE NOTICE 'yearmonth :%', s_yearmonth::text;
    RAISE NOTICE 's_yearmonth_iasj for item active store join:%', s_yearmonth_iasj::text;
    RAISE NOTICE 'begin date :%', date_begin::text;
    RAISE NOTICE 'end date :%', date_end::text;
 
    -- create temp table 
    DROP TABLE IF EXISTS tt_msupply_usage_temp;
    CREATE TEMP TABLE tt_msupply_usage_temp
    (
        index integer NOT NULL,
        store_id text NOT NULL,
        usage text NOT NULL,
        yearmonth text NOT NULL,
        value double precision,
        score integer,
        temp text,
        CONSTRAINT tt_msupply_usage_temp_pkey PRIMARY KEY (usage, yearmonth, store_id)
    );
    i_index:=1;
    IF ((is_past_month = false) OR ((is_past_month = true) AND (array_position(arr_indicators, i_index::TEXT)>0))) THEN 
        /* 1 : '% of items out of stock' */
        INSERT INTO tt_msupply_usage_temp (index, store_id, usage, yearmonth, value, score)
        SELECT 
            1, s.id, '% of items out of stock', s_yearmonth, COALESCE(value,0), 
            CASE WHEN COALESCE(value,0) < 11 THEN 2 WHEN value < 21 THEN 1 ELSE 0 END
        FROM store s 
        LEFT JOIN (
            SELECT store_id, (out * 100.0 / (out + available)) AS value   
                FROM (
                    SELECT store_id, SUM(CASE WHEN value > 0 THEN 1 ELSE 0 END) AS available, 
                    SUM(CASE WHEN value > 0 THEN 0 ELSE 1 END) AS out 
                    FROM (
                       SELECT DISTINCT uc, isj.store_id, MAX(value) AS value
                        FROM item i 
                        JOIN (
                        SELECT 
                            ipj.value-> 'data' As uc, 
                            disj.item_id, 
                            jsonb_array_elements_text(store_ids) AS store_id, 
                            is_critical
                        FROM d_monthly_item_active_store_join disj 
                        LEFT JOIN item_property_join ipj on ipj.item_id = disj.item_id 
                        LEFT JOIN property ip ON ip.id = ipj.property_id 
                        WHERE is_critical = true 
                        AND monthyear = s_yearmonth_iasj  
                        -- AND ip.name = 'Critical Items UC'
                        ) isj ON i.id = isj.item_id 
                        JOIN store s ON isj.store_id = s.id 
                        LEFT JOIN d_aggregator_monthly_soh agg ON agg.itemid = i.id AND agg.storeid = isj.store_id  AND monthyear = s_yearmonth_iasj  
                        GROUP BY uc, isj.store_id
                    ) AS items 
                    GROUP BY store_id
                ) AS items 
        ) AS item_stock ON s.id = item_stock.store_id 
        WHERE store_mode IN ('store', 'dispensary') AND s.disabled = false;
    END IF;
    /* 2 : 'Days sice last transaction' */
    i_index:=2;
    IF ((is_past_month = false) OR ((is_past_month = true) AND (array_position(arr_indicators, i_index::TEXT)>0))) THEN 
        /* transaction (SI, CI Prescription, Inventory Adj) */
        INSERT INTO tt_msupply_usage_temp (index, store_id, usage, yearmonth, temp, score)
        SELECT 999, store_id, 'temp_transaction', s_yearmonth ,MAX(entry_date)::text, 0 FROM transact WHERE entry_date <= date_end GROUP BY store_id;
        
        /*  StockTake */
        INSERT INTO tt_msupply_usage_temp (index, store_id, usage, yearmonth, temp, score)
        SELECT 999, store_id, 'temp_stocktake', s_yearmonth ,MAX(stock_take_created_date)::text, 0 FROM stock_take WHERE stock_take_created_date <= date_end GROUP BY store_id;
        
        /*  PO */
        INSERT INTO tt_msupply_usage_temp (index, store_id, usage, yearmonth, temp, score)
        SELECT 999, store_id, 'temp_po', s_yearmonth ,MAX(creation_date)::text, 0 FROM purchase_order WHERE creation_date <= date_end GROUP BY store_id;
        
        /*  Goods receipt */
        INSERT INTO tt_msupply_usage_temp (index, store_id, usage, yearmonth, temp, score)
        SELECT 999, store_id, 'temp_gr', s_yearmonth ,MAX(entry_date)::text, 0 FROM goods_received WHERE entry_date <= date_end GROUP BY store_id;
        
        /* all */
        INSERT INTO tt_msupply_usage_temp (index, store_id, usage, yearmonth, value, score)
        SELECT 
            2, s.id, 'Days since last transaction', s_yearmonth, value, CASE WHEN value < 8 THEN 2 WHEN value < 15 THEN 1 ELSE 0 END
        FROM store s 
        LEFT JOIN (
            SELECT store_id, yearmonth, date_end - MAX(temp::date) AS value FROM tt_msupply_usage_temp WHERE index = 999 GROUP BY store_id, yearmonth 
        ) AS t ON s.id = t.store_id 
        WHERE store_mode IN ('store', 'dispensary') AND s.disabled = false;
    END IF;
    
    /* 3 : 'Days since stocktake' */
    i_index:=3;
    IF ((is_past_month = false) OR ((is_past_month = true) AND (array_position(arr_indicators, i_index::TEXT)>0))) THEN
        INSERT INTO tt_msupply_usage_temp (index, store_id, usage, yearmonth, value, score)
        SELECT 
            3, s.id, 'Days since stocktake', s_yearmonth, value, CASE WHEN value < 31 THEN 1 ELSE 0 END
        FROM store s 
        LEFT JOIN (
            SELECT store_id, date_end - MAX(stock_take_date) AS value FROM stock_take WHERE stock_take_date <= date_end AND status IN ('cn','fn') GROUP BY store_id 
        ) AS st ON s.id = st.store_id 
        WHERE store_mode IN ('store', 'dispensary') AND s.disabled = false;
    END IF;
    /* 4 : 'Pending customer invoices' */
    i_index:=4;
    IF ((is_past_month = false) OR ((is_past_month = true) AND (array_position(arr_indicators, i_index::TEXT)>0))) THEN
        INSERT INTO tt_msupply_usage_temp (index, store_id, usage, yearmonth, value, score)
        SELECT 4, s.id, 'Pending customer invoices', s_yearmonth, COALESCE(value,0), CASE WHEN COALESCE(value,0) < 11 THEN 2 WHEN value < 21 THEN 1 ELSE 0 END 
        FROM store s 
        LEFT JOIN (
            SELECT store_id, COUNT(DISTINCT id) AS value FROM transact WHERE mode = 'store' AND type = 'ci' AND entry_date <= date_end AND ((confirm_date IS NULL AND status <> 'fn') OR confirm_date > date_end) GROUP BY store_id 
        ) AS ci ON s.id = ci.store_id 
        WHERE store_mode IN ('store', 'dispensary') AND s.disabled = false;
    END IF;
    /* 5 : 'Outstanding Supplier invoices' */
    i_index:=5;
    IF ((is_past_month = false) OR ((is_past_month = true) AND (array_position(arr_indicators, i_index::TEXT)>0))) THEN
        INSERT INTO tt_msupply_usage_temp (index, store_id, usage, yearmonth, value, score)
        SELECT 5, s.id, 'Outstanding Supplier invoices', s_yearmonth, COALESCE(value,0), CASE WHEN COALESCE(value,0) < 3 THEN 2 WHEN value < 6 THEN 1 ELSE 0 END 
        FROM store s 
        LEFT JOIN (
            SELECT store_id, COUNT(DISTINCT t.id) AS value 
            FROM transact t
            JOIN name n ON t.name_id = n.id AND n.code <> 'invad'
            WHERE t.type = 'si' AND entry_date <= date_end AND ((confirm_date IS NULL AND status <> 'fn') OR confirm_date > date_end) GROUP BY store_id 
        ) AS si ON s.id = si.store_id 
        WHERE store_mode IN ('store', 'dispensary') AND s.disabled = false;
    END IF;
    /* 6 : 'Pending purchase orders' - we can not get this value from the past data since there is no finalised date */
    i_index:=6;
        IF ((is_past_month = false) OR ((is_past_month = true) AND (array_position(arr_indicators, i_index::TEXT)>0))) THEN
        INSERT INTO tt_msupply_usage_temp (index, store_id, usage, yearmonth, value, score)
        SELECT 6, s.id, 'Pending purchase orders', s_yearmonth, CASE WHEN name ILIKE '%warehouse%' THEN COALESCE(value,0) ELSE NULL END, CASE WHEN name ILIKE '%warehouse%' THEN (CASE WHEN value > 10 THEN 0 ELSE 1 END) ELSE NULL END 
        FROM store s 
        LEFT JOIN (
            SELECT store_id, COUNT(DISTINCT id) AS value FROM purchase_order 
            WHERE status <> 'fn'
            AND store_id IN (SELECT id FROM store WHERE name ILIKE '%warehouse%') 
            AND creation_date <= date_end - interval '1 year'
            GROUP BY store_id		
        )AS po ON s.id = po.store_id 
        WHERE store_mode IN ('store', 'dispensary');
    END IF;
    /* 7 : 'Internal orders placed in past 90 days' */
    i_index:=7;
    IF ((is_past_month = false) OR ((is_past_month = true) AND (array_position(arr_indicators, i_index::TEXT)>0))) THEN
        INSERT INTO tt_msupply_usage_temp (index, store_id, usage, yearmonth, value, score)
        SELECT 
            7, s.id, 'Internal orders placed in past 90 days', s_yearmonth, CASE WHEN name NOT ILIKE '%warehouse%' THEN COALESCE(value,0) ELSE NULL END, CASE WHEN name NOT ILIKE '%warehouse%' THEN (CASE WHEN value > 0 THEN 1 ELSE 0 END) ELSE NULL END 
        FROM store s 
        LEFT JOIN (
            SELECT req.store_id, COUNT(DISTINCT req.id) AS value 
            FROM requisition req 
            JOIN requisition res on res.linked_requisition_id = req.id 
            WHERE req.type = 'request' 
            AND res.date_order_received BETWEEN date_end - interval '3 months' AND date_end
            AND req.store_id IN (SELECT id FROM store WHERE name NOT ILIKE '%warehouse%') 
            GROUP BY req.store_id 
        ) AS io ON s.id = io.store_id 
        WHERE store_mode IN ('store', 'dispensary');
    END IF;
    -- insert to the monthly table
    INSERT INTO public.d_msupply_monthly_usage (index, usage, yearmonth, store_id ,value, score)
    SELECT index, usage, yearmonth, store_id ,value, score 
    FROM tt_msupply_usage_temp WHERE index <> 999 
    ON CONFLICT ON CONSTRAINT d_msupply_monthly_usage_pkey 
    DO UPDATE SET index = EXCLUDED.index, value = EXCLUDED.value, score = EXCLUDED.score, updated_date = current_timestamp;
    DROP TABLE IF EXISTS tt_msupply_usage_temp;
end
$$;
CREATE PROCEDURE public.dtac_msupply_usage_stats_bk2_anil(IN is_past_month boolean DEFAULT false, IN p_yearmonth text DEFAULT 'YYYYMM'::text, IN arr_indicators text[] DEFAULT ARRAY['All'::text])
    LANGUAGE plpgsql
    AS $$
declare 
	s_yearmonth text;
    date_begin date;
    date_end date;
    i_index integer;
begin 
    -- the day FROM and TO 
    IF (is_past_month = true) AND (length(p_yearmonth) <> 6) THEN 
        RAISE NOTICE 'yearmonth should be the format with YYYYMM :%', p_yearmonth::text;
        RETURN;
    END IF;
    IF (LOWER(arr_indicators[1])='all') THEN
		arr_indicators=array['1', '2', '3', '4','5','6','7'];
	END IF;
    IF ((is_past_month = false) OR (p_yearmonth = 'YYYYMM')) THEN 
        SELECT TO_CHAR(current_date - interval '1 days', 'YYYYMM'),  DATE_TRUNC('month', current_date - interval '1 days'),  current_date - interval '1 days' INTO s_yearmonth, date_begin, date_end;
    ELSE
        s_yearmonth:= p_yearmonth;
        SELECT TO_DATE(CONCAT(p_yearmonth, '01'),'YYYYMMDD'),  TO_DATE(CONCAT(p_yearmonth, '01'),'YYYYMMDD') + interval '1 month' + '- 1 day' INTO date_begin, date_end; 
    END IF;
    RAISE NOTICE 'yearmonth :%', s_yearmonth::text;
    RAISE NOTICE 'begin date :%', date_begin::text;
    RAISE NOTICE 'end date :%', date_end::text;
 
    -- create temp table 
    DROP TABLE IF EXISTS tt_msupply_usage_temp;
    CREATE TEMP TABLE tt_msupply_usage_temp
    (
        index integer NOT NULL,
        store_id text NOT NULL,
        usage text NOT NULL,
        yearmonth text NOT NULL,
        value double precision,
        score integer,
        temp text,
        CONSTRAINT tt_msupply_usage_temp_pkey PRIMARY KEY (usage, yearmonth, store_id)
    );
    i_index:=1;
    IF ((is_past_month = false) OR ((is_past_month = true) AND (array_position(arr_indicators, i_index::TEXT)>0))) THEN 
        /* 1 : '% of items out of stock' */
        INSERT INTO tt_msupply_usage_temp (index, store_id, usage, yearmonth, value, score)
        SELECT 
            1, s.id, '% of items out of stock', s_yearmonth, COALESCE(value,0), CASE WHEN COALESCE(value,0) < 11 THEN 2 WHEN value < 21 THEN 1 ELSE 0 END
        FROM store s 
        LEFT JOIN (
            SELECT store_id, (out * 100.0 / (out + available)) AS value   
                FROM (
                    SELECT store_id, SUM(case when value > 0 then 1 else 0 end) AS available, SUM(case when value > 0 then 0 else 1 end) AS out 
                    FROM (
                        SELECT isj.store_id, i.item_name, value, fulldate
                        FROM item i 
                        JOIN (
                            SELECT item_id, jsonb_array_elements_text(store_ids) AS store_id, is_critical 
                            FROM d_monthly_item_active_store_join disj 
                            WHERE is_critical = true 
                            AND monthyear = s_yearmonth
                            ORDER BY item_id, store_ids
                        ) isj ON i.id = isj.item_id 
                        JOIN store s ON isj.store_id = s.id 
                        LEFT JOIN d_aggregator_monthly_soh agg on agg.itemid = i.id AND agg.storeid = isj.store_id  AND monthyear = s_yearmonth 
                    ) AS items 
                    GROUP BY store_id
                ) AS items 
        ) AS item_stock ON s.id = item_stock.store_id 
        WHERE store_mode IN ('store', 'dispensary') AND s.disabled = false;
    END IF;
    /* 2 : 'Days sice last transaction' */
    i_index:=2;
    IF ((is_past_month = false) OR ((is_past_month = true) AND (array_position(arr_indicators, i_index::TEXT)>0))) THEN 
        /* transaction (SI, CI Prescription, Inventory Adj) */
        INSERT INTO tt_msupply_usage_temp (index, store_id, usage, yearmonth, temp, score)
        SELECT 999, store_id, 'temp_transaction', s_yearmonth ,MAX(entry_date)::text, 0 FROM transact WHERE entry_date <= date_end GROUP BY store_id;
        
        /*  StockTake */
        INSERT INTO tt_msupply_usage_temp (index, store_id, usage, yearmonth, temp, score)
        SELECT 999, store_id, 'temp_stocktake', s_yearmonth ,MAX(stock_take_created_date)::text, 0 FROM stock_take WHERE stock_take_created_date <= date_end GROUP BY store_id;
        
        /*  PO */
        INSERT INTO tt_msupply_usage_temp (index, store_id, usage, yearmonth, temp, score)
        SELECT 999, store_id, 'temp_po', s_yearmonth ,MAX(creation_date)::text, 0 FROM purchase_order WHERE creation_date <= date_end GROUP BY store_id;
        
        /*  Goods receipt */
        INSERT INTO tt_msupply_usage_temp (index, store_id, usage, yearmonth, temp, score)
        SELECT 999, store_id, 'temp_gr', s_yearmonth ,MAX(entry_date)::text, 0 FROM goods_received WHERE entry_date <= date_end GROUP BY store_id;
        
        /* all */
        INSERT INTO tt_msupply_usage_temp (index, store_id, usage, yearmonth, value, score)
        SELECT 
            2, s.id, 'Days since last transaction', s_yearmonth, value, CASE WHEN value < 8 THEN 2 WHEN value < 15 THEN 1 ELSE 0 END
        FROM store s 
        LEFT JOIN (
            SELECT store_id, yearmonth, date_end - MAX(temp::date) AS value FROM tt_msupply_usage_temp WHERE index = 999 GROUP BY store_id, yearmonth 
        ) AS t ON s.id = t.store_id 
        WHERE store_mode IN ('store', 'dispensary') AND s.disabled = false;
    END IF;
    
    /* 3 : 'Days since stocktake' */
    i_index:=3;
    IF ((is_past_month = false) OR ((is_past_month = true) AND (array_position(arr_indicators, i_index::TEXT)>0))) THEN
        INSERT INTO tt_msupply_usage_temp (index, store_id, usage, yearmonth, value, score)
        SELECT 
            3, s.id, 'Days since stocktake', s_yearmonth, value, CASE WHEN value < 31 THEN 1 ELSE 0 END
        FROM store s 
        LEFT JOIN (
            SELECT store_id, date_end - MAX(stock_take_date) AS value FROM stock_take WHERE stock_take_date <= date_end AND status IN ('cn','fn') GROUP BY store_id 
        ) AS st ON s.id = st.store_id 
        WHERE store_mode IN ('store', 'dispensary') AND s.disabled = false;
    END IF;
    /* 4 : 'Pending customer invoices' */
    i_index:=4;
    IF ((is_past_month = false) OR ((is_past_month = true) AND (array_position(arr_indicators, i_index::TEXT)>0))) THEN
        INSERT INTO tt_msupply_usage_temp (index, store_id, usage, yearmonth, value, score)
        SELECT 4, s.id, 'Pending customer invoices', s_yearmonth, COALESCE(value,0), CASE WHEN COALESCE(value,0) < 11 THEN 2 WHEN value < 21 THEN 1 ELSE 0 END 
        FROM store s 
        LEFT JOIN (
            SELECT store_id, COUNT(DISTINCT id) AS value FROM transact WHERE type = 'ci' AND entry_date <= date_end AND ((confirm_date IS NULL AND status <> 'fn') OR confirm_date > date_end) GROUP BY store_id 
        ) AS ci ON s.id = ci.store_id 
        WHERE store_mode IN ('store', 'dispensary') AND s.disabled = false;
    END IF;
    /* 5 : 'Outstanding Supplier invoices' */
    i_index:=5;
    IF ((is_past_month = false) OR ((is_past_month = true) AND (array_position(arr_indicators, i_index::TEXT)>0))) THEN
        INSERT INTO tt_msupply_usage_temp (index, store_id, usage, yearmonth, value, score)
        SELECT 5, s.id, 'Outstanding Supplier invoices', s_yearmonth, COALESCE(value,0), CASE WHEN COALESCE(value,0) < 3 THEN 2 WHEN value < 6 THEN 1 ELSE 0 END 
        FROM store s 
        LEFT JOIN (
            SELECT store_id, COUNT(DISTINCT t.id) AS value 
            FROM transact t
            JOIN name n ON t.name_id = n.id AND n.code <> 'invad'
            WHERE t.type = 'si' AND entry_date <= date_end AND ((confirm_date IS NULL AND status <> 'fn') OR confirm_date > date_end) GROUP BY store_id 
        ) AS si ON s.id = si.store_id 
        WHERE store_mode IN ('store', 'dispensary') AND s.disabled = false;
    END IF;
    /* 6 : 'Pending purchase orders' - we can not get this value from the past data since there is no finalised date */
    i_index:=6;
        IF ((is_past_month = false) OR ((is_past_month = true) AND (array_position(arr_indicators, i_index::TEXT)>0))) THEN
        INSERT INTO tt_msupply_usage_temp (index, store_id, usage, yearmonth, value, score)
        SELECT 6, s.id, 'Pending purchase orders', s_yearmonth, CASE WHEN name ILIKE '%warehouse%' THEN COALESCE(value,0) ELSE NULL END, CASE WHEN name ILIKE '%warehouse%' THEN (CASE WHEN value > 10 THEN 0 ELSE 1 END) ELSE NULL END
        FROM store s 
        LEFT JOIN (
            SELECT store_id, COUNT(DISTINCT id) AS value FROM purchase_order 
            WHERE status <> 'fn'
            AND store_id IN (SELECT id FROM store WHERE name ILIKE '%warehouse%') 
            AND creation_date <= date_end - interval '1 year'
            GROUP BY store_id		
        )AS po ON s.id = po.store_id 
        WHERE store_mode IN ('store', 'dispensary');
    END IF;
    /* 7 : 'Internal orders placed in past 90 days' */
    i_index:=7;
    IF ((is_past_month = false) OR ((is_past_month = true) AND (array_position(arr_indicators, i_index::TEXT)>0))) THEN
        INSERT INTO tt_msupply_usage_temp (index, store_id, usage, yearmonth, value, score)
        SELECT 
            7, s.id, 'Internal orders placed in past 90 days', s_yearmonth, CASE WHEN name NOT ILIKE '%warehouse%' THEN COALESCE(value,0) ELSE NULL END, CASE WHEN name NOT ILIKE '%warehouse%' THEN (CASE WHEN value > 0 THEN 1 ELSE 0 END) ELSE NULL END 
        FROM store s 
        LEFT JOIN (
            SELECT req.store_id, COUNT(DISTINCT req.id) AS value 
            FROM requisition req 
            JOIN requisition res on res.linked_requisition_id = req.id 
            WHERE req.type = 'request' 
            AND res.date_order_received BETWEEN date_end - interval '3 months' AND date_end
            AND req.store_id IN (SELECT id FROM store WHERE name NOT ILIKE '%warehouse%') 
            GROUP BY req.store_id 
        ) AS io ON s.id = io.store_id 
        WHERE store_mode IN ('store', 'dispensary');
    END IF;
    -- insert to the monthly table
    INSERT INTO public.d_msupply_monthly_usage (index, usage, yearmonth, store_id ,value, score)
    SELECT index, usage, yearmonth, store_id ,value, score 
    FROM tt_msupply_usage_temp WHERE index <> 999 
    ON CONFLICT ON CONSTRAINT d_msupply_monthly_usage_pkey 
    DO UPDATE SET index = EXCLUDED.index, value = EXCLUDED.value, score = EXCLUDED.score, updated_date = current_timestamp;
    DROP TABLE IF EXISTS tt_msupply_usage_temp;
end
$$;
CREATE FUNCTION public.dynamic_pivot(central_query text, headers_query text, refcursor) RETURNS refcursor
    LANGUAGE plpgsql
    AS $_$DECLARE
  left_column text;
  header_column text;
  value_column text;
  h_value text;
  headers_clause text;
  query text;
  j json;
  r record;
  curs refcursor;
  i int:=1;
  extra_column text;
  first_column text;
BEGIN
  -- find the column names of the source query
  EXECUTE 'select row_to_json(_r.*) from (' ||  central_query || ') AS _r' into j;
  if (j is null ) then
 	query = 'select ''''';
  else
	  FOR r in SELECT * FROM json_each_text(j)
	  LOOP
	    IF (i=1) THEN left_column := r.key;
	      ELSEIF (i=2) THEN header_column := r.key;
	      ELSEIF (i=3) THEN value_column := r.key;
	      ELSEIF (i=4) THEN extra_column := format(',%I', r.key);
		  ELSEIF (i=5) then first_column := format('%I,', r.key);
	    END IF;
	    i := i+1;
	  END LOOP;
	
	  --  build the dynamic transposition query (based on the canonical model)
	  FOR h_value in EXECUTE headers_query
	  LOOP
	    headers_clause := concat(headers_clause,
	     format(chr(10)||',min(case when %I=%L then %I::text end) as %I',
	           header_column,
		   h_value,
		   value_column,
		   h_value ));
	  END LOOP;
	
	 query = format('SELECT %s %I %s %s FROM (select *,row_number() over() as rn from (%s) AS _c) as _d GROUP BY %s %I %s order by min(rn)',
	           	first_column,
	           	left_column,
	           	extra_column,
		   		headers_clause,
		   		central_query,
		   		first_column,
				left_column,
				extra_column);
  end if;
  -- open the cursor so the caller can FETCH right away
  OPEN $3 FOR execute query;
  RETURN $3;
END 
$_$;
CREATE PROCEDURE public.msupply_usage_stats()
    LANGUAGE plpgsql
    AS $$
declare 
	dates_count integer;
	records_last_month_count integer;
	begin_date date;
begin 
	SELECT COUNT(*) INTO records_last_month_count FROM msupply_usage_monthly WHERE yearmonth = TO_CHAR(current_date - interval '1 months', 'yyyymm');
	-- if no record last month, generate monthly records
	if records_last_month_count = 0 then  
		-- the number of days from 1st to the end of last month
		SELECT DATE_TRUNC('month', current_date - interval '1 months')::date, COUNT(dd) INTO begin_date, dates_count FROM generate_series(DATE_TRUNC('month', current_date - interval '1 months') , DATE_TRUNC('month', current_date) + '-1 days' , '1 day'::interval) dd;
		
		-- create monthly table if not exists
		CREATE TABLE IF NOT EXISTS public.msupply_usage_monthly(
			index integer NOT NULL,
			yearmonth text NOT NULL,
			usage text NOT NULL, 
			store_id text NOT NULL,
			value double precision DEFAULT 0,
			score integer DEFAULT 0,
			CONSTRAINT msupply_usage_monthly_pkey PRIMARY KEY (usage, yearmonth, store_id)
		);
		-- create temp table 
		DROP TABLE IF EXISTS msupply_usage_temp;
		CREATE TEMP TABLE msupply_usage_temp
		(
			index integer NOT NULL,
			store_id text NOT NULL,
			usage text NOT NULL,
			yearmonth text NOT NULL,
			value double precision,
			score integer,
			CONSTRAINT msupply_usage_temp_pkey PRIMARY KEY (usage, yearmonth, store_id)
		);
		/* 1 : 'Days without a transaction entered' */
		INSERT INTO msupply_usage_temp (index, store_id, usage, yearmonth, value, score)
		SELECT 
			1, 
			s.id, 
			'Days without a transaction entered', 
			TO_CHAR(begin_date, 'yyyymm'),
			dates_count - COALESCE(COUNT(distinct entry_date), 0), 
			CASE WHEN dates_count - COALESCE(COUNT(distinct entry_date), 0) = dates_count THEN 0 ELSE 1 END
		FROM store s
		LEFT JOIN transact AS t ON s.id = t.store_id AND entry_date BETWEEN begin_date AND DATE_TRUNC('month', begin_date + interval '1 months') + '-1 days' 
		WHERE store_mode IN ('store', 'dispensary') 
		GROUP BY s.id;
		/* 2 : 'Supplier invoices not finalised within an appropriate time frame' */
		INSERT INTO msupply_usage_temp (index, store_id, usage, yearmonth, value, score)
		SELECT 
			2, 
			s.id, 
			'Supplier invoices not finalised within an appropriate time frame', 
			TO_CHAR(begin_date, 'yyyymm'),
			CASE WHEN total IS NULL THEN NULL ELSE COALESCE(value, 0) END,
			CASE WHEN total IS NULL THEN 2 WHEN COALESCE(value * 100.0 / total,0) < 20 THEN 2 WHEN COALESCE(value * 100.0 / total,0)  < 50 THEN 1 ELSE 0 END
		FROM store s
		LEFT JOIN (
			SELECT store_id, SUM(bad) AS value, SUM(good + bad) AS total   
				FROM (
					SELECT store_id, id, 'fn' AS "type", 
					CASE WHEN confirm_date <= entry_date + interval '1 month' THEN 1 ELSE 0 END AS good, 
					CASE WHEN confirm_date > entry_date + interval '1 month' THEN 1 ELSE 0 END AS bad 
					FROM transact WHERE status IN ('cn', 'fn') AND type = 'si' AND linked_transaction_id <> '' AND transact.confirm_date BETWEEN begin_date AND DATE_TRUNC('month', begin_date + interval '1 months') + '-1 days'
					UNION SELECT store_id, id, 'pending' AS "type", 
					CASE WHEN confirm_date IS NOT NULL THEN 
						CASE WHEN confirm_date <= entry_date + interval '1 month' THEN 1 ELSE 0 END 
					ELSE 
						CASE WHEN entry_date > begin_date - interval '1 days' THEN 1 ELSE 0 END 
					END AS good, 
					CASE WHEN confirm_date IS NOT NULL THEN 
						CASE WHEN confirm_date > entry_date + interval '1 month' THEN 1 ELSE 0 END
					ELSE
						CASE WHEN entry_date < begin_date - interval '1 days' THEN 1 ELSE 0 END 
					END AS bad 
					FROM transact WHERE type = 'si' AND linked_transaction_id <> '' AND entry_date <= DATE_TRUNC('month', begin_date + interval '1 months') + '-1 days' AND (confirm_date IS NULL OR  confirm_date > DATE_TRUNC('month', begin_date + interval '1 months') + '-1 days')
				) AS si_temp 
				GROUP BY store_id
		) AS si ON s.id = si.store_id 
		WHERE store_mode IN ('store', 'dispensary');
		/* 3 : 'Days since last sync' */
		INSERT INTO msupply_usage_temp (index, store_id, usage, yearmonth, value, score)
		SELECT 
			3, 
			s.id, 
			'Days since last sync', 
			TO_CHAR(begin_date, 'yyyymm'),
			value,
			CASE WHEN value > 10 THEN 0 WHEN value > 5 THEN 1 ELSE 2 END
		FROM store s 
		LEFT JOIN (
			SELECT store.id AS store_id, ((DATE_TRUNC('month', begin_date + interval '1 months') + '-1 days')::date - Max(date)) AS value FROM site_log JOIN store ON store.sync_id_remote_site = site_log.site_id AND site_log.event = 'synced_daily' WHERE date <= DATE_TRUNC('month', begin_date + interval '1 months') + '-1 days' GROUP BY store.id
		) AS sd ON s.id = sd.store_id 
		WHERE store_mode IN ('store', 'dispensary');
		
		/* 4 : 'Days since stocktake' */
		INSERT INTO msupply_usage_temp (index, store_id, usage, yearmonth, value, score)
		SELECT 
			4, 
			s.id, 
			'Days since stocktake', 
			TO_CHAR(begin_date, 'yyyymm'),
			value,
			CASE WHEN value > 50 THEN 0 WHEN value > 30 THEN 1 ELSE 2 END
		FROM store s 
		LEFT JOIN (
			SELECT store_id, (DATE_TRUNC('month', begin_date + interval '1 months') + '-1 days')::date - MAX(stock_take_date) AS value FROM stock_take WHERE stock_take_date IS NOT null AND stock_take_date <= (DATE_TRUNC('month', begin_date + interval '1 months') + '-1 days') AND status = 'fn' GROUP BY store_id ORDER BY store_id 
		) AS st ON s.id = st.store_id 
		WHERE store_mode IN ('store', 'dispensary');
		/* 5 : 'Days since requisition' */
		INSERT INTO msupply_usage_temp (index, store_id, usage, yearmonth, value, score)
		SELECT 
			5, 
			s.id, 
			'Days since requisition', 
			TO_CHAR(begin_date, 'yyyymm'),
			value,
			CASE WHEN store_mode = 'dispensary' THEN (CASE WHEN value > 50 THEN 0 WHEN value > 30 THEN 1 ELSE 2 END) ELSE null END 
		FROM store s 
		LEFT JOIN (
			SELECT store_id, (DATE_TRUNC('month', begin_date + interval '1 months') + '-1 days')::date - MAX(date_entered) AS value FROM requisition WHERE date_entered IS NOT NULL AND date_entered <= (DATE_TRUNC('month', begin_date + interval '1 months') + '-1 days') AND status = 'fn' AND store_id IN (SELECT id FROM store where store_mode IN('dispensary')) GROUP BY store_id ORDER BY store_id
		) AS req ON s.id = req.store_id 
		WHERE store_mode IN ('store', 'dispensary');
		/* 6 : 'Pending customer invoices' */
		INSERT INTO msupply_usage_temp (index, store_id, usage, yearmonth, value, score)
		SELECT 
			6, 
			s.id, 
			'Pending customer invoices', 
			TO_CHAR(begin_date, 'yyyymm'),
			value,
			CASE WHEN value > 20 THEN 0 WHEN value > 5 THEN 1 ELSE 2 END 
		FROM store s 
		LEFT JOIN (
			SELECT store_id, COUNT(distinct(id)) AS value FROM transact WHERE type = 'ci' AND entry_date <= DATE_TRUNC('month', begin_date + interval '1 months') + '-1 days' AND (confirm_date IS NULL OR confirm_date > DATE_TRUNC('month', begin_date + interval '1 months') + '-1 days') GROUP BY store_id 
		) AS ci ON s.id = ci.store_id 
		WHERE store_mode IN ('store', 'dispensary');
		/* 7 : '% of items out of stock' */
		INSERT INTO msupply_usage_temp (index, store_id, usage, yearmonth, value, score)
		SELECT 
			7, 
			s.id, 
			'% of items out of stock', 
			TO_CHAR(begin_date, 'yyyymm'),
			value,
			CASE WHEN  value < 5 THEN 3 WHEN value < 10 THEN 2 WHEN value < 20 THEN 1 ELSE 0 END
		FROM store s 
		LEFT JOIN (
			SELECT store_id, (out * 100 / (out + available)) AS value   
				FROM (
					SELECT storeid AS store_id, SUM(case when value > 0 then 1 else 0 end) AS available, SUM(case when value > 0 then 0 else 1 end) AS out 
					FROM (
						SELECT agg.storeid, i.item_name AS "item", value, fulldate, RANK () OVER (PARTITION BY agg.storeid, i.item_name ORDER BY fulldate DESC) AS maxdate
						FROM item i 
						LEFT JOIN  aggregator agg on agg.itemid = i.id and dataelement = 'stockHistory' 
						JOIN item_store_join isj ON agg.storeid = isj.store_id AND i.id = isj.item_id AND isj.inactive = false
						WHERE agg.storeid IN (SELECT id FROM store WHERE store_mode IN ('store', 'dispensary') AND disabled = false) AND fulldate  <= DATE_TRUNC('month', begin_date + interval '1 months') + '-1 days'
					) AS items 
					WHERE maxdate = 1 GROUP BY storeid
				) AS items 
		) AS item_stock ON s.id = item_stock.store_id 
		WHERE store_mode IN ('store', 'dispensary');
		/* 8 : 'Pending purchase orders' */
		INSERT INTO msupply_usage_temp (index, store_id, usage, yearmonth, value, score)
		SELECT 
			8, 
			s.id, 
			'Pending purchase orders', 
			TO_CHAR(begin_date, 'yyyymm'),
			value,
			CASE WHEN store_mode = 'store' THEN (CASE WHEN value > 20 THEN 0 WHEN value > 5 THEN 1 ELSE 2 END) ELSE null END 
		FROM store s 
		LEFT JOIN (
			SELECT store_id, count(id) AS value FROM purchase_order 
			WHERE status <> 'fn'
			AND store_id IN (SELECT id FROM store where store_mode IN('store')) 
			AND creation_date <= DATE_TRUNC('month', begin_date + interval '1 months') + '-1 days' 
			GROUP BY store_id
			UNION SELECT store_id, count(id) AS value FROM purchase_order 
			WHERE status = 'fn'
			AND store_id IN (SELECT id FROM store where store_mode IN('store')) 
			AND creation_date <= DATE_TRUNC('month', begin_date + interval '1 months') + '-1 days' 
			AND confirm_date > DATE_TRUNC('month', begin_date + interval '1 months') + '-1 days'
			GROUP BY store_id 		
		)AS po ON s.id = po.store_id 
		WHERE store_mode IN ('store', 'dispensary');
		
		-- insert to the monthly table
		INSERT INTO public.msupply_usage_monthly (index, usage, yearmonth, store_id ,value, score)
		SELECT index, usage, yearmonth, store_id ,value, score 
		FROM msupply_usage_temp  
		ON CONFLICT ON CONSTRAINT msupply_usage_monthly_pkey DO NOTHING;
        
	end if;
end
$$;
CREATE PROCEDURE public.post_export()
    LANGUAGE sql
    AS $$CREATE OR REPLACE VIEW public.region_mos
AS SELECT CURRENT_DATE AS "time",
    region.description AS region,
    a.store,
    a.value,
    g.data AS geojson
   FROM ( SELECT s.name AS store,
            s.id AS storeid,
            avg(a_1.value) AS value,
            s.name_id
           FROM aggregator a_1
             JOIN store s ON a_1.storeid = s.id::text
          WHERE a_1.dataelement = 'mos'::text
          GROUP BY s.name, s.id, s.name_id) a
     JOIN name n ON a.name_id::text = n.id::text
     JOIN name_category1 region ON n.category1_id::text = region.id::text
     JOIN geojson g ON region.id::text = g.id::text
  ORDER BY region.description;
  
CREATE OR REPLACE VIEW public.store_mos
AS SELECT (CURRENT_DATE - interval '1 day')::date AS "current_date",
    name.name AS store,
    a.value,
    name.latitude,
    name.longitude,
    i.item_name AS item
   FROM store
     JOIN name ON store.name_id::text = name.id::text
     JOIN aggregator a ON store.id::text = a.storeid
     JOIN item i ON a.itemid = i.id::text
  WHERE store.disabled = false AND a.dataelement = 'mos'::text;
CREATE OR REPLACE VIEW public.store_transactions AS
with stores as (
  select id, name as store
  from store
  where (store_mode <> ALL (ARRAY['supervisor', 'his', 'drug_registration'])) 
   and disabled = false 
), transactions as (
  select t.store_id, 
    date_trunc('month', t.confirm_date::timestamp with time zone) confirm_date, 
    1  "month", 
    case when confirm_date > (CURRENT_DATE - 7) then 1 else 0 end "week"
  from transact t
  where t.confirm_date > (CURRENT_DATE - 30) 
    and t.confirm_date <= CURRENT_DATE
)
SELECT min(confirm_date) AS date,
    store,
    coalesce(sum(month), 0) AS month,
    coalesce(sum(week), 0) AS week
  FROM stores s
  LEFT JOIN transactions ON id = store_id
  GROUP BY store
  ORDER BY store;
  
  CREATE or REPLACE VIEW item_categories AS (
	with stock_type_strings as 
	(
	  select id, 'On essential drug list' as stock_type from item where essential_drug_list = true  union 
	  select id, 'Critical stock' as stock_type from item where critical_stock = true union
	  select id, 'Normal stock' as stock_type from item where normal_stock = true
	)
SELECT
	item.id,
    item.item_name, 
	CASE WHEN item_category.description IS NULL THEN 'NONE' ELSE item_category.description END AS category, 
	CASE WHEN item_category_level2.description IS NULL THEN 'NONE' ELSE item_category_level2.description END AS category_level2, 
	CASE WHEN item_category_level1.description IS NULL THEN 'NONE' ELSE item_category_level1.description END AS category_level1, 
	CASE WHEN item_category2.description IS NULL THEN 'NONE' ELSE item_category2.description END AS category2, 
	CASE WHEN item_category3.description IS NULL THEN 'NONE' ELSE item_category3.description END AS category3, 
	CASE WHEN ven_category = ''OR ven_category IS NULL THEN 'NONE' ELSE ven_category END AS ven_category, 
	essential_drug_list, 
	critical_stock, 
	normal_stock,
	CASE WHEN stock_type IS NULL THEN 'NONE' ELSE stock_type END AS stock_type
FROM 
	item 
	LEFT JOIN item_category ON category_id = item_category.id 
	LEFT JOIN item_category2 ON category2_id = item_category2.id 
	LEFT JOIN item_category3 ON category3_id = item_category3.id 
	LEFT JOIN item_category_level2 ON item_category.parent_id = item_category_level2.id 
	LEFT JOIN item_category_level1 ON item_category_level2.parent_id = item_category_level1.id
	LEFT JOIN stock_type_strings ON item.id = stock_type_strings.id
);
CREATE OR REPLACE VIEW public.store_categories 
AS SELECT store.name,
    store.code,
        CASE
            WHEN store.organisation_name::text = ''::text THEN 'NONE'::text::character varying
            ELSE store.organisation_name
        END AS organisation,
        CASE
            WHEN name_category1.* IS NULL THEN 'NONE'::text::character varying
            ELSE name_category1.description
        END AS category1,
        CASE
            WHEN name_category1_level2.description IS NULL THEN 'NONE'::text::character varying
            ELSE name_category1_level2.description
        END AS category1_level2,
        CASE
            WHEN name_category1_level1.description IS NULL THEN 'NONE'::text::character varying
            ELSE name_category1_level1.description
        END AS category1_level1,
        CASE
            WHEN name_category2.* IS NULL THEN 'NONE'::text::character varying
            ELSE name_category2.description
        END AS category2,
        CASE
            WHEN name_category3.* IS NULL THEN 'NONE'::text::character varying
            ELSE name_category3.description
        END AS category3,
        CASE
            WHEN name_category4.* IS NULL THEN 'NONE'::text::character varying
            ELSE name_category4.description
        END AS category4,
        CASE
            WHEN name_category5.* IS NULL THEN 'NONE'::text::character varying
            ELSE name_category5.description
        END AS category5,
        CASE
            WHEN name_category6.* IS NULL THEN 'NONE'::text::character varying
            ELSE name_category6.description
        END AS category6,
    store.store_mode AS mode,
    store.disabled
   FROM store
     LEFT JOIN name ON store.name_id::text = name.id::text
     LEFT JOIN name_category1 ON name_category1.id::text = name.category1_id::text
     LEFT JOIN name_category1_level2 ON name_category1.parent_id::text = name_category1_level2.id::text
     LEFT JOIN name_category1_level1 ON name_category1_level2.parent_id::text = name_category1_level1.id::text
     LEFT JOIN name_category2 ON name_category2.id::text = name.category2_id::text
     LEFT JOIN name_category3 ON name_category3.id::text = name.category3_id::text
     LEFT JOIN name_category4 ON name_category4.id::text = name.category4_id::text
     LEFT JOIN name_category5 ON name_category5.id::text = name.category5_id::text
     LEFT JOIN name_category6 ON name_category6.id::text = name.category4_id::text;
	 
	CALL public.cc_sensor_battery_log();
	
	GRANT CONNECT ON DATABASE dashboard TO coefficientTeam; 
	GRANT USAGE ON SCHEMA public TO coefficientTeam; 
	GRANT SELECT ON TABLE public.store TO coefficientTeam;
	GRANT SELECT ON TABLE public.store_categories TO coefficientTeam;
$$;
CREATE PROCEDURE public.pre_export()
    LANGUAGE sql
    AS $$
DROP VIEW IF EXISTS public.region_mos;
DROP VIEW IF EXISTS public.store_mos; 
DROP VIEW IF EXISTS public.store_transactions; 
DROP VIEW IF EXISTS public.store_categories;
DROP VIEW IF EXISTS public.item_categories;
DROP MATERIALIZED VIEW IF EXISTS public.msupply_usage_this_month;
$$;
CREATE PROCEDURE public.test()
    LANGUAGE plpgsql
    AS $$
DECLARE recStore RECORD; recItem Record; recTransLine Record;recDate Record;stockOnHand INT;
BEGIN
delete from aggregator where dataElement = 'StockOnHandDaily';
FOR recDate IN(select fulldate::date
from generate_series(
date '2019-01-01',
date '2019-01-01'+interval '-1 year',
'-1 day'::interval
)fulldate)LOOP
FOR recStore IN(SELECT store.id as storeId FROM store where disabled=False and store_mode <> 'supervisor' and store_mode <>'his' and store_mode <>'drug_registration')LOOP
FOR recItem IN(SELECT item.id as itemId, sum(il.stock_on_hand_tot)as stockOnHand FROM item join item_store_join isj 
			   on isj.store_id=recStore.storeId join item_line il on il.item_id=item.id group by itemId)LOOP
FOR recTransline IN(select t.type as tranTypes,(tl.quantity*tl.pack_size)as totalQty
from trans_line tl
join transact t on t.id=tl.transaction_ID
where tl.item_id=recItem.itemId and 
	  t.confirm_date>=recDate.fulldate and 
	tl.type in ('stock_in','stock_out')
	and t.status in ('cn', 'fn'))LOOP
If (recTransline.tranTypes<>'si')then
	recItem.stockOnHand:=recItem.stockOnHand-recTransline.totalQty; 
Else 
	recItem.stockOnHand:=recItem.stockOnHand+recTransline.totalQty; 
End if ; 
END LOOP;
insert into aggregator(storeID, itemID, value, fulldate, dataElement)
values(recStore.storeId, recItem.itemId, recItem.stockOnHand, recDate.fulldate, 'StockOnHandDaily');
END LOOP; 
END LOOP; 
END LOOP; 
END;
$$;
CREATE FUNCTION public.truncate_if_exists(tablename text) RETURNS void
    LANGUAGE plpgsql
    AS $$
begin
    perform 1
    from information_schema.tables 
    where table_name = tablename;
    if found then
        execute format('truncate %I', tablename);
    end if;
end $$;
CREATE FUNCTION public.year_month(d date) RETURNS character varying
    LANGUAGE sql
    AS $$
    select concat(extract(year from d), extract(month from d));
$$;
SET default_table_access_method = heap;
CREATE TABLE public.abbreviation (
    abbreviation text DEFAULT ''::text,
    expansion text DEFAULT ''::text,
    id text DEFAULT ''::text NOT NULL
);
CREATE TABLE public.account (
    id text DEFAULT ''::text NOT NULL,
    code text DEFAULT ''::text,
    description text DEFAULT ''::text,
    account_type text DEFAULT ''::text
);
CREATE TABLE public.admitted_from (
    id character varying(255) DEFAULT ''::character varying NOT NULL,
    name character varying(255) DEFAULT ''::character varying
);
CREATE TABLE public.adverse_drug_reaction (
    id text DEFAULT ''::text NOT NULL,
    store_id text DEFAULT ''::text,
    name_id text DEFAULT ''::text,
    user_id text DEFAULT ''::text,
    data jsonb,
    entry_date date,
    entry_time time without time zone DEFAULT '00:00:00'::time without time zone,
    form_schema_id text DEFAULT ''::text
);
CREATE TABLE public.aggregator (
    id integer NOT NULL,
    storeid text DEFAULT ''::text,
    itemid text DEFAULT ''::text,
    monthyear text DEFAULT ''::text,
    value double precision DEFAULT 0,
    fulldate date,
    dataelement text DEFAULT ''::text,
    temp1 double precision DEFAULT 0,
    temp2 double precision DEFAULT 0,
    temp3 double precision DEFAULT 0
);
CREATE SEQUENCE public.aggregator_id_seq
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;
ALTER SEQUENCE public.aggregator_id_seq OWNED BY public.aggregator.id;
CREATE TABLE public.asset (
    id text DEFAULT ''::text NOT NULL,
    description text DEFAULT ''::text,
    serial text DEFAULT ''::text,
    notes text DEFAULT ''::text,
    date_created date,
    date_last_status_change date,
    location_contact_id text DEFAULT ''::text,
    spare_name_id text DEFAULT ''::text,
    condition_id text DEFAULT ''::text,
    status_id text DEFAULT ''::text,
    type_id text DEFAULT ''::text,
    store_id text DEFAULT ''::text,
    proposed_status_id text DEFAULT ''::text,
    code text DEFAULT ''::text,
    make text DEFAULT ''::text,
    model text DEFAULT ''::text,
    supplier_name text DEFAULT ''::text,
    purchase_order_number text DEFAULT ''::text,
    date_acquisition date,
    date_next_maintenance_due date,
    date_last_verification date,
    date_disposal date,
    date_purchase_order date,
    date_in_service date,
    date_insurance_renewal date,
    location_name_id text DEFAULT ''::text,
    custodian_name text DEFAULT ''::text,
    custodian_phone_number text DEFAULT ''::text,
    custodian_email text DEFAULT ''::text,
    original_cost double precision DEFAULT 0,
    purchase_price double precision DEFAULT 0,
    purchase_costs double precision DEFAULT 0,
    disposal_value double precision DEFAULT 0,
    lifespan_months integer DEFAULT 0,
    insurer_name text DEFAULT ''::text,
    insurance_policy_number text DEFAULT ''::text,
    custodian_location text DEFAULT ''::text,
    chart_of_accounts jsonb
);
CREATE TABLE public.asset_condition (
    id text DEFAULT ''::text NOT NULL,
    description text DEFAULT ''::text,
    is_active boolean DEFAULT false
);
CREATE TABLE public.asset_document_type (
    id text DEFAULT ''::text NOT NULL,
    description text DEFAULT ''::text,
    display_order integer DEFAULT 0,
    is_active boolean DEFAULT false
);
CREATE TABLE public.asset_location (
    id character varying(255) DEFAULT ''::character varying NOT NULL,
    description character varying(80) DEFAULT ''::character varying
);
CREATE TABLE public.asset_property (
    id text DEFAULT ''::text NOT NULL,
    description text DEFAULT ''::text,
    information jsonb,
    type text DEFAULT ''::text,
    is_read_only boolean DEFAULT false,
    is_active boolean DEFAULT false,
    category text DEFAULT ''::text
);
CREATE TABLE public.asset_property_asset_join (
    id text DEFAULT ''::text NOT NULL,
    asset_id text DEFAULT ''::text,
    asset_property_id text DEFAULT ''::text,
    asset_property_value jsonb
);
CREATE TABLE public.asset_status (
    id text DEFAULT ''::text NOT NULL,
    description text DEFAULT ''::text,
    ids_can_select_after jsonb,
    can_be_first_status boolean DEFAULT false,
    is_active boolean DEFAULT false,
    is_a_final_status boolean DEFAULT false
);
CREATE TABLE public.asset_type (
    id text DEFAULT ''::text NOT NULL,
    description text DEFAULT ''::text,
    item_id text DEFAULT ''::text,
    is_active boolean DEFAULT false
);
CREATE TABLE public.authorisationqueue (
    id text DEFAULT ''::text NOT NULL,
    storeid text DEFAULT ''::text,
    recordid text DEFAULT ''::text,
    authoriserid text DEFAULT ''::text,
    status text DEFAULT ''::text,
    statusdate date,
    statustime time without time zone DEFAULT '00:00:00'::time without time zone,
    comment text DEFAULT ''::text,
    recordtype text DEFAULT ''::text,
    userid text DEFAULT ''::text,
    groupid text DEFAULT ''::text,
    priority integer DEFAULT 0,
    autoauthorisationdate date,
    autoauthorisationtime time without time zone DEFAULT '00:00:00'::time without time zone,
    ispriorityreached boolean DEFAULT false,
    userinfo text DEFAULT ''::text
);
CREATE TABLE public.authoriser (
    id text DEFAULT ''::text NOT NULL,
    storeid text DEFAULT ''::text,
    recordtype text DEFAULT ''::text,
    userid text DEFAULT ''::text,
    priority integer DEFAULT 0,
    reporttype text DEFAULT ''::text,
    reportname text DEFAULT ''::text,
    otherpartytag text DEFAULT ''::text,
    otherpartyid text DEFAULT ''::text,
    autoauthorisationperiod integer DEFAULT 0,
    shouldautoauthorise boolean DEFAULT false,
    is_active boolean DEFAULT false,
    list_master_id text DEFAULT ''::text
);
CREATE TABLE public.backorder (
    item_id text DEFAULT ''::text,
    quantity double precision DEFAULT 0,
    id text DEFAULT ''::text NOT NULL,
    comment text DEFAULT ''::text,
    name_id_customer text DEFAULT ''::text,
    "order date" date,
    type text DEFAULT ''::text,
    item_name text DEFAULT ''::text,
    name_id_supplier text DEFAULT ''::text,
    customer_transaction_id_ordered text DEFAULT ''::text,
    status text DEFAULT ''::text,
    spare_2 integer DEFAULT 0,
    order_line_id text DEFAULT ''::text,
    price double precision DEFAULT 0,
    units text DEFAULT ''::text,
    account_stock_id_spare text DEFAULT ''::text,
    account_purchases_id_spare text DEFAULT ''::text,
    account_income_id_spare text DEFAULT ''::text,
    store_id text DEFAULT ''::text
);
CREATE TABLE public.barcode (
    id text DEFAULT ''::text NOT NULL,
    itemid text DEFAULT ''::text,
    packsize integer DEFAULT 0,
    parentid text DEFAULT ''::text,
    manufacturerid text DEFAULT ''::text,
    barcode text DEFAULT ''::text,
    spare_1 text DEFAULT ''::text
);
CREATE TABLE public.bill_of_material (
    bom_master_id text DEFAULT ''::text,
    transaction_id text DEFAULT ''::text,
    item_id text DEFAULT ''::text,
    item_name text DEFAULT ''::text,
    spare_units_v180 text DEFAULT ''::text,
    line_number integer DEFAULT 0,
    quantity double precision DEFAULT 0,
    yeild double precision DEFAULT 0,
    total_used double precision DEFAULT 0,
    unit_id text DEFAULT ''::text,
    id text DEFAULT ''::text NOT NULL,
    spare integer DEFAULT 0
);
CREATE TABLE public.bom_master (
    item_id text DEFAULT ''::text,
    ingredient_item_id text DEFAULT ''::text,
    quantity double precision DEFAULT 0,
    units_id text DEFAULT ''::text,
    spare_units_v180 text DEFAULT ''::text,
    id text DEFAULT ''::text NOT NULL,
    line_number integer DEFAULT 0
);
CREATE TABLE public.box (
    id text DEFAULT ''::text NOT NULL,
    description text DEFAULT ''::text,
    weight double precision DEFAULT 0,
    volume double precision DEFAULT 0,
    transactionid text DEFAULT ''::text,
    length double precision DEFAULT 0,
    width double precision DEFAULT 0,
    height double precision DEFAULT 0,
    custom_data jsonb,
    type_id text DEFAULT ''::text
);
CREATE TABLE public.box_line (
    id text DEFAULT ''::text NOT NULL,
    box_id text DEFAULT ''::text,
    trans_line_id text DEFAULT ''::text,
    quantity double precision DEFAULT 0,
    weight double precision DEFAULT 0,
    volume double precision DEFAULT 0,
    confirmed_by text DEFAULT ''::text,
    confirmed_date date,
    confirmed_time time without time zone DEFAULT '00:00:00'::time without time zone
);
CREATE TABLE public.box_type (
    id text DEFAULT ''::text NOT NULL,
    description text DEFAULT ''::text,
    length double precision DEFAULT 0,
    width double precision DEFAULT 0,
    height double precision DEFAULT 0,
    is_active boolean DEFAULT false,
    number_available integer DEFAULT 0,
    store_id text DEFAULT ''::text
);
CREATE TABLE public.budget_period (
    id text DEFAULT ''::text NOT NULL,
    period_description text DEFAULT ''::text,
    start_date date,
    end_date date,
    is_locked boolean DEFAULT false,
    type text DEFAULT ''::text
);
CREATE TABLE public.chart_of_accounts (
    id text DEFAULT ''::text NOT NULL,
    description text DEFAULT ''::text,
    parent_id text DEFAULT ''::text
);
CREATE TABLE public.clinician (
    id text DEFAULT ''::text NOT NULL,
    code text DEFAULT ''::text,
    last_name text DEFAULT ''::text,
    initials text DEFAULT ''::text,
    first_name text DEFAULT ''::text,
    registration_code text DEFAULT ''::text,
    category text DEFAULT ''::text,
    address1 text DEFAULT ''::text,
    address2 text DEFAULT ''::text,
    phone text DEFAULT ''::text,
    mobile text DEFAULT ''::text,
    email text DEFAULT ''::text,
    female boolean DEFAULT false,
    active boolean DEFAULT false,
    store_id text DEFAULT ''::text
);
CREATE TABLE public.clinician_store_join (
    prescriber_id text DEFAULT ''::text,
    id text DEFAULT ''::text NOT NULL,
    store_id text DEFAULT ''::text
);
CREATE TABLE public.contact (
    name_id text DEFAULT ''::text,
    first text DEFAULT ''::text,
    "position" text DEFAULT ''::text,
    spare boolean DEFAULT false,
    comment text DEFAULT ''::text,
    last text DEFAULT ''::text,
    phone text DEFAULT ''::text,
    email text DEFAULT ''::text,
    category text DEFAULT ''::text,
    category2 text DEFAULT ''::text,
    category3 text DEFAULT ''::text,
    id text DEFAULT ''::text NOT NULL,
    address1 text DEFAULT ''::text,
    address2 text DEFAULT ''::text,
    country text DEFAULT ''::text,
    web_username text DEFAULT ''::text,
    web_password text DEFAULT ''::text,
    is_active_web_user boolean DEFAULT false
);
CREATE TABLE public.contact_group (
    id text DEFAULT ''::text NOT NULL,
    description text DEFAULT ''::text,
    spare integer DEFAULT 0
);
CREATE TABLE public.contact_group_membership (
    id text DEFAULT ''::text NOT NULL,
    contact_id text DEFAULT ''::text,
    contact_group_id text DEFAULT ''::text,
    spare integer DEFAULT 0
);
CREATE TABLE public.currency (
    id text DEFAULT ''::text NOT NULL,
    rate double precision DEFAULT 0,
    currency text DEFAULT ''::text,
    is_home_currency boolean DEFAULT false,
    date_updated date,
    is_active boolean DEFAULT false
);
CREATE TABLE public.custom_data (
    id text DEFAULT ''::text NOT NULL,
    created_by_user_id text DEFAULT ''::text,
    date_created date,
    real_1 double precision DEFAULT 0,
    text_1 text DEFAULT ''::text,
    date_1 date,
    real_2 double precision DEFAULT 0,
    text_2 text DEFAULT ''::text,
    date_2 date,
    category_id text DEFAULT ''::text,
    real_3 text DEFAULT ''::text,
    text_3 text DEFAULT ''::text,
    date_3 date,
    real_4 double precision DEFAULT 0,
    text_4 text DEFAULT ''::text,
    date_4 date
);
CREATE TABLE public.custom_data_category (
    id text DEFAULT ''::text NOT NULL,
    description text DEFAULT ''::text,
    settings bytea,
    entered_by_id text DEFAULT ''::text,
    date_created date
);
CREATE TABLE public.custom_stock_5 (
    id text DEFAULT ''::text NOT NULL,
    description text DEFAULT ''::text,
    is_hidden boolean DEFAULT false
);
CREATE TABLE public.custom_stock_6 (
    id text DEFAULT ''::text NOT NULL,
    description text DEFAULT ''::text,
    is_hidden boolean DEFAULT false
);
CREATE TABLE public.custom_stock_7 (
    id text DEFAULT ''::text NOT NULL,
    description text DEFAULT ''::text,
    is_hidden boolean DEFAULT false
);
CREATE TABLE public.custom_stock_8 (
    id text DEFAULT ''::text NOT NULL,
    description text DEFAULT ''::text,
    is_hidden boolean DEFAULT false
);
CREATE SEQUENCE public.d_aggregator_monthly_soh_id_seq
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;
CREATE TABLE public.d_aggregator_monthly_soh (
    id integer DEFAULT nextval('public.d_aggregator_monthly_soh_id_seq'::regclass) NOT NULL,
    storeid text DEFAULT ''::text,
    itemid text DEFAULT ''::text,
    monthyear text DEFAULT ''::text,
    value double precision DEFAULT 0,
    fulldate date,
    dataelement text DEFAULT ''::text,
    temp1 double precision DEFAULT 0
);
CREATE TABLE public.d_daily_sensor_battery_log (
    sensor_id text DEFAULT ''::text NOT NULL,
    name text DEFAULT ''::text NOT NULL,
    log_datetime timestamp with time zone DEFAULT CURRENT_TIMESTAMP NOT NULL,
    batterylevel double precision DEFAULT 0,
    is_active boolean DEFAULT false,
    last_temperature_log_datetime timestamp with time zone DEFAULT CURRENT_TIMESTAMP
);
CREATE TABLE public.d_monthly_item_active_store_join (
    item_id text DEFAULT ''::text NOT NULL,
    store_ids jsonb,
    monthyear text DEFAULT ''::text NOT NULL,
    is_critical boolean DEFAULT false
);
CREATE TABLE public.d_msupply_monthly_usage (
    index integer NOT NULL,
    yearmonth text NOT NULL,
    usage text NOT NULL,
    store_id text NOT NULL,
    value double precision DEFAULT 0,
    score integer DEFAULT 0,
    updated_date timestamp without time zone DEFAULT CURRENT_TIMESTAMP
);
CREATE TABLE public.dashboard_report (
    id text DEFAULT ''::text NOT NULL,
    name text DEFAULT ''::text,
    method_code text DEFAULT ''::text,
    update_period integer DEFAULT 0,
    last_updated_date date,
    last_updated_time time without time zone DEFAULT '00:00:00'::time without time zone,
    is_active boolean DEFAULT false,
    minimum_update_period integer DEFAULT 0,
    "json" text DEFAULT ''::text,
    report_parameters jsonb,
    runafter time without time zone DEFAULT '00:00:00'::time without time zone,
    notificationrules jsonb
);
CREATE TABLE public.dashboard_store_report (
    id text DEFAULT ''::text NOT NULL,
    store_id text DEFAULT ''::text,
    "json" text DEFAULT ''::text,
    report_id text DEFAULT ''::text,
    type text DEFAULT ''::text,
    title text DEFAULT ''::text,
    tab_name text DEFAULT ''::text
);
CREATE TABLE public.dashboard_tab (
    id text DEFAULT ''::text NOT NULL,
    internal_name text DEFAULT ''::text,
    banner text DEFAULT ''::text,
    reports jsonb,
    comment text DEFAULT ''::text,
    tab_name text DEFAULT ''::text,
    spare_7 text DEFAULT ''::text,
    spare_8 text DEFAULT ''::text,
    spare_9 text DEFAULT ''::text
);
CREATE TABLE public.dhis2_data_value (
    id text DEFAULT ''::text NOT NULL,
    item_id text DEFAULT ''::text,
    name_id text DEFAULT ''::text,
    data jsonb,
    tracked_entity_id text DEFAULT ''::text,
    data_element_id text DEFAULT ''::text,
    occurred_date date,
    occurred_time time without time zone DEFAULT '00:00:00'::time without time zone,
    dhis2_event_id text DEFAULT ''::text
);
CREATE TABLE public.diagnosis (
    id text DEFAULT ''::text NOT NULL,
    icd_code text DEFAULT ''::text,
    icd_description text DEFAULT ''::text,
    valid_till date,
    notes text DEFAULT ''::text
);
CREATE TABLE public.doc_reference (
    id text DEFAULT ''::text NOT NULL,
    file_name text DEFAULT ''::text,
    table_no integer DEFAULT 0,
    linked_record_id text DEFAULT ''::text,
    date_original date,
    time_original time without time zone DEFAULT '00:00:00'::time without time zone,
    date_first_saved date,
    time_first_saved time without time zone DEFAULT '00:00:00'::time without time zone,
    date_last_modified date,
    md5_checksum text DEFAULT ''::text,
    user_id_first_saved text DEFAULT ''::text,
    user_id_last_modified text DEFAULT ''::text,
    version_no integer DEFAULT 0,
    stored_document bytea,
    type_id text DEFAULT ''::text
);
CREATE TABLE public.drug_interaction (
    id text DEFAULT ''::text NOT NULL,
    affected_group_id text DEFAULT ''::text,
    affecting_group_id text DEFAULT ''::text,
    notes text DEFAULT ''::text,
    alert_message text DEFAULT ''::text,
    action text DEFAULT ''::text,
    clinical_significance text DEFAULT ''::text,
    quality_of_evidence text DEFAULT ''::text,
    source_id text DEFAULT ''::text,
    author text DEFAULT ''::text,
    date_modified date
);
CREATE TABLE public.drug_interaction_group (
    id text DEFAULT ''::text NOT NULL,
    name text DEFAULT ''::text
);
CREATE TABLE public.drug_register (
    id text DEFAULT ''::text NOT NULL,
    item_id text DEFAULT ''::text,
    supplier_id text DEFAULT ''::text,
    manufacturer_id text DEFAULT ''::text,
    trade_name text DEFAULT ''::text,
    pack_size text DEFAULT ''::text,
    application_date date,
    application_number integer DEFAULT 0,
    approval_date date,
    registration_expiry_date date,
    modified_date date,
    modified_time time without time zone DEFAULT '00:00:00'::time without time zone,
    created_by text DEFAULT ''::text,
    registration_number text DEFAULT ''::text,
    is_currently_registered boolean DEFAULT false,
    comment text DEFAULT ''::text,
    category1_id text DEFAULT ''::text,
    category2_id text DEFAULT ''::text,
    category3 text DEFAULT ''::text,
    category4 text DEFAULT ''::text,
    status_id text DEFAULT ''::text
);
CREATE TABLE public.drug_register_category1 (
    id text DEFAULT ''::text NOT NULL,
    description text DEFAULT ''::text
);
CREATE TABLE public.drug_register_category2 (
    id text DEFAULT ''::text NOT NULL,
    description text DEFAULT ''::text
);
CREATE TABLE public.drug_register_status (
    id text DEFAULT ''::text NOT NULL,
    spare_active boolean DEFAULT false,
    spare_headline text DEFAULT ''::text,
    description text DEFAULT ''::text,
    spare_date date,
    color integer DEFAULT 0
);
CREATE TABLE public.ethnicity (
    id text DEFAULT ''::text NOT NULL,
    name text DEFAULT ''::text
);
CREATE TABLE public.export_log (
    id character varying,
    datetime timestamp without time zone,
    start_timestamp integer,
    end_timestamp integer,
    event_type character varying,
    comment character varying
);
CREATE TABLE public.form_schema (
    id text DEFAULT ''::text NOT NULL,
    json_schema jsonb,
    type text DEFAULT ''::text,
    version integer DEFAULT 0,
    ui_schema jsonb
);
CREATE TABLE public.geojson (
    id character varying,
    data json,
    name character varying
);
CREATE TABLE public.goods_received (
    id text DEFAULT ''::text NOT NULL,
    purchase_order_id text DEFAULT ''::text,
    entry_date date,
    received_date date,
    supplier_reference text DEFAULT ''::text,
    user_id_created text DEFAULT ''::text,
    user_id_modified text DEFAULT ''::text,
    status text DEFAULT ''::text,
    store_id text DEFAULT ''::text,
    budget_id text DEFAULT ''::text,
    donor_id text DEFAULT ''::text,
    serial_number integer DEFAULT 0,
    comment text DEFAULT ''::text,
    linked_transaction_id text DEFAULT ''::text
);
CREATE TABLE public.goods_received_line (
    id text DEFAULT ''::text NOT NULL,
    goods_received_id text DEFAULT ''::text,
    order_line_id text DEFAULT ''::text,
    pack_received double precision DEFAULT 0,
    quantity_received double precision DEFAULT 0,
    batch_received text DEFAULT ''::text,
    weight_per_pack double precision DEFAULT 0,
    expiry_date date,
    line_number integer DEFAULT 0,
    item_id text DEFAULT ''::text,
    item_name text DEFAULT ''::text,
    location_id text DEFAULT ''::text,
    volume_per_pack double precision DEFAULT 0,
    manufacturer_id text DEFAULT ''::text,
    pack_quan_in_inner integer DEFAULT 0,
    pack_inners_in_outer integer DEFAULT 0,
    spare_note_has_been_actioned boolean DEFAULT false,
    is_authorised boolean DEFAULT false,
    authorised_comment text DEFAULT ''::text,
    comment text DEFAULT ''::text,
    kit_data jsonb,
    cost_price double precision DEFAULT 0,
    remotecustomerinvoicelineid text DEFAULT ''::text,
    custom_stock_field_1 text DEFAULT ''::text,
    custom_stock_field_2 text DEFAULT ''::text,
    custom_stock_field_3 text DEFAULT ''::text,
    custom_stock_field_4 text DEFAULT ''::text
);
CREATE TABLE public.his_bed (
    id character varying(255) DEFAULT ''::character varying NOT NULL,
    bed_number character varying(255) DEFAULT ''::character varying,
    room character varying(255) DEFAULT ''::character varying,
    ward_id character varying(255) DEFAULT ''::character varying
);
CREATE TABLE public.his_birth (
    id character varying(255) DEFAULT ''::character varying NOT NULL,
    mother_id character varying(255) DEFAULT ''::character varying,
    child_id character varying(255) DEFAULT ''::character varying,
    encounter_id character varying(255) DEFAULT ''::character varying,
    birth_status character varying(30) DEFAULT ''::character varying,
    birth_date date,
    birth_time time without time zone DEFAULT '00:00:00'::time without time zone,
    birth_weight double precision DEFAULT 0,
    birth_length double precision DEFAULT 0,
    concurrent_births integer DEFAULT 0
);
CREATE TABLE public.his_discharge_to (
    id character varying(255) DEFAULT ''::character varying NOT NULL,
    description character varying(20) DEFAULT ''::character varying
);
CREATE TABLE public.his_disease (
    id character varying(255) DEFAULT ''::character varying NOT NULL,
    icd_code character varying(255) DEFAULT ''::character varying,
    icd_description character varying(255) DEFAULT ''::character varying,
    valid_till date,
    notes character varying(255) DEFAULT ''::character varying
);
CREATE TABLE public.his_encounter (
    id character varying(255) DEFAULT ''::character varying NOT NULL,
    patient_id character varying(255) DEFAULT ''::character varying,
    start_date date,
    start_time time without time zone DEFAULT '00:00:00'::time without time zone,
    discharge_date date,
    estimated_discharge_date date,
    discharge_id character varying(255) DEFAULT ''::character varying,
    transport_method_id character varying(255) DEFAULT ''::character varying,
    admitted_from_id character varying(255) DEFAULT ''::character varying
);
CREATE TABLE public.his_encounter_disease (
    id character varying(255) DEFAULT ''::character varying NOT NULL,
    encounter_id character varying(255) DEFAULT ''::character varying,
    disease_id character varying(255) DEFAULT ''::character varying,
    rank integer DEFAULT 0,
    notes character varying(255) DEFAULT ''::character varying,
    diagnozed_by character varying(255) DEFAULT ''::character varying
);
CREATE TABLE public.his_encounter_location (
    id character varying(255) DEFAULT ''::character varying NOT NULL,
    encounter_id character varying(255) DEFAULT ''::character varying,
    bed_id character varying(255) DEFAULT ''::character varying,
    date_from date,
    date_end date,
    time_from time without time zone DEFAULT '00:00:00'::time without time zone,
    time_end time without time zone DEFAULT '00:00:00'::time without time zone
);
CREATE TABLE public.his_procedure (
    id character varying(255) DEFAULT ''::character varying NOT NULL,
    encounter_location_id character varying(255) DEFAULT ''::character varying,
    item_id character varying(255) DEFAULT ''::character varying,
    invoice_id character varying(255) DEFAULT ''::character varying,
    encounter_id character varying(255) DEFAULT ''::character varying
);
CREATE TABLE public.his_ward (
    id character varying(255) DEFAULT ''::character varying NOT NULL,
    name character varying(255) DEFAULT ''::character varying,
    description character varying(255) DEFAULT ''::character varying,
    notes character varying(255) DEFAULT ''::character varying,
    coord_left smallint DEFAULT 0,
    coord_top smallint DEFAULT 0,
    coord_width smallint DEFAULT 0,
    coord_height smallint DEFAULT 0
);
CREATE TABLE public.id_changes (
    table_num integer DEFAULT 0,
    old_id integer DEFAULT 0,
    new_uuid character varying(255) DEFAULT ''::character varying,
    id character varying(255) DEFAULT ''::character varying NOT NULL
);
CREATE TABLE public.incoterm (
    id character varying(255) DEFAULT ''::character varying NOT NULL,
    code text DEFAULT ''::text,
    description text DEFAULT ''::text
);
CREATE TABLE public.indicator_attribute (
    id text DEFAULT ''::text NOT NULL,
    indicator_id text DEFAULT ''::text,
    description text DEFAULT ''::text,
    code text DEFAULT ''::text,
    index integer DEFAULT 0,
    is_required boolean DEFAULT false,
    value_type text DEFAULT ''::text,
    axis text DEFAULT ''::text,
    is_active boolean DEFAULT false,
    default_value text DEFAULT ''::text
);
CREATE TABLE public.indicator_value (
    id text DEFAULT ''::text NOT NULL,
    facility_id text DEFAULT ''::text,
    period_id text DEFAULT ''::text,
    column_id text DEFAULT ''::text,
    row_id text DEFAULT ''::text,
    value text DEFAULT ''::text,
    store_id text DEFAULT ''::text
);
CREATE TABLE public.insuranceprovider (
    id text DEFAULT ''::text NOT NULL,
    providername text DEFAULT ''::text,
    comment text DEFAULT ''::text,
    prescriptionvaliditydays integer DEFAULT 0,
    isactive boolean DEFAULT false
);
CREATE TABLE public.integration (
    id text DEFAULT ''::text NOT NULL,
    api_url text DEFAULT ''::text,
    name text DEFAULT ''::text,
    type text DEFAULT ''::text,
    email text DEFAULT ''::text,
    password text DEFAULT ''::text,
    token text DEFAULT ''::text,
    enabled boolean DEFAULT false,
    additionaldata jsonb
);
CREATE TABLE public.item (
    id text DEFAULT ''::text NOT NULL,
    item_name text DEFAULT ''::text,
    start_of_year_date date,
    manufacture_method text DEFAULT ''::text,
    default_pack_size double precision DEFAULT 0,
    dose_picture bytea,
    atc_category text DEFAULT ''::text,
    medication_purpose text DEFAULT ''::text,
    instructions text DEFAULT ''::text,
    user_field_7 boolean DEFAULT false,
    flags text DEFAULT ''::text,
    ddd_value text DEFAULT ''::text,
    code text DEFAULT ''::text,
    other_names text DEFAULT ''::text,
    type_of text DEFAULT ''::text,
    price_editable boolean DEFAULT false,
    margin double precision DEFAULT 0,
    barcode_spare text DEFAULT ''::text,
    spare_ignore_for_orders boolean DEFAULT false,
    sms_pack_size double precision DEFAULT 0,
    expiry_date_mandatory boolean DEFAULT false,
    volume_per_pack double precision DEFAULT 0,
    department_id text DEFAULT ''::text,
    weight double precision DEFAULT 0,
    essential_drug_list boolean DEFAULT false,
    catalogue_code text DEFAULT ''::text,
    indic_price double precision DEFAULT 0,
    user_field_1 text DEFAULT ''::text,
    spare_hold_for_issue boolean DEFAULT false,
    builds_only boolean DEFAULT false,
    reference_bom_quantity double precision DEFAULT 0,
    use_bill_of_materials boolean DEFAULT false,
    description text DEFAULT ''::text,
    spare_hold_for_receive boolean DEFAULT false,
    message text DEFAULT ''::text,
    interaction_group_id text DEFAULT ''::text,
    spare_pack_to_one_on_receive boolean DEFAULT false,
    cross_ref_item_id text DEFAULT ''::text,
    strength text DEFAULT ''::text,
    user_field_4 boolean DEFAULT false,
    user_field_6 text DEFAULT ''::text,
    spare_internal_analysis double precision DEFAULT 0,
    user_field_2 text DEFAULT ''::text,
    user_field_3 text DEFAULT ''::text,
    "ddd factor" double precision DEFAULT 0,
    account_stock_id text DEFAULT ''::text,
    account_purchases_id text DEFAULT ''::text,
    account_income_id text DEFAULT ''::text,
    unit_id text DEFAULT ''::text,
    outer_pack_size integer DEFAULT 0,
    category_id text DEFAULT ''::text,
    abc_category text DEFAULT ''::text,
    warning_quantity integer DEFAULT 0,
    user_field_5 double precision DEFAULT 0,
    print_units_in_dis_labels boolean DEFAULT false,
    volume_per_outer_pack double precision DEFAULT 0,
    normal_stock boolean DEFAULT false,
    critical_stock boolean DEFAULT false,
    spare_non_stock boolean DEFAULT false,
    non_stock_name_id text DEFAULT ''::text,
    is_sync boolean DEFAULT false,
    sms_code text DEFAULT ''::text,
    category2_id text DEFAULT ''::text,
    category3_id text DEFAULT ''::text,
    buy_price double precision DEFAULT 0,
    ven_category text DEFAULT ''::text,
    universalcodes_code text DEFAULT ''::text,
    universalcodes_name text DEFAULT ''::text,
    kit_data jsonb,
    custom_data jsonb,
    doses integer DEFAULT 0,
    is_vaccine boolean DEFAULT false,
    restricted_location_type_id text DEFAULT ''::text,
    product_specifications text DEFAULT ''::text
);
CREATE TABLE public.item_amc_projection (
    id text DEFAULT ''::text NOT NULL,
    item_id text DEFAULT ''::text,
    store_id text DEFAULT ''::text,
    year_month integer DEFAULT 0,
    projection_value double precision DEFAULT 0,
    projection_type text DEFAULT ''::text
);
CREATE TABLE public.item_category (
    id text DEFAULT ''::text NOT NULL,
    description text DEFAULT ''::text,
    sort_order integer DEFAULT 0,
    summary_only boolean DEFAULT false,
    parent_id text DEFAULT ''::text,
    custom_data jsonb
);
CREATE TABLE public.item_category2 (
    id text DEFAULT ''::text NOT NULL,
    description text DEFAULT ''::text,
    sort_order integer DEFAULT 0,
    summary_only boolean DEFAULT false
);
CREATE TABLE public.item_category3 (
    id text DEFAULT ''::text NOT NULL,
    description text DEFAULT ''::text,
    sort_order integer DEFAULT 0,
    summary_only boolean DEFAULT false
);
CREATE TABLE public.item_category_level1 (
    id text DEFAULT ''::text NOT NULL,
    description text DEFAULT ''::text,
    sort_order integer DEFAULT 0,
    summary_only boolean DEFAULT false,
    custom_data jsonb
);
CREATE TABLE public.item_category_level2 (
    id text DEFAULT ''::text NOT NULL,
    description text DEFAULT ''::text,
    sort_order integer DEFAULT 0,
    summary_only boolean DEFAULT false,
    parent_id text DEFAULT ''::text
);
CREATE VIEW public.item_categories AS
 WITH stock_type_strings AS (
         SELECT item_1.id,
            'On essential drug list'::text AS stock_type
           FROM public.item item_1
          WHERE (item_1.essential_drug_list = true)
        UNION
         SELECT item_1.id,
            'Critical stock'::text AS stock_type
           FROM public.item item_1
          WHERE (item_1.critical_stock = true)
        UNION
         SELECT item_1.id,
            'Normal stock'::text AS stock_type
           FROM public.item item_1
          WHERE (item_1.normal_stock = true)
        )
 SELECT item.id,
    item.item_name,
        CASE
            WHEN (item_category.description IS NULL) THEN 'NONE'::text
            ELSE item_category.description
        END AS category,
        CASE
            WHEN (item_category_level2.description IS NULL) THEN 'NONE'::text
            ELSE item_category_level2.description
        END AS category_level2,
        CASE
            WHEN (item_category_level1.description IS NULL) THEN 'NONE'::text
            ELSE item_category_level1.description
        END AS category_level1,
        CASE
            WHEN (item_category2.description IS NULL) THEN 'NONE'::text
            ELSE item_category2.description
        END AS category2,
        CASE
            WHEN (item_category3.description IS NULL) THEN 'NONE'::text
            ELSE item_category3.description
        END AS category3,
        CASE
            WHEN ((item.ven_category = ''::text) OR (item.ven_category IS NULL)) THEN 'NONE'::text
            ELSE item.ven_category
        END AS ven_category,
    item.essential_drug_list,
    item.critical_stock,
    item.normal_stock,
        CASE
            WHEN (stock_type_strings.stock_type IS NULL) THEN 'NONE'::text
            ELSE stock_type_strings.stock_type
        END AS stock_type
   FROM ((((((public.item
     LEFT JOIN public.item_category ON ((item.category_id = item_category.id)))
     LEFT JOIN public.item_category2 ON ((item.category2_id = item_category2.id)))
     LEFT JOIN public.item_category3 ON ((item.category3_id = item_category3.id)))
     LEFT JOIN public.item_category_level2 ON ((item_category.parent_id = item_category_level2.id)))
     LEFT JOIN public.item_category_level1 ON ((item_category_level2.parent_id = item_category_level1.id)))
     LEFT JOIN stock_type_strings ON ((item.id = stock_type_strings.id)));
CREATE TABLE public.item_department (
    id text DEFAULT ''::text NOT NULL,
    department text DEFAULT ''::text,
    issue boolean DEFAULT false,
    order_number integer DEFAULT 0
);
CREATE TABLE public.item_direction (
    item_id text DEFAULT ''::text,
    priority integer DEFAULT 0,
    directions text DEFAULT ''::text,
    id text DEFAULT ''::text NOT NULL
);
CREATE TABLE public.item_line (
    store_id text DEFAULT ''::text,
    item_id text DEFAULT ''::text,
    pack_size double precision DEFAULT 0,
    expiry_date date,
    batch text DEFAULT ''::text,
    available double precision DEFAULT 0,
    program_id text DEFAULT ''::text,
    cost_price double precision DEFAULT 0,
    sell_price double precision DEFAULT 0,
    hold boolean DEFAULT false,
    initial_quan double precision DEFAULT 0,
    id text DEFAULT ''::text NOT NULL,
    quantity double precision DEFAULT 0,
    name_id text DEFAULT ''::text,
    manufacturer_id text DEFAULT ''::text,
    location_id text DEFAULT ''::text,
    volume_per_pack double precision DEFAULT 0,
    stock_on_hand_tot double precision DEFAULT 0,
    total_volume double precision DEFAULT 0,
    user_1 text DEFAULT ''::text,
    user_2 text DEFAULT ''::text,
    user_3 text DEFAULT ''::text,
    user_4 text DEFAULT ''::text,
    pack_quan_per_inner integer DEFAULT 0,
    pack_inners_per_outer integer DEFAULT 0,
    note text DEFAULT ''::text,
    vvm_status text DEFAULT ''::text,
    donor_id text DEFAULT ''::text,
    total_cost double precision DEFAULT 0,
    user_5_id text DEFAULT ''::text,
    user_6_id text DEFAULT ''::text,
    user_7_id text DEFAULT ''::text,
    user_8_id text DEFAULT ''::text,
    kit_data jsonb,
    barcodeid text DEFAULT ''::text,
    extradata jsonb,
    repack_original_trans_line_id text DEFAULT ''::text,
    weight_per_pack double precision DEFAULT 0,
    om_item_variant_id text DEFAULT ''::text
);
CREATE TABLE public.item_line_note (
    id text DEFAULT ''::text NOT NULL,
    il_id text DEFAULT ''::text,
    vvm_status text DEFAULT ''::text,
    entered_by_id text DEFAULT ''::text,
    comment text DEFAULT ''::text,
    date date
);
CREATE TABLE public.item_note (
    item_id text DEFAULT ''::text,
    date date,
    note text DEFAULT ''::text,
    whentodisplay text DEFAULT ''::text,
    created_by_user_id text DEFAULT ''::text,
    modified_by_user_id text DEFAULT ''::text,
    store_id text DEFAULT ''::text,
    color_code smallint DEFAULT 0,
    beep_times smallint DEFAULT 0,
    id text DEFAULT ''::text NOT NULL,
    spare integer DEFAULT 0
);
CREATE TABLE public.item_property_join (
    id text DEFAULT ''::text NOT NULL,
    item_id text DEFAULT ''::text,
    property_id text DEFAULT ''::text,
    value jsonb
);
CREATE TABLE public.item_store_join (
    id text DEFAULT ''::text NOT NULL,
    item_id text DEFAULT ''::text,
    store_id text DEFAULT ''::text,
    default_location_id text DEFAULT ''::text,
    location_bulk_id text DEFAULT ''::text,
    include_on_price_list boolean DEFAULT false,
    indic_price double precision DEFAULT 0,
    report_quantity double precision DEFAULT 0,
    minimum_stock integer DEFAULT 0,
    pack_to_one boolean DEFAULT false,
    default_price double precision DEFAULT 0,
    hold_for_issue boolean DEFAULT false,
    margin double precision DEFAULT 0,
    inactive boolean DEFAULT false,
    pack_to_one_allow boolean DEFAULT false,
    restricted_location_type_id text DEFAULT ''::text,
    non_stock boolean DEFAULT false,
    non_stock_name_id text DEFAULT ''::text,
    forecast_method integer DEFAULT 0,
    estimated_amc integer DEFAULT 0,
    amc_modification_factor integer DEFAULT 0,
    projection_for_calcs text DEFAULT ''::text,
    hold_for_receive boolean DEFAULT false,
    ignore_for_orders boolean DEFAULT false,
    maximum_stock double precision DEFAULT 0,
    custom_data jsonb,
    pickface_pack_size integer DEFAULT 0,
    pickface_replenish_at_packs double precision DEFAULT 0,
    pickface_replenish_up_to_packs double precision DEFAULT 0,
    pickface_location_id text DEFAULT ''::text,
    bulk_replenish_at_packs double precision DEFAULT 0,
    bulk_replenish_up_to_packs double precision DEFAULT 0
);
CREATE TABLE public.item_warning_link (
    spare integer DEFAULT 0,
    item_id text DEFAULT ''::text,
    warning_id text DEFAULT ''::text,
    priority boolean DEFAULT false,
    id text DEFAULT ''::text NOT NULL
);
CREATE TABLE public.label (
    id text DEFAULT ''::text NOT NULL,
    heading text DEFAULT ''::text,
    body text DEFAULT ''::text,
    footer_left_1 text DEFAULT ''::text,
    footer_right_1 text DEFAULT ''::text,
    description text DEFAULT ''::text,
    footer_left_2 text DEFAULT ''::text,
    footer_right_2 text DEFAULT ''::text,
    footer_centred text DEFAULT ''::text,
    heading_font_size double precision DEFAULT 0,
    footer_font_size double precision DEFAULT 0,
    body_font_size double precision DEFAULT 0,
    line_height double precision DEFAULT 0,
    footer_font_size_1 double precision DEFAULT 0,
    footer_font_size_2 double precision DEFAULT 0,
    num_labels_on_single_label integer DEFAULT 0
);
CREATE TABLE public.list_local_line (
    id text DEFAULT ''::text NOT NULL,
    spare_name_id text DEFAULT ''::text,
    item_id text DEFAULT ''::text,
    imprest_quantity double precision DEFAULT 0,
    list_master_name_join_id text DEFAULT ''::text,
    line_no integer DEFAULT 0,
    price double precision DEFAULT 0
);
CREATE TABLE public.list_master (
    id text DEFAULT ''::text NOT NULL,
    description text DEFAULT ''::text,
    date_created date,
    created_by_user_id text DEFAULT ''::text,
    note text DEFAULT ''::text,
    gets_new_items boolean DEFAULT false,
    tags jsonb,
    isprogram boolean DEFAULT false,
    programsettings jsonb,
    code text DEFAULT ''::text,
    ispatientlist boolean DEFAULT false,
    is_hiv boolean DEFAULT false,
    issupplierhubcatalog boolean DEFAULT false,
    inactive boolean DEFAULT false,
    is_immunisation boolean DEFAULT false,
    is_default_price_list boolean DEFAULT false,
    discount_percentage double precision DEFAULT 0
);
CREATE TABLE public.list_master_line (
    id text DEFAULT ''::text NOT NULL,
    item_master_id text DEFAULT ''::text,
    item_id text DEFAULT ''::text,
    imprest_quan double precision DEFAULT 0,
    order_number integer DEFAULT 0,
    price double precision DEFAULT 0
);
CREATE TABLE public.list_master_name_join (
    id text DEFAULT ''::text NOT NULL,
    description text DEFAULT ''::text,
    name_id text DEFAULT ''::text,
    list_master_id text DEFAULT ''::text,
    include_web boolean DEFAULT false,
    include_imprest boolean DEFAULT false,
    include_stock_hist boolean DEFAULT false,
    price_list boolean DEFAULT false
);
CREATE TABLE public.location (
    id text DEFAULT ''::text NOT NULL,
    code text DEFAULT ''::text,
    description text DEFAULT ''::text,
    comment text DEFAULT ''::text,
    volume double precision DEFAULT 0,
    type_id text DEFAULT ''::text,
    object_type text DEFAULT ''::text,
    parent_id text DEFAULT ''::text,
    colour text DEFAULT ''::text,
    bottom_y_coordinate double precision DEFAULT 0,
    summary_only boolean DEFAULT false,
    store_id text DEFAULT ''::text,
    priority integer DEFAULT 0,
    hold boolean DEFAULT false,
    replenishment_type text DEFAULT ''::text,
    asset_id text DEFAULT ''::text
);
CREATE TABLE public.location_coordinate (
    id text DEFAULT ''::text NOT NULL,
    location_id text DEFAULT ''::text,
    point_num integer DEFAULT 0,
    x double precision DEFAULT 0,
    y double precision DEFAULT 0
);
CREATE TABLE public.location_movement (
    id text DEFAULT ''::text NOT NULL,
    location_id text DEFAULT ''::text,
    enter_date date,
    enter_time time without time zone DEFAULT '00:00:00'::time without time zone,
    exit_date date,
    exit_time time without time zone DEFAULT '00:00:00'::time without time zone,
    item_line_id text DEFAULT ''::text,
    store_id text DEFAULT ''::text
);
CREATE TABLE public.location_type (
    id text DEFAULT ''::text NOT NULL,
    description text DEFAULT ''::text,
    temperature_min double precision DEFAULT 0,
    temperature_max double precision DEFAULT 0,
    customdata jsonb
);
CREATE TABLE public.log (
    entry_date date,
    store_id text DEFAULT ''::text,
    event text DEFAULT ''::text,
    event_type text DEFAULT ''::text,
    "time" time without time zone DEFAULT '00:00:00'::time without time zone,
    source_record_id text DEFAULT ''::text,
    source_table integer DEFAULT 0,
    user_id text DEFAULT ''::text,
    id text DEFAULT ''::text NOT NULL,
    data_json text DEFAULT ''::text
);
CREATE TABLE public.medicine_administrator (
    id text DEFAULT ''::text NOT NULL,
    first_name text DEFAULT ''::text,
    last_name text DEFAULT ''::text,
    code text DEFAULT ''::text,
    is_active boolean DEFAULT false
);
CREATE TABLE public.merged_ids (
    id character varying(255) DEFAULT ''::character varying NOT NULL,
    table_number integer DEFAULT 0,
    field_number integer DEFAULT 0,
    keep_id character varying(255) DEFAULT ''::character varying,
    delete_id character varying(255) DEFAULT ''::character varying
);
CREATE TABLE public.message (
    id text DEFAULT ''::text NOT NULL,
    tostoreid text DEFAULT ''::text,
    fromstoreid text DEFAULT ''::text,
    body jsonb,
    createddate date,
    createdtime time without time zone DEFAULT '00:00:00'::time without time zone,
    status text DEFAULT ''::text,
    type text DEFAULT ''::text
);
CREATE TABLE public.name (
    id text DEFAULT ''::text NOT NULL,
    name text DEFAULT ''::text,
    fax text DEFAULT ''::text,
    phone text DEFAULT ''::text,
    customer boolean DEFAULT false,
    bill_address1 text DEFAULT ''::text,
    bill_address2 text DEFAULT ''::text,
    supplier boolean DEFAULT false,
    "charge code" text DEFAULT ''::text,
    margin double precision DEFAULT 0,
    comment text DEFAULT ''::text,
    currency_id text DEFAULT ''::text,
    country text DEFAULT ''::text,
    freightfac double precision DEFAULT 0,
    email text DEFAULT ''::text,
    custom1 text DEFAULT ''::text,
    code text DEFAULT ''::text,
    last text DEFAULT ''::text,
    first text DEFAULT ''::text,
    title text DEFAULT ''::text,
    female boolean DEFAULT false,
    date_of_birth date,
    overpayment double precision DEFAULT 0,
    group_id text DEFAULT ''::text,
    hold boolean DEFAULT false,
    ship_address1 text DEFAULT ''::text,
    ship_address2 text DEFAULT ''::text,
    url text DEFAULT ''::text,
    barcode text DEFAULT ''::text,
    postal_address1 text DEFAULT ''::text,
    postal_address2 text DEFAULT ''::text,
    category1_id text DEFAULT ''::text,
    region_id text DEFAULT ''::text,
    type text DEFAULT ''::text,
    price_category text DEFAULT ''::text,
    flag text DEFAULT ''::text,
    manufacturer boolean DEFAULT false,
    print_invoice_alphabetical boolean DEFAULT false,
    custom2 text DEFAULT ''::text,
    custom3 text DEFAULT ''::text,
    default_order_days smallint DEFAULT 0,
    connection_type smallint DEFAULT 0,
    patient_photo bytea,
    next_of_kin_id text DEFAULT ''::text,
    pobox text DEFAULT ''::text,
    zip integer DEFAULT 0,
    middle text DEFAULT ''::text,
    preferred boolean DEFAULT false,
    blood_group text DEFAULT ''::text,
    marital_status text DEFAULT ''::text,
    benchmark boolean DEFAULT false,
    next_of_kin_relative text DEFAULT ''::text,
    mother_id text DEFAULT ''::text,
    postal_address3 text DEFAULT ''::text,
    postal_address4 text DEFAULT ''::text,
    bill_address3 text DEFAULT ''::text,
    bill_address4 text DEFAULT ''::text,
    ship_address3 text DEFAULT ''::text,
    ship_address4 text DEFAULT ''::text,
    ethnicity_id text DEFAULT ''::text,
    occupation_id text DEFAULT ''::text,
    religion_id text DEFAULT ''::text,
    national_health_number text DEFAULT ''::text,
    master_rtm_supplier_code integer DEFAULT 0,
    ordering_method text DEFAULT ''::text,
    donor boolean DEFAULT false,
    latitude double precision DEFAULT 0,
    longitude double precision DEFAULT 0,
    master_rtm_supplier_name text DEFAULT ''::text,
    category2_id text DEFAULT ''::text,
    category3_id text DEFAULT ''::text,
    category4_id text DEFAULT ''::text,
    category5_id text DEFAULT ''::text,
    category6_id text DEFAULT ''::text,
    bill_address5 text DEFAULT ''::text,
    bill_postal_zip_code text DEFAULT ''::text,
    postal_address5 text DEFAULT ''::text,
    postal_zip_code text DEFAULT ''::text,
    ship_address5 text DEFAULT ''::text,
    ship_postal_zip_code text DEFAULT ''::text,
    supplying_store_id text DEFAULT ''::text,
    license_number text DEFAULT ''::text,
    license_expiry date,
    has_current_license boolean DEFAULT false,
    custom_data jsonb,
    maximum_credit double precision DEFAULT 0,
    nationality_id text DEFAULT ''::text,
    created_date date,
    integration_id text DEFAULT ''::text,
    isdeceased boolean DEFAULT false,
    is_deleted boolean DEFAULT false,
    om_created_datetime text DEFAULT ''::text,
    om_gender text DEFAULT ''::text,
    hsh_name text DEFAULT ''::text,
    hsh_code text DEFAULT ''::text,
    hsh_id text DEFAULT ''::text,
    om_date_of_death date,
    supportdb_donor_id text DEFAULT ''::text,
    supportdb_donor_name text DEFAULT ''::text
);
CREATE TABLE public.name_budget (
    id text DEFAULT ''::text NOT NULL,
    name_id text DEFAULT ''::text,
    budget_period_id text DEFAULT ''::text,
    amount double precision DEFAULT 0,
    description text DEFAULT ''::text,
    date_entered date,
    additional_budget boolean DEFAULT false
);
CREATE TABLE public.name_category1 (
    id text DEFAULT ''::text NOT NULL,
    description text DEFAULT ''::text,
    type text DEFAULT ''::text,
    parent_id text DEFAULT ''::text,
    user_field1 text DEFAULT ''::text,
    user_field2 text DEFAULT ''::text
);
CREATE TABLE public.name_category1_level1 (
    id text DEFAULT ''::text NOT NULL,
    description text DEFAULT ''::text,
    type text DEFAULT ''::text
);
CREATE TABLE public.name_category1_level2 (
    id text DEFAULT ''::text NOT NULL,
    description text DEFAULT ''::text,
    type text DEFAULT ''::text,
    parent_id text DEFAULT ''::text
);
CREATE TABLE public.name_category2 (
    id text DEFAULT ''::text NOT NULL,
    description text DEFAULT ''::text,
    type text DEFAULT ''::text,
    user_field1 text DEFAULT ''::text,
    user_field2 text DEFAULT ''::text
);
CREATE TABLE public.name_category3 (
    id text DEFAULT ''::text NOT NULL,
    description text DEFAULT ''::text,
    type text DEFAULT ''::text,
    user_field1 text DEFAULT ''::text,
    user_field2 text DEFAULT ''::text
);
CREATE TABLE public.name_category4 (
    id text DEFAULT ''::text NOT NULL,
    description text DEFAULT ''::text,
    type text DEFAULT ''::text,
    user_field1 text DEFAULT ''::text,
    user_field2 text DEFAULT ''::text
);
CREATE TABLE public.name_category5 (
    id text DEFAULT ''::text NOT NULL,
    description text DEFAULT ''::text,
    type text DEFAULT ''::text,
    user_field1 text DEFAULT ''::text,
    user_field2 text DEFAULT ''::text
);
CREATE TABLE public.name_category6 (
    id text DEFAULT ''::text NOT NULL,
    description text DEFAULT ''::text,
    type text DEFAULT ''::text,
    user_field1 text DEFAULT ''::text,
    user_field2 text DEFAULT ''::text
);
CREATE TABLE public.name_group (
    id text DEFAULT ''::text NOT NULL,
    name text DEFAULT ''::text
);
CREATE TABLE public.name_note (
    patient_event_id text DEFAULT ''::text,
    entry_date date,
    note text DEFAULT ''::text,
    name_id text DEFAULT ''::text,
    id text DEFAULT ''::text NOT NULL,
    value double precision DEFAULT 0,
    boolean_value boolean DEFAULT false,
    created_by_user_id text DEFAULT ''::text,
    modified_by_user_id text DEFAULT ''::text,
    whentodisplay text DEFAULT ''::text,
    store_id text DEFAULT ''::text,
    color_code smallint DEFAULT 0,
    beep_times smallint DEFAULT 0,
    data jsonb,
    is_deleted boolean DEFAULT false
);
CREATE TABLE public.name_store_join (
    name_id text DEFAULT ''::text,
    store_id text DEFAULT ''::text,
    inactive boolean DEFAULT false,
    id text DEFAULT ''::text NOT NULL,
    spare_category_id integer DEFAULT 0,
    spare_category_optional_id integer DEFAULT 0,
    spare_category_optional2_id integer DEFAULT 0,
    om_name_is_customer boolean DEFAULT false,
    om_name_is_supplier boolean DEFAULT false
);
CREATE TABLE public.name_tag (
    id text DEFAULT ''::text NOT NULL,
    description text DEFAULT ''::text
);
CREATE TABLE public.name_tag_join (
    id text DEFAULT ''::text NOT NULL,
    name_id text DEFAULT ''::text,
    name_tag_id text DEFAULT ''::text
);
CREATE TABLE public.nameinsurancejoin (
    id text DEFAULT ''::text NOT NULL,
    insuranceproviderid text DEFAULT ''::text,
    nameid text DEFAULT ''::text,
    isactive boolean DEFAULT false,
    policynumberfamily text DEFAULT ''::text,
    policynumberperson text DEFAULT ''::text,
    type text DEFAULT ''::text,
    discountrate double precision DEFAULT 0,
    expirydate date,
    policynumberfull text DEFAULT ''::text,
    enteredbyid text DEFAULT ''::text
);
CREATE TABLE public.nationality (
    id text DEFAULT ''::text NOT NULL,
    description text DEFAULT ''::text
);
CREATE TABLE public.number (
    name text DEFAULT ''::text,
    value integer DEFAULT 0,
    id character varying(255) DEFAULT ''::character varying NOT NULL
);
CREATE TABLE public.number_reuse (
    name text DEFAULT ''::text,
    number_to_use integer DEFAULT 0,
    id character varying(255) DEFAULT ''::character varying NOT NULL
);
CREATE TABLE public.occupation (
    id text DEFAULT ''::text NOT NULL,
    name text DEFAULT ''::text
);
CREATE TABLE public.om_activity_log (
    id text DEFAULT ''::text NOT NULL,
    type text DEFAULT ''::text,
    user_id text DEFAULT ''::text,
    store_id text DEFAULT ''::text,
    record_id text DEFAULT ''::text,
    datetime text DEFAULT ''::text,
    changed_from text DEFAULT ''::text,
    changed_to text DEFAULT ''::text
);
CREATE TABLE public.om_document (
    id text DEFAULT ''::text NOT NULL,
    name text DEFAULT ''::text,
    parent_ids text DEFAULT ''::text,
    user_id text DEFAULT ''::text,
    datetime text DEFAULT ''::text,
    type text DEFAULT ''::text,
    data jsonb,
    form_schema_id text DEFAULT ''::text,
    status text DEFAULT ''::text,
    owner_name_id text DEFAULT ''::text,
    context_id text DEFAULT ''::text
);
CREATE TABLE public.om_document_registry (
    id text DEFAULT ''::text NOT NULL,
    document_type text DEFAULT ''::text,
    category text DEFAULT ''::text,
    name text DEFAULT ''::text,
    spare text DEFAULT ''::text,
    form_schema_id text DEFAULT ''::text,
    config jsonb,
    context_id text DEFAULT ''::text
);
CREATE TABLE public.om_user_permission (
    id text DEFAULT ''::text NOT NULL,
    user_id text DEFAULT ''::text,
    store_id text DEFAULT ''::text,
    permission text DEFAULT ''::text,
    context_id text DEFAULT ''::text
);
CREATE TABLE public.options (
    id text DEFAULT ''::text NOT NULL,
    type text DEFAULT ''::text,
    isactive boolean DEFAULT false,
    title text DEFAULT ''::text
);
CREATE TABLE public.patient_event (
    id text DEFAULT ''::text NOT NULL,
    code text DEFAULT ''::text,
    description text DEFAULT ''::text,
    event_type text DEFAULT ''::text,
    unit text DEFAULT ''::text
);
CREATE TABLE public.patient_medication (
    id text DEFAULT ''::text NOT NULL,
    item_id text DEFAULT ''::text,
    name_id text DEFAULT ''::text,
    dose_morning text DEFAULT ''::text,
    dose_lunch text DEFAULT ''::text,
    dose_evening text DEFAULT ''::text,
    dose_bedtime text DEFAULT ''::text,
    purpose text DEFAULT ''::text,
    instructions text DEFAULT ''::text,
    user_created_id text DEFAULT ''::text,
    date_created date,
    user_modified_id text DEFAULT ''::text,
    date_modified date,
    notes text DEFAULT ''::text,
    trans_line_id text DEFAULT ''::text
);
CREATE TABLE public.paymenttype (
    code text DEFAULT ''::text,
    id text DEFAULT ''::text NOT NULL,
    description text DEFAULT ''::text
);
CREATE TABLE public.period (
    id text DEFAULT ''::text NOT NULL,
    periodscheduleid text DEFAULT ''::text,
    startdate date,
    enddate date,
    name text DEFAULT ''::text
);
CREATE TABLE public.period_amount (
    id text DEFAULT ''::text NOT NULL,
    budget_period_id text DEFAULT ''::text,
    account_code_id text DEFAULT ''::text,
    budget double precision DEFAULT 0
);
CREATE TABLE public.periodschedule (
    id text DEFAULT ''::text NOT NULL,
    name text DEFAULT ''::text
);
CREATE TABLE public.permission (
    name_group_id text DEFAULT ''::text,
    item_dept_id text DEFAULT ''::text,
    id text DEFAULT ''::text NOT NULL
);
CREATE TABLE public.placeholder4 (
    id integer DEFAULT 0 NOT NULL
);
CREATE TABLE public.pref (
    item character varying(80) DEFAULT ''::character varying,
    user_id character varying(80) DEFAULT ''::character varying,
    id character varying(255) DEFAULT ''::character varying NOT NULL,
    network_id character varying(80) DEFAULT ''::character varying,
    store_id character varying(80) DEFAULT ''::character varying,
    data jsonb
);
CREATE TABLE public.pref_blob (
    item character varying(80) DEFAULT ''::character varying,
    type character varying(2) DEFAULT ''::character varying,
    blob bytea,
    user_id character varying(255) DEFAULT ''::character varying,
    network_id character varying(255) DEFAULT ''::character varying,
    store_id character varying(255) DEFAULT ''::character varying,
    id character varying(255) DEFAULT ''::character varying NOT NULL
);
CREATE TABLE public.program_indicator (
    id text DEFAULT ''::text NOT NULL,
    code text DEFAULT ''::text,
    program_id text DEFAULT ''::text,
    is_active boolean DEFAULT false
);
CREATE TABLE public.property (
    id text DEFAULT ''::text NOT NULL,
    name text DEFAULT ''::text,
    read_only boolean DEFAULT false,
    key text DEFAULT ''::text
);
CREATE TABLE public.purchase_order (
    name_id text DEFAULT ''::text,
    id text DEFAULT ''::text NOT NULL,
    creation_date date,
    target_months double precision DEFAULT 0,
    status text DEFAULT ''::text,
    comment text DEFAULT ''::text,
    currency_id text DEFAULT ''::text,
    inv_sub_total double precision DEFAULT 0,
    freight double precision DEFAULT 0,
    cost_in_local_currency double precision DEFAULT 0,
    curr_rate double precision DEFAULT 0,
    reference text DEFAULT ''::text,
    lines integer DEFAULT 0,
    requested_delivery_date date,
    locked boolean DEFAULT false,
    confirm_date date,
    created_by text DEFAULT ''::text,
    last_edited_by text DEFAULT ''::text,
    order_total_after_discount double precision DEFAULT 0,
    store_id text DEFAULT ''::text,
    supplier_agent text DEFAULT ''::text,
    delivery_method text DEFAULT ''::text,
    authorizing_officer_1 text DEFAULT ''::text,
    authorizing_officer_2 text DEFAULT ''::text,
    freight_conditions text DEFAULT ''::text,
    additional_instructions text DEFAULT ''::text,
    total_foreign_currency_expected double precision DEFAULT 0,
    total_local_currency_expected double precision DEFAULT 0,
    agent_commission double precision DEFAULT 0,
    document_charge double precision DEFAULT 0,
    communications_charge double precision DEFAULT 0,
    insurance_charge double precision DEFAULT 0,
    freight_charge double precision DEFAULT 0,
    po_sent_date date,
    supplier_discount_amount double precision DEFAULT 0,
    order_total_before_discount double precision DEFAULT 0,
    inv_discount_amount double precision DEFAULT 0,
    quote_id text DEFAULT ''::text,
    editedremotely boolean DEFAULT false,
    heading_message text DEFAULT ''::text,
    budget_period_id text DEFAULT ''::text,
    category_id text DEFAULT ''::text,
    include_in_on_order_calcs boolean DEFAULT false,
    colour integer DEFAULT 0,
    user_field_1 text DEFAULT ''::text,
    date_contract_signed date,
    date_advance_payment date,
    date_goods_received_at_port date,
    is_authorised boolean DEFAULT false,
    auth_checksum text DEFAULT ''::text,
    donor_id text DEFAULT ''::text,
    user_field_2 text DEFAULT ''::text,
    serial_number integer DEFAULT 0,
    linked_transaction_id text DEFAULT ''::text,
    lookbackmonths double precision DEFAULT 0,
    custom_data jsonb,
    minimumexpirydate date
);
CREATE TABLE public.purchase_order_category (
    id text DEFAULT ''::text NOT NULL,
    description text DEFAULT ''::text,
    user_1 text DEFAULT ''::text,
    user_2 text DEFAULT ''::text,
    user_3 double precision DEFAULT 0
);
CREATE TABLE public.purchase_order_line (
    purchase_order_id text DEFAULT ''::text,
    item_id text DEFAULT ''::text,
    non_stock_name_id text DEFAULT ''::text,
    packsize_ordered double precision DEFAULT 0,
    cost_from_invoice double precision DEFAULT 0,
    cost_local double precision DEFAULT 0,
    comment text DEFAULT ''::text,
    batch text DEFAULT ''::text,
    expiry date,
    quan_original_order double precision DEFAULT 0,
    quan_adjusted_order double precision DEFAULT 0,
    quan_rec_to_date double precision DEFAULT 0,
    store_id text DEFAULT ''::text,
    spare_estmated_cost double precision DEFAULT 0,
    item_name text DEFAULT ''::text,
    id text DEFAULT ''::text NOT NULL,
    pack_units text DEFAULT ''::text,
    price_expected_after_discount double precision DEFAULT 0,
    price_extension_expected double precision DEFAULT 0,
    supplier_code text DEFAULT ''::text,
    price_per_pack_before_discount double precision DEFAULT 0,
    quote_line_id text DEFAULT ''::text,
    volume_per_pack double precision DEFAULT 0,
    location_id text DEFAULT ''::text,
    manufacturer_id text DEFAULT ''::text,
    delivery_date_requested date,
    line_number integer DEFAULT 0,
    note text DEFAULT ''::text,
    note_show_on_goods_rec boolean DEFAULT false,
    delivery_date_expected date,
    note_has_been_actioned boolean DEFAULT false,
    kit_data jsonb,
    suggestedquantity double precision DEFAULT 0,
    snapshotquantity double precision DEFAULT 0
);
CREATE TABLE public.quote (
    id text DEFAULT ''::text NOT NULL,
    tender_id text DEFAULT ''::text,
    names_id text DEFAULT ''::text,
    sent_date date,
    responded_date date,
    supplier_ref text DEFAULT ''::text,
    currency_id text DEFAULT ''::text,
    rate_per_m3 double precision DEFAULT 0,
    rate_per_kg double precision DEFAULT 0,
    deliveries_requested integer DEFAULT 0,
    validitydate date,
    mycomment text DEFAULT ''::text,
    suppliercomment text DEFAULT ''::text,
    downloaded boolean DEFAULT false
);
CREATE TABLE public.quote_line (
    edit_date date,
    name_id text DEFAULT ''::text,
    price double precision DEFAULT 0,
    preferred boolean DEFAULT false,
    pack_size double precision DEFAULT 0,
    currency_id text DEFAULT ''::text,
    comment text DEFAULT ''::text,
    net_cost double precision DEFAULT 0,
    "adj cost" double precision DEFAULT 0,
    item_id text DEFAULT ''::text,
    "strip pack" boolean DEFAULT false,
    supplier_code text DEFAULT ''::text,
    supplier_bar_code text DEFAULT ''::text,
    price_break_comment text DEFAULT ''::text,
    price_break_quanity double precision DEFAULT 0,
    price_break_discount double precision DEFAULT 0,
    supplier_preferred_pack_size double precision DEFAULT 0,
    freight_comment text DEFAULT ''::text,
    freight_per_preferred_pack double precision DEFAULT 0,
    lead_time_days integer DEFAULT 0,
    valid_until_date date,
    id text DEFAULT ''::text NOT NULL,
    disqualified boolean DEFAULT false,
    quote_id text DEFAULT ''::text,
    tender_line_id text DEFAULT ''::text,
    manufacturer_id text DEFAULT ''::text,
    freight_factor double precision DEFAULT 0,
    date_created date,
    volume_per_pack double precision DEFAULT 0,
    freight_total double precision DEFAULT 0,
    expirydate text DEFAULT ''::text,
    deliverytime text DEFAULT ''::text,
    spare integer DEFAULT 0,
    currency_rate double precision DEFAULT 0,
    line_num integer DEFAULT 0,
    custom_data jsonb,
    min_price double precision DEFAULT 0,
    max_price double precision DEFAULT 0,
    purchase_order_line_id text DEFAULT ''::text,
    total_cost double precision DEFAULT 0,
    supplier_number_of_packs integer DEFAULT 0,
    method_of_delivery text DEFAULT ''::text,
    evaluator_comment text DEFAULT ''::text,
    tender_currency_id text DEFAULT ''::text
);
CREATE TABLE public.regimen (
    id character varying(255) DEFAULT ''::character varying NOT NULL,
    "order" smallint DEFAULT 0,
    type smallint DEFAULT 0,
    description character varying(80) DEFAULT ''::character varying
);
CREATE TABLE public.regimen_line (
    id character varying(255) DEFAULT ''::character varying NOT NULL,
    regimen_record_id character varying(255) DEFAULT ''::character varying,
    regimen_id character varying(255) DEFAULT ''::character varying,
    num_patients_on_treatment integer DEFAULT 0,
    num_patients_to_be_initiated integer DEFAULT 0,
    num_patients_stopped integer DEFAULT 0,
    comment character varying(255) DEFAULT ''::character varying
);
CREATE TABLE public.regimen_record (
    id character varying(255) DEFAULT ''::character varying NOT NULL,
    name_id character varying(255) DEFAULT ''::character varying,
    store_id character varying(255) DEFAULT ''::character varying,
    created_by character varying(255) DEFAULT ''::character varying,
    date_created date,
    date_entered date,
    reference text DEFAULT ''::text
);
CREATE TABLE public.region (
    id text DEFAULT ''::text NOT NULL,
    parent_id text DEFAULT ''::text,
    name text DEFAULT ''::text,
    geometry jsonb
);
CREATE TABLE public.store (
    id text DEFAULT ''::text NOT NULL,
    name text DEFAULT ''::text,
    code text DEFAULT ''::text,
    name_id text DEFAULT ''::text,
    mwks_export_mode text DEFAULT ''::text,
    is_his boolean DEFAULT false,
    sort_issues_by_status_spare boolean DEFAULT false,
    disabled boolean DEFAULT false,
    responsible_user_id text DEFAULT ''::text,
    organisation_name text DEFAULT ''::text,
    address_1 text DEFAULT ''::text,
    address_2 text DEFAULT ''::text,
    logo bytea,
    sync_id_remote_site integer DEFAULT 0,
    address_3 text DEFAULT ''::text,
    address_4 text DEFAULT ''::text,
    address_5 text DEFAULT ''::text,
    postal_zip_code text DEFAULT ''::text,
    store_mode text DEFAULT ''::text,
    phone text DEFAULT ''::text,
    tags text DEFAULT ''::text,
    spare_user_1 text DEFAULT ''::text,
    spare_user_2 text DEFAULT ''::text,
    spare_user_3 text DEFAULT ''::text,
    spare_user_4 text DEFAULT ''::text,
    spare_user_5 text DEFAULT ''::text,
    spare_user_6 text DEFAULT ''::text,
    spare_user_7 text DEFAULT ''::text,
    spare_user_8 text DEFAULT ''::text,
    spare_user_9 text DEFAULT ''::text,
    spare_user_10 text DEFAULT ''::text,
    spare_user_11 text DEFAULT ''::text,
    spare_user_12 text DEFAULT ''::text,
    spare_user_13 text DEFAULT ''::text,
    spare_user_14 text DEFAULT ''::text,
    spare_user_15 text DEFAULT ''::text,
    spare_user_16 text DEFAULT ''::text,
    custom_data jsonb,
    created_date date
);
CREATE VIEW public.region_mos AS
 SELECT CURRENT_DATE AS "time",
    region.description AS region,
    a.store,
    a.value,
    g.data AS geojson
   FROM (((( SELECT s.name AS store,
            s.id AS storeid,
            avg(a_1.value) AS value,
            s.name_id
           FROM (public.aggregator a_1
             JOIN public.store s ON ((a_1.storeid = s.id)))
          WHERE (a_1.dataelement = 'mos'::text)
          GROUP BY s.name, s.id, s.name_id) a
     JOIN public.name n ON ((a.name_id = n.id)))
     JOIN public.name_category1 region ON ((n.category1_id = region.id)))
     JOIN public.geojson g ON ((region.id = (g.id)::text)))
  ORDER BY region.description;
CREATE TABLE public.region_property_join (
    id text DEFAULT ''::text NOT NULL,
    region_id text DEFAULT ''::text,
    property_id text DEFAULT ''::text,
    value jsonb,
    date date,
    spare_num_patients_stopped integer DEFAULT 0,
    spare_comment text DEFAULT ''::text
);
CREATE TABLE public.religion (
    id text DEFAULT ''::text NOT NULL,
    name text DEFAULT ''::text
);
CREATE TABLE public.reminder (
    id text DEFAULT ''::text NOT NULL,
    due_date date,
    repeat_has_been_generated boolean DEFAULT false,
    message_text text DEFAULT ''::text,
    completed boolean DEFAULT false,
    repeats_automatically boolean DEFAULT false,
    repeat_type integer DEFAULT 0,
    repeat_interval integer DEFAULT 0,
    user_id text DEFAULT ''::text,
    repeat_day integer DEFAULT 0,
    created_by_user_id text DEFAULT ''::text,
    date_completed date,
    colour integer DEFAULT 0,
    next_repeat_date date,
    repeat_series_id text DEFAULT ''::text,
    avoid_weekends boolean DEFAULT false,
    entry_date date
);
CREATE TABLE public.repeat_table (
    id text DEFAULT ''::text NOT NULL,
    name_id text DEFAULT ''::text,
    total_repeats integer DEFAULT 0,
    repeats_left integer DEFAULT 0,
    quantity_blob bytea,
    expiry_date date
);
CREATE TABLE public.replenishment (
    id text DEFAULT ''::text NOT NULL,
    date_created date,
    date_finalised date,
    user_id_created_by text DEFAULT ''::text,
    user_id_assigned_to text DEFAULT ''::text,
    from_item_line_id text DEFAULT ''::text,
    from_number_of_packs double precision DEFAULT 0,
    from_location_id text DEFAULT ''::text,
    to_item_line_id text DEFAULT ''::text,
    to_number_of_packs double precision DEFAULT 0,
    to_pack_size integer DEFAULT 0,
    to_location_id text DEFAULT ''::text,
    status text DEFAULT ''::text,
    store_id text DEFAULT ''::text,
    authorised boolean DEFAULT false,
    spare_2 text DEFAULT ''::text
);
CREATE TABLE public.report (
    report_name character varying(80) DEFAULT ''::character varying,
    report_blob bytea,
    permission_id character varying(255) DEFAULT ''::character varying,
    id character varying(255) DEFAULT ''::character varying NOT NULL,
    last_updated date,
    type character varying(3) DEFAULT ''::character varying,
    user_created_id character varying(255) DEFAULT ''::character varying,
    custom_name character varying(255) DEFAULT ''::character varying,
    comment character varying(255) DEFAULT ''::character varying,
    "default" boolean DEFAULT false,
    context text DEFAULT ''::text,
    editor character varying(10) DEFAULT ''::character varying,
    orientation character varying(2) DEFAULT ''::character varying
);
CREATE TABLE public.reports_by_user (
    id text DEFAULT ''::text NOT NULL,
    created_by text DEFAULT ''::text,
    last_modified date,
    user_can_access jsonb,
    user_can_edit jsonb,
    report_name text DEFAULT ''::text,
    settings jsonb,
    report_description text DEFAULT ''::text,
    type text DEFAULT ''::text
);
CREATE TABLE public.requisition (
    id text DEFAULT ''::text NOT NULL,
    date_stock_take date,
    user_id text DEFAULT ''::text,
    name_id text DEFAULT ''::text,
    status text DEFAULT ''::text,
    date_entered date,
    nsh_custinv_id text DEFAULT ''::text,
    daystosupply integer DEFAULT 0,
    store_id text DEFAULT ''::text,
    type text DEFAULT ''::text,
    date_order_received date,
    previous_csh_id text DEFAULT ''::text,
    serial_number integer DEFAULT 0,
    requester_reference text DEFAULT ''::text,
    comment text DEFAULT ''::text,
    colour integer DEFAULT 0,
    custom_data jsonb,
    linked_requisition_id text DEFAULT ''::text,
    linked_purchase_order_id text DEFAULT ''::text,
    authorisationstatus text DEFAULT ''::text,
    thresholdmos double precision DEFAULT 0,
    ordertype text DEFAULT ''::text,
    periodid text DEFAULT ''::text,
    programid text DEFAULT ''::text,
    lastmodifiedat integer DEFAULT 0,
    is_emergency boolean DEFAULT false,
    isremoteorder boolean DEFAULT false,
    om_created_datetime text DEFAULT ''::text,
    om_sent_datetime text DEFAULT ''::text,
    om_finalised_datetime text DEFAULT ''::text,
    om_max_months_of_stock double precision DEFAULT 0,
    om_status text DEFAULT ''::text,
    om_colour text DEFAULT ''::text,
    om_expected_delivery_date date,
    date_required date,
    requisition_category_id text DEFAULT ''::text,
    donor_id text DEFAULT ''::text
);
CREATE TABLE public.requisition_category (
    id text DEFAULT ''::text NOT NULL,
    description text DEFAULT ''::text,
    is_active boolean DEFAULT false
);
CREATE TABLE public.requisition_line (
    id text DEFAULT ''::text NOT NULL,
    requisition_id text DEFAULT ''::text,
    item_id text DEFAULT ''::text,
    stock_on_hand double precision DEFAULT 0,
    actualquan double precision DEFAULT 0,
    imprest_or_prev_quantity double precision DEFAULT 0,
    colour integer DEFAULT 0,
    line_number integer DEFAULT 0,
    cust_prev_stock_balance double precision DEFAULT 0,
    cust_stock_received double precision DEFAULT 0,
    cust_stock_order double precision DEFAULT 0,
    comment text DEFAULT ''::text,
    cust_loss_adjust double precision DEFAULT 0,
    days_out_or_new_demand double precision DEFAULT 0,
    previous_stock_on_hand double precision DEFAULT 0,
    daily_usage double precision DEFAULT 0,
    suggested_quantity double precision DEFAULT 0,
    adjusted_consumption double precision DEFAULT 0,
    linked_requisition_line_id text DEFAULT ''::text,
    purchase_order_line_id text DEFAULT ''::text,
    optionid text DEFAULT ''::text,
    cust_stock_issued double precision DEFAULT 0,
    itemname text DEFAULT ''::text,
    stocklosses double precision DEFAULT 0,
    stockadditions double precision DEFAULT 0,
    stockexpiring double precision DEFAULT 0,
    dosforamcadjustment integer DEFAULT 0,
    requestedpacksize double precision DEFAULT 0,
    approved_quantity double precision DEFAULT 0,
    authoriser_comment text DEFAULT ''::text,
    om_snapshot_datetime text DEFAULT ''::text,
    custom_data jsonb
);
CREATE TABLE public.sensor (
    id text DEFAULT ''::text NOT NULL,
    locationid text DEFAULT ''::text,
    name text DEFAULT ''::text,
    macaddress text DEFAULT ''::text,
    batterylevel double precision DEFAULT 0,
    temperature double precision DEFAULT 0,
    lastconnectiondate date,
    lastconnectiontime time without time zone DEFAULT '00:00:00'::time without time zone,
    storeid text DEFAULT ''::text,
    loginterval integer DEFAULT 0,
    numberoflogs integer DEFAULT 0,
    is_active boolean DEFAULT false,
    log_delay_time time without time zone DEFAULT '00:00:00'::time without time zone,
    log_delay_date date,
    programmed_date date,
    programmed_time time without time zone DEFAULT '00:00:00'::time without time zone,
    asset_id text DEFAULT ''::text,
    om_last_connection_datetime text DEFAULT ''::text
);
CREATE TABLE public.sensorlog (
    id text DEFAULT ''::text NOT NULL,
    sensorid text DEFAULT ''::text,
    locationid text DEFAULT ''::text,
    aggregation text DEFAULT ''::text,
    date date,
    "time" time without time zone DEFAULT '00:00:00'::time without time zone,
    customdata jsonb,
    isinbreach boolean DEFAULT false,
    storeid text DEFAULT ''::text,
    temperature double precision DEFAULT 0
);
CREATE TABLE public.sensorlogitemlinejoin (
    id text DEFAULT ''::text NOT NULL,
    itemlineid text DEFAULT ''::text,
    sensorlogid text DEFAULT ''::text
);
CREATE TABLE public.ship_method (
    id text DEFAULT ''::text NOT NULL,
    method text DEFAULT ''::text
);
CREATE TABLE public.site (
    id text DEFAULT ''::text NOT NULL,
    site_id integer DEFAULT 0,
    sync_out_ids text DEFAULT ''::text,
    app_name text DEFAULT ''::text,
    name text DEFAULT ''::text,
    password text DEFAULT ''::text,
    spare_address text DEFAULT ''::text,
    prefs text DEFAULT ''::text,
    hardwareid text DEFAULT ''::text,
    app_version text DEFAULT ''::text,
    code text DEFAULT ''::text,
    sync_version text DEFAULT ''::text,
    initialisation_status text DEFAULT ''::text,
    last_sync_date date,
    last_sync_time time without time zone DEFAULT '00:00:00'::time without time zone,
    support_client_id text DEFAULT ''::text,
    is_omsupply_central_server boolean DEFAULT false,
    omsupply_central_server_url text DEFAULT ''::text,
    first_sync_date date,
    first_sync_time time without time zone DEFAULT '00:00:00'::time without time zone,
    support_start_date date,
    support_end_date date,
    license_code text DEFAULT ''::text,
    funder_id text DEFAULT ''::text,
    concurrent_users_licensed smallint DEFAULT 0
);
CREATE TABLE public.site_log (
    id text DEFAULT ''::text NOT NULL,
    date date,
    site_id integer DEFAULT 0,
    event text DEFAULT ''::text,
    description text DEFAULT ''::text,
    data jsonb,
    "time" time without time zone DEFAULT '00:00:00'::time without time zone
);
CREATE TABLE public.site_settings (
    id text DEFAULT ''::text NOT NULL,
    site_id integer DEFAULT 0,
    server_url text DEFAULT ''::text,
    sync_is_active boolean DEFAULT false,
    sync_interval integer DEFAULT 0,
    sync_batch_size integer DEFAULT 0,
    use_node_http_client boolean DEFAULT false
);
CREATE TABLE public.sms_msg_processed (
    id text DEFAULT ''::text NOT NULL,
    date_processed date,
    date_received text DEFAULT ''::text,
    sender_phone_no text DEFAULT ''::text,
    problem_with_message boolean DEFAULT false,
    message text DEFAULT ''::text
);
CREATE TABLE public.stock_take (
    id text DEFAULT ''::text NOT NULL,
    stock_take_date date,
    stock_take_time time without time zone DEFAULT '00:00:00'::time without time zone,
    created_by_id text DEFAULT ''::text,
    status text DEFAULT ''::text,
    finalised_by_id text DEFAULT ''::text,
    invad_additions_id text DEFAULT ''::text,
    invad_reductions_id text DEFAULT ''::text,
    store_id text DEFAULT ''::text,
    description text DEFAULT ''::text,
    comment text DEFAULT ''::text,
    locked boolean DEFAULT false,
    stock_take_created_date date,
    type text DEFAULT ''::text,
    serial_number integer DEFAULT 0,
    programid text DEFAULT ''::text,
    om_created_datetime text DEFAULT ''::text,
    om_finalised_datetime text DEFAULT ''::text,
    reference text DEFAULT ''::text
);
CREATE TABLE public.stock_take_lines (
    id text DEFAULT ''::text NOT NULL,
    stock_take_id text DEFAULT ''::text,
    item_line_id text DEFAULT ''::text,
    snapshot_qty double precision DEFAULT 0,
    snapshot_packsize double precision DEFAULT 0,
    stock_take_qty double precision DEFAULT 0,
    line_number integer DEFAULT 0,
    location_id text DEFAULT ''::text,
    colour integer DEFAULT 0,
    expiry date,
    cost_price double precision DEFAULT 0,
    sell_price double precision DEFAULT 0,
    batch text DEFAULT ''::text,
    item_id text DEFAULT ''::text,
    donor_id text DEFAULT ''::text,
    comment text DEFAULT ''::text,
    optionid text DEFAULT ''::text,
    is_edited boolean DEFAULT false,
    spare integer DEFAULT 0,
    vaccine_vial_monitor_status_id text DEFAULT ''::text,
    om_note text DEFAULT ''::text,
    custom_stock_field_1 text DEFAULT ''::text,
    custom_stock_field_2 text DEFAULT ''::text,
    custom_stock_field_3 text DEFAULT ''::text,
    custom_stock_field_4 text DEFAULT ''::text,
    countedexpirydate date,
    hold boolean DEFAULT false,
    item_name text DEFAULT ''::text,
    volume_per_pack double precision DEFAULT 0,
    weight_per_pack double precision DEFAULT 0,
    manufacturer_id text DEFAULT ''::text,
    snapshot_location_id text DEFAULT ''::text,
    snapshot_batch text DEFAULT ''::text,
    snapshot_expiry_date date,
    custom_stock_field_5_id text DEFAULT ''::text,
    custom_stock_field_6_id text DEFAULT ''::text,
    custom_stock_field_7_id text DEFAULT ''::text,
    custom_stock_field_8_id text DEFAULT ''::text
);
CREATE VIEW public.store_categories AS
 SELECT store.name,
    store.code,
        CASE
            WHEN (store.organisation_name = ''::text) THEN (('NONE'::text)::character varying)::text
            ELSE store.organisation_name
        END AS organisation,
        CASE
            WHEN (name_category1.* IS NULL) THEN (('NONE'::text)::character varying)::text
            ELSE name_category1.description
        END AS category1,
        CASE
            WHEN (name_category1_level2.description IS NULL) THEN (('NONE'::text)::character varying)::text
            ELSE name_category1_level2.description
        END AS category1_level2,
        CASE
            WHEN (name_category1_level1.description IS NULL) THEN (('NONE'::text)::character varying)::text
            ELSE name_category1_level1.description
        END AS category1_level1,
        CASE
            WHEN (name_category2.* IS NULL) THEN (('NONE'::text)::character varying)::text
            ELSE name_category2.description
        END AS category2,
        CASE
            WHEN (name_category3.* IS NULL) THEN (('NONE'::text)::character varying)::text
            ELSE name_category3.description
        END AS category3,
        CASE
            WHEN (name_category4.* IS NULL) THEN (('NONE'::text)::character varying)::text
            ELSE name_category4.description
        END AS category4,
        CASE
            WHEN (name_category5.* IS NULL) THEN (('NONE'::text)::character varying)::text
            ELSE name_category5.description
        END AS category5,
        CASE
            WHEN (name_category6.* IS NULL) THEN (('NONE'::text)::character varying)::text
            ELSE name_category6.description
        END AS category6,
    store.store_mode AS mode,
    store.disabled
   FROM (((((((((public.store
     LEFT JOIN public.name ON ((store.name_id = name.id)))
     LEFT JOIN public.name_category1 ON ((name_category1.id = name.category1_id)))
     LEFT JOIN public.name_category1_level2 ON ((name_category1.parent_id = name_category1_level2.id)))
     LEFT JOIN public.name_category1_level1 ON ((name_category1_level2.parent_id = name_category1_level1.id)))
     LEFT JOIN public.name_category2 ON ((name_category2.id = name.category2_id)))
     LEFT JOIN public.name_category3 ON ((name_category3.id = name.category3_id)))
     LEFT JOIN public.name_category4 ON ((name_category4.id = name.category4_id)))
     LEFT JOIN public.name_category5 ON ((name_category5.id = name.category5_id)))
     LEFT JOIN public.name_category6 ON ((name_category6.id = name.category4_id)));
CREATE TABLE public.store_credential (
    id text DEFAULT ''::text NOT NULL,
    password text DEFAULT ''::text,
    username text DEFAULT ''::text,
    store_id text DEFAULT ''::text
);
CREATE VIEW public.store_mos AS
 SELECT ((CURRENT_DATE - '1 day'::interval))::date AS "current_date",
    name.name AS store,
    a.value,
    name.latitude,
    name.longitude,
    i.item_name AS item
   FROM (((public.store
     JOIN public.name ON ((store.name_id = name.id)))
     JOIN public.aggregator a ON ((store.id = a.storeid)))
     JOIN public.item i ON ((a.itemid = i.id)))
  WHERE ((store.disabled = false) AND (a.dataelement = 'mos'::text));
CREATE TABLE public.transact (
    name_id text DEFAULT ''::text,
    id text DEFAULT ''::text NOT NULL,
    invoice_num integer DEFAULT 0,
    amount_outstanding double precision DEFAULT 0,
    comment text DEFAULT ''::text,
    entry_date date,
    type text DEFAULT ''::text,
    status text DEFAULT ''::text,
    total double precision DEFAULT 0,
    export_batch integer DEFAULT 0,
    linked_transaction_id text DEFAULT ''::text,
    their_ref text DEFAULT ''::text,
    confirm_date date,
    service_descrip text DEFAULT ''::text,
    service_price double precision DEFAULT 0,
    subtotal double precision DEFAULT 0,
    tax double precision DEFAULT 0,
    user_id text DEFAULT ''::text,
    pickslip_printed_date date,
    prescriber_id text DEFAULT ''::text,
    goods_received_id text DEFAULT ''::text,
    invoice_printed_date date,
    ship_date date,
    ship_method_id text DEFAULT ''::text,
    ship_method_comment text DEFAULT ''::text,
    waybill_number text DEFAULT ''::text,
    number_of_cartons integer DEFAULT 0,
    arrival_date_estimated date,
    arrival_date_actual date,
    responsible_officer_id text DEFAULT ''::text,
    mode text DEFAULT ''::text,
    category_id text DEFAULT ''::text,
    confirm_time time without time zone DEFAULT '00:00:00'::time without time zone,
    foreign_currency_total double precision DEFAULT 0,
    currency_id text DEFAULT ''::text,
    hold boolean DEFAULT false,
    currency_rate double precision DEFAULT 0,
    supplier_charge_fc double precision DEFAULT 0,
    local_charge_distributed double precision DEFAULT 0,
    budget_period_id text DEFAULT ''::text,
    store_id text DEFAULT ''::text,
    user1 text DEFAULT ''::text,
    user2 text DEFAULT ''::text,
    mwks_sequence_num integer DEFAULT 0,
    is_cancellation boolean DEFAULT false,
    user3 text DEFAULT ''::text,
    user4 text DEFAULT ''::text,
    colour integer DEFAULT 0,
    original_po_id text DEFAULT ''::text,
    donor_default_id text DEFAULT ''::text,
    date_order_received date,
    date_order_written date,
    contact_id text DEFAULT ''::text,
    encounter_id text DEFAULT ''::text,
    is_authorised boolean DEFAULT false,
    requisition_id text DEFAULT ''::text,
    entry_time time without time zone DEFAULT '00:00:00'::time without time zone,
    linked_goods_received_id text DEFAULT ''::text,
    authorisationstatus text DEFAULT ''::text,
    nameinsurancejoinid text DEFAULT ''::text,
    insurancediscountamount double precision DEFAULT 0,
    optionid text DEFAULT ''::text,
    insurancediscountrate double precision DEFAULT 0,
    internaldata jsonb,
    lastmodifiedat integer DEFAULT 0,
    custom_data jsonb,
    goodsreceivedconfirmation jsonb,
    paymenttypeid text DEFAULT ''::text,
    diagnosis_id text DEFAULT ''::text,
    wardid text DEFAULT ''::text,
    category2_id text DEFAULT ''::text,
    om_created_datetime text DEFAULT ''::text,
    om_allocated_datetime text DEFAULT ''::text,
    om_picked_datetime text DEFAULT ''::text,
    om_shipped_datetime text DEFAULT ''::text,
    om_delivered_datetime text DEFAULT ''::text,
    om_verified_datetime text DEFAULT ''::text,
    om_status text DEFAULT ''::text,
    om_colour text DEFAULT ''::text,
    om_type text DEFAULT ''::text,
    om_transport_reference text DEFAULT ''::text,
    finalised_date date,
    programid text DEFAULT ''::text,
    tax_rate double precision DEFAULT 0,
    om_original_shipment_id text DEFAULT ''::text
);
CREATE VIEW public.store_transactions AS
 WITH stores AS (
         SELECT store.id,
            store.name AS store
           FROM public.store
          WHERE ((store.store_mode <> ALL (ARRAY['supervisor'::text, 'his'::text, 'drug_registration'::text])) AND (store.disabled = false))
        ), transactions AS (
         SELECT t.store_id,
            date_trunc('month'::text, (t.confirm_date)::timestamp with time zone) AS confirm_date,
            1 AS month,
                CASE
                    WHEN (t.confirm_date > (CURRENT_DATE - 7)) THEN 1
                    ELSE 0
                END AS week
           FROM public.transact t
          WHERE ((t.confirm_date > (CURRENT_DATE - 30)) AND (t.confirm_date <= CURRENT_DATE))
        )
 SELECT min(transactions.confirm_date) AS date,
    s.store,
    COALESCE(sum(transactions.month), (0)::bigint) AS month,
    COALESCE(sum(transactions.week), (0)::bigint) AS week
   FROM (stores s
     LEFT JOIN transactions ON ((s.id = transactions.store_id)))
  GROUP BY s.store
  ORDER BY s.store;
CREATE TABLE public.sync_buffer (
    id integer DEFAULT 0 NOT NULL,
    site_id integer DEFAULT 0,
    sync_out_id text DEFAULT ''::text,
    table_name text DEFAULT ''::text,
    record_id text DEFAULT ''::text,
    record_data jsonb,
    action text DEFAULT ''::text,
    integration_error jsonb
);
CREATE TABLE public.sync_dates (
    store_id character varying(255) DEFAULT ''::character varying NOT NULL,
    last_sync date NOT NULL,
    sync_type character varying(255) DEFAULT ''::character varying NOT NULL
);
CREATE TABLE public.sync_out (
    id text DEFAULT ''::text NOT NULL,
    type text DEFAULT ''::text,
    table_num integer DEFAULT 0,
    record_id text DEFAULT ''::text,
    to_from_id integer DEFAULT 0,
    record_data bytea,
    sequence integer DEFAULT 0,
    table_id_num integer DEFAULT 0,
    merge_id_to_keep text DEFAULT ''::text,
    merge_id_to_delete text DEFAULT ''::text,
    store_id text DEFAULT ''::text,
    date_created date,
    time_created time without time zone DEFAULT '00:00:00'::time without time zone
);
CREATE TABLE public.table_log (
    log_id character varying,
    "table" character varying,
    status character varying
);
CREATE TABLE public.temperature_breach (
    id text DEFAULT ''::text NOT NULL,
    start_date date,
    start_time time without time zone DEFAULT '00:00:00'::time without time zone,
    end_date date,
    end_time time without time zone DEFAULT '00:00:00'::time without time zone,
    location_id text DEFAULT ''::text,
    store_id text DEFAULT ''::text,
    temperature_breach_config_id text DEFAULT ''::text,
    acknowledged boolean DEFAULT false,
    sensor_id text DEFAULT ''::text,
    threshold_maximum_temperature double precision DEFAULT 0,
    threshold_minimum_temperature double precision DEFAULT 0,
    threshold_duration integer DEFAULT 0,
    type text DEFAULT ''::text,
    duration integer DEFAULT 0,
    om_start_datetime text DEFAULT ''::text,
    om_end_datetime text DEFAULT ''::text,
    om_comment text DEFAULT ''::text
);
CREATE TABLE public.temperature_breach_config (
    id text DEFAULT ''::text NOT NULL,
    maximum_temperature double precision DEFAULT 0,
    minimum_temperature double precision DEFAULT 0,
    duration integer DEFAULT 0,
    colour text DEFAULT ''::text,
    description text DEFAULT ''::text,
    is_active boolean DEFAULT false,
    location_type_id text DEFAULT ''::text,
    store_id text DEFAULT ''::text,
    type text DEFAULT ''::text,
    location_id text DEFAULT ''::text
);
CREATE TABLE public.temperature_log (
    id text DEFAULT ''::text NOT NULL,
    temperature double precision DEFAULT 0,
    date date,
    "time" time without time zone DEFAULT '00:00:00'::time without time zone,
    location_id text DEFAULT ''::text,
    temperature_breach_id text DEFAULT ''::text,
    store_id text DEFAULT ''::text,
    sensor_id text DEFAULT ''::text,
    log_interval integer DEFAULT 0,
    om_datetime text DEFAULT ''::text
);
CREATE TABLE public.tender (
    id text DEFAULT ''::text NOT NULL,
    "desc" text DEFAULT ''::text,
    status text DEFAULT ''::text,
    creation_date date,
    issue_date date,
    due_date date,
    created_by_user_id text DEFAULT ''::text,
    comment text DEFAULT ''::text,
    conditions text DEFAULT ''::text,
    our_ref text DEFAULT ''::text,
    locked boolean DEFAULT false,
    tender_inter_month smallint DEFAULT 0,
    po_calc_method integer DEFAULT 0,
    print_item_desc boolean DEFAULT false,
    create_split_deliveries boolean DEFAULT false,
    print_tender_conditions boolean DEFAULT false,
    benchmarksupplier_id text DEFAULT ''::text,
    tendersyncstatus text DEFAULT ''::text,
    targetdays integer DEFAULT 0,
    requesteddeliverydate date,
    emailsubject text DEFAULT ''::text,
    store_id text DEFAULT ''::text,
    closing_time time without time zone DEFAULT '00:00:00'::time without time zone,
    serial_number integer DEFAULT 0,
    incoterm_id text DEFAULT ''::text
);
CREATE TABLE public.tender_condition (
    id text DEFAULT ''::text NOT NULL,
    tender_id text DEFAULT ''::text,
    "order" text DEFAULT ''::text,
    heading text DEFAULT ''::text,
    body text DEFAULT ''::text,
    date_created date,
    created_by_user_id text DEFAULT ''::text,
    active boolean DEFAULT false,
    print_what integer DEFAULT 0,
    flag text DEFAULT ''::text,
    condition_cat_id text DEFAULT ''::text,
    is_master_condition boolean DEFAULT false
);
CREATE TABLE public.tender_condition_category (
    id text DEFAULT ''::text NOT NULL,
    description text DEFAULT ''::text
);
CREATE TABLE public.tender_currency (
    id text DEFAULT ''::text NOT NULL,
    tender_id text DEFAULT ''::text,
    currency_id text DEFAULT ''::text,
    rate double precision DEFAULT 0,
    date_updated date
);
CREATE TABLE public.tender_line (
    id text DEFAULT ''::text NOT NULL,
    tender_id text DEFAULT ''::text,
    item_id text DEFAULT ''::text,
    item_name text DEFAULT ''::text,
    noofpacks double precision DEFAULT 0,
    unit_id text DEFAULT ''::text,
    comment text DEFAULT ''::text,
    pack_size double precision DEFAULT 0,
    conditions text DEFAULT ''::text,
    totalquantity double precision DEFAULT 0,
    indicative_price double precision DEFAULT 0,
    line_number integer DEFAULT 0,
    generated_qty double precision DEFAULT 0,
    colour integer DEFAULT 0,
    selection_notes text DEFAULT ''::text,
    is_synced boolean DEFAULT false
);
CREATE TABLE public.trans_line (
    transaction_id text DEFAULT ''::text,
    item_id text DEFAULT ''::text,
    batch text DEFAULT ''::text,
    price_extension double precision DEFAULT 0,
    note text DEFAULT ''::text,
    sell_price double precision DEFAULT 0,
    expiry_date date,
    cost_price double precision DEFAULT 0,
    pack_size double precision DEFAULT 0,
    quantity double precision DEFAULT 0,
    box_number text DEFAULT ''::text,
    item_line_id text DEFAULT ''::text,
    line_number integer DEFAULT 0,
    item_name text DEFAULT ''::text,
    id text DEFAULT ''::text NOT NULL,
    supp_trans_line_id_ns text DEFAULT ''::text,
    goods_received_lines_id text DEFAULT ''::text,
    manufacturer_id text DEFAULT ''::text,
    foreign_currency_price double precision DEFAULT 0,
    location_id text DEFAULT ''::text,
    volume_per_pack double precision DEFAULT 0,
    repeat_id text DEFAULT ''::text,
    user_1 text DEFAULT ''::text,
    user_2 text DEFAULT ''::text,
    user_3 text DEFAULT ''::text,
    user_4 text DEFAULT ''::text,
    pack_size_inner integer DEFAULT 0,
    pack_inners_in_outer integer DEFAULT 0,
    is_from_inventory_adjustment boolean DEFAULT false,
    weight double precision DEFAULT 0,
    source_backorder_id text DEFAULT ''::text,
    order_lines_id text DEFAULT ''::text,
    donor_id text DEFAULT ''::text,
    local_charge_line_total double precision DEFAULT 0,
    type text DEFAULT ''::text,
    linked_transact_id text DEFAULT ''::text,
    user_5_id text DEFAULT ''::text,
    user_6_id text DEFAULT ''::text,
    user_7_id text DEFAULT ''::text,
    user_8_id text DEFAULT ''::text,
    linked_trans_line_id text DEFAULT ''::text,
    barcodeid text DEFAULT ''::text,
    sentquantity double precision DEFAULT 0,
    optionid text DEFAULT ''::text,
    isvvmpassed text DEFAULT ''::text,
    program_id text DEFAULT ''::text,
    prescribedquantity double precision DEFAULT 0,
    vaccine_vial_monitor_status_id text DEFAULT ''::text,
    sent_pack_size double precision DEFAULT 0,
    custom_data jsonb,
    medicine_administrator_id text DEFAULT ''::text,
    om_item_code text DEFAULT ''::text,
    om_tax double precision DEFAULT 0,
    om_total_before_tax double precision DEFAULT 0,
    om_total_after_tax double precision DEFAULT 0,
    om_item_variant_id text DEFAULT ''::text
);
CREATE TABLE public.trans_note (
    transact_id text DEFAULT ''::text,
    note text DEFAULT ''::text,
    id text DEFAULT ''::text NOT NULL,
    spare integer DEFAULT 0
);
CREATE TABLE public.transaction_category (
    id text DEFAULT ''::text NOT NULL,
    category text DEFAULT ''::text,
    type text DEFAULT ''::text,
    code text DEFAULT ''::text,
    master_category_id text DEFAULT ''::text,
    custom_data jsonb
);
CREATE TABLE public.transaction_master_category (
    id text DEFAULT ''::text NOT NULL,
    description text DEFAULT ''::text,
    code text DEFAULT ''::text
);
CREATE TABLE public.unit (
    id text DEFAULT ''::text NOT NULL,
    units text DEFAULT ''::text,
    comment text DEFAULT ''::text,
    order_number double precision DEFAULT 0
);
CREATE TABLE public."user" (
    id text DEFAULT ''::text NOT NULL,
    name text DEFAULT ''::text,
    startup_method text DEFAULT ''::text,
    signature bytea,
    nblogins integer DEFAULT 0,
    lastlogin date,
    group_id text DEFAULT ''::text,
    mode text DEFAULT ''::text,
    qdump_offset_b bytea,
    active boolean DEFAULT false,
    permissions_spare bytea,
    lasttime time without time zone DEFAULT '00:00:00'::time without time zone,
    initials text DEFAULT ''::text,
    first_name text DEFAULT ''::text,
    last_name text DEFAULT ''::text,
    date_of_birth date,
    address_1 text DEFAULT ''::text,
    address_2 text DEFAULT ''::text,
    e_mail text DEFAULT ''::text,
    phone1 text DEFAULT ''::text,
    phone2 text DEFAULT ''::text,
    date_created date,
    date_left date,
    job_title text DEFAULT ''::text,
    responsible_officer boolean DEFAULT false,
    language integer DEFAULT 0,
    use_ldap boolean DEFAULT false,
    ldap_login_string text DEFAULT ''::text,
    receives_sms_errors boolean DEFAULT false,
    is_group boolean DEFAULT false,
    dashboard_tabs jsonb,
    custom_data jsonb,
    windows_user_name text DEFAULT ''::text,
    license_category_id text DEFAULT ''::text,
    tags jsonb,
    type jsonb,
    isinactiveauthoriser boolean DEFAULT false,
    spare_1 text DEFAULT ''::text
);
CREATE TABLE public.user_license_category (
    id text DEFAULT ''::text NOT NULL,
    description text DEFAULT ''::text,
    max_users_logged_in integer DEFAULT 0
);
CREATE TABLE public.user_store (
    id text DEFAULT ''::text NOT NULL,
    user_id text DEFAULT ''::text,
    store_id text DEFAULT ''::text,
    can_login boolean DEFAULT false,
    store_default boolean DEFAULT false,
    can_action_replenishments boolean DEFAULT false,
    permissions bytea
);
CREATE TABLE public.vaccine_vial_monitor_status (
    id text DEFAULT ''::text NOT NULL,
    description text DEFAULT ''::text,
    code text DEFAULT ''::text,
    level integer DEFAULT 0,
    is_active boolean DEFAULT false
);
CREATE TABLE public.vaccine_vial_monitor_status_log (
    id text DEFAULT ''::text NOT NULL,
    status_id text DEFAULT ''::text,
    date date,
    "time" time without time zone DEFAULT '00:00:00'::time without time zone,
    item_line_id text DEFAULT ''::text,
    store_id text DEFAULT ''::text,
    comment text DEFAULT ''::text,
    user_id text DEFAULT ''::text,
    trans_line_id text DEFAULT ''::text
);
CREATE VIEW public.vw_stock_on_hand AS
 SELECT il.store_id,
    item.id AS item_id,
    sum((il.quantity * il.pack_size)) AS stock_on_hand
   FROM (public.item
     LEFT JOIN public.item_line il ON ((il.item_id = item.id)))
  GROUP BY il.store_id, item.id;
CREATE VIEW public.vw_stock_on_order AS
 SELECT po.store_id,
    po_line.item_id,
    sum(
        CASE
            WHEN ((po_line.quan_adjusted_order - po_line.quan_rec_to_date) > (0)::double precision) THEN (po_line.quan_adjusted_order - po_line.quan_rec_to_date)
            ELSE (0)::double precision
        END) AS stock_on_order
   FROM (public.purchase_order po
     JOIN public.purchase_order_line po_line ON ((po_line.purchase_order_id = po.id)))
  WHERE (po.status = 'cn'::text)
  GROUP BY po.store_id, po_line.item_id;
CREATE TABLE public.warning (
    id text DEFAULT ''::text NOT NULL,
    code text DEFAULT ''::text,
    warning_text text DEFAULT ''::text
);
ALTER TABLE ONLY public.aggregator ALTER COLUMN id SET DEFAULT nextval('public.aggregator_id_seq'::regclass);
ALTER TABLE ONLY public.abbreviation
    ADD CONSTRAINT abbreviation_pkey PRIMARY KEY (id);
ALTER TABLE ONLY public.account
    ADD CONSTRAINT account_pkey PRIMARY KEY (id);
ALTER TABLE ONLY public.admitted_from
    ADD CONSTRAINT admitted_from_pkey PRIMARY KEY (id);
ALTER TABLE ONLY public.adverse_drug_reaction
    ADD CONSTRAINT adverse_drug_reaction_pkey PRIMARY KEY (id);
ALTER TABLE ONLY public.d_aggregator_monthly_soh
    ADD CONSTRAINT aggregator_monthly_soh_pkey PRIMARY KEY (id);
ALTER TABLE ONLY public.aggregator
    ADD CONSTRAINT aggregator_pkey PRIMARY KEY (id);
ALTER TABLE ONLY public.asset_condition
    ADD CONSTRAINT asset_condition_pkey PRIMARY KEY (id);
ALTER TABLE ONLY public.asset_document_type
    ADD CONSTRAINT asset_document_type_pkey PRIMARY KEY (id);
ALTER TABLE ONLY public.asset_location
    ADD CONSTRAINT asset_location_pkey PRIMARY KEY (id);
ALTER TABLE ONLY public.asset
    ADD CONSTRAINT asset_pkey PRIMARY KEY (id);
ALTER TABLE ONLY public.asset_property_asset_join
    ADD CONSTRAINT asset_property_asset_join_pkey PRIMARY KEY (id);
ALTER TABLE ONLY public.asset_property
    ADD CONSTRAINT asset_property_pkey PRIMARY KEY (id);
ALTER TABLE ONLY public.asset_status
    ADD CONSTRAINT asset_status_pkey PRIMARY KEY (id);
ALTER TABLE ONLY public.asset_type
    ADD CONSTRAINT asset_type_pkey PRIMARY KEY (id);
ALTER TABLE ONLY public.authorisationqueue
    ADD CONSTRAINT authorisationqueue_pkey PRIMARY KEY (id);
ALTER TABLE ONLY public.authoriser
    ADD CONSTRAINT authoriser_pkey PRIMARY KEY (id);
ALTER TABLE ONLY public.backorder
    ADD CONSTRAINT backorder_pkey PRIMARY KEY (id);
ALTER TABLE ONLY public.barcode
    ADD CONSTRAINT barcode_pkey PRIMARY KEY (id);
ALTER TABLE ONLY public.bill_of_material
    ADD CONSTRAINT bill_of_material_pkey PRIMARY KEY (id);
ALTER TABLE ONLY public.bom_master
    ADD CONSTRAINT bom_master_pkey PRIMARY KEY (id);
ALTER TABLE ONLY public.box_line
    ADD CONSTRAINT box_line_pkey PRIMARY KEY (id);
ALTER TABLE ONLY public.box
    ADD CONSTRAINT box_pkey PRIMARY KEY (id);
ALTER TABLE ONLY public.box_type
    ADD CONSTRAINT box_type_pkey PRIMARY KEY (id);
ALTER TABLE ONLY public.budget_period
    ADD CONSTRAINT budget_period_pkey PRIMARY KEY (id);
ALTER TABLE ONLY public.chart_of_accounts
    ADD CONSTRAINT chart_of_accounts_pkey PRIMARY KEY (id);
ALTER TABLE ONLY public.clinician
    ADD CONSTRAINT clinician_pkey PRIMARY KEY (id);
ALTER TABLE ONLY public.clinician_store_join
    ADD CONSTRAINT clinician_store_join_pkey PRIMARY KEY (id);
ALTER TABLE ONLY public.contact_group_membership
    ADD CONSTRAINT contact_group_membership_pkey PRIMARY KEY (id);
ALTER TABLE ONLY public.contact_group
    ADD CONSTRAINT contact_group_pkey PRIMARY KEY (id);
ALTER TABLE ONLY public.contact
    ADD CONSTRAINT contact_pkey PRIMARY KEY (id);
ALTER TABLE ONLY public.currency
    ADD CONSTRAINT currency_pkey PRIMARY KEY (id);
ALTER TABLE ONLY public.custom_data_category
    ADD CONSTRAINT custom_data_category_pkey PRIMARY KEY (id);
ALTER TABLE ONLY public.custom_data
    ADD CONSTRAINT custom_data_pkey PRIMARY KEY (id);
ALTER TABLE ONLY public.custom_stock_5
    ADD CONSTRAINT custom_stock_5_pkey PRIMARY KEY (id);
ALTER TABLE ONLY public.custom_stock_6
    ADD CONSTRAINT custom_stock_6_pkey PRIMARY KEY (id);
ALTER TABLE ONLY public.custom_stock_7
    ADD CONSTRAINT custom_stock_7_pkey PRIMARY KEY (id);
ALTER TABLE ONLY public.custom_stock_8
    ADD CONSTRAINT custom_stock_8_pkey PRIMARY KEY (id);
ALTER TABLE ONLY public.d_daily_sensor_battery_log
    ADD CONSTRAINT d_daily_sensor_battery_log_pkey PRIMARY KEY (sensor_id, name, log_datetime);
ALTER TABLE ONLY public.d_monthly_item_active_store_join
    ADD CONSTRAINT d_monthly_item_active_store_join_pkey PRIMARY KEY (item_id, monthyear);
ALTER TABLE ONLY public.d_msupply_monthly_usage
    ADD CONSTRAINT d_msupply_monthly_usage_pkey PRIMARY KEY (usage, yearmonth, store_id);
ALTER TABLE ONLY public.dashboard_report
    ADD CONSTRAINT dashboard_report_pkey PRIMARY KEY (id);
ALTER TABLE ONLY public.dashboard_store_report
    ADD CONSTRAINT dashboard_store_report_pkey PRIMARY KEY (id);
ALTER TABLE ONLY public.dashboard_tab
    ADD CONSTRAINT dashboard_tab_pkey PRIMARY KEY (id);
ALTER TABLE ONLY public.dhis2_data_value
    ADD CONSTRAINT dhis2_data_value_pkey PRIMARY KEY (id);
ALTER TABLE ONLY public.diagnosis
    ADD CONSTRAINT diagnosis_pkey PRIMARY KEY (id);
ALTER TABLE ONLY public.doc_reference
    ADD CONSTRAINT doc_reference_pkey PRIMARY KEY (id);
ALTER TABLE ONLY public.drug_interaction_group
    ADD CONSTRAINT drug_interaction_group_pkey PRIMARY KEY (id);
ALTER TABLE ONLY public.drug_interaction
    ADD CONSTRAINT drug_interaction_pkey PRIMARY KEY (id);
ALTER TABLE ONLY public.drug_register
    ADD CONSTRAINT drug_register_application_number_key UNIQUE (application_number);
ALTER TABLE ONLY public.drug_register_category1
    ADD CONSTRAINT drug_register_category1_pkey PRIMARY KEY (id);
ALTER TABLE ONLY public.drug_register_category2
    ADD CONSTRAINT drug_register_category2_pkey PRIMARY KEY (id);
ALTER TABLE ONLY public.drug_register
    ADD CONSTRAINT drug_register_pkey PRIMARY KEY (id);
ALTER TABLE ONLY public.drug_register
    ADD CONSTRAINT drug_register_registration_number_key UNIQUE (registration_number);
ALTER TABLE ONLY public.drug_register_status
    ADD CONSTRAINT drug_register_status_pkey PRIMARY KEY (id);
ALTER TABLE ONLY public.ethnicity
    ADD CONSTRAINT ethnicity_pkey PRIMARY KEY (id);
ALTER TABLE ONLY public.form_schema
    ADD CONSTRAINT form_schema_pkey PRIMARY KEY (id);
ALTER TABLE ONLY public.goods_received_line
    ADD CONSTRAINT goods_received_line_pkey PRIMARY KEY (id);
ALTER TABLE ONLY public.goods_received
    ADD CONSTRAINT goods_received_pkey PRIMARY KEY (id);
ALTER TABLE ONLY public.his_bed
    ADD CONSTRAINT his_bed_pkey PRIMARY KEY (id);
ALTER TABLE ONLY public.his_birth
    ADD CONSTRAINT his_birth_pkey PRIMARY KEY (id);
ALTER TABLE ONLY public.his_discharge_to
    ADD CONSTRAINT his_discharge_to_pkey PRIMARY KEY (id);
ALTER TABLE ONLY public.his_disease
    ADD CONSTRAINT his_disease_pkey PRIMARY KEY (id);
ALTER TABLE ONLY public.his_encounter_disease
    ADD CONSTRAINT his_encounter_disease_pkey PRIMARY KEY (id);
ALTER TABLE ONLY public.his_encounter_location
    ADD CONSTRAINT his_encounter_location_pkey PRIMARY KEY (id);
ALTER TABLE ONLY public.his_encounter
    ADD CONSTRAINT his_encounter_pkey PRIMARY KEY (id);
ALTER TABLE ONLY public.his_procedure
    ADD CONSTRAINT his_procedure_pkey PRIMARY KEY (id);
ALTER TABLE ONLY public.his_ward
    ADD CONSTRAINT his_ward_pkey PRIMARY KEY (id);
ALTER TABLE ONLY public.id_changes
    ADD CONSTRAINT id_changes_pkey PRIMARY KEY (id);
ALTER TABLE ONLY public.incoterm
    ADD CONSTRAINT incoterm_pkey PRIMARY KEY (id);
ALTER TABLE ONLY public.indicator_attribute
    ADD CONSTRAINT indicator_attribute_pkey PRIMARY KEY (id);
ALTER TABLE ONLY public.indicator_value
    ADD CONSTRAINT indicator_value_pkey PRIMARY KEY (id);
ALTER TABLE ONLY public.insuranceprovider
    ADD CONSTRAINT insuranceprovider_pkey PRIMARY KEY (id);
ALTER TABLE ONLY public.integration
    ADD CONSTRAINT integration_pkey PRIMARY KEY (id);
ALTER TABLE ONLY public.item_amc_projection
    ADD CONSTRAINT item_amc_projection_pkey PRIMARY KEY (id);
ALTER TABLE ONLY public.item_category2
    ADD CONSTRAINT item_category2_pkey PRIMARY KEY (id);
ALTER TABLE ONLY public.item_category3
    ADD CONSTRAINT item_category3_pkey PRIMARY KEY (id);
ALTER TABLE ONLY public.item_category_level1
    ADD CONSTRAINT item_category_level1_pkey PRIMARY KEY (id);
ALTER TABLE ONLY public.item_category_level2
    ADD CONSTRAINT item_category_level2_pkey PRIMARY KEY (id);
ALTER TABLE ONLY public.item_category
    ADD CONSTRAINT item_category_pkey PRIMARY KEY (id);
ALTER TABLE ONLY public.item_department
    ADD CONSTRAINT item_department_pkey PRIMARY KEY (id);
ALTER TABLE ONLY public.item_direction
    ADD CONSTRAINT item_direction_pkey PRIMARY KEY (id);
ALTER TABLE ONLY public.item_line_note
    ADD CONSTRAINT item_line_note_pkey PRIMARY KEY (id);
ALTER TABLE ONLY public.item_line
    ADD CONSTRAINT item_line_pkey PRIMARY KEY (id);
ALTER TABLE ONLY public.item_note
    ADD CONSTRAINT item_note_pkey PRIMARY KEY (id);
ALTER TABLE ONLY public.item
    ADD CONSTRAINT item_pkey PRIMARY KEY (id);
ALTER TABLE ONLY public.item_property_join
    ADD CONSTRAINT item_property_join_pkey PRIMARY KEY (id);
ALTER TABLE ONLY public.item_store_join
    ADD CONSTRAINT item_store_join_pkey PRIMARY KEY (id);
ALTER TABLE ONLY public.item_warning_link
    ADD CONSTRAINT item_warning_link_pkey PRIMARY KEY (id);
ALTER TABLE ONLY public.label
    ADD CONSTRAINT label_pkey PRIMARY KEY (id);
ALTER TABLE ONLY public.list_local_line
    ADD CONSTRAINT list_local_line_pkey PRIMARY KEY (id);
ALTER TABLE ONLY public.list_master_line
    ADD CONSTRAINT list_master_line_pkey PRIMARY KEY (id);
ALTER TABLE ONLY public.list_master_name_join
    ADD CONSTRAINT list_master_name_join_pkey PRIMARY KEY (id);
ALTER TABLE ONLY public.list_master
    ADD CONSTRAINT list_master_pkey PRIMARY KEY (id);
ALTER TABLE ONLY public.location_coordinate
    ADD CONSTRAINT location_coordinate_pkey PRIMARY KEY (id);
ALTER TABLE ONLY public.location_movement
    ADD CONSTRAINT location_movement_pkey PRIMARY KEY (id);
ALTER TABLE ONLY public.location
    ADD CONSTRAINT location_pkey PRIMARY KEY (id);
ALTER TABLE ONLY public.location_type
    ADD CONSTRAINT location_type_pkey PRIMARY KEY (id);
ALTER TABLE ONLY public.log
    ADD CONSTRAINT log_pkey PRIMARY KEY (id);
ALTER TABLE ONLY public.medicine_administrator
    ADD CONSTRAINT medicine_administrator_pkey PRIMARY KEY (id);
ALTER TABLE ONLY public.merged_ids
    ADD CONSTRAINT merged_ids_pkey PRIMARY KEY (id);
ALTER TABLE ONLY public.message
    ADD CONSTRAINT message_pkey PRIMARY KEY (id);
ALTER TABLE ONLY public.name_budget
    ADD CONSTRAINT name_budget_pkey PRIMARY KEY (id);
ALTER TABLE ONLY public.name_category1_level1
    ADD CONSTRAINT name_category1_level1_pkey PRIMARY KEY (id);
ALTER TABLE ONLY public.name_category1_level2
    ADD CONSTRAINT name_category1_level2_pkey PRIMARY KEY (id);
ALTER TABLE ONLY public.name_category1
    ADD CONSTRAINT name_category1_pkey PRIMARY KEY (id);
ALTER TABLE ONLY public.name_category2
    ADD CONSTRAINT name_category2_pkey PRIMARY KEY (id);
ALTER TABLE ONLY public.name_category3
    ADD CONSTRAINT name_category3_pkey PRIMARY KEY (id);
ALTER TABLE ONLY public.name_category4
    ADD CONSTRAINT name_category4_pkey PRIMARY KEY (id);
ALTER TABLE ONLY public.name_category5
    ADD CONSTRAINT name_category5_pkey PRIMARY KEY (id);
ALTER TABLE ONLY public.name_category6
    ADD CONSTRAINT name_category6_pkey PRIMARY KEY (id);
ALTER TABLE ONLY public.name_group
    ADD CONSTRAINT name_group_pkey PRIMARY KEY (id);
ALTER TABLE ONLY public.name_note
    ADD CONSTRAINT name_note_pkey PRIMARY KEY (id);
ALTER TABLE ONLY public.name
    ADD CONSTRAINT name_pkey PRIMARY KEY (id);
ALTER TABLE ONLY public.name_store_join
    ADD CONSTRAINT name_store_join_pkey PRIMARY KEY (id);
ALTER TABLE ONLY public.name_tag_join
    ADD CONSTRAINT name_tag_join_pkey PRIMARY KEY (id);
ALTER TABLE ONLY public.name_tag
    ADD CONSTRAINT name_tag_pkey PRIMARY KEY (id);
ALTER TABLE ONLY public.nameinsurancejoin
    ADD CONSTRAINT nameinsurancejoin_pkey PRIMARY KEY (id);
ALTER TABLE ONLY public.nationality
    ADD CONSTRAINT nationality_pkey PRIMARY KEY (id);
ALTER TABLE ONLY public.number
    ADD CONSTRAINT number_pkey PRIMARY KEY (id);
ALTER TABLE ONLY public.number_reuse
    ADD CONSTRAINT number_reuse_pkey PRIMARY KEY (id);
ALTER TABLE ONLY public.occupation
    ADD CONSTRAINT occupation_pkey PRIMARY KEY (id);
ALTER TABLE ONLY public.om_activity_log
    ADD CONSTRAINT om_activity_log_pkey PRIMARY KEY (id);
ALTER TABLE ONLY public.om_document
    ADD CONSTRAINT om_document_pkey PRIMARY KEY (id);
ALTER TABLE ONLY public.om_document_registry
    ADD CONSTRAINT om_document_registry_pkey PRIMARY KEY (id);
ALTER TABLE ONLY public.om_user_permission
    ADD CONSTRAINT om_user_permission_pkey PRIMARY KEY (id);
ALTER TABLE ONLY public.options
    ADD CONSTRAINT options_pkey PRIMARY KEY (id);
ALTER TABLE ONLY public.patient_event
    ADD CONSTRAINT patient_event_pkey PRIMARY KEY (id);
ALTER TABLE ONLY public.patient_medication
    ADD CONSTRAINT patient_medication_pkey PRIMARY KEY (id);
ALTER TABLE ONLY public.paymenttype
    ADD CONSTRAINT paymenttype_pkey PRIMARY KEY (id);
ALTER TABLE ONLY public.period_amount
    ADD CONSTRAINT period_amount_pkey PRIMARY KEY (id);
ALTER TABLE ONLY public.period
    ADD CONSTRAINT period_pkey PRIMARY KEY (id);
ALTER TABLE ONLY public.periodschedule
    ADD CONSTRAINT periodschedule_pkey PRIMARY KEY (id);
ALTER TABLE ONLY public.permission
    ADD CONSTRAINT permission_pkey PRIMARY KEY (id);
ALTER TABLE ONLY public.placeholder4
    ADD CONSTRAINT placeholder4_pkey PRIMARY KEY (id);
ALTER TABLE ONLY public.pref_blob
    ADD CONSTRAINT pref_blob_pkey PRIMARY KEY (id);
ALTER TABLE ONLY public.pref
    ADD CONSTRAINT pref_pkey PRIMARY KEY (id);
ALTER TABLE ONLY public.program_indicator
    ADD CONSTRAINT program_indicator_pkey PRIMARY KEY (id);
ALTER TABLE ONLY public.property
    ADD CONSTRAINT property_pkey PRIMARY KEY (id);
ALTER TABLE ONLY public.purchase_order_category
    ADD CONSTRAINT purchase_order_category_pkey PRIMARY KEY (id);
ALTER TABLE ONLY public.purchase_order_line
    ADD CONSTRAINT purchase_order_line_pkey PRIMARY KEY (id);
ALTER TABLE ONLY public.purchase_order
    ADD CONSTRAINT purchase_order_pkey PRIMARY KEY (id);
ALTER TABLE ONLY public.quote_line
    ADD CONSTRAINT quote_line_pkey PRIMARY KEY (id);
ALTER TABLE ONLY public.quote
    ADD CONSTRAINT quote_pkey PRIMARY KEY (id);
ALTER TABLE ONLY public.regimen_line
    ADD CONSTRAINT regimen_line_pkey PRIMARY KEY (id);
ALTER TABLE ONLY public.regimen
    ADD CONSTRAINT regimen_pkey PRIMARY KEY (id);
ALTER TABLE ONLY public.regimen_record
    ADD CONSTRAINT regimen_record_pkey PRIMARY KEY (id);
ALTER TABLE ONLY public.region
    ADD CONSTRAINT region_pkey PRIMARY KEY (id);
ALTER TABLE ONLY public.region_property_join
    ADD CONSTRAINT region_property_join_pkey PRIMARY KEY (id);
ALTER TABLE ONLY public.religion
    ADD CONSTRAINT religion_pkey PRIMARY KEY (id);
ALTER TABLE ONLY public.reminder
    ADD CONSTRAINT reminder_pkey PRIMARY KEY (id);
ALTER TABLE ONLY public.repeat_table
    ADD CONSTRAINT repeat_table_pkey PRIMARY KEY (id);
ALTER TABLE ONLY public.replenishment
    ADD CONSTRAINT replenishment_pkey PRIMARY KEY (id);
ALTER TABLE ONLY public.report
    ADD CONSTRAINT report_pkey PRIMARY KEY (id);
ALTER TABLE ONLY public.reports_by_user
    ADD CONSTRAINT reports_by_user_pkey PRIMARY KEY (id);
ALTER TABLE ONLY public.requisition_category
    ADD CONSTRAINT requisition_category_pkey PRIMARY KEY (id);
ALTER TABLE ONLY public.requisition_line
    ADD CONSTRAINT requisition_line_pkey PRIMARY KEY (id);
ALTER TABLE ONLY public.requisition
    ADD CONSTRAINT requisition_pkey PRIMARY KEY (id);
ALTER TABLE ONLY public.sensor
    ADD CONSTRAINT sensor_pkey PRIMARY KEY (id);
ALTER TABLE ONLY public.sensorlog
    ADD CONSTRAINT sensorlog_pkey PRIMARY KEY (id);
ALTER TABLE ONLY public.sensorlogitemlinejoin
    ADD CONSTRAINT sensorlogitemlinejoin_pkey PRIMARY KEY (id);
ALTER TABLE ONLY public.ship_method
    ADD CONSTRAINT ship_method_pkey PRIMARY KEY (id);
ALTER TABLE ONLY public.site_log
    ADD CONSTRAINT site_log_pkey PRIMARY KEY (id);
ALTER TABLE ONLY public.site
    ADD CONSTRAINT site_pkey PRIMARY KEY (id);
ALTER TABLE ONLY public.site_settings
    ADD CONSTRAINT site_settings_pkey PRIMARY KEY (id);
ALTER TABLE ONLY public.site_settings
    ADD CONSTRAINT site_settings_site_id_key UNIQUE (site_id);
ALTER TABLE ONLY public.sms_msg_processed
    ADD CONSTRAINT sms_msg_processed_pkey PRIMARY KEY (id);
ALTER TABLE ONLY public.stock_take_lines
    ADD CONSTRAINT stock_take_lines_pkey PRIMARY KEY (id);
ALTER TABLE ONLY public.stock_take
    ADD CONSTRAINT stock_take_pkey PRIMARY KEY (id);
ALTER TABLE ONLY public.store_credential
    ADD CONSTRAINT store_credential_pkey PRIMARY KEY (id);
ALTER TABLE ONLY public.store_credential
    ADD CONSTRAINT store_credential_username_key UNIQUE (username);
ALTER TABLE ONLY public.store
    ADD CONSTRAINT store_pkey PRIMARY KEY (id);
ALTER TABLE ONLY public.sync_buffer
    ADD CONSTRAINT sync_buffer_pkey PRIMARY KEY (id);
ALTER TABLE ONLY public.sync_dates
    ADD CONSTRAINT sync_dates_pkey PRIMARY KEY (store_id);
ALTER TABLE ONLY public.sync_out
    ADD CONSTRAINT sync_out_pkey PRIMARY KEY (id);
ALTER TABLE ONLY public.temperature_breach_config
    ADD CONSTRAINT temperature_breach_config_pkey PRIMARY KEY (id);
ALTER TABLE ONLY public.temperature_breach
    ADD CONSTRAINT temperature_breach_pkey PRIMARY KEY (id);
ALTER TABLE ONLY public.temperature_log
    ADD CONSTRAINT temperature_log_pkey PRIMARY KEY (id);
ALTER TABLE ONLY public.tender_condition_category
    ADD CONSTRAINT tender_condition_category_pkey PRIMARY KEY (id);
ALTER TABLE ONLY public.tender_condition
    ADD CONSTRAINT tender_condition_pkey PRIMARY KEY (id);
ALTER TABLE ONLY public.tender_currency
    ADD CONSTRAINT tender_currency_pkey PRIMARY KEY (id);
ALTER TABLE ONLY public.tender_line
    ADD CONSTRAINT tender_line_pkey PRIMARY KEY (id);
ALTER TABLE ONLY public.tender
    ADD CONSTRAINT tender_pkey PRIMARY KEY (id);
ALTER TABLE ONLY public.trans_line
    ADD CONSTRAINT trans_line_pkey PRIMARY KEY (id);
ALTER TABLE ONLY public.trans_note
    ADD CONSTRAINT trans_note_pkey PRIMARY KEY (id);
ALTER TABLE ONLY public.transact
    ADD CONSTRAINT transact_pkey PRIMARY KEY (id);
ALTER TABLE ONLY public.transaction_category
    ADD CONSTRAINT transaction_category_pkey PRIMARY KEY (id);
ALTER TABLE ONLY public.transaction_master_category
    ADD CONSTRAINT transaction_master_category_pkey PRIMARY KEY (id);
ALTER TABLE ONLY public.unit
    ADD CONSTRAINT unit_pkey PRIMARY KEY (id);
ALTER TABLE ONLY public.user_license_category
    ADD CONSTRAINT user_license_category_pkey PRIMARY KEY (id);
ALTER TABLE ONLY public."user"
    ADD CONSTRAINT user_pkey PRIMARY KEY (id);
ALTER TABLE ONLY public.user_store
    ADD CONSTRAINT user_store_pkey PRIMARY KEY (id);
ALTER TABLE ONLY public.vaccine_vial_monitor_status_log
    ADD CONSTRAINT vaccine_vial_monitor_status_log_pkey PRIMARY KEY (id);
ALTER TABLE ONLY public.vaccine_vial_monitor_status
    ADD CONSTRAINT vaccine_vial_monitor_status_pkey PRIMARY KEY (id);
ALTER TABLE ONLY public.warning
    ADD CONSTRAINT warning_code_key UNIQUE (code);
ALTER TABLE ONLY public.warning
    ADD CONSTRAINT warning_pkey PRIMARY KEY (id);
CREATE INDEX abbreviation_abbreviation ON public.abbreviation USING btree (abbreviation);
CREATE INDEX adverse_drug_reaction_name_id ON public.adverse_drug_reaction USING btree (name_id);
CREATE INDEX adverse_drug_reaction_store_id ON public.adverse_drug_reaction USING btree (store_id);
CREATE INDEX aggregator_dataelement ON public.aggregator USING btree (dataelement);
CREATE INDEX aggregator_fulldate ON public.aggregator USING btree (fulldate);
CREATE INDEX aggregator_itemid ON public.aggregator USING btree (itemid);
CREATE INDEX aggregator_monthyear ON public.aggregator USING btree (monthyear);
CREATE INDEX aggregator_storeid ON public.aggregator USING btree (storeid);
CREATE INDEX asset_store_id ON public.asset USING btree (store_id);
CREATE INDEX authorisationqueue_authoriserid ON public.authorisationqueue USING btree (authoriserid);
CREATE INDEX authorisationqueue_status ON public.authorisationqueue USING btree (status);
CREATE INDEX authorisationqueue_storeid ON public.authorisationqueue USING btree (storeid);
CREATE INDEX authorisationqueue_userid ON public.authorisationqueue USING btree (userid);
CREATE INDEX authoriser_list_master_id ON public.authoriser USING btree (list_master_id);
CREATE INDEX authoriser_storeid ON public.authoriser USING btree (storeid);
CREATE INDEX authoriser_userid ON public.authoriser USING btree (userid);
CREATE INDEX backorder_item_id ON public.backorder USING btree (item_id);
CREATE INDEX backorder_name_id_customer ON public.backorder USING btree (name_id_customer);
CREATE INDEX backorder_name_id_supplier ON public.backorder USING btree (name_id_supplier);
CREATE INDEX backorder_order_line_id ON public.backorder USING btree (order_line_id);
CREATE INDEX backorder_quantity ON public.backorder USING btree (quantity);
CREATE INDEX backorder_status ON public.backorder USING btree (status);
CREATE INDEX backorder_store_id ON public.backorder USING btree (store_id);
CREATE INDEX backorder_type ON public.backorder USING btree (type);
CREATE INDEX barcode_itemid ON public.barcode USING btree (itemid);
CREATE INDEX bill_of_material_bom_master_id ON public.bill_of_material USING btree (bom_master_id);
CREATE INDEX bom_master_ingredient_item_id ON public.bom_master USING btree (ingredient_item_id);
CREATE INDEX bom_master_item_id ON public.bom_master USING btree (item_id);
CREATE INDEX box_line_box_id ON public.box_line USING btree (box_id);
CREATE INDEX box_line_trans_line_id ON public.box_line USING btree (trans_line_id);
CREATE INDEX box_type_store_id ON public.box_type USING btree (store_id);
CREATE INDEX clinician_code ON public.clinician USING btree (code);
CREATE INDEX clinician_first_name ON public.clinician USING btree (first_name);
CREATE INDEX clinician_last_name ON public.clinician USING btree (last_name);
CREATE INDEX clinician_store_id ON public.clinician USING btree (store_id);
CREATE INDEX clinician_store_join_prescriber_id ON public.clinician_store_join USING btree (prescriber_id);
CREATE INDEX clinician_store_join_store_id ON public.clinician_store_join USING btree (store_id);
CREATE INDEX contact_name_id ON public.contact USING btree (name_id);
CREATE INDEX currency_is_active ON public.currency USING btree (is_active);
CREATE INDEX custom_data_category_id ON public.custom_data USING btree (category_id);
CREATE INDEX d_aggregator_monthly_soh_fulldate ON public.d_aggregator_monthly_soh USING btree (fulldate);
CREATE INDEX d_aggregator_monthly_soh_itemid ON public.d_aggregator_monthly_soh USING btree (itemid);
CREATE INDEX d_aggregator_monthly_soh_monthyear ON public.d_aggregator_monthly_soh USING btree (monthyear);
CREATE INDEX d_aggregator_monthly_soh_storeid ON public.d_aggregator_monthly_soh USING btree (storeid);
CREATE INDEX d_daily_sensor_battery_log_name ON public.d_daily_sensor_battery_log USING btree (name);
CREATE INDEX d_daily_sensor_battery_log_sensor_id ON public.d_daily_sensor_battery_log USING btree (sensor_id);
CREATE INDEX d_monthly_item_active_store_join_item_id ON public.d_monthly_item_active_store_join USING btree (item_id);
CREATE INDEX d_monthly_item_active_store_join_monthyear ON public.d_monthly_item_active_store_join USING btree (monthyear);
CREATE INDEX d_monthly_item_active_store_join_store_ids ON public.d_monthly_item_active_store_join USING gin (store_ids);
CREATE INDEX dashboard_store_report_report_id ON public.dashboard_store_report USING btree (report_id);
CREATE INDEX dashboard_store_report_store_id ON public.dashboard_store_report USING btree (store_id);
CREATE INDEX dhis2_data_value_item_id ON public.dhis2_data_value USING btree (item_id);
CREATE INDEX dhis2_data_value_name_id ON public.dhis2_data_value USING btree (name_id);
CREATE INDEX diagnosis_valid_till ON public.diagnosis USING btree (valid_till);
CREATE INDEX doc_reference_table_no ON public.doc_reference USING btree (table_no);
CREATE INDEX doc_reference_type_id ON public.doc_reference USING btree (type_id);
CREATE INDEX drug_interaction_affecting_group_id ON public.drug_interaction USING btree (affecting_group_id);
CREATE INDEX drug_register_item_id ON public.drug_register USING btree (item_id);
CREATE INDEX drug_register_manufacturer_id ON public.drug_register USING btree (manufacturer_id);
CREATE INDEX drug_register_status_id ON public.drug_register USING btree (status_id);
CREATE INDEX drug_register_status_spare_active ON public.drug_register_status USING btree (spare_active);
CREATE INDEX drug_register_supplier_id ON public.drug_register USING btree (supplier_id);
CREATE INDEX goods_received_budget_id ON public.goods_received USING btree (budget_id);
CREATE INDEX goods_received_donor_id ON public.goods_received USING btree (donor_id);
CREATE INDEX goods_received_line_goods_received_id ON public.goods_received_line USING btree (goods_received_id);
CREATE INDEX goods_received_line_item_id ON public.goods_received_line USING btree (item_id);
CREATE INDEX goods_received_line_kit_data ON public.goods_received_line USING btree (kit_data);
CREATE INDEX goods_received_line_location_id ON public.goods_received_line USING btree (location_id);
CREATE INDEX goods_received_line_order_line_id ON public.goods_received_line USING btree (order_line_id);
CREATE INDEX goods_received_line_weight_per_pack ON public.goods_received_line USING btree (weight_per_pack);
CREATE INDEX goods_received_linked_transaction_id ON public.goods_received USING btree (linked_transaction_id);
CREATE INDEX goods_received_store_id ON public.goods_received USING btree (store_id);
CREATE INDEX his_bed_ward_id ON public.his_bed USING btree (ward_id);
CREATE INDEX his_birth_child_id ON public.his_birth USING btree (child_id);
CREATE INDEX his_birth_encounter_id ON public.his_birth USING btree (encounter_id);
CREATE INDEX his_birth_mother_id ON public.his_birth USING btree (mother_id);
CREATE INDEX his_disease_valid_till ON public.his_disease USING btree (valid_till);
CREATE INDEX his_encounter_admitted_from_id ON public.his_encounter USING btree (admitted_from_id);
CREATE INDEX his_encounter_discharge_date ON public.his_encounter USING btree (discharge_date);
CREATE INDEX his_encounter_discharge_id ON public.his_encounter USING btree (discharge_id);
CREATE INDEX his_encounter_disease_diagnozed_by ON public.his_encounter_disease USING btree (diagnozed_by);
CREATE INDEX his_encounter_disease_disease_id ON public.his_encounter_disease USING btree (disease_id);
CREATE INDEX his_encounter_disease_encounter_id ON public.his_encounter_disease USING btree (encounter_id);
CREATE INDEX his_encounter_location_bed_id ON public.his_encounter_location USING btree (bed_id);
CREATE INDEX his_encounter_location_date_end ON public.his_encounter_location USING btree (date_end);
CREATE INDEX his_encounter_location_date_from ON public.his_encounter_location USING btree (date_from);
CREATE INDEX his_encounter_location_encounter_id ON public.his_encounter_location USING btree (encounter_id);
CREATE INDEX his_encounter_patient_id ON public.his_encounter USING btree (patient_id);
CREATE INDEX his_encounter_start_date ON public.his_encounter USING btree (start_date);
CREATE INDEX his_encounter_transport_method_id ON public.his_encounter USING btree (transport_method_id);
CREATE INDEX his_procedure_encounter_id ON public.his_procedure USING btree (encounter_id);
CREATE INDEX his_procedure_encounter_location_id ON public.his_procedure USING btree (encounter_location_id);
CREATE INDEX his_procedure_invoice_id ON public.his_procedure USING btree (invoice_id);
CREATE INDEX his_procedure_item_id ON public.his_procedure USING btree (item_id);
CREATE INDEX id_changes_old_id ON public.id_changes USING btree (old_id);
CREATE INDEX id_changes_table_num ON public.id_changes USING btree (table_num);
CREATE INDEX indicator_attribute_code ON public.indicator_attribute USING btree (code);
CREATE INDEX indicator_attribute_indicator_id ON public.indicator_attribute USING btree (indicator_id);
CREATE INDEX indicator_value_column_id ON public.indicator_value USING btree (column_id);
CREATE INDEX indicator_value_facility_id ON public.indicator_value USING btree (facility_id);
CREATE INDEX indicator_value_period_id ON public.indicator_value USING btree (period_id);
CREATE INDEX indicator_value_row_id ON public.indicator_value USING btree (row_id);
CREATE INDEX indicator_value_store_id ON public.indicator_value USING btree (store_id);
CREATE INDEX item_catalogue_code ON public.item USING btree (catalogue_code);
CREATE INDEX item_category_id ON public.item USING btree (category_id);
CREATE INDEX item_category_level2_parent_id ON public.item_category_level2 USING btree (parent_id);
CREATE INDEX item_category_parent_id ON public.item_category USING btree (parent_id);
CREATE INDEX item_code ON public.item USING btree (code);
CREATE INDEX item_department_id ON public.item USING btree (department_id);
CREATE INDEX item_direction_item_id ON public.item_direction USING btree (item_id);
CREATE INDEX item_flags ON public.item USING btree (flags);
CREATE INDEX item_interaction_group_id ON public.item USING btree (interaction_group_id);
CREATE INDEX item_item_name ON public.item USING btree (item_name);
CREATE INDEX item_line_barcodeid ON public.item_line USING btree (barcodeid);
CREATE INDEX item_line_donor_id ON public.item_line USING btree (donor_id);
CREATE INDEX item_line_expiry_date ON public.item_line USING btree (expiry_date);
CREATE INDEX item_line_item_id ON public.item_line USING btree (item_id);
CREATE INDEX item_line_location_id ON public.item_line USING btree (location_id);
CREATE INDEX item_line_manufacturer_id ON public.item_line USING btree (manufacturer_id);
CREATE INDEX item_line_name_id ON public.item_line USING btree (name_id);
CREATE INDEX item_line_note_entered_by_id ON public.item_line_note USING btree (entered_by_id);
CREATE INDEX item_line_note_il_id ON public.item_line_note USING btree (il_id);
CREATE INDEX item_line_program_id ON public.item_line USING btree (program_id);
CREATE INDEX item_line_quantity ON public.item_line USING btree (quantity);
CREATE INDEX item_line_repack_original_trans_line_id ON public.item_line USING btree (repack_original_trans_line_id);
CREATE INDEX item_line_store_id ON public.item_line USING btree (store_id);
CREATE INDEX item_line_user_5_id ON public.item_line USING btree (user_5_id);
CREATE INDEX item_line_user_6_id ON public.item_line USING btree (user_6_id);
CREATE INDEX item_line_user_7_id ON public.item_line USING btree (user_7_id);
CREATE INDEX item_line_user_8_id ON public.item_line USING btree (user_8_id);
CREATE INDEX item_note_item_id ON public.item_note USING btree (item_id);
CREATE INDEX item_note_store_id ON public.item_note USING btree (store_id);
CREATE INDEX item_other_names ON public.item USING btree (other_names);
CREATE INDEX item_store_join_default_location_id ON public.item_store_join USING btree (default_location_id);
CREATE INDEX item_store_join_inactive ON public.item_store_join USING btree (inactive);
CREATE INDEX item_store_join_item_id ON public.item_store_join USING btree (item_id);
CREATE INDEX item_store_join_location_bulk_id ON public.item_store_join USING btree (location_bulk_id);
CREATE INDEX item_store_join_non_stock_name_id ON public.item_store_join USING btree (non_stock_name_id);
CREATE INDEX item_store_join_store_id ON public.item_store_join USING btree (store_id);
CREATE INDEX item_unit_id ON public.item USING btree (unit_id);
CREATE INDEX item_warning_link_item_id ON public.item_warning_link USING btree (item_id);
CREATE INDEX item_warning_link_warning_id ON public.item_warning_link USING btree (warning_id);
CREATE INDEX list_local_line_item_id ON public.list_local_line USING btree (item_id);
CREATE INDEX list_local_line_list_master_name_join_id ON public.list_local_line USING btree (list_master_name_join_id);
CREATE INDEX list_local_line_spare_name_id ON public.list_local_line USING btree (spare_name_id);
CREATE INDEX list_master_inactive ON public.list_master USING btree (inactive);
CREATE INDEX list_master_is_default_price_list ON public.list_master USING btree (is_default_price_list);
CREATE INDEX list_master_line_item_id ON public.list_master_line USING btree (item_id);
CREATE INDEX list_master_line_item_master_id ON public.list_master_line USING btree (item_master_id);
CREATE INDEX list_master_name_join_list_master_id ON public.list_master_name_join USING btree (list_master_id);
CREATE INDEX list_master_name_join_name_id ON public.list_master_name_join USING btree (name_id);
CREATE INDEX location_coordinate_location_id ON public.location_coordinate USING btree (location_id);
CREATE INDEX location_movement_item_line_id ON public.location_movement USING btree (item_line_id);
CREATE INDEX location_movement_location_id ON public.location_movement USING btree (location_id);
CREATE INDEX location_movement_store_id ON public.location_movement USING btree (store_id);
CREATE INDEX location_priority ON public.location USING btree (priority);
CREATE INDEX location_store_id ON public.location USING btree (store_id);
CREATE INDEX location_type_id ON public.location USING btree (type_id);
CREATE INDEX log_datetime ON public.d_daily_sensor_battery_log USING btree (log_datetime);
CREATE INDEX log_entry_date ON public.log USING btree (entry_date);
CREATE INDEX log_event_type ON public.log USING btree (event_type);
CREATE INDEX log_source_record_id ON public.log USING btree (source_record_id);
CREATE INDEX log_source_table ON public.log USING btree (source_table);
CREATE INDEX log_user_id ON public.log USING btree (user_id);
CREATE INDEX merged_ids_delete_id ON public.merged_ids USING btree (delete_id);
CREATE INDEX merged_ids_table_number ON public.merged_ids USING btree (table_number);
CREATE INDEX message_body ON public.message USING btree (body);
CREATE INDEX message_fromstoreid ON public.message USING btree (fromstoreid);
CREATE INDEX message_status ON public.message USING btree (status);
CREATE INDEX message_tostoreid ON public.message USING btree (tostoreid);
CREATE INDEX message_type ON public.message USING btree (type);
CREATE INDEX name_category1_id ON public.name USING btree (category1_id);
CREATE INDEX name_category1_level2_parent_id ON public.name_category1_level2 USING btree (parent_id);
CREATE INDEX name_category2_id ON public.name USING btree (category2_id);
CREATE INDEX name_category3_id ON public.name USING btree (category3_id);
CREATE INDEX name_category4_id ON public.name USING btree (category4_id);
CREATE INDEX name_category5_id ON public.name USING btree (category5_id);
CREATE INDEX name_category6_id ON public.name USING btree (category6_id);
CREATE INDEX name_code ON public.name USING btree (code);
CREATE INDEX name_customer ON public.name USING btree (customer);
CREATE INDEX name_donor ON public.name USING btree (donor);
CREATE INDEX name_ethnicity_id ON public.name USING btree (ethnicity_id);
CREATE INDEX name_first ON public.name USING btree (first);
CREATE INDEX name_group_id ON public.name USING btree (group_id);
CREATE INDEX name_hsh_id ON public.name USING btree (hsh_id);
CREATE INDEX name_is_deleted ON public.name USING btree (is_deleted);
CREATE INDEX name_isdeceased ON public.name USING btree (isdeceased);
CREATE INDEX name_last ON public.name USING btree (last);
CREATE INDEX name_manufacturer ON public.name USING btree (manufacturer);
CREATE INDEX name_master_rtm_supplier_code ON public.name USING btree (master_rtm_supplier_code);
CREATE INDEX name_mother_id ON public.name USING btree (mother_id);
CREATE INDEX name_name ON public.name USING btree (name);
CREATE INDEX name_nationality_id ON public.name USING btree (nationality_id);
CREATE INDEX name_next_of_kin_id ON public.name USING btree (next_of_kin_id);
CREATE INDEX name_note_name_id ON public.name_note USING btree (name_id);
CREATE INDEX name_note_patient_event_id ON public.name_note USING btree (patient_event_id);
CREATE INDEX name_note_store_id ON public.name_note USING btree (store_id);
CREATE INDEX name_occupation_id ON public.name USING btree (occupation_id);
CREATE INDEX name_religion_id ON public.name USING btree (religion_id);
CREATE INDEX name_store_join_inactive ON public.name_store_join USING btree (inactive);
CREATE INDEX name_store_join_name_id ON public.name_store_join USING btree (name_id);
CREATE INDEX name_store_join_store_id ON public.name_store_join USING btree (store_id);
CREATE INDEX name_supplier ON public.name USING btree (supplier);
CREATE INDEX name_supplying_store_id ON public.name USING btree (supplying_store_id);
CREATE INDEX name_tag_description ON public.name_tag USING btree (description);
CREATE INDEX name_tag_join_name_id ON public.name_tag_join USING btree (name_id);
CREATE INDEX name_tag_join_name_tag_id ON public.name_tag_join USING btree (name_tag_id);
CREATE INDEX name_type ON public.name USING btree (type);
CREATE INDEX nameinsurancejoin_enteredbyid ON public.nameinsurancejoin USING btree (enteredbyid);
CREATE INDEX nameinsurancejoin_insuranceproviderid ON public.nameinsurancejoin USING btree (insuranceproviderid);
CREATE INDEX nameinsurancejoin_nameid ON public.nameinsurancejoin USING btree (nameid);
CREATE INDEX nationality_description ON public.nationality USING btree (description);
CREATE INDEX number_name ON public.number USING btree (name);
CREATE INDEX om_activity_log_store_id ON public.om_activity_log USING btree (store_id);
CREATE INDEX om_user_permission_store_id ON public.om_user_permission USING btree (store_id);
CREATE INDEX om_user_permission_user_id ON public.om_user_permission USING btree (user_id);
CREATE INDEX period_amount_account_code_id ON public.period_amount USING btree (account_code_id);
CREATE INDEX period_amount_budget_period_id ON public.period_amount USING btree (budget_period_id);
CREATE INDEX period_periodscheduleid ON public.period USING btree (periodscheduleid);
CREATE INDEX permission_name_group_id ON public.permission USING btree (name_group_id);
CREATE INDEX pref_blob_item ON public.pref_blob USING btree (item);
CREATE INDEX pref_blob_network_id ON public.pref_blob USING btree (network_id);
CREATE INDEX pref_item ON public.pref USING btree (item);
CREATE INDEX pref_network_id ON public.pref USING btree (network_id);
CREATE INDEX pref_store_id ON public.pref USING btree (store_id);
CREATE INDEX pref_user_id ON public.pref USING btree (user_id);
CREATE INDEX program_indicator_code ON public.program_indicator USING btree (code);
CREATE INDEX program_indicator_program_id ON public.program_indicator USING btree (program_id);
CREATE INDEX purchase_order_category_id ON public.purchase_order USING btree (category_id);
CREATE INDEX purchase_order_creation_date ON public.purchase_order USING btree (creation_date);
CREATE INDEX purchase_order_donor_id ON public.purchase_order USING btree (donor_id);
CREATE INDEX purchase_order_line_delivery_date_expected ON public.purchase_order_line USING btree (delivery_date_expected);
CREATE INDEX purchase_order_line_item_id ON public.purchase_order_line USING btree (item_id);
CREATE INDEX purchase_order_line_non_stock_name_id ON public.purchase_order_line USING btree (non_stock_name_id);
CREATE INDEX purchase_order_line_purchase_order_id ON public.purchase_order_line USING btree (purchase_order_id);
CREATE INDEX purchase_order_line_quote_line_id ON public.purchase_order_line USING btree (quote_line_id);
CREATE INDEX purchase_order_line_store_id ON public.purchase_order_line USING btree (store_id);
CREATE INDEX purchase_order_linked_transaction_id ON public.purchase_order USING btree (linked_transaction_id);
CREATE INDEX purchase_order_name_id ON public.purchase_order USING btree (name_id);
CREATE INDEX purchase_order_quote_id ON public.purchase_order USING btree (quote_id);
CREATE INDEX purchase_order_status ON public.purchase_order USING btree (status);
CREATE INDEX purchase_order_store_id ON public.purchase_order USING btree (store_id);
CREATE INDEX quote_currency_id ON public.quote USING btree (currency_id);
CREATE INDEX quote_line_currency_id ON public.quote_line USING btree (currency_id);
CREATE INDEX quote_line_item_id ON public.quote_line USING btree (item_id);
CREATE INDEX quote_line_name_id ON public.quote_line USING btree (name_id);
CREATE INDEX quote_line_purchase_order_line_id ON public.quote_line USING btree (purchase_order_line_id);
CREATE INDEX quote_line_quote_id ON public.quote_line USING btree (quote_id);
CREATE INDEX quote_line_tender_currency_id ON public.quote_line USING btree (tender_currency_id);
CREATE INDEX quote_line_tender_line_id ON public.quote_line USING btree (tender_line_id);
CREATE INDEX quote_names_id ON public.quote USING btree (names_id);
CREATE INDEX quote_tender_id ON public.quote USING btree (tender_id);
CREATE INDEX reminder_user_id ON public.reminder USING btree (user_id);
CREATE INDEX repeat_table_name_id ON public.repeat_table USING btree (name_id);
CREATE INDEX replenishment_from_item_line_id ON public.replenishment USING btree (from_item_line_id);
CREATE INDEX replenishment_from_location_id ON public.replenishment USING btree (from_location_id);
CREATE INDEX replenishment_store_id ON public.replenishment USING btree (store_id);
CREATE INDEX replenishment_to_item_line_id ON public.replenishment USING btree (to_item_line_id);
CREATE INDEX replenishment_to_location_id ON public.replenishment USING btree (to_location_id);
CREATE INDEX replenishment_user_id_assigned_to ON public.replenishment USING btree (user_id_assigned_to);
CREATE INDEX replenishment_user_id_created_by ON public.replenishment USING btree (user_id_created_by);
CREATE INDEX requisition_donor_id ON public.requisition USING btree (donor_id);
CREATE INDEX requisition_line_item_id ON public.requisition_line USING btree (item_id);
CREATE INDEX requisition_line_linked_requisition_line_id ON public.requisition_line USING btree (linked_requisition_line_id);
CREATE INDEX requisition_line_optionid ON public.requisition_line USING btree (optionid);
CREATE INDEX requisition_line_requisition_id ON public.requisition_line USING btree (requisition_id);
CREATE INDEX requisition_linked_requisition_id ON public.requisition USING btree (linked_requisition_id);
CREATE INDEX requisition_name_id ON public.requisition USING btree (name_id);
CREATE INDEX requisition_periodid ON public.requisition USING btree (periodid);
CREATE INDEX requisition_programid ON public.requisition USING btree (programid);
CREATE INDEX requisition_status ON public.requisition USING btree (status);
CREATE INDEX requisition_store_id ON public.requisition USING btree (store_id);
CREATE INDEX requisition_type ON public.requisition USING btree (type);
CREATE INDEX sensor_is_active ON public.sensor USING btree (is_active);
CREATE INDEX sensor_locationid ON public.sensor USING btree (locationid);
CREATE INDEX sensor_storeid ON public.sensor USING btree (storeid);
CREATE INDEX sensorlog_customdata ON public.sensorlog USING btree (customdata);
CREATE INDEX sensorlog_locationid ON public.sensorlog USING btree (locationid);
CREATE INDEX sensorlog_sensorid ON public.sensorlog USING btree (sensorid);
CREATE INDEX sensorlog_storeid ON public.sensorlog USING btree (storeid);
CREATE INDEX sensorlogitemlinejoin_itemlineid ON public.sensorlogitemlinejoin USING btree (itemlineid);
CREATE INDEX sensorlogitemlinejoin_sensorlogid ON public.sensorlogitemlinejoin USING btree (sensorlogid);
CREATE INDEX site_app_name ON public.site USING btree (app_name);
CREATE INDEX site_code ON public.site USING btree (code);
CREATE INDEX site_initialisation_status ON public.site USING btree (initialisation_status);
CREATE INDEX site_last_sync_date ON public.site USING btree (last_sync_date);
CREATE INDEX site_last_sync_time ON public.site USING btree (last_sync_time);
CREATE INDEX site_log_date ON public.site_log USING btree (date);
CREATE INDEX site_log_event ON public.site_log USING btree (event);
CREATE INDEX site_log_site_id ON public.site_log USING btree (site_id);
CREATE INDEX site_name ON public.site USING btree (name);
CREATE INDEX site_site_id ON public.site USING btree (site_id);
CREATE INDEX site_support_client_id ON public.site USING btree (support_client_id);
CREATE INDEX stock_take_created_by_id ON public.stock_take USING btree (created_by_id);
CREATE INDEX stock_take_finalised_by_id ON public.stock_take USING btree (finalised_by_id);
CREATE INDEX stock_take_invad_additions_id ON public.stock_take USING btree (invad_additions_id);
CREATE INDEX stock_take_invad_reductions_id ON public.stock_take USING btree (invad_reductions_id);
CREATE INDEX stock_take_lines_batch ON public.stock_take_lines USING btree (batch);
CREATE INDEX stock_take_lines_custom_stock_field_5_id ON public.stock_take_lines USING btree (custom_stock_field_5_id);
CREATE INDEX stock_take_lines_custom_stock_field_6_id ON public.stock_take_lines USING btree (custom_stock_field_6_id);
CREATE INDEX stock_take_lines_custom_stock_field_7_id ON public.stock_take_lines USING btree (custom_stock_field_7_id);
CREATE INDEX stock_take_lines_custom_stock_field_8_id ON public.stock_take_lines USING btree (custom_stock_field_8_id);
CREATE INDEX stock_take_lines_donor_id ON public.stock_take_lines USING btree (donor_id);
CREATE INDEX stock_take_lines_item_id ON public.stock_take_lines USING btree (item_id);
CREATE INDEX stock_take_lines_item_line_id ON public.stock_take_lines USING btree (item_line_id);
CREATE INDEX stock_take_lines_location_id ON public.stock_take_lines USING btree (location_id);
CREATE INDEX stock_take_lines_optionid ON public.stock_take_lines USING btree (optionid);
CREATE INDEX stock_take_lines_stock_take_id ON public.stock_take_lines USING btree (stock_take_id);
CREATE INDEX stock_take_locked ON public.stock_take USING btree (locked);
CREATE INDEX stock_take_programid ON public.stock_take USING btree (programid);
CREATE INDEX stock_take_status ON public.stock_take USING btree (status);
CREATE INDEX stock_take_stock_take_created_date ON public.stock_take USING btree (stock_take_created_date);
CREATE INDEX stock_take_stock_take_date ON public.stock_take USING btree (stock_take_date);
CREATE INDEX stock_take_stock_take_time ON public.stock_take USING btree (stock_take_time);
CREATE INDEX stock_take_store_id ON public.stock_take USING btree (store_id);
CREATE INDEX stock_take_type ON public.stock_take USING btree (type);
CREATE INDEX store_disabled ON public.store USING btree (disabled);
CREATE INDEX store_name_id ON public.store USING btree (name_id);
CREATE INDEX store_store_mode ON public.store USING btree (store_mode);
CREATE INDEX store_sync_id_remote_site ON public.store USING btree (sync_id_remote_site);
CREATE INDEX store_tags ON public.store USING btree (tags);
CREATE INDEX sync_buffer_action ON public.sync_buffer USING btree (action);
CREATE INDEX sync_buffer_site_id ON public.sync_buffer USING btree (site_id);
CREATE INDEX sync_buffer_sync_out_id ON public.sync_buffer USING btree (sync_out_id);
CREATE INDEX sync_dates_sync_dates ON public.sync_dates USING btree (last_sync);
CREATE INDEX sync_out_merge_id_to_delete ON public.sync_out USING btree (merge_id_to_delete);
CREATE INDEX sync_out_merge_id_to_keep ON public.sync_out USING btree (merge_id_to_keep);
CREATE INDEX sync_out_record_id ON public.sync_out USING btree (record_id);
CREATE INDEX sync_out_sequence ON public.sync_out USING btree (sequence);
CREATE INDEX sync_out_store_id ON public.sync_out USING btree (store_id);
CREATE INDEX sync_out_table_id_num ON public.sync_out USING btree (table_id_num);
CREATE INDEX sync_out_table_num ON public.sync_out USING btree (table_num);
CREATE INDEX sync_out_to_from_id ON public.sync_out USING btree (to_from_id);
CREATE INDEX temperature_breach_acknowledged ON public.temperature_breach USING btree (acknowledged);
CREATE INDEX temperature_breach_config_location_type_id ON public.temperature_breach_config USING btree (location_type_id);
CREATE INDEX temperature_breach_config_store_id ON public.temperature_breach_config USING btree (store_id);
CREATE INDEX temperature_breach_location_id ON public.temperature_breach USING btree (location_id);
CREATE INDEX temperature_breach_sensor_id ON public.temperature_breach USING btree (sensor_id);
CREATE INDEX temperature_breach_store_id ON public.temperature_breach USING btree (store_id);
CREATE INDEX temperature_breach_temperature_breach_config_id ON public.temperature_breach USING btree (temperature_breach_config_id);
CREATE INDEX temperature_log_date ON public.temperature_log USING btree (date);
CREATE INDEX temperature_log_location_id ON public.temperature_log USING btree (location_id);
CREATE INDEX temperature_log_sensor_id ON public.temperature_log USING btree (sensor_id);
CREATE INDEX temperature_log_store_id ON public.temperature_log USING btree (store_id);
CREATE INDEX temperature_log_temperature ON public.temperature_log USING btree (temperature);
CREATE INDEX temperature_log_temperature_breach_id ON public.temperature_log USING btree (temperature_breach_id);
CREATE INDEX temperature_log_time ON public.temperature_log USING btree ("time");
CREATE INDEX tender_condition_condition_cat_id ON public.tender_condition USING btree (condition_cat_id);
CREATE INDEX tender_condition_tender_id ON public.tender_condition USING btree (tender_id);
CREATE INDEX tender_created_by_user_id ON public.tender USING btree (created_by_user_id);
CREATE INDEX tender_currency_currency_id ON public.tender_currency USING btree (currency_id);
CREATE INDEX tender_currency_tender_id ON public.tender_currency USING btree (tender_id);
CREATE INDEX tender_desc ON public.tender USING btree ("desc");
CREATE INDEX tender_line_item_id ON public.tender_line USING btree (item_id);
CREATE INDEX tender_line_tender_id ON public.tender_line USING btree (tender_id);
CREATE INDEX tender_line_unit_id ON public.tender_line USING btree (unit_id);
CREATE INDEX tender_store_id ON public.tender USING btree (store_id);
CREATE INDEX trans_line_barcodeid ON public.trans_line USING btree (barcodeid);
CREATE INDEX trans_line_donor_id ON public.trans_line USING btree (donor_id);
CREATE INDEX trans_line_goods_received_lines_id ON public.trans_line USING btree (goods_received_lines_id);
CREATE INDEX trans_line_item_id ON public.trans_line USING btree (item_id);
CREATE INDEX trans_line_item_line_id ON public.trans_line USING btree (item_line_id);
CREATE INDEX trans_line_linked_trans_line_id ON public.trans_line USING btree (linked_trans_line_id);
CREATE INDEX trans_line_location_id ON public.trans_line USING btree (location_id);
CREATE INDEX trans_line_manufacturer_id ON public.trans_line USING btree (manufacturer_id);
CREATE INDEX trans_line_optionid ON public.trans_line USING btree (optionid);
CREATE INDEX trans_line_order_lines_id ON public.trans_line USING btree (order_lines_id);
CREATE INDEX trans_line_program_id ON public.trans_line USING btree (program_id);
CREATE INDEX trans_line_repeat_id ON public.trans_line USING btree (repeat_id);
CREATE INDEX trans_line_transaction_id ON public.trans_line USING btree (transaction_id);
CREATE INDEX trans_line_type ON public.trans_line USING btree (type);
CREATE INDEX trans_line_user_5_id ON public.trans_line USING btree (user_5_id);
CREATE INDEX trans_line_user_6_id ON public.trans_line USING btree (user_6_id);
CREATE INDEX trans_line_user_7_id ON public.trans_line USING btree (user_7_id);
CREATE INDEX trans_line_user_8_id ON public.trans_line USING btree (user_8_id);
CREATE INDEX trans_note_transact_id ON public.trans_note USING btree (transact_id);
CREATE INDEX transact_amount_outstanding ON public.transact USING btree (amount_outstanding);
CREATE INDEX transact_budget_period_id ON public.transact USING btree (budget_period_id);
CREATE INDEX transact_category_id ON public.transact USING btree (category_id);
CREATE INDEX transact_confirm_date ON public.transact USING btree (confirm_date);
CREATE INDEX transact_donor_default_id ON public.transact USING btree (donor_default_id);
CREATE INDEX transact_entry_date ON public.transact USING btree (entry_date);
CREATE INDEX transact_goods_received_id ON public.transact USING btree (goods_received_id);
CREATE INDEX transact_invoice_num ON public.transact USING btree (invoice_num);
CREATE INDEX transact_linked_goods_received_id ON public.transact USING btree (linked_goods_received_id);
CREATE INDEX transact_linked_transaction_id ON public.transact USING btree (linked_transaction_id);
CREATE INDEX transact_mode ON public.transact USING btree (mode);
CREATE INDEX transact_name_id ON public.transact USING btree (name_id);
CREATE INDEX transact_nameinsurancejoinid ON public.transact USING btree (nameinsurancejoinid);
CREATE INDEX transact_original_po_id ON public.transact USING btree (original_po_id);
CREATE INDEX transact_prescriber_id ON public.transact USING btree (prescriber_id);
CREATE INDEX transact_programid ON public.transact USING btree (programid);
CREATE INDEX transact_requisition_id ON public.transact USING btree (requisition_id);
CREATE INDEX transact_ship_method_id ON public.transact USING btree (ship_method_id);
CREATE INDEX transact_status ON public.transact USING btree (status);
CREATE INDEX transact_store_id ON public.transact USING btree (store_id);
CREATE INDEX transact_type ON public.transact USING btree (type);
CREATE INDEX transact_user_id ON public.transact USING btree (user_id);
CREATE INDEX user_active ON public."user" USING btree (active);
CREATE INDEX user_is_group ON public."user" USING btree (is_group);
CREATE INDEX user_license_category_id ON public."user" USING btree (license_category_id);
CREATE INDEX user_store_can_login ON public.user_store USING btree (can_login);
CREATE INDEX user_store_store_default ON public.user_store USING btree (store_default);
CREATE INDEX user_store_store_id ON public.user_store USING btree (store_id);
CREATE INDEX user_store_user_id ON public.user_store USING btree (user_id);
CREATE INDEX vaccine_vial_monitor_status_log_item_line_id ON public.vaccine_vial_monitor_status_log USING btree (item_line_id);
CREATE INDEX vaccine_vial_monitor_status_log_status_id ON public.vaccine_vial_monitor_status_log USING btree (status_id);
CREATE INDEX vaccine_vial_monitor_status_log_store_id ON public.vaccine_vial_monitor_status_log USING btree (store_id);
CREATE INDEX vaccine_vial_monitor_status_log_trans_line_id ON public.vaccine_vial_monitor_status_log USING btree (trans_line_id);
CREATE INDEX vaccine_vial_monitor_status_log_user_id ON public.vaccine_vial_monitor_status_log USING btree (user_id);
