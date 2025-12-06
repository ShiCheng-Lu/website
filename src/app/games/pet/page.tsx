"use client";

import { useState } from "react";
import PetDrawer from "./PetDrawer";
import PetDisplay from "./PetDisplay";
import { PetData } from "./Pet";

export default function Pets() {
  const [pet, setPet] = useState([new PetData()]);

  return (
    <div>
      <PetDrawer setData={(pet) => setPet([pet])} />
      <PetDisplay pets={pet} />
    </div>
  );
}
