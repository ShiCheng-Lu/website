import Link from "next/link";
import { useRouter } from "next/navigation";
import { BsChevronLeft } from "react-icons/bs";

type BackButtonProp = {
    link?: string;
}
export default function BackButton({ link }: BackButtonProp) {
  const router = useRouter();
  return (
    <Link href={link ?? ""}>
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
        onClick={() => {
            if (link === undefined) {
                router.back();
            }
        }}
        />
    </Link>
  );
}
