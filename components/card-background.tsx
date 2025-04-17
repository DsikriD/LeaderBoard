"use client";

import { useEffect, useState } from "react";
import { useMediaQuery } from "@/hooks/use-media-query";

// Типы карт
type Card = {
  id: number;
  x: number;
  y: number;
  rotation: number;
  suit: "hearts" | "diamonds" | "clubs" | "spades";
  value: string;
  speed: number;
  rotationSpeed: number;
};

// Значения карт
const cardValues = ["A", "K", "Q", "J", "10", "9", "8", "7", "6"];
const suits = ["hearts", "diamonds", "clubs", "spades"];

export default function CardBackground() {
  const [cards, setCards] = useState<Card[]>([]);
  const isMobile = useMediaQuery("(max-width: 768px)");

  // Создаем карты при загрузке компонента
  useEffect(() => {
    const numberOfCards = isMobile ? 10 : 20;
    const newCards: Card[] = [];

    for (let i = 0; i < numberOfCards; i++) {
      newCards.push({
        id: i,
        x: Math.random() * 100, // позиция X в процентах
        y: Math.random() * 100, // позиция Y в процентах
        rotation: Math.random() * 360, // случайный поворот
        suit: suits[Math.floor(Math.random() * suits.length)] as any,
        value: cardValues[Math.floor(Math.random() * cardValues.length)],
        speed: 0.05 + Math.random() * 0.1, // скорость движения
        rotationSpeed: (Math.random() - 0.5) * 0.5, // скорость вращения
      });
    }

    setCards(newCards);
  }, [isMobile]);

  // Анимируем карты
  useEffect(() => {
    if (cards.length === 0) return;

    const interval = setInterval(() => {
      setCards((prevCards) =>
        prevCards.map((card) => {
          // Обновляем позицию Y (движение сверху вниз)
          let newY = card.y + card.speed;
          // Если карта вышла за пределы экрана, возвращаем ее наверх
          if (newY > 100) {
            newY = -10;
            // Обновляем X при перезапуске
            return {
              ...card,
              y: newY,
              x: Math.random() * 100,
              rotation: Math.random() * 360,
            };
          }

          // Обновляем вращение
          let newRotation = card.rotation + card.rotationSpeed;
          if (newRotation > 360) newRotation -= 360;
          if (newRotation < 0) newRotation += 360;

          return {
            ...card,
            y: newY,
            rotation: newRotation,
          };
        })
      );
    }, 50); // Обновляем каждые 50мс

    return () => clearInterval(interval);
  }, [cards]);

  // Функция для отображения символа масти
  const getSuitSymbol = (suit: string) => {
    switch (suit) {
      case "hearts":
        return "♥";
      case "diamonds":
        return "♦";
      case "clubs":
        return "♣";
      case "spades":
        return "♠";
      default:
        return "";
    }
  };

  // Функция для определения цвета масти
  const getSuitColor = (suit: string) => {
    return suit === "hearts" || suit === "diamonds"
      ? "text-red-600"
      : "text-black";
  };

  return (
    <div className="fixed inset-0 w-full h-full overflow-hidden pointer-events-none">
      {cards.map((card) => (
        <div
          key={card.id}
          className="absolute bg-white rounded-lg shadow-lg"
          style={{
            left: `${card.x}%`,
            top: `${card.y}%`,
            transform: `rotate(${card.rotation}deg)`,
            width: isMobile ? "40px" : "60px",
            height: isMobile ? "56px" : "84px",
            transition: "transform 0.5s ease",
          }}
        >
          <div className="relative w-full h-full border border-gray-300 rounded-lg bg-white p-1">
            <div
              className={`absolute top-1 left-1 text-sm md:text-base font-bold ${getSuitColor(
                card.suit
              )}`}
            >
              {card.value}
            </div>
            <div
              className={`absolute bottom-1 right-1 text-sm md:text-base font-bold ${getSuitColor(
                card.suit
              )} rotate-180`}
            >
              {card.value}
            </div>
            <div
              className={`absolute inset-0 flex items-center justify-center text-xl md:text-3xl ${getSuitColor(
                card.suit
              )}`}
            >
              {getSuitSymbol(card.suit)}
            </div>
          </div>
        </div>
      ))}
    </div>
  );
}
