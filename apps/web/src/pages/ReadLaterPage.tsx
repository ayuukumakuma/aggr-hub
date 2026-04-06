import { EntryList } from "../components/entry/EntryList.js";
import { useFeeds } from "../hooks/useFeeds.js";

export function ReadLaterPage() {
  const { data: feeds } = useFeeds();

  return (
    <div className="max-w-3xl mx-auto">
      <div className="flex items-center justify-between mb-8">
        <h1 className="text-4xl font-bold tracking-[-0.02em] font-display text-primary">
          Read Later
        </h1>
      </div>

      <EntryList isReadLater="true" feeds={feeds} hideReadState />
    </div>
  );
}
