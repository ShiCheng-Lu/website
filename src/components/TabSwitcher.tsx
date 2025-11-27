import { useState } from "react";
import styles from "./TabSwitcher.module.css";
import { BsChevronDoubleLeft, BsChevronDoubleRight } from "react-icons/bs";

let instanceCounter = 0;

type TabProps = {
  tabOpen?: React.ReactNode;
  tabClose?: React.ReactNode;
  tab?: React.ReactNode;
  children?: React.ReactNode;
};

export function Tab({ children }: TabProps) {
  return <>{children}</>;
}

type TabSwitcherProps = {
  children: React.ReactElement<TabProps>[];
};

export function TabSwitcher({ children }: TabSwitcherProps) {
  const [open, setOpen] = useState(0);
  return (
    <div className={styles.TabSwitcher}>
      <div className={styles.TabSwitcherContainer}>
        {open ? children[open - 1] : undefined}
      </div>
      <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
        {children?.map((e, i) => (
          <div
            key={i}
            className={styles.TabSwitcherTab}
            style={{ borderLeft: i + 1 === open ? 0 : undefined }}
            onClick={() => (i + 1 === open ? setOpen(0) : setOpen(i + 1))}
          >
            {i + 1 === open
              ? e.props.tabOpen || e.props.tab || <BsChevronDoubleRight />
              : e.props.tabClose || e.props.tab || <BsChevronDoubleLeft />}
          </div>
        ))}
      </div>
    </div>
  );
}
