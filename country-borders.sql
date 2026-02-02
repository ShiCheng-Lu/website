LOAD spatial;

SET s3_region='us-west-2';

COPY(
  SELECT
    id,
    division_id,
    names.primary as country,
    to_json(names.common) as names,
    ST_CoverageSimplify([geometry], 0.2, true),
    version,
  FROM
    read_parquet('s3://overturemaps-us-west-2/release/2026-01-21.0/theme=divisions/type=division_area/*', hive_partitioning=1)
  WHERE
    subtype = 'country'
  QUALIFY version = MAX(version) OVER (PARTITION BY country)
) TO 'public/country-borders.geojson' WITH (FORMAT GDAL, DRIVER 'GeoJSON');
