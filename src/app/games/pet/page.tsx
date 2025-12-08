"use client";

import { useEffect, useState } from "react";
import PetDrawer from "./PetDrawer";
import PetDisplay, { PET_SIZE, RandomMove } from "./PetDisplay";
import Pet, { DEFAULT_PALETTE } from "./Pet";
import { PetData, PetOwnerData, pet_owners, pets } from "@/util/database";
import { user } from "@/util/firebase";
import {
  documentId,
  doc,
  limit,
  where,
  Timestamp,
  and,
} from "firebase/firestore";
import BackButton from "@/components/BackButton";

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

  const submit = () => {
    (async () => {
      if (!petOwner) return;
      const secondsSinceLastCreation =
        Timestamp.now().seconds - petOwner.lastCreated.seconds;
      const creationCooldownSeconds = 12 * 60 * 60;
      if (secondsSinceLastCreation < creationCooldownSeconds) {
        console.log("Cannot create another pet, on cool down");
        alert(
          `You can create another pet in ${
            creationCooldownSeconds - secondsSinceLastCreation
          } seconds`
        );
        return;
      }

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

      const randId = doc(pets().collection).id;
      const petIds = petOwner.pets.flatMap((pet) => pet.id);
      const q = petIds.length > 0 ? and(
        where(documentId(), ">=", randId),
        where(documentId(), "not-in", petIds)
      ) : where(documentId(), ">=", randId);
      var randomPet = await pets().query(
        q,
        limit(1)
      );
      if (Object.entries(randomPet).length === 0) {
        console.log(`no pets with id higher than: ${randId}`);
        const q = petIds.length > 0 ? and(
          where(documentId(), "<", randId),
          where(documentId(), "not-in", petIds)
        ) : where(documentId(), "<", randId);
        randomPet = await pets().query(
          q,
          limit(1)
        );
      }
      if (Object.entries(randomPet).length === 0) {
        alert("No more pets available");
        return;
      }
      const claimedPet = Object.entries(randomPet)[0];
      await pet_owners().update({
        ...petOwner,
        lastClaimed: Timestamp.now(),
        pets: [...(petOwner.pets ?? []), pets().ref(claimedPet[0])],
      });

      setPets([...ownedPets, claimedPet[1]]);
      alert(`You claimed a pet ${claimedPet[0]}, I think`);
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
    <div
      style={{
        display: "flex",
        flexDirection: "column",
        justifyContent: "center",
        alignItems: "center",
      }}
    >
      <BackButton />
      <h1>Check out these cuties!</h1>
      <p>You can draw 1 pet per day, and claim 1 random pet per day.</p>
      <div
        style={{
          height: "fit-content",
          display: "flex",
          flexDirection: "row",
          justifyContent: "center",
          padding: "2rem",
          gap: "2rem",
        }}
      >
        <div style={{ width: "fit-content" }}>
          <PetDrawer setData={(pet) => setPet(pet)} submit={submit} />
        </div>
        <div
          style={{
            height: "auto",
            width: 300,
            border: "solid 1px",
            display: "flex",
            flexDirection: "column",
          }}
        >
          <p>Preview:</p>
          <div
            style={{
              height: "auto",
              width: "auto",
              position: "relative",
              flex: 1,
            }}
          >
            <RandomMove>
              <Pet data={pet} style={{ width: PET_SIZE, height: PET_SIZE }} />
            </RandomMove>
          </div>
        </div>
      </div>
      <button
        style={{
          width: 200,
          height: 100,
        }}
        onClick={claimPet}
      >
        Claim a random pet!
      </button>
      <PetDisplay pets={ownedPets} />
    </div>
  );
}
