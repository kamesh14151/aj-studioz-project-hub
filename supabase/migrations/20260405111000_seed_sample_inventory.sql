-- Seed sample inventory components for Student/Admin dashboards.
-- Safe to re-run: inserts only names that do not already exist.
WITH sample_items(name, category, total_count, available_count, image_url) AS (
  VALUES
    ('Arduino Uno R3', 'Microcontroller', 25, 18, 'https://images.unsplash.com/photo-1518770660439-4636190af475?auto=format&fit=crop&w=1200&q=80'),
    ('Breadboard 830 Points', 'Prototyping', 50, 42, 'https://images.unsplash.com/photo-1553406830-ef2513450d76?auto=format&fit=crop&w=1200&q=80'),
    ('DHT11 Temperature & Humidity Sensor', 'Sensor', 35, 28, 'https://images.unsplash.com/photo-1516116216624-53e697fedbea?auto=format&fit=crop&w=1200&q=80'),
    ('16x2 LCD Display Module', 'Display', 20, 15, 'https://images.unsplash.com/photo-1581092583537-20d51b4b4f1b?auto=format&fit=crop&w=1200&q=80'),
    ('Jumper Wires Kit (M-M, M-F, F-F)', 'Connectivity', 40, 32, 'https://images.unsplash.com/photo-1563770660941-20978e870e26?auto=format&fit=crop&w=1200&q=80'),
    ('ESP32 Development Board', 'Microcontroller', 30, 24, 'https://images.unsplash.com/photo-1581093458791-9f3c3900df4b?auto=format&fit=crop&w=1200&q=80'),
    ('Ultrasonic Sensor HC-SR04', 'Sensor', 28, 21, 'https://images.unsplash.com/photo-1614064548016-0fe5f4f783ab?auto=format&fit=crop&w=1200&q=80'),
    ('Servo Motor SG90', 'Actuator', 36, 29, 'https://images.unsplash.com/photo-1563770660941-10a636076f70?auto=format&fit=crop&w=1200&q=80'),
    ('Raspberry Pi 4 (4GB)', 'Single-board Computer', 10, 7, 'https://images.unsplash.com/photo-1587300003388-59208cc962cb?auto=format&fit=crop&w=1200&q=80'),
    ('L298N Motor Driver Module', 'Motor Driver', 22, 17, 'https://images.unsplash.com/photo-1581092160562-40aa08e78837?auto=format&fit=crop&w=1200&q=80'),
    ('IR Obstacle Sensor Module', 'Sensor', 30, 25, 'https://images.unsplash.com/photo-1563770660941-2f7f1cbf7e55?auto=format&fit=crop&w=1200&q=80'),
    ('Rechargeable Li-ion Battery Pack', 'Power', 18, 12, 'https://images.unsplash.com/photo-1603732551658-5fabbafa84eb?auto=format&fit=crop&w=1200&q=80')
)
INSERT INTO public.inventory (name, category, total_count, available_count, image_url)
SELECT s.name, s.category, s.total_count, s.available_count, s.image_url
FROM sample_items s
WHERE NOT EXISTS (
  SELECT 1 FROM public.inventory i WHERE lower(i.name) = lower(s.name)
);
