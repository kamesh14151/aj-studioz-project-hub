-- Provide a fuller, production-like inventory catalog.
-- Safe to re-run: updates existing matching items, inserts missing items.

WITH catalog(name, category, total_count, available_count, image_url) AS (
  VALUES
    ('Arduino Uno R3', 'Microcontroller', 30, 24, 'https://images.unsplash.com/photo-1518770660439-4636190af475?auto=format&fit=crop&w=1200&q=80'),
    ('Arduino Nano', 'Microcontroller', 35, 29, 'https://images.unsplash.com/photo-1553406830-ef2513450d76?auto=format&fit=crop&w=1200&q=80'),
    ('ESP32 Development Board', 'Microcontroller', 40, 31, 'https://images.unsplash.com/photo-1581093458791-9f3c3900df4b?auto=format&fit=crop&w=1200&q=80'),
    ('NodeMCU ESP8266', 'Microcontroller', 28, 20, 'https://images.unsplash.com/photo-1614064548016-0fe5f4f783ab?auto=format&fit=crop&w=1200&q=80'),
    ('Raspberry Pi 4 (4GB)', 'Single-board Computer', 12, 8, 'https://images.unsplash.com/photo-1587300003388-59208cc962cb?auto=format&fit=crop&w=1200&q=80'),

    ('Breadboard 830 Points', 'Prototyping', 80, 65, 'https://images.unsplash.com/photo-1553406830-ef2513450d76?auto=format&fit=crop&w=1200&q=80'),
    ('Jumper Wires Kit (M-M, M-F, F-F)', 'Connectivity', 70, 56, 'https://images.unsplash.com/photo-1563770660941-20978e870e26?auto=format&fit=crop&w=1200&q=80'),
    ('Resistor Assorted Kit', 'Passive Components', 55, 44, 'https://images.unsplash.com/photo-1563770660941-10a636076f70?auto=format&fit=crop&w=1200&q=80'),
    ('Capacitor Assorted Kit', 'Passive Components', 45, 37, 'https://images.unsplash.com/photo-1581092160562-40aa08e78837?auto=format&fit=crop&w=1200&q=80'),
    ('Solderless PCB Prototype Board', 'Prototyping', 40, 30, 'https://images.unsplash.com/photo-1563770660941-2f7f1cbf7e55?auto=format&fit=crop&w=1200&q=80'),

    ('DHT11 Temperature & Humidity Sensor', 'Sensor', 45, 34, 'https://images.unsplash.com/photo-1516116216624-53e697fedbea?auto=format&fit=crop&w=1200&q=80'),
    ('Ultrasonic Sensor HC-SR04', 'Sensor', 40, 31, 'https://images.unsplash.com/photo-1614064548016-0fe5f4f783ab?auto=format&fit=crop&w=1200&q=80'),
    ('IR Obstacle Sensor Module', 'Sensor', 42, 33, 'https://images.unsplash.com/photo-1563770660941-2f7f1cbf7e55?auto=format&fit=crop&w=1200&q=80'),
    ('PIR Motion Sensor', 'Sensor', 30, 23, 'https://images.unsplash.com/photo-1581092583537-20d51b4b4f1b?auto=format&fit=crop&w=1200&q=80'),
    ('Soil Moisture Sensor', 'Sensor', 36, 27, 'https://images.unsplash.com/photo-1581093458791-9f3c3900df4b?auto=format&fit=crop&w=1200&q=80'),

    ('16x2 LCD Display Module', 'Display', 26, 19, 'https://images.unsplash.com/photo-1581092583537-20d51b4b4f1b?auto=format&fit=crop&w=1200&q=80'),
    ('OLED Display 0.96 inch', 'Display', 24, 17, 'https://images.unsplash.com/photo-1581092160562-40aa08e78837?auto=format&fit=crop&w=1200&q=80'),
    ('7-Segment Display Pack', 'Display', 32, 24, 'https://images.unsplash.com/photo-1603732551658-5fabbafa84eb?auto=format&fit=crop&w=1200&q=80'),

    ('Servo Motor SG90', 'Actuator', 50, 39, 'https://images.unsplash.com/photo-1563770660941-10a636076f70?auto=format&fit=crop&w=1200&q=80'),
    ('DC Motor 12V', 'Actuator', 34, 26, 'https://images.unsplash.com/photo-1581092160562-40aa08e78837?auto=format&fit=crop&w=1200&q=80'),
    ('Stepper Motor NEMA 17', 'Actuator', 18, 12, 'https://images.unsplash.com/photo-1563770660941-20978e870e26?auto=format&fit=crop&w=1200&q=80'),
    ('L298N Motor Driver Module', 'Motor Driver', 30, 22, 'https://images.unsplash.com/photo-1581092160562-40aa08e78837?auto=format&fit=crop&w=1200&q=80'),
    ('A4988 Stepper Driver', 'Motor Driver', 22, 16, 'https://images.unsplash.com/photo-1518770660439-4636190af475?auto=format&fit=crop&w=1200&q=80'),

    ('Rechargeable Li-ion Battery Pack', 'Power', 25, 17, 'https://images.unsplash.com/photo-1603732551658-5fabbafa84eb?auto=format&fit=crop&w=1200&q=80'),
    ('5V 2A Adapter', 'Power', 38, 30, 'https://images.unsplash.com/photo-1553406830-ef2513450d76?auto=format&fit=crop&w=1200&q=80'),
    ('9V Battery', 'Power', 60, 48, 'https://images.unsplash.com/photo-1603732551658-5fabbafa84eb?auto=format&fit=crop&w=1200&q=80'),

    ('USB to TTL Converter', 'Tools', 20, 14, 'https://images.unsplash.com/photo-1518770660439-4636190af475?auto=format&fit=crop&w=1200&q=80'),
    ('Digital Multimeter', 'Tools', 15, 11, 'https://images.unsplash.com/photo-1581093458791-9f3c3900df4b?auto=format&fit=crop&w=1200&q=80'),
    ('Soldering Iron Kit', 'Tools', 14, 9, 'https://images.unsplash.com/photo-1563770660941-20978e870e26?auto=format&fit=crop&w=1200&q=80'),
    ('Wire Stripper and Cutter', 'Tools', 20, 15, 'https://images.unsplash.com/photo-1553406830-ef2513450d76?auto=format&fit=crop&w=1200&q=80')
),
updated AS (
  UPDATE public.inventory i
  SET
    category = c.category,
    total_count = GREATEST(c.total_count, i.total_count),
    available_count = LEAST(
      GREATEST(COALESCE(i.available_count, c.available_count), 0),
      GREATEST(c.total_count, i.total_count)
    ),
    image_url = COALESCE(i.image_url, c.image_url)
  FROM catalog c
  WHERE lower(i.name) = lower(c.name)
  RETURNING i.name
)
INSERT INTO public.inventory (name, category, total_count, available_count, image_url)
SELECT c.name, c.category, c.total_count, c.available_count, c.image_url
FROM catalog c
WHERE NOT EXISTS (
  SELECT 1 FROM public.inventory i WHERE lower(i.name) = lower(c.name)
);

-- Keep counts valid for all items.
UPDATE public.inventory
SET
  total_count = GREATEST(total_count, 0),
  available_count = LEAST(GREATEST(available_count, 0), GREATEST(total_count, 0));
