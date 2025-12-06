"use client";

import { useEffect, useState } from "react";
import PetDrawer from "./PetDrawer";
import PetDisplay, { PET_SIZE, RandomMove } from "./PetDisplay";
import Pet, { DEFAULT_PALETTE } from "./Pet";
import { PetData, PetOwnerData, pet_owners, pets } from "@/util/database";
import { user } from "@/util/firebase";
import { documentId, doc, limit, where, Timestamp } from "firebase/firestore";

export default function Pets() {
  const [pet, setPet] = useState({
    createdAt: Timestamp.now(),
    createdBy: "",
    palette: DEFAULT_PALETTE,
    shape:
      "AAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAA",
  });

  const [petOwner, setPetOwner] = useState<PetOwnerData>({
    lastClaimed: Timestamp.fromMillis(0),
    lastCreated: Timestamp.fromMillis(0),
    pets: [],
  });

  const [ownedPets, setPets] = useState<PetData[]>([]);

  const submitPet = () => {
    (async () => {
      await pets().create(
        {
          ...pet,
          createdAt: Timestamp.now(),
          createdBy: user.user.uid,
        },
        null
      );

      await pet_owners().update({
        ...petOwner,
        lastCreated: Timestamp.now(),
      });
    })();
  };

  const claimPet = () => {
    (async () => {
      if (!petOwner) return;
      const secondsSinceLastClaim =
        Timestamp.now().seconds - petOwner.lastClaimed.seconds;
      const petClaimCooldownSeconds = 12 * 60 * 60;
      if (secondsSinceLastClaim < petClaimCooldownSeconds) {
        console.log("Cannot claim another pet, on cool down");
        alert(
          `You can claim another pet in ${
            petClaimCooldownSeconds - secondsSinceLastClaim
          } seconds`
        );
        return;
      }

      const randId = "AAAAA";
      var randomPet = await pets().query(
        where(documentId(), ">=", randId),
        limit(1)
      );
      if (Object.entries(randomPet).length === 0) {
        console.log(`no pets with id higher than: ${randId}`);
        randomPet = await pets().query(
          where(documentId(), "<", randId),
          limit(1)
        );
      }
      if (Object.entries(randomPet).length === 0) {
        console.log("no pets???");
        return;
      }
      const claimedPet = Object.entries(randomPet)[0];

      if (petOwner.pets.every((pet) => pet.id === claimedPet[0])) {
        // already own this pet
        console.log(`Already owns pet ${claimedPet[0]}`);
        await pet_owners().update({
          ...petOwner,
          lastClaimed: Timestamp.now(),
        });
        return;
      }
      await pet_owners().update({
        ...petOwner,
        lastClaimed: Timestamp.now(),
        pets: [...(petOwner.pets ?? []), pets().ref(claimedPet[0])],
      });

      setPets([...ownedPets, claimedPet[1]]);
    })();
  };

  useEffect(() => {
    (async () => {
      const me = await pet_owners().read();

      if (me == null) {
        pet_owners().create(petOwner);
        return;
      }

      setPetOwner(me);

      const petIds = me.pets.flatMap((pet) => pet.id);
      if (petIds.length > 0) {
        const ownedPets = await pets().query(
          where(documentId(), "in", petIds),
          limit(petIds.length)
        );
        setPets(Object.entries(ownedPets).map((value) => value[1]));
      }

      console.log(Timestamp.now().seconds - me.lastClaimed.seconds > 12 * 60);
    })();
  }, []);

  return (
    <div>
      <PetDrawer setData={(pet) => setPet(pet)} />
      <div
        style={{
          width: 300,
          height: 300,
          border: "solid 1px",
        }}
      >
        <RandomMove>
          <Pet data={pet} style={{ width: PET_SIZE, height: PET_SIZE }} />
        </RandomMove>
      </div>
      <button onClick={submitPet}>Submit</button>
      <button onClick={claimPet}>Claim</button>
      <PetDisplay pets={ownedPets} />
    </div>
  );
}
