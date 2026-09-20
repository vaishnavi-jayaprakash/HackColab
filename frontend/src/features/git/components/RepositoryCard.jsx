import Card from "../../../components/ui/Card.jsx";
import Button from "../../../components/ui/Button.jsx";
import "./RepositoryCard.css";

export default function RepositoryCard({ repo, onSync, isSyncing }) {
  return (
    <Card className="repo-card">
      <div>
        <p className="repo-card-name">{repo.name}</p>
        {repo.url ? (
          <a className="repo-card-sync" href={repo.url} target="_blank" rel="noreferrer">
            {repo.url}
          </a>
        ) : null}
        <p className="repo-card-sync">Last synced {repo.lastSynced}</p>
      </div>
      <Button variant="secondary" size="sm" onClick={onSync} isLoading={isSyncing} disabled={!repo.id}>
        Sync
      </Button>
    </Card>
  );
}
