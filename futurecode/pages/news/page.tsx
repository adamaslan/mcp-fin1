import { NewsFeed } from "@/components/news/NewsFeed";
import { SectorRotation } from "@/components/analysis/SectorRotation";

export default function NewsPage() {
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold mb-2">Market News</h1>
        <p className="text-muted-foreground">
          Stay informed with the latest market news and sector analysis.
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2">
          <NewsFeed limit={15} />
        </div>
        <div>
          <SectorRotation />
        </div>
      </div>
    </div>
  );
}
