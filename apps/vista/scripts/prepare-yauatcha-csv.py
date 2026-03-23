#!/usr/bin/env python3
import re
import pandas as pd

SRC = "data/Yauatcha Mumbai April Guest data.xls"
OUT = "data/Yauatcha Mumbai April Guest data - cleaned.csv"


def main() -> None:
    df = pd.read_excel(SRC, header=None, dtype=str)

    rows: list[tuple[str, str]] = []
    for i in range(len(df)):
        name = str(df.iloc[i, 9]) if pd.notna(df.iloc[i, 9]) else ""
        phone = str(df.iloc[i, 12]) if pd.notna(df.iloc[i, 12]) else ""

        name = name.strip()
        phone = phone.strip()

        if not name or not phone:
            continue
        if name.lower() in {"name"}:
            continue
        if "reservation" in name.lower() or "guest list report" in name.lower():
            continue

        digits = re.sub(r"\D", "", phone)
        if len(digits) < 8:
            continue

        rows.append((name, phone))

    dedup: list[tuple[str, str]] = []
    seen: set[str] = set()

    # Deduplicate by phone digits so the same recipient is not messaged twice.
    for name, phone in rows:
        key = re.sub(r"\D", "", phone)
        if key in seen:
            continue
        seen.add(key)
        dedup.append((name, phone))

    out_df = pd.DataFrame(dedup, columns=["Name:", "Contact:"])
    out_df.to_csv(OUT, index=False)

    print(f"total extracted rows: {len(rows)}")
    print(f"unique rows: {len(dedup)}")
    print(f"output: {OUT}")


if __name__ == "__main__":
    main()
