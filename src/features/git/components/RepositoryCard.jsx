import Card from "../../../components/ui/Card.jsx";
import Button from "../../../components/ui/Button.jsx";
import "./RepositoryCard.css";

export default function RepositoryCard({ repo, onSync, isSyncing }) {
  return (
    <Card className="repo-card">
      <div>
        <p className="repo-card-name">{repo.name}</p>
        <p className="repo-card-sync">Last synced {repo.lastSynced}</p>
      </div>
      <Button variant="secondary" size="sm" onClick={onSync} isLoading={isSyncing}>
        Sync
      </Button>
    </Card>
  );
}
