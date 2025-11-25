import { useCookies } from "react-cookie";
import styles from "./PrivacyPolicy.module.css";
import Link from "next/link";

export default function PrivacyPolicy() {
  const [_, setCookie] = useCookies(["acceptedPolicy"]);
  const expires = new Date();
  expires.setDate(expires.getDate() + 7); // expires in a week

  return (
    <div className={styles.PrivacyPolicy}>
      <div>
        <h2 style={{ marginBottom: 20 }}>We updated our privacy policy</h2>
        <p>
          From now on, your privacy is our privacy, and we definitely do very
          much so care about our privacy, as such, we require all your personal
          information to be kept with us in order for us to keep it private.
          Because if we keep it private, by extension you're also keeping it
          private, since your privacy is our privacy
        </p>
      </div>
      <div>
        <Link className={styles.PrivacyPolicyButton} href="/privacy">
          Privacy policy
        </Link>
        <a
          className={styles.PrivacyPolicyButton}
          onClick={() => setCookie("acceptedPolicy", true, { expires })}
        >
          Accept
        </a>
      </div>
    </div>
  );
}
