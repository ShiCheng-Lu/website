import { useState } from "react";
import styles from "./MobileTab.module.css";

let instanceCounter = 0;

export default function MobileTab({ children }: { children: any }) {
  const mobile = false;

  const [open, setOpen] = useState();
  const [instance] = useState(() => ++instanceCounter);

  return (
    <div className={styles.MobileTabOpener} style={{ top: instance * 20 }}>
      {open && <div className={styles.MobileTabContainer}>{children}</div>}
    </div>
  );
}
