-- PHAÖRA town figures: the numbers in each town page's "by the numbers" block
-- and on /hardscape-index/. Read-only, one statement, mail_parcels only.
--
-- Run it once per batch, 1 to 7, changing only the number in `1 as batch` on
-- the first line. Each batch stays inside the 60-second query limit; Harris
-- County is batch 7 on its own and takes about 50 seconds. Every row of each
-- result goes into scripts/town-data.json, then `node scripts/inject-town-data.js`.
--
-- Areas. MA, CT, RI, NH and ME pages are towns, filed under the town name
-- (MassGIS files Manchester-by-the-Sea as 'Manchester'). Every MA town on file
-- is listed, for the index. TX, CO, WY and IN pages are cities whose homes are
-- filed under the county ('Harris County' in Texas, 'Adams' in Colorado and
-- Indiana), so those pages carry the county's figures. A listed area with no
-- rows returns nothing.
with params as (select current_date as today, 1 as batch),
areas(batch, state, town) as (values
  (1, 'MA', 'Acton'), (1, 'MA', 'Andover'), (1, 'MA', 'Arlington'), (1, 'MA', 'Ashland'),
  (1, 'MA', 'Belmont'), (1, 'MA', 'Beverly'), (1, 'MA', 'Bolton'), (1, 'MA', 'Bourne'),
  (1, 'MA', 'Boxford'), (1, 'MA', 'Braintree'), (1, 'MA', 'Brookline'), (1, 'MA', 'Canton'),
  (1, 'MA', 'Carlisle'), (1, 'MA', 'Chatham'), (1, 'MA', 'Cohasset'), (1, 'MA', 'Concord'),
  (1, 'MA', 'Dedham'), (1, 'MA', 'Dennis'), (1, 'MA', 'Dover'), (1, 'MA', 'Duxbury'),
  (1, 'MA', 'Essex'), (1, 'MA', 'Falmouth'), (1, 'MA', 'Gloucester'), (1, 'MA', 'Groton'),
  (1, 'MA', 'Hamilton'), (1, 'MA', 'Harvard'), (1, 'MA', 'Hingham'), (1, 'MA', 'Holliston'),
  (1, 'MA', 'Hopkinton'), (1, 'MA', 'Hull'), (1, 'MA', 'Ipswich'), (1, 'MA', 'Kingston'),
  (1, 'MA', 'Lexington'), (1, 'MA', 'Lincoln'), (1, 'MA', 'Lynn'), (1, 'MA', 'Lynnfield'),
  (1, 'MA', 'Manchester'), (1, 'MA', 'Marblehead'), (1, 'MA', 'Marshfield'),
  (1, 'MA', 'Medfield'), (1, 'MA', 'Melrose'), (1, 'MA', 'Milton'), (1, 'MA', 'Nahant'),
  (1, 'MA', 'Natick'), (1, 'MA', 'Needham'), (1, 'MA', 'Newbury'), (1, 'MA', 'Newburyport'),
  (1, 'MA', 'Newton'), (1, 'MA', 'Northborough'), (1, 'MA', 'Norwell'), (1, 'MA', 'Plymouth'),
  (1, 'MA', 'Quincy'), (1, 'MA', 'Reading'), (1, 'MA', 'Revere'), (1, 'MA', 'Rockport'),
  (1, 'MA', 'Rowley'), (1, 'MA', 'Salem'), (1, 'MA', 'Salisbury'), (1, 'MA', 'Saugus'),
  (1, 'MA', 'Scituate'), (1, 'MA', 'Sherborn'), (1, 'MA', 'Shrewsbury'),
  (1, 'MA', 'Southborough'), (1, 'MA', 'Stow'), (1, 'MA', 'Sudbury'), (1, 'MA', 'Swampscott'),
  (1, 'MA', 'Topsfield'), (1, 'MA', 'Walpole'), (1, 'MA', 'Wayland'), (1, 'MA', 'Wellesley'),
  (1, 'MA', 'Wenham'), (1, 'MA', 'Westborough'), (1, 'MA', 'Weston'), (1, 'MA', 'Westwood'),
  (1, 'MA', 'Weymouth'), (1, 'MA', 'Winchester'), (1, 'MA', 'Winthrop'),
  (2, 'CT', 'Branford'), (2, 'CT', 'Bridgeport'), (2, 'CT', 'Clinton'), (2, 'CT', 'Darien'),
  (2, 'CT', 'East Haven'), (2, 'CT', 'East Lyme'), (2, 'CT', 'Fairfield'),
  (2, 'CT', 'Greenwich'), (2, 'CT', 'Groton'), (2, 'CT', 'Guilford'), (2, 'CT', 'Madison'),
  (2, 'CT', 'Milford'), (2, 'CT', 'New Haven'), (2, 'CT', 'New London'), (2, 'CT', 'Norwalk'),
  (2, 'CT', 'Old Lyme'), (2, 'CT', 'Old Saybrook'), (2, 'CT', 'Stamford'),
  (2, 'CT', 'Stonington'), (2, 'CT', 'Stratford'), (2, 'CT', 'Waterford'),
  (2, 'CT', 'West Haven'), (2, 'CT', 'Westbrook'), (2, 'CT', 'Westport'),
  (2, 'RI', 'Barrington'), (2, 'RI', 'Jamestown'), (2, 'RI', 'Little Compton'),
  (2, 'RI', 'Narragansett'), (2, 'RI', 'Newport'), (2, 'RI', 'Portsmouth'),
  (2, 'RI', 'Westerly'),
  (2, 'NH', 'Durham'), (2, 'NH', 'Greenland'), (2, 'NH', 'Hampton'), (2, 'NH', 'New Castle'),
  (2, 'NH', 'Newington'), (2, 'NH', 'Newmarket'), (2, 'NH', 'North Hampton'),
  (2, 'NH', 'Portsmouth'), (2, 'NH', 'Rye'), (2, 'NH', 'Seabrook'),
  (2, 'ME', 'Cape Elizabeth'), (2, 'ME', 'Kennebunkport'), (2, 'ME', 'Kittery'),
  (2, 'ME', 'Ogunquit'), (2, 'ME', 'York'),
  (2, 'WY', 'Laramie'), (2, 'WY', 'Natrona'),
  (3, 'IN', 'Adams'), (3, 'IN', 'Allen'), (3, 'IN', 'Hamilton'),
  (4, 'IN', 'Lake'), (4, 'IN', 'Marion'),
  (5, 'CO', 'Adams'),
  (5, 'TX', 'Bexar County'),
  (6, 'TX', 'Tarrant County'),
  (7, 'TX', 'Harris County')
),
a as (select areas.state, areas.town from areas join params on areas.batch = params.batch),
-- One read of each area's rows. Indiana's 23 September import left an unfiltered
-- twin of every home (parcel_ref 'IN-<County>-<n>', use_code 'IN-UNFILTERED').
-- Where an area holds more than one dated import, only the newest counts: rows
-- an older import left behind are homes counted twice or no longer on the roll.
homes as materialized (
  select x.state, x.town, x.year_built, x.lot_sqft, x.last_sale_date, x.last_sale_price,
         x.latest_load
  from (
    select a.state, a.town,
           p.year_built, p.lot_sqft, p.last_sale_date, p.last_sale_price,
           substring(p.source_tag from '(\d{4}-\d{2}-\d{2})$') as load,
           max(substring(p.source_tag from '(\d{4}-\d{2}-\d{2})$'))
             over (partition by a.state, a.town) as latest_load
    from a
    join mail_parcels p on p.state = a.state and p.town = a.town
    where p.use_code not like '%UNFILTERED'
  ) x
  where x.latest_load is null or x.load is null or x.load = x.latest_load
),
stats as (
  select h.state, h.town, max(h.latest_load) as latest_load,
    count(*) as homes,
    count(*) filter (where h.year_built between 1600 and extract(year from pr.today)) as yb_n,
    percentile_disc(0.5) within group (order by h.year_built)
      filter (where h.year_built between 1600 and extract(year from pr.today)) as median_year,
    count(*) filter (where h.year_built between 1600 and 1979) as pre1980_n,
    count(*) filter (where h.lot_sqft > 0) as lot_n,
    round((percentile_cont(0.5) within group (order by h.lot_sqft)
      filter (where h.lot_sqft > 0))::numeric) as median_lot_sqft,
    count(*) filter (where h.last_sale_date > pr.today - interval '5 years'
      and h.last_sale_date <= pr.today) as sales5y_n,
    -- The month the record runs to: by then 99% of the last five years' sales
    -- on file had closed. A roll's last few weeks are thin, and one stray date
    -- should not move the window.
    date_trunc('month', percentile_disc(0.99) within group (order by h.last_sale_date)
      filter (where h.last_sale_date > pr.today - interval '5 years'
        and h.last_sale_date <= pr.today))::date as through_month
  from homes h cross join params pr
  group by h.state, h.town
),
-- The 24 whole months ending with through_month. Future dates never count.
sales as (
  select h.state, h.town, h.last_sale_date, h.last_sale_price
  from homes h join stats s using (state, town) cross join params pr
  where h.last_sale_date >= s.through_month - interval '23 months'
    and h.last_sale_date < s.through_month + interval '1 month'
    and h.last_sale_date <= pr.today
),
-- A sale is a price over $1,000 on one home. One price on several homes the
-- same day is a package deed; its price belongs to none of them.
win as (
  select z.state, z.town,
    count(*) as dated_24,
    count(*) filter (where z.one_deed) as priced_24,
    round((percentile_cont(0.5) within group (order by z.last_sale_price)
      filter (where z.one_deed))::numeric) as median_price_24
  from (
    select s.*, (s.last_sale_price > 1000 and count(*) over (
      partition by s.state, s.town, s.last_sale_date, s.last_sale_price) = 1) as one_deed
    from sales s
  ) z
  group by z.state, z.town
)
select pr.batch, pr.today as computed_on,
  jsonb_agg(jsonb_build_object(
    'state', s.state, 'town', s.town, 'latest_load', s.latest_load,
    'homes', s.homes, 'yb_n', s.yb_n, 'median_year', s.median_year, 'pre1980_n', s.pre1980_n,
    'lot_n', s.lot_n, 'median_lot_sqft', s.median_lot_sqft,
    'sales5y_n', s.sales5y_n, 'through_month', s.through_month,
    'dated_24', coalesce(w.dated_24, 0), 'priced_24', coalesce(w.priced_24, 0),
    'median_price_24', w.median_price_24
  ) order by s.state, s.town) as areas
from stats s
left join win w using (state, town)
cross join params pr
group by pr.batch, pr.today;
