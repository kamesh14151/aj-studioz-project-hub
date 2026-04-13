export interface DefaultInventoryItem {
  id: string;
  name: string;
  category: string;
  total_count: number;
  available_count: number;
  image_url: string | null;
}

export const defaultInventoryCatalog: DefaultInventoryItem[] = [
  { id: "fallback-1", name: "Arduino Uno R3", category: "Microcontroller", total_count: 30, available_count: 24, image_url: "https://images.unsplash.com/photo-1518770660439-4636190af475?auto=format&fit=crop&w=1200&q=80" },
  { id: "fallback-2", name: "Arduino Nano", category: "Microcontroller", total_count: 35, available_count: 29, image_url: "https://images.unsplash.com/photo-1553406830-ef2513450d76?auto=format&fit=crop&w=1200&q=80" },
  { id: "fallback-3", name: "ESP32 Development Board", category: "Microcontroller", total_count: 40, available_count: 31, image_url: "https://images.unsplash.com/photo-1581093458791-9f3c3900df4b?auto=format&fit=crop&w=1200&q=80" },
  { id: "fallback-4", name: "NodeMCU ESP8266", category: "Microcontroller", total_count: 28, available_count: 20, image_url: "https://images.unsplash.com/photo-1614064548016-0fe5f4f783ab?auto=format&fit=crop&w=1200&q=80" },
  { id: "fallback-5", name: "Raspberry Pi 4 (4GB)", category: "Single-board Computer", total_count: 12, available_count: 8, image_url: "https://images.unsplash.com/photo-1587300003388-59208cc962cb?auto=format&fit=crop&w=1200&q=80" },
  { id: "fallback-6", name: "Breadboard 830 Points", category: "Prototyping", total_count: 80, available_count: 65, image_url: "https://images.unsplash.com/photo-1553406830-ef2513450d76?auto=format&fit=crop&w=1200&q=80" },
  { id: "fallback-7", name: "Jumper Wires Kit (M-M, M-F, F-F)", category: "Connectivity", total_count: 70, available_count: 56, image_url: "https://images.unsplash.com/photo-1563770660941-20978e870e26?auto=format&fit=crop&w=1200&q=80" },
  { id: "fallback-8", name: "Resistor Assorted Kit", category: "Passive Components", total_count: 55, available_count: 44, image_url: "https://images.unsplash.com/photo-1563770660941-10a636076f70?auto=format&fit=crop&w=1200&q=80" },
  { id: "fallback-9", name: "Capacitor Assorted Kit", category: "Passive Components", total_count: 45, available_count: 37, image_url: "https://images.unsplash.com/photo-1581092160562-40aa08e78837?auto=format&fit=crop&w=1200&q=80" },
  { id: "fallback-10", name: "Solderless PCB Prototype Board", category: "Prototyping", total_count: 40, available_count: 30, image_url: "https://images.unsplash.com/photo-1563770660941-2f7f1cbf7e55?auto=format&fit=crop&w=1200&q=80" },
  { id: "fallback-11", name: "DHT11 Temperature & Humidity Sensor", category: "Sensor", total_count: 45, available_count: 34, image_url: "https://images.unsplash.com/photo-1516116216624-53e697fedbea?auto=format&fit=crop&w=1200&q=80" },
  { id: "fallback-12", name: "Ultrasonic Sensor HC-SR04", category: "Sensor", total_count: 40, available_count: 31, image_url: "https://images.unsplash.com/photo-1614064548016-0fe5f4f783ab?auto=format&fit=crop&w=1200&q=80" },
  { id: "fallback-13", name: "IR Obstacle Sensor Module", category: "Sensor", total_count: 42, available_count: 33, image_url: "https://images.unsplash.com/photo-1563770660941-2f7f1cbf7e55?auto=format&fit=crop&w=1200&q=80" },
  { id: "fallback-14", name: "PIR Motion Sensor", category: "Sensor", total_count: 30, available_count: 23, image_url: "https://images.unsplash.com/photo-1581092583537-20d51b4b4f1b?auto=format&fit=crop&w=1200&q=80" },
  { id: "fallback-15", name: "Soil Moisture Sensor", category: "Sensor", total_count: 36, available_count: 27, image_url: "https://images.unsplash.com/photo-1581093458791-9f3c3900df4b?auto=format&fit=crop&w=1200&q=80" },
  { id: "fallback-16", name: "16x2 LCD Display Module", category: "Display", total_count: 26, available_count: 19, image_url: "https://images.unsplash.com/photo-1581092583537-20d51b4b4f1b?auto=format&fit=crop&w=1200&q=80" },
  { id: "fallback-17", name: "OLED Display 0.96 inch", category: "Display", total_count: 24, available_count: 17, image_url: "https://images.unsplash.com/photo-1581092160562-40aa08e78837?auto=format&fit=crop&w=1200&q=80" },
  { id: "fallback-18", name: "7-Segment Display Pack", category: "Display", total_count: 32, available_count: 24, image_url: "https://images.unsplash.com/photo-1603732551658-5fabbafa84eb?auto=format&fit=crop&w=1200&q=80" },
  { id: "fallback-19", name: "Servo Motor SG90", category: "Actuator", total_count: 50, available_count: 39, image_url: "https://images.unsplash.com/photo-1563770660941-10a636076f70?auto=format&fit=crop&w=1200&q=80" },
  { id: "fallback-20", name: "DC Motor 12V", category: "Actuator", total_count: 34, available_count: 26, image_url: "https://images.unsplash.com/photo-1581092160562-40aa08e78837?auto=format&fit=crop&w=1200&q=80" },
  { id: "fallback-21", name: "Stepper Motor NEMA 17", category: "Actuator", total_count: 18, available_count: 12, image_url: "https://images.unsplash.com/photo-1563770660941-20978e870e26?auto=format&fit=crop&w=1200&q=80" },
  { id: "fallback-22", name: "L298N Motor Driver Module", category: "Motor Driver", total_count: 30, available_count: 22, image_url: "https://images.unsplash.com/photo-1581092160562-40aa08e78837?auto=format&fit=crop&w=1200&q=80" },
  { id: "fallback-23", name: "A4988 Stepper Driver", category: "Motor Driver", total_count: 22, available_count: 16, image_url: "https://images.unsplash.com/photo-1518770660439-4636190af475?auto=format&fit=crop&w=1200&q=80" },
  { id: "fallback-24", name: "Rechargeable Li-ion Battery Pack", category: "Power", total_count: 25, available_count: 17, image_url: "https://images.unsplash.com/photo-1603732551658-5fabbafa84eb?auto=format&fit=crop&w=1200&q=80" },
  { id: "fallback-25", name: "5V 2A Adapter", category: "Power", total_count: 38, available_count: 30, image_url: "https://images.unsplash.com/photo-1553406830-ef2513450d76?auto=format&fit=crop&w=1200&q=80" },
  { id: "fallback-26", name: "9V Battery", category: "Power", total_count: 60, available_count: 48, image_url: "https://images.unsplash.com/photo-1603732551658-5fabbafa84eb?auto=format&fit=crop&w=1200&q=80" },
  { id: "fallback-27", name: "USB to TTL Converter", category: "Tools", total_count: 20, available_count: 14, image_url: "https://images.unsplash.com/photo-1518770660439-4636190af475?auto=format&fit=crop&w=1200&q=80" },
  { id: "fallback-28", name: "Digital Multimeter", category: "Tools", total_count: 15, available_count: 11, image_url: "https://images.unsplash.com/photo-1581093458791-9f3c3900df4b?auto=format&fit=crop&w=1200&q=80" },
  { id: "fallback-29", name: "Soldering Iron Kit", category: "Tools", total_count: 14, available_count: 9, image_url: "https://images.unsplash.com/photo-1563770660941-20978e870e26?auto=format&fit=crop&w=1200&q=80" },
  { id: "fallback-30", name: "Wire Stripper and Cutter", category: "Tools", total_count: 20, available_count: 15, image_url: "https://images.unsplash.com/photo-1553406830-ef2513450d76?auto=format&fit=crop&w=1200&q=80" }
];