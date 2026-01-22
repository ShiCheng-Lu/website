import { useRef, useState } from "react";
import styles from "./PaymentPopup.module.css";
import { CgCloseO } from "react-icons/cg";
import { urlencode } from "@/util/util";

type PaymentType = "credit" | "paypal";

export type PaymentPopupProps = {
  onSubmit: () => void;
};

export default function PaymentPopup({ onSubmit }: PaymentPopupProps) {
  const [paymentType, setPaymentType] = useState<PaymentType>("credit");
  const paypalForm = useRef<HTMLFormElement>(null);
  return (
    <div className={styles.PaymentPopup}>
      <div className={styles.PaymentPopupBackground}></div>
      <div className={styles.PaymentPopupContent}>
        <div
          style={{
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
          }}
          onClick={onSubmit}
        >
          <h3>Checkout</h3>
          <CgCloseO className={styles.PaymentPopupCloseIcon} />
        </div>
        <div className={styles.PaymentPopupPrice}>
          <p>Total:</p>
          <p>2.99 USD</p>
        </div>
        <input type="email" placeholder="Email *" required />
        <div className={styles.PaymentPopupInlineInput}>
          <input placeholder="First name *" />
          <input placeholder="Last name *" />
        </div>
        <div className={styles.PaymentPopupInlineInput}>
          <button
            className={`${styles.PaymentPopupInlineInput} ${styles.PaymentPopupType}`}
            disabled={paymentType === "credit"}
            onClick={() => setPaymentType("credit")}
          >
            <img src="payment/visa.png" height={30} />
            <img src="payment/mastercard.png" height={30} />
          </button>
          <button
            className={`${styles.PaymentPopupInlineInput} ${styles.PaymentPopupType}`}
            disabled={paymentType === "paypal"}
            onClick={() => {
              if (paypalForm.current) {
                paypalForm.current.submit();
              }
            }}
          >
            <img src="payment/paypal.png" height={30} />
            {/* Hidden form used for paypal redirect, required because form submission ignores CORS */}
            <form
              action="https://www.paypal.com/cgi-bin/webscr"
              method="post"
              target="_top"
              ref={paypalForm}
            >
              <input type="hidden" name="cmd" value="_s-xclick" />
              <input
                type="hidden"
                name="hosted_button_id"
                value="QCUK45S3UNA38"
              />
              <input type="hidden" name="currency_code" value="USD" />
            </form>
          </button>
        </div>
        <input placeholder="Card number *" />
        <div className={styles.PaymentPopupInlineInput}>
          <input placeholder="Expiration date *" />
          <input placeholder="Security code *" />
        </div>
        <button className={styles.PaymentPopupSubmit} onClick={onSubmit}>
          <h2>Submit</h2>
        </button>
      </div>
    </div>
  );
}
