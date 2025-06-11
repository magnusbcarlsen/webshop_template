---------------------------------------------------------------
------------------------ BERGSTRØM ART ------------------------
---------------------------------------------------------------

INSERT INTO products
  (name, slug, description, price, sale_price, stock_quantity, sku, weight, dimensions, is_featured, is_active)
VALUES
  ('Disrupted Human - Keep Swimming',
   'disrupted-human-keep-swimming',
   'Hvor skal vi hen? Indad, udad, videre, dybere. Det er ikke altid destinationen er klar for udenforstående, men vi er ganske ofte et nyt sted i næste moment.',
   8500.00, NULL, 1, NULL, NULL, '100x92 cm', false, true),

  ('Disrupted Human - No Words',
   'disrupted-human-no-words',
   NULL,
   8500.00, NULL, 1, NULL, NULL, '90x90 cm', false, true),

  ('Disrupted Human - Drawn by Infinity',
   'disrupted-human-drawn-by-infinity',
   'Det er både facinerende, smukt og lidt skræmmende på samme tid. Tanken om uendeligheden. Er vi ligegyldige eller en vigtig brik i et kæmpe puslespil?',
   8500.00, NULL, 1, NULL, NULL, '116x90 cm', false, true),

  ('Disrupted Human - Lost in Cyberspace',
   'disrupted-human-lost-in-cyberspace',
   'Er det mennesket, der styrer cyberspace eller er det cyberspace, der styrer mennesket? Under alle omstændigheder har algoritmen gjort sit for at opløse den menneskelige natur.',
   8500.00, NULL, 1, NULL, NULL, '116x90 cm', false, true),

  ('Disrupted Human - Last Summer',
   'disrupted-human-last-summer',
   'Hukommelsen er mærkelig; fortiden toner frem i små forstyrrede glimt som et gammelt tv-signal med atmosfæriske forstyrrelser.',
   8500.00, NULL, 1, NULL, NULL, '90x90 cm', false, true),

  ('Disrupted Human - Being a Wallflower',
   'disrupted-human-being-a-wallflower',
   'Næsten usynlig, men alligevel tilstede og uundgåelig. Omgivelserne har sat spor.',
   9500.00, NULL, 1, NULL, NULL, '73x93 cm', false, true),

  ('Transition, Pink',
   'transition-pink',
   NULL,
   8500.00, NULL, 1, NULL, NULL, '81x100 cm', false, true),

  ('Transition, Yellow',
   'transition-yellow',
   NULL,
   8500.00, NULL, 1, NULL, NULL, '90x90 cm', false, true),

  ('Transition, Green',
   'transition-green',
   NULL,
   8500.00, NULL, 1, NULL, NULL, '80x96 cm', false, true),

  ('Colors make me live',
   'colors-make-me-live',
   NULL,
   12500.00, NULL, 1, NULL, NULL, '150x200', false, true),

  ('Go with the flow, pink',
   'go-with-the-flow-pink',
   NULL,
   7500.00, NULL, 1, NULL, NULL, '73x93', false, true),

  ('Go with the flow, yellow',
   'go-with-the-flow-yellow',
   NULL,
   7500.00, NULL, 1, NULL, NULL, '73x93', false, true),

  ('Power of Joy - Grounded',
   'power-of-joy-grounded',
   NULL,
   9500.00, NULL, 1, NULL, NULL, '100x100 cm', false, true),

  ('Power of Joy - Monday Morning',
   'power-of-joy-monday-morning',
   NULL,
   9500.00, NULL, 1, NULL, NULL, '100x100 cm', false, true),

  ('Power of Joy - Marvellous Memory',
   'power-of-joy-marvellous-memory',
   NULL,
   9500.00, NULL, 1, NULL, NULL, '100x100 cm', false, true),

  ('Power of Joy - Healing Laughter',
   'power-of-joy-healing-laughter',
   NULL,
   9500.00, NULL, 1, NULL, NULL, '100x100 cm', false, true),

  ('Power of Joy - Deep Breathing',
   'power-of-joy-deep-breathing',
   NULL,
   12500.00, NULL, 1, NULL, NULL, '100x150 cm', false, true),

  ('Power of Joy - Reunited',
   'power-of-joy-reunited',
   NULL,
   12500.00, NULL, 1, NULL, NULL, '100x150 cm', false, true);


-- 1) Link every painting to the “Oliemaleri” category
INSERT INTO product_categories (product_id, category_id)
SELECT p.product_id, c.category_id
FROM products p
JOIN categories c ON c.slug = 'oliemaleri';


-- 2) Create a “Technique” attribute and remember its ID
INSERT INTO attributes (name) VALUES ('Technique');
SET @tech_id = LAST_INSERT_ID();


-- 3) Define all painting techniques as attribute values
INSERT INTO attribute_values (attribute_id, value) VALUES
  (@tech_id, 'Malet med bølgepap'),
  (@tech_id, 'Malet med spatel'),
  (@tech_id, 'Malet med bobleplast'),
  (@tech_id, 'Malet med svamp'),
  (@tech_id, 'Malet med pensel');


-- 4) Map each painting to its technique via product_attributes

INSERT INTO product_attributes (product_id, attribute_value_id)

-- BØLGEPAP
SELECT p.product_id, av.attribute_value_id
FROM products p
JOIN attribute_values av
  ON av.attribute_id = @tech_id
 AND av.value = 'Malet med bølgepap'
WHERE p.slug IN (
  'disrupted-human-keep-swimming',
  'disrupted-human-last-summer'
)

UNION ALL

-- SPATEL
SELECT p.product_id, av.attribute_value_id
FROM products p
JOIN attribute_values av
  ON av.attribute_id = @tech_id
 AND av.value = 'Malet med spatel'
WHERE p.slug IN (
  'disrupted-human-no-words',
  'power-of-joy-grounded',
  'power-of-joy-monday-morning',
  'power-of-joy-marvellous-memory',
  'power-of-joy-healing-laughter',
  'power-of-joy-deep-breathing',
  'power-of-joy-reunited'
)

UNION ALL

-- BOBLEPLAST
SELECT p.product_id, av.attribute_value_id
FROM products p
JOIN attribute_values av
  ON av.attribute_id = @tech_id
 AND av.value = 'Malet med bobleplast'
WHERE p.slug IN (
  'disrupted-human-drawn-by-infinity',
  'disrupted-human-lost-in-cyberspace'
)

UNION ALL

-- SVAMP
SELECT p.product_id, av.attribute_value_id
FROM products p
JOIN attribute_values av
  ON av.attribute_id = @tech_id
 AND av.value = 'Malet med svamp'
WHERE p.slug = 'disrupted-human-being-a-wallflower'

UNION ALL

-- PENSEL
SELECT p.product_id, av.attribute_value_id
FROM products p
JOIN attribute_values av
  ON av.attribute_id = @tech_id
 AND av.value = 'Malet med pensel'
WHERE p.slug IN (
  'transition-pink',
  'transition-yellow',
  'transition-green',
  'colors-make-me-live',
  'go-with-the-flow-pink',
  'go-with-the-flow-yellow'
);
---------------------------------------------------------------
------------------------ BERGSTRØM ART ------------------------
---------------------------------------------------------------