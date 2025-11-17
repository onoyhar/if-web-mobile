import { ReactNode } from "react";

export function Card({ children }: { children: ReactNode }) {
  return <div className="card-soft">{children}</div>;
}

export default Card;
