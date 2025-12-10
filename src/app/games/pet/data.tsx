import { PetOwnerData } from "@/util/database";

export function usePetData() {
  const owner = {};
  const pets = {};

  const updateOwner = (data: PetOwnerData) => {};

  return [owner, pets, updateOwner];
}
