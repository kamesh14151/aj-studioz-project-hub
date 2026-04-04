import { createContext, useContext, useState, ReactNode } from "react";

export interface Idea {
  id: string;
  title: string;
  description: string;
  author: string;
  status: "Review" | "Approved" | "Invested";
  createdAt: string;
}

export interface InventoryItem {
  id: string;
  name: string;
  category: string;
  total: number;
  available: number;
  bookedBy: string[];
}

interface DataContextType {
  ideas: Idea[];
  addIdea: (idea: Omit<Idea, "id" | "status" | "createdAt">) => void;
  updateIdeaStatus: (id: string, status: Idea["status"]) => void;
  inventory: InventoryItem[];
  preBook: (itemId: string, studentName: string) => void;
}

const sampleIdeas: Idea[] = [
  { id: "1", title: "Smart Campus Navigation", description: "An AR-based indoor navigation system for the college campus using BLE beacons.", author: "Arjun M.", status: "Review", createdAt: "2026-03-28" },
  { id: "2", title: "AI Lab Assistant", description: "A voice-activated assistant that helps students in the electronics lab with component identification.", author: "Priya K.", status: "Approved", createdAt: "2026-03-25" },
  { id: "3", title: "Green Energy Monitor", description: "IoT dashboard for monitoring solar panel output and energy consumption across campus.", author: "Rahul S.", status: "Invested", createdAt: "2026-03-20" },
  { id: "4", title: "Automated Attendance", description: "Face-recognition based attendance system integrated with the college ERP.", author: "Sneha T.", status: "Review", createdAt: "2026-03-30" },
];

const sampleInventory: InventoryItem[] = [
  { id: "1", name: "Arduino Uno R3", category: "Microcontroller", total: 15, available: 8, bookedBy: [] },
  { id: "2", name: "Raspberry Pi 4B", category: "SBC", total: 10, available: 3, bookedBy: [] },
  { id: "3", name: "ESP32 DevKit", category: "IoT Module", total: 20, available: 14, bookedBy: [] },
  { id: "4", name: "Ultrasonic Sensor HC-SR04", category: "Sensor", total: 30, available: 22, bookedBy: [] },
  { id: "5", name: "16x2 LCD Display", category: "Display", total: 12, available: 0, bookedBy: [] },
  { id: "6", name: "Servo Motor SG90", category: "Actuator", total: 25, available: 18, bookedBy: [] },
  { id: "7", name: "Breadboard 830-point", category: "Prototyping", total: 40, available: 35, bookedBy: [] },
  { id: "8", name: "OLED Display 0.96\"", category: "Display", total: 8, available: 5, bookedBy: [] },
];

const DataContext = createContext<DataContextType>({
  ideas: [],
  addIdea: () => {},
  updateIdeaStatus: () => {},
  inventory: [],
  preBook: () => {},
});

export const useData = () => useContext(DataContext);

export const DataProvider = ({ children }: { children: ReactNode }) => {
  const [ideas, setIdeas] = useState<Idea[]>(sampleIdeas);
  const [inventory, setInventory] = useState<InventoryItem[]>(sampleInventory);

  const addIdea = (idea: Omit<Idea, "id" | "status" | "createdAt">) => {
    setIdeas((prev) => [
      {
        ...idea,
        id: Date.now().toString(),
        status: "Review",
        createdAt: new Date().toISOString().split("T")[0],
      },
      ...prev,
    ]);
  };

  const updateIdeaStatus = (id: string, status: Idea["status"]) => {
    setIdeas((prev) => prev.map((i) => (i.id === id ? { ...i, status } : i)));
  };

  const preBook = (itemId: string, studentName: string) => {
    setInventory((prev) =>
      prev.map((item) =>
        item.id === itemId && item.available > 0
          ? { ...item, available: item.available - 1, bookedBy: [...item.bookedBy, studentName] }
          : item
      )
    );
  };

  return (
    <DataContext.Provider value={{ ideas, addIdea, updateIdeaStatus, inventory, preBook }}>
      {children}
    </DataContext.Provider>
  );
};
