import { useRouter } from "next/navigation";
import { BsChevronLeft } from "react-icons/bs";

export default function BackButton() {
  const router = useRouter();
  return (
    <BsChevronLeft
      style={{
        position: "fixed",
        top: 0,
        left: 0,
        padding: "1rem",
        width: "auto",
        height: "auto",
        zIndex: 1000,
      }}
      onClick={router.back}
    />
  );
}
