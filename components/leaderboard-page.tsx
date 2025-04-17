"use client";

import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Crown, Plus, Trophy, Award } from "lucide-react";
import CardBackground from "./card-background";
import { createClient } from "@supabase/supabase-js";

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
);

type Player = {
  id: string;
  name: string;
  nickname: string;
  wins: number;
};

export default function LeaderboardPage() {
  const [players, setPlayers] = useState<Player[]>([]);
  const [newPlayerName, setNewPlayerName] = useState("");
  const [newPlayerNickname, setNewPlayerNickname] = useState("");
  const [selectedPlayerId, setSelectedPlayerId] = useState("");
  const [winsToAdd, setWinsToAdd] = useState(1);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchPlayers = async () => {
      const { data, error } = await supabase.from("players").select("*");
      if (error) {
        console.error("Ошибка при получении игроков:", error);
      } else if (data) {
        setPlayers(data);
      }
      setLoading(false);
    };
    fetchPlayers();
  }, []);

  const addNewPlayer = async () => {
    if (newPlayerName.trim()) {
      const { data, error } = await supabase
        .from("players")
        .insert([
          {
            name: newPlayerName.trim(),
            nickname: newPlayerNickname.trim() || `Игрок ${players.length + 1}`,
            wins: 0,
          },
        ])
        .select();

      if (error) {
        console.error("Ошибка при добавлении игрока:", error);
      } else if (data) {
        setPlayers([...players, ...data]);
        setNewPlayerName("");
        setNewPlayerNickname("");
      }
    }
  };

  const addWins = async () => {
    if (selectedPlayerId && winsToAdd > 0) {
      const player = players.find((p) => p.id === selectedPlayerId);
      if (!player) return;
      const newWins = player.wins + winsToAdd;

      const { error } = await supabase
        .from("players")
        .update({ wins: newWins })
        .eq("id", selectedPlayerId);

      if (error) {
        console.error("Ошибка при обновлении побед:", error);
      } else {
        setPlayers(
          players.map((p) =>
            p.id === selectedPlayerId ? { ...p, wins: newWins } : p
          )
        );
        setSelectedPlayerId("");
        setWinsToAdd(1);
      }
    }
  };

  const sortedPlayers = [...players].sort((a, b) => b.wins - a.wins);

  return (
    <div className="relative min-h-screen bg-gradient-to-b from-red-900/20 to-black/40 overflow-hidden">
      <CardBackground />
      <div className="container mx-auto px-4 py-8 relative z-10">
        <div className="text-center mb-8">
          <h1 className="text-4xl md:text-5xl font-bold text-white drop-shadow-lg mb-2">
            Рейтинг игроков в "Дурака"
          </h1>
          <p className="text-white/80 text-lg">
            За каждую победу начисляется 3 очка
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
          <Card className="col-span-1 md:col-span-2 bg-white/95 backdrop-blur">
            <CardHeader className="pb-2">
              <CardTitle className="flex items-center justify-between">
                <span>Таблица лидеров</span>
                <Trophy className="h-6 w-6 text-yellow-500" />
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead>
                    <tr className="border-b">
                      <th className="text-left py-3 px-2">Место</th>
                      <th className="text-left py-3 px-2">Игрок</th>
                      <th className="text-left py-3 px-2">Прозвище</th>
                      <th className="text-center py-3 px-2">Победы</th>
                      <th className="text-center py-3 px-2">Очки</th>
                    </tr>
                  </thead>
                  <tbody>
                    {!loading &&
                      sortedPlayers.map((player, index) => (
                        <tr
                          key={player.id}
                          className={`border-b ${
                            index === 0 ? "bg-yellow-100" : ""
                          }`}
                        >
                          <td className="py-3 px-2 font-medium">
                            {index === 0 ? (
                              <div className="flex items-center">
                                <Crown className="h-5 w-5 text-yellow-500 mr-1" />
                                <span>Топ-1</span>
                              </div>
                            ) : (
                              `${index + 1}`
                            )}
                          </td>
                          <td className="py-3 px-2 font-medium">
                            {player.name}
                          </td>
                          <td className="py-3 px-2 italic text-gray-700">
                            {player.nickname}
                          </td>
                          <td className="py-3 px-2 text-center">
                            {player.wins}
                          </td>
                          <td className="py-3 px-2 text-center font-bold">
                            {player.wins * 3}
                          </td>
                        </tr>
                      ))}
                  </tbody>
                </table>
              </div>
            </CardContent>
          </Card>

          <div className="space-y-6">
            <Card className="bg-white/95 backdrop-blur">
              <CardHeader className="pb-2">
                <CardTitle className="flex items-center justify-between">
                  <span>Новый игрок</span>
                  <Plus className="h-5 w-5" />
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <Label>Имя</Label>
                  <Input
                    value={newPlayerName}
                    onChange={(e) => setNewPlayerName(e.target.value)}
                  />
                  <Label>Прозвище</Label>
                  <Input
                    value={newPlayerNickname}
                    onChange={(e) => setNewPlayerNickname(e.target.value)}
                  />
                  <Button
                    onClick={addNewPlayer}
                    className="w-full bg-red-700 hover:bg-red-800"
                  >
                    Добавить игрока
                  </Button>
                </div>
              </CardContent>
            </Card>

            <Card className="bg-white/95 backdrop-blur">
              <CardHeader className="pb-2">
                <CardTitle className="flex items-center justify-between">
                  <span>Добавить победы</span>
                  <Award className="h-5 w-5" />
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <Label>Игрок</Label>
                  <select
                    value={selectedPlayerId}
                    onChange={(e) => setSelectedPlayerId(e.target.value)}
                    className="w-full p-2 border rounded-md"
                  >
                    <option value="">Выберите игрока</option>
                    {players.map((player) => (
                      <option key={player.id} value={player.id}>
                        {player.name}
                      </option>
                    ))}
                  </select>
                  <Label>Количество побед</Label>
                  <Input
                    type="number"
                    min="1"
                    value={winsToAdd}
                    onChange={(e) =>
                      setWinsToAdd(Number.parseInt(e.target.value) || 0)
                    }
                  />
                  <Button
                    onClick={addWins}
                    className="w-full bg-red-700 hover:bg-red-800"
                    disabled={!selectedPlayerId}
                  >
                    Добавить победы
                  </Button>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </div>
  );
}
