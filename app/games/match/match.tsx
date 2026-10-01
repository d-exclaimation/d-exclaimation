"use client";

//
//  match.tsx
//  d-exclaimation
//
//  Created by d-exclaimation on 29 May 2023
//

import { type Union } from "@d-exclaimation/common/union";
import { useEffect, useReducer, useRef } from "react";
import FlippableCard from "./card";

type Card = {
  value: string;
  flipped: boolean;
  active: boolean;
};

type MatchState = {
  cards: Card[];
};

type MatchAction = Union<{
  flip: { index: number };
  match: {};
  init: { cards: Card[] };
}>;

function matchReducer(cards: Card[], action: MatchAction): Card[] {
  if (action.kind === "init") {
    return action.cards;
  }
  if (action.kind === "match") {
    const selected = cards.filter((card) => card.active);
    if (selected.length < 2) {
      return cards;
    }
    const matched = selected.every((card) => card.value === selected[0].value);
    if (matched) {
      return cards.map((card) => {
        if (card.active) {
          return { ...card, active: false };
        }
        return card;
      });
    }
    return cards.map((card) => {
      if (card.active) {
        return { ...card, flipped: false, active: false };
      }
      return card;
    });
  }
  const selected = cards.filter((card) => card.active).length;
  if (selected >= 2) {
    return cards;
  }
  return cards.map((card, i) => {
    if (i === action.index && !card.flipped) {
      return { ...card, flipped: true, active: true };
    }
    return card;
  });
}

function shuffle() {
  const current = [
    { value: "⚽", flipped: false, active: false },
    { value: "🎾", flipped: false, active: false },
    { value: "🏀", flipped: false, active: false },
    { value: "🏈", flipped: false, active: false },
    { value: "⚽", flipped: false, active: false },
    { value: "🎾", flipped: false, active: false },
    { value: "🏀", flipped: false, active: false },
    { value: "🏈", flipped: false, active: false },
    { value: "🎳", flipped: false, active: false },
    { value: "🏓", flipped: false, active: false },
    { value: "🏓", flipped: false, active: false },
    { value: "🎳", flipped: false, active: false },
    { value: "🥏", flipped: false, active: false },
    { value: "🥋", flipped: false, active: false },
    { value: "🥋", flipped: false, active: false },
    { value: "🥏", flipped: false, active: false },
  ];
  for (let i = current.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [current[i], current[j]] = [current[j], current[i]]; // Swap elements
  }
  return current;
}

function Match() {
  const timeoutRef = useRef<number | NodeJS.Timeout | null>(null);
  const [cards, dispatch] = useReducer(matchReducer, []);
  useEffect(() => {
    dispatch({ kind: "init", cards: shuffle() });
  }, []);
  return (
    <div className="w-full max-w-xl flex items-center justify-center">
      <div className="grid grid-cols-4 gap-3 place-items-center">
        {cards.map((props, i) => (
          <FlippableCard
            key={i}
            className="w-16 h-16 md:w-32 md:h-32 perspective-normal group"
            onClick={() => {
              if (props.flipped) return;
              dispatch({ kind: "flip", index: i });

              const actives = cards.filter((card) => card.active);
              if (actives.length !== 1) {
                return;
              }
              if (timeoutRef.current) {
                clearTimeout(timeoutRef.current);
              }
              timeoutRef.current = setTimeout(() => {
                dispatch({ kind: "match" });
              }, 750);
            }}
            {...props}
          />
        ))}
      </div>
    </div>
  );
}

export default Match;
