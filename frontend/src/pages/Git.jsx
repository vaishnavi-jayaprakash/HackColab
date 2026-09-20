import { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import PageLayout from "../components/layout/PageLayout.jsx";
import Card, { CardHeader } from "../components/ui/Card.jsx";
import Button from "../components/ui/Button.jsx";
import Input from "../components/ui/Input.jsx";
import Loading from "../components/common/Loading.jsx";
import ErrorState from "../components/common/ErrorState.jsx";
import EmptyState from "../components/common/EmptyState.jsx";
import RepositoryCard from "../features/git/components/RepositoryCard.jsx";
import CommitList from "../features/git/components/CommitList.jsx";
import ConflictAlert from "../features/git/components/ConflictAlert.jsx";
import {
  connectRepository,
  getConflictRadar,
  getPullRequests,
  getRepository,
  syncRepository,
} from "../services/git.api.js";
import "./Git.css";

export default function Git() {
  const { hackathonId } = useParams();
  const [repo, setRepo] = useState(null);
  const [pulls, setPulls] = useState([]);
  const [conflicts, setConflicts] = useState([]);
  const [status, setStatus] = useState("loading");
  const [isSyncing, setIsSyncing] = useState(false);
  const [connectUrl, setConnectUrl] = useState("");
  const [isConnecting, setIsConnecting] = useState(false);
  const [connectError, setConnectError] = useState("");

  const load = () => {
    setStatus("loading");
    Promise.all([getRepository(hackathonId), getPullRequests(hackathonId), getConflictRadar(hackathonId)])
      .then(([r, prs, cf]) => {
        setRepo(r);
        setPulls(prs);
        setConflicts(cf);
        setStatus("ready");
      })
      .catch((err) => {
        console.error(err);
        setStatus("error");
      });
  };

  useEffect(() => { load(); }, [hackathonId]);

  const handleSync = async () => {
    setIsSyncing(true);
    try {
      await syncRepository(hackathonId);
      load();
    } catch (err) {
      alert(err.message || "Sync failed");
    } finally {
      setIsSyncing(false);
    }
  };

  const handleConnect = async (e) => {
    e.preventDefault();
    if (!connectUrl.trim()) return;
    setIsConnecting(true);
    setConnectError("");
    try {
      await connectRepository(connectUrl.trim(), hackathonId);
      setConnectUrl("");
      load();
    } catch (err) {
      setConnectError(err.message || "Could not connect repository");
    } finally {
      setIsConnecting(false);
    }
  };

  const hasRepo = Boolean(repo?.id);

  return (
    <PageLayout
      navbarContent={
        <div>
          <h1 className="page-title">Repository — {repo?.name || "…"}</h1>
          <p className="page-subtitle">
            {hasRepo ? `Last synced ${repo.lastSynced}` : "Connect a GitHub repository to get started"}
          </p>
        </div>
      }
    >
      <div className="page">
        {status === "loading" && <Loading />}
        {status === "error" && <ErrorState onRetry={load} />}

        {status === "ready" && (
          <>
            {!hasRepo && (
              <Card>
                <CardHeader title="Connect GitHub repository" subtitle="Paste a public repository URL" />
                <form onSubmit={handleConnect} style={{ display: "flex", gap: 10, alignItems: "flex-end" }}>
                  <div style={{ flex: 1 }}>
                    <Input
                      label="Repository URL"
                      placeholder="https://github.com/owner/repo"
                      value={connectUrl}
                      onChange={(e) => setConnectUrl(e.target.value)}
                    />
                  </div>
                  <Button type="submit" isLoading={isConnecting} disabled={!connectUrl.trim()}>
                    Connect
                  </Button>
                </form>
                {connectError && <p style={{ color: "var(--danger)", marginTop: 10 }}>{connectError}</p>}
              </Card>
            )}

            {hasRepo && (
              <>
                <RepositoryCard repo={repo} onSync={handleSync} isSyncing={isSyncing} />

                <div className="git-stats">
                  <Card className="git-stat">
                    <p className="git-stat-value">{repo.branchCount}</p>
                    <p className="text-muted">Branches</p>
                  </Card>
                  <Card className="git-stat">
                    <p className="git-stat-value">{repo.openPRs}</p>
                    <p className="text-muted">Open PRs</p>
                  </Card>
                  <Card className="git-stat git-stat-danger">
                    <p className="git-stat-value">{repo.potentialConflicts}</p>
                    <p className="text-muted">Potential Conflicts</p>
                  </Card>
                </div>

                <div className="git-columns">
                  <Card>
                    <CardHeader title="Pull Requests" subtitle={`${pulls.length} recent`} />
                    {pulls.length === 0 ? (
                      <EmptyState title="No pull requests yet" message="Click Sync to fetch PRs from GitHub." />
                    ) : (
                      <CommitList commits={pulls} />
                    )}
                  </Card>

                  <Card>
                    <CardHeader title="Conflict Radar" subtitle={`${conflicts.length} potential overlaps`} />
                    {conflicts.length === 0 ? (
                      <EmptyState title="No overlaps detected" message="Sync branches to refresh conflict detection." />
                    ) : (
                      <div>
                        {conflicts.map((conflict) => (
                          <ConflictAlert key={conflict.id} conflict={conflict} />
                        ))}
                      </div>
                    )}
                  </Card>
                </div>
              </>
            )}
          </>
        )}
      </div>
    </PageLayout>
  );
}
