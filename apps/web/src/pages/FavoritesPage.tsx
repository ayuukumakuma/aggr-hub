import { EntryList } from "../components/entry/EntryList.js";
import { useFeeds } from "../hooks/useFeeds.js";

export function FavoritesPage() {
  const { data: feeds } = useFeeds();

  return (
    <div className="max-w-3xl mx-auto">
      <div className="flex items-center justify-between mb-8">
        <h1 className="text-4xl font-bold tracking-[-0.02em] font-display text-primary">
          Favorites
        </h1>
      </div>

      <EntryList isFavorite="true" feeds={feeds} hideReadState />
    </div>
  );
}
