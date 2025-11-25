import { useState } from "react";

declare class Accelerometer {
  constructor(any: any);
  addEventListener(type: string, callback: (e: any) => void): any;
  start(): void;
}

export default function useAccelerometer() {
  const [x, setX] = useState<any[]>([]);

  
  return [x];
}
